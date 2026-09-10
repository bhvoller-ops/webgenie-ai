import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { advanceSequenceStep } from "@/lib/prospect/sequence-sync";
import { logActivity } from "@/lib/prospect/activity";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { isSuppressed } from "@/lib/prospect/suppression";
import type { SequenceStepActionMetadata } from "@/lib/prospect/types";

/**
 * Snooze/skip/complete a single Daily Queue item (master prompt section
 * 12). Deliberately does not delete the underlying prospect or recompute
 * anything else here — completing/skipping/snoozing is purely about this
 * one queue-item row's own lifecycle; the *next* recommended action (if
 * any) gets (re)synced the next time regenerateProspectIntelligence()
 * runs for this prospect (e.g. after a real action like logging a
 * contact outcome), not invented speculatively by this route.
 */
const snoozeOptionSchema = z.enum(["tomorrow", "three_days", "one_week"]);
const schema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("complete") }),
  z.object({ op: z.literal("skip") }),
  z.object({ op: z.literal("snooze"), option: snoozeOptionSchema.optional(), until: z.string().datetime().optional() })
]);

const SNOOZE_DAYS: Record<z.infer<typeof snoozeOptionSchema>, number> = {
  tomorrow: 1,
  three_days: 3,
  one_week: 7
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: actionId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { data: actionRow } = await supabase
    .from("prospect_actions")
    .select("id, status, action_type, prospect_id, metadata")
    .eq("id", actionId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!actionRow) return NextResponse.json({ error: "Action not found." }, { status: 404 });

  // MANDATORY FIX 3: a direct request against this action must be refused
  // outright if either (a) the prospect has since been suppressed -- a
  // stale open tab must not be able to complete/skip/snooze an action that
  // suppression already withdrew -- or (b) the action itself is no longer
  // PENDING/SNOOZED (already completed/skipped/suppressed by another
  // request), the same "operate on current state, never blind" guard
  // advanceSequenceStep() already uses for sequence steps.
  if (actionRow.status !== "PENDING" && actionRow.status !== "SNOOZED") {
    return NextResponse.json({ error: "This action is no longer active." }, { status: 409 });
  }
  const { data: prospectForGuard } = await supabase.from("prospects").select("suppressed_at").eq("id", actionRow.prospect_id).eq("organization_id", organizationId).maybeSingle();
  if (isSuppressed({ suppressedAt: prospectForGuard?.suppressed_at ?? null })) {
    return NextResponse.json({ error: "This prospect is suppressed; the action can no longer be performed." }, { status: 409 });
  }

  const now = new Date().toISOString();

  if (parsed.data.op === "complete") {
    await supabase.from("prospect_actions").update({ status: "COMPLETED", completed_at: now, updated_at: now }).eq("id", actionId);
    // A completed FOLLOW_UP is only actually reconciled once the due date
    // it was generated from is cleared -- otherwise the very next
    // regenerateProspectIntelligence() call (triggered by almost any other
    // real action) recomputes the identical FOLLOW_UP from the still-set
    // call_log.follow_up_due_at and immediately resurrects it. Marking a
    // fresh follow-up date is still done through the real outcome-logging
    // flow (pitch outcome route); this only clears a due date this
    // generic "done" click has now handled.
    if (actionRow.action_type === "FOLLOW_UP") {
      await supabase.from("call_log").update({ follow_up_due_at: null, updated_at: now }).eq("prospect_id", actionRow.prospect_id).eq("organization_id", organizationId);
    }
    // P2: the generic "Mark done" checkmark on a due sequence step counts
    // as "I performed this" (a lighter-weight path than the dedicated
    // outcome-picker at /sequence-enrollments/[id]/perform, which lets the
    // user log a specific outcome AND advance in one call). This does not
    // touch call_log -- no specific outcome was declared -- only advances
    // the sequence and records that the step was handled.
    if (actionRow.action_type === "SEQUENCE_STEP" && actionRow.metadata) {
      const meta = actionRow.metadata as unknown as SequenceStepActionMetadata;
      const { data: enrollment } = await supabase
        .from("prospect_sequence_enrollments")
        .select("current_step_order")
        .eq("id", meta.enrollmentId)
        .maybeSingle();
      if (enrollment) {
        await advanceSequenceStep(supabase, {
          organizationId,
          prospectId: actionRow.prospect_id,
          enrollmentId: meta.enrollmentId,
          expectedCurrentStepOrder: enrollment.current_step_order
        });
        await logActivity(supabase, {
          organizationId,
          prospectId: actionRow.prospect_id,
          activityType: "CONTACT_ATTEMPTED",
          channel: meta.channel,
          summary: `${meta.channel} sequence step marked done from the Queue.`,
          metadata: { sequenceId: meta.sequenceId, sequenceStepId: meta.sequenceStepId, enrollmentId: meta.enrollmentId, outcome: "sent" },
          eventKey: `contact_attempted:${meta.enrollmentId}:${meta.sequenceStepId}`
        });
      }
      const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", actionRow.prospect_id).eq("organization_id", organizationId).maybeSingle();
      if (prospectRow) await regenerateProspectIntelligence(supabase, rowToProspect(prospectRow), { force: true });
    }
  } else if (parsed.data.op === "skip") {
    await supabase.from("prospect_actions").update({ status: "SKIPPED", updated_at: now }).eq("id", actionId);
  } else {
    let dueAt: string;
    if (parsed.data.until) {
      dueAt = parsed.data.until;
    } else if (parsed.data.option) {
      dueAt = new Date(Date.now() + SNOOZE_DAYS[parsed.data.option] * 86400000).toISOString();
    } else {
      return NextResponse.json({ error: "Snooze requires an option or an explicit date." }, { status: 400 });
    }
    await supabase.from("prospect_actions").update({ status: "SNOOZED", due_at: dueAt, updated_at: now }).eq("id", actionId);
  }

  return NextResponse.json({ ok: true });
}
