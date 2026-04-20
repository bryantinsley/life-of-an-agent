# Handoff: SRE LLM Course Project

**Purpose of this document:** Everything a new Claude session needs to continue building this 10-session SRE course on how LLMs and agents work, at the same quality level as the originating conversation. Read top to bottom before producing anything.

**Project repo layout (locked; see outline §11):**
```
life-of-an-agent/
├── HANDOFF.md                    ← this file
├── course_master_outline.md      ← the master doc (authoritative)
├── sessions/
│   ├── 01-foundations-i/
│   │   ├── slides.md             ← Slidev source; speaker notes inline as <!-- --> blocks, authored as narrative prose
│   │   ├── facilitator-guide.md  ← richer pre-session prep (Slidev notes are a subset of this)
│   │   ├── pre-read.md           ← S1 bespoke; S2+ are thin pointers to prior narrative + optional links
│   │   ├── study-prompt.md
│   │   ├── fact-check.md         ← week-of, web-grounded, sourced (§10.2)
│   │   └── narrative.md          ← post-session companion; linked from slide 1; derived from speaker notes + enrichment (§11)
│   ├── 02-attention/
│   └── ...
├── demos/                        ← first-class standalone interactive demos
│   ├── tokenizer-explorer/       ← own URL, embedded in S1 via iframe
│   ├── attention-viz/
│   └── ...
├── web/
│   ├── index.md                  ← course landing page (syllabus + session cards)
│   └── demos.md                  ← gallery index (filterable by session/topic)
├── .github/workflows/
│   └── deploy.yml                ← builds decks + demos, deploys to GitHub Pages
└── notes/
    ├── claims-ledger.md          ← §10.1 one-pass Gemini verification output
    └── decisions.md              ← running log of changes
```

---

## 1. Project Summary

Bryan is an SRE at Google building a 10-session internal course teaching his team how LLMs and agents actually work. Each session is 1 hour: 45 min material, 15 min Q&A. The course is theory-and-foundations-first, software-engineering-last — deliberately modeled on old-school CS curricula rather than the current "how to prompt" style. Agents come at the end, after the attendees understand the transformer from tokens up.

The six per-session deliverables are:

1. **Slide deck** (Slidev source, interactive demos via iframe to `/demos/<name>/`)
2. **Facilitator's guide** (annotated with speaker notes, expected questions, traps)
3. **Pre-read** — S1 bespoke (~1,000–1,500 words, primes questions not answers); S2+ are thin pointers to the prior session's narrative + 1–3 optional external links
4. **Study prompt** (paste-ready, asks Claude to quiz Bryan adaptively, cumulative across sessions; framed as optional enrichment, not a corequisite)
5. **Fact-check report** (week-of, web-grounded, sourced; see outline §10.2)
6. **Narrative companion** (post-session doc linked from slide 1; derived from speaker-notes-as-narrative + enrichment; see outline §11)

Bryan's stated goals, in his words:
- "Build as much depth as you can without assuming everyone walks out as an ML researcher."
- "I want to make sure that I know the material at least 3x better than they do."
- "A forcing function for extending my expertise."
- "Sets the stage and primes the mind with appropriate scaffolding so they'd be ready to absorb and engage the material better."

## 2. Read These First, In Order

1. `course_master_outline.md` — the authoritative structure for all 10 sessions. Includes per-session goals, time breakdowns, concepts, misconceptions, likely questions, SRE callouts, Gemini callouts, HTML opportunities, pre-read priming goals, study-prompt emphasis, and "facilitator depth challenges" (the 3× stretch material).
2. This document's Section 4 (Decisions and Rationale) — do not skip.
3. This document's Section 7 (Anti-patterns) — especially do not skip.

## 3. Current Project State

