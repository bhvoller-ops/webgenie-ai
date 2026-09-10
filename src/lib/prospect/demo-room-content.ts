import type { DemoRoomFinding, OpportunityBrief, Prospect } from "@/lib/prospect/types";

/**
 * P1 Demo Room — client-safe content only (master prompt sections 30-33).
 * Every finding here traces to real, already-generated evidence
 * (opportunity_briefs.topFindings for an audited prospect, or
 * reasonsToContact for a no-website one) — never raw audit JSON, never
 * the internal opportunity score/confidence/sales angle/suggested
 * opener/NBA reasoning, and never a transformation of preliminary
 * speculation into a client-facing claim.
 */

const MAX_FINDINGS = 3;
const MAX_IMPROVEMENTS = 3;

/** Maximum 3 meaningful, evidence-backed findings for "Digital Opportunity Review." */
export function buildClientSafeFindings(prospect: Pick<Prospect, "hasWebsite">, brief: OpportunityBrief | null, hasCompletedAudit: boolean): DemoRoomFinding[] {
  if (!brief) return [];
  const source = hasCompletedAudit && prospect.hasWebsite ? brief.topFindings : brief.reasonsToContact;
  return source.slice(0, MAX_FINDINGS).map((detail) => ({ label: "What we found", detail }));
}

/** Maximum 3 prioritized, qualitative improvements — never a revenue promise (section 30.6/33). */
const QUALITATIVE_OUTCOMES = [
  "A clearer customer journey from first visit to contact",
  "A stronger first impression for anyone searching your business",
  "An easier way for visitors to reach out or request a quote",
  "A better experience for visitors on their phone"
];

export function buildWhatWedImprove(hasWebsite: boolean): string[] {
  return hasWebsite ? QUALITATIVE_OUTCOMES.slice(0, MAX_IMPROVEMENTS) : QUALITATIVE_OUTCOMES.slice(0, MAX_IMPROVEMENTS - 1).concat("A real, working website where you currently have none");
}

/** The one-line, non-technical intro (section 30.2) — deliberately avoids the word "audit." */
export function buildIntroLine(businessName: string): string {
  return `We put together a few ideas for ${businessName}.`;
}
