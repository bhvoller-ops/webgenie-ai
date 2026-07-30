import type { ContentPackage } from "@/lib/copy/types";
import type { PromptPackage } from "@/lib/prompts/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import { runAccessibilityAgent, runBrandAgent, runConversionAgent, runCopyAgent, runPromptAgent, runSeoAgent, runStrategyAgent, runTechnicalAgent } from "./agents";
import type { OrchestrationRunOutput, ReviewFinding } from "./types";

const severityRank = { critical: 4, high: 3, medium: 2, low: 1 } as const;

export function orchestrateArtifacts(args: { runId: string; projectId: string; blueprint: WebsiteBlueprint; contentPackage?: ContentPackage; promptPackage?: PromptPackage }): OrchestrationRunOutput {
  const reviews = [
    runStrategyAgent(args.blueprint),
    runConversionAgent(args.blueprint),
    runBrandAgent(args.blueprint, args.contentPackage),
    runSeoAgent(args.blueprint, args.contentPackage),
    runAccessibilityAgent(args.blueprint),
    runTechnicalAgent(args.blueprint, args.promptPackage),
    runCopyAgent(args.contentPackage),
    runPromptAgent(args.promptPackage)
  ];
  const findings = reviews.flatMap((item) => item.findings);
  const blockingFindings = findings.filter((item) => item.severity === "critical" || item.severity === "high").length;
  const weightedScore = Math.round(reviews.reduce((sum, item) => sum + item.score * item.confidence, 0) / Math.max(1, reviews.reduce((sum, item) => sum + item.confidence, 0)));
  const overallConfidence = Math.round(reviews.reduce((sum, item) => sum + item.confidence, 0) / reviews.length);
  const sorted = [...findings].sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
  return {
    schemaVersion: "1.0",
    runId: args.runId,
    projectId: args.projectId,
    generatedAt: new Date().toISOString(),
    status: blockingFindings ? "needs_review" : "approved",
    overallScore: weightedScore,
    overallConfidence,
    blockingFindings,
    reviews,
    revisionPlan: sorted.map((item: ReviewFinding, index) => ({ priority: index + 1, findingId: item.id, agent: item.agent, action: item.recommendation, rationale: item.detail })),
    snapshot: { blueprint: args.blueprint, contentPackage: args.contentPackage, promptPackage: args.promptPackage }
  };
}
