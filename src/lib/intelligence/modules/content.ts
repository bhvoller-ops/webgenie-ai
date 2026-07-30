import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreContent(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const pageScores: number[] = [];

  for (const capture of captures) {
    let score = 50;
    const wordCount = capture.visibleText
      .split(/\s+/)
      .filter(Boolean).length;
    const h1Count =
      capture.features.headings?.filter((heading) => heading.level === 1).length ?? 0;
    const headingCount = capture.features.headings?.length ?? 0;

    if (capture.title && capture.title.length >= 20) score += 10;
    else score -= 8;

    if (capture.description && capture.description.length >= 70) score += 10;
    else score -= 7;

    if (wordCount >= 300) score += 12;
    else if (wordCount < 120) score -= 12;

    if (h1Count === 1) score += 10;
    else score -= 10;

    if (headingCount >= 4) score += 8;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "content_structure",
      detail: `Words: ${wordCount}; H1 count: ${h1Count}; headings: ${headingCount}`,
      weight: 1
    });

    pageScores.push(score);
  }

  const recommendations = [];

  if (captures.some((capture) => !capture.description)) {
    recommendations.push(
      createRecommendation({
        module: "content",
        priority: "high",
        title: "Strengthen page summaries",
        rationale:
          "One or more analyzed pages lacks a clear meta description or concise summary.",
        action:
          "Write benefit-led page summaries that match search intent and explain the next action.",
        evidence,
        confidence: confidenceFromEvidence(evidence.length, captures.length)
      })
    );
  }

  if (
    captures.some(
      (capture) =>
        (capture.features.headings?.filter((heading) => heading.level === 1).length ??
          0) !== 1
    )
  ) {
    recommendations.push(
      createRecommendation({
        module: "content",
        priority: "high",
        title: "Use one clear primary headline",
        rationale:
          "A page should establish one dominant message before presenting supporting sections.",
        action:
          "Use exactly one H1 per page and organize supporting ideas with a logical H2/H3 hierarchy.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "content",
    score: average(pageScores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: pageScores.some((score) => score >= 75)
      ? ["Some pages demonstrate strong content depth and hierarchy."]
      : [],
    weaknesses: pageScores.some((score) => score < 60)
      ? ["Content depth or structural clarity is inconsistent."]
      : [],
    evidence,
    recommendations
  });
}
