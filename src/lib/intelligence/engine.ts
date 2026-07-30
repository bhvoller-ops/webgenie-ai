import type { IntelligenceCaptureInput } from "./input";
import type {
  ModuleScore,
  WebsiteIntelligenceOutput
} from "./types";
import { average, sortRecommendations } from "./scoring-utils";
import { scoreContent } from "./modules/content";
import { scoreConversion } from "./modules/conversion";
import { scoreSeo } from "./modules/seo";
import { scoreAccessibility } from "./modules/accessibility";
import { scoreTechnical } from "./modules/technical";
import { scoreTrust } from "./modules/trust";
import { scoreUx } from "./modules/ux";
import { scoreAiSearch } from "./modules/ai-search";
import { scoreDesign } from "./modules/design";
import { scoreBrand } from "./modules/brand";
import { scoreRevenue } from "./modules/revenue";

const moduleWeights: Record<ModuleScore["module"], number> = {
  design: 0.08,
  brand: 0.08,
  ux: 0.12,
  conversion: 0.16,
  content: 0.1,
  seo: 0.1,
  ai_search: 0.08,
  technical: 0.09,
  accessibility: 0.07,
  trust: 0.07,
  revenue: 0.05
};

export function runWebsiteIntelligence(args: {
  jobId: string;
  projectId: string;
  captures: IntelligenceCaptureInput[];
  referencesAttempted: number;
  referencesFailed: number;
}): WebsiteIntelligenceOutput {
  const moduleScores: ModuleScore[] = [
    scoreDesign(args.captures),
    scoreBrand(args.captures),
    scoreUx(args.captures),
    scoreConversion(args.captures),
    scoreContent(args.captures),
    scoreSeo(args.captures),
    scoreAiSearch(args.captures),
    scoreTechnical(args.captures),
    scoreAccessibility(args.captures),
    scoreTrust(args.captures),
    scoreRevenue(args.captures)
  ];

  const weightedScore = moduleScores.reduce(
    (sum, module) => sum + module.score * moduleWeights[module.module],
    0
  );

  const weightedConfidence = moduleScores.reduce(
    (sum, module) =>
      sum + module.confidence * moduleWeights[module.module],
    0
  );

  const topRecommendations = sortRecommendations(
    moduleScores.flatMap((module) => module.recommendations)
  ).slice(0, 12);

  return {
    schemaVersion: "1.0",
    jobId: args.jobId,
    projectId: args.projectId,
    generatedAt: new Date().toISOString(),
    overallScore: Math.round(weightedScore),
    overallConfidence: Math.round(weightedConfidence),
    moduleScores,
    topRecommendations,
    sourceSummary: {
      capturesAnalyzed: args.captures.length,
      referencesAttempted: args.referencesAttempted,
      referencesFailed: args.referencesFailed
    }
  };
}
