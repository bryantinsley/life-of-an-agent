# Session 1 — The agent loop & what's inside the model

**Audience promise:** By the end, you can sketch what an agent actually does turn-by-turn, and you have a working model of what's structurally different between the LLMs you've heard named in the news.

**Block structure:** Block 1.1 (~15–18 min) is the loop and the context window — the part most people don't have a crisp picture of even after using these tools for months. Block 1.2 (~25–27 min) is the architecture of the model itself — denser, more unfamiliar, but the thing that explains a lot of behavior people currently chalk up to "the model is weird."

---

## Block 1.1 — What an agent actually does · ~15–18 min

---

### Slide 1 — A concrete task

**Intent:** Ground the session in something everyone already knows, before introducing any vocabulary.

**Content:**
Start with a task anyone on the team could have given their AI tools last week: "Draft a code change to fix this bug." Don't start with definitions. Start with the story of what happens next — told turn by turn, before naming any of the moving parts.

This is the whole session in miniature: we're going to slow this moment down until we can see each step, then spend the rest of the session understanding what's inside each box.

**Visual hint:** Single line of terminal input or chat prompt: `> draft a change to fix this bug`. Clean, no decoration. The visual is just setting the stage.

**Speaker notes:** Don't introduce the word "agent" or "loop" yet. Just say: let's walk through what actually happens when you send that message. The vocabulary will come in naturally over the next few slides.

---

### Slide 2 — One turn, step by step

**Intent:** Show the mechanics of a single turn without vocabulary first. Make the structure visible before naming it.

**Content:**
The model reads your message. It produces a response — and that response contains a tool call: maybe "read this file" or "run this test." The surrounding system — call it the harness for now — executes the tool. The result comes back. The model reads the result and produces the next response. Which may contain another tool call. This continues.

That's it. Everything else we'll discuss today is either naming parts of this sequence, or understanding what's inside each step.

**Visual hint:** Left-to-right sequence diagram: `user message` → `[context]` → `model` → `tool call` → `harness` → `tool result` → `[context]` → `model` → `...` (arrow loops back). Labels should be minimal — this is meant to read at a glance, not as a reference diagram. The loop arrow is the key visual element.

**Speaker notes:** Take this slowly. Most people have used these tools but haven't seen this spelled out. The goal of this slide is just: there's a loop, it's regular, it has identifiable steps. Nothing mysterious yet.

---

### Slide 3 — The loop as a control structure

**Intent:** Name the pattern and make clear that "agent" is just a name for this loop running.

**Content:**
The pattern has a name: the agent loop. But it's worth being precise about what that name covers, because it's structurally very simple:

The model produces a message. If the message contains tool calls, the harness executes them and appends the results to the context. The model produces the next message. This continues until either the model signals it's done (by producing a message with no tool calls, or an explicit stop token), or the harness cuts it off because it's exceeded a budget, a step limit, or a time limit.

That's the entire control structure. There's no hidden reasoning engine, no planning layer, no memory database — at least not by default. Just the loop.

**Visual hint:** The same sequence diagram from slide 2, now simplified into a "while loop" visual — emphasize the cycle and the two exit conditions: `model signals done` and `harness stops it`. Could be rendered as a simple flowchart.

**Speaker notes:** "Why does it keep going in circles?" — this is why. "Why did it stop before it was done?" — something tripped the exit condition. Most questions about agent behavior reduce to something about this loop. The useful habit is: when something goes wrong, figure out where in the loop it went wrong.

---

### Slide 4 — The system prompt

**Intent:** Establish that the system prompt is the operating environment, not just an opening message.

**Content:**
There's one part of the context that the harness treats differently from everything else: the system prompt. It's pinned to every turn. No matter how long the run gets, no matter how much context gets compressed or dropped, the system prompt comes back.

It's where the harness puts the things the model needs to know on every single turn: which tools exist and what they do, behavioral rules, operating instructions, any project-specific context that should always be in scope. In Claude Code, this includes the contents of CLAUDE.md files. In Jetski, it's what the harness compiles before it starts calling the model.

The rest of the context — the user messages, the tool results, the model's previous responses — is transient. Once the context fills and the harness compacts or scrolls it, that material may be gone or summarized. The system prompt is the one thing that isn't.

**Visual hint:** Context window schematic with two regions: a fixed band at the top labeled "system prompt — always present" and a taller region below labeled "conversation — may be summarized or dropped." The visual contrast (perhaps in color or border weight) between pinned and transient is the point.

