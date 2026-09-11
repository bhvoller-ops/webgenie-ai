import type { OpportunityBrief, Prospect, RecommendedOffer } from "@/lib/prospect/types";

/**
 * P1 Pitch Generator — the safe, structured context handed to the model
 * (master prompt sections 15/20). Built once, from real already-fetched
 * data (prospect + its current Opportunity Brief + org branding) — never
 * a second live query inside this file, and never raw records dumped
 * into a prompt unstructured. Every fact here traces to something the
 * app actually knows; `unknowns` and `prohibitedClaims` exist precisely
 * so the model has an explicit boundary instead of an implicit one.
 */

export interface PitchBusinessFacts {
  name: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  hasWebsite: boolean;
  rating: number | null;
  reviewCount: number | null;
}

export interface PitchContext {
  businessFacts: PitchBusinessFacts;
  /** brief.reasonsToContact + brief.evidenceReferences' own detail strings — real, sourced evidence only. */
  opportunityEvidence: string[];
  /** brief.topFindings — populated only when a real audit produced them (never guessed for a no-audit prospect). */
  auditFindings: string[];
  recommendedOffer: RecommendedOffer;
  recommendedOfferReason: string | null;
  demoAvailable: boolean;
  demoUrl: string | null;
  /** Things genuinely not known yet — mirrors the Opportunity Preview drawer's own "what we don't know yet" honesty pattern. */
  unknowns: string[];
  agencyName: string;
  /**
   * P2 addition (migration 037) — real, already-recorded interaction
   * summaries (prospect_activities.CONTACT_ATTEMPTED entries), never
   * fabricated. Empty for the original P1 ad-hoc Pitch Generator call
   * site, which never passes this. Exists so a sequence follow-up step
   * can honestly say "following up on my call" ONLY when a call was
   * actually recorded as performed — never because WebGenie merely
   * generated an earlier step's copy.
   */
  priorInteractions: string[];
}

/** Fixed, non-negotiable list (master prompt section 18) — rendered directly into the prompt as hard rules, never left to the model's judgment. */
export const PITCH_PROHIBITED_CLAIMS = [
  "Exact dollar amounts lost or revenue impact",
  "Customer counts, growth figures, or business performance claims",
  "Advertising spend or marketing budget",
  "Competitor performance or comparisons",
  "The owner's intent, feelings, or awareness of a problem",
  "Response times, missed calls, or call-handling claims",
  "\"I was reviewing your website\" unless a real WebGenie audit/capture occurred",
  "\"You're losing leads\" or similar loss claims unless real evidence supports it",
  "\"Your SEO is bad\" or similar unless real audit evidence supports it",
  "Any specific technical defect not present in real audit findings",
  "Urgency not grounded in a real fact (no fabricated scarcity or deadlines)",
  "Testimonials, results, or case studies that were not actually provided",
  "Referring to a previous email/call/message as having been sent unless it appears in PRIOR ACTUAL INTERACTIONS below — generating copy is not the same as sending or performing it",
  "Manipulative urgency or fabricated familiarity in a follow-up"
] as const;

function unknownsFor(hasWebsite: boolean, hasAudit: boolean): string[] {
  const unknowns: string[] = [];
  if (!hasWebsite) {
    unknowns.push("Whether a new site would convert this business into a paying client");
  } else if (!hasAudit) {
    unknowns.push("Website quality — no audit has been run yet");
    unknowns.push("Lead conversion capability");
  }
  unknowns.push("Owner intent to switch providers or make a change");
  return unknowns;
}

