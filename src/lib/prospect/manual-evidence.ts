import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Hotfix (2026-09-11, docs/history.md): reads prospect_evidence_observations
 * (migration 041) for use as buildPitchContext()'s manualObservations
 * parameter -- the structured, auditable path manually-verified findings
 * take into message generation, replacing free-form activity-description
 * parsing.
 *
 * Only VERIFIED_PRESENT and VERIFIED_ABSENT rows are ever returned --
 * INCONCLUSIVE/CAPTURE_BLOCKED/EXTRACTION_FAILED observations exist for
 * audit-trail completeness but must never reach message generation as if
 * they were a confirmed fact.
 *
 * Defensive by design: migration 041 has not been applied to production
 * as of this hotfix (explicit instruction not to apply it this session).
 * A missing-table error is treated as "no manual observations recorded
 * yet" (empty array), never surfaced as a route failure -- this function
 * is safe to call today and starts doing something the moment the
 * migration lands, with no further code change required.
 */
export async function getVerifiedManualObservations(
  supabase: SupabaseClient,
  organizationId: string,
  prospectId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("prospect_evidence_observations")
    .select("observation_text, evidence_state")
    .eq("organization_id", organizationId)
    .eq("prospect_id", prospectId)
    .in("evidence_state", ["VERIFIED_PRESENT", "VERIFIED_ABSENT"])
    .order("verified_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];
  return data.map((row) => row.observation_text as string);
}
