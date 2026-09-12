/**
 * WEBGENIE AUTHENTICATED UI/UX REBUILD -- evidence-display consistency
 * fix (Prospect Detail vs Daily Queue vs Playbook).
 *
 * The audit found a real inconsistency: a prospect with an approved,
 * human-verified outreach observation (migration 041's
 * prospect_evidence_observations, already read by
 * lib/prospect/manual-evidence.ts's getVerifiedManualObservations() for
 * the Playbook's own "Verified Observation" stage) could still have its
 * Prospect Detail page say "there isn't enough evidence yet to say what
 * the opportunity is" -- because hasWebsiteNoAuditBrief()
 * (lib/prospect/opportunity-brief.ts) only ever looks at whether a FULL
 * audit (WebsiteIntelligenceOutput) exists, with no knowledge of a
 * verified observation at all.
 *
 * This is a PRESENTATION-ONLY fix. It does not touch:
 *   - computeOpportunityLevel() / computeRecommendedOffer() (still driven
 *     only by hasWebsite + a real audit -- "insufficient_evidence" as an
 *     opportunity LEVEL is unchanged; a verified observation is real
 *     evidence for outreach readiness, not a substitute for a scored
 *     audit, and must never be treated as one)
 *   - the persisted opportunity_briefs.summary/confidence fields (never
 *     rewritten here, never regenerated as a side effect of viewing the
 *     page -- no production data is touched by a read)
 *   - any audit score (never fabricated; `audited` readiness is the only
 *     state that implies a real score exists at all)
 *
 * describeEvidenceReadiness() is the ONE function Prospect Detail, Daily
 * Queue, and the Playbook's own copy should all be able to trace back to
 * for readiness wording, so the three screens never again say
 * incompatible things about the same prospect.
 */
export type EvidenceReadiness = "no_website" | "audited" | "verified_observation" | "insufficient";

export function computeEvidenceReadiness(input: {
  hasWebsite: boolean;
  hasAudit: boolean;
  hasVerifiedObservation: boolean;
}): EvidenceReadiness {
  if (!input.hasWebsite) return "no_website";
  if (input.hasAudit) return "audited";
  if (input.hasVerifiedObservation) return "verified_observation";
  return "insufficient";
}

export const EVIDENCE_READINESS_LABEL: Record<EvidenceReadiness, string> = {
  no_website: "No website on file",
  audited: "Full audit available",
  verified_observation: "Verified observation available",
  insufficient: "Insufficient evidence"
};

/**
 * The exact truthful sentence for each state. `verified_observation` is
 * the fix: it explicitly says a full audit is still outstanding (never
 * implies one exists) while also refusing to say "nothing usable exists"
 * when a real, approved observation does.
 */
export const EVIDENCE_READINESS_DETAIL: Record<EvidenceReadiness, string> = {
  no_website: "No website exists today — nothing to audit, only something real to build and show.",
  audited: "A complete website audit has been run and scored.",
  verified_observation: "Verified outreach observation available. Full website audit not yet completed.",
  insufficient: "No audit has been run yet and no verified outreach observation exists yet — there isn't enough evidence yet to say what the opportunity is."
};

export const EVIDENCE_READINESS_TONE: Record<EvidenceReadiness, "good" | "warn" | "info" | "neutral"> = {
  no_website: "info",
  audited: "good",
  verified_observation: "warn",
  insufficient: "neutral"
};