export function buildPitchContext(
  prospect: Prospect,
  brief: OpportunityBrief | null,
  hasCompletedAudit: boolean,
  agencyName: string,
  priorInteractions: string[] = [],
  /**
   * Hotfix (2026-09-11, docs/history.md): structured, human-verified
   * observations (prospect_evidence_observations, migration 041, not yet
   * applied) — the "manually verified observations need a structured,
   * auditable path into message generation" requirement. Caller is
   * responsible for filtering to VERIFIED_PRESENT/VERIFIED_ABSENT rows
   * only (see getVerifiedManualObservations below) — this function trusts
   * whatever strings it's handed, same as opportunityEvidence already
   * does for brief content.
   */
  manualObservations: string[] = []
): PitchContext {
  return {
    businessFacts: {
      name: prospect.businessName,
      industry: prospect.industry ?? null,
      city: prospect.city ?? null,
      state: prospect.state ?? null,
      phone: prospect.phone ?? null,
      website: prospect.websiteUrl ?? null,
      hasWebsite: prospect.hasWebsite,
      rating: prospect.rating ?? null,
      reviewCount: prospect.reviewCount ?? null
    },
    opportunityEvidence: [
      ...(brief ? [...brief.reasonsToContact, ...brief.evidenceReferences.map((e) => e.detail)] : []),
      ...manualObservations
    ],
    auditFindings: hasCompletedAudit ? brief?.topFindings ?? [] : [],
    recommendedOffer: brief?.recommendedOffer ?? null,
    recommendedOfferReason: brief?.recommendedOfferReason ?? null,
    demoAvailable: Boolean(prospect.demoUrl),
    demoUrl: prospect.demoUrl ?? null,
    unknowns: unknownsFor(prospect.hasWebsite, hasCompletedAudit),
    agencyName,
    priorInteractions
  };
}

/**
 * Renders the context into the explicit FACTS / AUDIT FINDINGS /
 * RECOMMENDATIONS / UNKNOWN sections the prompt needs (section 20) —
 * plain text, not a raw JSON dump, so the model reads it the way a
 * person would.
 */
export function renderPitchContextForPrompt(ctx: PitchContext): string {
  const lines: string[] = [];
  lines.push("FACTS (verified, real data — safe to reference directly):");
  lines.push(`- Business name: ${ctx.businessFacts.name}`);
  if (ctx.businessFacts.industry) lines.push(`- Industry: ${ctx.businessFacts.industry}`);
  if (ctx.businessFacts.city) lines.push(`- Location: ${ctx.businessFacts.city}${ctx.businessFacts.state ? `, ${ctx.businessFacts.state}` : ""}`);
  lines.push(`- Website: ${ctx.businessFacts.hasWebsite ? "has an existing website" : "no website currently listed"}`);
  if (ctx.businessFacts.rating !== null) lines.push(`- Google rating: ${ctx.businessFacts.rating} (${ctx.businessFacts.reviewCount ?? 0} reviews)`);
  lines.push(`- Demo: ${ctx.demoAvailable ? "a real demo/redesign site has been built and is ready to show" : "no demo has been built yet"}`);

  if (ctx.opportunityEvidence.length > 0) {
    lines.push("\nOPPORTUNITY EVIDENCE (real signals — you may reference these):");
    for (const e of ctx.opportunityEvidence) lines.push(`- ${e}`);
  }

  lines.push("\nAUDIT FINDINGS (only reference these as audit findings if this list is non-empty; if empty, no real audit has been run — never invent one):");
  if (ctx.auditFindings.length > 0) {
    for (const f of ctx.auditFindings) lines.push(`- ${f}`);
  } else {
    lines.push("- (none — no completed audit exists for this business)");
  }

  lines.push("\nRECOMMENDATIONS:");
  lines.push(`- Recommended offer: ${ctx.recommendedOffer ?? "not yet determined"}${ctx.recommendedOfferReason ? ` — ${ctx.recommendedOfferReason}` : ""}`);

  lines.push("\nPRIOR ACTUAL INTERACTIONS (only reference a previous contact — e.g. \"following up on my call\" — if it appears here; if this list is empty, no real contact has been recorded yet, so never imply one happened):");
  if (ctx.priorInteractions.length > 0) {
    for (const i of ctx.priorInteractions) lines.push(`- ${i}`);
  } else {
    lines.push("- (none — no contact with this prospect has been recorded as performed yet)");
  }

  lines.push("\nUNKNOWN (do not claim to know these; do not imply otherwise):");
  for (const u of ctx.unknowns) lines.push(`- ${u}`);

  lines.push("\nNEVER SAY OR IMPLY:");
  for (const p of PITCH_PROHIBITED_CLAIMS) lines.push(`- ${p}`);

  return lines.join("\n");
}
