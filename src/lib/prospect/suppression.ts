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