- **Done:** Master outline, complete, in `course_master_outline.md`.
- **Not done:** All per-session deliverables. Session 1 was about to be produced when this handoff was initiated.
- **Open questions:** See Section 3a below. These are unresolved and must be asked before producing session 1.
- **Pending pre-production work (mandatory before any session artifacts):**
  - **One-pass Gemini verification sweep (§10.1 of master outline).** Web-grounded research pass over every Gemini/Google-infra claim currently in the outline — TPU generation lineage, tokenizer family, context window specifics across Gemini variants, MoE status, function-calling/AgentSpace specifics, multimodal support, training-hardware claims. Produces `notes/claims-ledger.md` with claim → status → source(s) → corrected hedging → **last-verified date**. Entries with last-verified > ~60 days at delivery time, or with an intervening vendor release, must be re-checked in §10.2. Outline rewrite (sessions 4, 7, 8, 9) uses this ledger as authoritative. Sweep scope also covers the TPU-vs-GPU architectural thread — consolidated into one ~10-min S5 block (with a one-line S4 forward-reference) covering why GPUs dominate training, why TPUs compete on inference, and where Apple Silicon fits. Doubles as Bryan's own training on cross-vendor architectural distinctions.
  - **Three-layer staleness defense baked into production cadence (§10).** (a) Durability-first content principle (§2) — the body of every session lives in 5–10+ year fundamentals; vendor specifics and benchmark numbers are kept thin and isolatable. (b) Week-of revalidation (§10.2) — the 5th deliverable, run the week of presentation (not at draft time) so it captures last-minute releases. Produces `sessions/NN-.../fact-check.md` with sources, corrections, and a fresh last-verified date. Gating: no session ships without it. (c) Recent SOTA callout (§10.3) — every session includes a 2–4 min content slot covering relevant developments from the last week-to-month, compiled in the same research swing as the §10.2 revalidation. Lives in its own slide(s) so it's hot-swappable.

### 3a. Open Questions — All Resolved (2026-04-20)

All six questions originally posed to Bryan have been resolved. Keeping the full record below for future-handoff traceability; see the decision logs in the master outline (§3 arc shift, §3b cadence, §6 S1 scope, §10 fact-checking, §11 slide framework / narrative / recording / safety scope) for the authoritative decisions. The "Why this matters" notes are preserved so a future handoff can see the decision context, not just the outcome.

**Resolved decisions in one glance:**
- Q1 (arc balance) → shifted to 3 agent sessions; S4+S5 of original outline merged into one S4 "Training" that surveys RL. Capstone preserved at S10. See outline §3 decision log.
- Q2 (S1 scope) → 45-min content / 60-min slot as the universal budget; S1 is 4 × 10-min interactives + 5-min territory closer with the architecture map moved from opening scaffolding to anticipation-engine. See outline §6 S1 decision log.
- Q3 (Gemini verification) → three-layer defense: one-pass ledger (§10.1) + week-of revalidation (§10.2, 5th deliverable) + SOTA callout segment (§10.3). TPU/GPU/Apple Silicon arc consolidated into one ~10-min S5 block.
- Q4 (depth target) → 3× confirmed as stated; no change.
- Q5 (safety/alignment) → omitted from the public course entirely. Any safety coverage is off-the-cuff in the room or in a separately-crafted internal session outside this repo. See outline §11 safety-scope decision log.
- Q6 (logistics) → (a) slides + narrative + recording link distributed post-session; slide 1 of the deck links to the narrative; (b) recorded, internal-only — allows moderate slide text density and more candid on-camera tone, with strict discipline that candid content stays out of public artifacts; (c) cadence is 4 weekly + 1-month gap + 6 weekly; study prompts are explicitly optional enrichment, not a corequisite, especially across the gap. See outline §2 delivery row, §3b cadence, §11 recording-and-narrative decision log.

---

**Original open-questions section preserved below for traceability. Do not re-ask. Questions marked BLOCKER were resolved before any session deliverables were produced.**

