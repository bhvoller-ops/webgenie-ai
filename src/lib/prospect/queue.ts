import type { ActionPriority, ProspectActionType } from "@/lib/prospect/types";

/**
 * P1 Daily Prospecting Queue — deterministic ordering only (master prompt
 * section 9: "Use readable deterministic rules. Do not build opaque ML
 * scoring."). Every input here is a real, already-persisted fact
 * (due date, priority, action type, age) — nothing inferred or guessed.
 */

export interface QueueableAction {
  actionType: ProspectActionType;
  priority: ActionPriority;
  dueAt: string | null;
  createdAt: string;
}

/**
 * How close to "ready to act on right now" an action type is. Mirrors the
 * master prompt's own worked examples (section 9): a ready-to-contact
 * prospect outranks one that still needs enrichment; a built-but-unsent
 * demo outranks a prospect with no audit yet.
 */
const READINESS_TIER: Record<ProspectActionType, number> = {
  CONTACT: 4,
  SEND_DEMO: 4,
  BOOK_MEETING: 4,
  REVIEW_REPLY: 4,
  // A due sequence step is exactly as "ready to act on right now" as the
  // other tier-4 actions -- it's due because the user's own plan said so.
  SEQUENCE_STEP: 4,
  FOLLOW_UP: 3,
  RUN_AUDIT: 2,
  BUILD_NEW_SITE_DEMO: 2,
  CREATE_REDESIGN_DEMO: 2,
  REVIEW_PROSPECT: 1,
  IMPORT_GMB_DATA: 1,
  DEPRIORITIZE: 0
};

const PRIORITY_WEIGHT: Record<ActionPriority, number> = { high: 30, medium: 20, low: 10 };

const DAY_MS = 86_400_000;

/**
 * Higher score = higher up the queue. A snoozed/future-dated action is
 * pushed far down (it isn't due yet, so it shouldn't compete with today's
 * real work) rather than excluded outright — filtering by due date is the
 * caller's job (see filterActiveActions below), this function only orders
 * what's already been decided to be in-scope.
 */
export function computeQueueScore(action: QueueableAction, now: Date = new Date()): number {
  let score = 0;

  if (action.dueAt) {
    const due = new Date(action.dueAt).getTime();
    const overdueDays = (now.getTime() - due) / DAY_MS;
    if (overdueDays >= 0) {
      // Due today or overdue — the single strongest signal, and more
      // overdue ranks higher still (capped so a very old miss doesn't
      // permanently bury everything else that's also overdue).
      score += 1000 + Math.min(overdueDays, 14) * 10;
    } else {
      // Not due yet (explicitly snoozed to the future) — deprioritize
      // below same-tier undated items rather than competing with today.
      score -= 500;
    }
  }

  score += READINESS_TIER[action.actionType] * 100;
  score += PRIORITY_WEIGHT[action.priority];

  // Recency tiebreak: an item that's been sitting a while nudges up
  // slightly within its own tier — "clear the backlog" — capped so age
  // alone can never out-rank a genuinely more urgent tier.
  const ageDays = (now.getTime() - new Date(action.createdAt).getTime()) / DAY_MS;
  score += Math.min(ageDays, 10);

  return score;
}

export function sortQueueActions<T extends QueueableAction>(actions: T[], now: Date = new Date()): T[] {
  return [...actions].sort((a, b) => computeQueueScore(b, now) - computeQueueScore(a, now));
}

/** An action is actionable today if it has no due date, or its due date has arrived. */
export function isActionDueNow(action: Pick<QueueableAction, "dueAt">, now: Date = new Date()): boolean {
  if (!action.dueAt) return true;
  return new Date(action.dueAt).getTime() <= now.getTime();
}

export function isActionOverdue(action: Pick<QueueableAction, "dueAt">, now: Date = new Date()): boolean {
  if (!action.dueAt) return false;
  return new Date(action.dueAt).getTime() < now.getTime() - DAY_MS / 2;
}
