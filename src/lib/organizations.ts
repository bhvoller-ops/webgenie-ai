import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves this agency's own organization — the one that owns the direct-
 * intake surfaces (/get-started, /partner-signup) and is the fallback
 * attribution target for /site-lead when a generated site's embedded
 * organizationId is missing or invalid.
 *
 * Deliberately NOT `.select("id").limit(1).single()`: that has no ORDER BY,
 * so Postgres gives no guarantee which row comes back once a second
 * organizations row exists (see migration 033_default_organization.sql for
 * the full reasoning). This queries the explicit `is_default` marker
 * instead, so it stays correct once a second real organization — e.g. a
 * Partner Program member's own — exists.
 */
export async function getDefaultOrganizationId(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.from("organizations").select("id").eq("is_default", true).maybeSingle();
  if (error) {
    console.error("getDefaultOrganizationId: query failed", error);
    return null;
  }
  return data?.id ?? null;
}