**1. [BLOCKER] Arc balance — is agents getting enough time?**
Sessions 8–9 currently give agents ~90 min total at the end of a 10-session course. Given agents are what attendees actually use day-to-day, that may be light. Options:
- (a) Keep as-is. Foundations pay off; 90 min is enough.
- (b) Split session 9 — context engineering as its own session, failure modes and evals as another, capstone pushes to session 11.
- (c) Something else.
*Why this matters first:* affects total session count, which affects everything downstream.

**2. [BLOCKER] Session 1 scope — is 45 min realistic for the current content?**
Session 1 currently packs: 10-min agent-loop preview, 5-min architecture/inference map, 10-min tokenization, 10-min embeddings, 10-min residual stream. That's tight. Options:
- (a) Keep it tight; first session runs slightly long if needed.
- (b) Cut the architecture/inference map — it's scaffolding that can be distributed across early sessions instead.
- (c) Cut something else.
*Why this matters:* session 1 sets the calibration for every session that follows.

**3. Gemini callout verification — now, or closer to delivery?**
Current state: Gemini specifics in the master outline are hedged ("widely speculated," "per technical reports") and stated from memory. Some claims (tokenizer family, TPU generations, context window sizes) may have moved. Options:
- (a) Web-verify all Gemini callouts now, update the outline once, move on.
- (b) Verify per-session, as part of producing each session's deliverables.
- (c) Leave to Bryan to fact-check personally before delivery.
*Why this matters:* Bryan is at Google. Overclaims get noticed in the room.

**4. [BLOCKER] Facilitator depth challenge calibration — is the target right?**
Each session's outline includes 4 "stretch" items Bryan should master beyond attendee level — e.g., session 6 lists arithmetic intensity / roofline model, KV cache memory math, continuous batching tail-latency mechanics, prefix cache hit-rate tradeoffs. Ask Bryan to eyeball that list specifically. Options:
- (a) That's the right depth — keep calibration across all sessions.
- (b) Too deep — pull back; Bryan doesn't need to be able to publish a paper.
- (c) Too shallow — push further; Bryan wants genuine expert depth.
*Why this matters:* the stretch material is Bryan's explicit forcing function for his own growth. Wrong calibration here wastes his time in either direction.

**5. Safety / alignment — standalone, threaded, or omitted?**
Not currently in the course. Options:
- (a) Thread through relevant sessions (session 5 post-training, session 9 agent failure modes, session 10 open questions).
- (b) Add as an 11th session or an appendix — dedicated treatment.
- (c) Omit — out of scope for this audience.
*Why this matters:* Google SREs shipping these systems may need operational awareness of safety behavior, which is different from ML-alignment research.

**6. Logistics worth asking up-front:**

- **Will slides be shared with attendees post-session, or facilitator-driven only?** Changes on-slide text density. If attendees get the decks, slides need to be self-contained enough to review later. If facilitator-driven, slides should be visual-heavy and text-sparse.
- **Is the course being recorded?** Same reason — affects how much lives in the slide vs. the speaker's voice. Also affects whether to produce a transcript-style companion doc.
- **Delivery cadence — weekly, biweekly, condensed?** Affects cumulative study prompts. They work better with gaps between sessions (time to consolidate) than in a compressed schedule where Bryan won't have time to study between sessions.

Once the **BLOCKER** questions are resolved, proceed to: "which session do you want to start with?" (Default: session 1.) Deferrable questions can be revisited as they become relevant.

## 4. Decisions and Rationale (Do Not Re-Litigate Without Reason)

These were made deliberately. The rationale matters — the next session should not regress to generic defaults.

