import type { SupabaseClient } from "@supabase/supabase-js";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { rowToProspect } from "@/lib/prospect/row";
import { normalizePhone, normalizeState, type ValidatedBusinessInput } from "@/lib/prospect/business-schema";
import type { Prospect } from "@/lib/prospect/types";

/**
 * The one place a validated Finder `Business` becomes a real, persisted
 * `Prospect` row — idempotent by Google Place id (or name+phone for
 * manual/sample entries). Extracted out of /api/prospects/open/route.ts
 * (P0.5) so the new GMB-import route (which also needs to open a prospect
 * that may not exist yet) reuses this exact logic instead of a second,
 * potentially drifting copy — the same class of bug the Open Opportunity
 * phone-validation defect (PR #24) and the publish-site one (PR #25) were
 * both about.
 */
export async function openProspect(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  b: ValidatedBusinessInput
): Promise<Prospect> {
  const isGooglePlace = b.source === "places";
  const hasWebsite = Boolean(b.website);
  const phone = normalizePhone(b.phone);
  const state = normalizeState(b.state);

  const existing = isGooglePlace
    ? await supabase.from("prospects").select("*").eq("organization_id", organizationId).eq("google_place_id", b.id).maybeSingle()
    : await supabase
        .from("prospects")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("business_name", b.name)
        .eq("phone", phone)
        .is("google_place_id", null)
        .maybeSingle();

  let prospectRow = existing.data;

  if (!prospectRow) {
    const { data, error } = await supabase
      .from("prospects")
      .insert({
        organization_id: organizationId,
        source: "finder",
        google_place_id: isGooglePlace ? b.id : null,
        business_name: b.name,
        industry: b.industry,
        phone,
        website_url: b.website || null,
        has_website: hasWebsite,
        address: b.address,
        city: b.city,
        state,
        rating: b.rating ?? null,
        review_count: b.reviewCount ?? null,
        open_24_hours: b.open24Hours ?? false,
        created_by: userId
      })
      .select("*")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create prospect.");
    }
    prospectRow = data;
  }

  const prospect = rowToProspect(prospectRow);
  await regenerateProspectIntelligence(supabase, prospect);
  return prospect;
}
