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

## 2026-04-20 — Slidev vs Reveal.js (stay)

### D9. Stay on Slidev; spike preserved on `spike/s1-reveal` branch

- Mid-day, Slidev's goto-dialog (`#slidev-goto-dialog`) was showing as a persistent right-third panel in built output, covering content. This followed earlier fights with the overview mode and presenter route. Reveal.js spike was built (6 slides, `sessions/s1-reveal/`, 112KB JS vs Slidev's ~1MB) to compare side-by-side.
- Resolution: **Slidev looks better and the chrome bleed is fully fixable with flags + CSS.** Fixes that now stick:
  - `editor: false` in frontmatter → strips dev editor bundle from build.
  - CSS rule `#slidev-goto-dialog { display: none !important }` → hides the jump-to-slide dialog (`g`) that was leaking visible.
  - `contextMenu: true` (default) kept → right-click menu provides access to Presenter Mode, Overview, PDF export.
  - Presenter route fix (earlier commit `866368e`) stamps `presenter/index.html` so GH Pages routing resolves the SPA.
- **Speaker view access:** right-click on slide → Presenter Mode, OR navigate directly to `/sessions/s1/presenter/`.
- **Why kept Slidev:** markdown-first authoring ergonomics + Vue components (only `<BrandMark>` used today, but more planned for S2+). Reveal would have required HTML-per-slide and lose markdown fidelity.
- **Why spike preserved:** `spike/s1-reveal` branch kept as a fallback lever in case Slidev bites us again on a deeper issue. Not merged.

---

## 2026-04-23 — Reset to 3-session "applicable" course

### D10. Genuine reset from 10 sessions → 3 sessions, applicable-leaning

- Bryan goes on paternity leave after the third session. Rather than start a 10-session arc and leave the team without continuity, the new plan is 3 self-contained sessions weighted toward applied / operational understanding over theoretical depth.
- The 10-session master outline (`course_master_outline.md`) is **paused, not deleted** — Bryan may return to it during leave. Existing S1 Slidev deck, four interactive demos, and brand system stay in the repo as-is for possible future revival.
- **How to apply:** Stop adding to the 10-session outline / S1 Slidev deck. New work goes into a fresh 3-session outline + per-session content docs.

### D11. Content-first, deck-agnostic prose for Claude Design handoff

- Bryan plans to hand the worked-up content to Claude Design to produce the actual decks. Source-of-truth artifact is **prose + structured outline** (per-slide intent, key claim, visual hint, speaker notes), not Slidev markup.
- Claude Design will see **only the prose content** — not the existing S1 deck, demos, or brand system. This is to give Design genuine room to make visual choices instead of re-skinning the existing artifact.
- **How to apply:** When drafting, structure each session as a content doc that a designer (human or AI) could turn into slides without needing access to the rest of the repo. Avoid Slidev-specific syntax in the content docs.

### D12. Static visualizations OK; interactive demos not a requirement

- Interactive iframe demos were a 10-session-era investment. For the 3-session reset, static visualizations / diagrams are sufficient — and easier for Claude Design to produce in standard deck formats.
- Specific visualizations called out so far: **context-size scaling** (cost/latency curves vs context length), **cost of a prefix-cache miss** (e.g. dollar / latency delta on cold vs warm prefix).
- **How to apply:** When a topic benefits from a visualization, note it as a "visual hint" in the content doc with enough description that Design can produce it. Don't build interactive demos for the 3-session arc unless we identify one that genuinely earns its keep.

### D13. Must-include topic: prefix caching as cloud-provider economics

- Beyond "what prefix caching is mechanically," the course must cover the **operational reality of cloud-provider prefix caches**: you pay for cache writes, you have to design for cache key stability, and entries are subject to TTL eviction.
- **Why:** SREs will own this in production. Cache key churn from chatty system prompts or non-deterministic context assembly silently kills hit rate and inflates bills. TTL means "warm" isn't permanent — long-idle agents pay cold-start every time. This is exactly the applied/operational angle the reset is leaning into.
- **How to apply:** Reserve a dedicated block in whichever session covers inference economics. Treat it as parallel to other caching disciplines SREs already know (CDN keys, memcached TTLs) — that bridge is the pedagogical hook.

### D14. Success criteria: insight, curiosity, reframing — not recall

- The course succeeds if attendees (a) **learn at least one thing they didn't know**, (b) get **curious about something they didn't even know existed**, and (c) leave with **stuff they already knew reframed in a more useful way**. It does *not* need to leave them able to pass a quiz on the material.
- **Why:** the audience is 12 SREs Bryan knows well, with one 45-min session each. Optimizing for comprehensive coverage / retention would force shallow treatment of every topic; optimizing for insight + curiosity + reframing lets each section go deep enough to land. Bryan is also explicit that he prefers trimming over padding — better to draft long with strong material and cut, than draft tight and pad.
- **How to apply:** when judging whether a section earns its time, ask "does this drop a real insight, spark a curiosity hook, or reframe something they already think they know?" If none of the three, cut it. Don't add "completeness" content (e.g. obligatory definitions, exhaustive enumerations) just because the topic technically warrants it. Draft generously; trim aggressively.

---

## 2026-04-27 — S1 review corrections

### D15. Voice, audience starting point, and environment constraints for Claude Design

After reviewing the S1 draft from Claude Design, four corrections are locked in for all subsequent sessions:

**Voice:** Small room, not conference stage. 12 SREs Bryan knows personally. Direct and collegial — no rhetorical buildup, no dramatic reveals, no "at the end of this session you will…" preamble. Just the material.

**Design scaffolding stays hidden:** The "one thing learned / curious / reframed" success criteria are a design lens, not an agenda item. Never surfaces on a slide. The session opener is not a meta-description of the session.

**Audience starts cold:** They don't know MoE, the open-weight model ecosystem, or any AI/ML vocabulary. Every term earns its first use. Comparison and landscape slides orient around what's functionally relevant to them — not around naming the full model family tree.

**Constrained environment:** This audience uses Gemini variants + the internal Jetski harness (Jetski, Jetski CLI, Jetski Chat). They don't pick models or make capex decisions. Nothing should be framed around model selection, capex vs. opex, or "which model should you use." The useful frame is: here's the landscape and why it's structured this way, here's what that means for using the tools you have.

- **How to apply:** DESIGN_HANDOFF.md now carries "Voice and tone," "Audience's actual starting point," and "Constrained environment" sections that encode these constraints directly. Any revision pass on Design output should check against those sections.
