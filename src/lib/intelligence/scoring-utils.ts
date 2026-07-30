import type {
  EvidenceItem,
  IntelligenceModuleName,
  ModuleScore,
  Recommendation
} from "./types";

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function confidenceFromEvidence(
  evidenceCount: number,
  captureCount: number
): number {
  if (captureCount === 0) return 0;
  const coverage = Math.min(1, evidenceCount / Math.max(4, captureCount * 3));
  const sourceFactor = Math.min(1, captureCount / 3);
  return clampScore((coverage * 0.65 + sourceFactor * 0.35) * 100);
}

export function createRecommendation(args: {
  module: IntelligenceModuleName;
  priority: Recommendation["priority"];
  title: string;
  rationale: string;
  action: string;
  evidence?: EvidenceItem[];
  confidence?: number;
}): Recommendation {
  return {
    id: crypto.randomUUID(),
    module: args.module,
    priority: args.priority,
    title: args.title,
    rationale: args.rationale,
    action: args.action,
    evidence: args.evidence ?? [],
    confidence: args.confidence ?? 70
  };
}

export function sortRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  const priorityRank = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  return [...recommendations].sort((a, b) => {
    const priorityDelta = priorityRank[b.priority] - priorityRank[a.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return b.confidence - a.confidence;
  });
}

export function normalizeModuleScore(
  score: ModuleScore
): ModuleScore {
  return {
    ...score,
    score: clampScore(score.score),
    confidence: clampScore(score.confidence),
    recommendations: sortRecommendations(score.recommendations)
  };
}
