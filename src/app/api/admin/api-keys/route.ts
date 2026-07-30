import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/admin/api-keys";
import { can } from "@/lib/admin/permissions";

const schema = z.object({ name: z.string().min(2).max(80), scopes: z.array(z.enum(["projects:read"])).min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: membership } = await supabase.from("organization_members").select("organization_id,role").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership || !can(membership.role, "api_keys:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const key = generateApiKey();
  const { data, error } = await supabase.from("api_keys").insert({ organization_id: membership.organization_id, name: parsed.data.name, key_prefix: key.prefix, key_hash: key.hash, scopes: parsed.data.scopes, created_by: user.id }).select("id,name,key_prefix,scopes,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("audit_logs").insert({ organization_id: membership.organization_id, actor_user_id: user.id, action: "api_key.created", target_type: "api_key", target_id: data.id, metadata: { name: data.name, scopes: data.scopes } });
  return NextResponse.json({ ...data, token: key.token }, { status: 201 });
}
