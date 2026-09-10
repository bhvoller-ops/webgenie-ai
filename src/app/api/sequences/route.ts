import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToSequence } from "@/lib/prospect/sequence-row";

/**
 * P2 Assisted Outreach Sequences — sequence CRUD, kept to exactly what
 * the master prompt calls for (section F: "sequence CRUD only to the
 * level required for P2... Avoid advanced campaign features. No bulk
 * blast UI. No mass auto-enrollment. No sending provider.").
 */
const stepSchema = z.object({
  channel: z.enum(["CALL", "EMAIL", "SMS", "LINKEDIN", "VOICEMAIL", "LOOM", "SEND_DEMO", "FOLLOW_UP", "CUSTOM_TASK"]),
  delayDays: z.number().int().min(0).default(0),
  instructions: z.string().trim().max(2000).optional()
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  steps: z.array(stepSchema).min(1, "A sequence needs at least one step.")
});

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: sequences } = await supabase
    .from("outreach_sequences")
    .select("*, outreach_sequence_steps(id)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const result = (sequences ?? []).map((row) => ({
    ...rowToSequence(row),
    stepCount: Array.isArray(row.outreach_sequence_steps) ? row.outreach_sequence_steps.length : 0
  }));

  return NextResponse.json({ sequences: result });
}

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid sequence." }, { status: 400 });

  const { data: sequence, error: sequenceError } = await supabase
    .from("outreach_sequences")
    .insert({ organization_id: organizationId, name: parsed.data.name, description: parsed.data.description ?? null, status: "draft", created_by: user.id })
    .select("*")
    .single();
  if (sequenceError || !sequence) return NextResponse.json({ error: sequenceError?.message ?? "Unable to create sequence." }, { status: 500 });

  const stepsToInsert = parsed.data.steps.map((step, index) => ({
    sequence_id: sequence.id,
    step_order: index + 1,
    channel: step.channel,
    delay_days: step.delayDays,
    instructions: step.instructions ?? null
  }));
  const { error: stepsError } = await supabase.from("outreach_sequence_steps").insert(stepsToInsert);
  if (stepsError) {
    // Roll back the orphaned sequence rather than leaving a stepless one behind.
    await supabase.from("outreach_sequences").delete().eq("id", sequence.id);
    return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }

  return NextResponse.json({ sequence: rowToSequence(sequence) });
}
