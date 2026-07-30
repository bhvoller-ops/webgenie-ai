import type { PageType } from "@/lib/blueprint/types";

export const copyTones = ["clear", "professional", "friendly", "bold", "premium"] as const;
export type CopyTone = (typeof copyTones)[number];

export interface CopyGenerationSettings {
  tone: CopyTone;
  readingLevel: "simple" | "general" | "expert";
  includeSeo: boolean;
  includeFaqs: boolean;
  avoidClaims: string[];
}

export interface SectionCopy {
  sectionId: string;
  sectionName: string;
  eyebrow?: string;
  headline: string;
  body: string;
  bullets: string[];
  primaryCta?: string;
  secondaryCta?: string;
  proofPlaceholder?: string;
}

export interface PageCopy {
  pageId: string;
  pageType: PageType;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  socialDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  sections: SectionCopy[];
  faq: Array<{ question: string; answer: string }>;
}

export interface ContentPackage {
  schemaVersion: "1.0";
  projectId: string;
  blueprintId: string;
  generatedAt: string;
  provider: string;
  settings: CopyGenerationSettings;
  brandVoice: {
    summary: string;
    principles: string[];
    prohibitedPatterns: string[];
  };
  pages: PageCopy[];
  validation: {
    valid: boolean;
    issues: Array<{ pageSlug: string; severity: "error" | "warning"; message: string }>;
  };
}
