import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { rowToEnrollment } from "@/lib/prospect/sequence-row";
import { enrollProspect } from "@/lib/prospect/sequence-sync";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";

const schema = z.object({ sequenceId: z.string().uuid() });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: enrollments } = await supabase
    .from("prospect_sequence_enrollments")
    .select("*, outreach_sequences(name)")
    .eq("prospect_id", prospectId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const result = (enrollments ?? []).map((row) => ({
    ...rowToEnrollment(row),
    sequenceName: (row.outreach_sequences as { name?: string } | null)?.name ?? "Sequence"
  }));

  return NextResponse.json({ enrollments: result });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid sequence." }, { status: 400 });

  // Confirm the sequence really belongs to this org before enrollProspect()
  // ever touches it -- enrollProspect() itself doesn't re-check this (its
  // caller is always this route, which is why the DB tenant-guard trigger
  // on prospect_sequence_enrollments exists as the real backstop, not this
  // check alone).
  const { data: sequence } = await supabase.from("outreach_sequences").select("id, status").eq("id", parsed.data.sequenceId).eq("organization_id", organizationId).maybeSingle();
  if (!sequence) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });
  if (sequence.status !== "active" && sequence.status !== "draft") {
    return NextResponse.json({ error: "This sequence is archived." }, { status: 400 });
  }

  const { enrollmentId, error } = await enrollProspect(supabase, { organizationId, prospectId, sequenceId: parsed.data.sequenceId, createdBy: user.id });
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (prospectRow) await regenerateProspectIntelligence(supabase, rowToProspect(prospectRow), { force: true });

  return NextResponse.json({ enrollmentId });
}
