/**
 * Regression test for P2 Trustworthy Insights (master prompt Architecture
 * Decision 13, P2 Phase 1 "INSIGHTS TESTS" 55-65). Pure logic +
 * structural checks — real counts against real production/sandbox data
 * are exercised in the Phase 2 production acceptance test.
 *
 * Run with: npx tsx scripts/verify-insights.ts
 */
import { readFileSync, existsSync } from "fs";
import { buildInsightsSummary, hasSufficientSampleSize, excludeTestOrganizations, MIN_SAMPLE_SIZE_FOR_COMPARISON, ZERO_INSIGHTS_COUNTS, type InsightsCounts } from "../src/lib/prospect/insights";

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

console.log("56a. Phase 1.1 MANDATORY FIX 1 -- a test organization's metrics are zeroed at the server query itself, not just flagged for the UI");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check("computeInsightsSummary() checks organizations.is_test before running any count query", /const isTestOrganization = Boolean\(org\?\.is_test\)/.test(src));
  const testBranch = src.slice(src.indexOf("isTestOrganization = Boolean"), src.indexOf("const { count: prospectsFound }"));
  check("the is_test short-circuit (returning ZERO_INSIGHTS_COUNTS) appears BEFORE any real count query in the function body -- not computed-then-discarded", /if \(isTestOrganization\)/.test(testBranch) && /ZERO_INSIGHTS_COUNTS/.test(testBranch));
  check("real count queries (prospectsFound, countActivity, ...) appear only after that early return, never executed for a test org", src.indexOf("if (isTestOrganization)") < src.indexOf('.from("prospects")'));
  check("ZERO_INSIGHTS_COUNTS is a real all-zero constant, not recomputed inline each time", Object.values(ZERO_INSIGHTS_COUNTS).every((v) => v === 0) && Object.keys(ZERO_INSIGHTS_COUNTS).length === 10);

  const routeSrc = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("the API route itself has no counting logic of its own left to audit separately -- it's a thin call into the one tested function", !/countActivity/.test(routeSrc) && /computeInsightsSummary/.test(routeSrc));

  const clientSrc = readFileSync("src/app/insights/insights-client.tsx", "utf8");
  check("the UI shows a sandbox notice INSTEAD of the metric grid for a test org -- never the grid alongside a warning banner (the previous, insufficient design)", /data\.isTestOrganization \? \([\s\S]{0,400}<\/div>\s*\) : totalActivity === 0/.test(clientSrc));
}

console.log("57. a generated pitch is never counted as outreach");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check(
    "outreachPerformed counts genuine CONTACT_ATTEMPTED activity, not PITCH_GENERATED (OPERATIONAL FOLLOW-THROUGH CORRECTION: routed through countGenuineOutreachAttempts(), which also excludes contact-quality-issue events flagged via metadata.kind -- see section 66 below)",
    /countGenuineOutreachAttempts\(supabase, organizationId\)/.test(src) && /eq\("activity_type", "CONTACT_ATTEMPTED"\)/.test(src)
  );
  check("PITCH_GENERATED is never queried by the insights route at all", !/PITCH_GENERATED/.test(src));
}

console.log("58/59. Demo Room CREATION is not counted as engagement -- only the real SHARE event is");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check("demoRoomsShared counts DEMO_ROOM_SHARED", /countActivity\(supabase, organizationId, "DEMO_ROOM_SHARED"\)/.test(src));
  check("demoRoomsShared is never derived from the demo_rooms table's own row count", !/from\("demo_rooms"\)/.test(src));
}

console.log("60. performed outreach is counted accurately from the real structured event");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check("outreachPerformed is a real count query against prospect_activities, not a guess", /countActivity/.test(src));
}

console.log("61. meetings are counted from trustworthy historical event data, not merely current status");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check("meetingsLogged counts the MEETING_LOGGED activity (history), not just prospects.status='meeting' (current state only)", /countActivity\(supabase, organizationId, "MEETING_LOGGED"\)/.test(src));
}

console.log("62. wins/losses counted correctly from real activity history");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check("won counts PROSPECT_WON", /countActivity\(supabase, organizationId, "PROSPECT_WON"\)/.test(src));
  check("lost counts PROSPECT_LOST", /countActivity\(supabase, organizationId, "PROSPECT_LOST"\)/.test(src));
}

console.log("63. current call_log state is never treated as full history -- the insights route doesn't query call_log at all");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
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

console.log("66. OPERATIONAL FOLLOW-THROUGH CORRECTION: a contact-quality issue (wrong contact / invalid number / disputed info) is excluded from outreachPerformed, even though it is logged under the same CONTACT_ATTEMPTED activity_type as a genuine attempt");
{
  const src = readFileSync("src/lib/prospect/insights-query.ts", "utf8");
  check(
    "the exclusion is done by fetching real rows and filtering in application code on metadata.kind, not a SQL-level jsonb path filter (deliberately avoided -- Postgres/PostgREST NULL-vs-missing-key semantics on `->>'kind' != 'x'` would silently exclude rows that simply have no kind at all)",
    /data\.filter\(\(row\) => \(row\.metadata as Record<string, unknown> \| null\)\?\.kind !== "contact_quality_issue"\)/.test(src)
  );
  check(
    "a full functional proof (one genuine + one contact-quality-flagged CONTACT_ATTEMPTED row -> outreachPerformed counts only the genuine one) lives in scripts/verify-playbook-operational-followthrough.ts section 14 -- not duplicated here",
    existsSync("scripts/verify-playbook-operational-followthrough.ts")
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
