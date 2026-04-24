# Session 3 — fact-check claims and sources

Worker: W3 (Session 3)
Date: 2026-04-23

## Summary
- Total claims checked: 13
- ✅ Verified: 7
- ⚠️ Needs revision: 4
- ❓ Unsourceable / speculation flagged: 2
- ❌ False: 0

## Claims

### C3.1 — "Harness as the layer between the agent and the world: everything that isn't the model — tool runtime, context assembly, output streaming, permission gating, transcript persistence, retry logic."

- **Status:** ✅ verified
- **Sources:**
  - [Effective harnesses for long-running agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
  - [What is an agent harness in the context of large-language models? — Parallel Web Systems](https://parallel.ai/articles/what-is-an-agent-harness)
  - [Skill Issue: Harness Engineering for Coding Agents — HumanLayer Blog](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)
- **Notes:** The definition ("everything between the model and the real world") is consistent with how Anthropic, HumanLayer, and practitioner posts characterize a harness. The specific enumeration (tool runtime, context assembly, output streaming, permission gating, transcript persistence, retry logic) is a reasonable decomposition — individual pieces (permission gating, tool runtime, context management) are each discussed in the sources. "Output streaming" and "transcript persistence" are less universally called out as first-class harness concerns but are uncontroversial. No revision needed.

---

### C3.2 — "The same model behind a different harness is a meaningfully different product. Claude Code vs the raw API is the easy example; same weights, very different working agent."

- **Status:** ✅ verified
- **Sources:**
  - [Claude Code overview — Anthropic docs](https://code.claude.com/docs/en/overview)
  - [Agent SDK overview — Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/overview)
  - [Building agents with the Claude Agent SDK — Anthropic Engineering](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)
- **Notes:** Claude Code ships a system prompt, ~19–24 built-in tools, sub-agent prompts (Plan/Explore/Task), permission-gated tool execution, and context management (compaction, file virtualization) — none of which exist in the raw API. The Claude Agent SDK post frames the harness as "giving Claude a computer," which is exactly the "same weights, very different agent" framing Bryan uses. Solid claim.

---

### C3.3 — "Google's roadmap is heading toward one core agent runtime with surface-specific skins (IDE, terminal, web, mobile)."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [Introducing Gemini Enterprise Agent Platform — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform)
  - [The new Gemini Enterprise: one platform for agent development — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development)
  - [Build with Google Antigravity — Google Developers Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- **Notes:** Google has several agent surfaces in public: Antigravity (desktop IDE with editor + terminal + browser surfaces), Gemini CLI (terminal), Gemini Code Assist (IDE plugin for VS Code / JetBrains / Android Studio / Cloud Workstations), Gemini Enterprise app (web / mobile), and the Gemini Enterprise Agent Platform (re-engineered Agent Runtime, rebranded from Vertex AI). Google does explicitly market Gemini Enterprise as "one platform for agent development" with a single Agent Runtime, so the *direction* is well-sourced. But Google has **not** published a statement characterizing its roadmap as "one core agent runtime with surface-specific skins" in those words — that's Bryan's framing applied to observable product shape. Antigravity's own marketing uses "surfaces" language, but for editor-vs-manager, not for runtime-vs-skins. Cleanest public thing Google has said is "one platform" (Gemini Enterprise) and "one re-engineered Agent Runtime."
- **Proposed revision:**
  > Google's public direction — Gemini Enterprise Agent Platform ("one platform for agent development," with a re-engineered Agent Runtime), Antigravity, Gemini CLI, and Gemini Code Assist — is consistent with a one-runtime / many-surfaces shape, even if Google hasn't branded it that way.

---

### C3.4 — "Anthropic's Claude Code is already structured this way and is the cleanest reference design in public right now."

- **Status:** ✅ verified (architectural claim); editorial on "cleanest reference"
- **Sources:**
  - [Agent SDK overview — Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/overview)
  - [Introducing Claude Agent in JetBrains IDEs — JetBrains AI Blog](https://blog.jetbrains.com/ai/2025/09/introducing-claude-agent-in-jetbrains-ides/)
  - [Use Claude Code in VS Code — Claude Code Docs](https://code.claude.com/docs/en/vs-code)
- **Notes:** Claude Code runs in terminal (CLI), VS Code, JetBrains IDEs, on the web (claude.ai/code), in Claude Desktop, and as a GitHub Action. JetBrains explicitly says its Claude Agent is "built on Anthropic's Agent SDK, which powers Claude Code." The Claude Agent SDK (renamed from Claude Code SDK in Sep 2025) is described as the library that *internally* powers Claude Code, available to third parties — this is the clearest public example of a unified agent core with surface-specific adapters. The "cleanest reference design in public right now" part is editorial; safe to keep as framing but not a verifiable fact.

---

### C3.5 — "Model decides the next message; harness decides what tools exist, what permissions apply, what context gets injected, when to stop."

- **Status:** ✅ verified
- **Sources:**
  - [Effective harnesses for long-running agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
  - [Agent SDK overview — Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/overview)
  - [Skill Issue: Harness Engineering for Coding Agents — HumanLayer Blog](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)
- **Notes:** Matches the widely-repeated design principle "separate reasoning from permission enforcement — the model decides what it wants to do; a different system decides whether it's allowed." Context management (compaction, virtual files), tool registration, and stop conditions are all harness-level responsibilities across every major agent framework. Clean claim.

---

### C3.6 — "Unit-test-style evals don't capture the things that actually go wrong in long-running agents — drift, premature stopping, doom loops, sycophantic agreement with bad tool output."

- **Status:** ⚠️ needs revision (term-by-term; the overall claim is sound, but some of the failure-mode names are non-standard)
- **Sources:**
  - [Evaluating Goal Drift in Language Model Agents (arXiv 2505.02709)](https://arxiv.org/abs/2505.02709)
  - [Towards Understanding Sycophancy in Language Models (arXiv 2310.13548)](https://arxiv.org/abs/2310.13548)
  - [The Long-Horizon Task Mirage? Diagnosing Where and Why Agentic Systems Break (arXiv)](https://arxiv.org/html/2604.11978v1)
- **Notes:**
  - **"drift"** — ✅ standard. "Goal drift" (Arike et al., May 2025), "agent drift," "prompt drift," "semantic drift" all have academic + industry currency.
  - **"premature stopping"** — ✅ recognized as "premature termination" in the literature (e.g., arXiv evaluations of software-engineering agents). Mild phrasing difference but same concept.
  - **"doom loops"** — ⚠️ informal / practitioner term, not a research term. Widely used in blogs (codemanship, ML Overflow, practitioner posts) to describe agents stuck in retry loops. Fine for an SRE talk but flag that the academic term is closer to "retry loops" or "infinite agent loops."
  - **"sycophantic agreement with bad tool output"** — ✅ sycophancy is well-established (Anthropic's 2023 paper + many follow-ups like SycEval, "Be Friendly Not Friends"). The specific framing "with bad tool output" is Bryan extending the concept from user-facing sycophancy to tool-output sycophancy, which is a reasonable extrapolation but not a direct quote from the literature.
- **Proposed revision:**
  > "Unit-test-style evals don't capture the things that actually go wrong in long-running agents — goal drift, premature termination, retry/'doom' loops, and sycophantic agreement with bad tool output."

---

### C3.7 — "Observability for agent runs: turn-level traces, tool-call success/failure rates, context-window growth over a run, decode-token budgets."

- **Status:** ✅ verified
- **Sources:**
  - [Detecting AI Agent Failure Modes in Production — Latitude](https://latitude.so/blog/ai-agent-failure-detection-guide)
  - [Effective harnesses for long-running agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- **Notes:** Turn-level traces, tool-call success/failure metrics, and context-window utilization are standard agent-observability dimensions across tracing tools (LangSmith, Latitude, Langfuse) and Anthropic's own guidance. "Decode-token budgets" is slightly idiosyncratic phrasing — more commonly "token budgets" or "decode/output token limits" — but the concept is standard.

---

### C3.8 — "Context poisoning" as a named failure mode.

- **Status:** ✅ verified (standard term)
- **Sources:**
  - [How Long Contexts Fail — Drew Breunig](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html)
  - [Context poisoning in LLMs — Elastic Search Labs](https://www.elastic.co/search-labs/blog/context-poisoning-llm)
  - [Agentic AI Threats: Memory Poisoning & Long-Horizon Goal Hijacks — Lakera](https://www.lakera.ai/blog/agentic-ai-threats-p1)
- **Notes:** Standard term. Breunig's June 2025 post is the most-cited practitioner piece and defines it precisely: "Context poisoning occurs when a hallucination or other error makes it into the context, where it is repeatedly referenced." DeepMind used it publicly to describe Gemini's Pokémon-playing agent hallucinating goals. No revision needed.

---

### C3.9 — "Tool-call cascades" as a named failure mode.

- **Status:** ⚠️ needs revision (non-standard phrasing; the concept is standard)
- **Sources:**
  - [Preventing Cascading Failures in AI Agents — Will Velida](https://www.willvelida.com/posts/preventing-cascading-failures-ai-agents)
  - [How Tool Chaining Fails in Production LLM Agents — Future AGI](https://futureagi.com/blog/llm-tool-chaining-cascading-failures-production/)
  - [Taxonomy of Failure Mode in Agentic AI Systems — Microsoft](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/Taxonomy-of-Failure-Mode-in-Agentic-AI-Systems-Whitepaper.pdf)
- **Notes:** The concept — an error at one tool call propagating through subsequent tool calls — is well-established and named in multiple places: "cascading failures" (OWASP ASI08, Will Velida), "cascading errors" (MAST multi-agent taxonomy), "tool chaining cascading failures" (Future AGI). But the exact phrase "tool-call cascades" is not in common use. Easy fix: use the standard phrase.
- **Proposed revision:**
  > "...cascading tool-call failures (or 'cascading errors')..."

---

### C3.10 — "Infinite-loop-on-error" as a named failure mode.

- **Status:** ⚠️ needs revision (descriptive but not a standard named term)
- **Sources:**
  - [The Agent Loop Problem: When "Smart" Won't Stop — Modexa / Medium](https://medium.com/@Modexa/the-agent-loop-problem-when-smart-wont-stop-ccbf8489180f)
  - [LLM Tool-Calling in Production: Rate Limits, Retries, and the "Infinite Loop" Failure Mode — Medium](https://medium.com/@komalbaparmar007/llm-tool-calling-in-production-rate-limits-retries-and-the-infinite-loop-failure-mode-you-must-2a1e2a1e84c8)
  - [Agent gets stuck in repetitive tool call loops — bytedance/deer-flow #1055](https://github.com/bytedance/deer-flow/issues/1055)
- **Notes:** The concept (agent hits an error, retries same call, burns tokens/time) is universally recognized. Practitioner posts more commonly call this a "retry loop," "infinite agent loop," or "doom loop" (same as C3.6). "Infinite-loop-on-error" is descriptive and readable but reads as coined.
- **Proposed revision:**
  > "...retry loops on persistent errors..."
  > or just fold it into the "doom loops" bucket in C3.6 rather than listing both.

---

### C3.11 — "Agreeable resignation" as a named failure mode.

- **Status:** ❓ Bryan coinage (unsourceable)
- **Sources:**
  - [Towards Understanding Sycophancy in Language Models (arXiv 2310.13548)](https://arxiv.org/abs/2310.13548)
  - [SycEval: Evaluating LLM Sycophancy (arXiv 2502.08177)](https://arxiv.org/abs/2502.08177)
- **Notes:** No literature hit on "agreeable resignation" as a term of art. The nearest adjacent concepts are "sycophancy" (model agrees with user over truth), "sycophantic capitulation" (informal), and "epistemic cowardice." If the intent is "agent gives up on the task and agrees that it's impossible / done when it isn't," that's usually bundled under either sycophancy (toward the user's framing) or premature termination (giving up too early). Very plausibly a Bryan coinage; worth flagging to him explicitly.
- **Proposed revision:**
  > Either (a) swap for "sycophantic capitulation" (coined-but-recognizable) or drop in favor of the already-mentioned sycophancy + premature-termination pair, OR (b) keep "agreeable resignation" and explicitly introduce it in the talk as Bryan's own naming since the underlying behavior is real.

---

### C3.12 — "Context-window exhaustion mid-task" as a named failure mode.

- **Status:** ✅ verified (standard concept; phrasing is conventional)
- **Sources:**
  - [Agent SDK overview — "without exhausting the context window"](https://code.claude.com/docs/en/agent-sdk/overview)
  - [Building an internal agent: Context window compaction — Will Larson / Irrational Exuberance](https://lethain.com/agents-context-compaction/)
  - [How Long Contexts Fail — Drew Breunig](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html)
- **Notes:** Anthropic's own docs describe compaction as what "enables an agent to work on a task without exhausting the context window." Context exhaustion / context-window overflow is a first-class failure mode across major agent frameworks. No revision needed.

---

### C3.13 — "Every guardrail you add reduces the agent's ceiling on hard tasks; every guardrail you remove raises the floor of how badly it can go wrong."

- **Status:** ❓ editorial framing — not a checkable empirical claim
- **Sources:** n/a
- **Notes:** This is Bryan's framing of the safety-vs-effectiveness tradeoff and is not a specific empirical claim with a literature counterpart. The underlying intuition (restricting capabilities trades some usefulness for safety) is consistent with alignment tax literature (e.g., Askell et al., Bai et al.) but the specific "ceiling / floor" phrasing is his own. No action needed unless Bryan wants a citation to the general alignment-tax concept, in which case Anthropic's "Training a helpful and harmless assistant" is the cleanest anchor.

---

## Open questions for Bryan

1. **C3.3 (Google roadmap):** Google has publicly pitched "one platform for agent development" (Gemini Enterprise Agent Platform) and a re-engineered Agent Runtime, but has *not* used the exact "one core runtime, many surface-specific skins" framing. Do you want to (a) soften to "consistent with" phrasing, (b) attribute the framing to yourself ("my read of Google's direction is…"), or (c) drop the Google claim and keep only the Anthropic/Claude Code example?
2. **C3.6 failure-mode names:** "doom loops" is practitioner-standard but not academic — fine for a Google SRE audience, but worth a beat of "the practitioner name is…" if you want to earn the research audience too.
3. **C3.9 "tool-call cascades":** Recommend swapping to "cascading tool-call failures" or "cascading errors" to match the MAST / OWASP / cascading-failures literature. Low-cost, higher-credibility.
4. **C3.10 "infinite-loop-on-error":** Recommend folding into the "doom loops" bucket in C3.6 rather than naming both separately. They're the same phenomenon in practice.
5. **C3.11 "agreeable resignation":** Strong candidate for being your own coinage. The underlying behavior is real, but no one else names it this way. Do you want to (a) keep it and own it as your term, (b) swap to "sycophantic capitulation," or (c) decompose into its parts (sycophancy + premature termination)?
6. **General:** The Session 3 failure-mode list is roughly half standard terms (context poisoning, sycophancy, drift, premature termination, context-window exhaustion) and half Bryan phrasings (tool-call cascades, infinite-loop-on-error, agreeable resignation, doom loops). You might want to be explicit in the session about which is which — it's good pedagogy and builds credibility with the more skeptical Googlers.
