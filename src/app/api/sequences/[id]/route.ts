import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToSequence, rowToSequenceStep } from "@/lib/prospect/sequence-row";

/**
 * Steps are editable only while a sequence has never had a real
 * enrollment. Once a prospect has actually been enrolled, an
 * enrollment's `current_step_order` is a bare integer into this
 * sequence's own step list (migration 037's deliberate simplicity
 * choice — see the migration comment) — reordering/deleting steps out
 * from under an in-flight enrollment would silently change what that
 * integer means. Simplest safe rule: once enrolled-into, a sequence's
 * steps are frozen; archive it and create a new one instead of editing
 * a live plan out from under prospects already following it.
 */
const stepSchema = z.object({
  channel: z.enum(["CALL", "EMAIL", "SMS", "LINKEDIN", "VOICEMAIL", "LOOM", "SEND_DEMO", "FOLLOW_UP", "CUSTOM_TASK"]),
  delayDays: z.number().int().min(0).default(0),
  instructions: z.string().trim().max(2000).optional()
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  steps: z.array(stepSchema).min(1).optional()
});

async function hasEverBeenEnrolled(supabase: Awaited<ReturnType<typeof requireAdminApi>>["ctx"]["supabase"], sequenceId: string): Promise<boolean> {
  const { count } = await supabase.from("prospect_sequence_enrollments").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId);
  return Boolean(count && count > 0);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: sequence } = await supabase.from("outreach_sequences").select("*").eq("id", id).eq("organization_id", organizationId).maybeSingle();
  if (!sequence) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });

  const { data: steps } = await supabase.from("outreach_sequence_steps").select("*").eq("sequence_id", id).order("step_order", { ascending: true });

  return NextResponse.json({ sequence: rowToSequence(sequence), steps: (steps ?? []).map(rowToSequenceStep) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: sequence } = await supabase.from("outreach_sequences").select("id").eq("id", id).eq("organization_id", organizationId).maybeSingle();
  if (!sequence) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update." }, { status: 400 });

  if (parsed.data.steps) {
    if (await hasEverBeenEnrolled(supabase, id)) {
      return NextResponse.json({ error: "This sequence already has real enrollments — steps are frozen. Archive it and create a new sequence instead." }, { status: 400 });
    }
    await supabase.from("outreach_sequence_steps").delete().eq("sequence_id", id);
    const stepsToInsert = parsed.data.steps.map((step, index) => ({
      sequence_id: id,
      step_order: index + 1,
      channel: step.channel,
      delay_days: step.delayDays,
      instructions: step.instructions ?? null
    }));
    const { error: stepsError } = await supabase.from("outreach_sequence_steps").insert(stepsToInsert);
    if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;

  const { data: updated, error } = await supabase.from("outreach_sequences").update(patch).eq("id", id).select("*").single();
  if (error || !updated) return NextResponse.json({ error: error?.message ?? "Unable to update sequence." }, { status: 500 });

  return NextResponse.json({ sequence: rowToSequence(updated) });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: sequence } = await supabase.from("outreach_sequences").select("id").eq("id", id).eq("organization_id", organizationId).maybeSingle();
  if (!sequence) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });

  if (await hasEverBeenEnrolled(supabase, id)) {
    // Never hard-delete a sequence real prospects have real history
    // against — archive instead, matching how a WON/LOST prospect is
    // never deleted either.
    await supabase.from("outreach_sequences").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ ok: true, archived: true });
  }

  await supabase.from("outreach_sequences").delete().eq("id", id);
  return NextResponse.json({ ok: true, archived: false });
}
