import type { ContentPackage } from "./types";

export function contentAsMarkdown(pkg: ContentPackage): string {
  const lines = [`# Website Content Package`, "", `Generated: ${pkg.generatedAt}`, `Tone: ${pkg.settings.tone}`, "", `## Brand Voice`, "", pkg.brandVoice.summary, ""];
  for (const page of pkg.pages) {
    lines.push(`## ${page.title}`, "", `Slug: \`${page.slug}\``, `SEO title: ${page.seoTitle}`, `Meta description: ${page.metaDescription}`, "");
    for (const section of page.sections) {
      lines.push(`### ${section.sectionName}`, "", `**${section.headline}**`, "", section.body, "");
      if (section.bullets.length) lines.push(...section.bullets.map((item) => `- ${item}`), "");
      if (section.primaryCta) lines.push(`Primary CTA: **${section.primaryCta}**`, "");
    }
    if (page.faq.length) {
      lines.push("### FAQ", "");
      for (const faq of page.faq) lines.push(`**${faq.question}**`, "", faq.answer, "");
    }
  }
  return lines.join("\n");
}

export function contentAsYaml(pkg: ContentPackage): string {
  const scalar = (value: unknown) => JSON.stringify(String(value));
  const lines = [`schemaVersion: ${scalar(pkg.schemaVersion)}`, `projectId: ${scalar(pkg.projectId)}`, `provider: ${scalar(pkg.provider)}`, "pages:"];
  for (const page of pkg.pages) {
    lines.push(`  - title: ${scalar(page.title)}`, `    slug: ${scalar(page.slug)}`, `    seoTitle: ${scalar(page.seoTitle)}`, `    metaDescription: ${scalar(page.metaDescription)}`, "    sections:");
    for (const section of page.sections) lines.push(`      - name: ${scalar(section.sectionName)}`, `        headline: ${scalar(section.headline)}`, `        body: ${scalar(section.body)}`);
  }
  return lines.join("\n");
}
