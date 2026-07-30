import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreDesign(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores = captures.map((capture) => {
    const images = capture.features.images ?? [];
    const headings = capture.features.headings ?? [];
    const screenshotAvailable = Boolean(capture.screenshotPath);

    let score = 40;
    if (screenshotAvailable) score += 20;
    if (images.length >= 3) score += 15;
    if (headings.length >= 4) score += 15;
    if (images.length > 60) score -= 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "design_proxy",
      detail: `Screenshot: ${screenshotAvailable}; images: ${images.length}; headings: ${headings.length}`,
      weight: 0.7
    });

    return score;
  });

  return normalizeModuleScore({
    module: "design",
    score: average(scores),
    confidence: Math.min(
      65,
      confidenceFromEvidence(evidence.length, captures.length)
    ),
    strengths: scores.some((score) => score >= 70)
      ? ["Some references show a developed visual hierarchy."]
      : [],
    weaknesses: [
      "Automated design scoring is provisional until visual-model analysis is connected."
    ],
    evidence,
    recommendations: [
      createRecommendation({
        module: "design",
        priority: "medium",
        title: "Run visual screenshot analysis",
        rationale:
          "Markup-derived signals cannot fully assess composition, typography, spacing, visual quality, or brand consistency.",
        action:
          "Send captured screenshots to a vision-capable model and merge those results with the deterministic score.",
        evidence,
        confidence: 95
      })
    ]
  });
}
