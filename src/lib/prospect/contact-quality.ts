import type { SupabaseClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/prospect/activity";

/**
 * WEBGENIE PR #30 operational follow-through correction — wrong contact,
 * invalid number, and disputed contact information persisted as real,
 * structured operational history, never coerced into not_interested /
 * no_answer / any engagement-implying status.
 *
 * Uses ONLY existing structures, no migration:
 * - activity_type stays the existing, neutral, truthful 'CONTACT_ATTEMPTED'
 *   (an attempt to use the channel genuinely was made) -- the specific
 *   issue lives entirely in metadata.kind/issueType, an explicit
 *   structured key, never something recovered later by parsing `summary`.
 *   insights-query.ts's countGenuineOutreachAttempts() explicitly
 *   excludes metadata.kind === "contact_quality_issue" rows from the
 *   outreachPerformed metric -- these are real attempts, not counted as
 *   outreach *performance*.
 * - Idempotency reuses the existing event_key mechanism (migration 038,
 *   an atomic `upsert ... onConflict: "event_key", ignoreDuplicates: true`)
 *   -- the same DB-enforced-unique mechanism every other real event in
 *   this app already uses, not a new one.
 * - Channel re-use prevention reuses PR #29's own fail-closed contact
 *   verification model (migration 041, already merged): a second
 *   `prospect_contact_verifications` row with a deliberately
 *   non-matching value makes evaluateChannelActivation() detect a real
 *   conflict and block the channel via the exact same logic that already
 *   blocks a genuinely disputed number -- not a new blocking mechanism,
 *   not a schema change. This never touches an unrelated channel's own
 *   verification rows, and never touches prospects.phone/email directly.
 */

export type ContactQualityIssueType = "wrong_contact" | "invalid_number" | "disputed_info";

export interface LogContactQualityEventInput {
  organizationId: string;
  prospectId: string;
  channel: "CALL" | "EMAIL";
  issueType: ContactQualityIssueType;
  observedValue?: string | null;
  note?: string | null;
  actionId?: string | null;
  createdBy?: string | null;
}

const ISSUE_LABEL: Record<ContactQualityIssueType, string> = {
  wrong_contact: "Wrong contact",
  invalid_number: "Number invalid",
  disputed_info: "Contact information disputed"
};

export async function logContactQualityEvent(supabase: SupabaseClient, input: LogContactQualityEventInput): Promise<{ inserted: boolean }> {
  // Deterministic per (prospect, channel, issueType, action) so a retry
  // is a genuine no-op at the storage layer, not merely discouraged by
  // application logic -- mirrors the exact pattern
  // contact_attempted:{enrollmentId}:{sequenceStepId} already uses.
  const eventKey = `contact_quality:${input.prospectId}:${input.channel}:${input.issueType}:${input.actionId ?? "no-action"}`;

  const result = await logActivity(supabase, {
    organizationId: input.organizationId,
    prospectId: input.prospectId,
    activityType: "CONTACT_ATTEMPTED",
    channel: input.channel,
    summary: `${ISSUE_LABEL[input.issueType]} -- reported during outreach, human-observed.${input.note ? ` Note: ${input.note}` : ""}`,
    metadata: {
      kind: "contact_quality_issue",
      issueType: input.issueType,
      channel: input.channel,
      observedValue: input.observedValue ?? null,
      note: input.note ?? null,
      actionId: input.actionId ?? null,
      source: "human_reported_during_outreach"
    },
    createdBy: input.createdBy ?? null,
    eventKey
  });

  // Block reuse of this specific channel value until reverified -- a
  // second, deliberately non-matching prospect_contact_verifications row
  // makes evaluateChannelActivation() (src/lib/prospect/contact-verification.ts)
  // detect a real conflict for THIS channel only, exactly as it already
  // does for a genuinely disputed number. Never touches the other
  // channel's own verification rows, never touches prospects.phone/email.
  if (result.inserted) {
    await supabase.from("prospect_contact_verifications").insert({
      organization_id: input.organizationId,
      prospect_id: input.prospectId,
      channel: input.channel,
      contact_value: `DISPUTED (${ISSUE_LABEL[input.issueType]}, ${new Date().toISOString().slice(0, 10)})`,
      source_url: null,
      verification_method: "other",
      verifier_type: "human_operator",
      is_single_source: true,
      created_by: input.createdBy ?? null
    });
  }

  return result;
}
