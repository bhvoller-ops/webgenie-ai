import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { advanceSequenceStep } from "@/lib/prospect/sequence-sync";
import { logActivity } from "@/lib/prospect/activity";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { SEQUENCE_STEP_CHANNEL_LABELS } from "@/lib/prospect/types";

/**
 * "The user performed the step externally" -- the one moment P2 records a
 * real event (master prompt: "user marks PERFORMED / logs outcome ->
 * activity event written -> sequence advances"). Reuses call_log exactly
 * as the pitch outcome route (P1) already does -- one current-contact-
 * state record, never a second one for sequence-driven contact.
 */
const OUTCOME_TO_STATUS = {
  no_answer: "no_answer",
  left_voicemail: "left_voicemail",
  sent: "sent",
  replied: "replied",
  interested: "interested",
  not_interested: "not_interested",
  meeting_booked: "meeting_booked",
  won: "closed",
  lost: "lost"
} as const;

const snoozeOptionSchema = z.enum(["tomorrow", "three_days", "one_week"]);
const FOLLOW_UP_DAYS: Record<z.infer<typeof snoozeOptionSchema>, number> = { tomorrow: 1, three_days: 3, one_week: 7 };

const schema = z.object({
  outcome: z.enum(Object.keys(OUTCOME_TO_STATUS) as [keyof typeof OUTCOME_TO_STATUS, ...(keyof typeof OUTCOME_TO_STATUS)[]]),
  currentStepOrder: z.number().int().min(1),
  sequenceStepId: z.string().uuid(),
  channel: z.enum(["CALL", "EMAIL", "SMS", "LINKEDIN", "VOICEMAIL", "LOOM", "SEND_DEMO", "FOLLOW_UP", "CUSTOM_TASK"]),
  followUp: z.object({ option: snoozeOptionSchema.optional(), until: z.string().datetime().optional() }).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const { id: prospectId, enrollmentId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { data: enrollment } = await supabase
    .from("prospect_sequence_enrollments")
    .select("id, sequence_id")
    .eq("id", enrollmentId)
    .eq("organization_id", organizationId)
    .eq("prospect_id", prospectId)
    .maybeSingle();
  if (!enrollment) return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  const now = new Date().toISOString();
  const status = OUTCOME_TO_STATUS[parsed.data.outcome];
  let followUpDueAt: string | null = null;
  if (parsed.data.followUp) {
    followUpDueAt = parsed.data.followUp.until ?? new Date(Date.now() + FOLLOW_UP_DAYS[parsed.data.followUp.option ?? "three_days"] * 86400000).toISOString();
  }

  const { data: existingCallLog } = await supabase.from("call_log").select("id").eq("prospect_id", prospectId).maybeSingle();
  if (existingCallLog) {
    await supabase.from("call_log").update({ status, last_contacted_at: now, follow_up_due_at: followUpDueAt, updated_at: now }).eq("id", existingCallLog.id);
  } else {
    await supabase.from("call_log").insert({
      organization_id: organizationId,
      prospect_id: prospectId,
      business_name: prospect.businessName,
      phone: prospect.phone || "unknown",
      industry: prospect.industry ?? null,
      city: prospect.city ?? null,
      state: prospect.state ?? null,
      demo_url: prospect.demoUrl ?? null,
      status,
      last_contacted_at: now,
      follow_up_due_at: followUpDueAt,
      created_by: user.id
    });
  }

  await logActivity(supabase, {
    organizationId,
    prospectId,
    activityType: "CONTACT_ATTEMPTED",
    channel: parsed.data.channel,
    summary: `${SEQUENCE_STEP_CHANNEL_LABELS[parsed.data.channel]} step performed -- outcome logged: ${parsed.data.outcome.replace(/_/g, " ")}.`,
    metadata: { sequenceId: enrollment.sequence_id, sequenceStepId: parsed.data.sequenceStepId, enrollmentId, outcome: parsed.data.outcome },
    createdBy: user.id
  });
  if (followUpDueAt) {
    await logActivity(supabase, {
      organizationId,
      prospectId,
      activityType: "FOLLOW_UP_SCHEDULED",
      summary: `Follow-up scheduled for ${new Date(followUpDueAt).toLocaleDateString()}.`,
      metadata: { sequenceId: enrollment.sequence_id, enrollmentId },
      createdBy: user.id
    });
  }

  // A reply/interested/won/lost outcome is a real stop-condition --
  // resolveProspectAction() (called inside regenerateProspectIntelligence
  // below, via the freshly-updated call_log row) stops the sequence
  // automatically. The step is only explicitly advanced here for outcomes
  // that DON'T already imply a stop, since advancing a sequence that's
  // about to be stopped would move it to a step that never gets surfaced.
  const stopOutcomes: (typeof parsed.data.outcome)[] = ["replied", "interested", "not_interested", "meeting_booked", "won", "lost"];
  if (!stopOutcomes.includes(parsed.data.outcome)) {
    await advanceSequenceStep(supabase, { organizationId, prospectId, enrollmentId, expectedCurrentStepOrder: parsed.data.currentStepOrder });
  }

  // Complete the underlying Queue action explicitly -- regenerate below
  // will also reconcile it, but this guarantees it's marked COMPLETED
  // (not left superseded-via-a-different-path) even if reconciliation
  // computes a brand new due step in the same call.
  await supabase
    .from("prospect_actions")
    .update({ status: "COMPLETED", completed_at: now, updated_at: now })
    .eq("prospect_id", prospectId)
    .eq("action_type", "SEQUENCE_STEP")
    .in("status", ["PENDING", "SNOOZED"])
    .contains("metadata", { sequenceStepId: parsed.data.sequenceStepId });

  const { data: refreshedRow } = await supabase.from("prospects").select("*").eq("id", prospectId).single();
  if (refreshedRow) await regenerateProspectIntelligence(supabase, rowToProspect(refreshedRow), { force: true });

  return NextResponse.json({ ok: true });
}
