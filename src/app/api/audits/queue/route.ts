import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { findProspects } from "@/lib/prospect/finder";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import type { IndustryKey } from "@/lib/sitegen/types";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";

const schema = z.object({
  industry: z.string(),
  city: z.string().min(1),
  state: z.string().optional(),
  limit: z.number().min(1).max(20).optional()
});

async function getUserAndOrganization(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("plan_key")
      .eq("id", membership.organization_id)
      .single();
    return { user, organizationId: membership.organization_id, planKey: organization?.plan_key ?? "starter" };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({ name: "My WebGenie Workspace" })
    .select("id")
    .single();
  if (organizationError || !organization) {
    throw new Error(organizationError?.message ?? "Unable to create workspace.");
  }

  const { error: membershipError } = await supabase
    .from("organization_members")
    .insert({ organization_id: organization.id, user_id: user.id, role: "owner" });
  if (membershipError) throw new Error(membershipError.message);

  return { user, organizationId: organization.id, planKey: "starter" };
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const industry = parsed.data.industry as IndustryKey;
  if (!(industry in INDUSTRIES)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }

  const supabase = await createClient();

  let user, organizationId, planKey;
  try {
    ({ user, organizationId, planKey } = await getUserAndOrganization(supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required." },
      { status: 401 }
    );
  }

  const found = await findProspects({
    industry,
    city: parsed.data.city,
    state: parsed.data.state ?? "",
    limit: 20
  });

  const candidates = found.withWebsite.slice(0, parsed.data.limit ?? 10);
  const queued: Array<{ projectId: string; jobId: string; businessName: string; url: string }> = [];
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
          industry: INDUSTRIES[industry].label,
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

      queued.push({ projectId: project.id, jobId: job.id, businessName: business.name, url: business.website });
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
    provider: found.provider,
    notice: found.notice
  });
}
