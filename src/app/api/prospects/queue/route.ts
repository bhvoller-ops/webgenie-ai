import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { sortQueueActions, isActionDueNow } from "@/lib/prospect/queue";
import { PROSPECT_ACTION_LABELS, type OpportunityLevel, type ProspectActionType, type ActionPriority, type SequenceStepActionMetadata } from "@/lib/prospect/types";
import { evaluateChannelActivation, type ContactVerificationRecord } from "@/lib/prospect/contact-verification";
import { describeBriefSummary } from "@/lib/prospect/evidence-readiness";

/**
 * UI clarity correction -- evidence-display consistency fix. The stored
 * opportunity_briefs.summary for a "has a website, no audit yet" prospect
 * is always the literal sentence produced by
 * lib/prospect/opportunity-brief.ts's hasWebsiteNoAuditBrief() --
 * regardless of whether a real, approved verified outreach observation
 * exists for that prospect (migration 041's
 * prospect_evidence_observations, already the source the Playbook itself
 * reads via getVerifiedManualObservations()). describeBriefSummary()
 * detects that EXACT known sentence and swaps in the truthful
 * verified_observation copy -- a read-time presentation override, never a
 * rewrite of the persisted brief. See evidence-readiness.ts's file header.
 *
 * OWNER-REVIEW CORRECTION: this route now also exposes `hasVerifiedObservation`
 * and a REAL `verifiedChannel` (derived from evaluateChannelActivation()
 * against actual prospect_contact_verifications rows, not the looser
 * `playbookChannel` hint used for routing) so the client can render the
 * same single, non-contradictory readiness badge Prospect Detail and the
 * Playbook use.
 */

/**
 * The P1 Daily Prospecting Queue's data source — GET only, read-only.
 * Joins the persisted prospect_actions (this org's active queue items)
 * with each prospect's own summary fields and current Opportunity Brief,
 * then orders with the same deterministic scoring the queue always uses
 * (lib/prospect/queue.ts) — never a second, inconsistent sort here.
 */
export interface QueueItem {
  actionId: string;
  prospectId: string;
  businessName: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  opportunityLevel: OpportunityLevel | null;
  actionType: ProspectActionType;
  actionLabel: string;
  priority: ActionPriority;
  reason: string;
  dueAt: string | null;
  status: "PENDING" | "SNOOZED";
  evidenceSummary: string | null;
  /** True when an approved, human-verified outreach observation exists for this prospect (migration 041). */
  hasVerifiedObservation: boolean;
  /**
   * A REAL, verified contact channel for this prospect (evaluateChannelActivation()
   * against actual prospect_contact_verifications rows) -- distinct from
   * `playbookChannel` below, which is only a routing hint and may not yet
   * be confirmed for a CONTACT action. Used only for the evidence-readiness
   * badge/note, never for routing.
   */
  verifiedChannel: "CALL" | "EMAIL" | null;
  /**
   * Home Services Live Outreach Playbook: the channel a CONTACT (unset) or
   * SEQUENCE_STEP (from its own metadata) action is for, plus the
   * enrollmentId a SEQUENCE_STEP action needs to open its live session
   * against the right enrollment. Null for action types the playbook
   * doesn't apply to (RUN_AUDIT, SEND_DEMO, ...). Nothing here is an
   * internal id meant to be *displayed* -- only used programmatically by
   * the "Open Playbook" link.
   */
  playbookChannel: "CALL" | "EMAIL" | null;
  enrollmentId: string | null;
}

