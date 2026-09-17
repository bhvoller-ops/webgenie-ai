import type { IndustryConfig } from "@/data/gallery/types";

/**
 * A deterministic AI site-builder prompt derived from an illustrative
 * Gallery template's own existing config -- no per-template content to
 * author or keep in sync by hand; it's a plain function of the same
 * IndustryConfig /gallery and the homepage teaser already render from.
 * Used by the "Copy Prompt" action on both the homepage teaser and the
 * real /gallery grid.
 */
export function buildGalleryPrompt(config: IndustryConfig): string {
  const serviceList = config.services
    .slice(0, 5)
    .map((service) => service.title)
    .join(", ");

  return [
    `Build a modern, professional website for a ${config.industryName.toLowerCase()} business called "${config.businessName}".`,
    `Tagline: "${config.tagline}"`,
    serviceList ? `Highlight these services: ${serviceList}.` : null,
    `Tone: trustworthy and approachable. Include a clear call-to-action to book or get in touch, a services section, and a short "why choose us" section.`,
  ]
    .filter(Boolean)
    .join(" ");
}
