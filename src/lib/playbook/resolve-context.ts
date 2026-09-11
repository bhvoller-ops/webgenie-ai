import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToProspect } from "@/lib/prospect/row";
import { isSuppressed } from "@/lib/prospect/suppression";
import { evaluateChannelActivation, type ContactVerificationRecord, type ChannelActivationResult } from "@/lib/prospect/contact-verification";
import { getVerifiedManualObservations } from "@/lib/prospect/manual-evidence";
import { resolvePlaybookConfig } from "./get-config";
import type { PlaybookConfig } from "./types";
import type { Prospect, SequenceStepActionMetadata, SequenceStepChannel } from "@/lib/prospect/types";

/**
 * The ONE place that decides "is this prospect/action/enrollment/channel
 * combination actually safe to open a live playbook session for, within
 * this organization." Every field the client needs is computed here,
 * server-side, from IDs it already trusted (the session's own
 * organizationId, never anything read back from the request body/URL as
 * an authorization signal) -- see the Tenant and Role Security /
 * Contact-Safety Requirements sections of the implementation prompt.
 *
 * Every prospect, action, sequence and enrollment referenced by an id in
 * the request is re-resolved against `.eq("organization_id", organizationId)`
 * here; a guessed cross-tenant id, a mismatched prospect/action pair, or a
 * stale/completed action all resolve to an explicit blocked reason rather
 * than partial data.
 */

/**
 * Suppression deliberately is NOT one of these block reasons -- a
 * suppressed prospect still resolves ok:true (per "may display historical
 * information in a read-only state") with channels forced to
 * un-activatable so no new outreach can be enabled from it.
 */
export type PlaybookBlockReason =
  | "PROSPECT_NOT_FOUND"
  | "ACTION_NOT_FOUND"
  | "ACTION_NOT_ACTIVE"
  | "ACTION_PROSPECT_MISMATCH"
  | "ENROLLMENT_NOT_FOUND"
  | "ENROLLMENT_NOT_ACTIVE";

export interface PlaybookChannelStatus {
  call: ChannelActivationResult;
  email: ChannelActivationResult;
}

export interface PlaybookSequenceContext {
  enrollmentId: string;
  sequenceId: string;
  sequenceName: string;
  currentStepOrder: number;
  sequenceStepId: string;
  channel: SequenceStepChannel;
  instructions: string | null;
}

export interface PlaybookIntelligence {
  businessName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  suppressed: boolean;
  suppressionReason: string | null;
  verifiedObservations: string[];
  opportunitySummary: string | null;
  priorContactCount: number;
  lastContactOutcome: string | null;
  organizationName: string;
}

export interface PlaybookContext {
  ok: true;
  prospectId: string;
  actionId: string | null;
  channels: PlaybookChannelStatus;
  recommendedChannel: "CALL" | "EMAIL" | null;
  sequence: PlaybookSequenceContext | null;
  intelligence: PlaybookIntelligence;
  config: PlaybookConfig;
}

export interface PlaybookBlocked {
  ok: false;
  reason: PlaybookBlockReason;
  message: string;
}

