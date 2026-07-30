import type { ContentPackage } from "./types";

export function validateContentPackage(pkg: ContentPackage): ContentPackage["validation"] {
  const issues: ContentPackage["validation"]["issues"] = [];
  for (const page of pkg.pages) {
    if (!page.sections.length) issues.push({ pageSlug: page.slug, severity: "error", message: "Page has no generated sections." });
    if (page.seoTitle.length > 60) issues.push({ pageSlug: page.slug, severity: "warning", message: "SEO title exceeds 60 characters." });
    if (page.metaDescription.length > 160) issues.push({ pageSlug: page.slug, severity: "warning", message: "Meta description exceeds 160 characters." });
    for (const section of page.sections) {
      if (!section.headline.trim()) issues.push({ pageSlug: page.slug, severity: "error", message: `${section.sectionName} has no headline.` });
      if (/guaranteed|best in the world|#1/i.test(`${section.headline} ${section.body}`)) issues.push({ pageSlug: page.slug, severity: "warning", message: `${section.sectionName} may contain an unsupported claim.` });
    }
  }
  return { valid: !issues.some((item) => item.severity === "error"), issues };
}
