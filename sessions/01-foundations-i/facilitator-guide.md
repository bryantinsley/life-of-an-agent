# Facilitator's Guide — Session 1

**Foundations I: From Text to Vectors.** 45-min content, 60-min slot. Visual-first; four interactive demos carry the pedagogy.

This guide is your pre-session prep companion. The Slidev `<!--  -->` notes are the at-the-podium prose; this is the richer source of truth for *what to study before standing up* and *what to anticipate in the room*.

---

## Tone-setting reminders before you walk in

- **The promise of S1 is experiential, not just technical.** Attendees should leave thinking *"I learned a lot, and I can't wait for next week."* The technical content matters; the emotional throughline matters at least as much. If you have to choose between exhaustively covering one of the four sub-topics and protecting the demo time, protect the demo time.
- **The agent-loop demo at minute 0 is a *promise*, not an explanation.** You are not yet trying to explain what is happening; you are showing them the layered system they will be taking apart. Resist the instinct to over-narrate.
- **Acknowledge the theory-first frustration up front.** Some attendees — especially the ones who use LLMs heavily and have been wanting "the real thing" — will feel like S1–S4 are taking forever to get to agents. Naming this defuses it. The "Warning + Promise" slides exist for exactly this reason.
- **Recording is internal.** You can speak more candidly on-camera about Gemini specifics, Google infra, etc. Public artifacts (slides, narrative, demos) must hew to the §10.1 ledger hedging. Do not let a candid aside leak into a checked-in artifact.
- **Demos are the highest rabbit-hole risk.** Each interactive has a hard time cap. If the room wants to keep playing with the tokenizer, the answer is *"the demos ship to you after, play with it tonight; we have to move on."* This is non-negotiable for keeping the 45-min budget intact.

---

## Per-slide guide

### Slide 1 — Title

- **On the slide**: Title, session number, link to narrative companion, demo URL.
- **What you say**: One-sentence framing — "This is the first of ten sessions on how LLMs and agents actually work. Tonight is the foundation."
- **Likely Q**: "Are slides shared after?" → Yes, plus a narrative companion + the four demos as standalone pages, all in the team folder by Friday. Recording stays internal.
- **Trap**: Don't start the first technical slide before getting the agreement that this is theory-first. Without the warning + promise, the second half will feel grindy.

### Slide 2 — Section break: "Before we start — a warning and a promise"

- **What you say**: Just title-slide framing. Two pieces of housekeeping.

### Slide 3 — The warning

- **On the slide**: Theory-first; agents come at the end; "some of you will get frustrated."
- **What you say**: Cover *why* opposite to other LLM courses. SREs are systems thinkers; foundations-first ought to compound for them. Concede early frustration is a feature, not a bug.
- **Likely Q**: "Is this going to be useful for me right now, or only by S10?" → Both. S5–S6 (prefill/decode, serving) is operational gold even if you stopped there.
- **Trap**: Don't oversell or apologize. Confident frame: this is the right shape for this audience.

### Slide 4 — The promise

- **On the slide**: The S10 capstone walkthrough — token in → embedding → attention → residual → logits → sampling → tool call → harness → result.
- **What you say**: That sentence is literally what S10 is. Every word will mean a specific mechanical thing by the end.
- **Likely Q**: "Why is this in this order?" → It isn't the order they execute in production exactly; it's the order they were *designed* in. We learn the bottom of the stack first because the top depends on it conceptually.
- **Trap**: Don't list every session here — that's the next slide. This is just the *promise*.

### Slide 5 — The four mental models (residual stream / "all just tokens" / training-vs-inference / prefill-vs-decode)

- **On the slide**: All four named, two-by-two layout.
- **What you say**: Foreshadow each in one sentence. These four ideas come back so often that naming them up front is part of the scaffolding.
- **Likely Q**: "Why these four specifically?" → Because they are the framings that turn a black box into a system. Each one resolves a specific class of confusion.
- **Trap**: Do not start explaining any of them in detail. Naming only. Set expectation: you'll see all four called by name throughout the course.

### Slide 6 — Section break: "Part 1 — What an agent actually is"

- 10 minutes for this section. Demo + framing + map of upcoming sessions.

### Slide 7 — Agent-loop demo (iframe to `/demos/agent-loop/`)

- **On the slide**: Iframed standalone demo of one full agent turn.
- **What you say**: Don't try to explain. Click through, narrate the *structure*: model emits → harness intercepts → tool runs → result inserted → next turn. Name the loop. Acknowledge the words people don't know yet.
- **Hard time cap**: 6–7 minutes max. Move on even if hands are up.
- **Likely Q**: "What's that JSON-looking thing?" → Tool call. Just structured tokens the harness recognizes. We'll bottom that out in S7.
- **Likely Q**: "Why does the model 'decide' to call a tool?" → Trained behavior. Comes from the post-training data. S5.
- **Trap**: People will want to ask about specific tool ecosystems (LangChain, ADK, MCP). Defer with: "We'll spend three sessions on the agent harness; tonight is the *promise*, not the deep dive."

