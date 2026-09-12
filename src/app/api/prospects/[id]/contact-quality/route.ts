import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { logContactQualityEvent } from "@/lib/prospect/contact-quality";

/**
 * WEBGENIE PR #30 operational follow-through correction. Persists wrong
 * contact / invalid number / disputed contact information as real,
 * structured operational history -- never coerced into not_interested,
 * no_answer, or any status implying engagement/conversion/opt-out. See
 * lib/prospect/contact-quality.ts for the full reasoning: this never
 * touches call_log status, never marks the prospect uninterested, and
 * only ever blocks the ONE disputed channel via PR #29's existing
 * fail-closed contact-verification conflict detection, not a new
 * suppression or blocking mechanism.
 */
const schema = z.object({
  channel: z.enum(["CALL", "EMAIL"]),
  issueType: z.enum(["wrong_contact", "invalid_number", "disputed_info"]),
  observedValue: z.string().trim().max(500).optional(),
  note: z.string().trim().max(2000).optional(),
  actionId: z.string().uuid().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  const { data: prospectRow } = await supabase.from("prospects").select("id").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });

  // Deliberately no suppression check here -- Phase 4's own rule: "Do not
  // automatically suppress the entire prospect unless the person
  // explicitly requests no contact." A contact-quality issue is never
  // itself a suppression trigger, and a prospect who's already suppressed
  // can still have this history recorded (it's read-only history from
  // that point on regardless).

  await logContactQualityEvent(supabase, {
    organizationId,
    prospectId,
    channel: parsed.data.channel,
    issueType: parsed.data.issueType,
    observedValue: parsed.data.observedValue,
    note: parsed.data.note,
    actionId: parsed.data.actionId,
    createdBy: user.id
  });

  return NextResponse.json({ ok: true });
}
