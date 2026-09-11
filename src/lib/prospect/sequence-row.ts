import type { OutreachSequence, OutreachSequenceStep, ProspectSequenceEnrollment } from "@/lib/prospect/types";

/** Shared snake_case DB row -> camelCase mappers for the P2 sequence tables, matching row.ts's existing convention for prospects. */

export function rowToSequence(row: Record<string, unknown>): OutreachSequence {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    status: row.status as OutreachSequence["status"],
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

export function rowToSequenceStep(row: Record<string, unknown>): OutreachSequenceStep {
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

export function rowToEnrollment(row: Record<string, unknown>): ProspectSequenceEnrollment {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    prospectId: row.prospect_id as string,
    sequenceId: row.sequence_id as string,
    status: row.status as ProspectSequenceEnrollment["status"],
    currentStepOrder: row.current_step_order as number,
    nextStepDueAt: (row.next_step_due_at as string | null) ?? null,
    startedAt: row.started_at as string,
    pausedAt: (row.paused_at as string | null) ?? null,
    stoppedAt: (row.stopped_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    stoppedReason: (row.stopped_reason as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}
