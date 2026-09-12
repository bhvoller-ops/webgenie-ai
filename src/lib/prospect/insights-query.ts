import type { SupabaseClient } from "@supabase/supabase-js";
import { buildInsightsSummary, ZERO_INSIGHTS_COUNTS, type InsightsCounts, type InsightsSummary } from "@/lib/prospect/insights";

/**
 * Every count below is a real query against a structured event or current
 * state -- never a parsed activity summary string (master prompt
 * Architecture Decision 10: "Analytics must NOT depend on parsing
 * human-readable activity strings"). DEMO_ROOM_SHARED (not demo_rooms row
 * existence) is what's counted for "Demo Rooms shared," since creating one
 * is not engagement (test #58).
 */
async function countActivity(supabase: SupabaseClient, organizationId: string, activityType: string): Promise<number> {
  const { count } = await supabase
    .from("prospect_activities")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("activity_type", activityType);
  return count ?? 0;
}

/**
 * Owner-review correction: CONTACT_ATTEMPTED also covers the Playbook's
 * new contact-quality events (wrong contact / invalid number / disputed
 * info -- see lib/prospect/contact-quality.ts). Those are real attempts
 * ("outreachPerformed" would otherwise be literally true), but they are
 * NOT a successful outreach performance in the sense this metric means
 * to measure, and the explicit requirement is that they be excluded from
 * outreach-success/engagement metrics. Rather than a fragile jsonb path
 * filter at the SQL layer (NULL-vs-missing-key semantics are easy to get
 * subtly wrong there), this fetches the real rows and excludes exactly
 * the ones flagged `metadata.kind === "contact_quality_issue"` in plain,
 * unambiguous application code -- no migration, no new column.
 */
async function countGenuineOutreachAttempts(supabase: SupabaseClient, organizationId: string): Promise<number> {
  const { data } = await supabase.from("prospect_activities").select("metadata").eq("organization_id", organizationId).eq("activity_type", "CONTACT_ATTEMPTED");
  if (!data) return 0;
  return data.filter((row) => (row.metadata as Record<string, unknown> | null)?.kind !== "contact_quality_issue").length;
}

/**
 * The one function /api/insights calls (MANDATORY FIX 1). Extracted out of
 * the route handler specifically so it's callable directly -- with a
 * service-role client, no HTTP/session context needed -- from a real
 * database test proving the exclusion at the query layer, not just
 * something that happens to look right through the UI.
 *
 * A test organization's real counts are never computed here at all -- the
 * `is_test` check is the FIRST thing this function does, before a single
 * count query runs, and it returns the shared ZERO_INSIGHTS_COUNTS
 * constant rather than a per-field zero recomputed locally. That means no
 * future caller of this exact function -- a CSV export, a benchmark, a
 * cross-org aggregate not yet written -- can receive real-looking numbers
 * for sandbox activity by skipping a presentation-layer check the way the
 * previous version of this route did (it computed real counts always and
 * only flagged `isTestOrganization` for the UI to act on).
 */
export async function computeInsightsSummary(supabase: SupabaseClient, organizationId: string): Promise<InsightsSummary> {
  const { data: org } = await supabase.from("organizations").select("is_test").eq("id", organizationId).maybeSingle();
  const isTestOrganization = Boolean(org?.is_test);

  if (isTestOrganization) {
    return buildInsightsSummary(ZERO_INSIGHTS_COUNTS, true);
  }

  const { count: prospectsFound } = await supabase.from("prospects").select("id", { count: "exact", head: true }).eq("organization_id", organizationId);

  const [prospectsReviewed, auditsCompleted, demosCreated, demoRoomsShared, outreachPerformed, followUpsScheduled, meetingsLogged, won, lost] = await Promise.all([
    countActivity(supabase, organizationId, "PROSPECT_OPENED"),
    countActivity(supabase, organizationId, "AUDIT_COMPLETED"),
    countActivity(supabase, organizationId, "DEMO_GENERATED"),
    countActivity(supabase, organizationId, "DEMO_ROOM_SHARED"),
    countGenuineOutreachAttempts(supabase, organizationId),
    countActivity(supabase, organizationId, "FOLLOW_UP_SCHEDULED"),
    countActivity(supabase, organizationId, "MEETING_LOGGED"),
    countActivity(supabase, organizationId, "PROSPECT_WON"),
    countActivity(supabase, organizationId, "PROSPECT_LOST")
  ]);

  const counts: InsightsCounts = {
    prospectsFound: prospectsFound ?? 0,
    prospectsReviewed,
    auditsCompleted,
    demosCreated,
    demoRoomsShared,
    outreachPerformed,
    followUpsScheduled,
    meetingsLogged,
    won,
    lost
  };

  return buildInsightsSummary(counts, false);
}
