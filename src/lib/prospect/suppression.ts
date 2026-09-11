import type { SupabaseClient } from "@supabase/supabase-js";
import type { Prospect, SuppressionReason } from "@/lib/prospect/types";
import { logActivity } from "@/lib/prospect/activity";

/**
 * P2 hard, sticky prospect suppression (master prompt Architecture
 * Decision 4). Deliberately the FIRST thing checked in every P2 decision
 * point that could otherwise recommend contacting a prospect --
 * regeneration, sequence enrollment, sequence advancement, Queue action
 * generation -- since "automation must never override suppression" is a
 * non-negotiable product principle, not a preference.
 *
 * A suppressed prospect is never un-suppressed by anything automatic.
 * Only setSuppressed(..., false) -- a deliberate, explicit call from a
 * real user action -- can reverse it.
 */
export const SUPPRESSION_REASONS: readonly SuppressionReason[] = ["OPTED_OUT", "DO_NOT_CONTACT", "INVALID_CONTACT", "MANUAL"];

export function isSuppressed(prospect: Pick<Prospect, "suppressedAt">): boolean {
  return Boolean(prospect.suppressedAt);
}

export async function suppressProspect(
  supabase: SupabaseClient,
  input: { organizationId: string; prospectId: string; reason: SuppressionReason; createdBy?: string | null }
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("prospects")
    .update({ suppressed_at: now, suppression_reason: input.reason, updated_at: now })
    .eq("id", input.prospectId)
    .eq("organization_id", input.organizationId);
  if (error) return { error: error.message };

  // MANDATORY FIX 3: cancel the Queue action and stop any active sequence
  // right here, synchronously, inside suppression itself -- never dependent
  // on the caller remembering to also call regenerateProspectIntelligence()
  // afterward (the previous design). 'SUPPRESSED' is a distinct terminal
  // status from 'COMPLETED' -- a suppression-cancelled action is a
  // different real-world fact than a user-completed one, and history must
  // say which happened (migration 038). This update targets exactly the
  // rows that would otherwise still be sitting in the Daily Queue; the new
  // prospect_actions_suppression_guard trigger (migration 038) is the
  // defense-in-depth backstop if any future code path ever tries to put a
  // row back into PENDING/SNOOZED for a still-suppressed prospect.
  await supabase
    .from("prospect_actions")
    .update({ status: "SUPPRESSED", updated_at: now })
    .eq("prospect_id", input.prospectId)
    .eq("organization_id", input.organizationId)
    .in("status", ["PENDING", "SNOOZED"]);

  // Same immediacy for an active/paused sequence enrollment -- don't wait
  // for resolveProspectAction() to notice on the next reconciliation pass.
  const { data: enrollments } = await supabase
    .from("prospect_sequence_enrollments")
    .update({ status: "STOPPED", stopped_at: now, stopped_reason: "SUPPRESSED", updated_at: now })
    .eq("prospect_id", input.prospectId)
    .eq("organization_id", input.organizationId)
    .in("status", ["ACTIVE", "PAUSED"])
    .select("id, sequence_id");
  for (const enrollment of enrollments ?? []) {
    await logActivity(supabase, {
      organizationId: input.organizationId,
      prospectId: input.prospectId,
      activityType: "SEQUENCE_STOPPED",
      summary: "Sequence stopped automatically (SUPPRESSED).",
      metadata: { sequenceId: enrollment.sequence_id, enrollmentId: enrollment.id, reason: "SUPPRESSED" },
      eventKey: `sequence_stopped:${enrollment.id}`
    });
  }

  await logActivity(supabase, {
    organizationId: input.organizationId,
    prospectId: input.prospectId,
    activityType: "PROSPECT_SUPPRESSED",
    summary: `Suppressed (${input.reason}) -- will no longer be recommended or enrolled in outreach.`,
    metadata: { reason: input.reason },
    createdBy: input.createdBy ?? null
  });
  return { error: null };
}

/** Explicit, deliberate reversal only -- never called from any regeneration/reconciliation path. */
export async function unsuppressProspect(
  supabase: SupabaseClient,
  input: { organizationId: string; prospectId: string; createdBy?: string | null }
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("prospects")
    .update({ suppressed_at: null, suppression_reason: null, updated_at: now })
    .eq("id", input.prospectId)
    .eq("organization_id", input.organizationId);
  if (error) return { error: error.message };

  await logActivity(supabase, {
    organizationId: input.organizationId,
    prospectId: input.prospectId,
    activityType: "PROSPECT_UNSUPPRESSED",
    summary: "Unsuppressed by explicit user action -- eligible for recommendations and outreach again.",
    createdBy: input.createdBy ?? null
  });
  return { error: null };
}
