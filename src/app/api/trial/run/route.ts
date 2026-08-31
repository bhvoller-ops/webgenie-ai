import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBetaApi } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * For an already-signed-in beta tester running another trial from
 * /trial/portal — no account creation, just queues another project the
 * same way /api/trial/start does. Capped per tester so the free trial
 * can't be hammered; this is separate from and in addition to the
 * organization-wide plan limits (assertWithinLimit) the admin-side
 * pipeline already enforces — those exist to protect the workspace's
 * plan, this exists to protect the free trial itself.
 */
const MAX_TRIALS_PER_TESTER = 3;

const schema = z.object({
  url: z.string().url(),
  businessName: z.string().max(160).optional()
});

export async function POST(request: Request) {
  const { ctx, response } = await requireBetaApi();
  if (response) return response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });

  const admin = createAdminClient();
  const { betaTesterId, user } = ctx;

  const { data: org } = await admin.from("beta_testers").select("organization_id").eq("id", betaTesterId).single();
  if (!org) return NextResponse.json({ error: "Trial account not found." }, { status: 404 });

  const { count } = await admin.from("projects").select("id", { count: "exact", head: true }).eq("beta_tester_id", betaTesterId).eq("is_trial", true);
  if ((count ?? 0) >= MAX_TRIALS_PER_TESTER) {
    return NextResponse.json({ error: `You've used all ${MAX_TRIALS_PER_TESTER} free trials. Get in touch if you'd like more.` }, { status: 400 });
  }

  const normalizedUrl = new URL(parsed.data.url);
  normalizedUrl.hash = "";
  const businessName = parsed.data.businessName?.trim() || normalizedUrl.hostname.replace(/^www\./, "");

  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      organization_id: org.organization_id,
      created_by: user.id,
      name: businessName,
      industry: "Website audit",
      primary_goal: "Lead generation",
      primary_cta: "Contact us",
      status: "active",
      beta_tester_id: betaTesterId,
      is_trial: true
    })
    .select("id")
    .single();
  if (projectError || !project) return NextResponse.json({ error: projectError?.message ?? "Unable to start trial." }, { status: 400 });

  const { error: referenceError } = await admin.from("website_references").insert({
    project_id: project.id,
    url: normalizedUrl.toString(),
    role: "current_site",
    priority: 1,
    validation_status: "pending"
  });
  if (referenceError) return NextResponse.json({ error: referenceError.message }, { status: 400 });

  const { data: job, error: jobError } = await admin
    .from("analysis_jobs")
    .insert({ project_id: project.id, status: "queued", progress: 0, current_stage: "queued" })
    .select("id")
    .single();
  if (jobError || !job) return NextResponse.json({ error: jobError?.message ?? "Unable to queue the audit." }, { status: 400 });

  return NextResponse.json({ ok: true, projectId: project.id, jobId: job.id });
}