| Decision | Rationale |
|---|---|
| **Theory-first, agents last.** Session 1 opens with a 10-min agent-loop preview, then pivots to the real foundation (tokens/embeddings/residual stream). Sessions 8–9 are agents; session 10 is synthesis. | Modeled on Bryan's early-90s CS education. The bet: SREs, who already think in layers, retain more when foundations come first. Runs opposite to most LLM courses. |
| **Minimal math notation.** Prose over Greek letters. Notation only when it actually unlocks something. | Audience is SREs, not ML researchers. Bryan explicitly asked for this. |
| **Generic examples with Google/Gemini callouts.** | Generic ages better. Gemini callouts land because attendees connect to products they know. Bryan specifically wants Gemini-anchored where claims are public or widely speculated. |
| **Hedge all non-public Gemini specifics.** "Widely speculated" or "widely believed" when the detail isn't confirmed. | Bryan is at Google. Overclaiming gets noticed in the room. |
| **One SRE callout per session, not shoehorned.** Sessions 6 and 7 are SRE-dense; 4 and 5 are thinner. That asymmetry is intentional. | Forced SRE angles on every session would feel fake. |
| **Interactive HTML per session, but only where it genuinely helps.** Not every session needs one. Strong candidates: tokenizer viz (S1), attention pattern viewer (S2), forward-pass stepper (S3), prefill/decode timeline (S6), sampling explorer (S7), agent loop stepper (S8). Capstone: full end-to-end walkthrough (S10). | Bryan specifically asked for clickable walkthroughs "where that works." |
| **Pre-reads prime questions, not answers.** 1,000–1,500 words. Plant 1–3 questions the session will resolve. Never pre-teach. | Bryan's explicit ask — scaffolding, not spoilers. |
| **Study prompts are adaptive and cumulative.** Each one quizzes the current session plus all prior. By S10, Bryan is being tested on the whole stack. | Bryan's stated goal: forcing function for his own growth, and readiness for "questions a sharp attendee would ask." |
| **"Facilitator depth challenge" = 3× attendee material.** Every session outline lists 4 stretch items Bryan should master beyond what he'll teach. | Bryan's explicit ask — not for ego but for trust and engagement in the room. |
| **Four cross-cutting mental models, named repeatedly:** the residual stream, "it's all just tokens," training-vs-inference, prefill-vs-decode. | Scaffolding that only works if reinforced. Name them the same way each time. |
| **Deliver session-by-session, not all ten upfront.** | Bryan's feedback on S1 should calibrate S2–10. Producing all ten before feedback wastes tokens on a model of Bryan that may be wrong. |

## 5. Voice, Tone, and Format Calibration

Bryan writes in a direct, slightly rough style — typos intact, thinks out loud, long sentences. He's a senior technical person, not a beginner; responses should match him, not condescend.

