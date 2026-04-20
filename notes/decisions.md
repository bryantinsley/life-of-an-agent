# Decisions Log

Running record of decisions made during production. New entries at the bottom. Each entry: date, decision, why, how it shapes downstream work. Pre-production decisions (course structure, cadence, safety scope, fact-check format, etc.) live in the master outline's §2 / §3 / §10 / §11 decision logs — those aren't duplicated here.

---

## 2026-04-20 — S1 production: visual identity + brand system

### D1. Visual direction: purple-forward editorial, Geist sans, no serifs

- **Reference anchor:** pitchdeck-powerpoint-presentation-template-851-1.jpg (designshack.net) — deep medium-violet as the environment, white slides as the content surface, electric cobalt as the emphasis accent, geometric sans throughout, generous whitespace on white, bold-but-restrained purple moments.
- **Typeface:** Geist (variable) for sans, Geist Mono for mono. Geometric, modern, no serifs — per Bryan's explicit "no serifs" instruction.
- **Palette (tokens in `shared/brand/src/tokens.css`):**
  - Violet 500 (`#6b5dd3`) — brand anchor / environment
  - Violet 600 (`#5a4bcf`) — deeper environment shade
  - Cobalt 600 (`#2a4bff`) — electric accent for emphasis, rules, interactive states
  - Paper (`#faf9f6`) — warm off-white slide surface
  - Ink (`#1a1530`) — near-black with violet undertone
- **Usage rule:** violet is *loud, contained* — heroes, section openers, chrome bars. White paper surface carries most content. Cobalt is the emphasis accent, not the background.
- **Why:** Bryan described the deck as "presenting to 10,000 strangers" (stilted, impersonal) in the prior state. The audience is 12 people he knows well, and the visual register needs to feel confident and contemporary, not corporate-generic. The designshack reference was his chosen sensibility.

### D2. Brand system: single source of truth at `shared/brand/`

- `shared/brand/` is a pnpm workspace package (`@life-of-an-agent/brand`) consumed by the deck, every demo, and the web landing page. Exports: `tokens.css`, `fonts.css`, `reset.css`, `brand.css`, `BrandMark.vue`.
- Fonts are bundled via `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` — *not* Google Fonts CDN. GitHub Pages deployment must work without external font requests.
- All CSS tokens are prefixed `--loa-*` (Life of an Agent). Inline slide styles and demo CSS consume those tokens — no hard-coded hex outside `tokens.css`.
- Shared brand classes: `.loa-scope` (root wrapper), `.loa-brandmark` (logo placeholder — Bryan is planning a real logo), `.loa-surface-env` (dark variant for data-viz canvases on violet chrome).
- **Why:** demos need to feel connected to the deck — "Life of an Agent is a brand and that's what they're connecting with" (Bryan). One source of truth prevents drift as more demos are added across S2–S10.

### D3. Do not use `/brand/brand.css` at repo root

- `/brand/brand.css` was written mid-session as a single-file, CDN-fonts alternative before I realized `shared/brand/` already existed (I had created it earlier in the session, then lost track under context compression).
- Resolution: delete `/brand/`, rewire any import that points at it to `@life-of-an-agent/brand`. `shared/brand/` is the only brand system going forward.

### D4. Slide 1 cover: violet environment, mono meta line, hero wordmark

- Cover slide renders on violet gradient with white wordmark. Meta strip ("~45 min content · 15 min Q&A · 4 interactive demos") uses Geist Mono at small size, dim opacity. Section openers inherit the same violet environment; content slides flip to paper surface.
- **Why:** gives the deck a recognizable chrome change between "we're starting a new chapter" and "we're in the material." The reference template does this same violet-environment/white-content split.

### D5. Recording-friendly slide density, visual-first S1

- Slides are recorded (internal-only, per §2 of the outline), so moderate text density is allowed — narrative companion and recording together carry weight the slide doesn't have to.
- **Exception: S1 is visual-first.** Four interactive demos carry the pedagogical load; surrounding slides are sparse scaffolding. This was already locked in commit `c49d24d` (Session 1: add experiential goal, mandate visual-first delivery) — repeated here because it shapes every slide choice for S1.

---

## 2026-04-20 — S1 demo architecture (pre-consolidation)

### D6. Four S1 demos, all precomputed, zero server calls

- `agent-loop` — hand-authored JSON walkthrough of a tool-using agent turn.
- `tokenizer-explorer` — BPE merge table + UI, runs entirely in browser. (Tokenizer family choice: see D7.)
- `embedding-scatter` — 2D projection of GPT-2 small embeddings (precomputed in `scripts/precompute_gpt2_data.py`), with analogy queries replayed from a precomputed cosine table.
- `residual-stream` — animated per-layer state evolution, also precomputed.
- **Why:** GitHub Pages is static-only. No inference server. The `precompute_*.py` scripts run once locally, produce data files, demos replay them. This keeps the whole `_site/` under ~2.2 MB (0.2% of GH Pages' 1 GB site quota).

### D8. All 4 S1 demos share a single dark "instrument panel" surface

- `shared/brand/src/demo-surface.css` is the one-stop import every demo pulls in. It provides: demo-dark tokens (`--loa-demo-bg`, `--loa-demo-panel`, etc.), the `.loa-demo` root + `.loa-demo-shell` layout, and primitive components (`.loa-demo-header`, `.loa-demo-kicker`, `.loa-demo-title`, `.loa-demo-sub`, `.loa-demo-back`, `.loa-demo-panel`, `.loa-demo-chipbar`, `.loa-demo-chip`, `.loa-demo-btn`, `.loa-demo-note`).
- Per-demo CSS now only contains *demo-specific* styles (token grid, logit-lens rows, scatter controls, step-card type colors, etc.) — the chrome comes from the shared package.
- **Why:** deck lives in the light "paper" register; demos live in a dark data-viz register — the bridge between them is shared Geist typography + the violet/cobalt accent system. One source of truth means future demos across S2–S10 inherit the look with ~5 lines of CSS.
- **Rollout status (2026-04-20):** residual-stream-animator ✓, agent-loop ✓, tokenizer-explorer ✓, embedding-scatter ✓ (flipped from light to dark to match peers).
- **Per-demo color preservation:** agent-loop keeps its step-type colors (think/tool/dispatch/result/final) as domain semantics, now remapped onto `--loa-*` tokens. Embedding-scatter got a new 15-hue categorical palette tuned for contrast on `#0f0d1f`.

### D7. [PENDING] Tokenizer family swap: GPT-2 / cl100k_base → Gemma

- Bryan asked: does Google have an open-source tokenizer we can use instead? Answer: **Gemma** (SentencePiece unigram-LM, ~256K vocab).
- Pedagogical gain: actually Google, actually SentencePiece — lets us show unigram-LM behavior and the SentencePiece `▁` word-boundary marker, which `cl100k_base` / BPE wouldn't.
- **Status:** agreed in principle, not yet implemented. Current `tokenizer-explorer` still uses cl100k_base. Swap is pending after visual refit lands. In-browser runtime options: `@huggingface/transformers` (heavier, ~MB) or a pure-JS SentencePiece port (lighter). Defer the choice until implementation.

---
