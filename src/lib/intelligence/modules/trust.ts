import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreTrust(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    const signals = capture.features.trustSignals ?? [];
    const externalLinks = capture.features.externalLinks ?? [];

    let score = 30 + Math.min(40, signals.length * 10);
    if (externalLinks.length > 0) score += 10;
    if ((capture.features.schemaTypes ?? []).some((type) => /review|organization|localbusiness/i.test(type))) {
      score += 15;
    }

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "trust_signals",
      detail: `Detected trust phrases: ${signals.join(", ") || "none"}`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  if (captures.every((capture) => (capture.features.trustSignals?.length ?? 0) < 2)) {
    recommendations.push(
      createRecommendation({
        module: "trust",
        priority: "high",
        title: "Build a stronger proof system",
        rationale:
          "Trust indicators are sparse across the analyzed experience.",
        action:
          "Add specific testimonials, named outcomes, credentials, guarantees, memberships, and verifiable review evidence.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "trust",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 70)
      ? ["Some pages include recognizable trust and authority signals."]
      : [],
    weaknesses: scores.some((score) => score < 55)
      ? ["Proof, credibility, or authority is not sufficiently visible."]
      : [],
    evidence,
    recommendations
  });
}
