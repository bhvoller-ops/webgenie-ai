import { createAdminClient } from "@/lib/supabase/admin";
import { orchestrateArtifacts } from "@/lib/orchestration/engine";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import type { ContentPackage } from "@/lib/copy/types";
import type { PromptPackage } from "@/lib/prompts/types";

export async function runProjectOrchestration(args: { projectId: string; blueprintId: string; contentPackageId?: string; promptPackageId?: string; createdBy: string }): Promise<string> {
  const supabase = createAdminClient();
  const { data: blueprintRow, error: blueprintError } = await supabase.from("website_blueprints").select("id,blueprint").eq("id", args.blueprintId).eq("project_id", args.projectId).single();
  if (blueprintError || !blueprintRow) throw new Error(blueprintError?.message ?? "Blueprint not found.");

  let contentPackage: ContentPackage | undefined;
  if (args.contentPackageId) {
    const { data, error } = await supabase.from("content_packages").select("content").eq("id", args.contentPackageId).eq("project_id", args.projectId).single();
    if (error || !data) throw new Error(error?.message ?? "Content package not found.");
    contentPackage = data.content as ContentPackage;
  }

  let promptPackage: PromptPackage | undefined;
  if (args.promptPackageId) {
    const { data, error } = await supabase.from("prompt_packages").select("prompt_json").eq("id", args.promptPackageId).eq("project_id", args.projectId).single();
    if (error || !data) throw new Error(error?.message ?? "Prompt package not found.");
    promptPackage = data.prompt_json as PromptPackage;
  }

  const { data: run, error: runError } = await supabase.from("orchestration_runs").insert({ project_id: args.projectId, blueprint_id: args.blueprintId, content_package_id: args.contentPackageId ?? null, prompt_package_id: args.promptPackageId ?? null, created_by: args.createdBy, status: "running" }).select("id").single();
  if (runError || !run) throw new Error(runError?.message ?? "Unable to create orchestration run.");

  const output = orchestrateArtifacts({ runId: run.id, projectId: args.projectId, blueprint: blueprintRow.blueprint as WebsiteBlueprint, contentPackage, promptPackage });
  const { error: updateError } = await supabase.from("orchestration_runs").update({ status: output.status, overall_score: output.overallScore, overall_confidence: output.overallConfidence, blocking_findings: output.blockingFindings, output, completed_at: new Date().toISOString() }).eq("id", run.id);
  if (updateError) throw new Error(updateError.message);

  const reviewRows = output.reviews.map((review) => ({ orchestration_run_id: run.id, agent: review.agent, score: review.score, confidence: review.confidence, summary: review.summary, findings: review.findings, status: review.findings.length ? "needs_review" : "approved" }));
  const { error: reviewsError } = await supabase.from("agent_reviews").insert(reviewRows);
  if (reviewsError) throw new Error(reviewsError.message);
  return run.id;
}
