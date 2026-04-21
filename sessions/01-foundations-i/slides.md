---
theme: default
title: 'Life of an Agent — S1: From Text to Vectors'
info: |
  ## Session 1 — Foundations I: From Text to Vectors
  Part of the *Life of an Agent* curriculum: how LLMs and agents actually work, for SREs.
  Recording stays internal. Slides + narrative + demos are public-safe.
layout: cover
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
editor: false
---

# From Text to Vectors

## A single piece of text, traced end to end — from the moment it arrives at the model to the moment a number comes out the other side.

<div class="cover-meta">
  <span><b>~45 min</b> content</span>
  <span class="cover-dot">·</span>
  <span><b>15 min</b> Q&amp;A</span>
  <span class="cover-dot">·</span>
  <span>4 interactive demos</span>
</div>

<style>
.cover-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  font-family: var(--loa-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.68);
}
.cover-meta b {
  color: #fff;
  font-weight: 600;
}
.cover-dot {
  color: rgba(255, 255, 255, 0.3);
}
</style>

<!--
Welcome to the first session of *Life of an Agent*. Over the next ten weeks we are going to take apart, layer by layer, the systems that the people in this room already use every day — large language models and the agents built on top of them. Tonight is the foundation. We will trace what happens to a single piece of text from the moment it arrives at the model to the moment a number comes out the other side.

This is the first of ten one-hour sessions. The deck and a longer narrative companion document will land in the team folder right after; the demos you see embedded in slides also live as standalone web apps you can click around on your own time. The recording stays internal. Slides, narrative, and demos are written to be safe to share more broadly inside Google.
-->

---
layout: section
eyebrow: Housekeeping
num: '0'
---

# A warning and a promise.

## Two pieces of housekeeping before the technical material starts.

<!--
Two pieces of housekeeping before we get to the technical material. The first is a warning, and the second is a promise.
-->

---
layout: default
eyebrow: The warning
title: This course is theory first. Agents come at the end.
---

<div class="warning-lede">

Most LLM courses start at the surface and try to work inward. **We're doing the opposite** — walking the trunk before the branches.

</div>

<div class="warning-grid">

<div class="warning-card">
  <div class="warning-card-kicker">What this means</div>
  <div class="warning-card-body">The first three or four sessions are going to feel <em>slow</em>. You will know more than you can yet do anything with. That's normal — the same shape as any CS curriculum.</div>
</div>

<div class="warning-card">
  <div class="warning-card-kicker">Why it works for SREs</div>
  <div class="warning-card-body">You already think in layers. By S6, when we get to prefill vs. decode, the foundations pay off in ways they wouldn't if we'd skipped them.</div>
</div>

<div class="warning-card is-accent">
  <div class="warning-card-kicker">The honest part</div>
  <div class="warning-card-body">Some of you will get frustrated. <em>"When do we get to the interesting stuff?"</em> Call it out. I'll keep reminding you where we are on the trunk.</div>
</div>

</div>

<style>
.warning-lede {
  font-size: 20px;
  line-height: 1.45;
  color: var(--loa-ink-muted);
  max-width: 68ch;
  margin-bottom: 32px;
  letter-spacing: -0.012em;
}
.warning-lede strong {
  color: var(--loa-violet-700);
  font-weight: 600;
}
.warning-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.warning-card {
  background: #fff;
  border: 1px solid var(--loa-rule);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.warning-card.is-accent {
  border-color: var(--loa-violet-200);
  background: var(--loa-violet-050);
}
.warning-card-kicker {
  font-family: var(--loa-font-sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--loa-cobalt-600);
}
.warning-card.is-accent .warning-card-kicker {
  color: var(--loa-violet-700);
}
.warning-card-body {
  font-size: 14px;
  line-height: 1.5;
  color: var(--loa-ink);
}
.warning-card-body em {
  color: var(--loa-violet-800);
  font-style: italic;
}
</style>

<!--
A normal LLM course right now starts with prompting techniques and works inward, occasionally name-dropping attention or embeddings without ever explaining what they are. That style is fine for end-users. It is not fine for SREs who are going to be on call for systems that have these things inside them. So we are doing the opposite. We are going to build the transformer from the bottom up — tokens, embeddings, attention, the rest of the block, training, serving — and only then put the agent harness on top.

The first three or four sessions are going to feel slow. You will know more than you can yet do anything with. That is normal. It is the same shape as any classical CS curriculum: you learn lambda calculus and pointers before you write a web app, even though everyone is impatient to write the web app.

The reason this works for SREs in particular is that you already think in layers. By session six, when we get to prefill versus decode and what TTFT actually measures, the foundations are going to pay off in a way they would not pay off if we had skipped them. You will see why a prompt-cache hit costs what it costs, why long context is quadratic, why two GPUs do not make decode twice as fast for one user.
-->

---
layout: default
eyebrow: The promise
title: By session 10, you'll walk a single agent turn through every layer.
---

<div class="promise-lede">

Every word in the sequence below will mean something specific and mechanical — not a metaphor, not a hand-wave.

</div>

<div class="promise-chain">
  <div class="promise-step"><span class="promise-num">01</span><span class="promise-label">token in</span></div>
  <div class="promise-step"><span class="promise-num">02</span><span class="promise-label">embedding lookup</span></div>
  <div class="promise-step"><span class="promise-num">03</span><span class="promise-label">attention</span></div>
  <div class="promise-step"><span class="promise-num">04</span><span class="promise-label">residual stream</span></div>
  <div class="promise-step"><span class="promise-num">05</span><span class="promise-label">logits</span></div>
  <div class="promise-step"><span class="promise-num">06</span><span class="promise-label">sampling</span></div>
  <div class="promise-step"><span class="promise-num">07</span><span class="promise-label">tool call</span></div>
  <div class="promise-step"><span class="promise-num">08</span><span class="promise-label">harness dispatch</span></div>
  <div class="promise-step"><span class="promise-num">09</span><span class="promise-label">result</span></div>
  <div class="promise-step is-accent"><span class="promise-num">10</span><span class="promise-label">next token</span></div>
</div>

<div class="promise-closer">

Nothing in there is magic. It's layers of math with engineering choices on top, and the engineering choices are where your latency, cost, and reliability intuitions come from.

</div>

<style>
.promise-lede {
  font-size: 18px;
  line-height: 1.45;
  color: var(--loa-ink-muted);
  max-width: 64ch;
  margin-bottom: 24px;
  letter-spacing: -0.012em;
}
.promise-chain {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.promise-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--loa-rule);
  border-radius: 8px;
}
.promise-step.is-accent {
  background: var(--loa-gradient-brand);
  border-color: transparent;
  color: #fff;
}
.promise-num {
  font-family: var(--loa-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--loa-cobalt-600);
}
.promise-step.is-accent .promise-num {
  color: rgba(255, 255, 255, 0.7);
}
.promise-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--loa-ink);
}
.promise-step.is-accent .promise-label {
  color: #fff;
}
.promise-closer {
  font-size: 14px;
  line-height: 1.55;
  color: var(--loa-ink-muted);
  max-width: 68ch;
  padding-top: 16px;
  border-top: 1px solid var(--loa-rule);
}
</style>

