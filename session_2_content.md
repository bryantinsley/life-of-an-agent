# Session 2 — Extending the agent & how inference actually runs

**Audience promise:** By the end, you can name what's actually growing your context window and why the same prompt run twice can be 10× cheaper or 10× slower depending on what came before it.

**Block structure:** Block 2.1 (~15–18 min) is the agent extension model — tools, protocols, sub-agents, and the frame that ties them together. Block 2.2 (~25–27 min) is the inference mechanics: the two phases of a request, why context length isn't a flat cost, and the caching layer that can make an enormous difference in what you actually pay.

---

## Block 2.1 — Extending the agent · ~15–18 min

---

### Slide 1 — A quick recap

**Intent:** Reorient the room and bridge from Session 1 without a full review.

**Content:**
Last session: the agent is a loop. The model sees its context window, produces a message, the harness executes any tool calls in that message, and the results go back into context. The system prompt is the load-bearing persistent surface. Everything else is transient.

Today we're asking two questions. First: how does an agent get capabilities beyond text generation — where do tools come from, how do sub-agents work, what's the "ambient context" that harnesses inject without you asking? Second: once we have a picture of the whole system, how does that system actually run, and what determines what it costs and how fast it goes?

**Visual hint:** The same loop diagram from Session 1, very small — just a reference marker to establish continuity. One or two sentences of text identifying where today's two questions land: "Block 1: how the agent extends outward" (pointing at tools/harness) and "Block 2: how the inference runs" (pointing at the model and its compute).

**Speaker notes:** Don't do a full recap — assume the loop diagram is familiar. Use this slide as a 60-second bridge, then move on.

---

### Slide 2 — Tools: a protocol, not magic

**Intent:** Demystify tool use — make it clear it's a structured text protocol, not a special inference mode.

**Content:**
Tool use — the mechanism that lets an agent read files, run code, search databases — is implemented as a text protocol. The model produces a message that contains a structured block in a specific format (usually JSON) that says: "I want to call this tool, with these arguments." The harness pattern-matches that output, runs the appropriate function, and appends the result to the context as another message.

That's the entire mechanism. There's no special reasoning mode, no separate planning engine. The model learns to emit tool-call-shaped output as part of training; the harness handles the execution. The model doesn't "know" what tools do in any deep sense — it knows the tool descriptions it was given in the system prompt and produces calls that match them.

A consequence worth noting: if a tool description in the system prompt is misleading or ambiguous, the model will call the tool in the way the description suggests, not the way the tool actually behaves. The system prompt is doing real work.

**Visual hint:** Simple message sequence: model output box with a JSON-shaped block inside it (showing a tool call structure: `{tool: "read_file", args: {path: "..."}}`) → harness box executing → tool result box → back into context. The message format is the point: it's just text with a specific shape.

**Speaker notes:** The "how does it know to call the tool" question always comes up. The answer: the tool description in the system prompt, the training data that showed the model tool-call-shaped outputs, and the context of the current task all push the model toward producing a well-formed tool call. It's a learned text pattern, not a special capability.

---

### Slide 3 — MCP: what changes when the protocol is standardized

**Intent:** Explain MCP as a standardization layer, and why that matters for the ecosystem — not as a product feature.

**Content:**
Tool integrations used to be bespoke: every harness had its own format for tool definitions, every integration had to be written specifically for that harness. If you wanted the same tool to work in three different environments, you wrote three implementations.

MCP — the Model Context Protocol — is an attempt to standardize the shape. An MCP server exposes tools in a common format; any harness that speaks MCP can consume those tools without a custom integration. One implementation, many runtimes.

Why this matters for you: if you build a tool that exposes your internal systems to an agent, you get to decide once what that tool looks like. If the harness changes (Jetski gets replaced, or you add another environment), the tool doesn't have to be rewritten.

MCP is gaining adoption but isn't universal yet. Not every harness speaks it, not every tool is an MCP server. Think of it as the direction the industry is moving toward, not the present-day assumption you can make everywhere.

**Visual hint:** Before/after diagram. "Before standardization": three harnesses, each with their own arrow to each tool — a tangled web. "After MCP": three harnesses all pointing at one MCP server, which exposes the tools. The reduction in connective complexity is the point.

**Speaker notes:** MCP is worth knowing about, but don't over-invest in it as a present-day planning assumption. The useful takeaway is: when you're deciding whether to build a tool as a generic REST endpoint vs an MCP server, there's a real ecosystem reason to prefer MCP if your harness supports it.

