# Session 1 — fact-check claims and sources

Worker: W1 (Session 1)
Date: 2026-04-23

## Summary
- Total claims checked: 22 (21 numbered + visual-hints schematic)
- ✅ Verified: 18
- ⚠️ Needs revision: 4
- ❓ Unsourceable / speculation flagged: 0
- ❌ False: 0

## Claims

### C1.1 — "The agent loop as a control structure: model produces a message, message may contain tool calls, harness executes them, results go back into context, model produces next message. Loop until the model emits a 'done' signal or the harness stops it."

- **Status:** ✅ verified
- **Sources:**
  - [Building agents with the Claude Agent SDK (Anthropic)](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
  - [Harness design for long-running application development (Anthropic)](https://www.anthropic.com/engineering/harness-design-long-running-apps)
  - [Basic Agentic Loop with Claude and Tool Calling (Temporal docs)](https://docs.temporal.io/ai-cookbook/agentic-loop-tool-call-claude-python)
- **Notes:** Anthropic's own docs describe the agent loop as "gather context → take action → verify work → repeat," terminating on a stop condition. This is a standard Thought-Action-Observation / ReAct cycle and matches the spine's description. Anthropic's harness docs explicitly say "the runtime is a dumb loop; all intelligence lives in the model."

### C1.2 — "The system prompt and why it's load-bearing: it's the only durable instruction surface; everything else is transient context."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [System Prompts — Claude API Docs](https://docs.anthropic.com/en/release-notes/system-prompts)
  - [Inside Claude Code — architecture (Penligent)](https://www.penligent.ai/hackinglabs/inside-claude-code-the-architecture-behind-tools-memory-hooks-and-mcp/)
- **Notes:** The system prompt is conventionally the first (and often highest-priority) message in the context window and is generally kept across turns by most harnesses — so calling it "durable" is defensible as a teaching simplification. However, mechanistically the system prompt is *also* just tokens in the context window; it is not stored anywhere the model can access except through the usual attention over the current context. Calling it "the only durable instruction surface" overstates things: CLAUDE.md, skills, hooks, and tool descriptions are also durable instruction surfaces that agent harnesses re-inject on every turn. For an SRE audience this nuance matters.
- **Proposed revision:**
  > The system prompt (and the surfaces that compile into it: CLAUDE.md, tool descriptions, hooks, skills) is the *persistently re-injected* instruction surface — the harness pins it to every turn's context window. Everything else is transient: once it scrolls out of the window or gets compacted, it's gone.

### C1.3 — "The context window as the model's only world: the model has no memory of prior turns except what's in this window."

- **Status:** ✅ verified
- **Sources:**
  - [Are LLMs Stateless? The Architecture Behind Agent Memory (Atlan)](https://atlan.com/know/are-llms-stateless/)
  - [What is a context window? (IBM)](https://www.ibm.com/think/topics/context-window)
  - [Why AI Agents Forget: The Stateless LLM Problem Explained (Atlan)](https://atlan.com/know/why-ai-agents-forget/)
- **Notes:** LLMs are architecturally stateless — every inference call starts fresh. "Memory" across turns is engineered by re-injecting prior turns as tokens on each call. The context window *is* the model's working memory for a given call. This is correct.

### C1.4 — "Dense vs MoE at the level that matters operationally: what 'active parameters vs total parameters' really means."

- **Status:** ✅ verified
- **Sources:**
  - [Mixture of Experts Explained (HuggingFace)](https://huggingface.co/blog/moe)
  - [A Visual Guide to Mixture of Experts (Maarten Grootendorst)](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts)
  - [Mixture-of-Experts (MoE) LLMs (Cameron R. Wolfe)](https://cameronrwolfe.substack.com/p/moe-llms)
- **Notes:** The active-vs-total distinction is the standard way to describe MoE models. Total parameters = sum over all experts + shared weights; active parameters = the fraction actually used per token (typically the gated subset chosen by the router plus shared layers). Correct framing.

### C1.5 — "MoE lets a model be 'large' without paying full cost per token."

- **Status:** ✅ verified
- **Sources:**
  - [Mixtral of Experts (Mistral)](https://mistral.ai/news/mixtral-of-experts)
  - [Mixture of Experts Explained (HuggingFace)](https://huggingface.co/blog/moe)
  - [DeepSeek-V3 Technical Report (arXiv)](https://arxiv.org/abs/2412.19437)
- **Notes:** This is the core selling point of MoE: sparse activation decouples total model capacity from per-token compute. Mistral's Mixtral announcement says it explicitly: "Mixtral has 46.7B total parameters but only uses 12.9B per token," giving the cost profile of a 12.9B dense model. Verified.

### C1.6 — "Gemini is widely speculated to be MoE."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [Gemini 1.5 Technical Report (arXiv, Google DeepMind)](https://arxiv.org/abs/2403.05530) — "Gemini 1.5 Pro is a sparse mixture-of-expert (MoE) Transformer-based model"
  - [Gemini 1.5 HTML version (arXiv)](https://arxiv.org/html/2403.05530v2)
  - [Gemini 3 Pro Model Card (Google DeepMind)](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)
- **Notes:** "Widely speculated" understates reality. Google's own Gemini 1.5 technical report *explicitly confirms* MoE: "Gemini 1.5 Pro is a sparse mixture-of-expert (MoE) Transformer-based model" (Section 2, Model Architecture). The Gemini 3 Pro model card and subsequent press coverage continue to describe the Gemini family as sparse MoE. This is a confirmed fact, not a rumor, at least for 1.5 and later. The "speculated" framing is a hedge from an earlier era (pre-Feb 2024) and is now incorrect.
- **Proposed revision:**
  > Gemini is confirmed to be MoE: Google's own Gemini 1.5 technical report describes it as "a sparse mixture-of-expert (MoE) Transformer-based model," and Gemini 2.5 / 3 are described the same way. The *sizes* (active/total params) are not disclosed — that's where the speculation remains.

### C1.7 — "Llama 4 Maverick (400B total / 17B active)."

- **Status:** ✅ verified
- **Sources:**
  - [The Llama 4 herd (Meta AI blog)](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
  - [meta-llama/Llama-4-Maverick-17B-128E-Instruct model card (HuggingFace)](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct)
- **Notes:** Meta's official blog and model card both confirm: Llama 4 Maverick has 17B active parameters, 400B total parameters, 128 experts. Exactly matches the spine. For Session 1 visual hints, note that Scout is 109B total / 17B active (16 experts), and Behemoth was previewed at ~2T total.

### C1.8 — "DeepSeek V3 (671B / 37B)."

- **Status:** ✅ verified
- **Sources:**
  - [DeepSeek-V3 Technical Report (arXiv 2412.19437)](https://arxiv.org/abs/2412.19437)
  - [deepseek-ai/DeepSeek-V3 model card (HuggingFace)](https://huggingface.co/deepseek-ai/DeepSeek-V3)
  - [DeepSeek-V3 GitHub](https://github.com/deepseek-ai/DeepSeek-V3)
- **Notes:** The technical report states: "DeepSeek-V3 [is] a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token." Exactly matches the spine.

### C1.9 — "RLHF / RLAIF and instruction tuning shape behavior, not knowledge."

- **Status:** ✅ verified
- **Sources:**
  - [RLHF vs RLAIF (Labelbox)](https://labelbox.com/blog/rlhf-vs-rlaif/)
  - [LLM Training: RLHF and Its Alternatives (Sebastian Raschka)](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives)
  - [Fine-Tune LLMs with RLHF from human or AI feedback (AWS)](https://aws.amazon.com/blogs/machine-learning/fine-tune-large-language-models-with-reinforcement-learning-from-human-or-ai-feedback/)
- **Notes:** Both practitioner-blog and vendor sources agree: RLHF/RLAIF align model *behavior* with human (or AI) preferences — helpfulness, harmlessness, tone, format, tool-call discipline — rather than injecting new knowledge. Knowledge acquisition happens primarily during pre-training. Correct characterization.

### C1.10 — "Fine-tuning can change style, format adherence, tool-call discipline."

- **Status:** ✅ verified
- **Sources:**
  - [RAG vs Fine-Tuning (IBM)](https://www.ibm.com/think/topics/rag-vs-fine-tuning)
  - [RAG vs. fine-tuning (Red Hat)](https://www.redhat.com/en/topics/ai/rag-vs-fine-tuning)
  - [LLM Training: RLHF and Its Alternatives (Sebastian Raschka)](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives)
- **Notes:** Vendor and practitioner consensus: fine-tuning is the right tool to shape style, tone, formatting, domain-specific vocabulary, and structured output discipline — i.e., behavior rather than knowledge. Matches the spine.

### C1.11 — "Fine-tuning can't change factual recall, reasoning ceiling."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs (arXiv 2312.05934)](https://arxiv.org/abs/2312.05934)
  - [RAG vs Fine-Tuning (IBM)](https://www.ibm.com/think/topics/rag-vs-fine-tuning)
  - [RAG vs. fine-tuning (Red Hat)](https://www.redhat.com/en/topics/ai/rag-vs-fine-tuning)
- **Notes:** The claim is directionally correct but overstated. The arXiv paper finds RAG consistently outperforms *unsupervised* fine-tuning for knowledge injection, and notes that LLMs struggle to learn new factual info through fine-tuning — but the same paper notes that multiple paraphrases of the same fact can help. It's technically possible to teach facts via fine-tuning; it's just expensive, fragile, and worse than RAG. Similarly, reasoning can shift with fine-tuning (RLHF can substantially change reasoning behavior on specific tasks), though the "reasoning ceiling" imposed by pre-training is real for truly novel reasoning. Saying it "can't" is an absolute that a careful SRE in the audience will challenge.
- **Proposed revision:**
  > Fine-tuning is the wrong tool for teaching facts. Knowledge uptake via fine-tuning is weak, expensive, and brittle; RAG is both cheaper and more reliable. And fine-tuning doesn't raise the reasoning ceiling — the model's underlying capability was set in pre-training.

### C1.12 — "Claude Code, Google Antigravity, AI Studio — three hosted surfaces you pay for inference on."

- **Status:** ✅ verified
- **Sources:**
  - [Claude Code pricing (Anthropic)](https://claude.com/pricing)
  - [Build with Google Antigravity (Google Developers Blog)](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
  - [Gemini Developer API pricing (Google)](https://ai.google.dev/gemini-api/docs/pricing)
- **Notes:** All three products exist and fit the spine's taxonomy (subscription / metered API / free preview). Verified.

### C1.13 — "Subscription tiers (Claude Code Pro/Max) rent capacity at a fixed monthly cost."

- **Status:** ✅ verified
- **Sources:**
  - [Claude Code pricing (Anthropic)](https://claude.com/pricing)
  - [Simon Willison: Is Claude Code going to cost $100/month? (Apr 22, 2026)](https://simonwillison.net/2026/apr/22/claude-code-confusion/)
- **Notes:** Claude Code is bundled into Anthropic's existing Pro ($20/mo, or $17/mo billed annually) and Max plans (Max 5x at $100/mo, Max 20x at $200/mo). On April 22, 2026, Anthropic briefly moved Claude Code to Max-only and reversed it the same day after backlash — so as of delivery date (April-May 2026), Pro at $20/mo still includes Claude Code, but Bryan should be prepared for a question on this. Recency note: verify pricing the week of the talk.

### C1.14 — "'Free preview' surfaces (Antigravity today) are loss-leaders that won't stay free."

- **Status:** ✅ verified
- **Sources:**
  - [Build with Google Antigravity (Google Developers Blog, Nov 20 2025)](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
  - [Google Antigravity - Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity)
  - [Users protest as Google Antigravity price floats upward (The Register, Mar 12 2026)](https://www.theregister.com/2026/03/12/users_protest_as_google_antigravity/)
- **Notes:** Antigravity launched Nov 20, 2025 as a free public preview. Google already tightened the free quota in March 2026 (per The Register), which is a good concrete piece of evidence for the spine's "won't stay free" point. The "preview" label itself signals the pricing isn't final.

### C1.15 — "Free-tier AI Studio is the data-for-access trade — your prompts may train future models unless you upgrade."

- **Status:** ✅ verified
- **Sources:**
  - [Gemini API Additional Terms of Service (Google)](https://ai.google.dev/gemini-api/terms) — "Google uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services" (unpaid) vs. "Google doesn't use your prompts... or responses to improve our products" (paid)
  - [Gemini API Billing docs (Google)](https://ai.google.dev/gemini-api/docs/billing)
- **Notes:** Confirmed directly from Google's own terms. Free tier content *is* used for training; paid tier is not. This is one of the cleanest vendor-policy claims in the spine. Note: AI Studio's web UI is free and falls under the free-tier terms; Bryan should confirm this framing (whether AI Studio = API free tier, or something slightly different) — both surfaces share the same terms page, so the claim holds.

### C1.16 — "A LoRA adapter is small (~MBs)."

- **Status:** ✅ verified
- **Sources:**
  - [How LoRA Makes AI Fine-Tuning Faster, Cheaper, and More Practical (Exxact)](https://www.exxactcorp.com/blog/deep-learning/ai-fine-tuning-with-lora)
  - [LoRA Adapters Explained (OpenInnovation)](https://openinnovation.ai/lora-adapters-explained-efficient-fine-tuning-for-llms-without-retraining/)
  - [LoRA Fine-Tuning for Dummies (Medium)](https://michielh.medium.com/lora-fine-tuning-for-dummmies-4af64f096b4d)
- **Notes:** Practitioner sources agree: LoRA adapters are "just a few megabytes" to "tens/hundreds of MBs" depending on rank and base model. "~MBs" is the right order of magnitude.

### C1.17 — "Trains in an afternoon on a consumer GPU or for ~$50–200 of cloud GPU time."

- **Status:** ⚠️ needs revision
- **Sources:**
  - [LoRA Fine-Tuning: 7 Steps to Adapt Any LLM on One GPU (decodethefuture.org)](https://decodethefuture.org/en/lora-fine-tuning-llm-guide/)
  - [How to fine-tune LLMs on a budget with LoRA/QLoRA (Runpod)](https://www.runpod.io/articles/guides/how-to-fine-tune-large-language-models-on-a-budget)
  - [Fine-Tuning Infrastructure: LoRA, QLoRA, and PEFT at Scale (Introl)](https://introl.com/blog/fine-tuning-infrastructure-lora-qlora-peft-scale-guide-2025)
- **Notes:** The "afternoon on a consumer GPU" claim is solid — 6-8 hours on a single 4090 is typical for small LoRA runs. The "$50–200 cloud GPU time" range is on the low end; practitioner sources quote a wider range ($10 for small QLoRA runs up to $500–3000 for larger LoRA runs, and $300–1000 for QLoRA). $50–200 is achievable for small models (7B base, modest dataset) but won't cover a 70B-base LoRA. The range is narrower than reality.
- **Proposed revision:**
  > A LoRA adapter is small (~MBs), trains in an afternoon on a consumer GPU (a 3090 or 4090 will do), or for tens to a few hundred dollars of cloud GPU time depending on the base model size. Small 7B-base runs are the cheap end; 70B-base runs are more.

### C1.18 — "The 'one base model, many adapters per task' pattern is where this gets economically interesting."

- **Status:** ✅ verified
- **Sources:**
  - [LoRA Adapters Explained (OpenInnovation)](https://openinnovation.ai/lora-adapters-explained-efficient-fine-tuning-for-llms-without-retraining/)
  - [Fine-Tuning Infrastructure: LoRA, QLoRA, and PEFT at Scale (Introl)](https://introl.com/blog/fine-tuning-infrastructure-lora-qlora-peft-scale-guide-2025)
- **Notes:** The multi-adapter / adapter-swapping pattern is well-established in PEFT literature and production systems (e.g. LoRAX, S-LoRA, Punica). One base model in VRAM + many MB-sized adapters swapped in per request is the canonical "economically interesting" topology. Correct.

### C1.19 — "Does not make the model smarter or teach it new facts — if the ask is 'can we fine-tune it to know our internals,' the answer is RAG, not LoRA."

- **Status:** ✅ verified
- **Sources:**
  - [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs (arXiv 2312.05934)](https://arxiv.org/abs/2312.05934)
  - [RAG vs Fine-Tuning (IBM)](https://www.ibm.com/think/topics/rag-vs-fine-tuning)
  - [RAG vs. fine-tuning (Red Hat)](https://www.redhat.com/en/topics/ai/rag-vs-fine-tuning)
- **Notes:** The arXiv paper is the cleanest primary source: "RAG consistently outperforms [fine-tuning], both for existing knowledge encountered during training and entirely new knowledge." This is the exact pedagogical point in the spine and it's well-established. For an SRE audience that's going to ask "can I just fine-tune Claude on my runbooks," this is the right answer.

### C1.20 — "Mixtral exists and is MoE (visual hints)."

- **Status:** ✅ verified
- **Sources:**
  - [Mixtral of Experts (Mistral)](https://mistral.ai/news/mixtral-of-experts)
  - [Mixtral of Experts paper (arXiv 2401.04088)](https://arxiv.org/abs/2401.04088)
  - [mistralai/Mixtral-8x7B-v0.1 model card (HuggingFace)](https://huggingface.co/mistralai/Mixtral-8x7B-v0.1)
- **Notes:** Mixtral 8x7B is a sparse MoE with 8 experts and top-2 routing per token. 46.7B total / 12.9B active. For the "active-vs-total chart" visual, these are the right numbers. Note that Mixtral 8x22B exists too (141B total / 39B active) if Bryan wants a larger Mistral example.

### C1.21 — "GPT-OSS exists (visual hints)."

- **Status:** ✅ verified
- **Sources:**
  - [Introducing gpt-oss (OpenAI)](https://openai.com/index/introducing-gpt-oss/)
  - [openai/gpt-oss-120b model card (HuggingFace)](https://huggingface.co/openai/gpt-oss-120b)
  - [openai/gpt-oss-20b model card (HuggingFace)](https://huggingface.co/openai/gpt-oss-20b)
- **Notes:** Released August 2025 by OpenAI under Apache 2.0. Two variants: gpt-oss-120b (117B total / 5.1B active, 128 experts with top-4 routing) and gpt-oss-20b (21B total / 3.6B active). Both are MoE. Numbers to use on the active-vs-total chart: 120b = 117B/5.1B, 20b = 21B/3.6B. (Note the HuggingFace card numbers are slightly different from round marketing numbers like "120B".)

### Visual hints — "Dense forward pass vs MoE forward pass (router → top-k experts active)."

- **Status:** ✅ verified
- **Sources:**
  - [Mixture of Experts Explained (HuggingFace)](https://huggingface.co/blog/moe)
  - [A Visual Guide to Mixture of Experts (Maarten Grootendorst)](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts)
  - [Mixtral of Experts (Mistral — top-2 routing example)](https://mistral.ai/news/mixtral-of-experts)
- **Notes:** The schematic is accurate: MoE replaces each dense FFN layer with a router (linear projection → softmax) that picks top-k experts per token; the outputs are combined by gating weights. Mixtral uses top-2, DeepSeek V3 uses top-k with k=8 per layer (plus 1 shared), gpt-oss-120b uses top-4. Any of these would work as the concrete example in the schematic.

## Open questions for Bryan

1. **Gemini MoE framing (C1.6):** The current spine says "widely speculated." Google's own Gemini 1.5 paper states directly it's MoE. Do you want to keep the "speculated" framing because the *sizes* are still unknown, or switch to confirmed-architecture-but-unknown-sizes? My recommendation is the latter — an SRE in the audience who's read the Gemini 1.5 paper will catch the understatement.

2. **Claude Code pricing volatility (C1.13):** Anthropic briefly moved Claude Code off the Pro tier on April 22, 2026 and reversed it the same day (per Simon Willison). Between now and the talk, this could shift again. Recommend: re-verify the morning of, and maybe frame as "subscription plans, currently $20/mo Pro and $100–200/mo Max tiers at time of slide, but these have shifted recently."

3. **AI Studio vs Gemini API free-tier distinction (C1.15):** The spine says "free-tier AI Studio." Google's terms cover both the AI Studio UI and the free Gemini API quota under the same unpaid-services language. Suggest being precise on stage: "Google's free tier — AI Studio and the free Gemini API quota — is the data-for-access trade."

4. **Fine-tuning "can't change factual recall / reasoning ceiling" (C1.11):** This is directionally right but "can't" is an absolute that invites pushback. Suggest softening to "fine-tuning is the wrong tool for new facts — RAG is cheaper and more reliable; and fine-tuning doesn't raise the reasoning ceiling pre-training set." Reasoning can be shifted by RL, so "ceiling" is the careful word; "can't" is too strong.

5. **LoRA cost range (C1.17):** $50–200 is tight for the small-model case only. Suggest widening the range or scoping it explicitly: "tens to a few hundred dollars for small-base runs (7B class)."
