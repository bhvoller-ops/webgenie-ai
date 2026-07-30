import type { IntelligenceCaptureInput } from "../input";
import type { ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreRevenue(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence = captures.map((capture) => {
    const text = capture.visibleText.toLowerCase();
    const monetizationSignals = [
      "pricing",
      "book",
      "schedule",
      "quote",
      "buy",
      "shop",
      "plan",
      "package",
      "consultation"
    ].filter((term) => text.includes(term));

    return {
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "revenue_signals",
      detail: `Detected commercial terms: ${monetizationSignals.join(", ") || "none"}`,
      weight: 0.8
    };
  });

  const scores = evidence.map((item) => {
    const count =
      item.detail === "Detected commercial terms: none"
        ? 0
        : item.detail.split(",").length;
    return 35 + Math.min(50, count * 10);
  });

  return normalizeModuleScore({
    module: "revenue",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 70)
      ? ["Some references clearly connect the website to a commercial action."]
      : [],
    weaknesses: scores.some((score) => score < 55)
      ? ["The path from visitor interest to revenue is not consistently explicit."]
      : [],
    evidence,
    recommendations: [
      createRecommendation({
        module: "revenue",
        priority: "high",
        title: "Connect every major page to revenue",
        rationale:
          "A high-performing website should guide visitors toward a measurable commercial outcome.",
        action:
          "Map each page to a primary revenue event such as a qualified lead, booking, purchase, consultation, or subscription.",
        evidence,
        confidence: 78
      })
    ]
  });
}
