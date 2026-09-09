import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { rowToProspect } from "@/lib/prospect/row";

/**
 * Admin-only. Turns a Finder result (an ephemeral `Business`) into a real,
 * addressable `Prospect` row the moment an agency user actually opens it —
 * Finder itself stays read-only/ephemeral, matching its existing behavior.
 * Idempotent: re-opening the same business (by Google Place id, or by
 * name+phone for manual/sample entries) returns the same prospect rather
 * than duplicating it — see the two partial unique indexes in migration
 * 034. Generates the Opportunity Brief + Next Best Action on first open.
 */
const businessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  industry: z.string().min(1),
  phone: z.string().min(1).max(40),
  address: z.string().max(300).optional().default(""),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(20),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  open24Hours: z.boolean().optional(),
  website: z.string().nullable().optional(),
  source: z.enum(["places", "manual", "sample"])
});

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = businessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid business data." }, { status: 400 });
  }
  const b = parsed.data;
  const isGooglePlace = b.source === "places";
  const hasWebsite = Boolean(b.website);

  const existing = isGooglePlace
    ? await supabase.from("prospects").select("*").eq("organization_id", organizationId).eq("google_place_id", b.id).maybeSingle()
    : await supabase.from("prospects").select("*").eq("organization_id", organizationId).eq("business_name", b.name).eq("phone", b.phone).is("google_place_id", null).maybeSingle();

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
        phone: b.phone,
        website_url: b.website || null,
        has_website: hasWebsite,
        address: b.address,
        city: b.city,
        state: b.state,
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