---

### Slide 4 — Skills: procedural knowledge on disk

**Intent:** Distinguish skills from tools — skills are instruction bundles, not new capabilities.

**Content:**
A tool gives an agent a capability it can invoke: read a file, run a query, post a message. A skill is different: it's a bundle of instructions, and optionally supporting files — templates, examples, reference docs — that an agent loads when its description matches the current task.

In Claude Code, skills live on disk as markdown files. When you invoke one — say, a `/review` skill — the harness loads that file into the agent's context and it behaves according to the instructions inside. The agent's underlying tool access doesn't change; the skill just gives it a structured procedure to follow for a specific task.

The distinction that matters: a tool expands what the agent can do. A skill shapes how it does what it can already do. "Deploy the service" is a tool-access question. "Do a security review" is a skill question — the agent already knows how to read code and open issues; the skill tells it what to look for and how to structure the output.

**Visual hint:** Diagram showing a skill file (a document icon, contents: bulleted instructions) being loaded into the context window alongside the user's request. The agent's tool set (read, write, search, etc.) is shown separately and unchanged. The skill doesn't extend the tool set; it extends the instruction surface.

**Speaker notes:** This is a practical pattern for the team to know. If you have a recurring task with a consistent approach — incident review, change risk assessment, test coverage audit — writing a skill is cheaper than trying to encode it all in a single prompt every time. It's reusable procedure, stored outside the model.

---

### Slide 5 — Sub-agents: a fresh context for a scoped task

**Intent:** Explain sub-agents as context isolation, not as a capability or intelligence multiplier.

**Content:**
Sometimes the right design for a task is to spawn a child agent with its own context window. The parent agent defines the task, spawns the sub-agent, and — when the sub-agent finishes — reads the result back into its own context.

Why you'd want this: isolation. A sub-agent that's doing code review doesn't need to carry the full conversation history of the parent agent's run. Starting with a clean context means the sub-agent's context window is used entirely for the task at hand, rather than being half-consumed by context from a different task.

It also lets long runs stay within context limits: rather than one agent accumulating everything, you break the work into pieces and fan them out. Each sub-agent operates in its own bounded window; only the output comes back to the parent.

The thing that doesn't change: a sub-agent is just another instance of the agent loop. It's not smarter than the parent, doesn't have special capabilities, and can't access context the parent hasn't explicitly given it. It's parallelism and isolation, not a reasoning upgrade.

**Visual hint:** Simple parent-child diagram: parent agent → spawns sub-agent (shown as a separate, smaller loop box) → sub-agent result feeds back into parent context. The key annotation: "sub-agent has its own context window, not a copy of parent's." Could show two separate context window rectangles.

**Speaker notes:** The common mistake with sub-agents is expecting them to have access to context the parent didn't pass. They only know what you give them. When sub-agents produce wrong or incomplete results, the usual cause is incomplete task specification at the point of spawning, not model quality.

---

### Slide 6 — Ambient context

**Intent:** Name the pattern of context injection that happens without an explicit tool call.

**Content:**
Beyond tools and skills, there's a pattern worth naming: context that gets injected into the agent's input window by the harness, without the model requesting it through a tool call. Call it ambient context.

Examples: when Claude Code starts in a project, it reads CLAUDE.md and injects it into the system prompt automatically. Some coding environments inject live language-server diagnostics — type errors, lint warnings — as the session runs. A harness built on top of a code search index might inject relevant file snippets based on what the model is currently working on, without the model having to search explicitly.

This isn't a standardized thing the way MCP is. It's a design pattern — a decision the harness builder makes about what context to maintain and when to inject it. Jetski has its own version of this; Claude Code has another. The specifics vary.

Why it matters: ambient context is invisible to the model's explicit reasoning. It's there, it shapes behavior, but the model didn't ask for it and may not "know" it came from a specific source. If an agent is behaving differently than you expect, ambient context injected by the harness is a possible explanation.

**Visual hint:** Context window diagram with three layers of input labeled by source: "system prompt" (harness-defined), "user message" (you), and "ambient injections" (harness, automatic) — shown as an additional band that flows in on the side without an explicit tool-call arrow. The point is that not all context comes from the user or from tool results the model requested.

**Speaker notes:** This is mostly a "know it exists" slide. When you're debugging surprising agent behavior and the system prompt looks fine, ask: what is the harness injecting automatically? That question won't always have an obvious answer — sometimes you have to read the harness implementation — but it's the right question to ask.