---
layout: demo
url: http://localhost:5176
---

<!--
This is demo 3 — the embedding scatter. Hover any word to see its 2D neighbors; click an analogy button to run vector arithmetic on the high-dimensional vectors. Notice that clustering is category-aware even though nobody labeled the categories during training.
-->

---
layout: section
eyebrow: End of reference
num: 'A'
---

# That's the new visual system.

## The rest of the deck still uses the old theme — review slides 1–5, then we'll roll out.

<!--
End of the polished reference block. Slides beyond this still use the old bare-bones treatment until we align on direction.
-->


<!--
That sequence is the capstone — session ten. We will literally take one agent turn and walk it down through every layer we have covered. By that point, every word in that sentence — embedding, attention, residual stream, logits, sampling, tool call, harness — is going to mean a specific, mechanical thing that you can point at and explain.

The thing I want you to leave tonight believing is that this is *learnable*. There is no point at which a magic wand gets waved. It is layers of math, with engineering choices on top, and the engineering choices are what your day-to-day intuitions about latency, cost, and reliability come from.
-->

---
layout: two-cols-header
---

## The four mental models we'll keep coming back to

::left::

<div class="pt-4 space-y-4">

**1. The residual stream.** A shared workspace of vectors that every layer reads from and writes to. We meet it tonight.

**2. "It's all just tokens."** Text, tool calls, tool results, system prompts — the model sees them as the same substrate. Unlocks most of the agent material.

</div>

::right::

<div class="pt-4 space-y-4">

**3. Training vs. inference.** Two completely different regimes. Different infrastructure, different cost structures, different failure modes. Half the confusions in any LLM conversation trace back to conflating them.

**4. Prefill vs. decode.** The two phases of one inference request. Different bottlenecks, different optimizations. The SRE story lives here.

</div>

<!--
There are four ideas that will recur throughout the entire course. I want to name them up front so when they come back you recognize them.

The first is the residual stream. We will introduce it formally about thirty minutes from now. It is the shared workspace inside the model — a stack of vectors that every layer reads from and writes back into. Once you have this picture, the architecture stops being a black box.

The second is the phrase "it's all just tokens." The model does not have a separate mode for tool calls. There is no special hardware path for system prompts. Everything — your message, the system prompt, the model's reasoning, a tool call it emits, the result the harness writes back — is the same substrate. Tokens. The harness layered on top is what gives them meaning. Once this clicks, almost everything about agents stops being confusing.

The third is training versus inference. I have lost count of the number of conversations I have had where a confusion turned out to be someone treating these as the same thing. They are not. They run on different hardware. They have different cost structures. They fail in different ways. A model is trained once and served continuously. We will be careful about which one we are talking about, every time.

The fourth is prefill versus decode. These are the two phases inside a single inference request. The first token of a response is computed differently than the rest. They hit different bottlenecks. This is the session your inner SRE will love — that's session six. I am calling it out now so the vocabulary is sitting in your ear.

Four ideas. They will get repeated. That is on purpose.
-->

---
layout: section
---

# Part 1 — What an agent actually is

<div class="text-sm opacity-60 pt-4">~10 minutes</div>

<!--
We are going to start by looking at the thing we are going to spend ten weeks taking apart. I am going to show you one full agent turn — a user types a message, the model thinks, decides to call a tool, the harness dispatches the tool, the result comes back, the model continues. You will see every layer at the surface, named but not yet explained. That is on purpose. By session ten you will be able to point at any of these arrows and say what is actually happening underneath.
-->

---

## One agent turn, end to end

<div class="pt-2 text-sm opacity-70">
Click through. Don't worry about the words you don't recognize yet. We're naming the layers, not explaining them.
</div>

<div class="pt-4 -mx-12 px-12">
  <iframe
    src="http://localhost:5174/"
    class="w-full"
    style="height: 460px; border: 1px solid var(--slidev-theme-primary); border-radius: 8px;"
  />
</div>

<div class="text-xs opacity-60 pt-2 flex justify-between">
  <span>Demo: <code>/demos/agent-loop/</code></span>
  <a href="http://localhost:5174/" target="_blank" class="hover:underline">↗ open standalone</a>
</div>