export async function resolvePlaybookContext(
  supabase: SupabaseClient,
  organizationId: string,
  input: { prospectId: string; actionId?: string | null; enrollmentId?: string | null }
): Promise<PlaybookContext | PlaybookBlocked> {
  const { prospectId } = input;

  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (!prospectRow) return { ok: false, reason: "PROSPECT_NOT_FOUND", message: "Prospect not found." };
  const prospect = rowToProspect(prospectRow);

  let sequence: PlaybookSequenceContext | null = null;

  if (input.actionId) {
    const { data: actionRow } = await supabase
      .from("prospect_actions")
      .select("id, prospect_id, action_type, status, metadata")
      .eq("id", input.actionId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!actionRow) return { ok: false, reason: "ACTION_NOT_FOUND", message: "Action not found." };
    if (actionRow.prospect_id !== prospectId) return { ok: false, reason: "ACTION_PROSPECT_MISMATCH", message: "This action does not belong to this prospect." };
    if (actionRow.status !== "PENDING" && actionRow.status !== "SNOOZED") return { ok: false, reason: "ACTION_NOT_ACTIVE", message: "This action is no longer active." };

    if (actionRow.action_type === "SEQUENCE_STEP" && actionRow.metadata) {
      const meta = actionRow.metadata as unknown as SequenceStepActionMetadata;
      const { data: enrollmentRow } = await supabase
        .from("prospect_sequence_enrollments")
        .select("id, sequence_id, status, current_step_order")
        .eq("id", meta.enrollmentId)
        .eq("organization_id", organizationId)
        .eq("prospect_id", prospectId)
        .maybeSingle();
      if (!enrollmentRow) return { ok: false, reason: "ENROLLMENT_NOT_FOUND", message: "Sequence enrollment not found." };
      if (enrollmentRow.status !== "ACTIVE") return { ok: false, reason: "ENROLLMENT_NOT_ACTIVE", message: "This sequence is no longer active." };
      const { data: stepRow } = await supabase
        .from("outreach_sequence_steps")
        .select("id, instructions")
        .eq("id", meta.sequenceStepId)
        .eq("sequence_id", enrollmentRow.sequence_id)
        .maybeSingle();
      sequence = {
        enrollmentId: enrollmentRow.id,
        sequenceId: enrollmentRow.sequence_id,
        sequenceName: meta.sequenceName,
        currentStepOrder: enrollmentRow.current_step_order,
        sequenceStepId: meta.sequenceStepId,
        channel: meta.channel,
        instructions: stepRow?.instructions ?? null
      };
    }
  } else if (input.enrollmentId) {
    // A direct enrollment-driven open (no specific due action id) -- same
    // guard shape, resolved independently rather than trusting a client
    // claim that this enrollment belongs to this prospect/org.
    const { data: enrollmentRow } = await supabase
      .from("prospect_sequence_enrollments")
      .select("id, sequence_id, status, current_step_order")
      .eq("id", input.enrollmentId)
      .eq("organization_id", organizationId)
      .eq("prospect_id", prospectId)
      .maybeSingle();
    if (!enrollmentRow) return { ok: false, reason: "ENROLLMENT_NOT_FOUND", message: "Sequence enrollment not found." };
    if (enrollmentRow.status !== "ACTIVE") return { ok: false, reason: "ENROLLMENT_NOT_ACTIVE", message: "This sequence is no longer active." };
    const { data: stepRow } = await supabase
      .from("outreach_sequence_steps")
      .select("id, channel, instructions")
      .eq("sequence_id", enrollmentRow.sequence_id)
      .eq("step_order", enrollmentRow.current_step_order)
      .maybeSingle();
    const { data: seqRow } = await supabase.from("outreach_sequences").select("name").eq("id", enrollmentRow.sequence_id).maybeSingle();
    if (stepRow) {
      sequence = {
        enrollmentId: enrollmentRow.id,
        sequenceId: enrollmentRow.sequence_id,
        sequenceName: seqRow?.name ?? "Sequence",
        currentStepOrder: enrollmentRow.current_step_order,
        sequenceStepId: stepRow.id,
        channel: stepRow.channel as SequenceStepChannel,
        instructions: stepRow.instructions ?? null
      };
    }
  }

  const suppressed = isSuppressed(prospect);

  // Channel gating -- the EXACT same fail-closed evaluation PR #29's
  // sequence-message/pitch routes use. A suppressed prospect never gets an
  // activatable channel here regardless of what verification exists.
  let channels: PlaybookChannelStatus = {
    call: { activatable: false, reason: "no_verification" },
    email: { activatable: false, reason: "no_verification" }
  };
  if (!suppressed) {
    const { data: verificationRows } = await supabase
      .from("prospect_contact_verifications")
      .select("channel, contact_value, is_single_source")
      .eq("organization_id", organizationId)
      .eq("prospect_id", prospectId);
    const records: ContactVerificationRecord[] = (verificationRows ?? []).map((r) => ({
      channel: r.channel,
      contactValue: r.contact_value,
      isSingleSource: r.is_single_source
    }));
    channels = {
      call: evaluateChannelActivation(records, "CALL"),
      email: evaluateChannelActivation(records, "EMAIL")
    };
  }
  const recommendedChannel: "CALL" | "EMAIL" | null = channels.call.activatable ? "CALL" : channels.email.activatable ? "EMAIL" : null;

  const verifiedObservations = await getVerifiedManualObservations(supabase, organizationId, prospectId);
  const { data: briefRow } = await supabase.from("opportunity_briefs").select("summary").eq("prospect_id", prospectId).maybeSingle();

  const { count: priorContactCount } = await supabase
    .from("prospect_activities")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("prospect_id", prospectId)
    .eq("activity_type", "CONTACT_ATTEMPTED");

  const { data: lastCallLog } = await supabase.from("call_log").select("status").eq("prospect_id", prospectId).maybeSingle();

  const { data: orgBranding } = await supabase.from("org_branding").select("brand_name").eq("organization_id", organizationId).maybeSingle();
  const { data: org } = await supabase.from("organizations").select("name").eq("id", organizationId).single();
  const organizationName = orgBranding?.brand_name || org?.name || "our team";

  const config = resolvePlaybookConfig(prospect.industry);

  return {
    ok: true,
    prospectId,
    actionId: input.actionId ?? null,
    channels,
    recommendedChannel,
    sequence,
    intelligence: intelligenceFromProspect(prospect, {
      suppressed,
      verifiedObservations,
      opportunitySummary: briefRow?.summary ?? null,
      priorContactCount: priorContactCount ?? 0,
      lastContactOutcome: (lastCallLog?.status as string | undefined) ?? null,
      organizationName
    }),
    config
  };
}

function intelligenceFromProspect(
  prospect: Prospect,
  extra: {
    suppressed: boolean;
    verifiedObservations: string[];
    opportunitySummary: string | null;
    priorContactCount: number;
    lastContactOutcome: string | null;
    organizationName: string;
  }
): PlaybookIntelligence {
  return {
    businessName: prospect.businessName,
    contactName: null, // captured live in Stage 2 (gatekeeper), not fabricated here
    phone: prospect.phone ?? null,
    email: prospect.email ?? null,
    websiteUrl: prospect.websiteUrl ?? null,
    city: prospect.city ?? null,
    state: prospect.state ?? null,
    industry: prospect.industry ?? null,
    suppressed: extra.suppressed,
    suppressionReason: prospect.suppressionReason ?? null,
    verifiedObservations: extra.verifiedObservations,
    opportunitySummary: extra.opportunitySummary,
    priorContactCount: extra.priorContactCount,
    lastContactOutcome: extra.lastContactOutcome,
    organizationName: extra.organizationName
  };
}
