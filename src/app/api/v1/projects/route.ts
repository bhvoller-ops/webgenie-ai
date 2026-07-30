import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api/authenticate";
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "projects:read");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await auth.supabase.from("projects").select("id,name,industry,status,created_at").eq("organization_id", auth.organizationId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