<!--
What I want you to look at here is not the words flowing past — it is the *structure*. Notice that there is a loop. The user sends a message. The model emits a response that contains, embedded in its text, what looks like a function call. Some piece of code outside the model — we call that the harness — recognizes that pattern, peels it out, runs the actual function, and pastes the result back into the conversation as if it were another message. The model then sees that result and decides what to do next. Maybe call another tool. Maybe answer the user. Maybe think out loud some more.

This loop — model emits, harness dispatches, result returns, model continues — is the entirety of what people mean when they say "agent." There is no other secret. The model is stateless inside the loop; everything it knows about the conversation gets reassembled and re-fed on every turn. The harness is what gives the illusion of memory and tools and persistence.

Walk through the demo at your own pace. Notice the layers we will be unpacking: the tokens going in, the model deciding what to emit, the structured tool call hidden inside ordinary-looking text, the dispatch, the response coming back, the next forward pass.

Every layer in this picture corresponds to at least one session of this course. Tonight we are going to start at the very bottom — the part where the user's text becomes numbers the model can do math on.
-->

---

## What you just saw — every layer is a session

<div class="grid grid-cols-2 gap-x-8 gap-y-3 pt-4 text-sm">

<div><b>Tokens / embeddings</b></div>
<div class="opacity-70">→ tonight (S1)</div>

<div><b>Attention — how positions exchange information</b></div>
<div class="opacity-70">→ S2</div>

<div><b>The full forward pass — block stacking, logits</b></div>
<div class="opacity-70">→ S3</div>

<div><b>Where the parameters came from — training</b></div>
<div class="opacity-70">→ S4</div>

<div><b>Prefill vs. decode — the two phases of inference</b></div>
<div class="opacity-70">→ S5</div>

<div><b>Sampling and serving at scale</b></div>
<div class="opacity-70">→ S6</div>

<div><b>The agent loop, tools, system prompts</b></div>
<div class="opacity-70">→ S7</div>

<div><b>Context engineering and long-horizon work</b></div>
<div class="opacity-70">→ S8</div>

<div><b>Reliability, failure modes, evals</b></div>
<div class="opacity-70">→ S9</div>

<div><b>End-to-end synthesis</b></div>
<div class="opacity-70">→ S10</div>

</div>

<!--
Here is the table of contents. Every layer you saw in that demo gets at least one session.

Tonight is the bottom of the stack — text becoming numbers, what those numbers look like, and the workspace where they live. Next week is attention, the mechanism that lets each token position pull information from other positions. The week after that is the full forward pass — what the rest of a transformer block adds, and how the layers compose.

Then we slow down. Session four is training: where do the model's billions of weights actually come from? Session five is the production side: what happens when a request shows up, why is the first token slow and the rest fast, what is the KV cache and why does it dominate the cost. Session six is the serving layer — sampling parameters, batching, paged attention, the systems story.

The last three sessions are agents proper. Session seven is the loop, the harness, what tools really are. Session eight is context engineering — every kept token costs decode bandwidth on every subsequent token, and you will feel it at scale. Session nine is failure modes and how we evaluate these systems. Session ten is the end-to-end walk where we close the ratchet.

After we shoot the next four sessions weekly, there is a one-month gap. That is on purpose — it lets the architecture material compost before we pivot to the production and agent material. When we come back, it will be six more weekly sessions to the end.

OK. That is the promise. Let us start paying it off.
-->

---
layout: section
---

# Part 2 — Tokens

<div class="text-sm opacity-60 pt-4">~10 minutes</div>

<!--
The first thing we have to confront is that the model does not see text. It cannot. A neural network is a collection of matrix multiplications and nonlinearities operating on vectors of floating-point numbers. There is no opcode in there for "the letter A." So before any model does anything, the text has to become numbers.

The piece of software that turns text into numbers is called a tokenizer. It is bundled with the model — every model has its own — but it is a separate piece of software, not a learned part of the network. When you call an LLM API, the very first thing that happens, before the GPU does any work at all, is your string gets handed to the tokenizer, and the tokenizer produces a list of integers.

Those integers are tokens. And tokens are not what you think they are.
-->

---

## The model never sees text. It sees integers.

<div class="pt-6">

```text
"The quick brown fox"
```

<div class="text-2xl opacity-50 text-center py-2">↓  tokenizer</div>

```text
[464, 2068, 7586, 21831]
```

</div>

<div class="text-sm opacity-70 pt-8">
Every model has its own tokenizer. Every API call starts here, before any matrix multiply happens.
</div>

<!--
This is what every API call looks like at the very bottom. Your string of characters arrives. The tokenizer chops it up into pieces and assigns each piece an integer ID drawn from a fixed vocabulary, usually somewhere between fifty thousand and three hundred thousand entries. That list of integers is what the model actually receives.

The naive question to ask now is: how does it chop it up? And the naive answer — "into words" — is wrong, in ways that matter for cost, behavior, and a particular class of bugs you are eventually going to hit in production.
-->

---

## Why not characters? Why not words?

<div class="grid grid-cols-2 gap-12 pt-4">

<div>

**Characters** would be the cleanest mental model.

26 letters plus punctuation. Tiny vocabulary. No surprises.

But: every word becomes a long sequence. The model would burn most of its computation on letter-by-letter combinatorics before it could think about meaning.

</div>

<div>

**Words** would be the second-cleanest.

But: vocabulary is unbounded. New words appear constantly. Misspellings, hashtags, code, URLs, emoji.

And every language has different words, so a multilingual model needs an unboundedly-large vocabulary, which means a huge embedding table, which means a huge model.

</div>

</div>

<div class="pt-8 text-center text-lg">
<b>The compromise</b>: <i>sub-word</i> tokens. Common pieces of text get their own token; rare pieces get split into smaller pieces.
</div>

