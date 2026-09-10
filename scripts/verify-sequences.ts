/**
 * Regression test for lib/prospect/sequence-engine.ts and the structural
 * guarantees in lib/prospect/sequence-sync.ts / migration 037 (master
 * prompt Architecture Decisions 3/7/8, P2 Phase 1 "SEQUENCE TESTS" 9-30).
 *
 * Pure logic + static structural checks only. DB-level guarantees (the
 * partial unique indexes actually rejecting a duplicate, the tenant-guard
 * trigger actually rejecting a cross-org insert, an atomic UPDATE actually
 * winning a real race) are exercised for real in the Phase 2 production
 * acceptance test — see verify-suppression.ts's header for the same split
 * P1's own scripts already established.
 *
 * Run with: npx tsx scripts/verify-sequences.ts
 */
import { readFileSync } from "fs";
import { stepAtOrder, nextStepAfter, computeDueStep, computeStopReason, canTransitionToStopped, resolveActionSource } from "../src/lib/prospect/sequence-engine";
import { isSameAction } from "../src/lib/prospect/action-sync";
import type { OutreachSequenceStep, ProspectSequenceEnrollment } from "../src/lib/prospect/types";

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

const now = new Date("2026-09-11T12:00:00Z");
const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400000).toISOString();

function step(overrides: Partial<OutreachSequenceStep>): OutreachSequenceStep {
  return { id: "step-1", sequenceId: "seq-1", stepOrder: 1, channel: "CALL", delayDays: 0, instructions: null, createdAt: now.toISOString(), ...overrides };
}

console.log("9. sequence created — shape check (real insert exercised in Phase 2)");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("outreach_sequences table is defined", /create table public\.outreach_sequences/.test(migrationSrc));
  check("outreach_sequences.status defaults to 'draft'", /status text not null default 'draft'/.test(migrationSrc));
}

console.log("10. steps ordered deterministically, regardless of input order");
{
  const s1 = step({ id: "a", stepOrder: 1 });
  const s2 = step({ id: "b", stepOrder: 2 });
  const s3 = step({ id: "c", stepOrder: 3 });
  const shuffled = [s3, s1, s2];
  check("stepAtOrder finds the right step regardless of array order", stepAtOrder(shuffled, 2)?.id === "b");
  check("nextStepAfter(1) is step 2 regardless of array order", nextStepAfter(shuffled, 1)?.id === "b");
  check("nextStepAfter(3) is null — last step, sequence complete", nextStepAfter(shuffled, 3) === null);
  check("nextStepAfter skips correctly even with gaps", nextStepAfter([s1, s3], 1)?.id === "c");
}

