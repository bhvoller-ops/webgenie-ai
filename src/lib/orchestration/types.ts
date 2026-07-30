import type { ContentPackage } from "@/lib/copy/types";
import type { PromptPackage } from "@/lib/prompts/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

export const specialistAgents = [
  "strategy",
  "conversion",
  "brand",
  "seo",
  "accessibility",
  "technical",
  "copy",
  "prompt"
] as const;

export type SpecialistAgent = (typeof specialistAgents)[number];
export type ReviewSeverity = "critical" | "high" | "medium" | "low";
export type ReviewStatus = "open" | "accepted" | "dismissed" | "resolved";
export type RunStatus = "queued" | "running" | "needs_review" | "approved" | "rejected" | "failed";

export interface ReviewFinding {
  id: string;
  agent: SpecialistAgent;
  severity: ReviewSeverity;
  title: string;
  detail: string;
  recommendation: string;
  targetType: "blueprint" | "content" | "prompt" | "project";
  targetRef?: string;
  status: ReviewStatus;
}

export interface AgentReview {
  agent: SpecialistAgent;
  score: number;
  confidence: number;
  summary: string;
  findings: ReviewFinding[];
  completedAt: string;
}

export interface OrchestrationSnapshot {
  blueprint: WebsiteBlueprint;
  contentPackage?: ContentPackage;
  promptPackage?: PromptPackage;
}

export interface OrchestrationRunOutput {
  schemaVersion: "1.0";
  runId: string;
  projectId: string;
  generatedAt: string;
  status: RunStatus;
  overallScore: number;
  overallConfidence: number;
  blockingFindings: number;
  reviews: AgentReview[];
  revisionPlan: Array<{
    priority: number;
    findingId: string;
    agent: SpecialistAgent;
    action: string;
    rationale: string;
  }>;
  snapshot: OrchestrationSnapshot;
}
