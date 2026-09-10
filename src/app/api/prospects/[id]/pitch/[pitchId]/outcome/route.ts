import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { logActivity } from "@/lib/prospect/activity";
import { PITCH_CHANNEL_LABELS } from "@/lib/prospect/types";

/**
 * "Mark as used" + contact-outcome logging + optional follow-up creation
 * (master prompt sections 24-26) — the loop-closer: Pitch used -> outcome
 * -> follow-up -> Queue. Reuses call_log (migration 012, widened in 036)
 * exactly as-is rather than a second outcome/status system — the same
 * table next-best-action.ts and action-generation.ts already read.
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
  followUp: z.object({ option: snoozeOptionSchema.optional(), until: z.string().datetime().optional() }).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string; pitchId: string }> }) {
  const { id: prospectId, pitchId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid outcome." }, { status: 400 });

  const { data: pitchRow } = await supabase
    .from("pitches")
    .select("id, channel")
    .eq("id", pitchId)
    .eq("prospect_id", prospectId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!pitchRow) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  const now = new Date().toISOString();
  const status = OUTCOME_TO_STATUS[parsed.data.outcome];

  let followUpDueAt: string | null = null;
  if (parsed.data.followUp) {
    followUpDueAt = parsed.data.followUp.until ?? new Date(Date.now() + FOLLOW_UP_DAYS[parsed.data.followUp.option ?? "three_days"] * 86400000).toISOString();
  }

  await supabase.from("pitches").update({ status: "used", used_at: now, updated_at: now }).eq("id", pitchId);

  const { data: existingCallLog } = await supabase.from("call_log").select("id").eq("prospect_id", prospectId).maybeSingle();
  if (existingCallLog) {
    await supabase
      .from("call_log")
      .update({ status, last_contacted_at: now, follow_up_due_at: followUpDueAt, updated_at: now })
      .eq("id", existingCallLog.id);
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
    channel: pitchRow.channel,
    summary: `${PITCH_CHANNEL_LABELS[pitchRow.channel as keyof typeof PITCH_CHANNEL_LABELS]} outcome logged: ${parsed.data.outcome.replace(/_/g, " ")}.`,
    createdBy: user.id
  });
  if (followUpDueAt) {
    await logActivity(supabase, {
      organizationId,
      prospectId,
      activityType: "FOLLOW_UP_SCHEDULED",
      summary: `Follow-up scheduled for ${new Date(followUpDueAt).toLocaleDateString()}.`,
      createdBy: user.id
    });
  }

  // Refresh Brief/NBA/queue against the just-logged outcome, same choke
  // point every other real state change already goes through.
  const { data: refreshedRow } = await supabase.from("prospects").select("*").eq("id", prospectId).single();
  if (refreshedRow) {
    await regenerateProspectIntelligence(supabase, rowToProspect(refreshedRow), { force: true });
  }

  return NextResponse.json({ ok: true });
}
