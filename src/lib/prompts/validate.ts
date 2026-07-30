import type { WebsiteBlueprint } from "@/lib/blueprint/types";
import type { PromptDocument, ValidationIssue } from "./types";

export function validatePromptPackage(blueprint: WebsiteBlueprint, documents: PromptDocument[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const kinds = new Set(documents.map((document) => document.kind));
  const required = ["master", "ui", "components", "seo", "testing", "deployment"] as const;

  for (const kind of required) {
    if (!kinds.has(kind)) issues.push({ code: "MISSING_DOCUMENT", severity: "error", message: `Required ${kind} prompt is missing.`, documentKind: kind });
  }

  if (blueprint.pages.length === 0) issues.push({ code: "NO_PAGES", severity: "error", message: "Blueprint contains no pages." });
  if (!blueprint.websiteStrategy.primaryCta.trim()) issues.push({ code: "NO_PRIMARY_CTA", severity: "error", message: "Blueprint has no primary CTA." });

  const slugs = new Set<string>();
  for (const page of blueprint.pages) {
    if (slugs.has(page.slug)) issues.push({ code: "DUPLICATE_SLUG", severity: "error", message: `Duplicate page slug: ${page.slug}` });
    slugs.add(page.slug);
    if (page.sections.length === 0) issues.push({ code: "EMPTY_PAGE", severity: "warning", message: `${page.title} contains no sections.` });
    if (!page.seo.targetIntent) issues.push({ code: "MISSING_SEARCH_INTENT", severity: "warning", message: `${page.title} has no target search intent.` });
  }

  for (const document of documents) {
    if (document.markdown.includes("TODO")) issues.push({ code: "TODO_PRESENT", severity: "warning", message: `${document.filename} contains TODO instructions.`, documentKind: document.kind });
    if (document.estimatedTokens > 12000) issues.push({ code: "LARGE_DOCUMENT", severity: "warning", message: `${document.filename} may exceed a practical single-prompt size.`, documentKind: document.kind });
  }

  return issues;
}
