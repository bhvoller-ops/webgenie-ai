import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProspectActionResult } from "@/lib/prospect/action-generation";
import { computeDueStep, computeStepDueAt, computeStopReason, canTransitionToStopped, nextStepAfter } from "@/lib/prospect/sequence-engine";
import { logActivity } from "@/lib/prospect/activity";
import { isSuppressed } from "@/lib/prospect/suppression";
import { SEQUENCE_STEP_CHANNEL_LABELS, type OutreachSequenceStep, type SequenceStepActionMetadata } from "@/lib/prospect/types";

/**
 * P2 database-touching sequence orchestration (master prompt Architecture
 * Decisions 1/3/7/8). Pure decision rules live in sequence-engine.ts; this
 * file is the DB layer on top of them -- reconciling sequence state into
 * the existing prospect_actions Queue, and the atomic step-advance/
 * enroll/pause/resume/stop operations.
 */

function rowToStep(row: Record<string, unknown>): OutreachSequenceStep {
  return {
    id: row.id as string,
    sequenceId: row.sequence_id as string,
    stepOrder: row.step_order as number,
    channel: row.channel as OutreachSequenceStep["channel"],
    delayDays: row.delay_days as number,
    instructions: (row.instructions as string | null) ?? null,
    createdAt: row.created_at as string
  };
}

interface EnrollmentRow {
  id: string;
  organization_id: string;
  prospect_id: string;
  sequence_id: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "STOPPED";
  current_step_order: number;
  next_step_due_at: string | null;
}

/**
 * The single P2 decision point regenerateProspectIntelligence() calls
 * instead of feeding computeProspectAction()'s result straight to
 * syncProspectAction(). Returns the SAME organicAction unchanged whenever
 * there's no active/paused enrollment, or nothing about it changes the
 * answer -- meaning a prospect never enrolled in any sequence sees
 * literally zero behavior change from P1.
 *
 * Precedence (highest first):
 *   1. A real stop-condition (suppressed / won / lost / meeting / replied /
 *      interested) -- stops the enrollment (if not already stopped) AND
 *      lets the organic action win, since these are exactly the situations
 *      where a human needs to look at the prospect directly (REVIEW_REPLY,
 *      DEPRIORITIZE, or null via prospects.status).
 *   2. An ACTIVE enrollment with a step due right now -- SEQUENCE_STEP
 *      overrides the organic recommendation, since the user explicitly
 *      opted this prospect into a deliberate plan.
 *   3. Otherwise, the organic action, exactly as computed by P0/P1 today.
 */