<!--
So if not words, what? Let us look at the alternatives and feel why the answer is uncomfortable.

You could tokenize at the character level. Every character is its own token. The vocabulary is tiny, you never see a token you have not seen before, and every word becomes representable as a sequence of single characters. But now the word "transformer" is eleven tokens. The model has to spend the first several layers reassembling those eleven tokens back into a notion of *the word transformer* before it can think about what the word transformer means in the sentence. That is a tax you pay on every forward pass for every word, and at scale it is enormous. Character-level models exist — ByT5, MambaByte — and they have applications, but they are not where the action is for general-purpose chat models.

You could tokenize at the word level. Now "transformer" is one token. Beautiful. Except: how do you handle "transformers"? Is that a separate token? What about "Transformer" with a capital T? What about misspellings? What about new words you have never seen — neologisms, hashtags, names? What about Mandarin, where there are no spaces between words? You end up needing an unboundedly large vocabulary, which means a huge embedding table that dominates the model's memory, and you still have an out-of-vocabulary problem.

So everyone settled on a compromise. Sub-word tokenization. Common chunks of text — full common words like "the", "and", "people" — get their own token. Rare chunks get broken into smaller pieces. The most popular algorithm for learning what the chunks should be is called Byte-Pair Encoding, BPE for short, and the intuition is dead simple: start with characters, look at all adjacent character pairs in your training data, find the most common pair, merge it into a new symbol, repeat until you have the vocabulary size you want. That is it. The whole BPE algorithm is "merge the common pairs."

The result is that English text — which dominates training data — tokenizes very efficiently. One token per common word. But the moment you leave the well-trodden path of common English, things get weird in ways that are sometimes funny and often expensive.
-->

---

## Let's look at it

<div class="text-sm opacity-70 pb-2">
Paste your name. Paste an emoji. Paste some code. Paste a sentence in a non-English language. Watch what happens.
</div>

<div class="-mx-12 px-12">
  <iframe
    src="http://localhost:5175/"
    class="w-full"
    style="height: 460px; border: 1px solid var(--slidev-theme-primary); border-radius: 8px;"
  />
</div>

<div class="text-xs opacity-60 pt-2 flex justify-between">
  <span>Demo: <code>/demos/tokenizer-explorer/</code> — real BPE, runs entirely in your browser</span>
  <a href="http://localhost:5175/" target="_blank" class="hover:underline">↗ open standalone</a>
</div>

<!--
This is a real tokenizer running entirely in your browser — no server call, no API. You can paste anything in and watch how it gets chopped up. I want you to try a few things.

First, paste your name. If your name is common in English-language training data — Sarah, John — it might be a single token. If it is less common — anything from a non-Latin script, anything with unusual capitalization or punctuation, anything from a language that was underrepresented — you will see it get split into multiple pieces, sometimes character-by-character.

Second, paste an emoji. Emoji often tokenize wildly inefficiently — a single emoji can be three or four tokens, because internally it is a sequence of Unicode code points and the tokenizer was trained on text where emoji were rare.

Third, paste some code. A few things to notice. White-space is significant — `"def "` with a trailing space is often a different token from `"def"` without one, because in code one of those is followed by a function name and the other is not. Indentation matters. Tabs versus spaces matter. The whole social structure of how programmers write code is encoded in the tokenizer, and code in unusual styles tokenizes worse.

Fourth, paste a sentence in Mandarin or Hindi or Arabic. You will often see the token count balloon. The same semantic content can take three to five times as many tokens in a non-English language, and you pay for every one of them.

Watch the token count. That is the number you are billed on. That is the number that consumes your context window. That is the number that drives your latency. Everything that happens later in the pipeline is paid for in tokens.
-->

---

## What you should have noticed

<v-clicks>

**Tokens are not words.** `"unbelievable"` is often three tokens. `" the"` (with a leading space) is a different token from `"the"` without one.

**Capitalization matters.** `"Hello"` and `"hello"` may not share a token.

**Non-English text costs more.** Same meaning, more tokens. Often 3–5×.

**Code tokenizes weirdly.** Whitespace, indentation, and unusual identifiers all matter.

**Emoji are expensive.** A single emoji can be three or four tokens.

</v-clicks>

<!--
Let me name the things you should have just felt.

The first one is the headline: tokens are not words. They are sub-word fragments learned by frequency. A common word like "the" is one token. An uncommon-but-English word like "unbelievable" is often three: something like "un", "believ", "able". A name the model has never seen before will get split into pieces that may not correspond to syllables at all.

The second one is the leading-space thing, which catches people. The token for the word "the" sitting at the start of a sentence is *different* from the token for the word "the" sitting in the middle, because in the middle it is preceded by a space and that space is part of the token. This means the same word, in the same model, can have multiple distinct internal representations depending on what came before it.

The third one is capitalization. "Hello" and "hello" are not necessarily the same token. The model has to learn that they mean similar things — and largely it does, because they show up in similar contexts during training — but at the token level they are completely different IDs.

The fourth, and the one with the most operational consequences, is non-English content. The cost difference is not subtle. A paragraph of English might be 50 tokens. The same paragraph translated into Hindi or Arabic might be 200. If you are running a multilingual product, this directly drives both your bill and your latency budget.

The fifth is code. Code tokenizes in surprising ways because the tokenizer was trained on training data, and training data is mostly English prose with some code mixed in. Code in popular styles — well-formatted Python, well-formatted JavaScript — tokenizes reasonably efficiently. Code in unusual styles — Lisp, Haskell, COBOL, anything with non-ASCII identifiers — gets worse.

And the sixth is emoji. A single emoji is several tokens. If your product encourages emoji-heavy responses, you are paying for it on every turn.