---

### Slide 7 — The unifying frame: everything is context injection

**Intent:** Tie together tools, MCP, skills, sub-agents, and ambient context into one simple frame before the session's harder half.

**Content:**
There's a unifying way to see everything we've just covered. Tools, skills, sub-agents, ambient context, the system prompt itself — they're all just different answers to the same question: how does information get into the context window?

Tools: the model requests an operation, the harness runs it, the result comes back as a context message.
Skills: the harness loads instruction content into the context at invocation.
Sub-agents: a new loop with a new context window, result injected into the parent.
Ambient context: harness injects automatically, without a model request.
System prompt: harness pins to every turn.

The differences are in who controls the injection, when it happens, and what lifecycle it has. Once you see them all as context injection with different control surfaces, the proliferation of primitives stops looking like complexity and starts looking like a design space.

**Visual hint:** A single context window diagram with each injection source labeled and color-coded: system prompt (violet, pinned), tool results (blue, on-demand), skill content (green, on-invocation), ambient injections (yellow, automatic). The diagram is the frame itself — same container, different sources.

**Speaker notes:** This frame becomes directly useful in Session 3 when we talk about harness design. "How do I make the agent know X" almost always reduces to "how do I get X into the context window, and who should control that injection, and what lifecycle should it have." That's the question the harness builder is always answering.

---

## Block 2.2 — How inference actually runs · ~25–27 min

---

### Slide 8 — Section opener: how inference works

**Intent:** Signal the shift to inference mechanics. One beat, then move.

**Content:**
Now we pull back from the logical structure of the agent and ask: when a request hits the model, what actually happens computationally? Understanding this explains most of the cost and latency profile you'll observe in production — and sets up the caching story, which has real operational implications.

**Visual hint:** Simple section-opener slide. No diagram needed — just the header and a brief framing line.

**Speaker notes:** This section is denser than Block 2.1. Give it a little space. The payoff — the prefix caching mechanics and what they mean for billing — is practically useful and something most SREs haven't thought about yet.

---

### Slide 9 — Prefill and decode: two very different operations

**Intent:** Establish that inference has two distinct phases with different cost profiles. This is the foundational distinction for everything that follows.

**Content:**
A language model inference request has two distinct phases, and they behave very differently.

**Prefill** is when the model processes the input — your prompt, the system prompt, all the context. This happens in parallel: all the input tokens are processed simultaneously. It's compute-bound and fast on a per-token basis. It also produces the KV cache — a data structure that stores the internal state for each input token, so the model doesn't have to recompute those tokens when generating the response.

**Decode** is when the model generates the output — one token at a time. Each token depends on all previous tokens, so this phase is inherently sequential. It's memory-bandwidth-bound rather than compute-bound, and it's slow per token. The KV cache from prefill gets extended as each new token is generated.

These two phases have different bottlenecks, different scaling behavior, and different optimization levers. "Why is this slow?" almost always resolves into "which phase is dominating, and what's constraining it."

**Visual hint:** Timeline diagram showing a single request as a horizontal bar: a shorter "prefill" segment (labeled: parallel, compute-bound, processes all input tokens at once) followed by a longer "decode" segment (labeled: sequential, memory-bandwidth-bound, one token at a time). Could include rough relative times for a realistic example: 200ms prefill vs 2s decode for a moderate prompt.

**Speaker notes:** This distinction will show up in the latency numbers your monitoring sees. Time-to-first-token is dominated by prefill. Time-per-output-token is dominated by decode. When you're trying to understand a latency regression, knowing which phase changed is the first question.

---

### Slide 10 — Context-length scaling: the two curves

**Intent:** Give a first-principles mental model for how costs scale with context length.

**Content:**
As context windows get longer, two things grow — and they grow at different rates.

KV cache memory grows roughly linearly with context length. Each token in the input contributes a fixed amount of state to the cache; double the context, roughly double the memory. For very long contexts (hundreds of thousands of tokens), this becomes a real memory pressure problem on the serving infrastructure.

Prefill attention computation grows quadratically with context length. The attention mechanism — the part of the model that lets tokens "look at" each other — requires each token to attend to every other token. At 128K tokens, the attention computation is on the order of 128K² operations. Go from 8K to 128K context and you've multiplied attention FLOPs by about 256×.

