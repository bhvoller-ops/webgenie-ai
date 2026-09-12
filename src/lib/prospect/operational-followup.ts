import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * WEBGENIE PR #30 operational follow-through correction.
 *
 * Closes two real gaps: "callback scheduled" and "information requested"
 * previously only produced a generic REVIEW_REPLY with the actual
 * promise buried in a free-text note. This writes a SPECIFIC,
 * structured prospect_action instead -- still the one canonical
 * "what does the user need to do now" row per prospect (migration 037's
 * `prospect_actions_one_active_idx` UNIQUE INDEX enforces that at the
 * database level; this function works WITH that constraint, not around
 * it, by finding and updating the prospect's single existing active row
 * rather than trying to insert a second one).
 *
 * No new table, no new column, no new action_type value, no migration:
 * - "Callback scheduled" uses the EXISTING 'FOLLOW_UP' action_type with
 *   status 'SNOOZED' and a real due_at -- reusing the exact mechanism
 *   the Daily Queue already uses to hide a snoozed item until its due
 *   date (lib/prospect/queue.ts's isActionDueNow()), not a new gating
 *   scheme.
 * - "Information requested" uses the EXISTING 'REVIEW_REPLY' action_type
 *   (a real reply occurred, so this remains an honest label) with status
 *   'PENDING' (immediately actionable -- sending the promised info isn't
 *   deferred to a future date the way a callback is).
 *
 * Idempotency: retrying with the same intent finds and updates the SAME
 * active row (by definition there is at most one, per the DB's own
 * unique index) rather than creating a second one -- true duplication is
 * structurally impossible, not just discouraged by application logic.
 */

export interface CallbackFollowUpInput {
  organizationId: string;
  prospectId: string;
  dueAt: string; // ISO 8601, already resolved client-side to an absolute UTC instant from date+time+timezone
  purpose: string;
}

export interface InformationRequestFollowUpInput {
  organizationId: string;
  prospectId: string;
  requestedInfo: string;
  channel: "CALL" | "EMAIL";
  promisedTiming?: string;
}

interface ExistingActiveAction {
  id: string;
  action_type: string;
}

async function findExistingActiveAction(supabase: SupabaseClient, organizationId: string, prospectId: string): Promise<ExistingActiveAction | null> {
  const { data } = await supabase
    .from("prospect_actions")
    .select("id, action_type")
    .eq("organization_id", organizationId)
    .eq("prospect_id", prospectId)
    .in("status", ["PENDING", "SNOOZED"])
    .maybeSingle();
  return data as ExistingActiveAction | null;
}

export async function upsertCallbackAction(supabase: SupabaseClient, input: CallbackFollowUpInput): Promise<{ actionId: string; error?: string }> {
  const now = new Date().toISOString();
  const reason = `Callback scheduled: ${input.purpose}`;
  const metadata = { kind: "callback", purpose: input.purpose, scheduledAt: now };

  const existing = await findExistingActiveAction(supabase, input.organizationId, input.prospectId);
  if (existing) {
    const { error } = await supabase
      .from("prospect_actions")
      .update({ action_type: "FOLLOW_UP", status: "SNOOZED", due_at: input.dueAt, reason, priority: "medium", source: "USER", metadata, updated_at: now })
      .eq("id", existing.id)
      .eq("organization_id", input.organizationId);
    if (error) return { actionId: existing.id, error: error.message };
    return { actionId: existing.id };
  }

  const { data, error } = await supabase
    .from("prospect_actions")
    .insert({
      organization_id: input.organizationId,
      prospect_id: input.prospectId,
      action_type: "FOLLOW_UP",
      status: "SNOOZED",
      due_at: input.dueAt,
      reason,
      priority: "medium",
      source: "USER",
      metadata
    })
    .select("id")
    .single();
  if (error || !data) return { actionId: "", error: error?.message ?? "Unable to create callback action." };
  return { actionId: data.id };
}

export async function upsertInformationRequestAction(supabase: SupabaseClient, input: InformationRequestFollowUpInput): Promise<{ actionId: string; error?: string }> {
  const now = new Date().toISOString();
  const reason = `Send requested information: ${input.requestedInfo} via ${input.channel}${input.promisedTiming ? ` (promised ${input.promisedTiming})` : ""}`;
  const metadata = { kind: "information_requested", requestedInfo: input.requestedInfo, channel: input.channel, promisedTiming: input.promisedTiming ?? null };

  const existing = await findExistingActiveAction(supabase, input.organizationId, input.prospectId);
  if (existing) {
    const { error } = await supabase
      .from("prospect_actions")
      .update({ action_type: "REVIEW_REPLY", status: "PENDING", due_at: null, reason, priority: "high", source: "USER", metadata, updated_at: now })
      .eq("id", existing.id)
      .eq("organization_id", input.organizationId);
    if (error) return { actionId: existing.id, error: error.message };
    return { actionId: existing.id };
  }

  const { data, error } = await supabase
    .from("prospect_actions")
    .insert({
      organization_id: input.organizationId,
      prospect_id: input.prospectId,
      action_type: "REVIEW_REPLY",
      status: "PENDING",
      due_at: null,
      reason,
      priority: "high",
      source: "USER",
      metadata
    })
    .select("id")
    .single();
  if (error || !data) return { actionId: "", error: error?.message ?? "Unable to create information-request action." };
  return { actionId: data.id };
}
