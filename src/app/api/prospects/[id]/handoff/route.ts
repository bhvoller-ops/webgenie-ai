import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToHandoff } from "@/lib/prospect/handoff";

/**
 * P2 Won Client Handoff (master prompt Architecture Decision 12). One row
 * per prospect, created lazily here on first PATCH -- never automatically
 * because prospects.status = 'won'. recommendedOffer (opportunity_briefs)
 * and agreedScope (this table) are structurally separate columns on
 * separate tables; nothing in this file or anywhere else ever copies one
 * into the other. `confirm: true` is the one explicit, deliberate action
 * that sets confirmedAt/confirmedBy/status='ready' -- draft fields can be
 * edited freely without it, but confirmation is never implicit.
 */
const patchSchema = z.object({
  agreedScope: z.string().trim().max(4000).nullable().optional(),
  agreedPrice: z.number().min(0).nullable().optional(),
  approvedDemoReference: z.string().trim().max(2000).nullable().optional(),
  implementationNotes: z.string().trim().max(4000).nullable().optional(),
  confirm: z.boolean().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: prospect } = await supabase.from("prospects").select("id, status, project_id, business_name, phone, demo_url").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospect) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });

  const { data: handoffRow } = await supabase.from("prospect_handoffs").select("*").eq("prospect_id", prospectId).maybeSingle();
  const { data: brief } = await supabase.from("opportunity_briefs").select("recommended_offer, recommended_offer_reason, top_findings").eq("prospect_id", prospectId).maybeSingle();

  return NextResponse.json({
    handoff: handoffRow ? rowToHandoff(handoffRow) : null,
    hasProject: Boolean(prospect.project_id),
    recommendedOffer: brief?.recommended_offer ?? null,
    recommendedOfferReason: brief?.recommended_offer_reason ?? null,
    topFindings: brief?.top_findings ?? []
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const { data: prospect } = await supabase.from("prospects").select("id").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospect) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update." }, { status: 400 });

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (parsed.data.agreedScope !== undefined) patch.agreed_scope = parsed.data.agreedScope;
  if (parsed.data.agreedPrice !== undefined) patch.agreed_price = parsed.data.agreedPrice;
  if (parsed.data.approvedDemoReference !== undefined) patch.approved_demo_reference = parsed.data.approvedDemoReference;
  if (parsed.data.implementationNotes !== undefined) patch.implementation_notes = parsed.data.implementationNotes;
  if (parsed.data.confirm) {
    patch.status = "ready";
    patch.confirmed_at = now;
    patch.confirmed_by = user.id;
  } else if (Object.keys(patch).length > 1) {
    patch.status = "in_progress";
  }

  const { data: updated, error } = await supabase
    .from("prospect_handoffs")
    .upsert({ prospect_id: prospectId, ...patch }, { onConflict: "prospect_id" })
    .select("*")
    .single();
  if (error || !updated) return NextResponse.json({ error: error?.message ?? "Unable to save handoff." }, { status: 500 });

  return NextResponse.json({ handoff: rowToHandoff(updated) });
}