export interface QueueSummary {
  newToReview: number;
  readyToContact: number;
  followUpsDue: number;
  demosReady: number;
  meetingsScheduled: number;
}

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: actionRows } = await supabase
    .from("prospect_actions")
    .select("id, prospect_id, action_type, priority, reason, due_at, status, metadata, prospects(business_name, industry, city, state, suppressed_at)")
    .eq("organization_id", organizationId)
    .in("status", ["PENDING", "SNOOZED"]);

  // MANDATORY FIX 3, defense-in-depth: suppression already transitions any
  // existing action to status='SUPPRESSED' (lib/prospect/suppression.ts),
  // so this filter should never actually remove anything in practice --
  // it exists so "a suppressed prospect never appears in the Daily Queue"
  // is a guarantee of this query itself, not solely a consequence of every
  // write path remembering to update the row correctly.
  const nonSuppressedRows = (actionRows ?? []).filter((r) => {
    const prospectJoin = r.prospects as unknown as { suppressed_at: string | null } | null;
    return !prospectJoin?.suppressed_at;
  });

  const prospectIds = nonSuppressedRows.map((r) => r.prospect_id);
  const briefByProspectId = new Map<string, { opportunity_level: OpportunityLevel; summary: string }>();
  const verifiedObservationProspectIds = new Set<string>();
  const verificationRecordsByProspectId = new Map<string, ContactVerificationRecord[]>();
  if (prospectIds.length > 0) {
    const { data: briefs } = await supabase
      .from("opportunity_briefs")
      .select("prospect_id, opportunity_level, summary")
      .in("prospect_id", prospectIds);
    for (const b of briefs ?? []) {
      briefByProspectId.set(b.prospect_id as string, { opportunity_level: b.opportunity_level as OpportunityLevel, summary: b.summary as string });
    }

    const { data: observationRows } = await supabase
      .from("prospect_evidence_observations")
      .select("prospect_id")
      .eq("organization_id", organizationId)
      .in("prospect_id", prospectIds)
      .in("evidence_state", ["VERIFIED_PRESENT", "VERIFIED_ABSENT"]);
    for (const row of observationRows ?? []) verifiedObservationProspectIds.add(row.prospect_id as string);

    const { data: verificationRows } = await supabase
      .from("prospect_contact_verifications")
      .select("prospect_id, channel, contact_value, is_single_source")
      .eq("organization_id", organizationId)
      .in("prospect_id", prospectIds);
    for (const row of verificationRows ?? []) {
      const list = verificationRecordsByProspectId.get(row.prospect_id as string) ?? [];
      list.push({ channel: row.channel as "CALL" | "EMAIL", contactValue: row.contact_value as string, isSingleSource: row.is_single_source as boolean });
      verificationRecordsByProspectId.set(row.prospect_id as string, list);
    }
  }

  const now = new Date();
  const allItems: QueueItem[] = nonSuppressedRows.map((r) => {
    const prospectJoin = r.prospects as unknown as { business_name: string; industry: string | null; city: string | null; state: string | null } | null;
    const brief = briefByProspectId.get(r.prospect_id as string);
    const hasVerifiedObservation = verifiedObservationProspectIds.has(r.prospect_id as string);
    const evidenceSummary = describeBriefSummary(brief?.summary ?? null, hasVerifiedObservation);
    const records = verificationRecordsByProspectId.get(r.prospect_id as string) ?? [];
    const verifiedChannel = evaluateChannelActivation(records, "CALL").activatable
      ? "CALL"
      : evaluateChannelActivation(records, "EMAIL").activatable
        ? "EMAIL"
        : null;
    const actionType = r.action_type as ProspectActionType;
    let playbookChannel: "CALL" | "EMAIL" | null = null;
    let enrollmentId: string | null = null;
    if (actionType === "SEQUENCE_STEP" && r.metadata) {
      const meta = r.metadata as unknown as SequenceStepActionMetadata;
      if (meta.channel === "CALL" || meta.channel === "EMAIL") playbookChannel = meta.channel;
      enrollmentId = meta.enrollmentId ?? null;
    } else if (actionType === "CONTACT") {
      // Actual channel resolved server-side by the playbook itself (real
      // verified-contact evaluation, not guessed here) once opened.
      playbookChannel = "CALL";
    }
    return {
      actionId: r.id as string,
      prospectId: r.prospect_id as string,
      businessName: prospectJoin?.business_name ?? "Unknown business",
      industry: prospectJoin?.industry ?? null,
      city: prospectJoin?.city ?? null,
      state: prospectJoin?.state ?? null,
      opportunityLevel: brief?.opportunity_level ?? null,
      actionType,
      actionLabel: PROSPECT_ACTION_LABELS[actionType],
      priority: r.priority as ActionPriority,
      reason: r.reason as string,
      dueAt: r.due_at as string | null,
      status: r.status as "PENDING" | "SNOOZED",
      evidenceSummary,
      hasVerifiedObservation,
      verifiedChannel,
      playbookChannel,
      enrollmentId
    };
  });

  // Only items that are actually actionable today drive the queue itself
  // (a SNOOZED item not yet due stays hidden until it is) — matches
  // section 12: "Snoozed action disappears until due."
  const dueItems = allItems.filter((item) => item.status === "PENDING" || isActionDueNow({ dueAt: item.dueAt }, now));
  const sorted = sortQueueActions(
    dueItems.map((item) => ({ ...item, createdAt: now.toISOString() })),
    now
  );

  const { count: meetingsScheduled } = await supabase
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "meeting");

  const summary: QueueSummary = {
    newToReview: dueItems.filter((i) => i.actionType === "REVIEW_PROSPECT" || i.actionType === "IMPORT_GMB_DATA").length,
    readyToContact: dueItems.filter((i) => i.actionType === "CONTACT").length,
    followUpsDue: dueItems.filter((i) => i.actionType === "FOLLOW_UP").length,
    demosReady: dueItems.filter((i) => i.actionType === "SEND_DEMO").length,
    meetingsScheduled: meetingsScheduled ?? 0
  };

  return NextResponse.json({ items: sorted, summary });
}
