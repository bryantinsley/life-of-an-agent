# Course Master Document
# How LLMs and Agents Actually Work
## A 10-Session Curriculum for SREs

**Status:** Working draft v1. Facilitator-only. Not for attendees.
**Format:** 10 sessions × 1 hour. 45 min content target + ~15 min for in-session discussion, questions, and breathing room. Discussion bleeds into the 45 wherever it earns its place; the 15 absorbs overruns and dedicated Q&A.
**Audience:** Google SREs. Strong systems intuition, uses LLMs daily, range of ML background from zero to some.

---

## 1. Course Philosophy

This course is built the way a good CS curriculum is built: theory and foundations first, software engineering last. Attendees see the whole tree before any branch in detail, then walk the trunk before the branches. Agents — the thing everyone actually uses — come at the end, after the pieces are understood. This runs opposite to most LLM courses, which start with "here's how to prompt" and work inward. The bet is that SREs, who already think in terms of systems and layers, will retain more and reason better with foundations first.

Consequences of this choice:

- Session 1 has to do a small amount of agent framing so attendees know what they're building toward, but the body of session 1 is the real foundation.
- The "ah-ha" moments cluster in sessions 6–9, when the architectural work pays off and serving/agent behavior becomes explainable from first principles.
- Some attendees will be frustrated early ("when do we get to the interesting stuff?"). Acknowledge this in session 1 and promise the payoff explicitly.

## 2. Pedagogical Choices, Codified

| Choice | Rationale |
|---|---|
| Minimal math notation | Audience ≠ ML researchers. Use notation only where it genuinely unlocks something. Prefer "the model computes a weighted average over previous tokens" to `softmax(QK^T/√d_k)V` unless the latter is load-bearing. |
| Generic examples, Google callouts | Course ages better when generic; Google callouts land when attendees can connect to products they know. Frame Gemini specifics as "known" or "widely speculated" — do not overclaim. Every Gemini claim passes through two gates: the one-pass verification sweep (§10.1, pre-production) and the week-of revalidation (§10.2, just before delivery). |
| Durability-first content | Bulk of every session lives in fundamentals with a 5–10+ year half-life: residual stream, attention math, prefill/decode asymmetry, the agent loop. Vendor specifics, model names, benchmark numbers, and SOTA highlights are kept thin and *isolatable* — they live in their own slides/segments so they can be refreshed without restructuring the session. Reason: LLM-specifics have a half-life of months; structuring the course around them guarantees rot. Operationalized through three layers — durable fundamentals, week-of revalidation (§10.2), and a recent-SOTA callout segment per session (§10.3). |
| One SRE callout per session | Concrete operational tie-in, not shoehorned. Sessions 6–7 are SRE-rich; sessions 4–5 have thinner callouts. That is fine. |
| Interactive HTML where useful | Clickable walkthroughs for things that benefit from them — tokenizer visualizer, attention viewer, prefill/decode timeline. Not every session needs one. |
| Pre-read primes questions, not answers | Attendees arrive with mental hooks, not half-formed answers that have to be un-taught. Each pre-read explicitly plants 1–3 questions the session will resolve. |
| Adaptive, cumulative study prompt per session | Each study prompt quizzes that session plus all prior. By session 10 you're being tested on the whole stack. Prompts ask Claude to flag mental-model errors, not just wrong answers. |
| Facilitator depth target: 3× attendee | Every session outline includes a "stretch" section — things you should know that attendees won't ask but a sharp one might. This is the forcing function you asked for. |

## 3. The Arc at a Glance

1. **Foundations I — From Text to Vectors.** Agent loop preview, architecture map, tokens, embeddings, the residual stream.
2. **Attention.** Q/K/V, softmax, multi-head, the KV cache as a natural consequence, O(n²).
3. **The Transformer Block and Full Forward Pass.** Attention + FFN + residuals + norms, stacking, logits → token, sampling preview.
4. **Training (Pre + Post).** Next-token prediction, scale, emergence, knowledge cutoffs (~25 min). SFT, RLHF, RLVR as a survey (~15 min). MoE architectural callout (~5 min). RL deep dive deferred to agents.
5. **Prefill and Decode.** The two phases, why they differ, prefix caching, what TTFT and tok/s actually measure.
6. **Sampling and Serving.** Temperature, top-p, speculative decoding, continuous batching, paged attention.
7. **Agents I — The Loop and Tools.** Model in a while loop, tool schemas, tool calls as tokens, system prompts, context assembly.
8. **Agents II — Context Engineering.** Context rot, lost-in-the-middle, compaction, long-horizon tasks, what to keep / what to drop, cache-aware prompt structuring.
9. **Agents III — Reliability, Failure Modes, Evals.** Tool loops, hallucinated tools, eval design, agent observability. Where deferred topics pay off (RL → tool use, prefix caching → economic viability, sampling → tool-call reliability, KV cache → context-engineering cost math).
10. **Putting It All Together.** End-to-end walkthrough of one agent turn through every layer, where the field is going, catch-all Q&A.

Shape: 1–3 build one concept (the transformer). 4 explains how it got good at what it does (compressed; full RL payoff deferred). 5–6 explain how it runs in production. 7–9 explain how it's wrapped to do useful work — three sessions because that's the part SREs touch daily. 10 re-walks the whole stack.

**Decision log — arc balance shift (2026-04-20):** Original draft gave agents 2 sessions (~90 min). Shifted to 3 (~135 min) by merging old S4 (Pre-training) + S5 (Post-training and RL) into a single S4 "Training" that compresses RL to a survey. Reason: agents are what attendees touch daily; the theory-first bet still pays off, but a 3rd agent session creates room for the spiral pattern below — foundational concepts get briefly introduced where they architecturally belong, then revisited in the agent context where the "why does this matter" lands hardest. Capstone preserved at S10.

## 3a. Spiral / Two-Pass Callbacks

Several foundational concepts get the two-pass treatment: brief introduction at the architecturally correct point, full payoff later in the agent sessions where the operational stakes make them click. This lets foundations stay tight without losing depth.

| Concept | First pass (brief) | Second pass (payoff) |
|---|---|---|
| **RL (RLHF, RLVR)** | S4 Training, ~5 min as a survey of post-training | S9 — how RL specifically unlocked reliable tool use; why tool-using models had to be trained, not prompted, into existence |
| **KV cache** | S2 Attention (as natural consequence of math), S5 Prefill/Decode (memory math) | S8 Context Engineering — the cost math of context decisions; why every kept token costs decode bandwidth on every subsequent token |
| **Sampling / decoding** | S3 (preview), S6 Sampling and Serving (knobs) | S9 — temperature for tool-call reliability, why agents typically run at low temp, when determinism matters and why it's hard |
| **Prefix caching** | S5 Prefill/Decode (throughput optimization) | S9 — the economic enabler of agent loops (50-turn trajectory ≠ 50× single turn), and cache-aware system-prompt / tool-definition structuring as an SRE-relevant skill |