**Speaker notes:** Ask the group: when you use Jetski, do you know what's in the system prompt you're running on? Most won't. That's fine — the point isn't to memorize it. The point is: whoever built the harness made decisions there, and those decisions shape every interaction. If the model is doing something you don't expect, sometimes the answer is in the system prompt.

---

### Slide 5 — The context window is the model's only world

**Intent:** Reframe "why did it forget X" as a scoping question, not a reliability question.

**Content:**
The model has no memory of prior conversations, no access to external state, no awareness of anything that happened before this run — except for what's explicitly present in its context window right now.

When someone says "the model forgot X," they almost always mean: X was never in this context. The model isn't being forgetful; it's responding to exactly what's in front of it. That's not a quirk to work around — it's the fundamental architecture. The model is a function that takes the context window as input and produces the next token as output. Everything about its behavior follows from that.

The practical implication: when an agent does something wrong that it "should have known better about," the first question to ask is: was the relevant information actually in the context? Usually the fix is about what you put in scope, not about the model's quality.

**Visual hint:** Context window rendered as a literal window frame — content inside the frame is in full color; outside is dark/black. Could include a small example: a stack of tool results and messages inside the frame, with a note like "prior conversation — not visible here" outside it.

**Speaker notes:** This is one of the most useful reframes in the session for daily use. When debugging agent behavior, "was X in context?" is usually a faster path to the answer than "why did the model fail?" The model is probably doing exactly what you'd expect given what it could see.

---

### Slide 6 — Tokens, not words

**Intent:** Give the mental model for context costs and limits that will pay off in Session 2 when we get to inference pricing.

**Content:**
Everything in the context window — messages, tool results, file contents, code — is measured in tokens. Not characters, not words. A token is roughly 3–4 characters of English prose, though it varies: common words are often a single token, rare words may be split across several. Code tends to tokenize efficiently because keywords and common patterns are in the model's vocabulary.

What this means practically: a context window advertised as "128K tokens" holds roughly 90,000 words of typical prose, or considerably more code. Every file you read, every tool result the harness injects, every turn the model takes — it all has a token count, and those counts add up across a long run. The session where you ask the agent to read ten files and iterate on them twelve times is not twelve times as expensive as a single turn — it can be much more.

This matters for two things you already reason about: what fits in a single request (context-limit errors are a token-budget problem), and what you're paying per run (inference pricing is per-token, and it compounds across turns).

**Visual hint:** Short example sentence tokenized visually: show the actual token boundaries for something like `The deployment failed at 14:23 UTC` — you can approximate this with color-coded segments. Alongside it, a brief note: "Code is denser — keywords and patterns tokenize efficiently." Rough rule of thumb: 1K tokens ≈ 750 words prose.

**Speaker notes:** We'll come back to this in more depth in Session 2 when we talk about how inference actually runs and what affects the cost. For now, the useful rule of thumb: big file reads are expensive, verbose tool output is expensive, long runs are more expensive than they look because the context compounds.

---

## Block 1.2 — What's actually inside the model · ~25–27 min

---

### Slide 7 — Section opener: what's inside

**Intent:** Signal the shift from "what the agent does" to "what the model is." Keep it brief — just set the expectation.

**Content:**
The first half was the loop — the structure around the model. Now let's look at the model itself. Not how to prompt it or use it better. Just what it actually is, architecturally. The reason: some behaviors that feel random or inexplicable make more sense once you know what's generating them.

**Visual hint:** Can be a simple title slide — no diagram needed here. Maybe the same "box diagram" from slide 2 with just the "model" box highlighted or enlarged.

**Speaker notes:** This is the denser half. Not harder to follow, just further from anything they've seen before. The payoff is that a couple of the architectural facts explain things that currently feel like magic or inconsistency.

---

### Slide 8 — Two architectures in production: dense vs. MoE

**Intent:** Introduce the dense/MoE distinction in terms of what it means operationally, not theoretically.

**Content:**
All the major language models fall into one of two architectural families — and the family matters for how the model runs.

**Dense models** activate every parameter on every token. The whole network participates in generating each word. This is the simpler design, and it was dominant in the earlier generations of large language models.

**MoE models** — mixture of experts — route each token through a small subset of specialized subnetworks. The model has a large number of these subnetworks ("experts"), but each token only travels through a handful of them — typically the top-k chosen by a learned router. The total parameter count is large; the active parameter count per token is much smaller.

The practical consequence: a MoE model can have the knowledge breadth of a large model while running inference at the speed and cost of a much smaller one.

