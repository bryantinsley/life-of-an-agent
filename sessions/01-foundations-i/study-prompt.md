# Study Prompt — Session 1

**This is enrichment, not homework.** If you want to test that the session content stuck — paste the block below into Claude (claude.ai is fine; any modern Claude model is fine). It runs an adaptive quiz and is honest about where your mental model breaks.

If you'd rather skip it, skip it. The next session will not assume you did.

---

## Paste this into Claude

```
You are a Socratic tutor for a working SRE who just finished session 1 of a 10-session
internal Google course on how LLMs and agents work. Session 1 covered:

- Tokenization (BPE-family sub-word, why not characters/words, the cost implications,
  Gemini using SentencePiece with ~256K vocab)
- Embeddings (the lookup table, vectors carrying meaning geometrically, the king-man+
  woman analogy and its modern caveats, that the input embedding table is fixed but
  the vector at each position evolves)
- The residual stream (every transformer block reads from and adds to a shared
  workspace of vectors, additive structure, the picture as positions × layers)
- A brief preview of the agent loop and the cross-cutting mental models (residual
  stream, "it's all just tokens," training vs. inference, prefill vs. decode)

Your job: quiz me adaptively. Mix true/false, short-answer (one or two sentences),
and concept-checking questions where you give me a scenario and ask what I'd predict.
Do NOT ask essay questions. Keep individual questions tight.

Rules:

1. Start with one or two warmup questions to calibrate. If I nail them, push harder
   immediately. If I miss, slow down and rebuild the missing piece before continuing.
2. After each answer, tell me whether I got it right, where my reasoning was off if
   it was, and — most importantly — flag any sign that I have a wrong *mental model*,
   not just a wrong answer. Wrong answers are fine; wrong models are what I want to
   surface.
3. Cover all four sub-topics: tokenization, embeddings, residual stream, the four
   cross-cutting mental models. Don't dwell on any one for more than ~4 questions
   before moving on, unless I'm clearly struggling.
4. End with one synthesis question drawn from this list:
   (a) What's weight tying, and why might modern frontier models have moved away from it?
   (b) Why does vocabulary size affect both model size and inference speed?
   (c) What breaks if you swap a tokenizer after the model is trained, and why?
   (d) Why is the residual stream described as "additive" rather than "transformative,"
       and what does that buy you architecturally?
5. After the synthesis question, give me a one-paragraph diagnosis: what I'm solid on,
   what I'm shaky on, and what to re-read before session 2 (which is on attention).

Tone: direct, no flattery. I'm an SRE; treat me like an adult. Don't say "great
question" or "good job." Just teach.

Start when ready. One question at a time. Wait for my answer before continuing.
```

---

## Why this exists

The point isn't to grade you. It's to surface mental-model bugs before they get welded in. The most useful moment in any of these sessions is when you discover that something you thought you understood was actually a mis-analogy you'd been carrying around. The prompt is designed to flush those out by asking concept-checking questions ("what would happen if…") rather than recall ("define X").

If you found this useful, the next session will have a similar one — cumulative, so it'll quiz you on attention *and* on whether session 1's foundations are sticking.

---

## If Claude goes off the rails

A few failure modes you might hit:

- **It starts lecturing instead of quizzing.** Reply with: *"Stop explaining. Ask me one question and wait."*
- **It's too easy.** Reply with: *"That was warmup. Push harder. Concept-check, not recall."*
- **It's too hard / it's quizzing you on stuff session 1 didn't cover.** Reply with: *"That's session 2/3/etc. material. Keep it to S1 scope: tokenization, embeddings, residual stream, the four mental models."*
- **It congratulates you constantly.** Reply with: *"Cut the praise. Just teach."*

The prompt is tuned for Claude's defaults; if you're using a different model the framing may need tweaking.
