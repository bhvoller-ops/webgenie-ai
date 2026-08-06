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

export interface FootInTheDoorItem {
  id: string;
  label: string;
  detail: string;
  pitch: string;
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
  /** Verifiable, sellable gaps — present only from schemaVersion 1.1 onward. */
  footInTheDoor?: FootInTheDoorItem[];
}

// --- v2 presentation metadata ---

export const MODULE_LABELS: Record<IntelligenceModuleName, string> = {
  design: "Design",
  brand: "Brand",
  ux: "UX",
  conversion: "Conversion",
  content: "Content",
  seo: "SEO",
  ai_search: "AI Search",
  technical: "Technical",
  accessibility: "Accessibility",
  trust: "Trust",
  revenue: "Revenue",
};

export const MODULE_DESCRIPTIONS: Record<IntelligenceModuleName, string> = {
  design: "Visual hierarchy, spacing rhythm, typographic system and colour discipline.",
  brand: "Identity consistency, voice, and differentiation against the reference set.",
  ux: "Navigation clarity, task flow friction, and interaction affordances.",
  conversion: "CTA strength, form friction, and the path from arrival to action.",
  content: "Message clarity, proof density, and depth against buyer questions.",
  seo: "Crawlability, metadata, internal linking, and intent coverage.",
  ai_search: "Answer-engine readability, structured data, and citation surface.",
  technical: "Performance budget, render path, script weight, and stability.",
  accessibility: "WCAG contrast, semantics, focus order, and assistive support.",
  trust: "Social proof, credentials, transparency, and risk reversal.",
  revenue: "Monetisation surface, offer clarity, and pricing legibility.",
};

export const MODULE_ORDER: IntelligenceModuleName[] = [
  "design",
  "brand",
  "ux",
  "conversion",
  "content",
  "seo",
  "ai_search",
  "technical",
  "accessibility",
  "trust",
  "revenue",
];

export const PRIORITY_ORDER: Recommendation["priority"][] = [
  "critical",
  "high",
  "medium",
  "low",
];
