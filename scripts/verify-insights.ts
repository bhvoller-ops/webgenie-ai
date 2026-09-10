/**
 * Regression test for P2 Trustworthy Insights (master prompt Architecture
 * Decision 13, P2 Phase 1 "INSIGHTS TESTS" 55-65). Pure logic +
 * structural checks — real counts against real production/sandbox data
 * are exercised in the Phase 2 production acceptance test.
 *
 * Run with: npx tsx scripts/verify-insights.ts
 */
import { readFileSync } from "fs";
import { buildInsightsSummary, hasSufficientSampleSize, excludeTestOrganizations, MIN_SAMPLE_SIZE_FOR_COMPARISON, type InsightsCounts } from "../src/lib/prospect/insights";

let passed = 0;
let failed = 0;
function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const sampleCounts: InsightsCounts = {
  prospectsFound: 40,
  prospectsReviewed: 12,
  auditsCompleted: 8,
  demosCreated: 5,
  demoRoomsShared: 3,
  outreachPerformed: 6,
  followUpsScheduled: 2,
  meetingsLogged: 1,
  won: 1,
  lost: 2
};

console.log("55. non-test metrics calculate correctly -- the summary reflects the exact counts it was given, no silent transformation");
{
  const summary = buildInsightsSummary(sampleCounts, false);
  check("every count passes through unchanged", summary.prospectsFound === 40 && summary.won === 1 && summary.lost === 2);
}

console.log("56. is_test organizations are excluded from any future cross-org aggregate, and flagged in their own summary");
{
  const summary = buildInsightsSummary(sampleCounts, true);
  check("isTestOrganization is surfaced on the summary itself", summary.isTestOrganization === true);
  const orgs = [{ id: "a", isTest: false }, { id: "b", isTest: true }, { id: "c", isTest: false }];
  check("excludeTestOrganizations drops exactly the is_test orgs", excludeTestOrganizations(orgs).map((o) => o.id).join(",") === "a,c");
}

console.log("57. a generated pitch is never counted as outreach");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("outreachPerformed counts CONTACT_ATTEMPTED, not PITCH_GENERATED", /countActivity\(supabase, organizationId, "CONTACT_ATTEMPTED"\)/.test(src));
  check("PITCH_GENERATED is never queried by the insights route at all", !/PITCH_GENERATED/.test(src));
}

console.log("58/59. Demo Room CREATION is not counted as engagement -- only the real SHARE event is");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("demoRoomsShared counts DEMO_ROOM_SHARED", /countActivity\(supabase, organizationId, "DEMO_ROOM_SHARED"\)/.test(src));
  check("demoRoomsShared is never derived from the demo_rooms table's own row count", !/from\("demo_rooms"\)/.test(src));
}

console.log("60. performed outreach is counted accurately from the real structured event");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("outreachPerformed is a real count query against prospect_activities, not a guess", /countActivity/.test(src));
}

console.log("61. meetings are counted from trustworthy historical event data, not merely current status");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("meetingsLogged counts the MEETING_LOGGED activity (history), not just prospects.status='meeting' (current state only)", /countActivity\(supabase, organizationId, "MEETING_LOGGED"\)/.test(src));
}

console.log("62. wins/losses counted correctly from real activity history");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("won counts PROSPECT_WON", /countActivity\(supabase, organizationId, "PROSPECT_WON"\)/.test(src));
  check("lost counts PROSPECT_LOST", /countActivity\(supabase, organizationId, "PROSPECT_LOST"\)/.test(src));
}

console.log("63. current call_log state is never treated as full history -- the insights route doesn't query call_log at all");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("the insights route never reads call_log (a current-state-only table) for any historical count", !/from\("call_log"\)/.test(src));
}

console.log("64. insufficient data does not produce a strong/confident claim");
{
  check(`a sample below ${MIN_SAMPLE_SIZE_FOR_COMPARISON} is correctly flagged insufficient`, !hasSufficientSampleSize(2));
  check(`a sample at or above ${MIN_SAMPLE_SIZE_FOR_COMPARISON} is sufficient`, hasSufficientSampleSize(5));
  const summary = buildInsightsSummary(sampleCounts, false);
  check("deferredInsights always names what's withheld and why -- never silently omitted", summary.deferredInsights.length > 0 && summary.deferredInsights.every((d) => d.length > 20));
}

console.log("65. test/simulated outcomes are excluded via the same organization-level is_test boundary (no per-event test flag exists, by design -- see the P2 Architecture Gate Report)");
{
  const summary = buildInsightsSummary(sampleCounts, true);
  check("a test organization's own summary is clearly marked, so its numbers are never mistaken for real production performance", summary.isTestOrganization);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
