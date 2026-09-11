import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { pauseEnrollment, resumeEnrollment, stopEnrollment } from "@/lib/prospect/sequence-sync";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";

const schema = z.object({ op: z.enum(["pause", "resume", "stop"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const { id: prospectId, enrollmentId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const args = { organizationId, prospectId, enrollmentId };
  const { error } =
    parsed.data.op === "pause" ? await pauseEnrollment(supabase, args) : parsed.data.op === "resume" ? await resumeEnrollment(supabase, args) : await stopEnrollment(supabase, args);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (prospectRow) await regenerateProspectIntelligence(supabase, rowToProspect(prospectRow), { force: true });

  return NextResponse.json({ ok: true });
}
