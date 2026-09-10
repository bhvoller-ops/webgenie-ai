import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { rowToProspect } from "@/lib/prospect/row";
import { businessSchema, normalizePhone, normalizeState } from "@/lib/prospect/business-schema";

/**
 * Admin-only. Turns a Finder result (an ephemeral `Business`) into a real,
 * addressable `Prospect` row the moment an agency user actually opens it —
 * Finder itself stays read-only/ephemeral, matching its existing behavior.
 * Idempotent: re-opening the same business (by Google Place id, or by
 * name+phone for manual/sample entries) returns the same prospect rather
 * than duplicating it — see the two partial unique indexes in migration
 * 034. Generates the Opportunity Brief + Next Best Action on first open.
 *
 * Validation schema lives in lib/prospect/business-schema.ts, not inline
 * here — Next.js's typed-routes checker rejects any named export from an
 * app/api route.ts other than the recognized HTTP-method/config set, and
 * that's also the correct home for "one canonical shape between Finder
 * and this route" after the 10 Sep 2026 phone-validation defect
 * (docs/history.md) showed the schema and the real shape had drifted.
 */
export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = businessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid business data.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const b = parsed.data;
  const isGooglePlace = b.source === "places";
  const hasWebsite = Boolean(b.website);
  const phone = normalizePhone(b.phone);
  const state = normalizeState(b.state);

  const existing = isGooglePlace
    ? await supabase.from("prospects").select("*").eq("organization_id", organizationId).eq("google_place_id", b.id).maybeSingle()
    : await supabase.from("prospects").select("*").eq("organization_id", organizationId).eq("business_name", b.name).eq("phone", phone).is("google_place_id", null).maybeSingle();

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
        created_by: user.id
      })
      .select("*")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Unable to create prospect." }, { status: 500 });
    }
    prospectRow = data;
  }

  const prospect = rowToProspect(prospectRow);
  await regenerateProspectIntelligence(supabase, prospect);

  return NextResponse.json({ prospectId: prospect.id });
}
