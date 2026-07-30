import { createAdminClient } from "@/lib/supabase/admin";
import { generateDeliveryPackage } from "@/lib/delivery/generator";
import type { DeliveryTarget } from "@/lib/delivery/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import type { ContentPackage } from "@/lib/copy/types";
import type { PromptPackage } from "@/lib/prompts/types";
import type { OrchestrationRunOutput } from "@/lib/orchestration/types";

export async function createProjectDelivery(input: {
  projectId: string;
  blueprintId: string;
  target: DeliveryTarget;
  createdBy: string;
  contentPackageId?: string;
  promptPackageId?: string;
  orchestrationRunId?: string;
}): Promise<string> {
  const supabase = createAdminClient();
  const [{ data: project }, { data: blueprint }, contentResult, promptResult, reviewResult] = await Promise.all([
    supabase.from("projects").select("id,name,industry,primary_goal,primary_cta").eq("id", input.projectId).single(),
    supabase.from("website_blueprints").select("id,blueprint").eq("id", input.blueprintId).eq("project_id", input.projectId).single(),
    input.contentPackageId ? supabase.from("content_packages").select("id,content").eq("id", input.contentPackageId).eq("project_id", input.projectId).single() : Promise.resolve({ data: null }),
    input.promptPackageId ? supabase.from("prompt_packages").select("id,package").eq("id", input.promptPackageId).eq("project_id", input.projectId).single() : Promise.resolve({ data: null }),
    input.orchestrationRunId ? supabase.from("orchestration_runs").select("id,output,status").eq("id", input.orchestrationRunId).eq("project_id", input.projectId).single() : Promise.resolve({ data: null })
  ]);
  if (!project || !blueprint) throw new Error("Project or blueprint not found.");

  const { data: row, error } = await supabase.from("delivery_runs").insert({
    project_id: input.projectId,
    blueprint_id: input.blueprintId,
    content_package_id: input.contentPackageId ?? null,
    prompt_package_id: input.promptPackageId ?? null,
    orchestration_run_id: input.orchestrationRunId ?? null,
    created_by: input.createdBy,
    target: input.target,
    status: "draft"
  }).select("id").single();
  if (error || !row) throw new Error(error?.message ?? "Unable to create delivery.");

  const deliveryPackage = generateDeliveryPackage({
    deliveryId: row.id,
    project: { id: project.id, name: project.name, industry: project.industry, primaryGoal: project.primary_goal, primaryCta: project.primary_cta },
    target: input.target,
    blueprintId: blueprint.id,
    blueprint: blueprint.blueprint as WebsiteBlueprint,
    contentPackageId: contentResult.data?.id,
    content: contentResult.data?.content as ContentPackage | undefined,
    promptPackageId: promptResult.data?.id,
    prompts: promptResult.data?.package as PromptPackage | undefined,
    orchestrationRunId: reviewResult.data?.id,
    orchestration: reviewResult.data?.output as OrchestrationRunOutput | undefined
  });

  const { error: updateError } = await supabase.from("delivery_runs").update({
    status: "ready",
    manifest: deliveryPackage.manifest,
    file_count: deliveryPackage.files.length,
    total_bytes: deliveryPackage.files.reduce((total, file) => total + Buffer.byteLength(file.content), 0),
    ready_at: new Date().toISOString()
  }).eq("id", row.id);
  if (updateError) throw new Error(updateError.message);

  const { error: fileError } = await supabase.from("delivery_files").insert(deliveryPackage.files.map((file) => ({ delivery_run_id: row.id, path: file.path, content: file.content, content_type: file.contentType, purpose: file.purpose, byte_size: Buffer.byteLength(file.content) })));
  if (fileError) throw new Error(fileError.message);

  await supabase.from("implementation_events").insert({ delivery_run_id: row.id, project_id: input.projectId, event_type: "package_ready", title: "Implementation package generated", detail: `${deliveryPackage.files.length} files prepared for ${input.target}.`, created_by: input.createdBy });
  return row.id;
}