These are not edge cases. These are the things that quietly determine your cost model.
-->

---

## SRE callout — tokenization is a billing failure mode

<div class="pt-6 space-y-4">

<div class="border-l-4 pl-4" style="border-color: var(--slidev-theme-primary);">
You are billed per token. You don't control the tokenizer.
</div>

<v-clicks>

A log pipeline that feeds an LLM can **10× its cost overnight** if the log format changes — say, switching to a structured format with more punctuation, or adding non-ASCII trace IDs.

A multilingual rollout doesn't just multiply traffic; it multiplies tokens-per-request.

Token counts are non-trivially difficult to predict from byte counts. They are *empirical*.

</v-clicks>

</div>

<!--
Here is the SRE-shaped consequence, and it is the kind of incident that has actually happened to people.

Imagine you have a pipeline. Logs come in, the logs get summarized by an LLM, the summaries get stored. You have measured the cost. It is fine. Then someone on another team — totally unrelated to you — changes the log format. Maybe they add a structured JSON wrapper. Maybe they add Unicode emoji to flag severity. Maybe they switch the trace ID format from a hex string to a base64 blob with non-ASCII characters.

Your bytes-per-log barely changes. Your tokens-per-log doubles or triples. Your bill goes up by the same factor. There is no alarm because byte-level monitoring did not catch it. The first signal is the next billing cycle.

The takeaway is: token counts are not a function of byte counts. They are *empirical*. If you are putting LLMs into pipelines you do not control end-to-end, you need to monitor the token side of things directly. And if you are deploying a multilingual product, you need to know what the token tax for each language is, because it directly drives your budget for that market.

There is more to say about tokenization — weight tying, why tokenizer-free models exist, what happens when you swap a tokenizer post-training — and I have backup slides for any of those if they come up. For now we are going to leave the tokenizer behind. The text has become integers. The next question is: now what?
-->

---

## Gemini callout — what's public

<div class="pt-6 space-y-3 text-sm">

Gemini uses a **SentencePiece** tokenizer.

The current public vocabulary is **~256K pieces**, shared with the open **Gemma** family.

Google has published enough for Gemma users to reproduce tokenization exactly. The training corpus and the rest of the production pipeline are not public.

</div>

<div class="text-xs opacity-50 pt-8">Sources: <code>fact-check.md</code> rows 1 &amp; the §10.1 ledger.</div>

<!--
The Gemini-specific tokenizer detail. Not worth dwelling on — the principles are the same — but worth naming because some of you will want to know.

Gemini uses a SentencePiece tokenizer. SentencePiece is Google's open-source library for sub-word tokenization; it supports BPE among other algorithms. The current public Gemini vocabulary is around 256,000 pieces, which is on the larger end — bigger vocabulary means each token carries more information but the embedding table is bigger. The same tokenizer ships with Gemma, the open-weight model family Google releases, so anyone who wants to reproduce tokenization byte-for-byte can.

What is *not* public: the training corpus details, the exact procedure for training the tokenizer itself, and the production-side serving optimizations.

If anyone asks how it compares to GPT-style tiktoken vocabularies — those are also BPE-family, also in the 100K-300K range. The tokenization story is broadly similar across all the major frontier models. The differences matter at the margin (multilingual efficiency, code, tool-call special tokens) but not in shape.
-->

---
layout: section
---

# Part 3 — Embeddings

<div class="text-sm opacity-60 pt-4">~10 minutes</div>

<!--
The text has become integers. But integers, by themselves, are useless to a neural network. The integer 7 is not bigger than the integer 5 in any meaningful sense — they are arbitrary IDs. If the tokenizer happened to assign "cat" to ID 47291 and "dog" to ID 88203, the model has no information about whether those concepts are related, just from the IDs.

So the very first thing the model does — the very first layer, before any of the heavy machinery — is convert each integer into a vector of floating-point numbers. That vector is called an embedding. The conversion is a simple lookup in a giant table.
-->

---

## The first layer is a lookup table

<div class="grid grid-cols-2 gap-12 pt-6">

<div>

```text
token id 464  ("The")
        ↓
[ 0.13, -0.42,  0.91, ..., 0.07 ]
        (a 4096-dim vector for a small model;
         12,288 dims for GPT-3)
```

</div>

<div>

The model has one row in the table per token in the vocabulary.

50K–300K tokens × thousands of dimensions = the *embedding table*.

It's parameters. It was learned during training, like all parameters. From now on, the model never refers to integer IDs again — only to vectors.

</div>

</div>

<!--
The first thing the model does to a sequence of token IDs is turn each ID into a vector. The vector is *just* a lookup — it is a row pulled out of a giant matrix called the embedding table. The matrix has one row per token in the vocabulary, and each row is a vector of some fixed dimension that we will call the model dimension or "d_model" if you read the literature.

How big are these vectors? It depends on the model. GPT-3 used 12,288 dimensions. Smaller open models — the Llama 7B class, the Mistral 7B class — use around 4,096. Frontier models like the Gemini family do not publish their dimensions, and the dimensions can vary across the variants. The general pattern is: bigger model, wider vector, more capacity, more compute per token.

A 50,000-token vocabulary times a 4,096-dimension embedding table is two hundred million parameters just for the table — and that is for a small model. For larger models the table is in the billions. This is one of the reasons keeping the vocabulary modest matters: every extra token is another row in the table.

The crucial conceptual move is that, from this layer onward, the model never refers back to integer token IDs. It only knows about vectors. Everything that happens for the rest of the forward pass is operations on these vectors. The integer IDs were a temporary intermediate representation between the human-readable text and the floating-point world the network actually computes in.
-->

---

## The vectors carry meaning

