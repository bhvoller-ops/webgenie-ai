import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreConversion(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const pageScores: number[] = [];

  for (const capture of captures) {
    const ctas = capture.features.ctas ?? [];
    const forms = capture.features.forms ?? [];
    const trustSignals = capture.features.trustSignals ?? [];

    let score = 35;
    if (ctas.length >= 1) score += 20;
    if (ctas.length >= 3) score += 10;
    if (forms.length >= 1) score += 15;
    if (trustSignals.length >= 2) score += 15;
    if (ctas.length > 12) score -= 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "conversion_elements",
      detail: `CTAs: ${ctas.length}; forms: ${forms.length}; trust signals: ${trustSignals.length}`,
      weight: 1
    });

    pageScores.push(score);
  }

  const totalCtas = captures.reduce(
    (sum, capture) => sum + (capture.features.ctas?.length ?? 0),
    0
  );
  const totalForms = captures.reduce(
    (sum, capture) => sum + (capture.features.forms?.length ?? 0),
    0
  );
  const totalTrust = captures.reduce(
    (sum, capture) => sum + (capture.features.trustSignals?.length ?? 0),
    0
  );

  const recommendations = [];

  if (totalCtas === 0) {
    recommendations.push(
      createRecommendation({
        module: "conversion",
        priority: "critical",
        title: "Add a clear primary call to action",
        rationale:
          "The analyzed experience does not present a detectable action that advances the visitor.",
        action:
          "Choose one primary conversion action and repeat it consistently in the hero, proof, and closing sections.",
        evidence
      })
    );
  }

  if (totalForms === 0) {
    recommendations.push(
      createRecommendation({
        module: "conversion",
        priority: "high",
        title: "Reduce lead-capture friction",
        rationale:
          "No direct conversion form was detected across the captured pages.",
        action:
          "Add a short, mobile-friendly form with only the fields required to begin the sales conversation.",
        evidence
      })
    );
  }

  if (totalTrust < captures.length) {
    recommendations.push(
      createRecommendation({
        module: "conversion",
        priority: "high",
        title: "Place proof near decision points",
        rationale:
          "Trust evidence appears limited relative to the number of analyzed pages.",
        action:
          "Add testimonials, credentials, guarantees, outcome evidence, and recognizable customer proof beside key CTAs.",
        evidence
      })
    );
  }

  return normalizeModuleScore({
    module: "conversion",
    score: average(pageScores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths:
      totalCtas > 0
        ? ["The experience contains detectable conversion actions."]
        : [],
    weaknesses:
      totalForms === 0 || totalTrust < captures.length
        ? ["Lead capture or trust reinforcement is incomplete."]
        : [],
    evidence,
    recommendations
  });
}
