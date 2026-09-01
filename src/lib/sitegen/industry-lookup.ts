import { INDUSTRIES } from "@/lib/sitegen/industries";
import { GALLERY_INDUSTRY_SUMMARY } from "@/lib/sitegen/gallery-industry-summary";
import type { IndustryKey, SiteGenIndustryKey, GalleryIndustryKey } from "@/lib/sitegen/types";

/**
 * The one place that knows how to look something up in EITHER industry
 * space without caring which. Every route/component that used to assume
 * "every IndustryKey is in INDUSTRIES" goes through here now instead —
 * that assumption broke the moment GalleryIndustryKey existed.
 *
 * Deliberately built on gallery-industry-summary.ts (the small {key,
 * label, heroImage, category} extract), never on gallery-industries.ts's
 * full configs — this module is imported from client components
 * (Finder, the industry picker), and the full configs are genuinely
 * heavy (testimonials/FAQs/pricing/chatbot data per industry). Importing
 * them here once shipped ~200KB of unused sales copy to the browser on
 * every page with an industry picker — see that file's doc comment.
 */

const GALLERY_BY_KEY = new Map(GALLERY_INDUSTRY_SUMMARY.map((g) => [g.key, g]));

export function isKnownIndustry(key: string): key is IndustryKey {
  return key in INDUSTRIES || GALLERY_BY_KEY.has(key as GalleryIndustryKey);
}

export function industryLabel(key: IndustryKey): string {
  if (key in INDUSTRIES) return INDUSTRIES[key as SiteGenIndustryKey].label;
  return GALLERY_BY_KEY.get(key as GalleryIndustryKey)?.label ?? key;
}

/** Search-query-friendly text for a Places Text Search, e.g. "Plumbers" or "Bakery". */
export function industrySearchTerm(key: IndustryKey): string {
  if (key in INDUSTRIES) return INDUSTRIES[key as SiteGenIndustryKey].plural;
  return GALLERY_BY_KEY.get(key as GalleryIndustryKey)?.label ?? key;
}

export function industryHeroImage(key: IndustryKey): string {
  if (key in INDUSTRIES) return INDUSTRIES[key as SiteGenIndustryKey].heroImage;
  return GALLERY_BY_KEY.get(key as GalleryIndustryKey)?.heroImage ?? "";
}

export function industrySecondaryImage(key: IndustryKey): string {
  if (key in INDUSTRIES) return INDUSTRIES[key as SiteGenIndustryKey].secondaryImage;
  // Gallery templates only carry one hero image, no separate "in action" shot.
  return "";
}

export interface CombinedIndustryOption {
  key: IndustryKey;
  label: string;
  category: string;
}

const CORE_TRADES_CATEGORY = "Core Trades";

/** Every selectable industry, core trades first, for the industry picker. */
export const ALL_INDUSTRY_LIST: CombinedIndustryOption[] = [
  ...Object.values(INDUSTRIES).map((p) => ({ key: p.key as IndustryKey, label: p.label, category: CORE_TRADES_CATEGORY })),
  ...GALLERY_INDUSTRY_SUMMARY.map((g) => ({ key: g.key as IndustryKey, label: g.label, category: g.category })),
];
