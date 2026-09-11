import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { buildPitchContext } from "@/lib/prospect/pitch-context";
import { generateSequenceStepMessage } from "@/lib/prospect/sequence-messaging";
import { hasOpenAiKey } from "@/lib/ai/openai";
import type { OpportunityBrief } from "@/lib/prospect/types";
import { getVerifiedManualObservations } from "@/lib/prospect/manual-evidence";
import { evaluateChannelActivation, type ContactVerificationRecord } from "@/lib/prospect/contact-verification";
import { isSuppressed } from "@/lib/prospect/suppression";

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

  // Hotfix (2026-09-11, docs/history.md): suppression must override every
  // generation path, not only the action-performance ones -- this route
  // had no suppression check at all before this hotfix.
  if (isSuppressed(prospect)) {
    return NextResponse.json({ error: "This prospect is suppressed; message generation is not available." }, { status: 409 });
  }

  // Hotfix (2026-09-11, docs/history.md): a real production batch generated
  // five EMAIL-channel drafts with no verified email on any of the five
  // prospects, and separately used a single-source Google Places phone
  // number for Georgia Roof Advisors that conflicted with the number the
  // business actually publishes. Two layers: prefer the structured
  // prospect_contact_verifications records (migration 041, conflict-aware)
  // when any exist; fall back to the simple prospects.email check
  // (already live-safe today) when the table has no rows for this
  // prospect yet -- e.g. before the migration is applied, or before
  // anyone has recorded a verification for it.
  if (parsed.data.channel === "EMAIL" || parsed.data.channel === "CALL") {
    // Supabase resolves a "relation does not exist" query as { data: null,
    // error: {...} } rather than rejecting -- checking `error` (not
    // catching a throw) is what actually makes this safe to call before
    // migration 041 is applied.
    const { data: verificationRows, error: verificationError } = await supabase
      .from("prospect_contact_verifications")
      .select("channel, contact_value, is_single_source")
      .eq("organization_id", organizationId)
      .eq("prospect_id", prospectId);
    const records: ContactVerificationRecord[] = verificationError ? [] : (verificationRows ?? []).map((r) => ({
      channel: r.channel,
      contactValue: r.contact_value,
      isSingleSource: r.is_single_source
    }));

    if (records.length > 0) {
      const result = evaluateChannelActivation(records, parsed.data.channel);
      if (!result.activatable) {
        const reasonText = result.reason === "conflicting_sources"
          ? "Conflicting verified sources for this channel -- resolve before generating copy."
          : `No verified ${parsed.data.channel === "EMAIL" ? "email" : "phone"} on file for this prospect.`;
        return NextResponse.json({ error: reasonText }, { status: 400 });
      }
    } else if (parsed.data.channel === "EMAIL" && !prospect.email) {
      return NextResponse.json(
        { error: "No verified email on file for this prospect -- EMAIL copy cannot be generated until one is confirmed. Use CALL instead." },
        { status: 400 }
      );
    }
  }

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

  const manualObservations = await getVerifiedManualObservations(supabase, organizationId, prospectId);
  const context = buildPitchContext(prospect, brief, Boolean(prospect.projectId && briefRow), agencyName, priorInteractions, manualObservations);
  const generated = await generateSequenceStepMessage(parsed.data.channel, context, agencyName);
  if (!generated) return NextResponse.json({ error: "Message generation failed -- try again in a moment." }, { status: 502 });

  return NextResponse.json({ message: generated });
}
