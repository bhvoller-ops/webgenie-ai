import { createAdminClient } from "@/lib/supabase/admin";
import { hashApiKey } from "@/lib/admin/api-keys";
export async function authenticateApiKey(request: Request, requiredScope: string) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token?.startsWith("wg_live_")) return null;
  const supabase = createAdminClient();
  const { data: key } = await supabase.from("api_keys").select("id,organization_id,scopes,status,expires_at").eq("key_hash", hashApiKey(token)).maybeSingle();
  if (!key || key.status !== "active" || (key.expires_at && new Date(key.expires_at) <= new Date()) || !key.scopes.includes(requiredScope)) return null;
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
  await supabase.from("usage_events").insert({ organization_id: key.organization_id, metric: "api_requests", quantity: 1, resource_type: "api_key", resource_id: key.id });
  return { supabase, organizationId: key.organization_id, apiKeyId: key.id };
}
