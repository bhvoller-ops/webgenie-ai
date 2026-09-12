import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { isSuppressed } from "@/lib/prospect/suppression";
import { upsertCallbackAction } from "@/lib/prospect/operational-followup";

/**
 * WEBGENIE PR #30 operational follow-through correction. "Callback
 * scheduled" produces a real, structured, due-dated prospect_action
 * (action_type FOLLOW_UP, status SNOOZED) instead of a generic
 * REVIEW_REPLY with the date buried in a note. See
 * lib/prospect/operational-followup.ts for the exact reasoning and the
 * DB unique-index-respecting upsert this calls into.
 */
const schema = z.object({
  dueAt: z.string().datetime(),
  purpose: z.string().trim().min(1).max(2000)
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

  // Suppression must override and block a new callback exactly as it
  // already overrides every other new outreach commitment.
  if (isSuppressed(prospect)) {
    return NextResponse.json({ error: "This prospect is suppressed; a callback cannot be scheduled." }, { status: 409 });
  }

  // A callback can't be scheduled in the past -- the whole point is a
  // real future (or, at the earliest, right-now) commitment.
  if (new Date(parsed.data.dueAt).getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Callback date/time must not be in the past." }, { status: 400 });
  }

  const result = await upsertCallbackAction(supabase, {
    organizationId,
    prospectId,
    dueAt: parsed.data.dueAt,
    purpose: parsed.data.purpose
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
