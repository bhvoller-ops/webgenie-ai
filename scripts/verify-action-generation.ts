/**
 * Regression test for lib/prospect/action-generation.ts — P1's deterministic
 * per-prospect action rule (master prompt section 10). Covers test matrix
 * section 48 items 1-14.
 *
 * Run with: npx tsx scripts/verify-action-generation.ts
 */
import { computeProspectAction, type ProspectActionInput } from "../src/lib/prospect/action-generation";

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

function input(overrides: Partial<Omit<ProspectActionInput, "prospect">> & { prospect?: Partial<ProspectActionInput["prospect"]> } = {}): ProspectActionInput {
  const { prospect, ...rest } = overrides;
  return {
    prospect: { hasWebsite: false, demoUrl: undefined, status: "new", projectId: undefined, ...prospect },
    hasCompletedAudit: false,
    opportunityLevel: "medium",
    hasPublicProfile: false,
    isSparseData: false,
    callLog: null,
    ...rest
  };
}

console.log("1. new prospect, no website, sparse data -> IMPORT_GMB_DATA");
{
  const r = computeProspectAction(input({ isSparseData: true }));
  check("recommends import", r?.actionType === "IMPORT_GMB_DATA");
}

console.log("2. sparse prospect already has a public profile -> does not loop back to import");
{
  const r = computeProspectAction(input({ isSparseData: true, hasPublicProfile: true }));
  check("moves on to build demo instead", r?.actionType === "BUILD_NEW_SITE_DEMO");
}

console.log("3. website present, no audit -> RUN_AUDIT");
{
  const r = computeProspectAction(input({ prospect: { hasWebsite: true } }));
  check("recommends audit", r?.actionType === "RUN_AUDIT");
}

console.log("4. no website, credible signals, no demo yet -> BUILD_NEW_SITE_DEMO");
{
  const r = computeProspectAction(input({}));
  check("recommends build", r?.actionType === "BUILD_NEW_SITE_DEMO");
}

console.log("5. completed audit updates the next action (from RUN_AUDIT to something else)");
{
  const before = computeProspectAction(input({ prospect: { hasWebsite: true } }));
  const after = computeProspectAction(input({ prospect: { hasWebsite: true, projectId: "p1" }, hasCompletedAudit: true, opportunityLevel: "high" }));
  check("before: RUN_AUDIT", before?.actionType === "RUN_AUDIT");
  check("after: no longer RUN_AUDIT", after?.actionType !== "RUN_AUDIT");
}

console.log("6. redesign-eligible audit -> CREATE_REDESIGN_DEMO");
{
  const r = computeProspectAction(input({ prospect: { hasWebsite: true, projectId: "p1" }, hasCompletedAudit: true, opportunityLevel: "high" }));
  check("recommends redesign demo", r?.actionType === "CREATE_REDESIGN_DEMO");
}

console.log("7. generated demo (no website) -> SEND_DEMO / CONTACT (SEND_DEMO for the no-website motion)");
{
  const r = computeProspectAction(input({ prospect: { demoUrl: "/api/demo-site?b=x" } }));
  check("recommends sending the demo", r?.actionType === "SEND_DEMO");
}

console.log("8. used pitch / contact outcome -> reflected via call_log snapshot (not_interested -> DEPRIORITIZE)");
{
  const r = computeProspectAction(input({ callLog: { status: "not_interested", followUpDueAt: null } }));
  check("deprioritized after decline", r?.actionType === "DEPRIORITIZE");
}

console.log("9. follow-up outcome -> scheduled action reflected");
{
  const dueAt = new Date(Date.now() + 3 * 86400000).toISOString();
  const r = computeProspectAction(input({ callLog: { status: "agreed_to_see_site", followUpDueAt: dueAt } }));
  check("recommends FOLLOW_UP", r?.actionType === "FOLLOW_UP");
  check("dueAt matches the scheduled date", r?.dueAt === dueAt);
}

console.log("10. due follow-up (overdue) is flagged high priority");
{
  const dueAt = new Date(Date.now() - 86400000).toISOString();
  const r = computeProspectAction(input({ callLog: { status: "agreed_to_see_site", followUpDueAt: dueAt } }));
  check("high priority when overdue", r?.priority === "high");
}

console.log("11/13/14. won/lost/deprioritized prospects have no active action");
{
  check("won -> null (no prospecting actions)", computeProspectAction(input({ prospect: { status: "won" } })) === null);
  check("lost -> null", computeProspectAction(input({ prospect: { status: "lost" } })) === null);
  check("deprioritized -> null", computeProspectAction(input({ prospect: { status: "deprioritized" } })) === null);
  check("meeting scheduled -> null (nothing to prospect until the meeting happens)", computeProspectAction(input({ prospect: { status: "meeting" } })) === null);
}

console.log("positive reply -> REVIEW_REPLY, never auto-advanced past");
{
  const r1 = computeProspectAction(input({ callLog: { status: "interested", followUpDueAt: null } }));
  const r2 = computeProspectAction(input({ callLog: { status: "replied", followUpDueAt: null } }));
  check("interested -> REVIEW_REPLY", r1?.actionType === "REVIEW_REPLY");
  check("replied -> REVIEW_REPLY", r2?.actionType === "REVIEW_REPLY");
}

console.log("no contradictory simultaneous actions -- exactly one result, never an array or multiple flags");
{
  const r = computeProspectAction(input({ prospect: { hasWebsite: true, projectId: "p1" }, hasCompletedAudit: true, opportunityLevel: "high" }));
  check("result is a single object with exactly one actionType", typeof r?.actionType === "string");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