**Visual hint:** Side-by-side diagram. Left panel: dense forward pass — all parameter blocks active (same fill color throughout). Right panel: MoE forward pass — a router block at the top, a few expert blocks lit up with full color, the rest dimmed. Labels: "total parameters" spanning everything on both sides; "active parameters per token" spanning only the lit-up portion on the right. The visual contrast is the point.

**Speaker notes:** The vocabulary here is "dense" and "MoE" — both will come up in documentation, release notes, and discussions about these tools. Worth knowing what they mean. The reason it matters operationally: active parameter count is what drives inference compute, not total parameter count. That's the fact we'll use on the next slide.

---

### Slide 9 — Gemini is MoE

**Intent:** Land the specific architectural fact about the model they use every day.

**Content:**
The models you use at work are Gemini variants. Gemini's architecture, per Google's own published technical reports, is a sparse mixture-of-experts Transformer. That's been the case since at least Gemini 1.5, and subsequent releases have followed the same pattern. Google hasn't published the specific parameter counts — active or total — which is where genuine uncertainty lives. But the architecture itself isn't speculative; it's in the documentation.

What this implies for behavior: the "model as a committee of specialists" intuition is roughly correct. Different kinds of problems — code, reasoning, language, factual recall — likely activate different mixtures of experts. Ask the model something at the boundaries between domains, or something that would route differently on different runs, and you may see meaningful variability from run to run. That's not instability; that's the architecture.

**Visual hint:** Could be as simple as a short direct quote from the Gemini 1.5 technical report alongside the MoE diagram from the previous slide, with an annotation pointing at it: "This is what Gemini is." Alternatively, annotate the diagram with "Gemini" as a label on the right panel.

**Speaker notes:** Don't overstate the "committee" framing — it's an intuition, not a literal description of how routing works. But it's a more accurate mental model than "the model is a single thing with a single answer to each question." The variability you observe in practice is partly noise and partly architecture.

---

### Slide 10 — Model size is not one number anymore

**Intent:** Break the "bigger is better, bigger is slower" mental shortcut and replace it with a two-number model.

**Content:**
For a long time, "how big is the model" was one number: total parameter count. That number told you roughly how capable the model was, how much memory you'd need to host it, and how slow it would run. With MoE, that shortcut breaks.

Now you need two numbers: total parameters and active parameters per token. They tell you different things. Total parameters speaks to knowledge breadth and memory requirements. Active parameters per token speaks to inference compute — how fast each token generates and what it costs.

To make this concrete: a model with 400 billion total parameters but only 17 billion active per token runs inference faster than a dense 100 billion parameter model. The "bigger" model is cheaper to run, because inference cost tracks active parameters, not total. This is a genuinely non-obvious fact if you're carrying the single-number mental model.

**Visual hint:** A small chart or table: a few model examples with two columns, "total parameters" and "active per token." Include at least one dramatically mismatched pair — like a large-total/small-active MoE next to a smaller dense model — to illustrate that total size doesn't predict inference speed. Don't name-drop open-weight models for recognition value; the point is the pattern, not the names.

**Speaker notes:** For this audience: inference cost is what you'll see on your bill and in your latency numbers. Active parameters is what drives that. "This is a very large model" and "this will be slow to run" are no longer the same statement.

---

### Slide 11 — What post-training does (and doesn't)

**Intent:** Correct the widespread misconception that fine-tuning is a way to teach a model new facts.

**Content:**
After a model is trained on its massive pre-training corpus — billions or trillions of tokens of text — it goes through a second stage called post-training. This includes instruction tuning (teaching the model to follow instructions in a helpful format) and a reinforcement learning phase based on human or AI feedback. This is what turns a model that predicts text into a model that has a conversation.

What post-training shapes: behavior. Format adherence, following multi-step instructions, tool-call discipline, tone, how the model handles edge cases it was explicitly trained to handle. These are real and significant differences.

What post-training doesn't shape: the model's factual knowledge and underlying reasoning ability. Both of those were set in pre-training. You can't fine-tune a model to know your internal systems' documentation. You can train it to format its responses differently, or to follow a specific protocol, but the knowledge has to already be in the weights or available at inference time via retrieval.

The practical punchline: "Can we fine-tune it to know our internals?" is a common ask. The accurate answer is: that's a retrieval problem (RAG), not a training problem.

**Visual hint:** Simple two-column visual: "Post-training can shape" (behavior, format, tone, tool discipline) vs "Post-training can't shape" (factual knowledge, reasoning depth, pre-training data). Clean and readable — this is a reference slide.

**Speaker notes:** The "can we fine-tune it to know X" question will come up in your work. The answer is almost always "RAG is the right tool." Fine-tuning shapes how the model talks, not what it knows. If someone pushes back, the cleaner way to say it is: fine-tuning can improve the model's adherence to a style or protocol, but it's not a reliable path to factual knowledge injection.