export async function resolveProspectAction(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    prospectId: string;
    suppressed: boolean;
    prospectStatus: string;
    callLogStatus: string | null;
    organicAction: ProspectActionResult | null;
  }
): Promise<ProspectActionResult | null> {
  const { data: enrollment } = await supabase
    .from("prospect_sequence_enrollments")
    .select("id, organization_id, prospect_id, sequence_id, status, current_step_order, next_step_due_at")
    .eq("prospect_id", input.prospectId)
    .in("status", ["ACTIVE", "PAUSED"])
    .maybeSingle<EnrollmentRow>();

  const stopReason = computeStopReason({
    suppressed: input.suppressed,
    prospectStatus: input.prospectStatus,
    callLogStatus: input.callLogStatus
  });

  // Suppression always wins -- Architecture Decision 4/6: "automation
  // must never override suppression." A suppressed prospect gets NO Queue
  // action at all, even one that would otherwise be perfectly legitimate
  // advice (RUN_AUDIT, CONTACT, ...) -- unlike the other stop reasons
  // below (WON/LOST/etc.), which stop the sequence but still let the
  // organic action through, since those situations genuinely do need a
  // human to look at the prospect directly.
  if (input.suppressed) {
    if (enrollment && canTransitionToStopped(enrollment.status)) {
      const now = new Date().toISOString();
      await supabase
        .from("prospect_sequence_enrollments")
        .update({ status: "STOPPED", stopped_at: now, stopped_reason: "SUPPRESSED", updated_at: now })
        .eq("id", enrollment.id);
      await logActivity(supabase, {
        organizationId: input.organizationId,
        prospectId: input.prospectId,
        activityType: "SEQUENCE_STOPPED",
        summary: "Sequence stopped automatically (SUPPRESSED).",
        metadata: { sequenceId: enrollment.sequence_id, enrollmentId: enrollment.id, reason: "SUPPRESSED" }
      });
    }
    return null;
  }

  if (!enrollment) return input.organicAction;

  if (stopReason && canTransitionToStopped(enrollment.status)) {
    const now = new Date().toISOString();
    await supabase
      .from("prospect_sequence_enrollments")
      .update({ status: "STOPPED", stopped_at: now, stopped_reason: stopReason, updated_at: now })
      .eq("id", enrollment.id);
    await logActivity(supabase, {
      organizationId: input.organizationId,
      prospectId: input.prospectId,
      activityType: "SEQUENCE_STOPPED",
      summary: `Sequence stopped automatically (${stopReason}).`,
      metadata: { sequenceId: enrollment.sequence_id, enrollmentId: enrollment.id, reason: stopReason }
    });
    return input.organicAction;
  }

  if (enrollment.status !== "ACTIVE") return input.organicAction; // PAUSED, or already terminal -- never surfaces a due step

  const { data: sequence } = await supabase.from("outreach_sequences").select("name").eq("id", enrollment.sequence_id).maybeSingle();
  const { data: stepRows } = await supabase.from("outreach_sequence_steps").select("*").eq("sequence_id", enrollment.sequence_id);
  const steps = (stepRows ?? []).map(rowToStep);

  const due = computeDueStep(
    { status: enrollment.status, currentStepOrder: enrollment.current_step_order, nextStepDueAt: enrollment.next_step_due_at },
    steps
  );
  if (!due) return input.organicAction;

  const metadata: SequenceStepActionMetadata = {
    sequenceId: enrollment.sequence_id,
    sequenceStepId: due.step.id,
    enrollmentId: enrollment.id,
    channel: due.step.channel,
    sequenceName: sequence?.name ?? "Sequence"
  };

  // Idempotent: log SEQUENCE_STEP_DUE only the first time this exact step
  // becomes due, same pattern regenerate.ts already uses for AUDIT_COMPLETED.
  const { data: alreadyLogged } = await supabase
    .from("prospect_activities")
    .select("id")
    .eq("prospect_id", input.prospectId)
    .eq("activity_type", "SEQUENCE_STEP_DUE")
    .contains("metadata", { sequenceStepId: due.step.id, enrollmentId: enrollment.id })
    .maybeSingle();
  if (!alreadyLogged) {
    await logActivity(supabase, {
      organizationId: input.organizationId,
      prospectId: input.prospectId,
      activityType: "SEQUENCE_STEP_DUE",
      channel: due.step.channel,
      summary: `${sequence?.name ?? "Sequence"}: ${SEQUENCE_STEP_CHANNEL_LABELS[due.step.channel]} step is due.`,
      metadata: { sequenceId: enrollment.sequence_id, sequenceStepId: due.step.id, enrollmentId: enrollment.id }
    });
  }

  return {
    actionType: "SEQUENCE_STEP",
    reason: `${metadata.sequenceName}: ${SEQUENCE_STEP_CHANNEL_LABELS[due.step.channel]}${due.step.instructions ? ` — ${due.step.instructions}` : ""}`,
    priority: due.overdue ? "high" : "medium",
    dueAt: enrollment.next_step_due_at,
    metadata: metadata as unknown as Record<string, unknown>
  };
}

/**
 * Atomic conditional advance -- the compare-and-swap that guarantees "a
 * sequence step must advance exactly once" (master prompt Architecture
 * Decision 8) even under a double-click, a retried request, or two
 * concurrent reconciliation calls. The UPDATE's own WHERE clause (current
 * step + status='ACTIVE') is the real guard: if another call already
 * advanced this enrollment, zero rows match and `advanced` comes back
 * false -- never a select-then-branch race.
 */
export async function advanceSequenceStep(
  supabase: SupabaseClient,
  input: { organizationId: string; prospectId: string; enrollmentId: string; expectedCurrentStepOrder: number }
): Promise<{ advanced: boolean; completed: boolean }> {
  const { data: enrollment } = await supabase
    .from("prospect_sequence_enrollments")
    .select("id, sequence_id, current_step_order, status")
    .eq("id", input.enrollmentId)
    .maybeSingle();
  if (!enrollment || enrollment.status !== "ACTIVE") return { advanced: false, completed: false };
  if (enrollment.current_step_order !== input.expectedCurrentStepOrder) return { advanced: false, completed: false };

  const { data: stepRows } = await supabase.from("outreach_sequence_steps").select("*").eq("sequence_id", enrollment.sequence_id);
  const steps = (stepRows ?? []).map(rowToStep);
  const next = nextStepAfter(steps, enrollment.current_step_order);
  const now = new Date();
  const nowIso = now.toISOString();

  if (!next) {
    const { data: updated } = await supabase
      .from("prospect_sequence_enrollments")
      .update({ status: "COMPLETED", completed_at: nowIso, updated_at: nowIso })
      .eq("id", enrollment.id)
      .eq("current_step_order", input.expectedCurrentStepOrder)
      .eq("status", "ACTIVE")
      .select("id");
    const advanced = Boolean(updated && updated.length > 0);
    if (advanced) {
      await logActivity(supabase, {
        organizationId: input.organizationId,
        prospectId: input.prospectId,
        activityType: "SEQUENCE_COMPLETED",
        summary: "Sequence completed -- every step was performed.",
        metadata: { sequenceId: enrollment.sequence_id, enrollmentId: enrollment.id }
      });
    }
    return { advanced, completed: true };
  }

  const nextDueAt = computeStepDueAt(now, next.delayDays);
  const { data: updated } = await supabase
    .from("prospect_sequence_enrollments")
    .update({ current_step_order: next.stepOrder, next_step_due_at: nextDueAt, updated_at: nowIso })
    .eq("id", enrollment.id)
    .eq("current_step_order", input.expectedCurrentStepOrder)
    .eq("status", "ACTIVE")
    .select("id");
  const advanced = Boolean(updated && updated.length > 0);
  return { advanced, completed: false };
}

