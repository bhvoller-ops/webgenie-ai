import { INDUSTRIES } from "@/lib/sitegen/industries";
import { GALLERY_INDUSTRY_SUMMARY } from "@/lib/sitegen/gallery-industry-summary";
import type { IndustryKey, SiteGenIndustryKey, GalleryIndustryKey } from "@/lib/sitegen/types";

// Deliberately does NOT import from industry-lookup.ts, even though that
// module also needs this one (for ALL_INDUSTRY_LIST's display label) —
// avoids a circular import between the two.

/**
 * Finder's own industry taxonomy layer — deliberately separate from
 * `IndustryProfile.label`/`.plural` (industries.ts) and from
 * `industryLabel()`/`industrySearchTerm()` (industry-lookup.ts).
 *
 * The governing rule (WEBGENIE FINDER OBJECTIVE, INDUSTRY TAXONOMY +
 * SEARCH COVERAGE PROMPT, 10 Sep 2026): BROADER VISIBLE INDUSTRY LABEL +
 * BROADER SEARCH INTENT + STABLE INTERNAL KEY. "Roofing Contractor" (the
 * existing `IndustryProfile.label`) reads as one narrow job title, not
 * the whole roofing market — and the existing Google Places Text Search
 * used `.plural` ("Roofing Companies"), an equally narrow phrase.
 *
 * Why this is a NEW layer rather than editing `IndustryProfile.label` in
 * place: `industryLabel()` is not purely a UI string. It is also:
 *   - baked into every generated site's own copy ("Licensed Plumber in
 *     Atlanta") via IndustryProfile.label itself,
 *   - PERSISTED as literal text into `projects.industry` on every project
 *     insert (api/audits/queue, api/prospects/[id]/actions, api/projects/
 *     bulk all call `industryLabel()` when writing that column), and
 *   - used to MATCH existing rows for the "don't re-suggest an
 *     already-queued business" dedup query in api/audits/queue
 *     (`.eq("industry", industryLabel(industry))`).
 * Widening `industryLabel()`'s own output would silently rewrite
 * generated-site copy and break that dedup match against every project
 * created before the change — the exact "no migration of historical data
 * should be necessary" trap this taxonomy prompt's own compatibility
 * section warns about. `industryLabel()`/`industrySearchTerm()` are left
 * completely untouched; only Finder's own picker display and its Places
 * Text Search query are widened, through the two functions below.
 *
 * Scope of the overrides: reviewed all 73 selectable industries. The
 * mismatch is concentrated in the 14 core trades, whose `IndustryProfile
 * .label` is written in a narrow job-title style ("Licensed Plumber",
 * "Roofing Contractor") for generated-site copy, not market-search
 * copy — every one of the 14 gets both a broader display label and
 * search term below. The 59 Gallery industries already use a
 * market-level label as both their display AND their existing search
 * term (industrySearchTerm() returns the Gallery label directly) — most
 * needed no change; the two genuinely narrow/awkward ones ("Legal
 * Services / Law Firm", "Property Management Services") are trimmed to
 * match this prompt's own style guide.
 */

export interface FinderIndustryTaxonomy {
  key: IndustryKey;
  /** Shown in Finder/Audit/New Project's shared industry picker. */
  displayLabel: string;
  /** The Google Places Text Search term used for this industry's category search. */
  searchTerm: string;
  /**
   * Documentation only — narrower phrases this market label is meant to
   * conceptually cover. Never used to multiply Google Places API calls;
   * one broad query per search, same as before this change.
   */
  aliases?: string[];
}

