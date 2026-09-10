import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProspectActivityType } from "@/lib/prospect/types";

/**
 * The one place a prospect_activities row gets written — every call site
 * (open, GMB import, audit completion, demo generation, pitch generation,
 * contact logging, ...) goes through this instead of each one composing
 * its own insert. Never throws: activity logging is best-effort history,
 * not something that should fail the real action it's recording.
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
  }
): Promise<void> {
  const { error } = await supabase.from("prospect_activities").insert({
    organization_id: input.organizationId,
    prospect_id: input.prospectId,
    activity_type: input.activityType,
    channel: input.channel ?? null,
    summary: input.summary,
    metadata: input.metadata ?? {},
    created_by: input.createdBy ?? null
  });
  if (error) {
    console.error(`logActivity(${input.activityType}) failed for prospect ${input.prospectId}:`, error.message);
  }
}
