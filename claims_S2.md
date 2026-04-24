# Session 2 — fact-check claims and sources

Worker: W2 (Session 2)
Date: 2026-04-23

## Summary
- Total claims checked: 16
- ✅ Verified: 12
- ⚠️ Needs revision: 3
- ❓ Unsourceable / speculation flagged: 1
- ❌ False: 0

## Claims

### C2.1 — "A tool call works like this: the model emits structured JSON, the harness pattern-matches, runs the tool, and returns the result as a context message."

- **Status:** ✅ verified
- **Sources:**
  - [MCP Tools specification (tools/list, tools/call)](https://modelcontextprotocol.io/specification/draft/server/tools)
  - [Anthropic Claude API: Structured outputs / tool use](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
  - [MCP tool schema primer (Merge)](https://www.merge.dev/blog/mcp-tool-schema)
- **Notes:** Vendor and protocol docs agree: models produce a structured tool-call object (name + JSON args conforming to a JSON Schema / `inputSchema`); the harness (MCP client, Claude Code, Agent SDK, etc.) dispatches the named tool, and the tool's return value is appended as a new message (typically a `tool_result` / `tool` message) before the next model turn. The "Structured Outputs" feature on the Claude Developer Platform even compiles JSON Schema into a grammar that constrains sampling, so the JSON is guaranteed to conform. Framing as "just a protocol, not magic" is accurate.

### C2.2 — "MCP is the Model Context Protocol."

- **Status:** ✅ verified
- **Sources:**
  - [Introducing the Model Context Protocol (Anthropic, Nov 2024)](https://www.anthropic.com/news/model-context-protocol)
  - [modelcontextprotocol.io — official spec](https://modelcontextprotocol.io/specification/2025-11-25)
  - [Model Context Protocol — Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- **Notes:** Announced by Anthropic in November 2024 as an open standard. Officially adopted by OpenAI in March 2025 and by Google DeepMind shortly after. Name and expansion are correct.

### C2.3 — "MCP is a standardization layer — what changes when 'every tool' follows the same shape vs each integration being bespoke (the N×M problem)."

- **Status:** ✅ verified
- **Sources:**
  - [Introducing the Model Context Protocol (Anthropic)](https://www.anthropic.com/news/model-context-protocol)
  - [What is MCP? (Google Cloud)](https://cloud.google.com/discover/what-is-model-context-protocol)
  - [What is Model Context Protocol? (IBM Think)](https://www.ibm.com/think/topics/model-context-protocol)
- **Notes:** Anthropic and third-party docs explicitly frame MCP as solving the "N×M problem" — pre-MCP, each model × each integration required a bespoke glue layer. MCP standardizes the client/server protocol (JSON-RPC 2.0) and the tool-schema shape so any MCP-speaking client can consume any MCP-speaking server. The spine's framing is correct.

### C2.4 — "Skills: preconfigured instruction + tool bundles invoked by name."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [Extend Claude with skills — Claude Code docs](https://code.claude.com/docs/en/skills)
  - [Agent Skills overview — Claude API docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
  - [Equipping agents for the real world with Agent Skills (Anthropic Engineering)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- **Notes:** A Skill is a folder containing a `SKILL.md` with YAML frontmatter (`name`, `description`) plus optional scripts, templates, and reference files. Two nuances the current wording misses:
  1. Skills bundle **instructions + optional scripts/resources**, not "instructions + tools" — a skill doesn't typically declare its own tool allow-list the way a subagent does; it uses whatever tools the parent agent already has access to.
  2. Skills are **model-invoked based on description-match, not invoked by name by the user**. Anthropic describes this as "progressive disclosure": Claude reads the frontmatter of every available Skill, and if the `description` is relevant to the current task, it loads `SKILL.md` into context. Users can also trigger a skill by name, but the default discovery path is model-driven.
- **Proposed revision:**
  > Skills: on-disk bundles of instructions (plus optional scripts, templates, reference docs) that Claude loads on demand when their `description` matches the task. Same tool access as the parent agent; the "bundle" is the procedural knowledge, not a new tool set.

### C2.5 — "Sub-agents: spawning a child loop with its own context window. When you'd want context isolation; when the parent reads the child's final answer back into its own context."

- **Status:** ✅ verified
- **Sources:**
  - [Create custom subagents — Claude Code docs](https://code.claude.com/docs/en/sub-agents)
  - [Subagents in the SDK — Claude API docs](https://platform.claude.com/docs/en/agent-sdk/subagents)
  - [Context Management with Subagents in Claude Code (R. Snapp)](https://www.richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code)
- **Notes:** The Claude Code docs describe a subagent as "a named, isolated Claude instance with its own system prompt, its own context window, its own tool access list, and its own permission mode." Intermediate tool calls and results stay inside the subagent; only the subagent's final message returns to the parent. Spine wording is accurate and matches the canonical Anthropic definition.

### C2.6 — "LSP and other 'ambient' context sources: language-server output, file watchers, repo indexers — context that gets injected without an explicit tool call."

- **Status:** ❓ unsourceable (as a general claim)
- **Sources:**
  - (no single authoritative source — this is a design-pattern observation about specific harnesses)
- **Notes:** There is no single vendor document that defines "ambient context" as a category. Individual harnesses do inject LSP diagnostics, file watchers, and repo indexes into context outside the tool-call loop (Cursor's codebase indexing, Continue's @-context providers, various Copilot Workspace features), but calling this out as a universal thing is editorial. For a 30-min SRE talk this is fine framing — just flag that the examples (LSP, file watchers, repo indexers) are illustrative of a design pattern, not a named protocol like MCP.
- **Proposed revision:**
  > Ambient context sources: a design pattern some harnesses use — language-server diagnostics, file watchers, repo indexes — where context is injected into the model's input window without a tool call the model requested. Examples: Cursor's codebase index, Continue's context providers. Not standardized the way MCP is.

### C2.7 — "Prefill processes the prompt in parallel (compute-bound, fast per token)."

- **Status:** ✅ verified
- **Sources:**
  - [Mastering LLM Techniques: Inference Optimization (NVIDIA)](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
  - [Prefill and Decode for Concurrent Requests (HuggingFace / TNG)](https://huggingface.co/blog/tngtech/llm-performance-prefill-decode-concurrent-requests)
  - [How does LLM inference work? (BentoML LLM Inference Handbook)](https://bentoml.com/llm/llm-inference-basics/how-does-llm-inference-work)
- **Notes:** Prefill processes all prompt tokens in a single forward pass, with attention computed in parallel across the sequence. Because the matmuls are large and dense, it saturates GPU FLOPs — a single long-prompt request can already drive a GPU to peak utilization. "Compute-bound, fast per token" is the standard framing in NVIDIA's and BentoML's guides.

### C2.8 — "Decode generates output one token at a time (memory-bandwidth-bound, slow per token, autoregressive)."

- **Status:** ✅ verified
- **Sources:**
  - [Mastering LLM Techniques: Inference Optimization (NVIDIA)](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
  - [How does LLM inference work? (BentoML)](https://bentoml.com/llm/llm-inference-basics/how-does-llm-inference-work)
  - [Autoregressive Decoding Bottlenecks (apxml)](https://apxml.com/courses/how-to-build-a-large-language-model/chapter-28-efficient-inference-strategies/challenges-autoregressive-decoding)
- **Notes:** Decode is autoregressive by definition — the next token is sampled from a distribution conditioned on all previously generated tokens, creating a sequential dependency. Each decode step is one forward pass that reads the full model weights (tens or hundreds of GB) to emit one token, so the per-step work is dominated by memory bandwidth, not FLOPs. Speculative decoding / lookahead decoding are ways to *partially* break the sequentiality but they don't change the underlying autoregressive contract.

### C2.9 — "This single distinction [prefill vs decode] explains a huge fraction of 'why is this slow.'"

- **Status:** ✅ verified (framing, well-supported by sources)
- **Sources:**
  - [NVIDIA — Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
  - [Prefill vs. Decode Bottlenecks (arXiv 2512.22066)](https://arxiv.org/html/2512.22066v1)
- **Notes:** Both NVIDIA and recent literature treat the prefill/decode split as the first-order lens for understanding LLM serving performance — TTFT (time-to-first-token) is dominated by prefill; per-token latency during streaming is dominated by decode. Disaggregated prefill/decode serving is now a mainstream optimization (see arXiv 2512.22066 and the O'Reilly AI Systems Performance Engineering chapter on disaggregation). Framing is solid.

### C2.10 — "Context-length scaling: linear costs (KV cache memory), quadratic costs (attention compute over the full window)."

- **Status:** ⚠️ needs revision (accurate for naive attention but misleading without caveats)
- **Sources:**
  - [KV Caching Explained — HuggingFace blog](https://huggingface.co/blog/not-lain/kv-caching)
  - [FlashAttention paper (arXiv 2205.14135)](https://arxiv.org/abs/2205.14135)
  - [Sliding Window Attention: Linear Complexity for Long Sequences](https://mbrenndoerfer.com/writing/sliding-window-attention)
  - [What is Grouped Query Attention? (IBM)](https://www.ibm.com/think/topics/grouped-query-attention)
- **Notes:** Both halves of the claim are textbook-correct for vanilla decoder-only transformers:
  - **KV cache memory grows linearly** in context length (for each new token, you append one K and one V vector per layer per head).
  - **Attention FLOPs grow quadratically** in the prefill pass because every query attends to every prior key.

  But production systems in 2026 have moved past the naive baseline in ways that matter for an SRE audience:
  - **FlashAttention** keeps the O(N²) FLOP count but cuts wall-clock 2–4× by reducing HBM accesses. It's now the default kernel in vLLM, TRT-LLM, SGLang, etc.
  - **Grouped-Query Attention (GQA)** and **Multi-Query Attention (MQA)** — used by Llama 2/3, Mistral, Gemma, etc. — keep N query heads but share K/V heads across groups, shrinking KV-cache memory by 4–8× without changing the O(N) growth rate.
  - **Multi-head Latent Attention (MLA)** in DeepSeek-V2/V3 compresses KV into a low-rank latent, cutting cache size by an additional large factor.
  - **Sliding-window attention** (Mistral, Gemma 2) bounds each token's receptive field to a window W, turning attention compute into O(N·W) — linear in N — and enabling a rolling-buffer KV cache that is *constant* in context length.
  - **SSM / Mamba-style** models (and hybrids like Jamba) are linear-complexity by construction.

  For an SRE talk the first-order claim ("KV linear, attention quadratic") is the right mental model, but it should be flagged that modern serving stacks mix in GQA, FlashAttention, and sometimes sliding-window attention, which change the practical curve — e.g., KV memory can be far smaller than the naive formula suggests, and p99 at 128K isn't as bad as an O(N²) extrapolation from 8K would predict.
- **Proposed revision:**
  > Context scaling, first-order: **KV cache memory grows linearly** in context length; **prefill attention FLOPs grow quadratically**. This mental model tells you which costs shrink and which explode as you go 8K → 128K → 1M. Caveat: modern serving systems soften both curves — GQA/MQA/MLA cut KV-cache size by 4–8× or more, FlashAttention cuts attention wall-clock without changing its O(N²) FLOPs, and sliding-window attention (Mistral, Gemma) turns the attention term linear at the cost of long-range fidelity. Useful frame for reasoning; not a load-bearing predictor of absolute latency.

### C2.11 — "Prefix caching, mechanically: the KV cache for a prompt prefix can be reused across requests if the prefix is byte-identical. Hit = skip the prefill entirely for that prefix. Miss = eat the full prefill cost."

- **Status:** ✅ verified
- **Sources:**
  - [Prefix caching — BentoML LLM Inference Handbook](https://bentoml.com/llm/inference-optimization/prefix-caching)
  - [How prompt caching works — PagedAttention & APC (Sankalp)](https://sankalp.bearblog.dev/how-prompt-caching-works/)
  - [Anthropic prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- **Notes:** All sources describe the same underlying mechanism: the KV tensors computed during prefill for a prefix are retained; a subsequent request whose token prefix matches byte-for-byte can skip prefill for the cached portion and begin computing only from the first divergent token. Anthropic's docs explicitly state "Cache hits require 100% identical prompt segments, including all text and images up to and including the block marked with cache control." Spine wording is correct.

### C2.12 — "Cache key is byte-stable — a single character drift kills the hit."

- **Status:** ✅ verified
- **Sources:**
  - [Anthropic prompt caching docs — "Exact Matching: Cache hits require 100% identical prompt segments"](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
  - [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)
  - [Gemini context caching docs — "Cached content is a prefix to the prompt"](https://ai.google.dev/gemini-api/docs/caching)
- **Notes:** Confirmed for all three major providers. OpenAI: "Cache hits are only possible for exact prefix matches." Anthropic: exact-match required. Gemini: cached content must be a prefix. None of the three offer semantic / fuzzy matching at the prefix-cache layer. One nuance: the match is technically *token-identical* (after tokenization) rather than literal-byte-identical, but in practice a single character change upstream of a boundary can shift the tokenization and destroy the match — so "byte-stable" is a fine pedagogical frame.

### C2.13 — "You pay for cache writes (Anthropic, OpenAI, Google all expose this)."

- **Status:** ⚠️ needs revision (only Anthropic charges a premium for writes; OpenAI is free on write; Gemini bills writes at standard input rate + storage)
- **Sources:**
  - [Anthropic prompt caching docs (1.25× for 5m cache writes, 2× for 1h cache writes, 0.1× for reads)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
  - [OpenAI prompt caching announcement ("has no additional fees")](https://openai.com/index/api-prompt-caching/)
  - [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)
  - [Gemini API pricing (cache reads at ~10% of input rate; storage billed per token-hour)](https://ai.google.dev/gemini-api/docs/pricing)
  - [Gemini context caching docs](https://ai.google.dev/gemini-api/docs/caching)
- **Notes:** The three providers are **structurally different** on cache economics, and the current wording conflates them:

  | Provider | Cache write cost | Cache read cost | Storage cost | Control model |
  |---|---|---|---|---|
  | **Anthropic** | 1.25× input (5m TTL) or 2× input (1h TTL) | 0.1× input | none beyond write premium | Explicit (`cache_control` breakpoints, up to 4) |
  | **OpenAI** | Same as normal input (no premium) | 0.5× input (GPT-4o era; varies by model) | none | Automatic for prompts ≥ 1024 tokens |
  | **Google Gemini** | Standard input rate | ~0.1× input | **separate storage fee per-token-hour** (e.g. $1 / 1M tokens / hour) | Both: implicit (auto, default on 2.5+) and explicit (API-managed, with storage fee) |

  So "you pay for cache writes" is only distinctly true for Anthropic (who charges a *premium* above base input). For OpenAI, caching is literally free — you just pay the normal input price you'd pay anyway, and get a discount on future hits. For Google, writes are priced like normal input, but *storing* the cache over time costs extra (explicit caching only).
- **Proposed revision:**
  > Prefix caching economics vary by provider: Anthropic charges a premium on cache writes (1.25× for 5-min TTL, 2× for 1-hour TTL) and a ~10× discount on reads, and requires you to explicitly mark cache breakpoints. OpenAI's prompt caching is automatic for prompts ≥1024 tokens, free to write (you just pay the normal input rate), and roughly ~50% off on reads. Google Gemini offers implicit caching (automatic, no storage fee, ~90% read discount on 2.5+) and explicit caching (you pay a per-token-hour storage fee to keep a cache alive). All three reward stable prefixes; only Anthropic makes writes cost more than the uncached path.

### C2.14 — "Entries are subject to TTL eviction; long-idle agents pay cold-start every time."

- **Status:** ✅ verified
- **Sources:**
  - [Anthropic prompt caching docs — "5-minute ephemeral cache, 1-hour extended"](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
  - [OpenAI prompt caching guide — "5 to 10 minutes of inactivity, up to a maximum of one hour"](https://developers.openai.com/api/docs/guides/prompt-caching)
  - [Gemini context caching docs — "default TTL 1 hour"](https://ai.google.dev/gemini-api/docs/caching)
- **Notes:** All three providers enforce TTLs:
  - **Anthropic:** default 5 min, extended 1 h (opt-in, at 2× write cost). Cache refreshes at no cost on each hit within TTL.
  - **OpenAI:** 5–10 min typical eviction; 1 h max under memory pressure; extended retention up to 24 h available as an opt-in.
  - **Gemini:** TTL configurable (no minimum or maximum bound) for explicit caching; default 1 h. Implicit caching TTL is not user-configurable.

  "Long-idle agents pay cold-start every time" is accurate — if you don't hit the cache within the TTL window, the KV is evicted and the next request eats full prefill.

### C2.15 — "Chatty/non-deterministic system prompts silently destroy your hit rate."

- **Status:** ✅ verified (as a consequence of byte-identical matching)
- **Sources:**
  - [Anthropic prompt caching docs — "if that block changes (timestamps, per-request context...), the prefix hash never matches"](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
  - [Simon Willison's discussion of prompt-caching discipline](https://sankalp.bearblog.dev/how-prompt-caching-works/)
- **Notes:** Direct implication of byte-stable prefix matching. Anthropic's own docs call out that a changing timestamp or per-request context block in the cached prefix silently breaks the hit — the failure mode is silent because `cache_creation_input_tokens` and `cache_read_input_tokens` both go to zero, no error is returned. "Silently destroy" matches Anthropic's own language.

### C2.16 — "The SRE bridge: treat this like any other cache discipline you already know — key stability, TTL semantics, eviction behavior, write amplification."

- **Status:** ✅ verified (framing, well-supported)
- **Sources:**
  - [Anthropic prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
  - [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)
- **Notes:** The four properties named — key stability, TTL, eviction, write amplification — are all exposed directly by provider docs and map cleanly to familiar cache-discipline concepts (CDN, HTTP cache-control, Redis, etc.). Write amplification is the one worth emphasizing for the SRE audience: Anthropic's 1.25×/2× write premium literally IS a write-amplification penalty you pay if you over-fragment breakpoints or churn the prefix.

## Open questions for Bryan

1. **"Ambient context" framing (C2.6).** There's no vendor-defined category here — it's a pedagogical grouping of "stuff that lands in context without a tool call the model requested." Suggest rewording to explicitly name it as a design-pattern observation and cite a concrete example harness (Cursor's codebase index, Claude Code's `/init` CLAUDE.md injection, etc.) so the audience has something to anchor to.

2. **Whether to name specific providers in the caching block.** The cross-provider table in C2.13 is genuinely useful for an SRE audience, but it's also the fastest-moving piece of the deck — prices and TTLs change. Decide whether to bake specifics into slides or keep the deck price-agnostic with a "check vendor docs" pointer.

3. **How deep to go on attention variants (C2.10).** The spine's simple "linear KV, quadratic attention" is the right first-order mental model but leaves out GQA/FlashAttention/SWA/MLA. For a 30-min SRE talk there probably isn't room for a full treatment — my recommendation is one throwaway slide/caveat that says "real systems soften both curves; if you're reasoning about why your p99 at 128K isn't as bad as the formula predicts, this is why." But worth a deliberate decision rather than leaving it as-is.

4. **Skills wording (C2.4).** Proposed revision reframes skills as "instruction bundles loaded on description-match" rather than "instruction + tool bundles invoked by name." Confirm that matches the audience takeaway you want — the "bundle of tools" framing is common in the wild but doesn't match how Anthropic actually describes them.
