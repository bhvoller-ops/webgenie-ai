import type { PromptPlatform } from "./types";

export interface PlatformProfile {
  id: PromptPlatform;
  label: string;
  framework: string;
  outputMode: string;
  capabilities: string[];
  restrictions: string[];
  openingInstruction: string;
}

export const platformProfiles: Record<PromptPlatform, PlatformProfile> = {
  claude_code: {
    id: "claude_code",
    label: "Claude Code",
    framework: "Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase",
    outputMode: "Create and edit repository files directly.",
    capabilities: ["multi-file repository", "terminal commands", "tests", "migrations"],
    restrictions: ["Do not merely explain the implementation", "Do not leave TODO-only files"],
    openingInstruction: "Act as the senior engineer responsible for implementing this production website in the current repository."
  },
  bolt: {
    id: "bolt",
    label: "Bolt.new",
    framework: "React, TypeScript, Tailwind CSS, Supabase",
    outputMode: "Build a runnable full-stack web application in the Bolt workspace.",
    capabilities: ["visual app generation", "Supabase", "iterative file edits"],
    restrictions: ["Prefer supported packages", "Keep setup executable inside Bolt"],
    openingInstruction: "Build the complete application in Bolt.new from the specification below."
  },
  lovable: {
    id: "lovable",
    label: "Lovable",
    framework: "React, TypeScript, Tailwind CSS, Supabase",
    outputMode: "Generate a polished responsive application with working flows.",
    capabilities: ["UI generation", "Supabase integration", "responsive components"],
    restrictions: ["Avoid unsupported server infrastructure", "Use Lovable-compatible patterns"],
    openingInstruction: "Create a production-quality Lovable project using the exact product and page requirements below."
  },
  framer: {
    id: "framer",
    label: "Framer",
    framework: "Framer Sites and React Code Components where necessary",
    outputMode: "Create the site structure, sections, CMS requirements, interactions, and component instructions.",
    capabilities: ["responsive website", "CMS collections", "animations", "forms"],
    restrictions: ["Do not prescribe backend code Framer cannot run", "Use Code Components sparingly"],
    openingInstruction: "Build this website in Framer using native layout, components, CMS, and interactions whenever possible."
  },
  v0: {
    id: "v0",
    label: "v0",
    framework: "Next.js, React, TypeScript, Tailwind CSS, shadcn/ui",
    outputMode: "Generate production-ready UI and route components.",
    capabilities: ["Next.js UI", "shadcn/ui", "responsive components"],
    restrictions: ["Keep backend assumptions explicit", "Do not invent unavailable data"],
    openingInstruction: "Generate the responsive Next.js application UI and supporting route structure described below."
  },
  cursor: {
    id: "cursor",
    label: "Cursor",
    framework: "Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase",
    outputMode: "Modify the repository with complete implementation and tests.",
    capabilities: ["repository agent", "multi-file edits", "tests", "terminal"],
    restrictions: ["Inspect existing code before changing it", "Preserve established architecture"],
    openingInstruction: "Work as a repository-aware senior engineer and implement this specification end to end."
  },
  windsurf: {
    id: "windsurf",
    label: "Windsurf",
    framework: "Next.js, React, TypeScript, Tailwind CSS, Supabase",
    outputMode: "Implement the project through coordinated repository changes.",
    capabilities: ["agentic coding", "multi-file edits", "terminal"],
    restrictions: ["Keep changes coherent across files", "Run validation after implementation"],
    openingInstruction: "Implement the following production website as a coherent repository change set."
  },
  emergent: {
    id: "emergent",
    label: "Emergent",
    framework: "React or Next.js, TypeScript, managed backend integrations",
    outputMode: "Generate and deploy a working application using supported infrastructure.",
    capabilities: ["full-stack generation", "deployment", "integrations"],
    restrictions: ["Use supported managed services", "Avoid unnecessary custom infrastructure"],
    openingInstruction: "Generate a complete deployable application from the product specification below."
  },
  replit: {
    id: "replit",
    label: "Replit Agent",
    framework: "Next.js or React, TypeScript, PostgreSQL/Supabase",
    outputMode: "Create a runnable Replit project with setup and deployment instructions.",
    capabilities: ["full-stack coding", "database", "deployment"],
    restrictions: ["Keep environment variables documented", "Ensure the Run command works"],
    openingInstruction: "Create this complete application in the current Replit workspace and make it runnable."
  }
};
