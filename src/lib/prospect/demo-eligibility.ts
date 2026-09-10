import type { OpportunityLevel, Prospect } from "@/lib/prospect/types";
import type { PublicBusinessProfile } from "@/lib/prospect/finder";

/**
 * Whether "Create Redesign Demo" should be offered for a prospect that
 * already has a website — P0.5 pre-merge readiness review, section 3
 * (item B). Pure and testable so the client component's button
 * visibility can't silently drift from the actual rule.
 *
 * The server route (/api/prospects/[id]/actions) enforces the
 * authoritative version of this same rule with a live DB read (a
 * completed analysis_jobs row + the current opportunity_briefs.level) —
 * this predicate mirrors it using the same already-fetched signals the
 * prospect page has on hand (hasIntelligence, opportunityLevel), so the
 * button is never shown for a request that would then be rejected.
 *
 * Deliberately does NOT introduce a new, differentiated redesign-content
 * pipeline — both demo modes reuse the exact same site generator
 * (lib/sitegen, untouched). This only decides whether the *existing*
 * generator is reachable in the redesign context, gated on real evidence
 * (a completed audit whose opportunity level isn't "low"/"insufficient_
 * evidence") rather than merely "the business has a website."
 */
export function canCreateRedesignDemo(
  prospect: Pick<Prospect, "hasWebsite" | "projectId">,
  hasIntelligence: boolean,
  opportunityLevel?: OpportunityLevel
): boolean {
  return Boolean(
    prospect.hasWebsite &&
      prospect.projectId &&
      hasIntelligence &&
      opportunityLevel &&
      opportunityLevel !== "low" &&
      opportunityLevel !== "insufficient_evidence"
  );
}

/**
 * Section 3 item C: "imported GMB/public data can optionally feed either
 * demo." Fills in phone/rating/reviewCount from a real, explicitly-
 * imported Place Details fetch only where the prospect's own value is
 * genuinely missing — the prospect's own address/city/state stay
 * authoritative always (never overwritten by a possibly-stale cached
 * profile), and nothing here is fabricated: every field either comes
 * from the prospect's own real data or a real prior Places fetch.
 */
export function fieldsForDemoBusiness(
  prospect: Pick<Prospect, "phone" | "rating" | "reviewCount">,
  publicProfile: PublicBusinessProfile | null
): { phone: string; rating: number | undefined; reviewCount: number | undefined } {
  return {
    phone: prospect.phone || publicProfile?.phone || "",
    rating: prospect.rating ?? publicProfile?.rating,
    reviewCount: prospect.reviewCount ?? publicProfile?.reviewCount
  };
}
