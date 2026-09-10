import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { businessSchema } from "@/lib/prospect/business-schema";
import { openProspect } from "@/lib/prospect/open";
import { fetchPlaceDetails } from "@/lib/prospect/finder";
import { logActivity } from "@/lib/prospect/activity";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { rowToProspect } from "@/lib/prospect/row";
import { z } from "zod";

/**
 * Admin-only. "Import GMB Data" — P0.5 section 17/18/35. Row and bulk
 * import share this one route (a bulk call is just multiple businesses in
 * one request) rather than two endpoints with duplicated logic.
 *
 * Deliberately explicit-only: never called automatically for every Finder
 * result (section 40's cost discipline) — only from a row's own "Import
 * GMB Data" click or a bulk click on selected rows.
 *
 * Per-row failure isolation (section 35/36): one business that can't be
 * imported (no real Google Place id, or the Places API call fails) is
 * reported in `failed` without aborting the rest of the batch.
 */
const requestSchema = z.object({
  businesses: z.array(businessSchema).min(1).max(25)
});

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const imported: Array<{ businessId: string; prospectId: string; fetchedAt: string }> = [];
  const failed: Array<{ businessId: string; businessName: string; reason: string }> = [];

  for (const business of parsed.data.businesses) {
    try {
      if (business.source !== "places") {
        throw new Error("Only real Google Places results can be imported.");
      }
      const profile = await fetchPlaceDetails(business.id);
      if (!profile) {
        throw new Error("Google Places didn't return public profile data for this business.");
      }

      const prospect = await openProspect(supabase, organizationId, user.id, business);

      const { data: updatedRow, error: updateError } = await supabase
        .from("prospects")
        .update({
          public_profile: profile,
          public_profile_source: "google_places",
          public_profile_fetched_at: profile.fetchedAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", prospect.id)
        .select("*")
        .single();
      if (updateError) throw new Error(updateError.message);

      await logActivity(supabase, {
        organizationId,
        prospectId: prospect.id,
        activityType: "GMB_DATA_IMPORTED",
        summary: "Imported Google Business Profile data.",
        createdBy: user.id
      });
      // Re-sync so the queue reflects the freshly-imported data (e.g. no
      // longer recommending IMPORT_GMB_DATA once real signals exist).
      if (updatedRow) {
        await regenerateProspectIntelligence(supabase, rowToProspect(updatedRow));
      }

      imported.push({ businessId: business.id, prospectId: prospect.id, fetchedAt: profile.fetchedAt });
    } catch (error) {
      failed.push({
        businessId: business.id,
        businessName: business.name,
        reason: error instanceof Error ? error.message : "Import failed."
      });
    }
  }

  return NextResponse.json({ imported, failed });
}
