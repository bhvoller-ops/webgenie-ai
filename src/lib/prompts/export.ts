import type { PromptPackage } from "./types";

export function promptPackageAsMarkdown(promptPackage: PromptPackage): string {
  const header = `# WebGenie Prompt Package\n\n- Platform: ${promptPackage.manifest.platform}\n- Generated: ${promptPackage.manifest.generatedAt}\n- Estimated tokens: ${promptPackage.manifest.totalEstimatedTokens}\n- Valid: ${promptPackage.manifest.validation.valid}\n`;
  return [header, ...promptPackage.documents.map((document) => `\n---\n\n${document.markdown}`)].join("");
}

export function promptPackageAsJson(promptPackage: PromptPackage): string {
  return JSON.stringify(promptPackage, null, 2);
}

function yamlScalar(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return JSON.stringify(String(value));
}

export function manifestAsYaml(promptPackage: PromptPackage): string {
  const m = promptPackage.manifest;
  return [
    `schemaVersion: ${yamlScalar(m.schemaVersion)}`,
    `packageId: ${yamlScalar(m.packageId)}`,
    `projectId: ${yamlScalar(m.projectId)}`,
    `blueprintId: ${yamlScalar(m.blueprintId)}`,
    `platform: ${yamlScalar(m.platform)}`,
    `generatedAt: ${yamlScalar(m.generatedAt)}`,
    `framework: ${yamlScalar(m.framework)}`,
    `totalEstimatedTokens: ${m.totalEstimatedTokens}`,
    `validation:`,
    `  valid: ${m.validation.valid}`,
    `  errors: ${m.validation.errors}`,
    `  warnings: ${m.validation.warnings}`,
    `documents:`,
    ...m.documents.flatMap((d) => [
      `  - kind: ${yamlScalar(d.kind)}`,
      `    filename: ${yamlScalar(d.filename)}`,
      `    title: ${yamlScalar(d.title)}`,
      `    estimatedTokens: ${d.estimatedTokens}`
    ])
  ].join("\n") + "\n";
}
