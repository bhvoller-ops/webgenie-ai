import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";
import { canClaimAbsence, computeEvidenceState } from "../evidence-state";

export function scoreTrust(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];
  // Hotfix (2026-09-11, docs/history.md): a capture whose extraction was
  // unreliable (or whose page load was itself blocked) must never
  // contribute a "sparse"/"absent" trust reading -- that's exactly the
  // false "no reviews, no trust signals" finding a real production batch
  // generated for Findlay Roofing and Superior Roofing (genuine captures,
  // extraction bug) and Georgia Roof Advisors (bot-detection interstitial
  // scored as if it were the real page).
  let anyReliableCaptureWithLowTrust = false;
  let allCapturesUnreliable = captures.length > 0;

  for (const capture of captures) {
    const signals = capture.features.trustSignals ?? [];
    const externalLinks = capture.features.externalLinks ?? [];
    const extractionReliable = capture.features.extractionReliable ?? true;
    const state = computeEvidenceState({
      likelyBlocked: false, // blocked captures never reach this stage -- see process-analysis-job.ts
      extractionReliable,
      signalCount: signals.length
    });
    if (state !== "EXTRACTION_FAILED" && state !== "CAPTURE_BLOCKED") allCapturesUnreliable = false;

    let score = 30 + Math.min(40, signals.length * 10);
    if (externalLinks.length > 0) score += 10;
    if ((capture.features.schemaTypes ?? []).some((type) => /review|organization|localbusiness/i.test(type))) {
      score += 15;
    }
    // An unreliable extraction must never drag the score down as if
    // absence were confirmed -- treat it as a neutral, low-confidence
    // midpoint instead of scoring it exactly as "verified sparse."
    if (!canClaimAbsence(state) && signals.length === 0) score = 50;

    if (canClaimAbsence(state) && signals.length === 0) anyReliableCaptureWithLowTrust = true;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "trust_signals",
      detail:
        state === "VERIFIED_PRESENT" || state === "VERIFIED_ABSENT"
          ? `Detected trust phrases: ${signals.join(", ") || "none"}`
          : `Evidence state: ${state} -- extraction unreliable, trust-phrase detection not trustworthy for this capture.`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [];

  // Only recommend "build a stronger proof system" when every capture's
  // reading is itself trustworthy AND low -- never from a batch that
  // includes even one unreliable/blocked capture with nothing else to
  // corroborate it, and never claim absence outright if ALL captures were
  // unreliable (that's INCONCLUSIVE, not "sparse").
  if (!allCapturesUnreliable && anyReliableCaptureWithLowTrust && captures.every((capture) => (capture.features.trustSignals?.length ?? 0) < 2)) {
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
    confidence: allCapturesUnreliable ? 0 : confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 70)
      ? ["Some pages include recognizable trust and authority signals."]
      : [],
    weaknesses:
      !allCapturesUnreliable && scores.some((score) => score < 55) && anyReliableCaptureWithLowTrust
        ? ["Proof, credibility, or authority is not sufficiently visible."]
        : [],
    evidence,
    recommendations
  });
}
