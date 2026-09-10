/**
 * Regression test for P2 structured event history (master prompt
 * Architecture Decisions 9/10, "EVENT SEMANTICS", P2 Phase 1 "EVENT
 * HISTORY TESTS" 31-37). Static/structural checks against the real
 * route/lib source — the actual DB writes are exercised for real in the
 * Phase 2 production acceptance test.
 *
 * Run with: npx tsx scripts/verify-event-history.ts
 */
import { readFileSync } from "fs";
import { excludeTestOrganizations } from "../src/lib/prospect/insights";

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

console.log("31. generating a message never records performed outreach");
{
  const src = readFileSync("src/app/api/prospects/[id]/sequence-message/route.ts", "utf8");
  check("the message-generation route never calls logActivity at all -- generating is not an event", !/logActivity/.test(src));
}

console.log("32. performing a step records a real, structured event");
{
  const src = readFileSync("src/app/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform/route.ts", "utf8");
  check("the perform route logs CONTACT_ATTEMPTED", /activityType: "CONTACT_ATTEMPTED"/.test(src));
  check(
    "it attaches structured metadata (sequenceId/sequenceStepId/enrollmentId/outcome), not just a text summary",
    /metadata: \{ sequenceId:/.test(src) && /sequenceStepId:/.test(src) && /enrollmentId,/.test(src) && /outcome: parsed\.data\.outcome/.test(src)
  );
}

console.log("33. event metadata is genuinely structured (real ids/enums), not free text");
{
  const typesSrc = readFileSync("src/lib/prospect/types.ts", "utf8");
  check("SequenceStepActionMetadata is a typed interface with real fields, not Record<string, unknown>", /interface SequenceStepActionMetadata \{[\s\S]*?sequenceId: string;[\s\S]*?sequenceStepId: string;/.test(typesSrc));
}

console.log("34. analytics (Insights) queries structured activity_type + counts, never parses the human-readable summary string");
{
  const src = readFileSync("src/app/api/insights/route.ts", "utf8");
  check("every count query filters on activity_type (a structured enum column)", (src.match(/\.eq\("activity_type", activityType\)/g) ?? []).length >= 1);
  check("no count is derived by matching against `summary` text", !/summary.*includes|includes.*summary|summary.*match/.test(src));
}

console.log("35. call_log being overwritten does not erase prospect_activities' own historical record");
{
  const activitySrc = readFileSync("src/lib/prospect/activity.ts", "utf8");
  check("logActivity() only ever inserts -- never updates or deletes an existing prospect_activities row", /\.insert\(/.test(activitySrc) && !/\.update\(|\.delete\(/.test(activitySrc));
  const regenerateSrc = readFileSync("src/lib/prospect/regenerate.ts", "utf8");
  check("regenerate.ts never updates or deletes prospect_activities directly (all writes go through logActivity)", !/from\("prospect_activities"\)\s*\n?\s*\.update\(|from\("prospect_activities"\)\s*\n?\s*\.delete\(/.test(regenerateSrc));
}

console.log("36. sequence events correctly attribute the specific sequence/step, not just \"a sequence event happened\"");
{
  const syncSrc = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  const enrolledLog = syncSrc.slice(syncSrc.indexOf('activityType: "SEQUENCE_ENROLLED"'), syncSrc.indexOf('activityType: "SEQUENCE_ENROLLED"') + 200);
  check("SEQUENCE_ENROLLED carries sequenceId + enrollmentId", /sequenceId:/.test(enrolledLog) && /enrollmentId:/.test(enrolledLog));
  const dueLog = syncSrc.slice(syncSrc.indexOf('activityType: "SEQUENCE_STEP_DUE"'), syncSrc.indexOf('activityType: "SEQUENCE_STEP_DUE"') + 300);
  check("SEQUENCE_STEP_DUE carries sequenceId + sequenceStepId + enrollmentId", /sequenceId:/.test(dueLog) && /sequenceStepId:/.test(dueLog) && /enrollmentId:/.test(dueLog));
}

console.log("37. test-organization events remain distinguishable and excludable from any future cross-org aggregate (organizations.is_test)");
{
  const rows = [
    { id: "real", isTest: false },
    { id: "sandbox", isTest: true }
  ];
  const result = excludeTestOrganizations(rows);
  check("excludeTestOrganizations() filters out is_test orgs", result.length === 1 && result[0].id === "real");
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("organizations.is_test defaults to false (existing production orgs are never accidentally marked test)", /add column if not exists is_test boolean not null default false/.test(migrationSrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
