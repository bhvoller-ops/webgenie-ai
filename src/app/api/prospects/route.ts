import { NextResponse } from "next/server";
import { findProspects, type FinderQuery } from "@/lib/prospect/finder";
import { isKnownIndustry } from "@/lib/sitegen/industry-lookup";
import type { Business, IndustryKey } from "@/lib/sitegen/types";
import { requireAdminApi } from "@/lib/auth/access";
import { computePreliminaryOpportunity, type PreliminaryOpportunity } from "@/lib/prospect/preliminary-opportunity";
import type { PublicBusinessProfile } from "@/lib/prospect/finder";
import type { ProspectStatus } from "@/lib/prospect/types";

// Was fully open — no auth check at all. Any anonymous caller could burn
// the Google Places budget by hitting this directly. Gated 30 Aug 2026.

/**
 * P0.5 (10 Sep 2026): Finder's own search route is now the single place
 * that enriches raw provider results — it returns every candidate the
 * search actually found (FinderResult.all, see lib/prospect/finder.ts),
 * each tagged with whether it's already a real, opened Prospect
 * (`prospectId`/`prospectStatus`/`hasCompletedAudit`) and a deterministic
 * Preliminary Opportunity. This is the only HTTP consumer of this route's
 * response shape (finder-client.tsx) — /api/audits/queue calls
 * findProspects() directly and is untouched.
 */
export interface FinderResultRow extends Business {
  prospectId?: string;
  prospectStatus?: ProspectStatus;
  hasCompletedAudit: boolean;
  preliminaryOpportunity: PreliminaryOpportunity;
  /** Set once "Import GMB Data" has persisted a real Place Details fetch (migration 035). Absent/null before the migration is applied or before an import has run — read defensively. */
  publicProfile?: PublicBusinessProfile | null;
  publicProfileFetchedAt?: string | null;
}

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  let body: Partial<FinderQuery>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const industry = body.industry as IndustryKey | undefined;
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const state = typeof body.state === "string" ? body.state.trim() : "";

  if (!industry || !isKnownIndustry(industry)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "A city is required." }, { status: 400 });
  }

  const result = await findProspects({
    industry,
    city,
    state: state || "",
    limit: typeof body.limit === "number" ? Math.min(40, Math.max(1, body.limit)) : 17,
    radiusMiles: typeof body.radiusMiles === "number" ? body.radiusMiles : undefined,
  });

  // Batch-match against already-opened prospects (by Google Place id) so
  // Finder can show real status ("Audited", "Demo Ready", ...) instead of
  // treating every search as if it's the first time this business has ever
  // been seen. One prospects query + one analysis_jobs query for the whole
  // page, not one per row.
  const placeIds = result.all.filter((b) => b.source === "places").map((b) => b.id);
  const prospectByPlaceId = new Map<
    string,
    {
      id: string;
      status: ProspectStatus;
      projectId: string | null;
      publicProfile: PublicBusinessProfile | null;
      publicProfileFetchedAt: string | null;
    }
  >();
  if (placeIds.length > 0) {
    // select("*") deliberately, not named columns -- migration 035's three
    // public_profile* columns may not exist in production yet (this PR is
    // reviewed but not applied). A named-column select errors if a column
    // is missing; select("*") simply omits it from the result, so this
    // stays safe (and automatically starts returning the real data) both
    // before and after the migration lands -- no further code change
    // needed once it's applied.
    const { data: prospectRows } = await supabase
      .from("prospects")
      .select("*")
      .eq("organization_id", organizationId)
      .in("google_place_id", placeIds);
    for (const row of prospectRows ?? []) {
      if (row.google_place_id) {
        prospectByPlaceId.set(row.google_place_id, {
          id: row.id as string,
          status: row.status as ProspectStatus,
          projectId: row.project_id as string | null,
          publicProfile: (row.public_profile as PublicBusinessProfile | null) ?? null,
          publicProfileFetchedAt: (row.public_profile_fetched_at as string | null) ?? null
        });
      }
    }
  }

  const projectIds = Array.from(prospectByPlaceId.values())
    .map((p) => p.projectId)
    .filter((id): id is string => Boolean(id));
  const auditByProjectId = new Map<string, number | null>();
  if (projectIds.length > 0) {
    const { data: jobRows } = await supabase
      .from("analysis_jobs")
      .select("project_id, analysis_outputs(output)")
      .in("project_id", projectIds)
      .eq("status", "completed")
      .order("created_at", { ascending: false });
    for (const job of jobRows ?? []) {
      const projectId = job.project_id as string;
      if (auditByProjectId.has(projectId)) continue; // keep the most recent only
      const output = Array.isArray(job.analysis_outputs) ? job.analysis_outputs[0] : job.analysis_outputs;
      const score = (output as { output?: { overallScore?: number } } | undefined)?.output?.overallScore;
      auditByProjectId.set(projectId, typeof score === "number" ? score : null);
    }
  }

  const results: FinderResultRow[] = result.all.map((business) => {
    const matched = business.source === "places" ? prospectByPlaceId.get(business.id) : undefined;
    const hasCompletedAudit = Boolean(matched?.projectId && auditByProjectId.has(matched.projectId));
    const auditOverallScore = matched?.projectId ? auditByProjectId.get(matched.projectId) ?? null : null;

    const preliminaryOpportunity = computePreliminaryOpportunity(
      business,
      hasCompletedAudit ? { hasCompletedAudit: true, auditOverallScore } : null,
      matched?.publicProfile ?? null
    );

    return {
      ...business,
      prospectId: matched?.id,
      prospectStatus: matched?.status,
      hasCompletedAudit,
      preliminaryOpportunity,
      publicProfile: matched?.publicProfile ?? null,
      publicProfileFetchedAt: matched?.publicProfileFetchedAt ?? null
    };
  });

  return NextResponse.json({
    provider: result.provider,
    totalFound: result.totalFound,
    results,
    notice: result.notice
  });
}
