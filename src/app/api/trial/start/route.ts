import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public — first-time trial signup + first audit, combined into one
 * submit. Creates a pre-confirmed account (same email_confirm:true pattern
 * as /api/auth/create-account and the invite-accept flow), a beta_testers
 * row, and queues a real project through the same pipeline the admin
 * Dashboard uses (projects -> website_references -> analysis_jobs). The
 * worker picks up the analysis_jobs row exactly like any other and, per
 * process-analysis-job.ts, automatically generates the blueprint once
 * analysis completes — only the prompt package needs a separate trigger,
 * handled by /api/trial/[projectId]/status once the blueprint exists.
 *
 * Someone who already has a beta_testers row should sign in and use
 * /trial/portal's "run another" form (/api/trial/run) instead — this
 * route is deliberately first-time-only, so it never has to decide
 * whether to treat a resubmission as a new account or a sign-in.
 */
const schema = z.object({
  url: z.string().url(),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  businessName: z.string().max(160).optional()
});

const MAX_TRIALS_PER_TESTER = 3;

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid website URL, email, and an 8+ character password." }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = parsed.data.email.toLowerCase().trim();

  const normalizedUrl = new URL(parsed.data.url);
  normalizedUrl.hash = "";

  const { data: org } = await admin.from("organizations").select("id").limit(1).single();
  if (!org) {
    return NextResponse.json({ error: "Trials aren't available right now — try again shortly." }, { status: 503 });
  }

  const { data: existingTester } = await admin.from("beta_testers").select("id").eq("organization_id", org.id).eq("email", email).maybeSingle();
  if (existingTester) {
    return NextResponse.json({ error: "This email already has a trial account — sign in instead, then run another trial from your dashboard." }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true
  });

  if (createError || !created.user) {
    const message = (createError?.message ?? "").toLowerCase().includes("already been registered")
      ? "An account with this email already exists — sign in instead."
      : (createError?.message ?? "Unable to create account.");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: betaTester, error: betaError } = await admin
    .from("beta_testers")
    .insert({ organization_id: org.id, user_id: created.user.id, email })
    .select("id")
    .single();

  if (betaError || !betaTester) {
    // Account exists but the beta_testers row failed — clean up rather than
    // leave an orphaned login with no way to reach the portal.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: betaError?.message ?? "Unable to start your trial." }, { status: 400 });
  }

  const businessName = parsed.data.businessName?.trim() || normalizedUrl.hostname.replace(/^www\./, "");

  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      organization_id: org.id,
      created_by: created.user.id,
      name: businessName,
      industry: "Website audit",
      primary_goal: "Lead generation",
      primary_cta: "Contact us",
      status: "active",
      beta_tester_id: betaTester.id,
      is_trial: true
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? "Unable to start your trial." }, { status: 400 });
  }

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

  return NextResponse.json({ ok: true, projectId: project.id, jobId: job.id, maxTrials: MAX_TRIALS_PER_TESTER });
}