<div class="text-sm opacity-70 pb-2">
The training process arranges the table so that tokens with similar meanings end up with similar vectors. Watch.
</div>

<div class="-mx-12 px-12">
  <iframe
    src="http://localhost:5176/"
    class="w-full"
    style="height: 460px; border: 1px solid var(--slidev-theme-primary); border-radius: 8px;"
  />
</div>

<div class="text-xs opacity-60 pt-2 flex justify-between">
  <span>Demo: <code>/demos/embedding-scatter/</code> — real word embeddings, projected to 2D</span>
  <a href="http://localhost:5176/" target="_blank" class="hover:underline">↗ open standalone</a>
</div>

<!--
This is a 2D projection of real word embeddings. The actual vectors are hundreds of dimensions; we have squashed them down to two using a standard projection technique called PCA so we can plot them on a screen. A lot of structure gets lost in the squashing, but enough survives to make the point.

What you should see when you zoom in: words about countries cluster together. Words about colors cluster together. Words about emotions cluster together. Verbs of motion cluster. The clustering was not put there by hand. It is what falls out of the training process — the model is trained to predict the next token, and it turns out the most efficient way to do that is to give similar tokens similar vectors, because then a single set of "knows-about-emotions" circuits can fire for any of them.

There is a famous demo I am going to call out. Take the vector for "king", subtract the vector for "man", add the vector for "woman", and find the closest token in the table to the result. The closest token is, often, "queen." This is real, it is not a parlor trick, and it tells you something important about what the embedding space has learned: the *relationships* between concepts are encoded as directions.

Now, the modern caveat. This king-minus-man-plus-woman effect was much cleaner in the older word-embedding models — word2vec, GloVe — that were trained specifically for these properties. In the embedding tables of modern transformer LLMs, where the table is just an input layer and gets shaped by all sorts of training pressures, the analogy property is fuzzier. It still works for many cases. It does not work for all of them. Do not over-interpret the metaphor as "the model has a clean conceptual map of the world." It has a useful, lumpy, complicated representation.

Take a minute to play with the demo. Hover over points. See what is near what. Try the analogy buttons. The takeaway is the *visibility* of structure — these are not random vectors.
-->

---

## What this is, and what this isn't

<div class="grid grid-cols-2 gap-8 pt-6 text-sm">

<div>

**It is**

- A high-dimensional space where geometric distance corresponds, roughly, to semantic similarity
- A representation learned because it makes next-token prediction easier
- The substrate that everything downstream operates on

</div>

<div>

**It isn't**

- A clean conceptual map ("the model has a model of the world")
- Static — the input table doesn't change inference-to-inference, but the vector at each *position* will change as it flows through layers (next: the residual stream)
- Universal — every model has its own embedding space; you cannot transplant vectors across models

</div>

</div>

<!--
Two clarifications I want to land before we move on.

The first is what these embeddings *are*. They are a high-dimensional space where the geometric distance between two vectors corresponds, roughly, to the semantic similarity of the things they represent. They are learned during training. They are learned because the loss function — predict the next token — gets lower when the model arranges the table this way. Nobody told the model to put "king" near "queen." The training process produced that arrangement on its own, because it was useful for the predictive task.

The second is what they *aren't*. They are not a clean ontology. The model does not have, somewhere, a map that says "here are all the animals, here are all the verbs of motion, here are all the prepositions." It has a sloppy, lumpy, high-dimensional space that is *empirically useful* for prediction and that does have some interpretable structure when you go looking for it, but that structure is partial and approximate.

They are also not static across the forward pass. The input embedding table does not change while the model is running — that table is fixed parameters. But the vector that *represents the token at a particular position* in the sequence will change as it moves down through the layers of the model. Each layer reads the current vector, computes something based on it and its neighbors, and adds the result back. The vector evolves. By the time it reaches the top of the model, it has been transformed many times — the input vector for "the" at the start of a sentence and the final vector for "the" at the same position are very different things, even though they started as the same row in the table.

That evolution — the vector at each position changing as it goes down the layers — is the third concept of the night. The residual stream.
-->

---
layout: section
---

# Part 4 — The residual stream

<div class="text-sm opacity-60 pt-4">~10 minutes</div>

<!--
The residual stream is the single most useful mental model I can give you for what the inside of a transformer looks like. Once you have it, every other piece of the architecture — attention, feed-forward layers, layer norms, the output head — slots into a clean picture. Without it, the architecture diagrams that show up in every transformer paper look like spaghetti.
-->

---

## The residual stream — picture it

<div class="grid grid-cols-2 gap-8 pt-4">

<div>

```text
position:  [pos 0] [pos 1] [pos 2] ...
            ┃       ┃       ┃
embedding   ●       ●       ●     ← each position
table  →    │       │       │       gets its starting
            ▼       ▼       ▼       vector
        ┌───────────────────────┐
        │      block 1          │   ← reads the stream,
        │  attention + FFN      │     adds to it
        └───────────────────────┘
            │       │       │
            ▼       ▼       ▼
        ┌───────────────────────┐
        │      block 2          │   ← same thing
        └───────────────────────┘
            ...
            ▼       ▼       ▼
            ●       ●       ●     ← final state, used
                                    to predict next token
```

</div>

<div class="text-sm">

Every position in the sequence has a vector. That vector flows down through the model.

Every block (50–100+ of them in a real model) does two things:
1. **Reads** the current state of the stream
2. **Adds** something to it

The vector at each position is *cumulative* — it carries everything every layer has put into it.

This is why it's called a *residual stream*: each layer's output is added to the residual, not replacing it.

</div>

</div>

<!--
Here is the picture. Imagine the input sequence laid out horizontally — one column per token position. At the top of each column sits the starting embedding vector for that token, pulled out of the embedding table.

