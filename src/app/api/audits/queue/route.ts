import { NextResponse } from "next/server";
import { z } from "zod";
import { findProspects, normalizeBusinessName, REVIEW_TIERS, type ReviewTierKey } from "@/lib/prospect/finder";
import { industryLabel, isKnownIndustry } from "@/lib/sitegen/industry-lookup";
import type { IndustryKey } from "@/lib/sitegen/types";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";
import { requireAdminApi } from "@/lib/auth/access";

const TIER_KEYS = REVIEW_TIERS.map((t) => t.key) as [ReviewTierKey, ...ReviewTierKey[]];

const schema = z.object({
  industry: z.string(),
  city: z.string().min(1),
  state: z.string().optional(),
  limit: z.number().min(1).max(20).optional(),
  reviewTier: z.enum(TIER_KEYS).optional(),
  radiusMiles: z.number().min(1).max(31).optional()
});

export async function POST(request: Request) {
  // Was gated on "signed in" only, via a local helper that auto-bootstrapped
  // a brand-new organization for any stranger with no membership — meaning
  // a partner login (or any non-admin) could burn Places API calls and
  // create real projects in their own throwaway org. Now admin-only, no
  // bootstrap. See lib/auth/access.ts.
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, user, organizationId } = ctx;
  const { data: organization } = await supabase.from("organizations").select("plan_key").eq("id", organizationId).single();
  const planKey = organization?.plan_key ?? "starter";

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const industry = parsed.data.industry as IndustryKey;
  if (!isKnownIndustry(industry)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }

  // Refreshing the same industry/city previously returned the same top results
  // every time. Excluding businesses already queued for this org+industry
  // means a repeat search surfaces new ones instead.
  const { data: alreadyQueued } = await supabase
    .from("projects")
    .select("name")
    .eq("organization_id", organizationId)
    .eq("industry", industryLabel(industry));

  const excludeNormalizedNames = new Set(
    (alreadyQueued ?? []).map((p) => normalizeBusinessName(p.name))
  );

  const found = await findProspects({
    industry,
    city: parsed.data.city,
    state: parsed.data.state ?? "",
    limit: 20,
    reviewTier: parsed.data.reviewTier,
    excludeNormalizedNames,
    radiusMiles: parsed.data.radiusMiles
  });

  const candidates = found.withWebsite.slice(0, parsed.data.limit ?? 10);
  const queued: Array<{
    projectId: string;
    jobId: string;
    businessName: string;
    url: string;
    rating: number | null;
    reviewCount: number | null;
    open24Hours: boolean;
  }> = [];
  const skipped: Array<{ businessName: string; reason: string }> = [];

  for (const business of candidates) {
    if (!business.website) continue;

    try {
      await assertWithinLimit(supabase, organizationId, planKey, "projects");

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          organization_id: organizationId,
          name: business.name,
          industry: industryLabel(industry),
          primary_goal: "Generate leads",
          primary_cta: "Call now",
          created_by: user.id,
          status: "active"
        })
        .select("id")
        .single();
      if (projectError || !project) throw new Error(projectError?.message ?? "Unable to create project.");
      await recordUsage(supabase, organizationId, "projects", user.id, project.id);

      const { error: referenceError } = await supabase.from("website_references").insert({
        project_id: project.id,
        url: business.website,
        role: "current_site",
        label: business.name,
        priority: 1,
        validation_status: "pending"
      });
      if (referenceError) throw new Error(referenceError.message);

      await assertWithinLimit(supabase, organizationId, planKey, "analyses");

      const { data: job, error: jobError } = await supabase
        .from("analysis_jobs")
        .insert({ project_id: project.id, status: "queued", progress: 0, current_stage: "queued" })
        .select("id")
        .single();
      if (jobError || !job) throw new Error(jobError?.message ?? "Unable to queue analysis.");
      await recordUsage(supabase, organizationId, "analyses", user.id, job.id);

      queued.push({
        projectId: project.id,
        jobId: job.id,
        businessName: business.name,
        url: business.website,
        rating: business.rating ?? null,
        reviewCount: business.reviewCount ?? null,
        open24Hours: business.open24Hours ?? false
      });
    } catch (error) {
      skipped.push({
        businessName: business.name,
        reason: error instanceof Error ? error.message : "Unknown error."
      });
    }
  }

  return NextResponse.json({
    totalCandidates: candidates.length,
    queued,
    skipped,
    excludedChains: found.likelyChains.map((b) => ({ businessName: b.name, reviewCount: b.reviewCount ?? null })),
    reviewTier: parsed.data.reviewTier ?? "small",
    provider: found.provider,
    notice: found.notice
  });
}
