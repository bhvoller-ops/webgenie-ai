import type { OrchestrationRunOutput } from "./types";

export function orchestrationToMarkdown(run: OrchestrationRunOutput): string {
  const reviews = run.reviews.map((review) => `## ${review.agent.toUpperCase()} — ${review.score}/100\n\n${review.summary}\n\n${review.findings.length ? review.findings.map((f) => `- **${f.severity.toUpperCase()}: ${f.title}** — ${f.detail} Action: ${f.recommendation}`).join("\n") : "No findings."}`).join("\n\n");
  const plan = run.revisionPlan.length ? run.revisionPlan.map((item) => `${item.priority}. **${item.agent}** — ${item.action}\n   - ${item.rationale}`).join("\n") : "No revisions required.";
  return `# WebGenie Orchestration Review\n\n- Status: ${run.status}\n- Overall score: ${run.overallScore}/100\n- Confidence: ${run.overallConfidence}%\n- Blocking findings: ${run.blockingFindings}\n\n# Specialist Reviews\n\n${reviews}\n\n# Revision Plan\n\n${plan}\n`;
}
