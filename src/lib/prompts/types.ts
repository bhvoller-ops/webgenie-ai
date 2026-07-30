import type { WebsiteBlueprint } from "@/lib/blueprint/types";

export const promptPlatforms = [
  "claude_code",
  "bolt",
  "lovable",
  "framer",
  "v0",
  "cursor",
  "windsurf",
  "emergent",
  "replit"
] as const;

export type PromptPlatform = (typeof promptPlatforms)[number];

export type PromptDocumentKind =
  | "master"
  | "ui"
  | "components"
  | "data"
  | "auth"
  | "api"
  | "seo"
  | "ai_search"
  | "testing"
  | "deployment";

export interface PromptDocument {
  kind: PromptDocumentKind;
  filename: string;
  title: string;
  markdown: string;
  estimatedTokens: number;
}

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  documentKind?: PromptDocumentKind;
}

export interface PromptPackageManifest {
  schemaVersion: "1.0";
  packageId: string;
  projectId: string;
  blueprintId: string;
  platform: PromptPlatform;
  generatedAt: string;
  framework: string;
  documents: Array<{
    kind: PromptDocumentKind;
    filename: string;
    title: string;
    estimatedTokens: number;
  }>;
  totalEstimatedTokens: number;
  validation: {
    valid: boolean;
    errors: number;
    warnings: number;
  };
}

export interface PromptPackage {
  manifest: PromptPackageManifest;
  documents: PromptDocument[];
  validationIssues: ValidationIssue[];
  blueprint: WebsiteBlueprint;
}
