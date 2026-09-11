import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";
import { computeEvidenceState } from "../evidence-state";

export function scoreConversion(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const pageScores: number[] = [];
  // Hotfix (2026-09-11, docs/history.md): a real production capture of
  // Georgia Roof Advisors was a bot-detection interstitial ("CTAs: 0;
  // forms: 0; trust signals: 0") and this module wrote a *critical*
  // "Add a clear primary call to action" recommendation from it. Any
  // capture whose extraction was unreliable is excluded from the
  // zero-totals that drive these recommendations below.
  const reliableCaptures = captures.filter((capture) => {
    const state = computeEvidenceState({
      likelyBlocked: false,
      extractionReliable: capture.features.extractionReliable ?? true,
      signalCount: (capture.features.ctas ?? []).length + (capture.features.forms ?? []).length + (capture.features.trustSignals ?? []).length
    });
    return state !== "EXTRACTION_FAILED" && state !== "CAPTURE_BLOCKED";
  });
  const anyUnreliable = reliableCaptures.length < captures.length;

  for (const capture of captures) {
    const ctas = capture.features.ctas ?? [];
    const forms = capture.features.forms ?? [];
    const trustSignals = capture.features.trustSignals ?? [];
    const extractionReliable = capture.features.extractionReliable ?? true;

    let score = 35;
    if (!extractionReliable) {
      // Unreliable extraction is a data-quality problem, not a
      // conversion-quality one -- neutral midpoint, never a penalty.
      score = 50;
    } else {
      if (ctas.length >= 1) score += 20;
      if (ctas.length >= 3) score += 10;
      if (forms.length >= 1) score += 15;
      if (trustSignals.length >= 2) score += 15;
      if (ctas.length > 12) score -= 10;
    }

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "conversion_elements",
      detail: extractionReliable
        ? `CTAs: ${ctas.length}; forms: ${forms.length}; trust signals: ${trustSignals.length}`
        : "Evidence state: EXTRACTION_FAILED -- element counts for this capture are not trustworthy and are excluded from conversion findings.",
      weight: 1
    });

    pageScores.push(score);
  }

  // Zero-totals below are computed only from captures whose extraction is
  // trustworthy -- an unreliable capture must never contribute a false
  // zero toward "no CTA anywhere" the way it did in the real incident.
  const totalCtas = reliableCaptures.reduce(
    (sum, capture) => sum + (capture.features.ctas?.length ?? 0),
    0
  );
  const totalForms = reliableCaptures.reduce(
    (sum, capture) => sum + (capture.features.forms?.length ?? 0),
    0
  );
  const totalTrust = reliableCaptures.reduce(
    (sum, capture) => sum + (capture.features.trustSignals?.length ?? 0),
    0
  );

  const recommendations = [];

  // No reliable capture at all -- INCONCLUSIVE, never a confident
  // "add a CTA" finding manufactured from zero trustworthy evidence.
  if (reliableCaptures.length === 0) {
    return normalizeModuleScore({
      module: "conversion",
      score: average(pageScores),
      confidence: 0,
      strengths: [],
      weaknesses: [],
      evidence,
      recommendations: []
    });
  }

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

  if (totalTrust < reliableCaptures.length) {
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
    confidence: anyUnreliable ? Math.min(40, confidenceFromEvidence(evidence.length, captures.length)) : confidenceFromEvidence(evidence.length, captures.length),
    strengths:
      totalCtas > 0
        ? ["The experience contains detectable conversion actions."]
        : [],
    weaknesses:
      totalForms === 0 || totalTrust < reliableCaptures.length
        ? ["Lead capture or trust reinforcement is incomplete."]
        : [],
    evidence,
    recommendations
  });
}
