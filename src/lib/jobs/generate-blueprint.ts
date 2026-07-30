import { createAdminClient } from "@/lib/supabase/admin";
import { generateWebsiteBlueprint } from "@/lib/blueprint/generator";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";

export async function generateBlueprintForJob(jobId: string): Promise<string> {
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("analysis_jobs")
    .select(`
      id,
      project_id,
      projects(
        id,
        name,
        industry,
        target_audience,
        primary_goal,
        primary_cta
      ),
      analysis_outputs(output)
    `)
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error(jobError?.message ?? "Analysis job not found.");
  }

  const project = Array.isArray(job.projects)
    ? job.projects[0]
    : job.projects;

  const outputRecord = Array.isArray(job.analysis_outputs)
    ? job.analysis_outputs[0]
    : job.analysis_outputs;

  if (!project || !outputRecord?.output) {
    throw new Error("Project or Website Intelligence output is missing.");
  }

  const blueprint = generateWebsiteBlueprint({
    project: {
      id: project.id,
      name: project.name,
      industry: project.industry,
      targetAudience: project.target_audience,
      primaryGoal: project.primary_goal,
      primaryCta: project.primary_cta
    },
    intelligence: outputRecord.output as WebsiteIntelligenceOutput
  });

  const { data, error } = await supabase
    .from("website_blueprints")
    .upsert(
      {
        project_id: project.id,
        analysis_job_id: jobId,
        schema_version: blueprint.schemaVersion,
        blueprint,
        status: "generated"
      },
      { onConflict: "analysis_job_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to persist blueprint.");
  }

  return data.id;
}