In practice, modern serving stacks soften both of these curves significantly — we'll cover how in a moment. But this first-order model is useful: it tells you which workloads are expensive and why, and it shapes your intuition for what changes when you move from a typical chat-length context to a long-document or long-running-agent context.

**Visual hint:** Graph with context length on the X axis and two curves: a roughly linear "KV cache memory" curve and a steeper "attention FLOPs" curve. Annotate a few points: 8K, 32K, 128K, 1M. The visual key is the curve shapes, not precise values.

**Speaker notes:** The quadratic attention cost is the reason "just give it a million token context window" isn't free — and why the industry has invested heavily in making it cheaper. We'll cover the main techniques briefly, but knowing the underlying reason helps you evaluate claims about long-context efficiency. "We support 1M tokens" and "it costs the same as 8K tokens" are not the same statement.

---

### Slide 11 — What softens the curves

**Intent:** Briefly cover the main techniques that reduce the scaling costs, so the audience has a vocabulary for them without needing the full technical story.

**Content:**
The quadratic and linear scaling behaviors described on the last slide represent the naive baseline. In practice, production serving stacks use several techniques to reduce these costs significantly:

**GQA / MQA** (grouped-query and multi-query attention): reduces the size of the KV cache by sharing key-value heads across groups of query heads. Cuts KV memory by 4–8× on typical models, without meaningfully degrading quality. Most modern large models use some form of this.

**FlashAttention**: a reordering of the attention computation that avoids materializing the full attention matrix in GPU memory, dramatically reducing memory bandwidth use. It doesn't change the theoretical O(N²) FLOP count, but it significantly reduces wall-clock time and memory usage in practice.

**Sliding window attention**: limits each token's attention to a local window of nearby tokens rather than the full context. Turns the quadratic term linear at the cost of reduced global context within a layer. Used in some model families; tradeoff is that very distant context may not attend directly (often mitigated with hybrid full-attention layers).

The upshot: the first-order scaling model from the last slide is the right intuition for why long context is expensive. The actual numbers are friendlier than the naive baseline — but they're not flat.

**Visual hint:** The same curve chart from the previous slide, but with an overlay showing how each technique shifts the curves: GQA/MQA compresses the memory curve; FlashAttention doesn't change the FLOP curve but shrinks wall-clock; sliding window bends the attention curve from quadratic toward linear. Approximate, not precise.

**Speaker notes:** The audience doesn't need to understand how these work — just that they exist and what effect they have. The practical use: when you see a provider claim "efficient long context," these are the techniques behind it. The follow-up question to ask is: efficient compared to what baseline, and at what quality tradeoff?

---

### Slide 12 — Prefix caching: the mechanism

**Intent:** Explain what prefix caching is mechanically before getting to why it matters for billing.

**Content:**
The KV cache produced during prefill represents a lot of computation: for a long prompt, it may be hundreds of milliseconds of GPU work. If you're running many requests that share a common prefix — the same system prompt, the same base instructions — you're paying to compute that prefix's KV cache on every single request.

Prefix caching changes this: if the beginning of a request is byte-for-byte identical to a prior request that's still in the cache, the provider can skip computing that prefix's KV state and load the cached version instead. The request effectively skips prefill for the cached portion and jumps straight to decode.

Two things follow from how this works:

**Key stability matters.** The cache key is the actual bytes of the prompt. A single character difference between requests kills the cache hit — the tokenizer produces a different sequence, the KV states don't match, you pay full prefill cost. A system prompt that includes a timestamp, a random request ID, or any dynamic content will have a zero hit rate.

**TTL eviction is real.** Cache entries don't live forever. Providers have TTLs — typically minutes to an hour — after which a cache entry is evicted. An agent that idles between runs, or a low-volume use case, will pay cold-start cost on every request because the cache is always cold.

**Visual hint:** Two-row sequence diagram. Top row: "cold request" — full prefill block (large, labeled "full prefill cost"), then decode. Bottom row: "warm request (cache hit)" — a very small "check cache" block, then decode starting immediately. The contrast in the prefill block size is the visual punchline.

**Speaker notes:** The failure mode that kills prefix cache hit rates in the wild is almost always key instability — something dynamic in the "stable" part of the prompt. Timestamps in system prompts are a classic. Before you assume caching is working, check that the prefix you're trying to cache is actually byte-stable across requests.

---

### Slide 13 — Prefix caching as cloud-provider economics

