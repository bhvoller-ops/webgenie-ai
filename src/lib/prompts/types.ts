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

// --- v2 presentation metadata ---

export const PLATFORM_LABELS: Record<PromptPlatform, string> = {
  claude_code: "Claude Code",
  bolt: "Bolt",
  lovable: "Lovable",
  framer: "Framer",
  v0: "v0",
  cursor: "Cursor",
  windsurf: "Windsurf",
  emergent: "Emergent",
  replit: "Replit",
};

export const DOCUMENT_KIND_LABELS: Record<PromptDocumentKind, string> = {
  master: "Master brief",
  ui: "UI & design system",
  components: "Component library",
  data: "Data model",
  auth: "Auth & roles",
  api: "API surface",
  seo: "SEO",
  ai_search: "AI search",
  testing: "Testing",
  deployment: "Deployment",
};
