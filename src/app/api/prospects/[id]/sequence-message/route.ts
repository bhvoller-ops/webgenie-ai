import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { buildPitchContext } from "@/lib/prospect/pitch-context";
import { generateSequenceStepMessage } from "@/lib/prospect/sequence-messaging";
import { hasOpenAiKey } from "@/lib/ai/openai";
import type { OpportunityBrief } from "@/lib/prospect/types";

/**
 * Generates fresh sequence-step copy on demand -- deliberately not
 * persisted (see sequence-messaging.ts's own comment for why this
 * doesn't reuse the `pitches` table). Every call regenerates from the
 * current real evidence; there is no "stale saved draft" concept here.
 */
const schema = z.object({ channel: z.enum(["CALL", "EMAIL", "SMS", "LINKEDIN", "VOICEMAIL", "LOOM", "SEND_DEMO", "FOLLOW_UP", "CUSTOM_TASK"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });

  if (parsed.data.channel === "CUSTOM_TASK") {
    return NextResponse.json({ error: "Custom tasks are written by you -- there's nothing to generate." }, { status: 400 });
  }
  if (!(await hasOpenAiKey())) {
    return NextResponse.json({ error: "Message generation isn't configured yet -- no AI provider key is set." }, { status: 503 });
  }

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  const { data: briefRow } = await supabase.from("opportunity_briefs").select("*").eq("prospect_id", prospectId).maybeSingle();
  const brief: OpportunityBrief | null = briefRow
    ? {
        id: briefRow.id,
        prospectId: briefRow.prospect_id,
        version: briefRow.version,
        opportunityLevel: briefRow.opportunity_level,
        summary: briefRow.summary,
        reasonsToContact: briefRow.reasons_to_contact ?? [],
        topFindings: briefRow.top_findings ?? [],
        recommendedOffer: briefRow.recommended_offer,
        recommendedOfferReason: briefRow.recommended_offer_reason,
        secondaryOpportunities: briefRow.secondary_opportunities ?? [],
        salesAngle: briefRow.sales_angle,
        suggestedOpener: briefRow.suggested_opener,
        confidence: briefRow.confidence,
        evidenceReferences: briefRow.evidence_references ?? [],
        inputFingerprint: briefRow.input_fingerprint,
        generatedAt: briefRow.generated_at
      }
    : null;

  // Real, already-recorded interactions only -- never fabricated. Grounds
  // the "may refer to previous contact only if actually performed" rule.
  const { data: priorActivities } = await supabase
    .from("prospect_activities")
    .select("summary")
    .eq("prospect_id", prospectId)
    .eq("activity_type", "CONTACT_ATTEMPTED")
    .order("occurred_at", { ascending: false })
    .limit(5);
  const priorInteractions = (priorActivities ?? []).map((a) => a.summary as string);

  const { data: orgBranding } = await supabase.from("org_branding").select("brand_name").eq("organization_id", organizationId).maybeSingle();
  const { data: org } = await supabase.from("organizations").select("name").eq("id", organizationId).single();
  const agencyName = orgBranding?.brand_name || org?.name || "our team";

  const context = buildPitchContext(prospect, brief, Boolean(prospect.projectId && briefRow), agencyName, priorInteractions);
  const generated = await generateSequenceStepMessage(parsed.data.channel, context, agencyName);
  if (!generated) return NextResponse.json({ error: "Message generation failed -- try again in a moment." }, { status: 502 });

  return NextResponse.json({ message: generated });
}
