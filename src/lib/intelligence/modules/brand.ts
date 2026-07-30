import type { IntelligenceCaptureInput } from "../input";
import type { ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreBrand(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence = captures.map((capture) => ({
    sourceCaptureId: capture.captureId,
    sourceUrl: capture.sourceUrl,
    type: "brand_proxy",
    detail: `Title: ${capture.title ?? "missing"}; description present: ${Boolean(
      capture.description
    )}`,
    weight: 0.6
  }));

  const scores = captures.map((capture) => {
    let score = 40;
    if (capture.title) score += 20;
    if (capture.description) score += 20;
    if ((capture.features.trustSignals?.length ?? 0) > 0) score += 10;
    return score;
  });

  return normalizeModuleScore({
    module: "brand",
    score: average(scores),
    confidence: Math.min(
      60,
      confidenceFromEvidence(evidence.length, captures.length)
    ),
    strengths: scores.some((score) => score >= 70)
      ? ["Some references communicate a recognizable positioning foundation."]
      : [],
    weaknesses: [
      "Tone, visual identity, differentiation, and brand consistency require model-assisted review."
    ],
    evidence,
    recommendations: [
      createRecommendation({
        module: "brand",
        priority: "high",
        title: "Clarify differentiated positioning",
        rationale:
          "Strong websites make the business, audience, promise, and reason to believe immediately understandable.",
        action:
          "Define a concise positioning statement and apply it consistently across headlines, proof, offers, and calls to action.",
        evidence,
        confidence: 72
      })
    ]
  });
}