export async function enrollProspect(
  supabase: SupabaseClient,
  input: { organizationId: string; prospectId: string; sequenceId: string; createdBy?: string | null }
): Promise<{ enrollmentId: string | null; error: string | null }> {
  const { data: prospect } = await supabase.from("prospects").select("suppressed_at").eq("id", input.prospectId).eq("organization_id", input.organizationId).maybeSingle();
  if (!prospect) return { enrollmentId: null, error: "Prospect not found." };
  if (isSuppressed({ suppressedAt: prospect.suppressed_at })) {
    return { enrollmentId: null, error: "This prospect is suppressed and cannot be enrolled in a sequence." };
  }

  const { data: firstStep } = await supabase
    .from("outreach_sequence_steps")
    .select("delay_days")
    .eq("sequence_id", input.sequenceId)
    .eq("step_order", 1)
    .maybeSingle();
  if (!firstStep) return { enrollmentId: null, error: "This sequence has no steps yet." };

  const now = new Date();
  const { data: inserted, error } = await supabase
    .from("prospect_sequence_enrollments")
    .insert({
      organization_id: input.organizationId,
      prospect_id: input.prospectId,
      sequence_id: input.sequenceId,
      status: "ACTIVE",
      current_step_order: 1,
      next_step_due_at: computeStepDueAt(now, firstStep.delay_days),
      started_at: now.toISOString()
    })
    .select("id")
    .single();

  if (error) {
    // Postgres unique_violation on the partial index -- a real concurrent
    // enroll attempt, not an app-logic bug. Surface a clean message rather
    // than the raw constraint name.
    if (error.code === "23505") return { enrollmentId: null, error: "This prospect is already enrolled in an active sequence." };
    return { enrollmentId: null, error: error.message };
  }

  await logActivity(supabase, {
    organizationId: input.organizationId,
    prospectId: input.prospectId,
    activityType: "SEQUENCE_ENROLLED",
    summary: "Enrolled in an outreach sequence.",
    metadata: { sequenceId: input.sequenceId, enrollmentId: inserted.id },
    createdBy: input.createdBy ?? null
  });

  return { enrollmentId: inserted.id, error: null };
}

async function setEnrollmentStatus(
  supabase: SupabaseClient,
  input: { organizationId: string; prospectId: string; enrollmentId: string; fromStatuses: string[]; toStatus: "ACTIVE" | "PAUSED" | "STOPPED"; activityType: "SEQUENCE_PAUSED" | "SEQUENCE_RESUMED" | "SEQUENCE_STOPPED"; summary: string; stoppedReason?: string }
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status: input.toStatus, updated_at: now };
  if (input.toStatus === "PAUSED") patch.paused_at = now;
  if (input.toStatus === "ACTIVE") patch.paused_at = null;
  if (input.toStatus === "STOPPED") {
    patch.stopped_at = now;
    patch.stopped_reason = input.stoppedReason ?? "MANUAL";
  }

  const { data: updated } = await supabase
    .from("prospect_sequence_enrollments")
    .update(patch)
    .eq("id", input.enrollmentId)
    .eq("organization_id", input.organizationId)
    .in("status", input.fromStatuses)
    .select("id, sequence_id");
  if (!updated || updated.length === 0) {
    return { error: "This sequence isn't in a state that allows that action right now." };
  }

  await logActivity(supabase, {
    organizationId: input.organizationId,
    prospectId: input.prospectId,
    activityType: input.activityType,
    summary: input.summary,
    metadata: { sequenceId: updated[0].sequence_id, enrollmentId: input.enrollmentId }
  });
  return { error: null };
}

export function pauseEnrollment(supabase: SupabaseClient, input: { organizationId: string; prospectId: string; enrollmentId: string }) {
  return setEnrollmentStatus(supabase, { ...input, fromStatuses: ["ACTIVE"], toStatus: "PAUSED", activityType: "SEQUENCE_PAUSED", summary: "Sequence paused by user." });
}

export function resumeEnrollment(supabase: SupabaseClient, input: { organizationId: string; prospectId: string; enrollmentId: string }) {
  return setEnrollmentStatus(supabase, { ...input, fromStatuses: ["PAUSED"], toStatus: "ACTIVE", activityType: "SEQUENCE_RESUMED", summary: "Sequence resumed by user." });
}

export function stopEnrollment(supabase: SupabaseClient, input: { organizationId: string; prospectId: string; enrollmentId: string }) {
  return setEnrollmentStatus(supabase, {
    ...input,
    fromStatuses: ["ACTIVE", "PAUSED"],
    toStatus: "STOPPED",
    activityType: "SEQUENCE_STOPPED",
    summary: "Sequence stopped by user.",
    stoppedReason: "MANUALLY_STOPPED"
  });
}