**Tone to match (what I've been doing):**
- Direct. First sentence addresses the ask.
- Push back when warranted. Don't agree reflexively. Bryan explicitly wants to be challenged.
- Concrete over abstract. Named examples (Chinchilla, Flash Attention, vLLM) rather than gestures at "research."
- Hedge appropriately — "widely speculated," "reasonable to assume" — when talking about non-public Gemini architecture.
- Short framing, longer artifact. Inline responses stay tight; files carry the weight.
- Minimal formatting in chat. Bold for key decisions, occasional table, mostly prose. Don't bullet-point everything.

**What to produce for each deliverable:**

**Slide decks:** Slidev source (`slides.md` per session). Markdown-first with Vue component slots. **Moderate text density** — every session is recorded (internal-only), so slides don't have to be self-sufficient; recording + narrative companion + slides together carry the weight. (Exception: S1 is sparse-visual-first because its four interactive demos carry the pedagogical load.) Slide 1 of every deck links to the narrative companion. Shared theme across all 10 sessions for visual coherence.

Inline `<!-- -->` speaker-note blocks on every slide — **authored as narrative prose, not stage directions.** Rationale: these notes are the source of truth for the post-session narrative companion (via `slidev export-notes` + enrichment), so writing them as continuous prose is the only way to avoid authoring the narrative twice. At podium-time the facilitator skims them as prompts; on paper they read as paragraphs. The richer pre-session prep (what they'll ask, traps, deferrals) lives in `facilitator-guide.md`.

Hidden appendix slides (`hide: true`) for likely-questions and backup deep-dives — navigable via Slidev's presenter UI if a question lands.

Interactive demos are **not** embedded inline as Vue components; they live as standalone apps under `/demos/<name>/` and are embedded in slides via iframe, with an "↗ open standalone" affordance so attendees can click into them independently after the lecture. See outline §11 for the full production stack, repo layout, and two-way slide↔demo navigation.

**Narrative companion doc (`narrative.md`):** Post-session prose doc that lets attendees recall the session in detail and doubles as the next session's pre-read source. **Derived, not hand-written.** Pipeline:
1. Author speaker notes as narrative prose (only new writing step).
2. Export with `slidev export-notes` (or equivalent) → sequential notes-by-slide artifact.
3. Enrich: short session-intro paragraph, session-outro paragraph (primes next session's questions — this becomes S(N+1)'s pre-read content), inline demo thumbnails with captions linking to standalone demos, key graphics from the slides that carry meaning without voice-over.
4. Cross-link: slide 1 → narrative; narrative → deck + each demo's standalone page.

The outro paragraph is load-bearing: it's where the "priming 1–3 questions" role of the pre-read gets satisfied in the cascade. Write it with that dual purpose in mind.

**Facilitator's guides:** Markdown. Per-slide structure: *What's on the slide* → *What you say* → *What they'll ask* → *What to watch for (misconceptions/traps)* → *Where to defer* ("that's next session"). Length matters less than density.

**Pre-reads:**
- **S1:** bespoke markdown, 1,000–1,500 words, conversational tone. Structure: (1) hook, (2) 1–3 priming questions, (3) short intuition per question, (4) closing provocation. Must not pre-teach. **Must not be required for a noob** — motivated attendees get a running start; unprepared attendees can still follow S1 cold.
- **S2+:** thin `pre-read.md` = pointer to the prior session's `narrative.md` (specifically the outro paragraph, which was written as priming) + 1–3 optional external links for motivated attendees. No fresh prose authoring required per session.

**Study prompts:** Markdown, paste-ready. Structure:
1. Role setup for Claude (what to do, how to grade, how to push)
2. Scope (session N + cumulative through N-1)
3. Explicit instruction to flag mental-model errors, not just wrong answers
4. Adaptive behavior — harder questions if Bryan nails the basics, remedial if not
5. End-of-session synthesis question matching the session's "facilitator depth challenge"
6. Mixed T/F and short-answer format (Bryan explicitly rejected long-form essay-style quizzing)

## 6. Calibration Anchors (Concrete Examples)

When in doubt about depth or tone, match these. Drawn from what was produced in the originating conversation:

**Pedagogical framing that worked:** "The 'ah-ha' moments cluster in sessions 6–9, when the architectural work pays off and serving/agent behavior becomes explainable from first principles. Some attendees will be frustrated early ('when do we get to the interesting stuff?'). Acknowledge this in session 1 and promise the payoff explicitly."

**Misconception framing that worked:** *"The model stores text somewhere and looks it up."* No — parameters encode distributions, not text. (Format: restate the misconception verbatim as attendees would say it, then correct directly.)

**SRE callout that worked (Session 6):** "The core insight: your p50 latency is mostly decode (many tokens); your p99 latency is often prefill (one user pasted a huge document). These have different mitigations and different capacity-planning math."

**Depth calibration example (Session 6 facilitator challenge):** (a) Arithmetic intensity and the roofline model. (b) KV cache memory math — how much memory does each token cost? (c) Continuous batching mechanics and the effect on tail latencies. (d) Prefix cache hit-rate tradeoffs in real deployments. *This is the target depth — real technical substance, not vague gestures.*

## 7. Anti-Patterns (Where Handoffs Go Wrong)

- **Do not regenerate the master outline unless asked.** It's settled. Iterate on individual sessions.
- **Do not produce all 10 sessions in one go.** Bryan chose iterative delivery deliberately — S1 feedback calibrates everything after.
- **Do not over-format.** Bullet-pointing every response is the classic Claude failure. Match Bryan's prose style.
- **Do not hedge on substance to seem cautious.** "Some sources say" when you mean "this is the case" reads as weakness. Hedge only on non-public Gemini specifics and genuinely contested claims.
- **Do not cut the "facilitator depth challenge" sections to save tokens.** They're the point — Bryan's forcing function for his own growth.
- **Do not default to tutorials when asked for curricula.** A curriculum is structured scaffolding; a tutorial is linear explanation. Different artifacts.
- **Do not skip the agent-loop preview in Session 1.** It's the 10-minute promise that pays off in Session 10.
- **Do not let pre-reads pre-teach.** They prime questions. If you find yourself explaining how attention works in a pre-read for Session 2, you've broken the frame.
- **Do not claim Gemini uses specific internals you're not sure about.** Public technical reports and Chinchilla-style papers are fair game. Internal architecture claims should be marked "widely speculated."
- **Do not use emojis.** Bryan hasn't used them and the project is professional/technical.
- **Do not ask "would you like me to continue?" after every artifact.** Finish the deliverable, point to what's next, let Bryan drive.

## 8. The First Turn in the New Session

Paste this (or something close) into the new Claude session after attaching `course_master_outline.md` and this handoff doc:

> I'm continuing a project from another Claude session. Two documents are attached: `HANDOFF.md` and `course_master_outline.md`. Read both before doing anything else. The handoff tells you the project state, decisions already made, voice and depth calibration, anti-patterns, and open questions that need resolving. The master outline is the authoritative course structure.
>
> Once you've read them, confirm briefly: (1) you understand this is a theory-first 10-session SRE course, (2) you know which four deliverables are expected per session, (3) you know the four cross-cutting mental models by name, (4) you've read the anti-patterns in Section 7.
>
> Then ask me the open questions in Section 3a. Lead with the **BLOCKER** ones (Q1, Q2, Q4) since they may change session numbering or per-session calibration. Group the rest how makes sense. When you ask, reference the *why* from Section 3a — I want to see you've actually read it, not just enumerated questions.
>
> Do not produce any session deliverables until the BLOCKER questions are resolved. Others I may defer; when I do, flag the assumptions you're making for those. Do not regenerate the master outline. Match the voice, depth, and format specified in Sections 5–6.

## 9. Context the New Session Won't Have (But Should Know)

- **Audience-specific:** Google SREs. They use LLMs daily, don't know how they work. Strong systems intuition. Will catch vague claims about Gemini. Range from zero ML background to some.
- **Bryan's self-assessment:** This course is partially a forcing function for his own learning. He is technically strong but doesn't claim to be an ML expert. Adaptive study prompts exist to pressure-test his knowledge before he teaches.
- **Format for the course itself:** 10 × 1 hour sessions. 45 min material, 15 min Q&A. Bryan is the facilitator. Not self-paced; he's in the room.
- **No explicit deadline was stated.** Iterative delivery is fine.
- **Bryan's first instinct was to hand-write all of this himself.** He came around to collaborating with Claude after realizing the scope. This means he has opinions — surface tradeoffs, don't assume.

## 10. Known Unknowns (Minor — Flag If Relevant, Not Blocking)

Distinct from the open questions in Section 3a, which are blocking. These are minor context gaps that may come up:

- **Is there a follow-up course planned?** Affects how much to leave as "we'd cover this next time" in session 10.
- **Does "SRE" here mean classical Google SRE or product-embedded SRE?** May shift operational-content weight. Default: classical, unless Bryan says otherwise.

---

## Final Note

The single most important thing a new session can do is **not drift**. The rationale in Section 4 is what makes this course different from a generic LLM 101. If a decision feels weird, check the rationale before overriding. If the rationale doesn't apply, ask Bryan before changing course.

Good luck.
