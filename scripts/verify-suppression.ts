/**
 * Regression test for lib/prospect/suppression.ts and the suppression
 * precedence rule in lib/prospect/sequence-engine.ts (master prompt
 * Architecture Decision 4, P2 Phase 1 "SUPPRESSION TESTS" 1-8).
 *
 * Pure logic only — DB-level guarantees (the unique constraint, RLS,
 * cross-tenant rejection, an actual enroll attempt being refused) are
 * exercised for real in the Phase 2 production acceptance test, same
 * split P1's own verification scripts used (see docs/history.md).
 *
 * Run with: npx tsx scripts/verify-suppression.ts
 */
import { readFileSync } from "fs";
import { isSuppressed, SUPPRESSION_REASONS } from "../src/lib/prospect/suppression";
import { resolveActionSource, canTransitionToStopped } from "../src/lib/prospect/sequence-engine";

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

console.log("1. suppression persists / is read correctly (item 1)");
{
  check("a set suppressedAt reads as suppressed", isSuppressed({ suppressedAt: "2026-09-10T00:00:00Z" }));
  check("a null suppressedAt reads as not suppressed", !isSuppressed({ suppressedAt: null }));
  check("an undefined suppressedAt reads as not suppressed (defensive default)", !isSuppressed({ suppressedAt: undefined }));
}

console.log("2. the gate enrollProspect() checks before inserting (item 2)");
{
  const src = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("enrollProspect() calls isSuppressed() before its insert", /isSuppressed\(/.test(src) && src.indexOf("isSuppressed(") < src.indexOf("prospect_sequence_enrollments\")\n    .insert"));
}

console.log("3. a real stop-condition + suppressed both correctly mark an ACTIVE/PAUSED enrollment as transition-eligible (item 3)");
{
  check("ACTIVE can transition to STOPPED", canTransitionToStopped("ACTIVE"));
  check("PAUSED can transition to STOPPED", canTransitionToStopped("PAUSED"));
  check("COMPLETED cannot (already terminal, not a new event)", !canTransitionToStopped("COMPLETED"));
  check("STOPPED cannot (already terminal)", !canTransitionToStopped("STOPPED"));
}

console.log("4. suppressed prospect produces NO Queue action even when a step is due (item 4) — suppression outranks everything");
{
  check(
    "suppressed + a step genuinely due -> still SUPPRESSED, never DUE_STEP",
    resolveActionSource({ suppressed: true, stopReason: null, dueStepAvailable: true }) === "SUPPRESSED"
  );
  check(
    "suppressed + a real stop reason also true -> still SUPPRESSED (suppression is checked first)",
    resolveActionSource({ suppressed: true, stopReason: "WON", dueStepAvailable: false }) === "SUPPRESSED"
  );
  check("not suppressed + step due -> DUE_STEP wins", resolveActionSource({ suppressed: false, stopReason: null, dueStepAvailable: true }) === "DUE_STEP");
  check("not suppressed + no stop + no due step -> ORGANIC", resolveActionSource({ suppressed: false, stopReason: null, dueStepAvailable: false }) === "ORGANIC");
}

console.log("5. regeneration cannot resurrect a Queue action for a suppressed prospect (item 5) — deterministic, no hidden state");
{
  const input = { suppressed: true, stopReason: null, dueStepAvailable: true } as const;
  const first = resolveActionSource(input);
  const second = resolveActionSource(input);
  const third = resolveActionSource(input);
  check("calling the resolver repeatedly with the same suppressed input always returns SUPPRESSED", first === "SUPPRESSED" && second === "SUPPRESSED" && third === "SUPPRESSED");
}

console.log("6. manual unsuppress requires an explicit, deliberate call (item 6) — nothing in the automatic reconciliation path calls it");
{
  const regenerateSrc = readFileSync("src/lib/prospect/regenerate.ts", "utf8");
  const sequenceSyncSrc = readFileSync("src/lib/prospect/sequence-sync.ts", "utf8");
  check("regenerateProspectIntelligence() (the automatic reconciliation choke point) never calls unsuppressProspect()", !/unsuppressProspect/.test(regenerateSrc));
  check("sequence-sync.ts's automatic reconciliation never calls unsuppressProspect()", !/unsuppressProspect/.test(sequenceSyncSrc));
  const suppressRouteSrc = readFileSync("src/app/api/prospects/[id]/suppress/route.ts", "utf8");
  check("unsuppressProspect() IS reachable from the one explicit, user-initiated route", /unsuppressProspect/.test(suppressRouteSrc));
}

console.log("7. RLS prevents cross-tenant suppression (item 7) — verified for real against production in the Phase 2 acceptance test, not here");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("prospects retains its existing single 'members can manage prospects' RLS policy shape (suppression is just two more columns on an already-RLS'd row)", !/create policy.*prospects.*suppress/i.test(migrationSrc));
  check("the migration does not weaken prospects' RLS in any way (no new prospects policy added)", (migrationSrc.match(/create policy/g) ?? []).filter((_, i) => migrationSrc.split("create policy")[i + 1]?.includes(" prospects ")).length === 0);
}

