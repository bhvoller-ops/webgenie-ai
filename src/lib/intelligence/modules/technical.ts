import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreTechnical(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    let score = 50;
    const htmlSizeKb = Math.round(Buffer.byteLength(capture.html, "utf8") / 1024);

    if (capture.statusCode >= 200 && capture.statusCode < 300) score += 20;
    else if (capture.statusCode >= 400) score -= 25;

    if (capture.contentType?.includes("text/html")) score += 10;
    if (htmlSizeKb < 500) score += 10;
    else if (htmlSizeKb > 1500) score -= 15;

    if (capture.finalUrl.startsWith("https://")) score += 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "technical_delivery",
      detail: `Status: ${capture.statusCode}; HTML size: ${htmlSizeKb} KB; HTTPS: ${capture.finalUrl.startsWith(
        "https://"
      )}`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  if (captures.some((capture) => !capture.finalUrl.startsWith("https://"))) {
    recommendations.push(
      createRecommendation({
        module: "technical",
        priority: "critical",
        title: "Serve every page securely",
        rationale:
          "At least one analyzed page resolved without HTTPS.",
        action:
          "Enforce HTTPS, redirect HTTP requests, and review mixed-content dependencies.",
        evidence
      })
    );
  }

  if (
    captures.some(
      (capture) => Buffer.byteLength(capture.html, "utf8") / 1024 > 1500
    )
  ) {
    recommendations.push(
      createRecommendation({
        module: "technical",
        priority: "medium",
        title: "Reduce document payload",
        rationale:
          "One or more captured HTML documents is unusually large.",
        action:
          "Remove duplicated markup, defer noncritical widgets, and simplify server-rendered page output.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "technical",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 80)
      ? ["Core page delivery appears stable and secure on some references."]
      : [],
    weaknesses: scores.some((score) => score < 60)
      ? ["Delivery status, payload size, or transport security needs improvement."]
      : [],
    evidence,
    recommendations
  });
}
