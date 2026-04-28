# Life of an Agent — Design Handoff

## What you're producing

Three session content documents — `session_1_content.md`, `session_2_content.md`, `session_3_content.md` — one per session of a course called "Life of an Agent." Each is a fully expanded prose content spec: the skeleton is in `three_session_spine.md`; your job is to put flesh on it.

## The course

**Audience:** 12 site reliability engineers Bryan knows personally. Technically sophisticated (distributed systems, caching, latency, observability are native territory) but no deep ML/AI background. The recurring hook throughout: *you already have mental models for this — here's where they map and where they break.*

**Format:** 3 weekly sessions. Nominal slot 60 min (~45 min content + 15 min Q&A), nothing scheduled after — if the group is engaged, sessions can run 90 min. Plan for ~45 min of tight content; the slack is for live discussion, not more slides.

**Success criteria:** attendees (a) learn at least one thing they didn't know, (b) get curious about something they didn't know existed, (c) leave with familiar concepts reframed more usefully. Not recall, not comprehensive coverage. When in doubt about a section: does it drop a real insight, spark a curiosity hook, or reframe something they already think they know? If none of the three, cut it.

## Source material

- **`three_session_spine.md`** — the authoritative content outline. Per-session audience promises, per-block content bullets with key claims spelled out, visual hints for diagrams, and insight/curiosity callouts.
- **`notes/decisions.md`** — decisions made during production; D10–D14 are most relevant to this arc.

## What each session document should contain

For each block:

**Prose narrative** — content written at the level of a presenter's close reference. Not a word-for-word script, but rich enough someone else could deliver from it. ~1 paragraph per spine bullet.

**Per-slide intent** — for each slide you'd produce, one line: what job is this slide doing? Not the content — the *purpose*. Example: "Establish that prefill and decode are two physically different operations before introducing their cost profiles."

**Visual hints expanded** — the spine has per-session visual hints; flesh each out to a spec a designer can execute without needing to understand the content. Include: what the diagram shows, what dimensions/axes/labels it needs, what the key contrast is, any specific data points that should appear.

**Speaker notes** — per slide, 2–4 sentences. What to say that isn't on the slide; what to watch for in the audience's reaction; where to invite questions.

## Voice and tone

**Sessions are daytime.** Attendees are between 8am–4pm in their local timezones. Do not use "tonight" or evening-oriented language anywhere in slide copy or speaker notes. "Today" is the right word.

**Register: small room, not stage.** The audience is 12 SREs Bryan knows personally. Write the way you'd explain something to colleagues over lunch — direct, a little relaxed, no performance. Not: "And that's the key insight. Let that sink in." Yes: "The thing that trips people up here is X."

No rhetorical buildup, no dramatic reveals, no "at the end of this session you will…" preamble. Just start talking about the thing.

**Don't surface the design scaffolding.** The success criteria (one thing learned, one thing curious, one thing reframed) are a *lens for evaluating content*, not an agenda item on any slide. The session opener is not "here's the structure of what you'll get from today." It's just the first substantive thing.

**Don't carry over planning artifacts.** Notes like "worth flagging…Gemini is MoE. Confirmed." were research notes from content production — they don't belong in attendee-facing material. The audience isn't coming in with a prior frame on MoE; they want to understand model architectures, what Google uses, and why that choice was made. Start from where they are, not from where the research conversation was.

## Audience's actual starting point

These SREs know distributed systems deeply. They do not know:

- What MoE (mixture of experts) is — explain it from scratch if it comes up
- The open-weight model ecosystem — names like Llama, Mistral, Falcon, etc. won't land without context; don't assume they will on a comparison slide
- Any AI/ML vocabulary — every term needs to earn its first use

When building comparison slides or landscape slides, orient around what's *functionally relevant to them*, not around naming the full model family tree.

## Constrained environment (important)

This audience doesn't choose their models or their tooling. They use **Gemini variants** (what's available to them at work) and the **harnesses Google provides internally** — Jetski, Jetski CLI, Jetski Chat. They don't make capex decisions, they don't pick between open-weight models, they don't evaluate model vendors.

**Do not frame anything around model selection, capex vs. opex tradeoffs, or "which model should you use."** That's not a choice they have. The useful framing is: here's the landscape and why it's structured this way, here's what that means for how you use the tools you've been given.

## Constraints

- Static visualizations only — no interactive demos, no iframes.
- Tool-agnostic plain markdown — not Slidev syntax, not any deck format. Bryan will route the output to the appropriate tool.
- Draft generously; Bryan will trim.
