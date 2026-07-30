import type { SupabaseClient } from "@supabase/supabase-js";
export async function writeAuditLog(supabase: SupabaseClient, entry: { organizationId: string; actorUserId?: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown> }) {
  const { error } = await supabase.from("audit_logs").insert({ organization_id: entry.organizationId, actor_user_id: entry.actorUserId ?? null, action: entry.action, target_type: entry.targetType ?? null, target_id: entry.targetId ?? null, metadata: entry.metadata ?? {} });
  if (error) throw new Error(error.message);
}
