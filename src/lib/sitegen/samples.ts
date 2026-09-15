import type { Business, SiteGenIndustryKey } from "@/lib/sitegen/types";

/**
 * One curated example per industry — for browsing site quality at a glance
 * and for pitching prospects ("here's what we build for a plumber, want to
 * see a landscaper too?") without re-running /finder each time. Generated
 * sites have no database (see api/demo-site/route.ts), so this is just
 * plausible fixture data encoded into the same demo-site URL every other
 * generated site uses — nothing here is a real business.
 */
const SAMPLES: Record<SiteGenIndustryKey, Omit<Business, "industry" | "source">> = {
  plumber: { id: "sample-plumber", name: "Cornerstone Plumbing Co.", phone: "(404) 555-0148", address: "", city: "Atlanta", state: "GA", rating: 4.9, reviewCount: 214 },
  hvac: { id: "sample-hvac", name: "Southern Comfort Heating & Air", phone: "(615) 555-0177", address: "", city: "Nashville", state: "TN", rating: 4.8, reviewCount: 341 },
  electrician: { id: "sample-electrician", name: "Bright Line Electric", phone: "(704) 555-0122", address: "", city: "Charlotte", state: "NC", rating: 4.9, reviewCount: 156 },
  roofer: { id: "sample-roofer", name: "Summit Roofing Co.", phone: "(512) 555-0193", address: "", city: "Austin", state: "TX", rating: 4.7, reviewCount: 289 },
  landscaper: { id: "sample-landscaper", name: "Evergreen Lawn & Landscape", phone: "(407) 555-0164", address: "", city: "Orlando", state: "FL", rating: 4.8, reviewCount: 178 },
  tree_care: { id: "sample-tree_care", name: "Timberline Tree Service", phone: "(352) 555-0139", address: "", city: "Marion County", state: "FL", rating: 4.6, reviewCount: 132 },
  cleaning: { id: "sample-cleaning", name: "Sparkle Squad Cleaning", phone: "(813) 555-0151", address: "", city: "Tampa", state: "FL", rating: 4.9, reviewCount: 267 },
  auto_repair: { id: "sample-auto_repair", name: "Precision Auto Care", phone: "(602) 555-0186", address: "", city: "Phoenix", state: "AZ", rating: 4.7, reviewCount: 198 },
  dentist: { id: "sample-dentist", name: "Bright Smile Dental", phone: "(919) 555-0112", address: "", city: "Raleigh", state: "NC", rating: 4.9, reviewCount: 305 },
  med_spa: { id: "sample-med_spa", name: "Glow Aesthetics Med Spa", phone: "(305) 555-0177", address: "", city: "Miami", state: "FL", rating: 4.8, reviewCount: 221 },
  chiropractor: { id: "sample-chiropractor", name: "Align Family Chiropractic", phone: "(801) 555-0143", address: "", city: "Salt Lake City", state: "UT", rating: 4.9, reviewCount: 167 },
  restoration: { id: "sample-restoration", name: "Rapid Restore Water & Fire", phone: "(214) 555-0129", address: "", city: "Dallas", state: "TX", rating: 4.8, reviewCount: 244 },
  contractor: { id: "sample-contractor", name: "Ironclad General Contracting", phone: "(720) 555-0158", address: "", city: "Denver", state: "CO", rating: 4.7, reviewCount: 191 },
  salon: { id: "sample-salon", name: "Lush Hair Studio", phone: "(206) 555-0136", address: "", city: "Seattle", state: "WA", rating: 4.9, reviewCount: 312 }
};

export const SAMPLE_BUSINESSES: Business[] = (Object.keys(SAMPLES) as SiteGenIndustryKey[]).map((industry) => ({
  ...SAMPLES[industry],
  industry,
  source: "sample"
}));

/**
 * Public Examples auth gate (WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED
 * FULL-VIEW GATE): whether a decoded `Business` (from /api/demo-site's `b=`
 * param) IS one of these 14 known illustrative fixtures -- checked by deep
 * field comparison against this module's own hardcoded array, never by
 * trusting a single client-asserted field.
 *
 * This deliberately does NOT check `business.source === "sample"` or
 * `business.id.startsWith("sample-")` alone -- see this file's own header
 * comment above for why an isolated field from an unauthenticated,
 * caller-supplied JSON payload is unsound as a security signal (the same
 * lesson already learned and documented for /api/site-lead and
 * /api/site-chat). A full match against every field of a real, known
 * fixture is safe in both directions: a caller who submits data that
 * exactly reproduces one of our own 14 samples already has nothing to
 * gain by it, and no real prospect's data can coincidentally collide with
 * all of a fixture's fields at once.
 */
export function isKnownSampleBusiness(b: Partial<Business> | null | undefined): boolean {
  if (!b) return false;
  return SAMPLE_BUSINESSES.some(
    (sample) =>
      sample.id === b.id &&
      sample.name === b.name &&
      sample.industry === b.industry &&
      sample.city === b.city &&
      sample.state === b.state &&
      sample.phone === b.phone &&
      sample.address === b.address &&
      sample.rating === b.rating &&
      sample.reviewCount === b.reviewCount &&
      sample.source === b.source
  );
}

/**
 * Sample-site safety note: an earlier version of this fix exported a
 * SAMPLE_BUSINESS_IDS allowlist here and had /api/site-lead / /api/site-chat
 * check a request's business.id against it before skipping persistence.
 * That was unsound -- business.id is just another field in an
 * unauthenticated POST body (see /api/demo-site's `b=` param, which is
 * base64url of caller-supplied JSON with no validation beyond name/
 * industry), so a caller could submit an allowlisted id alongside
 * completely different, real-looking business data and suppress
 * persistence for what could be a genuine lead. The real fix is
 * architectural: /api/sample-lead and /api/sample-chat are separate
 * endpoints that contain no persistence code at all, and only
 * server-generated sample HTML (isSample: true, decided at generation
 * time, never by the resulting page's own client-side JS) points at them.
 * See those routes and lib/sitegen/lead-form.ts / chat-widget.ts.
 */
