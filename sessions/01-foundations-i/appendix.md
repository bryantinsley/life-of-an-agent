---
layout: section
hide: true
---

# Appendix — backup slides

<div class="text-sm opacity-60 pt-4">
Hidden from the linear flow. Reachable via Slidev's presenter UI when a question lands.
</div>

<!--
This is the backup deck. None of these slides appear in the linear flow. Use the presenter UI's slide grid to jump to the one a question opens. Each slide here is one likely-question deep-dive.
-->

---
hide: true
---

## Q: Why not byte-level or character-level tokenization?

<div class="pt-4 space-y-3 text-sm">

**Byte-level / character-level models exist** — ByT5 from Google, MambaByte from CMU, the byte-fallback paths inside SentencePiece-family tokenizers. They have real applications: noisy text, low-resource languages, anything where the tokenization step is itself a source of bugs.

**The tradeoff is sequence length.** A document that fits in 500 BPE tokens might be 2,500 characters or 5,000 bytes. The model's compute scales at least linearly with sequence length and the attention cost is quadratic. So byte-level models pay a large per-document compute tax.

**They also waste capacity** in the early layers reassembling characters into proto-words before they can think semantically. BPE bakes in some of that work; byte-level models have to learn it.

**Where byte-level wins**: sequences where the BPE tokenizer's training-data bias is hostile (rare languages, novel scripts, deliberately obfuscated text), or domains where character-level edits matter (typo correction, transliteration).

</div>

<!--
Byte-level and character-level models exist and are an active area of research, but they have not won the mainstream because of the compute cost per document. The dominant pattern is BPE-style sub-word tokenization for general-purpose models, with byte-level fallback paths for unknown sequences inside SentencePiece. The tradeoff is real and the choice is empirical.
-->

---
hide: true
---

## Q: What's weight tying?

<div class="pt-4 space-y-3 text-sm">

**The setup**: a transformer has *two* big embedding tables, conceptually.

1. The **input embedding** — turn token id into vector at position 0
2. The **output unembedding** — turn final residual-stream vector into a logit for each token id

**Both are vocabulary × d_model matrices.** Same shape. So a question: should they share weights?

**Weight tying**: yes. The same matrix is used for both, transposed for the output. Saves one giant matrix worth of parameters (often hundreds of millions). Empirically helps on small-to-medium models.

**Untied**: no. Two separate learned matrices. Frontier models often untie because the parameter cost is small relative to the rest of the model and untied gives a small quality bump.

</div>

<!--
Weight tying was originally proposed because the input embedding and output unembedding have the same shape and roughly the same purpose — both are the bridge between token-space and vector-space. Tying them saves parameters and tends to help small models because the data is more efficiently used. As models got bigger, the parameter savings became less important relative to the rest of the model, and the small quality difference of untying started winning. Modern frontier models lean untied.
-->

---
hide: true
---

## Q: What is positional encoding?

<div class="pt-4 space-y-3 text-sm">

**The problem**: attention is permutation-invariant. If you shuffle the tokens, attention's output (per token) doesn't change in any way that tells the model what order they were in.

**The fix**: bake position information into the vector itself. Two main schools.

**Absolute** (original transformer): add a position-dependent vector to each token's embedding. Sinusoidal patterns or learned. Simple, but doesn't generalize past trained-on lengths.

**Relative / rotary** (modern): encode *relative* position via rotations applied inside the attention computation (RoPE) or via additive bias terms (ALiBi). Generalizes better. Most current models use RoPE.

**Why we don't dwell on this in S1**: it's mechanically inside attention, which is S2. We'll touch on it next week if it comes up.

</div>

<!--
Positional encoding is one of those topics where the *what* is simple (you have to tell the model the order) and the *how* is a research subarea. Tonight you don't need it because the residual-stream picture works regardless of which scheme is used. Next week, if you ask, we will make sure attention is on screen first so the answer has a place to land.
-->

---
hide: true
---

## Q: Are there tokenizer-free models? What are the tradeoffs?

<div class="pt-4 space-y-3 text-sm">

**Yes.** ByT5 (Google, 2021) and MambaByte (CMU, 2024) are well-known examples. They operate directly on UTF-8 bytes — vocabulary of 256.

**Pros**: no tokenizer-specific failure modes. Same model handles any language, any script, any character. Robust to typos and OOV. No tokenizer/model version-skew bugs.

**Cons**: longer sequences for the same content (typically 4–5×). More compute per document. The model spends early layers learning to assemble bytes into useful semantic chunks.

**Where they make sense**: low-resource languages with small training corpora; domains with heavy adversarial or noisy text; tasks where character-level edits are the unit of work.

**Why mainstream models still use BPE**: the per-document compute tax is real, and at frontier scale the cost of training and serving longer sequences outweighs the convenience.

</div>

<!--
Tokenizer-free models are a real path that some research groups continue to push on, especially for multilingual and low-resource settings where BPE tokenization is meaningfully unfair across languages. The compute tax has so far kept them out of the mainstream frontier-model lineage.
-->

---
hide: true
---

## Q: How does the embedding table actually get learned?

<div class="pt-4 space-y-3 text-sm">