How this shows up in deliverables: each first-pass slide includes a "we'll come back to this in S{N}" forward-pointer; each second-pass slide opens with a "remember from S{N}" callback. The ratchet is explicit, not implicit.

> **Note:** Per-session detail in §6 below still reflects the pre-shift 10-session structure. Sessions 4, 7, 8, 9 need to be rewritten to match the new arc; sessions 1–3, 5, 6, 10 are largely unchanged but their numbering and handoff lines need updating. Defer the rewrite until remaining open questions (Q5 safety/alignment, Q6 logistics) settle. Items to incorporate during the rewrite:
> - **TPU vs GPU coverage (consolidated, lands in S5)** — one cohesive ~10-min block in S5 Prefill/Decode covering the full arc: why GPUs dominate training (CUDA ecosystem maturity + market gravity, not architectural superiority), why TPUs compete on inference (decode is memory-bandwidth-bound, both have HBM, systolic vs SIMT matters less when bandwidth dominates), and why Apple Silicon plays in the inference space too (unified memory = no PCIe transfer for the model weights). S4 Training gets a one-line forward-reference ("Google trained Gemini on TPUs; we'll unpack what TPUs are and how they compete with GPUs in S5 when we look at inference, where the architectural story actually pays off"). Reason: splitting the story across two sessions risks neither half landing — the "training-on-GPU, inference-anywhere" arc is one narrative (economics + ecosystem + architecture), and S5 is where the architectural distinction earns its keep. Also serves as facilitator-training material for cross-vendor architectural fluency.
> - **Verified Gemini claims** — the single-pass verification (see §10) produces a sources-table that the rewrite should use to recalibrate every Gemini callout.

## 4. Cross-Cutting Threads

Four mental models recur throughout. Name them, refer to them by name, and check comprehension of them before moving on.

### 4.1 The Residual Stream
Everything inside a transformer happens by reading from and writing to a shared "stream" of vectors — one vector per token position. Attention and feed-forward layers read the stream, compute something, and add their result back. Introduced session 1, operationalized session 2, crucial in session 3, referenced whenever architecture comes up.

### 4.2 "It's All Just Tokens"
Text, tool calls, tool results, system prompts, thinking tokens — the model sees them as the same substrate. There is no separate "tool-calling module"; tool calls are just tokens with a particular structure the harness knows how to recognize. This single idea unlocks most of session 8.

### 4.3 Training vs. Inference
Two completely different regimes, running on different infrastructure, with different cost structures and different failure modes. Half the confusions in the room will trace back to conflating them. Introduced session 1, explicit session 4, central to sessions 6–7.

### 4.4 Prefill vs. Decode
The two phases of a single inference request. Different bottlenecks, different optimizations. Previewed session 3, deep in session 6, central to the SRE narrative.

## 5. Vocabulary Introduction Timeline

| Term | First introduced | First deepened | First applied |
|---|---|---|---|
| Token | 1 | 1 | 3 |
| Embedding | 1 | 1 | 2 |
| Residual stream | 1 | 3 | ongoing |
| Attention (intuition) | 1 | 2 | 2 |
| Q/K/V | 2 | 2 | 6 |
| Softmax | 2 | 2 | 7 |
| KV cache | 2 | 6 | 6 |
| Multi-head attention | 2 | 2 | — |
| FFN / MLP block | 3 | 3 | — |
| Layer norm | 3 | 3 | — |
| Logit | 3 | 3 | 7 |
| Sampling | 3 | 7 | 7 |
| Temperature, top-p | 3 | 7 | 7 |
| Pre-training | 4 | 4 | — |
| Scaling laws, emergence | 4 | 4 | — |
| SFT | 5 | 5 | — |
| RLHF | 5 | 5 | — |
| RLVR | 5 | 5 | — |
| MoE | 5 | 5 | — |
| Prefill | 3 | 6 | 6 |
| Decode | 3 | 6 | 6 |
| TTFT, tok/s | 6 | 6 | 6 |
| Prefix caching | 6 | 6 | 8 |
| Speculative decoding | 7 | 7 | — |
| Continuous batching | 7 | 7 | — |
| Paged attention | 7 | 7 | — |
| Tool call, tool schema | 8 | 8 | 9 |
| System prompt | 8 | 8 | 9 |
| Agent harness | 8 | 9 | 10 |
| Context engineering | 9 | 9 | 10 |
| Eval | 9 | 9 | 10 |

## 6. Per-Session Detail

---

### Session 1 — Foundations I: From Text to Vectors

**One-line goal (technical):** Attendees leave understanding that an LLM is a function from a token sequence to a probability distribution over the next token, and know how text becomes numbers.

**One-line goal (experiential — equally important):** Attendees walk out thinking *"I learned a lot, and I can't wait for next week."* S1 sets the tone for retention across the whole course. It needs to feel busy with novelty, not exhausting.

**Position in arc:** Foundation of everything. The agent-loop preview (first 10 min) is a promise; the real work is the second half.

**Delivery principle:** Visual-first. Slides should be sparse text + dense interactive demos. Four load-bearing click-throughs (see "Interactive HTML — required" below) carry the session; bullets are scaffolding, not the substance. If an interactive is cut for time, the whole session weakens — they are the pedagogy, not embellishment.

