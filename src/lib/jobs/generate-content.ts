import { createAdminClient } from "@/lib/supabase/admin";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import { generateContentPackage } from "@/lib/copy/generator";
import { contentAsMarkdown } from "@/lib/copy/export";
import type { CopyGenerationSettings } from "@/lib/copy/types";

export async function generateContentForBlueprint(blueprintId: string, settings: CopyGenerationSettings): Promise<string> {
  const supabase = createAdminClient();
  const { data: record, error } = await supabase.from("website_blueprints").select("id,project_id,blueprint,projects(industry)").eq("id", blueprintId).single();
  if (error || !record) throw new Error(error?.message ?? "Blueprint not found.");
  const project = Array.isArray(record.projects) ? record.projects[0] : record.projects;
  const content = await generateContentPackage({ projectId: record.project_id, blueprintId: record.id, industry: project?.industry ?? "business", blueprint: record.blueprint as WebsiteBlueprint, settings });
  const { data, error: saveError } = await supabase.from("content_packages").upsert({
    project_id: record.project_id,
    blueprint_id: record.id,
    schema_version: content.schemaVersion,
    provider: content.provider,
    tone: settings.tone,
    settings,
    content,
    content_markdown: contentAsMarkdown(content),
    validation_status: content.validation.valid ? "valid" : "invalid",
    validation_issues: content.validation.issues,
    updated_at: new Date().toISOString()
  }, { onConflict: "blueprint_id,tone" }).select("id").single();
  if (saveError || !data) throw new Error(saveError?.message ?? "Unable to save content package.");
  return data.id;
}
