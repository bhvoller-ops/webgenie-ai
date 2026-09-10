/**
 * Regression test for lib/prospect/queue.ts — P1 Daily Prospecting Queue's
 * deterministic ordering (master prompt section 9). Covers test matrix
 * items in section 48 concerning ordering, overdue, and snooze behavior.
 *
 * Run with: npx tsx scripts/verify-queue.ts
 */
import { computeQueueScore, sortQueueActions, isActionDueNow, isActionOverdue, type QueueableAction } from "../src/lib/prospect/queue";

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

function action(overrides: Partial<QueueableAction>): QueueableAction {
  return { actionType: "REVIEW_PROSPECT", priority: "medium", dueAt: null, createdAt: iso(-1), ...overrides };
}

console.log("1. section 9 example: follow-up due today beats a brand-new low-confidence result");
{
  const followUp = action({ actionType: "FOLLOW_UP", priority: "high", dueAt: iso(0), createdAt: iso(-3) });
  const newReview = action({ actionType: "REVIEW_PROSPECT", priority: "low", dueAt: null, createdAt: now.toISOString() });
  check("follow-up due today outranks a brand-new review", computeQueueScore(followUp, now) > computeQueueScore(newReview, now));
}

console.log("2. section 9 example: audit completed + ready to contact beats not-yet-enriched");
{
  const contact = action({ actionType: "CONTACT", priority: "high" });
  const enrich = action({ actionType: "IMPORT_GMB_DATA", priority: "low" });
  check("CONTACT outranks IMPORT_GMB_DATA", computeQueueScore(contact, now) > computeQueueScore(enrich, now));
}

console.log("3. section 9 example: demo ready but unsent beats weak-evidence no-audit prospect");
{
  const sendDemo = action({ actionType: "SEND_DEMO", priority: "medium" });
  const runAudit = action({ actionType: "RUN_AUDIT", priority: "low" });
  check("SEND_DEMO outranks RUN_AUDIT", computeQueueScore(sendDemo, now) > computeQueueScore(runAudit, now));
}

console.log("4. overdue ranks above due-today, which ranks above not-yet-due (snoozed)");
{
  const overdue = action({ actionType: "FOLLOW_UP", dueAt: iso(-3) });
  const dueToday = action({ actionType: "FOLLOW_UP", dueAt: iso(0) });
  const snoozed = action({ actionType: "FOLLOW_UP", dueAt: iso(5) });
  check("overdue > due today", computeQueueScore(overdue, now) > computeQueueScore(dueToday, now));
  check("due today > snoozed (not yet due)", computeQueueScore(dueToday, now) > computeQueueScore(snoozed, now));
  check("snoozed same-tier item ranks below an undated same-tier item", computeQueueScore(snoozed, now) < computeQueueScore(action({ actionType: "FOLLOW_UP" }), now));
}

console.log("5. priority weighting within the same action type");
{
  const high = action({ actionType: "CONTACT", priority: "high" });
  const low = action({ actionType: "CONTACT", priority: "low" });
  check("high priority outranks low priority at the same tier", computeQueueScore(high, now) > computeQueueScore(low, now));
}

console.log("6. sortQueueActions produces a stable, correctly-ordered list, does not mutate input");
{
  const items = [
    action({ actionType: "REVIEW_PROSPECT", priority: "low" }),
    action({ actionType: "FOLLOW_UP", dueAt: iso(-1) }),
    action({ actionType: "CONTACT", priority: "high" })
  ];
  const sorted = sortQueueActions(items, now);
  check("follow-up (overdue) sorts first", sorted[0].actionType === "FOLLOW_UP");
  check("original array order unchanged", items[0].actionType === "REVIEW_PROSPECT");
}

console.log("7. isActionDueNow / isActionOverdue");
{
  check("no due date is always due now", isActionDueNow({ dueAt: null }, now));
  check("past due date is due now", isActionDueNow({ dueAt: iso(-1) }, now));
  check("future due date is not due now", !isActionDueNow({ dueAt: iso(1) }, now));
  check("no due date is never overdue", !isActionOverdue({ dueAt: null }, now));
  check("a date more than half a day in the past is overdue", isActionOverdue({ dueAt: iso(-1) }, now));
  check("today's date is not yet overdue", !isActionOverdue({ dueAt: iso(0) }, now));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
