import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { buildInsightsSummary, type InsightsCounts } from "@/lib/prospect/insights";

/**
 * Every count below is a real query against a structured event or current
 * state -- never a parsed activity summary string (master prompt
 * Architecture Decision 10: "Analytics must NOT depend on parsing
 * human-readable activity strings"). DEMO_ROOM_SHARED (not demo_rooms row
 * existence) is what's counted for "Demo Rooms shared," since creating one
 * is not engagement (test #58).
 */
async function countActivity(supabase: Awaited<ReturnType<typeof requireAdminApi>>["ctx"]["supabase"], organizationId: string, activityType: string): Promise<number> {
  const { count } = await supabase
    .from("prospect_activities")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("activity_type", activityType);
  return count ?? 0;
}

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: org } = await supabase.from("organizations").select("is_test").eq("id", organizationId).maybeSingle();

  const { count: prospectsFound } = await supabase.from("prospects").select("id", { count: "exact", head: true }).eq("organization_id", organizationId);

  const [prospectsReviewed, auditsCompleted, demosCreated, demoRoomsShared, outreachPerformed, followUpsScheduled, meetingsLogged, won, lost] = await Promise.all([
    countActivity(supabase, organizationId, "PROSPECT_OPENED"),
    countActivity(supabase, organizationId, "AUDIT_COMPLETED"),
    countActivity(supabase, organizationId, "DEMO_GENERATED"),
    countActivity(supabase, organizationId, "DEMO_ROOM_SHARED"),
    countActivity(supabase, organizationId, "CONTACT_ATTEMPTED"),
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

  return NextResponse.json(buildInsightsSummary(counts, Boolean(org?.is_test)));
}