**Intent:** Map the caching mechanics onto the billing reality across providers — and land the operational implications.

**Content:**
All three major providers support prefix caching, but they bill it differently — and the differences have real operational implications.

**Anthropic (Claude):** Explicit cache control — you mark the cache breakpoint in your prompt. Cache writes cost a premium (1.25× the normal input token price for a 5-minute TTL; 2× for a 1-hour TTL). Cache reads are heavily discounted (~10× cheaper than uncached). This model rewards you for being intentional: if you design your prompts for caching, you get a significant discount; if you don't, you pay a write premium for nothing.

**OpenAI:** Automatic caching for prompts above a minimum length threshold. Cache writes cost the same as uncached prefill — no premium. Cache reads are roughly half price. Lower operational overhead because you don't have to opt in; the tradeoff is less predictability about what's being cached.

**Google Gemini:** Two tiers. Implicit caching is automatic, free to write, and discounts reads substantially on newer models. Explicit context caching lets you pay a per-token-per-hour storage fee to keep a cache alive longer than the implicit TTL — useful for long-lived system prompts in high-volume settings.

Across all three: the SRE concerns are the same as any caching system. Key stability. TTL semantics. Write amplification (paying for cache writes on keys that never get hits). The mental model is familiar; the billing shapes are new.

**Important note for delivery: re-verify these pricing specifics the week of the session. Provider pricing in this area moves fast — numbers here are accurate as of production of these materials, but they may have changed.**

**Visual hint:** Three-column comparison table — one column per provider. Rows: "cache control" (explicit vs automatic), "write cost," "read discount," "TTL." Keep it scannable rather than exhaustive. A note at the bottom: "verify before presenting — pricing changes frequently."

**Speaker notes:** The actionable takeaway for the group: if your team uses any of these providers at volume, there's real money in prompt structure. A high-volume use case with a stable, well-structured system prompt and explicit cache marking (on Anthropic) or automatic caching (on OpenAI/Gemini) can see substantial per-request cost reduction. If you're not thinking about this, you're probably leaving savings on the table.

---

### Slide 14 — The SRE bridge: caching is caching

**Intent:** Make the conceptual connection to caching discipline the audience already knows.

**Content:**
There's nothing fundamentally new in what we've just described. Prefix caching follows exactly the same principles as every other cache you work with:

Cache key stability determines hit rate. If the key changes on every request, you have zero hits and you're paying write cost for nothing.

TTL semantics determine warm vs cold. An idle application with a 5-minute TTL cache will always be cold when it wakes up. Design your request patterns around the TTL, not against it.

Write amplification is a real cost. If you're writing to the cache on every request but the key never repeats, you've turned an optimization into overhead.

The difference from a memcached or CDN cache: the key is a token sequence, the value is a KV state tensor, and the eviction policy is the provider's, not yours. But the design questions are identical.

**Visual hint:** A small comparison table: two columns — "CDN / memcache" and "Prefix cache." Rows: "cache key" (URL path / token sequence), "cache value" (asset bytes / KV state), "TTL control" (your config / provider's TTL), "miss cost" (origin request / full prefill). The structure is the same; the details differ.

**Speaker notes:** If the group has a lot of CDN or caching experience, this slide may feel obvious. That's fine — the point is explicit permission to apply existing mental models. The SREs who have the worst cache key stability problems are usually the ones who never connected the AI billing problem to the caching problem they already know how to think about.

---

### Slide 15 — Close

**Intent:** Land the session and bridge to Session 3.

**Content:**
Today's two takeaways:

Everything that extends an agent — tools, sub-agents, skills, ambient context — is ultimately context injection with different control surfaces. When you're thinking about agent capabilities, you're thinking about what gets into the context window and who controls it.

Inference cost isn't a flat number. It's two phases with different bottlenecks, a cache layer that can dramatically change what you pay per request, and billing shapes that reward prompt design discipline. An SRE who understands the prefill/decode split and designs for cache key stability will spend noticeably less than one who doesn't.

Next session: we go from individual agent runs to autonomous agents — what changes when no human is in the loop, what the harness has to do differently, and what new failure modes appear.

**Visual hint:** Clean close slide. Two bullet points restating the two takeaways, tightly worded. No headers, no elaborate structure.

**Speaker notes:** Leave room for Q&A. The caching economics conversation usually generates questions — people want to know what their actual spend looks like and whether they're getting cache hits. If anyone is actively running something at volume, that's a good live debugging conversation.
