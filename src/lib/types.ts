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
