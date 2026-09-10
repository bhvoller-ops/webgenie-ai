/**
 * P2 Trustworthy Insights Foundation (master prompt Architecture Decision
 * 13). Every metric here is a real count of a real, already-logged
 * structured event or a real current state -- never a text-parsed
 * inference, never a fabricated aggregate. Deliberately does not include
 * anything from "METRICS TO DEFER" (delivery/bounce/open/click rate,
 * automatic reply rate, channel/sequence superiority, predictive win
 * probability) -- none of that data exists trustworthily yet (see the P2
 * Architecture Gate Report's 2.6/2.15 findings).
 */

export interface InsightsCounts {
  prospectsFound: number;
  prospectsReviewed: number;
  auditsCompleted: number;
  demosCreated: number;
  demoRoomsShared: number;
  outreachPerformed: number;
  followUpsScheduled: number;
  meetingsLogged: number;
  won: number;
  lost: number;
}

export interface InsightsSummary extends InsightsCounts {
  isTestOrganization: boolean;
  /** Comparative/predictive claims deliberately withheld and why -- never silently omitted, always named (master prompt: "If insufficient data exists: say so"). */
  deferredInsights: string[];
}

/** The minimum count below which a comparative claim ("channel X performs better") would be presented with false confidence. No comparative claim is currently implemented in P2 at all (deliberately deferred), but this threshold is the one any future comparative feature must use. */
export const MIN_SAMPLE_SIZE_FOR_COMPARISON = 5;

export function hasSufficientSampleSize(n: number, threshold: number = MIN_SAMPLE_SIZE_FOR_COMPARISON): boolean {
  return n >= threshold;
}

/**
 * The one mechanism any FUTURE cross-organization aggregate query must
 * route through (master prompt Architecture Decision 5 / test-data
 * exclusion). P2 itself has no cross-org feature -- /insights is strictly
 * scoped to the caller's own organization_id -- so nothing in this PR
 * calls this yet; it exists so that guarantee is enforced in one place
 * the moment a cross-org feature is ever built, rather than each future
 * query remembering to filter is_test itself.
 */
export function excludeTestOrganizations<T extends { isTest: boolean }>(orgs: T[]): T[] {
  return orgs.filter((o) => !o.isTest);
}

export function buildInsightsSummary(counts: InsightsCounts, isTestOrganization: boolean): InsightsSummary {
  const deferredInsights = [
    "Channel/sequence performance comparisons — not enough non-test data yet to be reliable.",
    "Reply rate — replies are currently user-declared, not provider-confirmed, so a rate would overstate confidence.",
    "Predictive win probability — no trustworthy delivery/reply signal exists yet to base a prediction on."
  ];
  return { ...counts, isTestOrganization, deferredInsights };
}
