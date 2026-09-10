import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";

/**
 * Editing a pitch (master prompt section 23): the user can rewrite the
 * generated copy freely. Editing must NOT alter the underlying evidence
 * — this route only ever touches subject/body on the pitches row itself,
 * never opportunity_briefs or any prospect field. source_fingerprint is
 * deliberately left untouched by an edit (it still reflects the real
 * evidence the AI generation was grounded in; a manual edit doesn't
 * change what evidence exists).
 */
const schema = z.object({ subject: z.string().max(200).nullable().optional(), body: z.string().min(1).max(4000) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; pitchId: string }> }) {
  const { id: prospectId, pitchId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid pitch content." }, { status: 400 });

  const { data: pitchRow } = await supabase
    .from("pitches")
    .select("id")
    .eq("id", pitchId)
    .eq("prospect_id", prospectId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!pitchRow) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("pitches")
    .update({ subject: parsed.data.subject ?? null, body: parsed.data.body, updated_at: new Date().toISOString() })
    .eq("id", pitchId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pitch: data });
}