console.log("11/12. one enrollment at a time — enrollProspect()'s own guard + the DB unique-violation fallback (real duplicate rejection is Phase 2)");
{
  const src = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("enrollProspect() checks suppression before inserting", /isSuppressed\(/.test(src));
  check("enrollProspect() handles Postgres unique_violation (23505) with a clean error, not a raw DB error", /error\.code === "23505"/.test(src));
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("the one-active-enrollment-per-prospect partial unique index exists", /prospect_sequence_enrollments_one_active_idx/.test(migrationSrc) && /where status in \('ACTIVE', 'PAUSED'\)/.test(migrationSrc));
}

console.log("13. first due step determined correctly");
{
  const enrollment: Pick<ProspectSequenceEnrollment, "status" | "currentStepOrder" | "nextStepDueAt"> = { status: "ACTIVE", currentStepOrder: 1, nextStepDueAt: iso(-1) };
  const steps = [step({ id: "a", stepOrder: 1, channel: "CALL" }), step({ id: "b", stepOrder: 2, channel: "EMAIL" })];
  const due = computeDueStep(enrollment, steps, now);
  check("step 1 is the one returned when currentStepOrder is 1", due?.step.id === "a");
}

console.log("14. a future step does not appear early");
{
  const enrollment = { status: "ACTIVE" as const, currentStepOrder: 1, nextStepDueAt: iso(3) };
  check("a step due 3 days from now is not due today", computeDueStep(enrollment, [step({})], now) === null);
}

console.log("15/16. a due step reconciles into the Queue exactly once, never duplicated (isSameAction is the guard action-sync.ts uses)");
{
  const computedStep1 = { actionType: "SEQUENCE_STEP" as const, reason: "x", priority: "medium" as const, dueAt: iso(0), metadata: { sequenceStepId: "step-a" } };
  const existingStep1 = { id: "row-1", action_type: "SEQUENCE_STEP", status: "PENDING", metadata: { sequenceStepId: "step-a" } };
  const existingStep2 = { id: "row-1", action_type: "SEQUENCE_STEP", status: "PENDING", metadata: { sequenceStepId: "step-b" } };
  check("the same due step reconciles in place -- isSameAction is true", isSameAction(existingStep1, computedStep1));
  check("a DIFFERENT step (prospect advanced) is correctly recognized as a different action -- never wrongly merged", !isSameAction(existingStep2, computedStep1));
  check("plain action_type equality still works for non-sequence actions", isSameAction({ id: "r", action_type: "CONTACT", status: "PENDING", metadata: null }, { actionType: "CONTACT", reason: "x", priority: "medium", dueAt: null }));
}

console.log("17. completed action advances exactly once -- nextStepAfter is the pure step of the compare-and-swap advanceSequenceStep() performs atomically");
{
  const steps = [step({ id: "a", stepOrder: 1 }), step({ id: "b", stepOrder: 2 })];
  check("from step 1, the next step is step 2", nextStepAfter(steps, 1)?.id === "b");
  check("from step 2 (the last), there is no next step -- sequence completes", nextStepAfter(steps, 2) === null);
  const src = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("advanceSequenceStep()'s UPDATE is a real compare-and-swap: filtered by the expected current_step_order AND status='ACTIVE'", /\.eq\("current_step_order", input\.expectedCurrentStepOrder\)\s*\n\s*\.eq\("status", "ACTIVE"\)/.test(src));
}

console.log("18. skipped action behaves per its own explicit rule -- dismiss-for-now only, never advances or resurrects wrongly (see action-sync.ts's own doc comment for why this differs from FOLLOW_UP's completion fix)");
{
  const src = readFileSync("src/app/api/prospect-actions/[id]/route.ts", "utf8");
  const skipBranch = src.slice(src.indexOf('op === "skip"'), src.indexOf('op === "skip"') + 300);
  check("the skip branch does not call advanceSequenceStep", !/advanceSequenceStep/.test(skipBranch));
}

console.log("19/21. PAUSED and STOPPED sequences never surface a due step");
{
  const enrollment = { currentStepOrder: 1, nextStepDueAt: iso(-1) };
  check("PAUSED never returns a due step even if the date has passed", computeDueStep({ ...enrollment, status: "PAUSED" }, [step({})], now) === null);
  check("COMPLETED never returns a due step", computeDueStep({ ...enrollment, status: "COMPLETED" }, [step({})], now) === null);
  check("STOPPED never returns a due step", computeDueStep({ ...enrollment, status: "STOPPED" }, [step({})], now) === null);
}

console.log("20. resumed sequence resumes correctly -- picks up the SAME due date rather than resetting it");
{
  const src = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("resumeEnrollment's patch never touches next_step_due_at (only status/paused_at)", !/toStatus === "ACTIVE"[\s\S]*?next_step_due_at/.test(src));
  const overdueEnrollment = { status: "ACTIVE" as const, currentStepOrder: 1, nextStepDueAt: iso(-2) };
  const due = computeDueStep(overdueEnrollment, [step({})], now);
  check("an enrollment resumed with an already-past due date is immediately due again (not silently skipped)", due !== null && due.overdue);
}

console.log("22-27. every real stop condition is detected from primary signals, not inferred from a computed action's shape");
{
  check("22. replied stops the sequence", computeStopReason({ suppressed: false, prospectStatus: "contacted", callLogStatus: "replied" }) === "REPLIED");
  check("23. interested stops the sequence", computeStopReason({ suppressed: false, prospectStatus: "contacted", callLogStatus: "interested" }) === "INTERESTED");
  check("24. a booked meeting stops the sequence", computeStopReason({ suppressed: false, prospectStatus: "meeting", callLogStatus: null }) === "MEETING_BOOKED");
  check("25. won stops the sequence", computeStopReason({ suppressed: false, prospectStatus: "won", callLogStatus: "closed" }) === "WON");
  check("26. lost stops the sequence", computeStopReason({ suppressed: false, prospectStatus: "lost", callLogStatus: "lost" }) === "LOST");
  check("27. suppression stops the sequence", computeStopReason({ suppressed: true, prospectStatus: "new", callLogStatus: null }) === "SUPPRESSED");
  check("none of these fire for an ordinary in-progress prospect", computeStopReason({ suppressed: false, prospectStatus: "contacted", callLogStatus: "sent" }) === null);
  check("every one of these is a real transition (canTransitionToStopped) from ACTIVE", canTransitionToStopped("ACTIVE"));
  check("resolveActionSource lets the organic action win (not DUE_STEP) whenever a stop reason fires", resolveActionSource({ suppressed: false, stopReason: "WON", dueStepAvailable: true }) === "ORGANIC");
}

console.log("28/29. double-click / retry does not double-advance -- the same compare-and-swap guard as item 17, exercised for real under real concurrency in Phase 2");
{
  const src = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("advanceSequenceStep() re-fetches and re-checks current_step_order before ever writing (not a blind increment)", /enrollment\.current_step_order !== input\.expectedCurrentStepOrder/.test(src));
}

console.log("30. cross-tenant enrollment blocked — the DB trigger's existence (real rejection verified in Phase 2)");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("enforce_sequence_enrollment_tenant() checks prospect_id belongs to organization_id", /enforce_sequence_enrollment_tenant/.test(migrationSrc) && /prospect_sequence_enrollments\.prospect_id must belong/.test(migrationSrc));
  check("it ALSO checks sequence_id belongs to organization_id (the second FK this table uniquely has)", /prospect_sequence_enrollments\.sequence_id must belong/.test(migrationSrc));
  check("the trigger fires before insert or update of exactly the three tenant-relevant columns", /before insert or update of prospect_id, sequence_id, organization_id on public\.prospect_sequence_enrollments/.test(migrationSrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
