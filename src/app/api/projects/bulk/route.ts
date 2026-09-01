import { NextResponse } from "next/server";
import { z } from "zod";
import { hasPlacesKey, resolveBusiness } from "@/lib/prospect/finder";
import { classifyLine } from "@/lib/prospect/parse-line";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import type { Business, IndustryKey } from "@/lib/sitegen/types";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";
import { requireAdminApi } from "@/lib/auth/access";

/**
 * New Project's bulk-add box: one or more pasted lines — a Google Business
 * Profile link, a plain business name, or an existing website URL — each
 * resolved independently via Places Text Search (lib/prospect/finder.ts's
 * resolveBusiness, the single-result sibling of the category search Finder
 * and Audit use). A resolved business with no website is returned to the
 * client for demo-site generation, exactly like a Finder "no website"
 * result — no DB write, since site generation is a free pure function. A
 * resolved business WITH a website is queued for a real audit immediately,
 * same project+reference+job pattern as /api/audits/queue.
 */

const MAX_LINES = 25;

const schema = z.object({
  lines: z.array(z.string()).min(1).max(MAX_LINES),
  defaultIndustry: z.string().optional(),
});

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, user, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!hasPlacesKey()) {
    return NextResponse.json(
      { error: "Bulk lookup needs Google Places (GOOGLE_PLACES_API_KEY isn't set). Use the manual form below instead." },
      { status: 400 }
    );
  }

  const defaultIndustry = parsed.data.defaultIndustry as IndustryKey | undefined;
  if (defaultIndustry && !(defaultIndustry in INDUSTRIES)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }

  const { data: organization } = await supabase.from("organizations").select("plan_key").eq("id", organizationId).single();
  const planKey = organization?.plan_key ?? "starter";

  // Dedupe, trim, drop blanks — same defensive shape as a pasted list always needs.
  const lines = Array.from(new Set(parsed.data.lines.map((l) => l.trim()).filter(Boolean))).slice(0, MAX_LINES);

  const generated: Business[] = [];
  const queued: Array<{
    projectId: string;
    jobId: string;
    businessName: string;
    url: string;
    rating: number | null;
    reviewCount: number | null;
  }> = [];
  const notFound: string[] = [];
  const skipped: Array<{ businessName: string; reason: string }> = [];

  for (const line of lines) {
    const classified = await classifyLine(line);

    let business: Business | null;
    if (classified.kind === "website") {
      let hostname = classified.value;
      try {
        hostname = new URL(classified.value).hostname.replace(/^www\./, "");
      } catch {
        // classifyLine only returns "website" for a URL it already parsed, so
        // this branch shouldn't run — but fall back to the raw value if it does.
      }
      const enriched = await resolveBusiness(hostname, { fallbackIndustry: defaultIndustry });
      // Trust the pasted URL as the site regardless of what Places found (or
      // didn't) for the name search — that's the one fact the user gave directly.
      business = enriched
        ? { ...enriched, website: classified.value }
        : {
            id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: hostname,
            industry: defaultIndustry ?? "contractor",
            phone: "",
            address: "",
            city: "",
            state: "",
            website: classified.value,
            source: "manual",
          };
    } else {
      business = await resolveBusiness(classified.value, { fallbackIndustry: defaultIndustry });
    }

    if (!business) {
      notFound.push(line);
      continue;
    }

    if (!business.website) {
      generated.push(business);
      continue;
    }

    try {
      await assertWithinLimit(supabase, organizationId, planKey, "projects");
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          organization_id: organizationId,
          name: business.name,
          industry: INDUSTRIES[business.industry].label,
          primary_goal: "Generate leads",
          primary_cta: "Call now",
          created_by: user.id,
          status: "active",
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
        validation_status: "pending",
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
      });
    } catch (error) {
      skipped.push({ businessName: business.name, reason: error instanceof Error ? error.message : "Unknown error." });
    }
  }

  return NextResponse.json({ generated, queued, notFound, skipped });
}