---

### Slide 12 — What you're actually paying for

**Intent:** Frame model spend as recurring infrastructure rent, not a one-time capital investment.

**Content:**
When you use a hosted AI service — Gemini via Jetski, Claude Code, AI Studio — you're not buying model weights. You're renting access to the provider's current best model and paying for compute on each request. The model the provider runs for you today may not be the same model they run for you next quarter — they upgrade it continuously, often without announcing it as a breaking change.

The pricing structures reflect this. Subscription tiers (like Claude Code Pro) charge a fixed monthly fee for a capacity bucket. Metered access charges per token. "Free preview" surfaces — like early access to new tools — are loss-leaders. Free-tier AI Studio is a data-for-access exchange: your prompts may be used to improve future models. On paid tiers, that use typically doesn't apply.

What this means for how you think about it: model spend is a recurring infrastructure line item with a variable shape, not a one-time training or licensing investment. The thing you're paying for changes every few months. Budget for it the way you budget for cloud compute, not the way you budget for software licenses.

**Visual hint:** Simple diagram contrasting two mental models: "old model: train once, own forever" vs "current reality: rent access, provider updates model, pay for compute." Could be a timeline with periodic model updates on the provider side and a recurring billing shape on the customer side.

**Speaker notes:** This applies directly to Jetski and whatever tools come next. The questions to ask are: what's our inference spend and is it tracking with utility? What just changed on the provider side and does it affect our use? The model you're running on in six months may be meaningfully different from today — plan for that rather than treating the current state as stable.

---

### Slide 13 — When fine-tuning makes sense (LoRA)

**Intent:** Give a clear, honest picture of the narrow window where fine-tuning actually pays off.

**Content:**
There's a technique called LoRA — Low-Rank Adaptation — that makes fine-tuning practical for small teams. Instead of retraining the full model (enormously expensive), you train a small adapter on top of an existing base model. The adapter is small — megabytes — and trains in hours on a single GPU, or for tens to a few hundred dollars of cloud compute time depending on the base model size.

The honest window where this makes sense: you have a recurring task, you have decent labeled examples, and the gap you need to close is behavioral — style, output format, vocabulary, tool-call discipline. These are things fine-tuning can actually change. You've iterated on prompts and hit a ceiling, and the gain you need is the kind of gain post-training is good at.

The window where it doesn't make sense: the gap is factual knowledge, or you want the model to reason better, or you don't have good labeled data for the task. Fine-tuning can't fix those.

The pattern that makes this economically interesting for teams: one base model, many small adapters for different tasks. You don't retrain the model for each task; you just swap in the right adapter.

**Visual hint:** Simple diagram: base model (large block) + adapter (small block bolted on). Beneath it, the two-column contrast from earlier: "what LoRA can fix" (style, format, tool discipline) vs "what LoRA can't fix" (knowledge gaps, reasoning depth). Optional: rough cost range annotation — "7B adapter: tens of dollars, 70B adapter: low hundreds."

**Speaker notes:** Most teams don't need this yet. It becomes relevant when you have a high-volume recurring task with a specific behavioral spec and prompt iteration has topped out. The "can we fine-tune it?" question often comes from a frustration with the model's current behavior on some task — the productive follow-up question is: is the frustration behavioral or factual? That usually points you to the right solution.

---

### Slide 14 — Close

**Intent:** Land the two key reframes and leave a curiosity hook open for Q&A.

**Content:**
Two things worth holding onto from today:

The agent loop is simpler than the marketing implies. It's a while-loop. The system prompt is more consequential than the marketing implies — it's the one part of the context that's always there.

And the model isn't a monolith. If you've been using Gemini and treating it as a single thing with a consistent answer, it's more accurate to think of it as a committee that may route differently depending on what you ask. The "why does it give different answers sometimes" question has an architectural answer, not just a statistical one.

Next session: we'll go deeper on how the agent extends itself — tools, protocols, sub-agents — and we'll pull the curtain back on how inference actually runs, which is where the cost and latency story lives.

**Visual hint:** No complex visual needed. Clean close slide. Could repeat the session's key concepts as a very sparse list — but only if it doesn't feel like a summary exercise. An alternative: just the "next session" teaser line, which gives the room something to look forward to.

**Speaker notes:** Leave room here. This is where the MoE stuff generates follow-up questions, and so does the "fine-tuning can't teach it facts" point. If the group wants to run long, the Q&A is the place. Don't cut off good discussion to hit a time check.
