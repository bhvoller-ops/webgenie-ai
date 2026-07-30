import type { EvidenceItem, Recommendation } from "@/lib/intelligence/types";

export interface VisualMetric {
  score: number;
  confidence: number;
  summary: string;
  evidence: string[];
}

export interface VisualAnalysisResult {
  schemaVersion: "1.0";
  provider: string;
  model: string;
  sourceCaptureId: string;
  sourceUrl: string;
  analyzedAt: string;
  metrics: {
    hierarchy: VisualMetric;
    typography: VisualMetric;
    spacing: VisualMetric;
    color: VisualMetric;
    consistency: VisualMetric;
    credibility: VisualMetric;
    mobileReadiness: VisualMetric;
  };
  overallScore: number;
  overallConfidence: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  evidence: EvidenceItem[];
  raw?: unknown;
}

export interface VisualAnalysisInput {
  captureId: string;
  sourceUrl: string;
  screenshotPath: string;
  screenshotBytes: Uint8Array;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  pageTitle?: string | null;
  visibleTextExcerpt?: string;
}

export interface VisualAnalysisProvider {
  readonly name: string;
  readonly model: string;
  analyze(input: VisualAnalysisInput): Promise<VisualAnalysisResult>;
}
