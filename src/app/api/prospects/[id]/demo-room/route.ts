import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { buildClientSafeFindings, buildWhatWedImprove } from "@/lib/prospect/demo-room-content";
import { logActivity } from "@/lib/prospect/activity";
import type { OpportunityBrief } from "@/lib/prospect/types";
import { SITE_ORIGIN } from "@/lib/site-url";

/**
 * Create-or-get the client-facing Demo Room for a prospect (master
 * prompt sections 27-36). Idempotent by design — demo_rooms.prospect_id
 * is unique (migration 036), so calling this twice returns the same
 * room rather than creating a second one (section 47).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: room } = await supabase.from("demo_rooms").select("*").eq("prospect_id", prospectId).eq("organization_id", organizationId).maybeSingle();
  return NextResponse.json({ demoRoom: room ?? null });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: existing } = await supabase.from("demo_rooms").select("*").eq("prospect_id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (existing) {
    return NextResponse.json({ demoRoom: existing });
  }

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  if (!prospect.demoUrl) {
    return NextResponse.json({ error: "Build a demo first — there's nothing to present yet." }, { status: 400 });
  }

  const { data: briefRow } = await supabase.from("opportunity_briefs").select("*").eq("prospect_id", prospectId).maybeSingle();
  const brief: OpportunityBrief | null = briefRow
    ? {
        id: briefRow.id, prospectId: briefRow.prospect_id, version: briefRow.version, opportunityLevel: briefRow.opportunity_level,
        summary: briefRow.summary, reasonsToContact: briefRow.reasons_to_contact ?? [], topFindings: briefRow.top_findings ?? [],
        recommendedOffer: briefRow.recommended_offer, recommendedOfferReason: briefRow.recommended_offer_reason,
        secondaryOpportunities: briefRow.secondary_opportunities ?? [], salesAngle: briefRow.sales_angle, suggestedOpener: briefRow.suggested_opener,
        confidence: briefRow.confidence, evidenceReferences: briefRow.evidence_references ?? [], inputFingerprint: briefRow.input_fingerprint, generatedAt: briefRow.generated_at
      }
    : null;

  const findings = buildClientSafeFindings(prospect, brief, Boolean(prospect.projectId));
  const improvements = buildWhatWedImprove(prospect.hasWebsite);

  const { data: room, error } = await supabase
    .from("demo_rooms")
    .insert({
      organization_id: organizationId,
      prospect_id: prospectId,
      project_id: prospect.projectId ?? null,
      status: "ready",
      title: prospect.businessName,
      client_safe_findings: [...findings, ...improvements.map((detail) => ({ label: "What we'd improve", detail }))],
      cta_label: "Let's walk through this"
    })
    .select("*")
    .single();
  if (error || !room) return NextResponse.json({ error: error?.message ?? "Unable to create demo room." }, { status: 500 });

  return NextResponse.json({ demoRoom: room, publicUrl: `${SITE_ORIGIN}/demo/${room.public_token}` });
}

/**
 * Marks the room as actually shared with the client — triggered by the
 * "Copy Demo Link" action in the UI, the real moment section 13's
 * DEMO_ROOM_SHARED activity refers to (not mere creation, which happens
 * silently the first time a Demo Room is opened internally).
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const { data: room } = await supabase.from("demo_rooms").select("id, status").eq("prospect_id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!room) return NextResponse.json({ error: "Demo Room not found." }, { status: 404 });

  if (room.status !== "shared") {
    await supabase.from("demo_rooms").update({ status: "shared", updated_at: new Date().toISOString() }).eq("id", room.id);
    await logActivity(supabase, { organizationId, prospectId, activityType: "DEMO_ROOM_SHARED", summary: "Demo Room link shared.", createdBy: user.id });
  }

  return NextResponse.json({ ok: true });
}
