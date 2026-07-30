import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreUx(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    const headings = capture.features.headings ?? [];
    const internalLinks = capture.features.internalLinks ?? [];
    const forms = capture.features.forms ?? [];

    let score = 45;
    if (headings.length >= 4) score += 15;
    if (internalLinks.length >= 3) score += 15;
    if (internalLinks.length > 80) score -= 10;
    if (forms.every((form) => form.fieldCount <= 7)) score += 10;
    if (capture.visibleText.length > 500) score += 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "ux_structure",
      detail: `Headings: ${headings.length}; internal links: ${internalLinks.length}; forms: ${forms.length}`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  if (captures.some((capture) => (capture.features.internalLinks?.length ?? 0) > 80)) {
    recommendations.push(
      createRecommendation({
        module: "ux",
        priority: "medium",
        title: "Simplify navigation choices",
        rationale:
          "A very high number of internal links can make the experience difficult to scan and prioritize.",
        action:
          "Group navigation by visitor intent, reduce duplicate links, and emphasize the primary journey.",
        evidence
      })
    );
  }

  if (
    captures.some((capture) =>
      (capture.features.forms ?? []).some((form) => form.fieldCount > 7)
    )
  ) {
    recommendations.push(
      createRecommendation({
        module: "ux",
        priority: "high",
        title: "Shorten conversion forms",
        rationale:
          "At least one form requests more information than is typically needed for an initial conversion.",
        action:
          "Collect only essential information first, then gather secondary details later.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "ux",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 75)
      ? ["Some references demonstrate clear hierarchy and manageable interaction paths."]
      : [],
    weaknesses: scores.some((score) => score < 60)
      ? ["Navigation, form complexity, or information hierarchy needs refinement."]
      : [],
    evidence,
    recommendations
  });
}
