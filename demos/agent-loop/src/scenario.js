// One agent turn — an SRE-flavored debugging task.
// Twelve steps, paced for click-through. Every type ('think','tool','dispatch','result','final')
// gets a side-by-side explainer in the demo so attendees can map the story to the loop.

export const userMessage = `Pod recommendation-svc-7b8d in production has been restarting every ~3 minutes for the past hour. Find out why and propose a fix.`;

export const steps = [
  {
    type: 'think',
    label: 'model thinks',
    content: `The pod is restart-looping. The two most informative starting points are the recent container logs (which usually contain the death cause) and the pod-level events (which include OOMKilled signals). I'll fetch the last 200 log lines first.`,
    explain: `These tokens go into a hidden "reasoning" channel — the model is allowed to think before emitting a tool call.`,
  },
  {
    type: 'tool',
    label: 'tool call',
    content: `get_pod_logs({\n  name: "recommendation-svc-7b8d",\n  namespace: "production",\n  lines: 200\n})`,
    explain: `The model emits structured tokens that look like a function call. The harness watches for this pattern.`,
  },
  {
    type: 'dispatch',
    label: 'harness dispatch',
    content: `[harness] parsed tool_call=get_pod_logs\n[harness] validating against schema… ok\n[harness] invoking handler…`,
    explain: `Code outside the model parses the tool call, validates the schema, and runs the actual function. The model is paused.`,
  },
  {
    type: 'result',
    label: 'tool result',
    content: `[2026-04-20 18:31:09Z] info  serving on :8080\n[2026-04-20 18:31:11Z] info  request id=a83f path=/recs latency=42ms\n[2026-04-20 18:32:47Z] info  request id=b91d path=/recs latency=38ms\n[2026-04-20 18:33:12Z] warn  cache fill rate 92% (last sample 480Mi)\n[2026-04-20 18:33:14Z] warn  cache fill rate 96% (last sample 502Mi)\n[2026-04-20 18:33:14Z] fatal received SIGKILL\n--- container restarted ---\n[2026-04-20 18:33:21Z] info  serving on :8080\n[…repeats every ~3 min…]`,
    explain: `The result is pasted back into context as if it were another message. Now the model continues with this in its working memory.`,
  },
  {
    type: 'think',
    label: 'model thinks',
    content: `Cache fill rate climbing past 480Mi just before SIGKILL is the signature of an OOM kill. I should confirm by checking the pod's memory limits and the recent events on the pod.`,
    explain: `The model reads the result, forms a hypothesis (OOM kill), and decides on the next call.`,
  },
  {
    type: 'tool',
    label: 'tool call',
    content: `kubectl_get({\n  kind: "pod",\n  name: "recommendation-svc-7b8d",\n  namespace: "production",\n  fields: ["spec.containers[*].resources", "status.containerStatuses"]\n})`,
    explain: `Second call. Notice the model is using narrower fields — it has learned (from training) to keep tool results small.`,
  },
  {
    type: 'result',
    label: 'tool result',
    content: `spec.containers[0].resources:\n  limits:    { memory: "512Mi", cpu: "500m" }\n  requests:  { memory: "256Mi", cpu: "200m" }\nstatus.containerStatuses[0]:\n  lastState.terminated:\n    reason: "OOMKilled"\n    exitCode: 137\n    finishedAt: "2026-04-20T18:33:14Z"\n  restartCount: 18`,
    explain: `Exit code 137 = SIGKILL from the OOM-killer; reason field confirms it. Restart count 18 over an hour matches the symptom.`,
  },
  {
    type: 'think',
    label: 'model thinks',
    content: `Confirmed: OOM at the 512Mi limit; the workload is sitting at ~480Mi steady-state and crossing the limit during cache-fill bursts. The next question is whether something changed recently — a workload that fit yesterday and doesn't fit today usually points at a deploy.`,
    explain: `Forming the next hypothesis: probably a recent change. Now the model wants the deployment manifest's recent history.`,
  },
  {
    type: 'tool',
    label: 'tool call',
    content: `kubectl_get({\n  kind: "deployment",\n  name: "recommendation-svc",\n  namespace: "production",\n  fields: ["spec.template.spec.containers[*].image", "metadata.annotations"]\n})`,
    explain: `Third call. The model is composing tool calls — each one narrows the hypothesis.`,
  },
  {
    type: 'result',
    label: 'tool result',
    content: `spec.template.spec.containers[0].image: "registry.internal/recommendation-svc:v1.4.7"\nmetadata.annotations:\n  kubernetes.io/change-cause: "bumped image to v1.4.7 — see release notes"\n  app.platform/last-rollout: "2026-04-20T14:22:18Z"\n  app.platform/previous-image: "registry.internal/recommendation-svc:v1.4.6"`,
    explain: `Image was rolled forward four hours ago — exactly tracks the symptom onset. Now the question is what changed in v1.4.7.`,
  },
  {
    type: 'tool',
    label: 'tool call',
    content: `search_changelog({\n  service: "recommendation-svc",\n  from: "v1.4.6",\n  to: "v1.4.7"\n})`,
    explain: `Fourth call — looking for the actual diff. (We're now four tool calls deep; the model is still on its first turn from the user's perspective.)`,
  },
  {
    type: 'result',
    label: 'tool result',
    content: `v1.4.7 (2026-04-20)\n  * RELEASE-3287 doubled in-memory recommendation cache size (256MB → 512MB) for better hit-rate on the long-tail. Cold-start memory unchanged; steady-state +256MB.\n  * RELEASE-3291 small bugfix in the ranker — irrelevant.`,
    explain: `Found it. Cache doubled steady-state memory; the pod limit didn't get raised to match.`,
  },
  {
    type: 'final',
    label: 'final answer',
    content: `Root cause: v1.4.7 (deployed 14:22Z) doubled the in-memory recommendation cache (256MB → 512MB), pushing steady-state memory past the pod's 512Mi limit. Each cache-fill burst trips the OOM-killer (exit 137); the pod is restarting every ~3 minutes as it warms back up and re-fills the cache.\n\nFix options, fastest-first:\n  1. (Immediate, safe) Raise the pod memory limit to 1Gi via a kubectl patch on the deployment. Re-rollout. Validates in <2 min.\n  2. (If risk-averse) Roll back to v1.4.6 — recovers immediately but loses the cache-hit-rate improvement.\n  3. (Real fix) Update the deployment manifest to make memory limits a function of cache size in the chart, so future cache changes can't drift.\n\nRecommend (1) now to stop the pages, (3) for the next sprint. Want me to draft the patch?`,
    explain: `The model emits text without a tool call. That signals the harness: this turn is over, the loop ends, the user sees this answer.`,
  },
];

export const wrapUp = `That's one full agent turn — twelve steps, four tool calls, one human message in, one human-readable answer out. Every box you saw maps onto a layer of this course:

  • the tokens going in and out — S1 (tonight) through S3
  • why the model "decided" to call a tool — S4 (training) and S5 (post-training)
  • how the harness keeps the loop running — S7
  • what kept the context manageable across four tool results — S8
  • what would make this fail in production (loops, hallucinated tools, bad results) — S9
  • the full walk through every layer — S10

You don't need to remember any of this yet. Just notice the *structure*.`;
