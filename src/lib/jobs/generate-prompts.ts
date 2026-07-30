import { createAdminClient } from "@/lib/supabase/admin";
import { generatePromptPackage } from "@/lib/prompts/generator";
import { promptPackageAsMarkdown } from "@/lib/prompts/export";
import type { PromptPlatform } from "@/lib/prompts/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

export async function generatePromptsForBlueprint(blueprintId: string, platform: PromptPlatform): Promise<string> {
  const supabase = createAdminClient();
  const { data: blueprintRecord, error } = await supabase
    .from("website_blueprints")
    .select("id, project_id, blueprint")
    .eq("id", blueprintId)
    .single();
  if (error || !blueprintRecord) throw new Error(error?.message ?? "Blueprint not found.");

  const promptPackage = generatePromptPackage({
    projectId: blueprintRecord.project_id,
    blueprintId: blueprintRecord.id,
    blueprint: blueprintRecord.blueprint as WebsiteBlueprint,
    platform
  });

  const { data, error: saveError } = await supabase
    .from("prompt_packages")
    .upsert({
      project_id: blueprintRecord.project_id,
      blueprint_id: blueprintRecord.id,
      target_platform: platform,
      schema_version: promptPackage.manifest.schemaVersion,
      prompt_markdown: promptPackageAsMarkdown(promptPackage),
      prompt_json: promptPackage,
      validation_status: promptPackage.manifest.validation.valid ? "valid" : "invalid",
      validation_issues: promptPackage.validationIssues,
      token_estimate: promptPackage.manifest.totalEstimatedTokens,
      updated_at: new Date().toISOString()
    }, { onConflict: "blueprint_id,target_platform" })
    .select("id")
    .single();
  if (saveError || !data) throw new Error(saveError?.message ?? "Unable to save prompt package.");
  return data.id;
}
