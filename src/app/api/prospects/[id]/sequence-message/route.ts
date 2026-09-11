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

  // Hotfix (2026-09-11, docs/history.md): FAIL CLOSED, not fail open.
  // The prior version of this guard fell back to the legacy
  // prospects.email check whenever prospect_contact_verifications had no
  // rows -- but "the table has no rows for this prospect" and "the table
  // doesn't exist yet" both hit that same code path, silently letting
  // unverified legacy data authorize a channel exactly once the
  // structured verification system existed to prevent that. Two
  // genuinely distinct cases, handled distinctly:
  //   - table missing (pre-migration transition window): a controlled
  //     compatibility block, explicit about why, never a legacy fallback.
  //   - table exists, zero/conflicting rows for this prospect+channel:
  //     the normal "not verified" block -- evaluateChannelActivation()
  //     alone decides, prospects.email/phone is never consulted here again.
  if (parsed.data.channel === "EMAIL" || parsed.data.channel === "CALL") {
    const { data: verificationRows, error: verificationError } = await supabase
      .from("prospect_contact_verifications")
      .select("channel, contact_value, is_single_source")
      .eq("organization_id", organizationId)
      .eq("prospect_id", prospectId);

    if (verificationError) {
      return NextResponse.json(
        {
          error:
            "Contact-verification system unavailable (migration 041 not yet applied) -- channel activation is fail-closed during this transition, not falling back to unverified legacy contact data.",
          code: "VERIFICATION_SYSTEM_UNAVAILABLE"
        },
        { status: 503 }
      );
    }

    const records: ContactVerificationRecord[] = (verificationRows ?? []).map((r) => ({
      channel: r.channel,
      contactValue: r.contact_value,
      isSingleSource: r.is_single_source
    }));
    const result = evaluateChannelActivation(records, parsed.data.channel);
    if (!result.activatable) {
      const reasonText = result.reason === "conflicting_sources"
        ? "Conflicting verified sources for this channel -- resolve before generating copy."
        : `No verified ${parsed.data.channel === "EMAIL" ? "email" : "phone"} on file for this prospect.`;
      return NextResponse.json({ error: reasonText }, { status: 400 });
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
