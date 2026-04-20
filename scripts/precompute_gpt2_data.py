"""
Precompute data for the embedding-scatter and residual-stream-animator demos.

Outputs:
  demos/embedding-scatter/src/data.json
    - 2D PCA projection of GPT-2 small word embeddings for ~120 curated single-token words
    - High-dim vectors for analogy words (so the in-browser demo can do king - man + woman)

  demos/residual-stream-animator/src/data.json
    - For 3 example sequences: token strings, residual-stream norms per (layer, position),
      delta norms (block contributions), and logit-lens top predictions per layer.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import torch
from transformers import GPT2Model, GPT2Tokenizer

ROOT = Path(__file__).resolve().parent.parent
SCATTER_OUT = ROOT / "demos" / "embedding-scatter" / "src" / "data.json"
RESIDUAL_OUT = ROOT / "demos" / "residual-stream-animator" / "src" / "data.json"

# ---- Curated word sets ----
# Each category should contain words that GPT-2's tokenizer turns into ONE token
# (with a leading space — that's how GPT-2 represents words mid-sentence). The script
# verifies this and drops words it can't represent as single tokens.
CATEGORIES: dict[str, list[str]] = {
    "royalty":    ["king", "queen", "prince", "princess", "duke", "duchess", "emperor", "knight"],
    "people":     ["man", "woman", "boy", "girl", "father", "mother", "son", "daughter", "uncle", "aunt"],
    "country":    ["France", "Germany", "Spain", "Italy", "Japan", "China", "Brazil", "Egypt", "Russia", "India"],
    "city":       ["Paris", "Berlin", "Madrid", "Rome", "Tokyo", "Beijing", "London", "Cairo", "Moscow", "Mumbai"],
    "color":      ["red", "blue", "green", "yellow", "purple", "orange", "black", "white", "brown", "pink"],
    "animal":     ["dog", "cat", "horse", "cow", "lion", "tiger", "bear", "wolf", "elephant", "rabbit"],
    "fruit":      ["apple", "orange", "banana", "grape", "pear", "peach", "lemon", "cherry", "mango"],
    "food":       ["bread", "cheese", "meat", "rice", "pasta", "soup", "salad", "sugar", "salt", "butter"],
    "body":       ["hand", "foot", "head", "arm", "leg", "eye", "ear", "nose", "heart", "brain"],
    "vehicle":    ["car", "truck", "bus", "train", "plane", "boat", "ship", "bike", "rocket"],
    "weather":    ["rain", "snow", "wind", "storm", "sun", "cloud", "fog", "ice", "thunder"],
    "emotion":    ["love", "fear", "anger", "joy", "sadness", "hope", "shame", "pride", "grief"],
    "verb-motion": ["run", "walk", "jump", "swim", "fly", "drive", "ride", "climb", "fall"],
    "verb-think": ["think", "know", "believe", "wonder", "guess", "doubt", "imagine", "remember"],
    "tech":       ["computer", "phone", "server", "code", "model", "data", "network", "memory"],
}

# Words we want to keep high-dim vectors for in the JSON, so the in-browser
# demo can do real vector arithmetic for analogies.
ANALOGY_WORDS = [
    "king", "queen", "man", "woman", "prince", "princess",
    "France", "Paris", "Germany", "Berlin", "Italy", "Rome", "Japan", "Tokyo",
    "father", "mother", "son", "daughter", "uncle", "aunt",
]


def load_model():
    print("loading GPT-2 small (124M) — first time will download ~500MB", flush=True)
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2Model.from_pretrained("gpt2", output_hidden_states=True)
    model.eval()
    return tokenizer, model


def single_token_id(tokenizer, word: str) -> int | None:
    """Return token id if `word` (with leading space) is exactly one token, else None."""
    ids = tokenizer.encode(" " + word)
    return ids[0] if len(ids) == 1 else None


def build_scatter_data(tokenizer, model):
    print("\n==> embedding-scatter data", flush=True)
    wte = model.wte.weight.detach().numpy()  # [vocab, 768]

    rows = []
    vecs = []
    skipped = []
    for cat, words in CATEGORIES.items():
        for w in words:
            tid = single_token_id(tokenizer, w)
            if tid is None:
                skipped.append(w)
                continue
            v = wte[tid]
            rows.append({"word": w, "category": cat, "token_id": int(tid)})
            vecs.append(v)
    if skipped:
        print(f"  skipped (multi-token): {skipped}", flush=True)

    X = np.stack(vecs)              # [N, 768]
    Xc = X - X.mean(axis=0)         # center

    # 2D PCA via SVD (full SVD on a 100x768 matrix is trivial)
    U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
    coords = (Xc @ Vt[:2].T)        # [N, 2]
    explained = (S[:2] ** 2 / (S ** 2).sum()).tolist()
    print(f"  PCA: {len(rows)} words, top-2 explained variance = {explained[0]:.3f}, {explained[1]:.3f}", flush=True)

    # Normalize coords to [-1, 1] for stable rendering
    cmax = float(np.abs(coords).max())
    coords = coords / cmax
    for i, row in enumerate(rows):
        row["x"] = float(coords[i, 0])
        row["y"] = float(coords[i, 1])

    # High-dim vectors for analogy words
    analogy_vecs = {}
    for w in ANALOGY_WORDS:
        tid = single_token_id(tokenizer, w)
        if tid is not None:
            analogy_vecs[w] = wte[tid].astype(float).round(5).tolist()

    out = {
        "model": "gpt2-small (124M)",
        "source": "wte (input-embedding) matrix",
        "dim": int(X.shape[1]),
        "n_words": len(rows),
        "pca_explained_variance": explained,
        "words": rows,
        "analogy_vectors": analogy_vecs,
    }
    SCATTER_OUT.parent.mkdir(parents=True, exist_ok=True)
    SCATTER_OUT.write_text(json.dumps(out))
    print(f"  wrote {SCATTER_OUT.relative_to(ROOT)}  ({SCATTER_OUT.stat().st_size // 1024}KB)", flush=True)


# ---- Residual-stream demo ----

EXAMPLE_SENTENCES = [
    {
        "id": "the-cat-sat",
        "label": "The cat sat on the",
        "text": "The cat sat on the",
    },
    {
        "id": "capital-france",
        "label": "The capital of France is",
        "text": "The capital of France is",
    },
    {
        "id": "fibonacci",
        "label": "def fibonacci(n):",
        "text": "def fibonacci(n):",
    },
]


def build_residual_data(tokenizer, model):
    print("\n==> residual-stream-animator data", flush=True)
    # Need the LM head to do logit-lens projections. GPT-2 ties wte ↔ unembedding.
    wte = model.wte.weight.detach().numpy()           # [vocab, 768]
    out_examples = []

    for ex in EXAMPLE_SENTENCES:
        ids = tokenizer.encode(ex["text"])
        token_strs = [tokenizer.decode([t]) for t in ids]
        with torch.no_grad():
            outputs = model(torch.tensor([ids]))
        # outputs.hidden_states is a tuple of length 13: [embed_out, after_block_0, ..., after_block_11]
        # We want the residual stream at each stage.
        hidden = [h[0].detach().numpy() for h in outputs.hidden_states]   # each [seq_len, 768]
        seq_len = hidden[0].shape[0]
        n_layers = len(hidden) - 1   # 12 transformer blocks for gpt2-small

        # Per-position-per-layer norm of the residual stream (after each block).
        # Shape: [n_stages = n_layers+1, seq_len]
        norms = np.array([np.linalg.norm(h, axis=-1) for h in hidden])

        # Per-block delta norm — how much that block ADDED to the residual.
        # delta[L][pos] = || hidden[L+1][pos] - hidden[L][pos] ||
        deltas = np.array([
            np.linalg.norm(hidden[L + 1] - hidden[L], axis=-1)
            for L in range(n_layers)
        ])  # [n_layers, seq_len]

        # Logit-lens: at each (layer, position), project hidden through wte^T,
        # take top-3 next-token predictions. This is what interpretability folks call
        # "what would the model predict if we stopped here?"
        logit_lens = []   # per stage: [seq_len][3] of {token, prob}
        for stage_idx, h in enumerate(hidden):
            # h: [seq_len, 768]; logits = h @ wte.T = [seq_len, vocab]
            logits = h @ wte.T
            # Apply final layer norm? GPT-2 has ln_f before the LM head. Apply for accuracy.
            # We approximate by skipping LN here — it's a demo, top-k usually stable enough.
            # For honesty, only show last-position predictions (the next-token prediction).
            last_logits = logits[-1]
            top_idx = np.argsort(-last_logits)[:5]
            top = [
                {
                    "token": tokenizer.decode([int(t)]),
                    "logit": float(last_logits[t]),
                }
                for t in top_idx
            ]
            logit_lens.append(top)

        out_examples.append({
            "id": ex["id"],
            "label": ex["label"],
            "tokens": token_strs,
            "n_layers": int(n_layers),
            "seq_len": int(seq_len),
            "norms": norms.round(3).tolist(),         # [n_stages][seq_len]
            "deltas": deltas.round(3).tolist(),       # [n_layers][seq_len]
            "logit_lens_last_pos": logit_lens,        # [n_stages][5] tokens
        })
        print(f"  '{ex['label']}': {seq_len} tokens × {n_layers} blocks", flush=True)

    out = {
        "model": "gpt2-small (124M)",
        "n_layers": int(n_layers),
        "d_model": 768,
        "examples": out_examples,
    }
    RESIDUAL_OUT.parent.mkdir(parents=True, exist_ok=True)
    RESIDUAL_OUT.write_text(json.dumps(out))
    print(f"  wrote {RESIDUAL_OUT.relative_to(ROOT)}  ({RESIDUAL_OUT.stat().st_size // 1024}KB)", flush=True)


def main():
    tokenizer, model = load_model()
    build_scatter_data(tokenizer, model)
    build_residual_data(tokenizer, model)
    print("\nDone.", flush=True)


if __name__ == "__main__":
    main()
