import type { Business, GeneratedSite, GalleryIndustryKey, SiteOptions } from "@/lib/sitegen/types";
import { GALLERY_INDUSTRIES } from "@/lib/sitegen/gallery-industries";
import { renderIndustryPage } from "@/lib/renderIndustryPage";
import type { IndustryConfig } from "@/data/gallery/types";

/**
 * The generator for the 59 Gallery-sourced industries — generateSite()'s
 * sibling for the original 14 (lib/sitegen/generate.ts). Same job (a
 * Business becomes a complete, standalone HTML page with a real,
 * functioning lead-capture form), different content source: the template's
 * curated copy/services/testimonials/FAQ stay as written, only the fields
 * that identify THIS business are overridden.
 *
 * Not yet ported here from the 14's generator, deliberately (noted rather
 * than silently skipped): the "DEMO" preview ribbon and a "Site by <agency>"
 * footer credit. Both are cosmetic — SiteOptions.demoBadge/builtBy are
 * accepted for signature compatibility with generateSite() but currently
 * unused here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for signature parity with generateSite()
export function generateGallerySite(business: Business, options: SiteOptions = {}): GeneratedSite {
  const template = GALLERY_INDUSTRIES[business.industry as GalleryIndustryKey];
  if (!template) {
    throw new Error(`No gallery template for industry "${business.industry}".`);
  }

  const serviceArea =
    business.city && business.state
      ? `${business.city}, ${business.state}`
      : business.city || business.state || template.serviceArea;

  const cfg: IndustryConfig = {
    ...template,
    businessName: business.name,
    phone: business.phone || template.phone,
    serviceArea,
    heroImage: business.heroImageOverride || template.heroImage,
  };

  const html = renderIndustryPage(cfg, { live: true });

  return {
    business,
    html,
    bytes: Buffer.byteLength(html, "utf8"),
    schemaTypes: ["LocalBusiness"],
    sections: cfg.navLinks.map((link) => link.label),
  };
}
