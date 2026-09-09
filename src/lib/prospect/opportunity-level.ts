import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import type { OpportunityLevel, Prospect, RecommendedOffer } from "@/lib/prospect/types";

/**
 * Deterministic opportunity scoring and offer eligibility — no AI involved
 * anywhere in this file. "Prefer deterministic eligibility/ranking before AI
 * explanation" (P0 brief). WebGenie has exactly two real offer categories
 * (see PRODUCT.md) — this never recommends anything else.
 *
 * A prospect with no website is always a Motion A candidate: there's
 * nothing to audit, so opportunity level here measures how compelling the
 * pitch will be (an established business with real reviews is an easier
 * "I built you a site" conversation than a brand-new, unproven one), not
 * whether to pursue it at all.
 *
 * A prospect with a website is a Motion B candidate, but only once a real
 * audit exists — before that there is no evidence to rank on, and this
 * says so explicitly rather than guessing.
 */
export function computeOpportunityLevel(
  prospect: Pick<Prospect, "hasWebsite" | "reviewCount">,
  intelligence: WebsiteIntelligenceOutput | null
): OpportunityLevel {
  if (!prospect.hasWebsite) {
    const reviews = prospect.reviewCount ?? 0;
    if (reviews >= 50) return "high";
    if (reviews >= 5) return "medium";
    return "low";
  }

  if (!intelligence) return "insufficient_evidence";

  const score = intelligence.overallScore;
  if (score < 45) return "high";
  if (score < 65) return "medium";
  return "low";
}

export function computeRecommendedOffer(
  prospect: Pick<Prospect, "hasWebsite">,
  intelligence: WebsiteIntelligenceOutput | null
): { offer: RecommendedOffer; reason: string | null } {
  if (!prospect.hasWebsite) {
    return {
      offer: "website_package",
      reason: "No website exists today — a built, working site is the whole pitch."
    };
  }
  if (!intelligence) {
    return { offer: null, reason: "No audit has been run yet — nothing to base an offer on." };
  }
  return {
    offer: "audit_led_rebuild",
    reason: `Real site exists, scored ${intelligence.overallScore}/100 by the audit — the free audit is the foot in the door for a paid rebuild.`
  };
}
