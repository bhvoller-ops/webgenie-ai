import type { DeliveryTarget } from "./types";

export interface DeliveryTargetProfile {
  label: string;
  mode: "archive" | "repository" | "deployment" | "builder_handoff";
  description: string;
  requiredConfiguration: string[];
  generatedFiles: string[];
}

export const deliveryTargetProfiles: Record<DeliveryTarget, DeliveryTargetProfile> = {
  download: {
    label: "Download ZIP",
    mode: "archive",
    description: "Portable implementation package for local development or agency handoff.",
    requiredConfiguration: [],
    generatedFiles: ["manifest.json", "README.md", "artifacts/*", "handoff/*"]
  },
  github: {
    label: "GitHub Repository",
    mode: "repository",
    description: "Git-ready file tree with optional API publishing when a GitHub token is configured.",
    requiredConfiguration: ["repository owner", "repository name"],
    generatedFiles: ["README.md", ".github/workflows/quality.yml", "webgenie/*"]
  },
  vercel: {
    label: "Vercel",
    mode: "deployment",
    description: "Vercel-ready handoff with project configuration and deployment checklist.",
    requiredConfiguration: ["Vercel project or Git repository"],
    generatedFiles: ["vercel.json", "handoff/VERCEL_DEPLOYMENT.md"]
  },
  netlify: {
    label: "Netlify",
    mode: "deployment",
    description: "Netlify-ready handoff with build configuration and deployment checklist.",
    requiredConfiguration: ["Netlify site or Git repository"],
    generatedFiles: ["netlify.toml", "handoff/NETLIFY_DEPLOYMENT.md"]
  },
  bolt: {
    label: "Bolt.new",
    mode: "builder_handoff",
    description: "Ordered Bolt prompt package and artifact context.",
    requiredConfiguration: [],
    generatedFiles: ["handoff/BOLT_START_HERE.md", "artifacts/prompts/*"]
  },
  lovable: {
    label: "Lovable",
    mode: "builder_handoff",
    description: "Lovable-optimized build sequence with blueprint and content context.",
    requiredConfiguration: [],
    generatedFiles: ["handoff/LOVABLE_START_HERE.md", "artifacts/prompts/*"]
  },
  framer: {
    label: "Framer",
    mode: "builder_handoff",
    description: "Framer page, component, copy, SEO, and CMS implementation brief.",
    requiredConfiguration: [],
    generatedFiles: ["handoff/FRAMER_START_HERE.md", "artifacts/content/*"]
  },
  claude_code: {
    label: "Claude Code",
    mode: "builder_handoff",
    description: "Repository-oriented execution plan for Claude Code.",
    requiredConfiguration: [],
    generatedFiles: ["CLAUDE.md", "handoff/IMPLEMENTATION_PLAN.md", "artifacts/*"]
  }
};
