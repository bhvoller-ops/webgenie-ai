import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import { optimizePromptDocuments } from "./optimize";
import { platformProfiles } from "./platforms";
import { renderPromptDocuments } from "./render";
import type { PromptPackage, PromptPlatform } from "./types";
import { validatePromptPackage } from "./validate";

export function generatePromptPackage(args: {
  projectId: string;
  blueprintId: string;
  blueprint: WebsiteBlueprint;
  platform: PromptPlatform;
}): PromptPackage {
  const profile = platformProfiles[args.platform];
  const documents = optimizePromptDocuments(renderPromptDocuments(args.blueprint, profile));
  const validationIssues = validatePromptPackage(args.blueprint, documents);
  const errors = validationIssues.filter((issue) => issue.severity === "error").length;
  const warnings = validationIssues.filter((issue) => issue.severity === "warning").length;

  return {
    manifest: {
      schemaVersion: "1.0",
      packageId: crypto.randomUUID(),
      projectId: args.projectId,
      blueprintId: args.blueprintId,
      platform: args.platform,
      generatedAt: new Date().toISOString(),
      framework: profile.framework,
      documents: documents.map(({ kind, filename, title, estimatedTokens }) => ({ kind, filename, title, estimatedTokens })),
      totalEstimatedTokens: documents.reduce((sum, item) => sum + item.estimatedTokens, 0),
      validation: { valid: errors === 0, errors, warnings }
    },
    documents,
    validationIssues,
    blueprint: args.blueprint
  };
}
