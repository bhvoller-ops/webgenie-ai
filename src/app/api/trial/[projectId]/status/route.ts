import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePromptsForBlueprint } from "@/lib/jobs/generate-prompts";

/**
 * Public, polled by the trial status page. project_id is a real UUID —
 * unguessable, not sequential — so this is intentionally reachable without
 * a session, the same trust model /pay/[callLogId] already uses elsewhere
 * in this app.
 *
 * process-analysis-job.ts (the worker) already generates the blueprint
 * automatically once analysis completes — see migration 024's comment.
 * The one step that's normally a manual admin action
 * (generatePromptPackageAction) gets triggered here instead, exactly
 * once, the first time this endpoint sees a blueprint with no prompt
 * package yet. Idempotent: checks for an existing package first, so
 * repeated polls never queue a duplicate.
 */
const DEFAULT_TRIAL_PLATFORM = "claude_code" as const;

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const parsedId = z.string().uuid().safeParse(projectId);
  if (!parsedId.success) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const admin = createAdminClient();

  const { data: project } = await admin.from("projects").select("id,name,is_trial").eq("id", projectId).eq("is_trial", true).maybeSingle();
  if (!project) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: job } = await admin
    .from("analysis_jobs")
    .select("id,status,progress,current_stage,error_message")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "No audit found for this trial." }, { status: 404 });

  if (job.status !== "completed") {
    return NextResponse.json({ stage: job.current_stage, progress: job.progress, status: job.status, errorMessage: job.error_message, ready: false });
  }

  const { data: blueprint } = await admin
    .from("website_blueprints")
    .select("id")
    .eq("analysis_job_id", job.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!blueprint) {
    // The worker marks the job completed only after generating the
    // blueprint, so this should be rare — a moment of lag, not a failure.
    return NextResponse.json({ stage: "generating_blueprint", progress: 90, status: job.status, ready: false });
  }

  const { data: existingPackage } = await admin
    .from("prompt_packages")
    .select("id")
    .eq("blueprint_id", blueprint.id)
    .limit(1)
    .maybeSingle();

  if (!existingPackage) {
    try {
      await generatePromptsForBlueprint(blueprint.id, DEFAULT_TRIAL_PLATFORM);
    } catch (err) {
      console.error("Trial prompt package generation failed:", err);
      return NextResponse.json({ stage: "generating_prompt_package", progress: 95, status: job.status, ready: false });
    }
  }

  return NextResponse.json({
    stage: "completed",
    progress: 100,
    status: "completed",
    ready: true,
    jobId: job.id,
    technicalUrl: `/trial/report/${job.id}/technical`,
    plainUrl: `/trial/report/${job.id}/plain`
  });
}
