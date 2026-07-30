import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreSeo(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    let score = 30;
    const h1Count =
      capture.features.headings?.filter((heading) => heading.level === 1).length ?? 0;
    const schemaCount = capture.features.schemaTypes?.length ?? 0;

    if (capture.title) score += 15;
    if (capture.description) score += 15;
    if (capture.canonicalUrl) score += 10;
    if (h1Count === 1) score += 12;
    if (schemaCount > 0) score += 12;
    if (capture.statusCode >= 200 && capture.statusCode < 400) score += 6;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "seo_signals",
      detail: `Title: ${Boolean(capture.title)}; description: ${Boolean(
        capture.description
      )}; canonical: ${Boolean(capture.canonicalUrl)}; schema types: ${schemaCount}`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  if (captures.some((capture) => !capture.canonicalUrl)) {
    recommendations.push(
      createRecommendation({
        module: "seo",
        priority: "medium",
        title: "Declare canonical URLs",
        rationale:
          "One or more pages does not expose a canonical URL in the captured markup.",
        action:
          "Add self-referencing canonical tags to indexable pages and validate canonical consistency.",
        evidence
      })
    );
  }

  if (captures.every((capture) => (capture.features.schemaTypes?.length ?? 0) === 0)) {
    recommendations.push(
      createRecommendation({
        module: "seo",
        priority: "high",
        title: "Add structured data",
        rationale:
          "No JSON-LD schema types were detected in the analyzed pages.",
        action:
          "Add valid organization, local business, service, product, article, FAQ, or review schema where supported by visible content.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "seo",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 75)
      ? ["Some pages include strong foundational SEO signals."]
      : [],
    weaknesses: scores.some((score) => score < 60)
      ? ["Metadata, canonicalization, heading structure, or schema is incomplete."]
      : [],
    evidence,
    recommendations
  });
}
