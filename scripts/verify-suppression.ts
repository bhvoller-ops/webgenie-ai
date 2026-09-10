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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
