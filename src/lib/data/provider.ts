/**
 * Single data seam.
 *
 * Every page and component reads through this module and nothing else.
 * Backed by Supabase — return types match the engine's canonical artifacts,
 * so no component needs to change when the underlying query does.
 */

import { createClient } from "@/lib/supabase/server";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import type { PromptPackage, PromptPlatform } from "@/lib/prompts/types";
import type { AnalysisJobStatus, ProjectSummary, WebsiteReference } from "@/lib/types";

export const DATA_MODE: "fixtures" | "supabase" = "supabase";

async function buildProjectSummary(row: {
  id: string;
  name: string;
  industry: string;
  primary_goal: string;
  primary_cta: string;
  status: string;
  created_at: string;
}): Promise<ProjectSummary> {
  const supabase = await createClient();

  const [{ data: references }, { data: jobs }, { data: blueprint }, { data: promptPackage }, { data: contentPackage }] =
    await Promise.all([
      supabase
        .from("website_references")
        .select("id, url, role")
        .eq("project_id", row.id),
      supabase
        .from("analysis_jobs")
        .select("id, status, progress, started_at, completed_at, created_at, analysis_outputs(output)")
        .eq("project_id", row.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("website_blueprints")
        .select("id")
        .eq("project_id", row.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("prompt_packages")
        .select("id")
        .eq("project_id", row.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("content_packages")
        .select("id")
        .eq("project_id", row.id)
        .limit(1)
        .maybeSingle()
    ]);

  const primaryRef = references?.find((r) => r.role === "current_site") ?? references?.[0];
  const job = jobs?.[0];
  const jobOutput = Array.isArray(job?.analysis_outputs) ? job.analysis_outputs[0] : job?.analysis_outputs;

  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    primaryGoal: row.primary_goal,
    primaryCta: row.primary_cta,
    status: (row.status as ProjectSummary["status"]) ?? "draft",
    primaryUrl: primaryRef?.url ?? "",
    referenceCount: references?.length ?? 0,
    updatedAt: row.created_at,
    latestJob: job
      ? {
          id: job.id,
          projectId: row.id,
          status: job.status as AnalysisJobStatus,
          startedAt: job.started_at ?? job.created_at,
          completedAt: job.completed_at ?? undefined,
          durationSeconds:
            job.started_at && job.completed_at
              ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
              : undefined,
          overallScore: (jobOutput as { overall_score?: number } | undefined)?.overall_score
        }
      : undefined,
    deliverables: {
      intelligence: Boolean(jobOutput),
      blueprint: Boolean(blueprint),
      promptPackage: Boolean(promptPackage),
      contentPackage: Boolean(contentPackage)
    }
  };
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, industry, primary_goal, primary_cta, status, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return Promise.all(data.map(buildProjectSummary));
}

export async function getProject(id: string): Promise<ProjectSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, industry, primary_goal, primary_cta, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return buildProjectSummary(data);
}

export async function getReferences(projectId: string): Promise<WebsiteReference[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_references")
    .select("id, project_id, url, role, label, priority")
    .eq("project_id", projectId)
    .order("priority", { ascending: true });

  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    url: r.url,
    role: r.role as WebsiteReference["role"],
    label: r.label ?? undefined,
    priority: r.priority
  }));
}

export async function getIntelligence(
  projectId: string,
  jobId?: string
): Promise<WebsiteIntelligenceOutput | null> {
  const supabase = await createClient();

  let query = supabase
    .from("analysis_jobs")
    .select("id, analysis_outputs(output)")
    .eq("project_id", projectId);

  query = jobId
    ? query.eq("id", jobId)
    : query.eq("status", "completed").order("created_at", { ascending: false }).limit(1);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const output = Array.isArray(data.analysis_outputs) ? data.analysis_outputs[0] : data.analysis_outputs;
  return (output as { output?: WebsiteIntelligenceOutput } | undefined)?.output ?? null;
}

export async function getBlueprint(projectId: string): Promise<WebsiteBlueprint | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_blueprints")
    .select("blueprint")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.blueprint as WebsiteBlueprint;
}

export async function getPromptPackage(
  projectId: string,
  platform?: PromptPlatform
): Promise<PromptPackage | null> {
  const supabase = await createClient();

  let query = supabase
    .from("prompt_packages")
    .select("prompt_json")
    .eq("project_id", projectId);

  query = platform
    ? query.eq("target_platform", platform)
    : query.order("created_at", { ascending: false }).limit(1);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data.prompt_json as PromptPackage;
}

// No revenue-opportunity or competitive-analysis engine exists yet — these
// stay honest rather than returning fabricated data. Pages already handle
// null/empty gracefully by hiding the corresponding tab.
export async function getRevenueOpportunities(_projectId: string) {
  return null;
}

export async function getCompetitiveAnalysis(_projectId: string) {
  return [];
}

export async function getPortfolioStats() {
  const projects = await getProjects();
  const scored = projects.filter((p) => typeof p.latestJob?.overallScore === "number");
  const avg = scored.length
    ? Math.round(scored.reduce((n, p) => n + (p.latestJob?.overallScore ?? 0), 0) / scored.length)
    : 0;

  const outputs = await Promise.all(
    projects
      .filter((p) => p.deliverables.intelligence)
      .map((p) => getIntelligence(p.id))
  );

  const criticalFindings = outputs
    .filter((o): o is WebsiteIntelligenceOutput => Boolean(o))
    .flatMap((o) => o.moduleScores)
    .flatMap((m) => m.recommendations)
    .filter((r) => r.priority === "critical").length;

  return {
    projectCount: projects.length,
    activeRuns: projects.filter(
      (p) => p.latestJob && p.latestJob.status !== "completed" && p.latestJob.status !== "failed"
    ).length,
    averageScore: avg,
    criticalFindings
  };
}
