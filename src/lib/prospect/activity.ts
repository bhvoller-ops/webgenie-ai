import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProspectActivityType } from "@/lib/prospect/types";

/**
 * The one place a prospect_activities row gets written — every call site
 * (open, GMB import, audit completion, demo generation, pitch generation,
 * contact logging, ...) goes through this instead of each one composing
 * its own insert. Never throws: activity logging is best-effort history,
 * not something that should fail the real action it's recording.
 *
 * P2 remediation (MANDATORY FIX 2, migration 038): an optional `eventKey`
 * makes a specific event happen at most once, enforced by a real DB
 * partial unique index (prospect_activities_event_key_idx) via an atomic
 * `insert ... on conflict (event_key) do nothing` -- not a select-then-
 * insert race. Every existing call site that doesn't pass eventKey keeps
 * inserting exactly as before (event_key stays null, the partial index
 * ignores it, zero behavior change). Returns whether a row was actually
 * inserted so a caller that only wants to act "the first time this fires"
 * (e.g. logging a second, dependent event only once) can check it.
 */
export async function logActivity(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    prospectId: string;
    activityType: ProspectActivityType;
    channel?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
    createdBy?: string | null;
    eventKey?: string;
  }
): Promise<{ inserted: boolean }> {
  const row = {
    organization_id: input.organizationId,
    prospect_id: input.prospectId,
    activity_type: input.activityType,
    channel: input.channel ?? null,
    summary: input.summary,
    metadata: input.metadata ?? {},
    created_by: input.createdBy ?? null,
    event_key: input.eventKey ?? null
  };

  if (input.eventKey) {
    const { data, error } = await supabase.from("prospect_activities").upsert(row, { onConflict: "event_key", ignoreDuplicates: true }).select("id");
    if (error) {
      console.error(`logActivity(${input.activityType}) failed for prospect ${input.prospectId}:`, error.message);
      return { inserted: false };
    }
    // ignoreDuplicates: true returns no row on a conflict -- that's the
    // "already logged, this call was a no-op" case, not an error.
    return { inserted: Boolean(data && data.length > 0) };
  }

  const { error } = await supabase.from("prospect_activities").insert(row);
  if (error) {
    console.error(`logActivity(${input.activityType}) failed for prospect ${input.prospectId}:`, error.message);
    return { inserted: false };
  }
  return { inserted: true };
}
