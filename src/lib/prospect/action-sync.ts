import type { SupabaseClient } from "@supabase/supabase-js";
import { computeProspectAction, type ProspectActionInput } from "@/lib/prospect/action-generation";

/**
 * Reconciles the deterministic recommended action into a single, current
 * prospect_actions row per prospect (master prompt section 47:
 * "Repeated queue generation should reconcile, not multiply"). Called
 * from regenerateProspectIntelligence() — the same existing choke point
 * P0 already calls after any real state change — so the queue updates
 * itself automatically without a second "recompute the queue" pass
 * anywhere else.
 *
 * Rules:
 *   - No existing PENDING/SNOOZED row -> create one.
 *   - Existing PENDING row, same action_type -> update reason/priority/
 *     due date in place (the situation is unchanged in kind, just
 *     refreshed).
 *   - Existing PENDING row, different action_type -> mark the old one
 *     COMPLETED (superseded by real progress) and create a fresh one.
 *   - Existing SNOOZED row, same action_type -> left untouched entirely.
 *     The user asked not to be reminded yet; nothing about the
 *     underlying situation changed enough to override that.
 *   - Existing SNOOZED row, different action_type -> the situation
 *     genuinely moved on; mark it COMPLETED and create a fresh PENDING
 *     row (the snooze no longer applies to what's actually next).
 *   - computeProspectAction() returns null (won/lost/deprioritized/
 *     meeting) -> mark any existing PENDING/SNOOZED row COMPLETED, no
 *     new row created.
 *   - COMPLETED/SKIPPED rows are history and are never touched here.
 */
export async function syncProspectAction(
  supabase: SupabaseClient,
  organizationId: string,
  prospectId: string,
  input: ProspectActionInput
): Promise<void> {
  const computed = computeProspectAction(input);

  const { data: existing } = await supabase
    .from("prospect_actions")
    .select("id, action_type, status")
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
    if (existing.action_type === computed.actionType) {
      if (existing.status === "SNOOZED") return; // respect the user's snooze, nothing about the type changed
      await supabase
        .from("prospect_actions")
        .update({ reason: computed.reason, priority: computed.priority, due_at: computed.dueAt, updated_at: now })
        .eq("id", existing.id);
      return;
    }
    // Different type recommended now -- supersede the old row, whether it was pending or snoozed.
    await supabase.from("prospect_actions").update({ status: "COMPLETED", completed_at: now, updated_at: now }).eq("id", existing.id);
  }

  await supabase.from("prospect_actions").insert({
    organization_id: organizationId,
    prospect_id: prospectId,
    action_type: computed.actionType,
    priority: computed.priority,
    reason: computed.reason,
    due_at: computed.dueAt,
    status: "PENDING",
    source: "SYSTEM"
  });
}