### Slide 8 — "What you just saw — every layer is a session"

- **On the slide**: Two-column list mapping the layers to the 10 sessions, with the cadence note (4 weekly + 1-month gap + 6 weekly).
- **What you say**: Walk the list. Spend a sentence each. Land the cadence — there's a one-month gap after S4 by design; we'll talk about why when we get there.
- **Likely Q**: "Why a one-month gap?" → "S1–S4 answer 'how did this thing come to be'; S5–S10 answer 'how does it run.' Gap lets the first arc compost." (Don't dwell — this is a closing-flavored slide.)
- **Trap**: Don't justify the curriculum design here. They're going to feel it through the experience; arguing about pedagogy is a distraction.

### Slide 9 — Section break: "Part 2 — Tokens"

- 10 minutes for tokenization. Setup → demo → debrief → SRE callout → Gemini callout.

### Slide 10 — "The model never sees text. It sees integers."

- **On the slide**: Example string → tokenizer → integer list.
- **What you say**: This is the bottom of the stack. Every API call begins here. Tokenizer is bundled with the model but is a separate piece of software, not learned the same way as weights.
- **Likely Q**: "Could the model learn its own tokenizer?" → Some research goes there (BPB, byte-level), but the compute tax pushes against it for general-purpose models. Backup slide if pressed.
- **Trap**: Don't get pulled into the SentencePiece-vs-tiktoken-vs-WordPiece comparison shopping. The *principle* is the same across all of them; vendor differences matter at the margin.

### Slide 11 — "Why not characters? Why not words?"

- **On the slide**: Two-column tradeoff.
- **What you say**: Walk both alternatives. Land the BPE intuition: "merge the most common adjacent pair, repeat."
- **Likely Q**: "What about WordPiece / Unigram / SentencePiece?" → All variations on the same theme — sub-word tokenization with different merging heuristics. SentencePiece is the library Google uses; it supports BPE among others.
- **Trap**: The phrase "merge the common pairs" is the *whole* algorithm at intuition level. Resist the urge to derive the algorithm.

### Slide 12 — Tokenizer demo (iframe to `/demos/tokenizer-explorer/`)

- **On the slide**: Live BPE running in-browser. Real tokens.
- **What you say**: Three things to try and walk through: your name, an emoji, code, a non-English sentence. Let the count balloon visibly.
- **Hard time cap**: 6 minutes for the demo. Save 2 minutes for the debrief slide.
- **Likely Q**: "What tokenizer is this?" → Identify what model the demo loads (likely a GPT-2-family BPE — explicit in the demo's footer). Note that the *family* of tokenizers is similar across major frontier models.
- **Trap**: The room will want to keep playing. Cut firmly. "It's yours after; we have to move."
- **Trap**: Do *not* try to explain tokens-per-cost math live with arithmetic. The point lands visually; arithmetic kills the energy.

### Slide 13 — "What you should have noticed"

- **On the slide**: Five takeaways — tokens ≠ words, capitalization matters, non-English costs more, code is weird, emoji are expensive.
- **What you say**: Each one in a sentence. The point is *naming what they just felt*.
- **Trap**: This is recap, not new content. Stay tight.

### Slide 14 — SRE callout: tokenization is a billing failure mode

- **On the slide**: The log-pipeline-format-change story.
- **What you say**: This is a real incident shape. Bytes don't predict tokens; you have to monitor tokens directly.
- **Likely Q**: "Is there a good library for token-counting cheaply?" → Yes; every major API publishes one (tiktoken for OpenAI, the SentencePiece library for Gemini/Gemma, etc.). They're cheap; you can run them locally before the API call.
- **Likely Q**: "What's the multilingual cost ratio in practice?" → Roughly 3–5× depending on script. Specifics vary by tokenizer; benchmark before you commit to a market.
- **Trap**: Don't editorialize about whether per-token billing is fair. That's a different conversation.

### Slide 15 — Gemini callout: SentencePiece, ~256K vocab, shared with Gemma

- **On the slide**: One-paragraph hedged statement of what's public.
- **What you say**: Mostly read the slide. This is *worth naming, not worth dwelling on*. Three sentences, then move.
- **Source**: §10.1 ledger row 1; cite `fact-check.md` row 1 if anyone asks.
- **Likely Q**: "Why is the Gemini vocabulary that big?" → Larger vocabulary tokenizes more efficiently for non-Latin scripts; Gemma 3's release notes specifically credit it with better Chinese/Japanese/Korean encoding. Tradeoff is bigger embedding table.
- **Trap**: Do not speculate about *training* details — only the tokenizer is public. If asked about the training corpus, defer to "Google has not published that."

### Slide 16 — Section break: "Part 3 — Embeddings"

- 10 minutes. Setup → embedding table → demo → analogy caveat → dimensions → static-vs-dynamic.

### Slide 17 — "The first layer is a lookup table"

- **On the slide**: Token ID → vector. Mention 4,096 / 12,288.
- **What you say**: Embedding table is parameters; one row per token in vocabulary. Lookup is mechanical. After this layer, the model never refers to integer IDs again — only vectors.
- **Likely Q**: "How does the table get learned?" → Same gradient that updates everything else. Backup slide if pressed.
- **Likely Q**: "How big is GPT-3's embedding table?" → ~50K vocab × 12,288 dim ≈ 600M parameters just for the table. (Source: §10.1 ledger row 2, GPT-3 paper.)
- **Trap**: People want to know the dimensions of Gemini. They are not public. Say so.

### Slide 18 — "The vectors carry meaning" + embedding-scatter demo

- **On the slide**: Iframed 2D PCA projection.
- **What you say**: This is a real word-embedding space (probably GloVe or word2vec or similar in the demo) projected to 2D. The original is hundreds of dimensions; the squashing loses a lot but enough survives to make the point. Hover, zoom, see clusters.
- **Hard time cap**: 6 minutes for demo + analogy debrief, 4 minutes for the rest of Part 3.
- **Likely Q**: "Are these the same as the embeddings inside an LLM?" → Spiritual cousins. The mechanism is the same (lookup → vector); the *training pressure* is different (older word-embedding models like word2vec/GloVe were trained specifically for similarity properties; LLM embeddings are trained as part of next-token prediction). The geometry survives; the analogy magic is fuzzier in modern LLM tables.
- **Trap**: Don't oversell king-minus-man-plus-woman. It works for *some* analogies, not all. Modern transformer embedding tables are messier than word2vec's.

### Slide 19 — "What this is, and what this isn't"

- **On the slide**: Two-column nuance.
- **What you say**: Important framing — the model's representation is *useful*, not *clean*. Don't let attendees walk out thinking the model has a literal mental ontology.
- **Likely Q**: "What does the model 'really' know?" → Backup slide on understanding. There's a real philosophical debate; the operational answer is "behaves as if it understands; fails predictably."
- **Trap**: This is the slide where philosophy can swallow 10 minutes. Park it: "Big topic; I have a backup slide. Let's hold it for the end."

### Slide 20 — Section break: "Part 4 — The residual stream"

- 10 minutes for the section. The most important conceptual takeaway of S1.

### Slide 21 — "The residual stream — picture it"

- **On the slide**: ASCII diagram showing positions × layers, additive structure.
- **What you say**: This is the single most important picture. Walk it slowly. Each block reads the stream and *adds* — does not replace. The vector at each position is *cumulative*. This additive structure is why training very deep transformers works.
- **Likely Q**: "Why additive specifically?" → ResNet trick from 2015. Gradient flow + compositional behavior. We don't need to defend it tonight; the picture is what matters.
- **Likely Q**: "Are all the blocks really identical?" → Architecturally yes; learned weights differ. Each layer has the same *operations*; the *specific things they compute* are emergent.
- **Trap**: Don't try to explain attention here. Resist. That's the cliffhanger.

### Slide 22 — "Watch one position evolve" (residual-stream-animator demo)

- **On the slide**: Iframed animator playing back real GPT-2 small activations.
- **What you say**: This is real — not a stylized animation, actual intermediate activations from a 12-layer transformer that we ran ahead of time and recorded. The colored deltas are what each block contributed. Notice they're mostly small; the stream gets *refined*, not rebuilt.
- **Hard time cap**: 5 minutes. Save 5 minutes for the cliffhanger + closer.
- **Likely Q**: "What are the early/middle/late layers actually doing?" → Loose interpretability framing — early do low-level features, middle do composition, late shape for prediction. Don't defend in detail; flag interpretability as a research subarea.
- **Trap**: People will ask about specific interpretability claims (induction heads, feature circuits). Park: "S2 will touch attention heads; deeper interpretability is a course-of-its-own."

### Slide 23 — "What's next time"

- **On the slide**: The cliffhanger — each block decides what to add by reading other positions; that's attention.
- **What you say**: Tease attention. Tease the FFN. Land that the residual stream is where everything we've learned lives.
- **Trap**: Don't start explaining attention. The cliffhanger is the whole point.

### Slide 24 — Section break: "The territory"

- 5 minutes. Map walk + closing.

### Slide 25 — The map

- **On the slide**: ASCII diagram of the full inference architecture, with session annotations.
- **What you say**: Walk it. Bottom four rows you can now read. Middle is S2/S3. Top is S3/S6. Outside the picture is training (S4), production (S5–S6), agents (S7–S9), capstone (S10).
- **Trap**: This is the *anticipation engine*. It is not the time to teach anything new. Resist the urge to start explaining the unrecognized parts. The recognition pattern — "I can read more of these labels than I could an hour ago" — is what makes them want to come back.

### Slide 26 — "Where we are"

- **On the slide**: Two-column recap + roadmap.
- **What you say**: One pass through what they learned, one pass through what's coming. End on attention as the next session.
- **Trap**: Don't summarize too long. Two minutes max.

### Slide 27 — Closing slide

- **On the slide**: "See you next week" + links.
- **What you say**: Distribution links — slides + narrative + demos on Pages, recording link in calendar invite. Optional study prompt is in the team folder; explicitly enrichment, not homework.

---

## Backup slides — when each lands

The hidden appendix slides are all in `appendix.md`. Reachable via Slidev's presenter UI (slide grid). Memorize roughly where each lives so you can jump cleanly:

- **Why not byte/character?** — for "could the model learn its own tokenizer" / "ByT5" questions.
- **Weight tying** — for "do input and output embeddings share weights?" / "how many parameters in the embedding table?"
- **Positional encoding** — only if pushed. The honest answer is "S2."
- **Tokenizer-free models** — for the multilingual-fairness question, which is increasingly common.
- **How does the embedding table get learned?** — for "where does the geometry come from?" Often paired with the king-minus-man question.
- **What does 'understand' mean?** — for the philosophy attempt. Park politely; offer the backup.
- **Tokenizer swap consequences** — operational question, mostly comes from people who've been bitten by it.
- **Token cost pricing** — pricing-model questions; ties forward to S5/S6.
- **Context window** — for "what's the limit and why?" Forward-pointer to S2 and S8.

---

## What to study before the session

If you want to over-prepare, these are the genuinely useful pre-session reads:

1. **Karpathy, "Let's build the GPT tokenizer"** (YouTube, ~2 hours). The single best preparation for being asked anything about BPE in the room. Worth watching at 1.25× the night before if you have time.
2. **The §10.1 claims ledger** at `notes/claims-ledger.md`. Every Gemini callout is sourced there. If you get a follow-up question, you should already know the source you'd cite.
3. **The Gemma 3 tokenizer release notes** (HuggingFace blog) — for the Gemini SentencePiece details. ~5 minutes.
4. **Lost in the Middle** (Liu et al., arXiv:2307.03172) — for the long-context caveat that may come up early. Skim the abstract + section 4. ~10 minutes.
5. **Bonus**: 3Blue1Brown's transformer episode. Best visual treatment of attention you'll encounter; it ages well as a reference for the next four sessions too.

---

## Facilitator depth challenge — be ready to answer

(Per outline §6 S1. Expected to be 3× attendee depth — they won't ask, but a sharp one might.)

- **What's weight tying and why does it matter?** — The input embedding and output unembedding can share weights (transposed). Saves parameters, helps small models. Modern frontier models often untie. Backup slide.
- **Why does vocabulary size affect both model size and inference speed?** — Vocab × d_model = embedding-table parameter count (often hundreds of millions to billions). At inference, the unembedding step computes a logit per token in the vocabulary, so the final matmul is also vocab-sized. Larger vocab = bigger model + slower output head + potentially better tokenization efficiency.
- **What breaks if you swap the tokenizer after training?** — Catastrophically. The embedding table maps integer IDs to learned vectors; if ID 47291 means something different to the new tokenizer, the model is looking up the wrong row for everything. Backup slide.
- **Are there tokenizer-free models and what are their tradeoffs?** — Yes (ByT5, MambaByte, SentencePiece byte-fallback). Pros: no tokenizer-specific bugs, robust to OOV/typos/rare languages. Cons: 4–5× longer sequences for the same content, more compute per document, early layers waste capacity reassembling bytes into useful units. Mainstream models still use BPE because the per-document compute tax is real at scale. Backup slide.

---

## Cuttable segment (per outline §7 risk register)

If running long, the cuttable segment is the **Gemini callout slide (Slide 15)**. It is "worth naming, not worth dwelling on" by design; it can be condensed to a single sentence on the previous slide if needed. Do *not* cut a demo segment — they are the pedagogy.

---

## End-of-session housekeeping

- Confirm the team-folder distribution link before walking out.
- Note any questions that landed in the parking lot for next-session prep.
- Tag any moment where the §10.1 ledger language wasn't quite right; corrections feed into the §10.2 fact-check on subsequent sessions.
- Note the time budget actuals per section — calibration data for S2.
