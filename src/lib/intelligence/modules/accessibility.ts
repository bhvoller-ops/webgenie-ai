import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreAccessibility(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    const images = capture.features.images ?? [];
    const missingAlt = images.filter((image) => !image.alt?.trim()).length;
    const h1Count =
      capture.features.headings?.filter((heading) => heading.level === 1).length ?? 0;

    let score = 60;
    if (images.length > 0) {
      const altCoverage = (images.length - missingAlt) / images.length;
      score += altCoverage * 20;
    } else {
      score += 10;
    }

    if (capture.language) score += 10;
    else score -= 10;

    if (h1Count === 1) score += 10;
    else score -= 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "accessibility_markup",
      detail: `Images: ${images.length}; missing alt: ${missingAlt}; language declared: ${Boolean(
        capture.language
      )}; H1 count: ${h1Count}`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  if (
    captures.some((capture) =>
      (capture.features.images ?? []).some((image) => !image.alt?.trim())
    )
  ) {
    recommendations.push(
      createRecommendation({
        module: "accessibility",
        priority: "high",
        title: "Complete image alternatives",
        rationale:
          "One or more captured images lacks alternative text.",
        action:
          "Add concise alt text for informative images and empty alt attributes for purely decorative images.",
        evidence
      })
    );
  }

  if (captures.some((capture) => !capture.language)) {
    recommendations.push(
      createRecommendation({
        module: "accessibility",
        priority: "medium",
        title: "Declare the document language",
        rationale:
          "Language metadata was missing from one or more analyzed documents.",
        action:
          "Add a valid lang attribute to the root HTML element on every page.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "accessibility",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 80)
      ? ["Some pages demonstrate solid semantic and image-text coverage."]
      : [],
    weaknesses: scores.some((score) => score < 65)
      ? ["Markup-level accessibility issues were detected."]
      : [],
    evidence,
    recommendations
  });
}
