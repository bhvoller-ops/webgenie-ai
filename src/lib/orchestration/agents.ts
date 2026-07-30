import type { ContentPackage } from "@/lib/copy/types";
import type { PromptPackage } from "@/lib/prompts/types";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import type { AgentReview, ReviewFinding, SpecialistAgent } from "./types";

function finding(agent: SpecialistAgent, severity: ReviewFinding["severity"], title: string, detail: string, recommendation: string, targetType: ReviewFinding["targetType"], targetRef?: string): ReviewFinding {
  return { id: crypto.randomUUID(), agent, severity, title, detail, recommendation, targetType, targetRef, status: "open" };
}

function scoreFromFindings(findings: ReviewFinding[]): number {
  const penalty = findings.reduce((sum, item) => sum + ({ critical: 25, high: 15, medium: 8, low: 3 }[item.severity]), 0);
  return Math.max(0, 100 - penalty);
}

function review(agent: SpecialistAgent, summary: string, findings: ReviewFinding[], confidence = 82): AgentReview {
  return { agent, score: scoreFromFindings(findings), confidence, summary, findings, completedAt: new Date().toISOString() };
}

export function runStrategyAgent(blueprint: WebsiteBlueprint): AgentReview {
  const findings: ReviewFinding[] = [];
  if (blueprint.pages.length < 4) findings.push(finding("strategy", "high", "Insufficient page coverage", "The blueprint has fewer than four pages and may not support the full buyer journey.", "Add pages that address evaluation, proof, and contact intent.", "blueprint"));
  if (!blueprint.websiteStrategy.conversionPath?.length) findings.push(finding("strategy", "critical", "Missing conversion path", "The blueprint does not define a visitor journey.", "Define a clear path from awareness to action.", "blueprint"));
  return review("strategy", findings.length ? "The strategy is usable but has gaps that should be resolved before approval." : "The blueprint has a coherent positioning and conversion path.", findings, 88);
}

export function runConversionAgent(blueprint: WebsiteBlueprint): AgentReview {
  const findings: ReviewFinding[] = [];
  for (const page of blueprint.pages) {
    if (!page.primaryCta) findings.push(finding("conversion", "high", `Missing CTA on ${page.title}`, "This page does not define a primary next step.", "Assign one dominant CTA aligned with the page goal.", "blueprint", page.id));
    if (!page.sections.some((section) => /cta|form|contact/i.test(`${section.name} ${section.component.type}`))) findings.push(finding("conversion", page.pageType === "home" ? "high" : "medium", `Weak conversion mechanism on ${page.title}`, "No explicit conversion section was detected.", "Add a closing CTA or qualified lead form.", "blueprint", page.id));
  }
  return review("conversion", findings.length ? "Several pages need stronger action paths." : "Conversion opportunities are present across the core pages.", findings, 86);
}

export function runBrandAgent(blueprint: WebsiteBlueprint, content?: ContentPackage): AgentReview {
  const findings: ReviewFinding[] = [];
  if (!content) findings.push(finding("brand", "high", "No content package selected", "Brand consistency cannot be fully reviewed without generated page copy.", "Generate or select a content package before final approval.", "content"));
  else if (content.brandVoice.principles.length < 3) findings.push(finding("brand", "medium", "Thin brand voice system", "The content package has fewer than three voice principles.", "Expand the voice guidance with tone, vocabulary, and prohibited patterns.", "content"));
  return review("brand", findings.length ? "Brand review is incomplete or requires refinement." : "Brand voice and website structure are aligned.", findings, 78);
}