**Time breakdown (45 min content target, 60 min slot — see header for budget convention):**
- 0–10: **Agent loop demo (interactive #1).** Click through one real turn — model thinks, emits a tool call, harness dispatches, result comes back, model continues. Promise: "by session 10 you'll understand every layer of what just happened."
- 10–20: Tokenization. **Live tokenizer (interactive #2)** — paste their own name, emoji, code, Mandarin, the BPE merging visualizer on a toy vocab. Why tokens aren't words has to be felt, not told.
- 20–30: Embeddings. **2D embedding scatter (interactive #3)** — projected word cluster, hover/zoom, with the "king − man + woman ≈ queen" demo as pull-out. "Similar meanings live near each other" should be visible, not asserted.
- 30–40: The residual stream. **Residual-stream animator (interactive #4)** — one token position, watch its vector evolve layer by layer toward a prediction. This is the prime for S2: "next week we'll explain how the layer decided what to add."
- 40–45: **Territory closer.** Pull up the canonical architecture/inference map (the diagram that will recur all course long). Now that they have the vocabulary — token, embedding, residual stream, agent loop — they can *read* the map. Walk it as "here's where you are, here's where we're going. Every block on this map gets a session. See you next week." The unrecognized regions of the map are the anticipation engine — the "I want more" trigger.

**Decision log — S1 scope (2026-04-20):** Original draft included a 5-min architecture/inference map slot at minutes 10–15 as upfront scaffolding. Cut and relocated to a 5-min closer at minutes 40–45. Reason: upfront, the map is words they don't yet have referents for — boring, doesn't wow. As a closer, the same map becomes anticipation-builder because they recognize the parts we just unpacked and see the scope of what remains. This serves the "rock their world / I want more" walk-away goal directly. Each of the four interactives gains a clean 10-min slot. The 60-min total slot leaves ~15 min for discussion bleed and Q&A — interactives are the most likely overrun source, so the buffer is real, not nominal.

**Learning objectives:**
- Describe what a token is and why tokenization affects behavior (cost, edge cases, non-English).
- Explain that the model operates on vectors, not text.
- Articulate the residual stream as a mental model.
- Distinguish training from inference at a high level.

**Concepts introduced:** token, tokenizer, BPE, embedding, residual stream, forward pass, training vs. inference (high level).

**Misconceptions to watch for:**
- *"Tokens are words."* They often aren't. `"unbelievable"` might be 3 tokens; `" the"` with a leading space is a different token from `"the"`.
- *"The model stores text somewhere and looks it up."* No — parameters encode distributions, not text.
- *"Embeddings are fixed forever."* The input embedding table is static, but the vector at each position evolves as it flows through layers — that's the residual stream.
- *"The model knows what a word means."* It has learned correlations among tokens useful for predicting the next token. Meaning is inferred from behavior; there's a legitimate argument about what it "really" knows.

**Likely questions:**
- *"Why tokenize at all — why not characters or bytes?"* Efficiency tradeoff. Byte-level models exist (ByT5, MambaByte). Character-level loses semantic density; tokens hit a sweet spot.
- *"How big are these vectors?"* Ballpark. Gemini's dimensions aren't public. GPT-3 was 12,288. Smaller open models sit around 4,096.
- *"Where do embeddings come from?"* Learned during training. "We'll get there in session 4."
- *"Is the tokenizer part of the model?"* Sort of. It's bundled with the model (same vocabulary), but it's separate software, not learned the same way as weights.

**Things to gloss:**
- Positional encodings. Mention they exist ("the model also gets info about position"), defer the how.
- BPE algorithm details. Give the intuition ("merge common pairs"), skip the pseudocode.
- Why embedding dimension size matters. Hand-wave as "more dimensions = more capacity, more cost."

**SRE callout:** Tokenization as a failure mode. When billing is per-token and you don't control the tokenizer, your cost model has a floor of uncertainty. Non-English content, code, and structured data tokenize unpredictably. A log pipeline feeding an LLM can 10× cost overnight if the log format changes.

**Google/Gemini callout:** Gemini uses a SentencePiece-family tokenizer; some details are public. Worth naming, not worth dwelling on.

**Interactive HTML — required (four pieces):**

1. **Agent loop demo (0–10 min):** A pre-recorded or live click-through of one full agent turn — user message → model thinking → tool call emission → harness dispatch → tool result → next model turn. Should look impressive without needing explanation; the wow is "this is what we're going to take apart."
2. **Tokenizer visualizer (15–25 min):** Live paste, see tokens with boundaries, ids, per-token cost. Toy BPE on a small vocab to show merging. Must handle non-English, code, emoji to drive the "tokens ≠ words" point home.
3. **Embedding scatter (25–35 min):** 2D PCA/t-SNE of a curated word set. Hover to see word, zoom to see clusters. "King − man + woman" as a button-driven pull-out.
4. **Residual stream animator (35–45 min):** Pick a token position. Watch its vector evolve as we walk down the layers. Color-coded delta per layer ("this layer added this much"). End state is "predict the next token." Primes S2's question: how does each layer decide what to write?

**Facilitator timeboxing note:** Interactives are the highest rabbit-hole risk in S1. Each one has a hard time cap. If the room wants to keep playing with the tokenizer, the answer is "the slides ship to you after, play with it tonight; we have to move on." This is non-negotiable for keeping the 45-min budget intact.

**Pre-read priming goal (~1,000 words):** Plant three questions the session will answer:
1. Why does the model charge per token, and what is a token anyway?
2. If the model "understands" text, what does that understanding look like physically?
3. What's the difference between the thing that was trained and the thing that answers my query?

The pre-read offers a paragraph of intuition for each and explicitly says "we'll unpack this Tuesday."

**Study-prompt emphasis:** Quiz on tokens, embeddings, residual stream, training/inference distinction. Push on: "why BPE and not characters?", "what's weight tying between input embedding and output unembedding?"

**Facilitator depth challenge (3× attendee):** Be able to answer — 
(a) What's weight tying and why does it matter? 
(b) Why does vocabulary size affect both model size and inference speed? 
(c) What breaks if you swap the tokenizer after training? 
(d) Are there tokenizer-free models and what are their tradeoffs?

**Handoff:** "Now that we have vectors flowing down a stream, we need to explain how the model looks at other positions in the stream to decide what to put in each slot. That's attention, and it's next time."

---

### Session 2 — Attention

**One-line goal:** Attendees understand attention as the mechanism by which information from other token positions flows into the current one.

**Time breakdown:**
- 0–10: Problem setup. Why each position needs to see other positions. Preview of "what if I just let each vector look at all earlier vectors?"
- 10–25: Q/K/V mechanics. Three learned projections from the same input. Queries ask, keys advertise, values carry. Softmax over Q·K produces attention weights.
- 25–35: Multi-head. Multiple parallel attention patterns in the same layer, then concatenated.
- 35–45: The KV cache as a consequence of the math. Why we can cache K and V for past tokens but not Q. O(n²) and why long context is expensive.

**Concepts introduced:** query, key, value, attention weights, softmax, causal mask, multi-head, attention pattern, KV cache, O(n²) cost.

**Misconceptions:**
- *"Attention is a database lookup."* No — it's a soft, differentiable weighted sum over all positions.
- *"Multi-head means parallel models."* No — parallel projections inside one model, concatenated back together.
- *"Attention reads the whole internet."* No — only the tokens currently in context.
- *"KV cache caches answers."* No — it caches intermediate K and V vectors for past positions.

**Likely questions:**
- *"Why softmax?"* Forces a probability distribution, differentiable, standard choice. The temperature discussion is session 7.
- *"Why divide by √d_k?"* Prevents the softmax from becoming too peaked at scale. Worth one sentence.
- *"Why the causal mask?"* Training: don't let the model cheat by looking ahead. Decode: future doesn't exist yet.
- *"Why multi-head?"* Empirically better. Different heads learn different patterns. In trained models, many heads do specific things (induction heads, previous-token heads).

**Things to gloss:**
- RoPE / ALiBi / position encoding variants. Say "there are better schemes than basic positional encoding; details in the reading."
- Flash attention, attention sinks, sliding window. Mention as existing; defer to session 7 if at all.

**SRE callout:** Attention cost grows quadratically with context length. This is why long context is expensive, why context windows have hard limits, and why serving infrastructure needs careful capacity planning as users paste bigger documents.

**Google/Gemini callout:** Gemini reports 1M+ token context windows. This is only tractable with serious attention-mechanism engineering (efficient attention variants, likely). Name the tradeoff: longer context ≠ better reasoning over that context — "lost in the middle" is a real effect.

**Interactive HTML opportunity:** Attention-pattern visualizer. Hover over a token, see which prior tokens it attends to and with what weight. A classic demo; toy example with a few heads is very effective.

**Pre-read priming goal:** One question. *"How does the model decide which earlier words matter for the current word?"* Give the intuition: reading "the bank raised its rates," which meaning of "bank" is active depends on surrounding words. That's attention. The session will unpack the mechanism.

**Study-prompt emphasis:** Q/K/V intuition, causal mask purpose, KV cache reasoning. Push on: "why must attention be quadratic?", "what makes a head interesting to interpretability researchers?"

**Facilitator depth challenge:**
(a) What are induction heads and why do they matter?
(b) What's grouped-query attention (GQA) and why are modern models using it?
(c) How do Flash Attention 1/2/3 work at a high level and what do they save?
(d) Absolute vs. relative vs. rotary position encodings — when do they matter?

**Handoff:** "We have attention. Let's put it in its architectural context with the other parts of a transformer block, and walk one full forward pass."

---

### Session 3 — The Transformer Block and Full Forward Pass

**One-line goal:** Trace one full forward pass through a multi-layer transformer, from token ids to logits to next token.

**Time breakdown:**
- 0–5: Recap attention (90 seconds) and residual stream (90 seconds).
- 5–20: The transformer block — attention + FFN + residual + layer norm. What each piece does; what the FFN adds that attention doesn't.
- 20–30: Stacking. Deep models are the same block repeated. Why depth matters.
- 30–40: Output head. Logits → softmax → token. Preview sampling: "there's a choice to be made here; we'll come back session 7."
- 40–45: The whole pass re-walked: embeddings → 50+ transformer blocks → unembedding → sampling → token.

**Concepts introduced:** FFN (feed-forward network) / MLP block, layer norm, residual connection, block stacking, logit, unembedding, sampling preview.

**Misconceptions:**
- *"Each layer does something different."* Architecturally identical; behavior differs due to learned weights.
- *"More layers = more steps of reasoning."* Partial truth. Related to circuits research but subtle.
- *"Logits are probabilities."* Not until softmax.

**Likely questions:**
- *"What does the FFN do?"* Roughly: compute and store information. Interpretability research has found feature detectors in FFN activations — they look a lot like content-addressable memory.
- *"Why residual connections?"* Training stability, gradient flow, compositional behavior.
- *"Why layer norm?"* Stable activations across depth.

**Gloss:** Pre-norm vs. post-norm, RMSNorm vs. LayerNorm, GELU vs. SwiGLU activations. Name-drop only if asked.

**SRE callout:** Each block is identical in cost, so total inference time scales linearly with depth (for a fixed architecture). A 72-layer model takes ~2× the time of a 36-layer model, all else equal.

**Google/Gemini callout:** Parameter counts of Gemini variants (Flash, Pro, Ultra) aren't public, but the tier structure implies different depths and widths.

**Interactive HTML opportunity:** Forward-pass animator. Click through: token ids → embeddings → block 1 → block 2 → ... → logits → sampling. See the residual stream update at each step.

**Pre-read priming goal:** "You know how attention works. But attention alone can't predict the next token. What else has to happen?"

**Study-prompt emphasis:** Full forward-pass narration. Push on: "what does the FFN actually compute?", "why are models as deep as they are — is there theory that says 72 layers beats 36?"

**Facilitator depth challenge:**
(a) The FFN as key-value memory — interpretability framing (Geva et al.).
(b) Superposition and why models encode more features than they have dimensions.
(c) The logit lens and its limits.
(d) Grokking as a training-dynamics phenomenon.

**Handoff:** "We've built the transformer. We've never said where the parameters came from. Next three sessions: how the model learned."

---

### Session 4 — Pre-training

**One-line goal:** Understand next-token prediction as the single training objective, and why that alone is sufficient to produce capable language models.

**Time breakdown:**
- 0–10: The objective. Predict the next token. That's it.
- 10–20: The setup. Data sources, tokens-of-training scale, compute, parallelism at a high level.
- 20–30: What emerges from scale. Capabilities as scale increases. Scaling laws.
- 30–40: What "the model knows." Parametric knowledge vs. in-context knowledge. Knowledge cutoffs.
- 40–45: Handoff — pre-training gives a text completer, not an assistant.

**Concepts introduced:** pre-training corpus, cross-entropy loss, compute scaling, data scaling, emergence, parametric knowledge, in-context knowledge, knowledge cutoff.

**Misconceptions:**
- *"The model is trained on my prompts."* No — pre-training is offline, done before serving.
- *"Training never stops."* Pre-training is done; subsequent rounds are post-training (session 5).
- *"The model memorizes its data."* Some memorization happens, but most of what looks like memorization is generalization.
- *"If I point out an error, the model will learn from it."* Not in this conversation. Not generally across users either.

**Likely questions:**
- *"How much data?"* Trillions of tokens. Chinchilla and successors. Gemini trained on mixed text/code/multimodal.
- *"What's in the training data?"* Web crawl, books, code, curated sources. Specifics are proprietary and contested.
- *"Why does scale help?"* Empirical scaling laws. The underlying *why* is still debated.
- *"What's emergence?"* Capabilities that appear abruptly at scale. Schaeffer et al. argued it's partly a measurement artifact. Worth the nuance.

**Gloss:** Optimizer details (Adam, AdamW), batch sizes, curriculum learning, specific architectures beyond transformers.

**SRE callout:** Training and serving are two completely separate stacks at Google scale. Training uses tightly coupled TPU pods; serving uses distributed clusters optimized for latency. This separation echoes the classical batch-vs-online distinction SREs know.

**Google/Gemini callout:** Gemini trained on TPUs (v4 and v5 generations, per technical reports). Frontier-scale training compute is measured in exaflop-days.

**Interactive HTML opportunity:** Loss curve with annotations. Show training loss over tokens-seen, with hover-notes for when common capabilities empirically appear. Illustrative, not live.

**Pre-read priming goal:** "If you had to teach a model just to predict the next word — across all text humans have written — what could that produce? What couldn't it?"

**Study-prompt emphasis:** Loss, scale, emergence. Push on: "what did Chinchilla change from Kaplan?", "what's the difference between scaling laws and emergence?"

**Facilitator depth challenge:**
(a) Kaplan vs. Chinchilla scaling laws and what changed.
(b) Data quality vs. quantity tradeoffs.
(c) Knowledge cutoffs in practice and why they're fuzzy.
(d) Memorization debates — what counts, what to measure, copyright implications.

**Handoff:** "Pre-training gives a text completer. That's not the same as an assistant that follows instructions. Post-training is how we bridge the gap."

---

### Session 5 — Post-training and RL

**One-line goal:** Explain SFT → RLHF → RLVR, how tool use specifically gets trained in, and place MoE architecturally.

**Time breakdown:**
- 0–10: Why post-training exists. Base model is a text completer, not an assistant.
- 10–20: SFT (supervised fine-tuning) on curated instruction-response pairs.
- 20–30: RLHF and RLVR. Reward models, policy optimization, verifiable rewards.
- 30–40: Training tool use specifically — it's not a prompt trick, it's in the training data.
- 40–45: MoE detour (Gemini is widely believed to be MoE).

**Concepts introduced:** SFT, instruction tuning, RLHF, reward model, policy optimization, RLVR, tool-use training, MoE (router, experts, active vs. total params).

**Misconceptions:**
- *"RLHF makes the model smarter."* It makes it more aligned to preferences; capability is mostly from pre-training.
- *"The model learns to use tools from prompts."* No — it's trained on tool-use examples. In-context recognition is a separate skill.
- *"MoE is a fine-tuning technique."* No — it's an architectural choice affecting pre-training and serving.

**Likely questions:**
- *"Is RLHF why models are helpful?"* Largely. Also why they're cautious, verbose, sometimes sycophantic.
- *"What's RLVR good for?"* Tasks with checkable answers — math, code. Current frontier for reasoning models.
- *"How many params does MoE activate?"* Varies. Mixtral activates 2 of 8 experts per token publicly. Others run similar ratios. Gemini specifics aren't confirmed.

**Gloss:** DPO vs. PPO internals, reward hacking case studies, constitutional AI details unless asked. RL algorithms are a rabbit hole.

**SRE callout:** Post-training iteration cycles are much faster than pre-training, which is why models version-bump frequently while base capabilities are relatively stable. Serving a new post-trained model = swap weights. Retraining a base model = months.

**Google/Gemini callout:** Gemini is widely speculated to be MoE, not confirmed. Frame as "the trend across frontier labs and likely where Gemini sits." Do not overclaim.

**Interactive HTML opportunity:** Before/after comparison. Same prompt, base model output vs. SFT output vs. RLHF'd output. Illustrative.

**Pre-read priming goal:** "Pre-training gives a text completer. Why isn't that a useful assistant? What has to happen to bridge the gap?"

**Study-prompt emphasis:** Three post-training stages, tool-use training mechanism, MoE basics. Push on: "what's the difference between PPO and DPO?", "what's the specific training signal for RLVR on code?"

**Facilitator depth challenge:**
(a) Reward hacking with case studies.
(b) Constitutional AI / self-supervised alignment approaches.
(c) MoE load balancing and router failure modes.
(d) The speculated-vs.-known spectrum for Gemini's architecture.

**Handoff:** "We have a trained model. How does it actually *run* when a request arrives?"

---

### Session 6 — Prefill and Decode

**One-line goal:** The two phases of a single inference request, why they have different cost profiles, what this means operationally.

*This is the session your SREs will love. Lean in.*

**Time breakdown:**
- 0–10: Problem setup. A request arrives. What happens first? Teaser: why is the first token slow and the rest fast?
- 10–20: Prefill. Compute the forward pass over all input tokens at once. Compute-bound.
- 20–30: Decode. Generate one token at a time, each needing a full forward pass, reusing the KV cache. Memory-bandwidth-bound.
- 30–40: KV cache in production. Prefix caching, cache eviction, cost and latency implications.
- 40–45: Reading benchmarks correctly. What TTFT and tok/s actually measure.

**Concepts introduced:** prefill, decode, compute-bound vs. memory-bandwidth-bound, TTFT, inter-token latency, tok/s throughput, prefix caching, KV cache eviction.

**Misconceptions:**
- *"Prefill and decode are the same thing, just sequential."* No — they hit different bottlenecks.
- *"More GPUs = faster decode."* Not for a single request. Decode is bandwidth-bound per GPU. More GPUs give throughput across requests.
- *"Prefix caching is free."* Cache hits are cheaper than misses but the infrastructure has costs and eviction tradeoffs.
- *"Context window of 1M means I can send 1M tokens for free."* No — prefill scales with input length.

**Likely questions:**
- *"Why is the first token slow and subsequent tokens fast?"* That's the whole session.
- *"How does speculative decoding fit?"* Preview: another decode accelerator. Session 7.
- *"Can I cache my system prompt?"* Yes. That's prefix caching. Most major APIs support it explicitly.
- *"How does context-cache billing work?"* Varies. Cached tokens are typically 75–90% cheaper.

**Gloss:** Specific attention kernels (Flash Attention) — name, refer to session 7 if deeper dive needed.

**SRE callout:** Whole session is SRE. The core insight: your p50 latency is mostly decode (many tokens); your p99 latency is often prefill (one user pasted a huge document). These have different mitigations and different capacity-planning math. Prefix caching is a latency/cost lever that's usually under-exploited.

**Google/Gemini callout:** Gemini's 1M+ context is a prefill story. Making that tractable likely combines efficient attention, aggressive caching, and specialized serving.

**Interactive HTML opportunity:** Prefill/decode timeline visualizer. User enters input length and output length; visualization shows time breakdown, bottleneck coloring, and what changes with/without prefix caching.

**Pre-read priming goal:** "Why does the first token of a response take so much longer than the rest? What is your LLM actually doing in those first few hundred milliseconds?"

**Study-prompt emphasis:** Prefill/decode mechanics, caching. Push on: "what's the arithmetic intensity of decode and why is it memory-bandwidth-bound?", "what's the tradeoff between batch size and tail latency?"

**Facilitator depth challenge:**
(a) Arithmetic intensity and the roofline model.
(b) KV cache memory math — how much memory does each token cost?
(c) Continuous batching mechanics and the effect on tail latencies.
(d) Prefix cache hit-rate tradeoffs in real deployments.

**Handoff:** "We know what's happening inside a request. Next: across many requests, and how servers make this fast at scale."

---

### Session 7 — Sampling and Serving

**One-line goal:** Understand sampling parameters and the serving-layer optimizations that make LLM inference tractable at scale.

**Time breakdown:**
- 0–10: Sampling knobs — temperature, top-p, top-k, greedy.
- 10–20: Speculative decoding — how it accelerates decode without changing outputs.
- 20–30: Continuous batching — the shift from static to continuous.
- 30–40: Paged attention — memory management lesson from OS paging.
- 40–45: Tradeoffs and closing.

**Concepts introduced:** sampling, temperature, top-p, top-k, greedy decoding, speculative decoding, draft model, continuous batching, static batching, paged attention, PagedAttention/vLLM lineage.

**Misconceptions:**
- *"Temperature = randomness."* Closer: temperature scales logits before softmax. Even at 0, outputs aren't perfectly deterministic due to hardware and batching effects.
- *"Top-p = top-k."* Different. Top-p is dynamic (cumulative probability); top-k is fixed count.
- *"Speculative decoding trades accuracy for speed."* No — it's exact. The draft model's guesses get verified against the main model.

**Likely questions:**
- *"What temperature should I use?"* Task-dependent. 0 for deterministic outputs (code, math). 0.7 for creative. Rarely above 1.
- *"Is greedy always best?"* For single-answer tasks, often yes. For diverse outputs, no.
- *"Can I get truly deterministic outputs?"* Surprisingly hard at scale. Batching effects, hardware nondeterminism.
- *"Is vLLM better than X?"* vLLM is the reference paged-attention implementation. Other frameworks have caught up. Depends on workload.

**Gloss:** Nucleus-sampling formal details, beam search (not used for chat LLMs), min-p, logit bias. Name-drop only.

**SRE callout:** Continuous batching is why serving throughput dwarfs naive batching. Larger batches = higher throughput but higher p99. This is a classic tail-latency-vs-utilization tradeoff SREs already know, just in a new domain.

**Google/Gemini callout:** Google likely uses internal serving infrastructure, not vLLM. But paged-attention-style ideas are reasonable to assume everywhere. Batching, caching, and speculative decoding are sources of competitive advantage.

**Interactive HTML opportunity:** Sampling parameter explorer. Same logits, different knobs, see the distribution shift. Plus a speculative-decoding animation (draft predicts 4, main verifies, 3 are kept).

**Pre-read priming goal:** "You've seen 'temperature' as a parameter. What's it actually doing? And how does one GPU serve hundreds of simultaneous users?"

**Study-prompt emphasis:** Knob semantics, spec decoding, continuous batching. Push on: "why does spec decoding speed up decode specifically?", "why is paged attention memory-efficient vs. naive contiguous KV cache?"

**Facilitator depth challenge:**
(a) Why temperature 0 isn't deterministic in practice.
(b) Draft-model selection for speculative decoding.
(c) MQA vs. GQA as serving optimizations.
(d) Chunked prefill and why it smooths tail latency.

**Handoff:** "We understand the model and how it serves. Time to wrap it in a harness and call it an agent."

---

### Session 8 — Agents I: The Loop and Tools

**One-line goal:** An agent is a model in a while loop with tools. Unpack every word.

**Time breakdown:**
- 0–10: The loop. While the model wants to keep going, it keeps going.
- 10–25: Tool schemas and tool calls — calls are just tokens matching a schema.
- 25–35: System prompts and context assembly.
- 35–45: Multi-turn state.

**Concepts introduced:** agent loop, harness, tool schema, tool call, tool result, system prompt, context assembly, multi-turn conversation, stateless model.

**Misconceptions:**
- *"Agents have memory."* The harness assembles context each turn; the model itself is stateless.
- *"Tool calls are a separate model mode."* No — they're structured output the harness intercepts.
- *"System prompts are magic."* They're the first tokens in context. Nothing more.
- *"The model decides to call a tool."* It outputs tokens matching a tool-call pattern; the harness does the dispatch.

**Likely questions:**
- *"How does the model know what tools are available?"* The harness includes schemas in the context, usually in the system prompt.
- *"Can the model call tools that don't exist?"* Yes. Hallucinated tool calls. Harnesses catch them with errors.
- *"Why does context window matter for agents?"* Long runs assemble a lot of context. Tool results, thinking, messages. It adds up.
- *"Who decides what goes in context?"* The harness — and you. This is context engineering, session 9.

**Gloss:** Specific tool-call formats (JSON vs. XML), specific frameworks (LangChain, ADK, etc.). Principles over flavor.

**SRE callout:** Agents are distributed systems with the model as one component. Every classical distributed-systems failure mode applies, plus new ones (model returns malformed tool call, tool call succeeds but result misinterpreted, retry storms). Treating the agent as "stateless function + harness" is the right mental model.

**Google/Gemini callout:** Gemini function calling is standard across the Google ecosystem; Vertex AI and the Agent Development Kit wrap it.

**Interactive HTML opportunity:** Agent-loop stepper. Click through: the model's turn, the tool call extracted, the tool invoked, result appended, next turn.

**Pre-read priming goal:** "Everyone talks about 'agents' as if they're new. But mechanically, what *is* an agent? What's different from a chatbot?"

**Study-prompt emphasis:** Loop, tool mechanics, system prompts. Push on: "what happens when tool-call depth exceeds context?", "how does tool choice actually get trained?"

**Facilitator depth challenge:**
(a) Tool-call training data and how schemas generalize to unseen tools.
(b) Parallel tool calls — how they work and when to use them.
(c) Agent-vs.-workflow distinction.
(d) Multi-agent systems basics.

**Handoff:** "We can build an agent. What makes it actually work over long horizons? That's context engineering."

---

### Session 9 — Agents II: Context Engineering and Failure Modes

**One-line goal:** Context engineering as a discipline, with common agent failure modes and how to mitigate them.

**Time breakdown:**
- 0–15: Failure mode catalog — loops, hallucinated tools, context rot, misinterpretation.
- 15–25: Context engineering as a discipline.
- 25–35: Long-horizon tasks. Compaction, memory strategies.
- 35–45: Evaluating agents.

**Concepts introduced:** context engineering, context rot, tool-call loops, hallucinated tools, long-horizon tasks, agent evaluation, agent observability, compaction.

**Misconceptions:**
- *"More context = better."* Often worse. Relevant context is what matters. Lost-in-the-middle is real.
- *"Prompt engineering = context engineering."* Prompt engineering is a subset. Context engineering includes what tools to expose, what to keep, what to compact, how to structure turns.
- *"Agent failures are prompt problems."* Often architectural — tool design, context assembly, harness logic.

**Likely questions:**
- *"Can we just add more context window?"* Helps some. Relevance and rot still apply.
- *"How do you test an agent?"* Hard. Task-level evals, trajectory analysis, human review. Active research area.
- *"What's the worst failure mode?"* Tool-call loops — the model calls the same tool repeatedly, misinterpreting each result.

**Gloss:** Specific eval frameworks. Principle-first.

**SRE callout:** Agent observability is a new discipline. You need per-turn visibility (tool called, result), trajectory visibility (loop shape), aggregate metrics (success rate per task type). Classical logging/tracing applies with new dimensions.

**Google/Gemini callout:** Google's Vertex AI agent evaluation and AgentSpace exist for exactly this. Worth a look for anyone deploying.

**Interactive HTML opportunity:** Failure-mode catalog with steppable examples — a loop, a hallucinated tool, a context-rot case. Very concrete.

**Pre-read priming goal:** "You've built an agent. It mostly works. But sometimes it does weird things — loops, ignores context, calls tools wrong. Why?"

**Study-prompt emphasis:** Failure modes, context-engineering principles. Push on: "taxonomy of agent failures", "how would you build an eval for agent reliability?"

**Facilitator depth challenge:**
(a) Trajectory-based eval techniques.
(b) Compaction/summarization strategies for long runs.
(c) Tool design principles (orthogonality, error messages as context).
(d) Known at-scale agent failure case studies.

**Handoff:** "Everything we've learned, in one end-to-end walk. Next session."

---

### Session 10 — Putting It All Together

**One-line goal:** Take one agent turn and walk it through every layer we've covered. Then look up to where the field is going.

**Time breakdown:**
- 0–25: End-to-end walkthrough of a single agent turn. At every layer, say "remember from session N." This is the ratchet closing.
- 25–35: Where the field is going — reasoning models, long context, multimodal, agentic systems, open research questions.
- 35–45: Catch-all Q&A, retrospective.

**Key move:** The walkthrough is the capstone. It should feel like watching dominoes fall — every concept previously introduced now has a visible role.

**Topics (go-forward):**
- Reasoning models (thinking tokens, RLVR scaling).
- Long context pushing past 1M.
- Multimodal (images, audio, video as tokens in the same residual stream).
- Agentic systems (multiple agents, long-running, enterprise).
- Open questions (interpretability, alignment, eval infrastructure).

**SRE callout:** The field moves fast. Which SRE skills age well? Systems thinking, observability, failure catalogs, capacity planning. What new skills emerge? Eval infrastructure, context management as code, LLM cost modeling.

**Interactive HTML opportunity:** The capstone artifact — the full end-to-end agent turn as a single clickable HTML document covering every layer. If only one interactive is built properly, this is a strong candidate.

**Pre-read priming goal:** "Bring one question you still have about how LLMs work."

**Study-prompt emphasis:** Full review, all sessions. Focus on gaps found during the course. Push on: "give me a live narration of a single agent turn from token ingest to tool output."

**Facilitator depth challenge:** Synthesis. Be ready to answer cross-cutting questions — how does training choice X affect serving optimization Y? Why do agents fail in ways predictable from the transformer's architecture?

**Handoff:** To the attendees — "Now you know how it works. The field will change. The foundations won't."

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Attendee frustration with theory-first | Acknowledge explicitly in session 1. Promise the payoff. Refer forward often. |
| Math anxiety | Minimal notation. Never use Greek letters without introducing them. |
| "Gemini does X" overclaim | Always hedge non-public architecture details as "widely believed" or "speculated." Enforcement isn't vibes — §10.1 is a mandatory one-pass web-grounded sweep over every Gemini claim before session production begins, §10.2 is a mandatory week-of revalidation per session. Both gates produce dated paper trails. |
| Content goes stale between drafting and delivery | Three-layer defense (§10): (1) durability-first content principle (§2) keeps the body in 5–10+ year fundamentals; (2) week-of revalidation (§10.2) catches drift in the time-sensitive claims that remain; (3) a per-session "Recent SOTA callout" segment (§10.3) isolates the frontier-news content into a single hot-swappable slide block. |
| Facilitator gap exposed by a sharp question | "Let me get back to you" is fine. Study prompts minimize but don't eliminate this. |
| Running out of time | Pre-identify a cuttable 5-min segment per session. |
| Q&A derails | 15-min Q&A with parking-lot flip chart. Facilitator's guide flags on-topic vs. next-session vs. out-of-scope. |

## 8. Facilitator Deepening Reading List

For personal prep beyond attendee level:

- **3Blue1Brown's "Neural networks" series**, especially the transformer episode. Best visual treatment available.
- **Karpathy's "Let's build GPT"** and **"Let's build the GPT tokenizer"** (YouTube). Hands-on forward pass.
- **Anthropic's Transformer Circuits Thread** (transformer-circuits.pub). Interpretability, deep but readable.
- **"Attention Is All You Need"** (Vaswani et al. 2017). Actually read it.
- **Chinchilla paper** (Hoffmann et al. 2022). Scaling laws you'll reference.
- **vLLM / PagedAttention paper** (Kwon et al. 2023). Serving foundations.
- **GPT-3 paper** ("Language Models are Few-Shot Learners"). Emergence framing.
- **Anthropic's "Building effective agents"** post. Current best-practice agent framing.
- **Google's Gemini technical reports** (1, 1.5, 2+). Read what they do and don't say about architecture.

## 9. Deliverables Checklist (per session)

Before each session, produce:

- [ ] **Slide deck** (Slidev source; see §11 for framework decision and repo layout) — includes inline speaker notes, hidden appendix slides for likely-questions / backup deep-dives, and a dedicated **Recent SOTA callout** segment (see §10.3)
- [ ] **Facilitator's guide** (the richer pre-session prep artifact — per-slide: what's on slide → what you say → what they'll ask → traps → where to defer. Slidev's inline `<!-- -->` notes are a terse at-the-podium *subset* of this.)
- [ ] **Pre-read** (1,000–1,500 words, primes questions not answers)
- [ ] **Study prompt** (paste-ready for Claude, adaptive, covers session + cumulative)
- [ ] **Fact-check report** (week-of, web-grounded, sourced; see §10.2 for workflow)

*Interactive demos referenced by the deck live in `/demos/<name>/` as standalone apps, not as deliverables-per-session. Each demo is built once, embedded in whichever session needs it, and remains independently linkable post-lecture. See §11.*

*Not in this document: the deliverables themselves. Those are produced session by session, starting with session 1.*

## 10. Fact-Checking and Currency Workflow

Three layers of defense against staleness and overclaims, working together:

**10.1 One-pass Gemini verification (whole-outline, done once before deliverables begin).**
Every Gemini-specific claim currently in the outline is hedged from facilitator memory. Run a single web-research pass that produces a sources-table covering: TPU generations used (training and serving), tokenizer family, context window specifics, function calling / tool use, MoE status (confirmed vs widely-believed vs speculation), AgentSpace / Vertex AI agent tooling, multimodal support, anything else the outline asserts. Output: a markdown table with claim → status (confirmed / widely-believed / speculation / outdated) → source(s) → corrected hedging language → **last-verified date**. Used to recalibrate every Gemini callout during the per-session rewrite, and serves as facilitator-training material. Snapshot the date this sweep is performed; entries older than ~60 days at delivery time, or any entry where the underlying vendor has shipped a relevant release since, must be re-checked in §10.2.

**10.2 Week-of revalidation (per session, the week before delivery).**
Timing matters: this is not "after artifacts are drafted" but "the week of presentation." Scope: every time-sensitive factual claim in the session's artifacts — model specs, version numbers, benchmark figures, vendor capabilities, context window sizes, pricing, anything that could have moved since drafting. Cross-reference against the §10.1 ledger (any claim past its 60-day window or with a vendor release in the interim gets re-checked). Required gate before delivery. The point is not skepticism for its own sake — it's that overclaims to a Google SRE audience erode credibility for the rest of the course.

**Fact-check doc format (per session, `sessions/NN-.../fact-check.md`):** A simple table — *claim* (verbatim from artifact) → *status* (confirmed / widely-believed / speculation / outdated) → *source(s)* (URL + publisher + date) → *pull quote* (verbatim excerpt where the source succinctly validates the claim — quote the source, don't paraphrase) → *last-verified date* → *corrections applied* (if any). Pull quotes are required when a single sentence from the source nails it; not required where validation needs synthesis across multiple sources (note "synthesis" in the pull-quote column instead). Keep it terse — this is a paper trail, not a research paper.

**10.3 Recent SOTA callout (per session, content slot).**
Each session includes an explicit segment — typically 2–4 minutes, placed where it fits the narrative — covering relevant SOTA developments from the **last week to month**. Examples: a model release that bumps a benchmark covered in the session, a paper that complicates or confirms a claim, a serving-stack improvement that changes the cost math. Compiled the same week as §10.2 revalidation (same research swing). Lives in its own slide(s) so it can be hot-swapped without touching surrounding material. Signals that the course tracks the field; keeps fundamentals-first content from feeling frozen-in-amber.

**Sourcing standards:** primary sources first (vendor docs, technical reports, papers), reputable secondary second (well-cited blog posts, conference talks). Avoid LLM-generated summaries as sources. When a claim is "widely believed" but unconfirmed, name the believers (which labs / which credible analysts).

**Decision log — fact-checking workflow (2026-04-20):** Three-layer staleness defense. Added §10 and the 5th deliverable. Reason: outline hedges Gemini claims from facilitator memory; audience is Google SREs who will catch overclaims; LLM-specifics rot fast. The strategy is durability + week-of revalidation + explicit "what's new" segment. Layer 1 (one-pass) fixes the existing outline's claims and produces a dated ledger. Layer 2 (week-of) catches drift just before delivery and is timed deliberately late so it captures last-minute releases. Layer 3 (SOTA callout) inverts the staleness problem — instead of trying to keep the body fresh, isolate freshness into its own slot where it belongs. Together with the durability-first content principle (§2), the course's body ages slowly and the dated parts are clearly marked as such.

## 11. Production Stack and Hosting

**Framework:** Slidev for all slide decks. **Hosting:** GitHub Pages, deployed via GitHub Actions. **Interactive demos:** first-class standalone apps under `/demos/<name>/`, embedded into slides via iframe and also discoverable independently through a `/demos/` gallery index.

**Decision log — slide framework and demo architecture (2026-04-20):** The "wow" factor for this course compounds *after* the lecture — people should be able to click around demos on their own, share links, screenshot interesting configurations. That points at two architectural moves, independent of framework choice:

1. **Demos are standalone apps with their own URLs**, not buried inside slide-mode. Embedding in slides is one use case; the demo must also stand on its own.
2. **Two-way navigation** between deck and demo: from a slide, "open standalone"; from a demo, "seen in Session N, slide M." Plus a `/demos/` index gallery so the collection is browsable without knowing which session introduced what.

Within that architecture, Slidev is the right authoring framework because its ergonomics (Markdown-first + hot reload + Vue component slots + first-class presenter mode with inline speaker notes + Monaco + Mermaid + LaTeX) give the fastest iteration loop. Framework choice isn't the bottleneck for wow — demo polish and discoverability are — but faster iteration translates into more polish per demo, which is the indirect edge. Reveal.js is a viable fallback with longer battle-testing but slower authoring; Spectacle is only worth it if every demo is React-tight.

**Repo layout:**
```
life-of-an-agent/
├── sessions/
│   ├── 01-foundations-i/
│   │   ├── slides.md              (Slidev source; speaker notes inline as <!-- --> blocks; hidden appendix slides for likely-Qs and backup deep-dives)
│   │   ├── facilitator-guide.md   (richer pre-session prep; Slidev notes are a terse subset of this)
│   │   ├── pre-read.md
│   │   ├── study-prompt.md
│   │   └── fact-check.md          (§10.2)
│   └── ...
├── demos/
│   ├── tokenizer-explorer/        (standalone Vite app; own URL)
│   ├── attention-viz/
│   ├── prefill-decode-timeline/
│   └── ...
├── web/
│   ├── index.md                   (course landing page — syllabus + session cards)
│   └── demos.md                   (gallery index — filterable by session/topic)
└── .github/workflows/
    └── deploy.yml                 (builds Slidev decks + demos, deploys to Pages under one site)
```

**Two-way navigation:**
- Each slide embedding a demo shows it in an iframe with a visible "↗ open standalone" link in the corner.
- Each demo page has a breadcrumb — "↩ introduced in Session 3, slide 7" — deep-linking back to the slide.
- `/demos/` index: gallery view with session tags, one-line descriptions, and animated/static previews. Filterable.
- Demos accept URL-param state (e.g., `?text=hello+world`, `?layer=5`) so a shared link lands on a specific configuration. This is what makes post-lecture screenshots into actual links.

**Speaker notes and backup content:**
- **Inline speaker notes** — Slidev `<!-- -->` blocks per slide. Terse at-the-podium prompts. The facilitator's guide (separate file) is the richer prep artifact; Slidev notes are a subset of it, extracted or hand-curated for brevity during live presentation.
- **Backup / "likely questions" slides** — Slidev's `hide: true` frontmatter + appendix sections. Pre-answered deep-dives for each session's predicted questions. Not in the main linear flow; navigable via the presenter UI if the question lands.
- **Presenter mode** — Slidev's presenter UI shows current slide + next slide + notes + timer in a separate window. Attendees see the clean deck.

**Visual coherence:** one shared Slidev theme across all 10 sessions (palette, typography, transitions). Demos use a shared style wrapper (CSS variables) so embedded-in-slide and standalone experiences feel unified.

**Hosting and deploy:** GitHub Pages. GitHub Actions workflow builds each Slidev deck and each demo independently, composes them under one Pages site. Push-to-main triggers deploy. Staging previews via PR deploy-previews if needed later.

**Decision log — hosting and demo as first-class artifacts (2026-04-20):** GitHub Pages is the right call because the repo is already on GitHub, hosting is free, and every artifact is static. Demos being first-class (not slide-embedded only) resolves the "wow compounds after the lecture" requirement directly: people click around, share configurations, and the course becomes a persistent reference rather than a one-shot talk. The two-way navigation (slide ↔ demo) preserves pedagogical context — you can find a demo standalone *or* trace it back to where it was taught.
