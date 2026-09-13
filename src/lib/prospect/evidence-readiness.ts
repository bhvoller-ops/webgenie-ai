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

/**
 * OWNER-REVIEW CORRECTION (evidence contradiction, P0 blocker): the first
 * pass fixed the "Why this business" / opportunity-summary sentence, but
 * left the OVERALL READINESS BADGE (Prospect Detail's opportunity-level
 * pill, Daily Queue's opportunity-level pill) rendering
 * OPPORTUNITY_LEVEL_LABEL.insufficient_evidence ("Insufficient evidence")
 * unconditionally whenever `computeOpportunityLevel()` returns
 * "insufficient_evidence" -- which is EXACTLY the same condition
 * (hasWebsite && !hasAudit) that also makes `verified_observation`
 * readiness possible. The result: a prospect with a verified observation
 * showed "Insufficient evidence" AND "Verified observation available" as
 * two simultaneous, contradictory badges.
 *
 * getOverallReadinessBadge() is the ONE function every screen's "what's
 * the overall status" badge must go through: when a verified observation
 * exists for an otherwise-insufficient-evidence prospect, it replaces the
 * badge entirely with the verified_observation label/tone -- "Insufficient
 * evidence" is never shown at all in that case, on any of the three
 * screens. When there is genuinely no verified observation either, the
 * real "Insufficient evidence" badge is untouched -- fail-closed behavior
 * is fully preserved for that case (see verify-ui-clarity.ts's fail-closed
 * test).
 *
 * OPPORTUNITY_LEVEL_LABEL/_TONE are also the single canonical copy of
 * these strings now -- Prospect Detail and Daily Queue previously each
 * had their own slightly different local tone mapping (an inconsistency
 * this centralizes away, satisfying "compatible evidence wording").
 */
import type { OpportunityLevel } from "@/lib/prospect/types";

export const OPPORTUNITY_LEVEL_LABEL: Record<OpportunityLevel, string> = {
  high: "High opportunity",
  medium: "Medium opportunity",
  low: "Low opportunity",
  insufficient_evidence: "Insufficient evidence"
};

export const OPPORTUNITY_LEVEL_TONE: Record<OpportunityLevel, "good" | "warn" | "info" | "neutral"> = {
  high: "good",
  medium: "warn",
  low: "neutral",
  // Only ever shown now when there is NEITHER an audit NOR a verified
  // observation -- genuinely nothing yet, so a quiet neutral tone rather
  // than an alarming one.
  insufficient_evidence: "neutral"
};

export function getOverallReadinessBadge(
  opportunityLevel: OpportunityLevel,
  hasVerifiedObservation: boolean
): { label: string; tone: "good" | "warn" | "info" | "neutral" } {
  if (opportunityLevel === "insufficient_evidence" && hasVerifiedObservation) {
    return { label: EVIDENCE_READINESS_LABEL.verified_observation, tone: EVIDENCE_READINESS_TONE.verified_observation };
  }
  return { label: OPPORTUNITY_LEVEL_LABEL[opportunityLevel], tone: OPPORTUNITY_LEVEL_TONE[opportunityLevel] };
}

/**
 * The exact literal sentence hasWebsiteNoAuditBrief() always produces for
 * the opportunity-brief summary (lib/prospect/opportunity-brief.ts) --
 * shared here so Prospect Detail, the Daily Queue API, and the Playbook's
 * resolve-context.ts all detect and override the identical known string,
 * rather than three separate copies of the same suffix drifting apart.
 */
export const NO_AUDIT_SUMMARY_SUFFIX = "there isn't enough evidence yet to say what the opportunity is.";

/**
 * Read-time-only override of the persisted opportunity-brief summary.
 * Never called anywhere that writes to opportunity_briefs -- this only
 * changes what a given screen renders, never what's stored.
 */
export function describeBriefSummary(rawSummary: string | null | undefined, hasVerifiedObservation: boolean): string | null {
  if (!rawSummary) return rawSummary ?? null;
  if (hasVerifiedObservation && rawSummary.endsWith(NO_AUDIT_SUMMARY_SUFFIX)) {
    return EVIDENCE_READINESS_DETAIL.verified_observation;
  }
  return rawSummary;
}

/**
 * The exact literal suffix computeRecommendedOffer() produces when no
 * audit exists (lib/prospect/opportunity-level.ts): "No audit has been
 * run yet — nothing to base an offer on." OWNER-REVIEW CORRECTION: "nothing
 * to base an offer on" reads as if no usable evidence exists at all, which
 * is untrue once a verified observation exists -- the real fact is
 * narrower ("a full RECOMMENDED OFFER specifically needs a scored audit").
 * `recommendedOffer` itself (null/no offer assigned) is never changed --
 * only the human-facing reason sentence.
 */
export const NO_OFFER_SUFFIX = "nothing to base an offer on.";

export const RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE = "Full recommended offer unavailable until the website audit is completed.";

export function describeRecommendedOfferReason(rawReason: string | null | undefined, hasVerifiedObservation: boolean): string | null {
  if (!rawReason) return rawReason ?? null;
  if (hasVerifiedObservation && rawReason.endsWith(NO_OFFER_SUFFIX)) {
    return RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE;
  }
  return rawReason;
}

/**
 * Shown alongside the overall readiness badge only when BOTH a verified
 * observation exists AND at least one contact channel is genuinely
 * activatable (evaluateChannelActivation() returned activatable:true) --
 * never based on a loose "a channel is probably fine" hint. This is the
 * literal "Ready for verified-observation outreach when the channel is
 * permitted" language the owner-review requires.
 */
export const OUTREACH_READY_NOTE = "Ready for verified-observation outreach";
