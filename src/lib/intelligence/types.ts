export type IntelligenceModuleName =
  | "design"
  | "brand"
  | "ux"
  | "conversion"
  | "content"
  | "seo"
  | "ai_search"
  | "technical"
  | "accessibility"
  | "trust"
  | "revenue";

export interface EvidenceItem {
  sourceCaptureId: string;
  sourceUrl: string;
  type: string;
  detail: string;
  weight: number;
}

export interface Recommendation {
  id: string;
  module: IntelligenceModuleName;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  rationale: string;
  action: string;
  evidence: EvidenceItem[];
  confidence: number;
}

export interface ModuleScore {
  module: IntelligenceModuleName;
  score: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  evidence: EvidenceItem[];
  recommendations: Recommendation[];
}

export interface WebsiteIntelligenceOutput {
  schemaVersion: "1.0" | "1.1";
  jobId: string;
  projectId: string;
  generatedAt: string;
  overallScore: number;
  overallConfidence: number;
  moduleScores: ModuleScore[];
  topRecommendations: Recommendation[];
  sourceSummary: {
    capturesAnalyzed: number;
    referencesAttempted: number;
    referencesFailed: number;
  };
  visualSummary?: {
    provider: string;
    model: string;
    pagesAnalyzed: number;
    score: number;
    confidence: number;
  };
}
