export type ReferenceRole =
  | "current_site"
  | "competitor"
  | "inspiration"
  | "benchmark";

export type AnalysisJobStatus =
  | "queued"
  | "validating"
  | "capturing"
  | "extracting"
  | "analyzing"
  | "scoring"
  | "synthesizing"
  | "validating_output"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

export interface Project {
  id: string;
  name: string;
  industry: string;
  primaryGoal: string;
  primaryCta: string;
  status: "draft" | "active" | "completed";
}

export interface WebsiteReference {
  id: string;
  projectId: string;
  url: string;
  role: ReferenceRole;
  label?: string;
  priority: number;
}

// --- v2 view-model additions (presentation only, no engine impact) ---

export interface AnalysisJob {
  id: string;
  projectId: string;
  status: AnalysisJobStatus;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  overallScore?: number;
}

export interface ProjectSummary extends Project {
  primaryUrl: string;
  referenceCount: number;
  latestJob?: AnalysisJob;
  updatedAt: string;
  deliverables: {
    intelligence: boolean;
    blueprint: boolean;
    promptPackage: boolean;
    contentPackage: boolean;
  };
}

export const JOB_PIPELINE: AnalysisJobStatus[] = [
  "queued",
  "validating",
  "capturing",
  "extracting",
  "analyzing",
  "scoring",
  "synthesizing",
  "validating_output",
  "completed",
];

export const JOB_STAGE_LABELS: Record<AnalysisJobStatus, string> = {
  queued: "Queued",
  validating: "Validating URLs",
  capturing: "Capturing pages",
  extracting: "Extracting features",
  analyzing: "Running modules",
  scoring: "Scoring",
  synthesizing: "Synthesizing",
  validating_output: "Validating output",
  completed: "Completed",
  partial: "Partial",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const REFERENCE_ROLE_LABELS: Record<ReferenceRole, string> = {
  current_site: "Current site",
  competitor: "Competitor",
  inspiration: "Inspiration",
  benchmark: "Benchmark",
};
