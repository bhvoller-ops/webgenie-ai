import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";
import { rowToProspect } from "@/lib/prospect/row";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import { industryLabel } from "@/lib/sitegen/industry-lookup";
import type { Business, IndustryKey } from "@/lib/sitegen/types";

/**
 * The prospect detail page's real action buttons — Run Audit / Generate
 * Demo / Contact / Refresh Brief — all funnel through here so there's one
 * place that (re)computes the Brief + Next Best Action afterward, rather
 * than four routes each remembering to do it. Reuses the exact
 * project+website_reference+analysis_job insert sequence /api/audits/queue
 * already uses for "run_audit," and the same demoSiteUrl() encoding every
 * other demo link in the app uses for "generate_demo" — no parallel
 * implementation of either.
 */
const schema = z.object({
  action: z.enum(["run_audit", "generate_demo", "contact", "refresh"])
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, user, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const { data: prospectRow, error: prospectError } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", prospectId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (prospectError || !prospectRow) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  const prospect = rowToProspect(prospectRow);

  switch (parsed.data.action) {
    case "run_audit": {
      if (!prospect.hasWebsite || !prospect.websiteUrl) {
        return NextResponse.json({ error: "This prospect has no website to audit." }, { status: 400 });
      }
      if (prospect.projectId) {
        return NextResponse.json({ error: "An audit already exists for this prospect." }, { status: 400 });
      }
      const { data: organization } = await supabase.from("organizations").select("plan_key").eq("id", organizationId).single();
      const planKey = organization?.plan_key ?? "starter";

      try {
        await assertWithinLimit(supabase, organizationId, planKey, "projects");
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            organization_id: organizationId,
            name: prospect.businessName,
            industry: prospect.industry ? industryLabel(prospect.industry as IndustryKey) : "General",
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
          url: prospect.websiteUrl,
          role: "current_site",
          label: prospect.businessName,
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

        await supabase.from("prospects").update({ project_id: project.id, updated_at: new Date().toISOString() }).eq("id", prospect.id);
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to queue audit." }, { status: 500 });
      }
      break;
    }

    case "generate_demo": {
      if (prospect.hasWebsite) {
        return NextResponse.json({ error: "This prospect already has a website — nothing to generate." }, { status: 400 });
      }
      const business: Business = {
        id: prospect.googlePlaceId ?? prospect.id,
        name: prospect.businessName,
        industry: (prospect.industry ?? "contractor") as IndustryKey,
        phone: prospect.phone ?? "",
        address: prospect.address ?? "",
        city: prospect.city ?? "",
        state: prospect.state ?? "",
        rating: prospect.rating,
        reviewCount: prospect.reviewCount,
        open24Hours: prospect.open24Hours,
        website: null,
        source: prospect.source === "finder" ? "places" : prospect.source === "manual" ? "manual" : "sample"
      };
      const demoUrl = demoSiteUrl(business, { by: "WebGenie AI" });
      await supabase.from("prospects").update({ demo_url: demoUrl, updated_at: new Date().toISOString() }).eq("id", prospect.id);
      break;
    }

    case "contact": {
      const { data: existingCallLog } = await supabase
        .from("call_log")
        .select("id")
        .eq("prospect_id", prospect.id)
        .maybeSingle();
      if (!existingCallLog) {
        await supabase.from("call_log").insert({
          organization_id: organizationId,
          prospect_id: prospect.id,
          business_name: prospect.businessName,
          phone: prospect.phone || "unknown",
          industry: prospect.industry ?? null,
          city: prospect.city ?? null,
          state: prospect.state ?? null,
          demo_url: prospect.demoUrl ?? null,
          created_by: user.id
        });
      }
      break;
    }

    case "refresh":
      // Nothing to change here — just forces the regenerate call below.
      break;
  }

  const { data: refreshedRow } = await supabase.from("prospects").select("*").eq("id", prospect.id).single();
  const refreshedProspect = refreshedRow ? rowToProspect(refreshedRow) : prospect;
  await regenerateProspectIntelligence(supabase, refreshedProspect, { force: parsed.data.action === "refresh" });

  return NextResponse.json({ ok: true });
}
