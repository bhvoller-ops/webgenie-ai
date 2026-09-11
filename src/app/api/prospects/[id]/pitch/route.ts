import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { buildPitchContext } from "@/lib/prospect/pitch-context";
import { generatePitch, computePitchSourceFingerprint } from "@/lib/prospect/pitch-generation";
import { hasOpenAiKey } from "@/lib/ai/openai";
import { logActivity } from "@/lib/prospect/activity";
import { PITCH_CHANNEL_LABELS } from "@/lib/prospect/types";
import type { OpportunityBrief, PitchChannel } from "@/lib/prospect/types";
import { getVerifiedManualObservations } from "@/lib/prospect/manual-evidence";
import { evaluateChannelActivation, type ContactVerificationRecord } from "@/lib/prospect/contact-verification";
import { isSuppressed } from "@/lib/prospect/suppression";

/**
 * The Pitch Generator's persistence (master prompt sections 14-24). One
 * row per (prospect, channel) — generating again for the same channel
 * updates that row in place (version bump) rather than accumulating
 * rows, matching section 47's idempotency requirement.
 */
const schema = z.object({ channel: z.enum(["call_opener", "cold_email", "sms", "linkedin", "voicemail", "loom_intro"]) });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*")
    .eq("prospect_id", prospectId)
    .eq("organization_id", organizationId);

  return NextResponse.json({ pitches: pitches ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });
  const channel: PitchChannel = parsed.data.channel;

  if (!(await hasOpenAiKey())) {
    return NextResponse.json({ error: "Pitch generation isn't configured yet — no AI provider key is set." }, { status: 503 });
  }

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  // Hotfix (2026-09-11, docs/history.md): suppression must override every
  // generation path -- this route had no suppression check before this
  // hotfix, same gap as /sequence-message.
  if (isSuppressed(prospect)) {
    return NextResponse.json({ error: "This prospect is suppressed; pitch generation is not available." }, { status: 409 });
  }

  // Hotfix (2026-09-11, docs/history.md): same guard as /sequence-message --
  // prefer structured prospect_contact_verifications (migration 041,
  // conflict-aware) when any exist for this prospect; fall back to the
  // simple prospects.email check otherwise.
  if (channel === "cold_email" || channel === "call_opener") {
    const mappedChannel = channel === "cold_email" ? "EMAIL" : "CALL";
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
      const result = evaluateChannelActivation(records, mappedChannel);
      if (!result.activatable) {
        const reasonText = result.reason === "conflicting_sources"
          ? "Conflicting verified sources for this channel -- resolve before generating copy."
          : `No verified ${mappedChannel === "EMAIL" ? "email" : "phone"} on file for this prospect.`;
        return NextResponse.json({ error: reasonText }, { status: 400 });
      }
    } else if (channel === "cold_email" && !prospect.email) {
      return NextResponse.json(
        { error: "No verified email on file for this prospect -- a cold email pitch cannot be generated until one is confirmed. Use call_opener instead." },
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

  const { data: orgBranding } = await supabase.from("org_branding").select("brand_name").eq("organization_id", organizationId).maybeSingle();
  const { data: org } = await supabase.from("organizations").select("name").eq("id", organizationId).single();
  const agencyName = orgBranding?.brand_name || org?.name || "our team";

  const manualObservations = await getVerifiedManualObservations(supabase, organizationId, prospectId);
  const pitchContext = buildPitchContext(prospect, brief, Boolean(prospect.projectId && briefRow), agencyName, [], manualObservations);
  const fingerprint = computePitchSourceFingerprint(pitchContext);

  const generated = await generatePitch(channel, pitchContext, agencyName);
  if (!generated) {
    return NextResponse.json({ error: "Pitch generation failed — try again in a moment." }, { status: 502 });
  }

  const { data: existing } = await supabase.from("pitches").select("id, version").eq("prospect_id", prospectId).eq("channel", channel).maybeSingle();

  const now = new Date().toISOString();
  let pitchRow;
  if (existing) {
    const { data, error: updateError } = await supabase
      .from("pitches")
      .update({
        subject: generated.subject,
        body: generated.body,
        source_fingerprint: fingerprint,
        version: existing.version + 1,
        status: "draft",
        used_at: null,
        updated_at: now
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updateError || !data) return NextResponse.json({ error: updateError?.message ?? "Unable to save the regenerated pitch." }, { status: 500 });
    pitchRow = data;
  } else {
    const { data, error: insertError } = await supabase
      .from("pitches")
      .insert({
        organization_id: organizationId,
        prospect_id: prospectId,
        channel,
        subject: generated.subject,
        body: generated.body,
        source_fingerprint: fingerprint,
        version: 1,
        status: "draft"
      })
      .select("*")
      .single();
    if (insertError || !data) return NextResponse.json({ error: insertError?.message ?? "Unable to save the generated pitch." }, { status: 500 });
    pitchRow = data;
  }

  await logActivity(supabase, {
    organizationId,
    prospectId,
    activityType: "PITCH_GENERATED",
    channel,
    summary: `${existing ? "Regenerated" : "Generated"} a ${PITCH_CHANNEL_LABELS[channel]} pitch.`,
    createdBy: user.id
  });

  return NextResponse.json({ pitch: pitchRow });
}
