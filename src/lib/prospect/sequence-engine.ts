import type {
  OutreachSequenceStep,
  ProspectSequenceEnrollment,
  SequenceEnrollmentStatus
} from "@/lib/prospect/types";

/**
 * P2 Assisted Outreach Sequences -- pure decision logic (master prompt
 * Architecture Decisions 3/7/8). No database access anywhere in this file,
 * matching the existing convention (action-generation.ts, queue.ts):
 * deterministic, unit-testable rules, never opaque scoring, never a live
 * query buried inside a "compute" function.
 */

const DAY_MS = 86_400_000;

/** Step 1's due time is enrollment.started_at + its own delay_days; every later step's due time is computed relative to when the PRIOR step actually resolved (see resolveNextStepDueAt), never pre-scheduled at enroll time. */
export function computeStepDueAt(referenceTime: Date, delayDays: number): string {
  return new Date(referenceTime.getTime() + delayDays * DAY_MS).toISOString();
}

export function stepAtOrder(steps: OutreachSequenceStep[], order: number): OutreachSequenceStep | null {
  return steps.find((s) => s.stepOrder === order) ?? null;
}

/** The step after the given order, or null if `order` was the last one (sequence is complete). */
export function nextStepAfter(steps: OutreachSequenceStep[], order: number): OutreachSequenceStep | null {
  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  return sorted.find((s) => s.stepOrder > order) ?? null;
}

export interface DueStepResult {
  step: OutreachSequenceStep;
  overdue: boolean;
}

/**
 * The one function the Queue-reconciliation caller needs: is there a due
 * step right now for an ACTIVE enrollment? Returns null for anything else
 * (PAUSED/COMPLETED/STOPPED, or ACTIVE but not due yet) -- a future step
 * must never surface before its due time (master prompt, Architecture
 * Decision 3 and Sequence Execution section).
 */
export function computeDueStep(
  enrollment: Pick<ProspectSequenceEnrollment, "status" | "currentStepOrder" | "nextStepDueAt">,
  steps: OutreachSequenceStep[],
  now: Date = new Date()
): DueStepResult | null {
  if (enrollment.status !== "ACTIVE") return null;
  if (!enrollment.nextStepDueAt) return null;
  const due = new Date(enrollment.nextStepDueAt).getTime();
  if (due > now.getTime()) return null;
  const step = stepAtOrder(steps, enrollment.currentStepOrder);
  if (!step) return null;
  return { step, overdue: now.getTime() - due > DAY_MS / 2 };
}

/** A real, primary-signal reason a sequence must stop or never advance (master prompt "SEQUENCE STOP CONDITIONS"). Checked from real state, not inferred from a computed action's shape. */
export type SequenceStopReason =
  | "SUPPRESSED"
  | "REPLIED"
  | "INTERESTED"
  | "MEETING_BOOKED"
  | "WON"
  | "LOST";

export function computeStopReason(input: {
  suppressed: boolean;
  prospectStatus: string;
  callLogStatus: string | null;
}): SequenceStopReason | null {
  if (input.suppressed) return "SUPPRESSED";
  if (input.prospectStatus === "won") return "WON";
  if (input.prospectStatus === "lost") return "LOST";
  if (input.prospectStatus === "meeting") return "MEETING_BOOKED";
  if (input.callLogStatus === "interested") return "INTERESTED";
  if (input.callLogStatus === "replied") return "REPLIED";
  return null;
}

/** Enrollment states from which a stop is a real transition worth logging -- COMPLETED/STOPPED are already terminal, stopping them again is a no-op, not a new event. */
export function canTransitionToStopped(status: SequenceEnrollmentStatus): boolean {
  return status === "ACTIVE" || status === "PAUSED";
}

/**
 * The precedence rule regenerate.ts's Queue reconciliation follows (master
 * prompt Architecture Decision 3, "SEQUENCE STOP CONDITIONS"), extracted
 * as a pure function so it's directly unit-testable without a database:
 *
 *   1. SUPPRESSED always wins -- no Queue action at all, regardless of
 *      anything else (Architecture Decision 4/6).
 *   2. Any other real stop reason (WON/LOST/MEETING_BOOKED/REPLIED/
 *      INTERESTED) stops the sequence but lets the organic P0/P1
 *      recommendation win -- these are situations needing a human to look
 *      at the prospect directly (REVIEW_REPLY, DEPRIORITIZE, or null).
 *   3. Otherwise, a due sequence step overrides the organic recommendation.
 *   4. Otherwise, the organic recommendation, unchanged.
 */
export type ActionResolution = "SUPPRESSED" | "ORGANIC" | "DUE_STEP";

export function resolveActionSource(input: { suppressed: boolean; stopReason: SequenceStopReason | null; dueStepAvailable: boolean }): ActionResolution {
  if (input.suppressed) return "SUPPRESSED";
  if (input.stopReason) return "ORGANIC";
  if (input.dueStepAvailable) return "DUE_STEP";
  return "ORGANIC";
}
