export const deliveryTargets = [
  "download",
  "github",
  "vercel",
  "netlify",
  "bolt",
  "lovable",
  "framer",
  "claude_code"
] as const;

export type DeliveryTarget = (typeof deliveryTargets)[number];
export type DeliveryStatus =
  | "draft"
  | "ready"
  | "publishing"
  | "delivered"
  | "failed"
  | "cancelled";

export interface DeliveryFile {
  path: string;
  content: string;
  contentType: "text" | "json" | "yaml" | "markdown";
  purpose: string;
}

export interface DeliveryConfiguration {
  repositoryOwner?: string;
  repositoryName?: string;
  branch?: string;
  commitMessage?: string;
  deploymentProject?: string;
  production?: boolean;
}

export interface DeliveryManifest {
  schemaVersion: "1.0";
  deliveryId: string;
  projectId: string;
  projectName: string;
  target: DeliveryTarget;
  generatedAt: string;
  sourceArtifacts: {
    blueprintId: string;
    contentPackageId?: string;
    promptPackageId?: string;
    orchestrationRunId?: string;
  };
  implementation: {
    framework: string;
    packageManager: string;
    buildCommand: string;
    outputMode: string;
    environmentVariables: string[];
  };
  files: Array<{
    path: string;
    purpose: string;
    bytes: number;
  }>;
  handoffChecklist: string[];
}

export interface DeliveryPackage {
  manifest: DeliveryManifest;
  files: DeliveryFile[];
  instructions: string[];
}
