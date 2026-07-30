import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import { generateHeuristicContent } from "./heuristic-generator";
import type { ContentPackage, CopyGenerationSettings } from "./types";
import { validateContentPackage } from "./validate";

export async function generateContentPackage(args: { projectId: string; blueprintId: string; industry: string; blueprint: WebsiteBlueprint; settings: CopyGenerationSettings }): Promise<ContentPackage> {
  // Provider boundary: model-assisted generation can replace or enrich this deterministic package.
  // The canonical schema and validation remain provider-independent.
  const pkg = generateHeuristicContent(args);
  pkg.validation = validateContentPackage(pkg);
  return pkg;
}
