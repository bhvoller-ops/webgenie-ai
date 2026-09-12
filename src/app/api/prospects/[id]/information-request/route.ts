import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { isSuppressed } from "@/lib/prospect/suppression";
import { upsertInformationRequestAction } from "@/lib/prospect/operational-followup";

/**
 * WEBGENIE PR #30 operational follow-through correction. "Information
 * requested" produces a real, structured prospect_action (action_type
 * REVIEW_REPLY -- a genuine reply occurred, so this label stays honest;
 * status PENDING, immediately actionable) that explicitly says what to
 * send and how, instead of a generic reply-review with the promise
 * buried in a note. Never marks the information as sent -- that only
 * happens when the human later completes this action explicitly via the
 * existing /api/prospect-actions/{id} {op:"complete"} operation.
 */
const schema = z.object({
  requestedInfo: z.string().trim().min(1).max(2000),
  channel: z.enum(["CALL", "EMAIL"]),
  promisedTiming: z.string().trim().max(200).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  if (isSuppressed(prospect)) {
    return NextResponse.json({ error: "This prospect is suppressed; an information-delivery action cannot be created." }, { status: 409 });
  }

  const result = await upsertInformationRequestAction(supabase, {
    organizationId,
    prospectId,
    requestedInfo: parsed.data.requestedInfo,
    channel: parsed.data.channel,
    promisedTiming: parsed.data.promisedTiming
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
