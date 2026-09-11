/**
 * Hotfix (2026-09-11, docs/history.md): channel-activation logic for
 * outreach contact information. A real production batch used a Google
 * Places phone number for Georgia Roof Advisors that turned out to
 * differ from the number published on the business's own site, and
 * associated Best Roofing Atlanta with a domain that belongs to an
 * unrelated Tennessee business entirely -- neither was ever labeled as
 * single-source, uncorroborated data, and nothing checked for conflicts.
 *
 * Pure logic only -- reads a list of verification records (shaped like
 * rows from prospect_contact_verifications, migration 041, not yet
 * applied) and decides whether a channel may be used. No DB access here;
 * the caller fetches the rows and passes them in.
 */

export interface ContactVerificationRecord {
  channel: "EMAIL" | "CALL";
  contactValue: string;
  isSingleSource: boolean;
}

export type ChannelActivationResult =
  | { activatable: true; value: string; corroboration: "single_source" | "multi_source_agreeing" }
  | { activatable: false; reason: "no_verification" | "conflicting_sources" };

/**
 * A channel is activatable when at least one verification record exists
 * for it AND every record for that channel agrees on the same value.
 * Two+ records with different values for the same (prospect, channel) is
 * exactly the conflict shape found in this incident -- that must block
 * activation until a human resolves which value is correct, never pick
 * one silently.
 */
export function evaluateChannelActivation(
  records: ContactVerificationRecord[],
  channel: "EMAIL" | "CALL"
): ChannelActivationResult {
  const forChannel = records.filter((r) => r.channel === channel);
  if (forChannel.length === 0) return { activatable: false, reason: "no_verification" };

  const distinctValues = new Set(forChannel.map((r) => normalizeContactValue(channel, r.contactValue)));
  if (distinctValues.size > 1) return { activatable: false, reason: "conflicting_sources" };

  const allSingleSource = forChannel.every((r) => r.isSingleSource) && forChannel.length === 1;
  return {
    activatable: true,
    value: forChannel[0].contactValue,
    corroboration: allSingleSource ? "single_source" : "multi_source_agreeing"
  };
}

function normalizeContactValue(channel: "EMAIL" | "CALL", value: string): string {
  if (channel === "EMAIL") return value.trim().toLowerCase();
  // Phone comparison ignores formatting -- "(678) 757-3477" and
  // "678-757-3477" are the same number, never a false conflict.
  return value.replace(/\D/g, "");
}

/**
 * Convenience wrapper matching the exact question the sequence-message
 * and pitch routes need to answer: "may this channel be used at all?"
 * Distinct from evaluateChannelActivation's richer result so callers that
 * only need a boolean (the route guards) don't have to unpack the union.
 */
export function isChannelVerified(records: ContactVerificationRecord[], channel: "EMAIL" | "CALL"): boolean {
  return evaluateChannelActivation(records, channel).activatable;
}