console.log("8. reason vocabulary is fixed and enforced (item 8)");
{
  check("exactly the 4 reasons the master prompt specifies", SUPPRESSION_REASONS.length === 4);
  check("OPTED_OUT is a valid reason", SUPPRESSION_REASONS.includes("OPTED_OUT"));
  check("DO_NOT_CONTACT is a valid reason", SUPPRESSION_REASONS.includes("DO_NOT_CONTACT"));
  check("INVALID_CONTACT is a valid reason", SUPPRESSION_REASONS.includes("INVALID_CONTACT"));
  check("MANUAL is a valid reason", SUPPRESSION_REASONS.includes("MANUAL"));
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("the DB CHECK constraint lists exactly the same 4 values", /'OPTED_OUT', 'DO_NOT_CONTACT', 'INVALID_CONTACT', 'MANUAL'/.test(migrationSrc));
}

console.log("9. suppression cancels an existing Queue action synchronously, not only on the next reconciliation pass (Phase 1.1 MANDATORY FIX 3)");
{
  const src = readFileSync("src/lib/prospect/suppression.ts", "utf8");
  check("suppressProspect() itself updates prospect_actions to a terminal status", /from\("prospect_actions"\)[\s\S]*?status:\s*"SUPPRESSED"/.test(src));
  check("it only touches rows that are still PENDING/SNOOZED (never rewrites real history)", /\.in\("status",\s*\["PENDING",\s*"SNOOZED"\]\)/.test(src));
  check("a suppression-cancelled action gets its own distinct status, never mislabeled 'COMPLETED' (a different real-world fact)", !/prospect_actions"\)[\s\S]{0,200}status:\s*"COMPLETED"/.test(src));
}

console.log("10. suppression stops an active/paused sequence enrollment synchronously too (Phase 1.1 MANDATORY FIX 3)");
{
  const src = readFileSync("src/lib/prospect/suppression.ts", "utf8");
  check("suppressProspect() itself updates prospect_sequence_enrollments to STOPPED", /from\("prospect_sequence_enrollments"\)[\s\S]*?status:\s*"STOPPED"/.test(src));
  check("it only stops rows that are still ACTIVE/PAUSED", /\.in\("status",\s*\["ACTIVE",\s*"PAUSED"\]\)/.test(src));
  check("the stop is logged with a stable eventKey, not a bare insert (concurrency-safe even here)", /eventKey:\s*`sequence_stopped:/.test(src));
}

console.log("11. a DB-level trigger blocks any write that would put a suppressed prospect's action back into PENDING/SNOOZED (Phase 1.1 MANDATORY FIX 3)");
{
  const migrationSrc = readFileSync("supabase/migrations/038_p2_remediation.sql", "utf8");
  check("prospect_actions.status CHECK is widened to include SUPPRESSED", /check \(status in \('PENDING', 'COMPLETED', 'SKIPPED', 'SNOOZED', 'SUPPRESSED'\)\)/.test(migrationSrc));
  check("enforce_prospect_actions_not_suppressed() exists and checks prospects.suppressed_at", /enforce_prospect_actions_not_suppressed/.test(migrationSrc) && /suppressed_at is not null/.test(migrationSrc));
  check("the trigger fires before insert or update, on prospect_actions", /before insert or update of status, prospect_id on public\.prospect_actions/.test(migrationSrc));
  check(
    "it only blocks PENDING/SNOOZED, never a terminal status (suppressProspect() itself must still be able to write SUPPRESSED)",
    /new\.status in \('PENDING', 'SNOOZED'\)/.test(migrationSrc)
  );
}

console.log("12. direct completion of a suppressed prospect's action is refused, not silently allowed (Phase 1.1 MANDATORY FIX 3)");
{
  const actionRouteSrc = readFileSync("src/app/api/prospect-actions/[id]/route.ts", "utf8");
  check("the route checks the prospect's suppressed_at before applying complete/skip/snooze", /isSuppressed\(\{ suppressedAt: prospectForGuard/.test(actionRouteSrc));
  check("a suppressed prospect's action request is rejected with a real error status, not a 200", /status:\s*409/.test(actionRouteSrc));
  check("the route also refuses to re-operate on an action that's already left PENDING\\/SNOOZED", /actionRow\.status !== "PENDING" && actionRow\.status !== "SNOOZED"/.test(actionRouteSrc));

  const performRouteSrc = readFileSync("src/app/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform/route.ts", "utf8");
  check("the sequence-step perform route checks isSuppressed() before logging any event", /isSuppressed\(prospect\)/.test(performRouteSrc));
  check("it also refuses to perform against a non-ACTIVE enrollment (paused/stopped/completed)", /enrollment\.status !== "ACTIVE"/.test(performRouteSrc));
}

console.log("13. the Daily Queue query itself never returns a suppressed prospect's action (Phase 1.1 MANDATORY FIX 3, defense-in-depth)");
{
  const queueRouteSrc = readFileSync("src/app/api/prospects/queue/route.ts", "utf8");
  check("the query joins the prospect's suppressed_at", /suppressed_at/.test(queueRouteSrc));
  check("results are filtered by it before anything else touches them", /nonSuppressedRows/.test(queueRouteSrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