/** Overrides for the 14 core trades — every one gets both fields widened. */
const CORE_OVERRIDES: Record<SiteGenIndustryKey, Omit<FinderIndustryTaxonomy, "key">> = {
  plumber: { displayLabel: "Plumbing", searchTerm: "plumbing", aliases: ["plumber", "plumbing company", "drain cleaning", "water heater repair"] },
  hvac: { displayLabel: "HVAC", searchTerm: "HVAC", aliases: ["heating and air conditioning", "furnace repair", "AC repair", "heating and cooling"] },
  electrician: { displayLabel: "Electrical", searchTerm: "electrical services", aliases: ["electrician", "electrical contractor", "residential electrician", "commercial electrician"] },
  roofer: { displayLabel: "Roofing", searchTerm: "roofing", aliases: ["roofing company", "roofing contractor", "roof repair", "roof replacement", "metal roofing", "storm damage roofing"] },
  landscaper: { displayLabel: "Landscaping", searchTerm: "landscaping", aliases: ["landscaper", "lawn care", "lawn maintenance", "yard service"] },
  tree_care: { displayLabel: "Tree Services", searchTerm: "tree service", aliases: ["tree care", "tree removal", "arborist", "tree trimming"] },
  cleaning: { displayLabel: "Cleaning Services", searchTerm: "cleaning services", aliases: ["house cleaning", "maid service", "janitorial", "commercial cleaning"] },
  auto_repair: { displayLabel: "Auto Repair", searchTerm: "auto repair", aliases: ["mechanic", "car repair", "auto shop", "automotive repair"] },
  dentist: { displayLabel: "Dentistry", searchTerm: "dentist", aliases: ["dental practice", "family dentist", "cosmetic dentist"] },
  med_spa: { displayLabel: "Med Spa", searchTerm: "med spa", aliases: ["medical spa", "aesthetics", "skin care clinic"] },
  chiropractor: { displayLabel: "Chiropractic", searchTerm: "chiropractor", aliases: ["chiropractic clinic", "spine care"] },
  restoration: { displayLabel: "Restoration", searchTerm: "restoration company", aliases: ["water damage restoration", "fire damage restoration", "disaster recovery"] },
  contractor: { displayLabel: "General Contracting", searchTerm: "general contractor", aliases: ["construction company", "remodeling contractor", "home builder", "renovation"] },
  salon: { displayLabel: "Hair Salon", searchTerm: "hair salon", aliases: ["hair studio", "beauty salon", "barbershop"] }
};

/** A small number of Gallery labels trimmed to match this prompt's own style guide — everything else in Gallery already used a broad market label, unchanged. */
const GALLERY_OVERRIDES: Partial<Record<GalleryIndustryKey, string>> = {
  "legal-services": "Legal Services",
  "property-management": "Property Management"
};

const GALLERY_LABEL_BY_KEY = new Map(GALLERY_INDUSTRY_SUMMARY.map((g) => [g.key, g.label]));

function buildTaxonomy(key: IndustryKey): FinderIndustryTaxonomy {
  if (key in INDUSTRIES) {
    const override = CORE_OVERRIDES[key as SiteGenIndustryKey];
    return { key, displayLabel: override.displayLabel, searchTerm: override.searchTerm, aliases: override.aliases };
  }
  const galleryLabel = GALLERY_OVERRIDES[key as GalleryIndustryKey] ?? GALLERY_LABEL_BY_KEY.get(key as GalleryIndustryKey) ?? key;
  return { key, displayLabel: galleryLabel, searchTerm: galleryLabel };
}

const TAXONOMY_BY_KEY = new Map<IndustryKey, FinderIndustryTaxonomy>(
  [...Object.keys(INDUSTRIES), ...GALLERY_INDUSTRY_SUMMARY.map((g) => g.key)].map((key) => [
    key as IndustryKey,
    buildTaxonomy(key as IndustryKey)
  ])
);

/** Finder/Audit/New Project's shared picker display label — broader than industryLabel(), which stays a narrow job-title string for generated-site copy and persisted project data. */
export function finderDisplayLabel(key: IndustryKey): string {
  return TAXONOMY_BY_KEY.get(key)?.displayLabel ?? key;
}

/** The Google Places Text Search term for this industry's category search — broader market coverage, still one query per search (never multiplied per-alias). */
export function finderSearchTerm(key: IndustryKey): string {
  return TAXONOMY_BY_KEY.get(key)?.searchTerm ?? key;
}

export function finderIndustryTaxonomy(key: IndustryKey): FinderIndustryTaxonomy | undefined {
  return TAXONOMY_BY_KEY.get(key);
}