export function runSeoAgent(blueprint: WebsiteBlueprint, content?: ContentPackage): AgentReview {
  const findings: ReviewFinding[] = [];
  if (!blueprint.pages.some((page) => page.pageType === "blog" || page.pageType === "article")) findings.push(finding("seo", "low", "No resource content hub", "The sitemap has no dedicated informational content area.", "Add a resources section when organic acquisition is a strategic channel.", "blueprint"));
  if (content) {
    for (const page of content.pages) {
      if (page.metaDescription.length < 110 || page.metaDescription.length > 170) findings.push(finding("seo", "medium", `Meta description length on ${page.title}`, `The description is ${page.metaDescription.length} characters.`, "Revise it to approximately 120–160 characters while preserving intent.", "content", page.pageId));
    }
  } else findings.push(finding("seo", "high", "SEO copy not available", "Page-level titles, descriptions, and keywords were not supplied.", "Generate a content package with SEO enabled.", "content"));
  return review("seo", findings.length ? "SEO foundations exist, but the selected artifacts need improvements." : "SEO metadata and page intent are structurally sound.", findings, 84);
}

export function runAccessibilityAgent(blueprint: WebsiteBlueprint): AgentReview {
  const findings: ReviewFinding[] = [];
  const requirements = blueprint.globalRequirements.accessibility.join(" ").toLowerCase();
  for (const phrase of ["keyboard", "contrast", "alt text", "focus"]) {
    if (!requirements.includes(phrase)) findings.push(finding("accessibility", "high", `Missing ${phrase} requirement`, `The global accessibility requirements do not explicitly cover ${phrase}.`, `Add a testable ${phrase} requirement to the blueprint.`, "blueprint"));
  }
  return review("accessibility", findings.length ? "Accessibility requirements need explicit acceptance criteria." : "The blueprint includes core WCAG-oriented requirements.", findings, 90);
}

export function runTechnicalAgent(blueprint: WebsiteBlueprint, prompt?: PromptPackage): AgentReview {
  const findings: ReviewFinding[] = [];
  if (!blueprint.globalRequirements.performance.length) findings.push(finding("technical", "high", "No performance requirements", "The blueprint has no performance acceptance criteria.", "Add Core Web Vitals and asset-budget requirements.", "blueprint"));
  if (!prompt) findings.push(finding("technical", "high", "No prompt package selected", "Implementation dependencies and deployment instructions cannot be reviewed.", "Generate or select a platform prompt package.", "prompt"));
  else if (!prompt.manifest.validation.valid) findings.push(finding("technical", "critical", "Prompt package validation failed", "The selected prompt package contains blocking validation issues.", "Resolve all prompt validation errors before approval.", "prompt", prompt.manifest.packageId));
  return review("technical", findings.length ? "Technical readiness is conditional on resolving artifact gaps." : "The implementation package is technically ready for handoff.", findings, 85);
}

export function runCopyAgent(content?: ContentPackage): AgentReview {
  const findings: ReviewFinding[] = [];
  if (!content) return review("copy", "Copy review cannot begin without a content package.", [finding("copy", "critical", "Content package missing", "No generated page copy was selected.", "Generate a content package and rerun orchestration.", "content")], 96);
  for (const page of content.pages) {
    if (!page.sections.length) findings.push(finding("copy", "critical", `No sections on ${page.title}`, "The page has no usable body copy.", "Generate section copy for every blueprint section.", "content", page.pageId));
    if (page.seoTitle.length > 65) findings.push(finding("copy", "low", `Long SEO title on ${page.title}`, `The title is ${page.seoTitle.length} characters.`, "Shorten the title while preserving the primary keyword.", "content", page.pageId));
  }
  return review("copy", findings.length ? "Copy is usable but needs targeted edits." : "The selected content package is complete and structurally consistent.", findings, 87);
}

export function runPromptAgent(prompt?: PromptPackage): AgentReview {
  if (!prompt) return review("prompt", "Prompt review cannot begin without a prompt package.", [finding("prompt", "critical", "Prompt package missing", "No builder-specific implementation package was selected.", "Generate a prompt package for the intended builder.", "prompt")], 96);
  const findings = prompt.validationIssues.map((issue) => finding("prompt", issue.severity === "error" ? "critical" : issue.severity === "warning" ? "medium" : "low", issue.code, issue.message, "Update the affected prompt document and regenerate the package.", "prompt", issue.documentKind));
  return review("prompt", findings.length ? "The package contains validation findings that should be reviewed." : "The prompt package is complete and internally consistent.", findings, 92);
}
