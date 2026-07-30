import type { ModuleScore, WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import type { VisualAnalysisResult } from "./types";
import { sortRecommendations } from "@/lib/intelligence/scoring-utils";

const MODULE_WEIGHTS: Record<string, number> = {
  design: 0.08, brand: 0.08, ux: 0.12, conversion: 0.16, content: 0.10,
  seo: 0.10, ai_search: 0.08, technical: 0.09, accessibility: 0.07,
  trust: 0.07, revenue: 0.05
};

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function mergeVisualIntelligence(
  intelligence: WebsiteIntelligenceOutput,
  visualResults: VisualAnalysisResult[]
): WebsiteIntelligenceOutput {
  if (!visualResults.length) return intelligence;

  const visualScore = Math.round(average(visualResults.map((result) => result.overallScore)));
  const visualConfidence = Math.round(average(visualResults.map((result) => result.overallConfidence)));
  const visualEvidence = visualResults.flatMap((result) => result.evidence);
  const visualRecommendations = visualResults.flatMap((result) => result.recommendations);
  const visualStrengths = [...new Set(visualResults.flatMap((result) => result.strengths))].slice(0, 8);
  const visualWeaknesses = [...new Set(visualResults.flatMap((result) => result.weaknesses))].slice(0, 8);

  const moduleScores = intelligence.moduleScores.map((module): ModuleScore => {
    if (module.module === "design") {
      const modelWeight = Math.max(0.4, Math.min(0.8, visualConfidence / 100));
      return {
        ...module,
        score: Math.round(module.score * (1 - modelWeight) + visualScore * modelWeight),
        confidence: Math.max(module.confidence, visualConfidence),
        strengths: [...new Set([...module.strengths, ...visualStrengths])],
        weaknesses: visualWeaknesses,
        evidence: [...module.evidence, ...visualEvidence],
        recommendations: sortRecommendations([...module.recommendations, ...visualRecommendations])
      };
    }

    if (module.module === "brand") {
      const brandVisual = Math.round(average(visualResults.map((result) =>
        average([result.metrics.color.score, result.metrics.consistency.score, result.metrics.credibility.score])
      )));
      return {
        ...module,
        score: Math.round(module.score * 0.45 + brandVisual * 0.55),
        confidence: Math.max(module.confidence, Math.round(visualConfidence * 0.9)),
        evidence: [...module.evidence, ...visualEvidence],
        weaknesses: [...new Set([...module.weaknesses, ...visualWeaknesses])].slice(0, 8)
      };
    }

    return module;
  });

  const overallScore = Math.round(moduleScores.reduce((sum, module) => sum + module.score * (MODULE_WEIGHTS[module.module] ?? 0), 0));
  const overallConfidence = Math.round(moduleScores.reduce((sum, module) => sum + module.confidence * (MODULE_WEIGHTS[module.module] ?? 0), 0));

  return {
    ...intelligence,
    schemaVersion: "1.1",
    generatedAt: new Date().toISOString(),
    overallScore,
    overallConfidence,
    moduleScores,
    topRecommendations: sortRecommendations(moduleScores.flatMap((module) => module.recommendations)).slice(0, 15),
    visualSummary: {
      provider: visualResults[0].provider,
      model: visualResults[0].model,
      pagesAnalyzed: visualResults.length,
      score: visualScore,
      confidence: visualConfidence
    }
  };
}
