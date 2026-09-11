import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProspectActionResult } from "@/lib/prospect/action-generation";

/**
 * Reconciles a single already-decided recommended action into a single,
 * current prospect_actions row per prospect (master prompt section 47:
 * "Repeated queue generation should reconcile, not multiply"). Called
 * from regenerateProspectIntelligence() — the same existing choke point
 * P0 already calls after any real state change — so the queue updates
 * itself automatically without a second "recompute the queue" pass
 * anywhere else.
 *
 * P2 change (migration 037): this function used to call
 * computeProspectAction() itself. It no longer does -- the caller
 * (regenerate.ts) now decides the final action first, via
 * lib/prospect/sequence-sync.ts's resolveProspectAction(), which may
 * override the P0/P1 organic recommendation with a due SEQUENCE_STEP (or
 * null, if suppressed). computeProspectAction() itself is completely
 * unchanged; this file's own reconciliation rules are unchanged too --
 * only what decides the *input* moved up a layer, so a due sequence step
 * reconciles through the exact same one-active-row logic every other
 * action already does, rather than a second competing reconciler.
 *
 * Rules:
 *   - No existing PENDING/SNOOZED row -> create one.
 *   - Existing PENDING row, same action_type (and, for SEQUENCE_STEP,
 *     the same sequence step -- see isSameAction below) -> update reason/
 *     priority/due date/metadata in place (the situation is unchanged in
 *     kind, just refreshed).
 *   - Existing PENDING row, different action_type/step -> mark the old
 *     one COMPLETED (superseded by real progress) and create a fresh one.
 *   - Existing SNOOZED row, same action_type/step -> left untouched
 *     entirely. The user asked not to be reminded yet; nothing about the
 *     underlying situation changed enough to override that.
 *   - Existing SNOOZED row, different action_type/step -> the situation
 *     genuinely moved on; mark it COMPLETED and create a fresh PENDING
 *     row (the snooze no longer applies to what's actually next).
 *   - computed is null (won/lost/deprioritized/meeting/suppressed) ->
 *     mark any existing PENDING/SNOOZED row COMPLETED, no new row created.
 *   - COMPLETED/SKIPPED rows are history and are never touched here.
 */

export interface ExistingActionRow {
  id: string;
  action_type: string;
  status: string;
  metadata: Record<string, unknown> | null;
}

/**
 * Two computed actions are "the same situation" if they're the same
 * action_type -- EXCEPT for SEQUENCE_STEP, where the action_type alone
 * doesn't distinguish "due step 1 of sequence A" from "due step 2 of
 * sequence B." Without this, snoozing step 1's queue item would
 * incorrectly also suppress step 2's once the prospect advances (the
 * generic "same action_type -> respect SNOOZED" rule would wrongly match).
 */
export function isSameAction(existing: ExistingActionRow, computed: ProspectActionResult): boolean {
  if (existing.action_type !== computed.actionType) return false;
  if (computed.actionType !== "SEQUENCE_STEP") return true;
  const existingStepId = existing.metadata?.sequenceStepId;
  const computedStepId = computed.metadata?.sequenceStepId;
  return Boolean(existingStepId) && existingStepId === computedStepId;
}

export async function syncProspectAction(
  supabase: SupabaseClient,
  organizationId: string,
  prospectId: string,
  computed: ProspectActionResult | null
): Promise<void> {
  const { data: existing } = await supabase
    .from("prospect_actions")
    .select("id, action_type, status, metadata")
    .eq("prospect_id", prospectId)
    .in("status", ["PENDING", "SNOOZED"])
    .maybeSingle();

  const now = new Date().toISOString();

  if (!computed) {
    if (existing) {
      await supabase.from("prospect_actions").update({ status: "COMPLETED", completed_at: now, updated_at: now }).eq("id", existing.id);
    }
    return;
  }

  if (existing) {
    if (isSameAction(existing as ExistingActionRow, computed)) {
      if (existing.status === "SNOOZED") return; // respect the user's snooze, nothing about the situation changed
      await supabase
        .from("prospect_actions")
        .update({
          reason: computed.reason,
          priority: computed.priority,
          due_at: computed.dueAt,
          metadata: computed.metadata ?? {},
          updated_at: now
        })
        .eq("id", existing.id);
      return;
    }
    // Different type/step recommended now -- supersede the old row, whether it was pending or snoozed.
    await supabase.from("prospect_actions").update({ status: "COMPLETED", completed_at: now, updated_at: now }).eq("id", existing.id);
  }

  await supabase.from("prospect_actions").insert({
    organization_id: organizationId,
    prospect_id: prospectId,
    action_type: computed.actionType,
    priority: computed.priority,
    reason: computed.reason,
    due_at: computed.dueAt,
    metadata: computed.metadata ?? {},
    status: "PENDING",
    source: "SYSTEM"
  });
}