Now the vectors flow downward through the model. The model is made of *blocks*, stacked. Modern frontier models have somewhere between fifty and a hundred-and-twenty blocks. Every block is architecturally identical — same shape, same operations, just different learned parameters.

Each block does two things. It reads the current state of every column. And it adds something — a delta vector — back into each column. It does not overwrite. It does not replace. It *adds*. The vector at position three after block seven is the vector at position three after block six, plus whatever block seven decided to add.

That additive structure is why we call it the residual *stream*. The stream is the running sum of all the contributions every block has made so far. Each block's output is "what to add to the stream", not "what the stream should now be." This is a 2015 idea — residual connections from ResNet, the same trick that made it possible to train very deep image networks — applied here to make it possible to train very deep transformers.

The mental shift I want you to make: the model is not "computing a sequence of representations" where each layer produces a new thing. It is *contributing to a shared workspace*. Every block adds its piece. By the bottom of the model, the vector at each position contains everything every block has contributed about that position, all summed together. The final layer reads that sum and turns it into a prediction over the next token.

Two things to notice while you watch the demo. First, every block contributes — but the contributions are usually small. The stream's overall direction does not change wildly layer to layer. It accumulates. Second, the *sequence dimension* — the horizontal axis — is where the cross-position interaction lives. Information moves between columns through the attention operation, which is what we are going to spend all of next week on. The feed-forward part of each block, by contrast, only operates within a single column. So you can think of attention as the cross-token-mixing operation and the feed-forward as the per-token-thinking operation.

The demo lets you pick a position and watch its vector evolve as it flows down. Every layer adds a colored delta. By the end, the vector has been pushed and pulled in many directions, and the final state is what gets used to predict the next token.
-->

---

## Watch one position evolve

<div class="text-sm opacity-70 pb-2">
Pick a token. Step through the layers. Notice how each block adds — never overwrites.
</div>

<div class="-mx-12 px-12">
  <iframe
    src="http://localhost:5177/"
    class="w-full"
    style="height: 460px; border: 1px solid var(--slidev-theme-primary); border-radius: 8px;"
  />
</div>

<div class="text-xs opacity-60 pt-2 flex justify-between">
  <span>Demo: <code>/demos/residual-stream-animator/</code> — real activations from GPT-2 small</span>
  <a href="http://localhost:5177/" target="_blank" class="hover:underline">↗ open standalone</a>
</div>

<!--
What you are looking at here is real. These are actual intermediate activations from a real, small transformer — GPT-2 small, twelve layers — that we ran ahead of time and recorded so we could play them back in your browser. We picked a token, watched the residual-stream vector at that position evolve as it flowed down through all twelve transformer blocks, and the demo is rendering that evolution.

The colored bars are the *delta* each layer added — the contribution that block made to the stream at that position. Notice that they are mostly small. The stream does not get rebuilt at every layer; it gets *refined*. The early layers are doing what interpretability researchers describe as low-level work — token-level features, position-aware features, basic syntactic patterns. The middle layers do composition — combining information across positions in increasingly abstract ways. The late layers shape the output for prediction — pushing the stream in the direction of "what token should come next."

We are not going to defend that interpretation in detail tonight. The takeaway is the *shape*: a vector starts as the embedding for the input token, gets nudged by every block, and ends as the input to the output head. The mechanism by which each block decides what to nudge is what next week is for. Tonight is just "feel that the workspace is real."

This is also a useful place to plant a flag for what is coming. Right now the demo shows the vector at one position. But every block is also pulling information from *other positions* — the attention operation. We have not shown that yet. Next week we will pull back the curtain on it and you will see how each block decides which other positions to read from before it decides what to add.
-->

---

## What's next time

<div class="pt-8 space-y-6">

<div>

**The question we just opened**: each block adds *something* to the stream. What does it decide to add, and based on what?

</div>

<v-click>

<div>

**Half the answer**: it reads from the *other* positions in the stream. That's the attention mechanism — next week.

</div>

</v-click>

<v-click>

<div>

**The other half**: each block also has a position-local "thinking" component called the feed-forward network. Session 3.

</div>

</v-click>

</div>

<!--
The cliffhanger for next week. We have established that the residual stream exists, that every block contributes to it, and that contributions are *additive*. What we have not answered is: how does each block decide what to contribute?

The answer comes in two parts. The first part is attention — the mechanism by which the block at any given position pulls information from other positions in the stream. That is all of next week. We are going to take it apart, slowly, with the same kind of demo. The second part is the feed-forward layer — the per-position thinking component. That is the week after.

If you remember one thing from tonight, remember the residual stream. Every other piece of the architecture is going to slot into this picture.
-->

---
layout: section
---

# The territory

<div class="text-sm opacity-60 pt-4">~5 minutes — and we close</div>

<!--
We are going to close on a wide shot. I am going to put up the architecture map that we are going to come back to over and over for the next nine weeks, and we are going to read it together — not because you can fill in every box, but because you can now read more of the labels than you could an hour ago.
-->

---

## The map

<div class="pt-2 text-sm opacity-70">
The diagram every transformer paper draws. We just covered the bottom three rows. The rest is what the next nine weeks are for.
</div>

<div class="grid grid-cols-2 gap-8 pt-4 text-xs">