**It's just parameters.** The embedding table is one giant matrix of trainable weights, like every other parameter in the model. During training, the same gradient-descent loop that updates attention weights and FFN weights also updates the embedding table.

**The training signal**: when the model is wrong about the next token, the loss gradient flows backward through every layer — including back into the embedding for whichever input token participated. Over trillions of training steps, similar tokens get nudged into similar regions of the space, because that arrangement reduces loss across the average of contexts they appear in.

**No explicit "make similar tokens close" rule.** The geometry is *emergent* from the predictive task.

**This is also why** you cannot transplant embeddings across models — the geometry is shaped by *that model's* full training history.

</div>

<!--
The embedding table is just parameters. There is no special "embedding training" loop. The gradient that updates everything else updates the table too. The interesting fact — that the resulting geometry encodes meaning — is emergent. Nobody coded the rule "put cat near dog." It falls out of the prediction objective interacting with the structure of natural language across enough examples.
-->

---
hide: true
---

## Q: What does it mean for the model to "understand" a word?

<div class="pt-4 space-y-3 text-sm">

**There is a real philosophical argument here**, and you should not let yourself be bullied into either extreme.

**One extreme**: "the model truly understands." Implies internal mental states, intentionality, semantic grounding. Most cognitive scientists would push back hard.

**Other extreme**: "the model is just statistics, it doesn't understand anything." True at the substrate level but doesn't account for the behavioral evidence — these models reason, plan, generalize, transfer.

**Operational answer**: the model has *learned correlations among tokens* that are useful for predicting which token comes next. Whether that constitutes "understanding" is a question about what we mean by understanding, not a question about the model.

**For SREs**: useful framing is *the model behaves as if* it understands, in many domains, and the *as if* breaks down predictably in others. Knowing the failure modes is more useful than the philosophy.

</div>

<!--
This is a question that genuinely splits researchers and that we are not going to resolve in this room. The useful operational stance is that the model behaves as if it understands in a wide range of contexts and breaks down in predictable ways, and your job as an SRE is to know the failure shapes. The metaphysics is interesting and irrelevant to keeping the system up.
-->

---
hide: true
---

## Q: What happens if you swap the tokenizer after training?

<div class="pt-4 space-y-3 text-sm">

**It breaks.** Catastrophically.

**Why**: the model's embedding table maps token IDs to vectors. Token ID 47291 means whatever the *original* tokenizer said it meant. If you swap to a tokenizer where 47291 means something different, the model is now looking up the wrong row.

**Real-world version of this bug**: a fine-tuning pipeline that uses the wrong tokenizer config. The model produces garbage. The fix is "use the tokenizer that shipped with the model, byte for byte."

**Adapter approaches exist** (re-train just the embedding layer for a new tokenizer) but it's a research project, not an operational move.

**SRE takeaway**: always treat (model weights, tokenizer config) as a single inseparable artifact in your deployment pipeline. Never mix and match.

</div>

<!--
This is the kind of bug that turns up in fine-tuning pipelines, where someone uses a different tokenizer config than the one the base model was trained with, and the model starts emitting garbage. The fix is mechanical — use the right tokenizer — and the operational discipline is to treat the (weights, tokenizer) pair as inseparable.
-->

---
hide: true
---

## Q: How are token costs typically priced?

<div class="pt-4 space-y-3 text-sm">

**Two-axis pricing on every major API**: input tokens (sent to the model) and output tokens (generated by the model) are billed at different rates. Output is typically 3–5× more expensive per token.

**Why output costs more**: prefill (input processing) is compute-bound and parallelizable across the entire input. Decode (output generation) is memory-bandwidth-bound and runs one token at a time. We will bottom out the *why* in S5.

**Cached input tokens are typically 75–90% cheaper** on every major API that supports prompt caching (Anthropic, OpenAI, Google).

**Long-context tokens often cost more per token** than short-context tokens. A 1M-token Gemini call is not priced linearly with a 10K call.

</div>

<!--
The two-axis pricing structure — input cheap, output expensive, with cached input cheaper still — directly reflects the prefill-versus-decode asymmetry that we will spend session five on. The pricing is not arbitrary; it follows the underlying cost of the operations.
-->

---
hide: true
---

## Q: What is the "context window" exactly?

<div class="pt-4 space-y-3 text-sm">

**Operational definition**: the maximum number of tokens — input + output, not just input — that fit in a single request to the model.

**Why it has a limit**: the model was trained on sequences up to a certain length. Position information was learned over that range. The KV cache grows linearly with sequence length and decode cost grows with KV cache size.

**Typical values right now**: 128K tokens is mainstream; 1M is the Gemini long-context tier; 2M has been demonstrated.

**Important caveat**: long context ≠ good reasoning over long context. The "lost in the middle" effect is real and well-documented. Just because the model accepts a million tokens does not mean it attends to all of them equally. We hit this hard in S8.

</div>

<!--
Context window is a useful headline number but a misleading one if you take it at face value. The model accepting a long context is not the same as the model using all of it well. The lost-in-the-middle effect is real, well-replicated, and a major source of agent failure modes that we will spend serious time on in session eight.
-->