<div class="space-y-1 font-mono">
<div>┌───────────────────────────────┐</div>
<div>│      output token             │  ← S3, S6, S7</div>
<div>│           ▲                   │</div>
<div>│      sampling                 │  ← <span class="text-orange">S6, S7</span></div>
<div>│           ▲                   │</div>
<div>│      logits                   │  ← <span class="text-orange">S3</span></div>
<div>│           ▲                   │</div>
<div>│      unembedding              │  ← <span class="text-orange">S3</span></div>
<div>│           ▲                   │</div>
<div>│   ┌─────────────────────┐     │</div>
<div>│   │ block 50–120        │     │</div>
<div>│   │  attention + FFN    │     │  ← <span class="text-orange">S2, S3</span></div>
<div>│   │   + residual + LN   │     │</div>
<div>│   └─────────────────────┘     │</div>
<div>│           ▲                   │</div>
<div>│         ...                   │</div>
<div>│           ▲                   │</div>
<div>│   ┌─────────────────────┐     │</div>
<div>│   │ block 1             │     │</div>
<div>│   └─────────────────────┘     │</div>
<div>│           ▲                   │</div>
<div>│   ●  ●  ●  ●  ●               │  ← <b style="color: var(--slidev-theme-primary)">tonight: residual stream</b></div>
<div>│           ▲                   │</div>
<div>│   embedding lookup            │  ← <b style="color: var(--slidev-theme-primary)">tonight</b></div>
<div>│           ▲                   │</div>
<div>│   tokens (integer IDs)        │  ← <b style="color: var(--slidev-theme-primary)">tonight</b></div>
<div>│           ▲                   │</div>
<div>│   tokenizer                   │  ← <b style="color: var(--slidev-theme-primary)">tonight</b></div>
<div>│           ▲                   │</div>
<div>│   user message                │</div>
<div>└───────────────────────────────┘</div>
</div>

<div class="space-y-3">

**Bottom of the stack** — covered tonight.

**Middle** — what each block actually computes (S2 attention, S3 FFN + the rest of the block).

**Top** — how a vector becomes a token (S3) and what the sampling knobs do (S6).

**Outside the picture** — where the parameters came from (S4: training), how the request runs in production (S5: prefill/decode), how the harness wraps the model (S7–S9: agents).

**S10** is one full agent turn through the whole stack.

</div>

</div>

<!--
This diagram is going to come back, in some form, in every session of this course. I want to walk it with you.

At the very bottom, the user message arrives. We covered tonight: tokenizer, integer IDs, embedding lookup, residual stream — that is the whole bottom four rows. You can now read those labels.

Above that sits the stack of transformer blocks. Each block is identical in shape, different in learned weights. Each one does an attention operation and a feed-forward operation, and writes the result back into the residual stream. We have not pulled either of those apart yet. Attention is next week. The feed-forward and the rest of the block — layer normalization, residual wiring — is the week after.

Above the block stack is the *output head*. The final residual-stream vector at each position gets multiplied by an unembedding matrix to produce a vector of *logits* — one number per token in the vocabulary. Those logits get turned into a probability distribution by the softmax function, and then a token gets *sampled* from that distribution. The choice of sampling rule — greedy, top-p, top-k, temperature — is one of the major SRE-relevant knobs, and we will spend a chunk of session six on it.

What is *outside* this picture? Two things. One is where the model's parameters came from in the first place — the entire training pipeline, which is its own world. That is session four. The other is what happens when this whole thing actually runs in production — how a request gets dispatched, how the first token is computed differently from the rest, how the KV cache works, how throughput scales. That is sessions five and six. Then the agent harness wraps the whole thing — sessions seven, eight, and nine. Then session ten is the capstone where we walk a single agent turn through *every* arrow in this picture.

You now know enough to recognize about a third of the labels in this map. By session three you will recognize all of the inner structure of one block. By session six you will recognize the production-side annotations. By session ten the whole thing is going to feel like home.
-->

---

## Where we are

<div class="grid grid-cols-2 gap-8 pt-6">

<div>

**Tonight you learned**

- Text becomes integers (tokenizer)
- Integers become vectors (embedding table)
- Vectors flow through a stack of blocks via the residual stream
- Each block reads the stream and adds to it

**You now have the substrate.** Everything from here is what each block computes, and what we do with the final stream.

</div>

<div>

**Coming up**

- **S2**: attention — how each block reads from other positions
- **S3**: the rest of a block, plus the full forward pass
- **S4**: training — where every parameter came from
- **S5**: prefill vs. decode — how it runs in production
- **S6**: sampling, batching, paged attention
- **S7–S9**: agents — the loop, context, failure modes
- **S10**: the full walk

</div>

</div>

<!--
Tonight you learned the substrate. Text becomes integers via the tokenizer. Integers become vectors via the embedding table. The vectors flow down the model through a structure called the residual stream, with every block reading the stream and adding to it. The final state of the stream gets converted into a probability distribution over the next token.

That is the bottom of the stack. Everything from here is filling in what *the blocks* actually compute, where their parameters came from, how the whole thing runs, and how we wrap it to do useful work.

Next week is attention — the operation by which each block reads information from other positions before it decides what to add to the stream. It is the single most important mechanism in a transformer, and it is the piece that makes the stream into a *thinking* substrate rather than just a workspace.

Thank you for sitting through the foundations. The payoff starts compounding from here.
-->

---
layout: end
---

# See you next week

<div class="text-sm opacity-60 pt-8">
Slides: <code>github.com/.../sessions/01-foundations-i</code> &nbsp;·&nbsp;
Demos: <code>github.com/.../demos/</code> &nbsp;·&nbsp;
Recording: internal link in the calendar invite
</div>

<!--
The narrative companion document — basically these speaker notes turned into prose, with the demo screenshots and graphics inline — will land in the team folder by Friday. The recording will be cut and posted there too. The four demos you saw embedded are also live as standalone web pages; click into them, share configurations, screenshot anything interesting.

If you want to take a deeper run at the material before next week, there is an optional study prompt in the team folder you can paste into Claude. It will quiz you on tonight's content. It is enrichment, not homework.

Next week: attention. See you then.
-->

---
src: ./appendix.md
hide: true
---
