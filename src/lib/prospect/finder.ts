import type { Business, IndustryKey } from "@/lib/sitegen/types";
import { INDUSTRIES } from "@/lib/sitegen/industries";

/**
 * Prospect Finder.
 *
 * Two providers:
 *
 *   "sample"  — realistic generated prospects. Works instantly, costs nothing,
 *               and is what runs until a Places key is configured. Use it to
 *               demo, to learn the workflow, and to build the sales assets.
 *
 *   "places"  — Google Places API. Text Search finds businesses in the category
 *               and city; Place Details returns the `websiteUri` field. A
 *               business with no `websiteUri` is a prospect.
 *
 * To go live: set GOOGLE_PLACES_API_KEY in your environment. Enable the
 * "Places API (New)" in Google Cloud. Billing is per request — a search of
 * 20 businesses costs a few cents. Set a budget cap before you start.
 */

export const REVIEW_TIERS = [
  { key: "small", label: "Small (0–299 reviews)", min: 0, max: 299 },
  { key: "mid", label: "Mid (300–800 reviews)", min: 300, max: 800 },
  { key: "large", label: "Large (800–1,500 reviews)", min: 800, max: 1500 },
] as const;

export type ReviewTierKey = (typeof REVIEW_TIERS)[number]["key"];

/** Google's hard cap for a Places locationRestriction circle. */
export const MAX_RADIUS_MILES = 31;

export interface FinderQuery {
  industry: IndustryKey;
  city: string;
  state: string;
  limit?: number;
  /** Which review-count bracket to pull from. Defaults to "small". */
  reviewTier?: ReviewTierKey;
  /** Normalized business names (see normalizeBusinessName) to leave out — already-queued businesses. */
  excludeNormalizedNames?: Set<string>;
  /** Hard distance cap from the city center, in miles. Capped at MAX_RADIUS_MILES. Omit for Google's own (uncontrolled) text-based scope. */
  radiusMiles?: number;
}

export interface FinderResult {
  provider: "sample" | "places";
  query: FinderQuery;
  totalFound: number;
  withoutWebsite: Business[];
  withWebsite: Business[];
  /** Multi-location chains and high-volume operators, held out of the lists above. */
  likelyChains: Business[];
  ranAt: string;
  /** Present when Places was attempted but unavailable. */
  notice?: string;
}

export function hasPlacesKey() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

/* ------------------------------------------------------------------ */
/* Sample provider                                                     */
/* ------------------------------------------------------------------ */

const NAME_PARTS: Record<string, string[]> = {
  prefix: [
    "Valley Pro", "Desert Flow", "Copper State", "Quick", "Sunbelt", "Heritage",
    "Blue Ridge", "Summit", "Ironwood", "Redline", "Cornerstone", "Lakeside",
    "Prairie", "Northgate", "Silver Creek", "Traildust", "Bluebird", "Foxglove",
  ],
  suffix: [
    "Co", "Works", "Services", "Pros", "& Sons", "Group", "Solutions", "Team",
  ],
};

const CORE: Record<IndustryKey, string[]> = {
  plumber: ["Plumbing", "Water", "Pipe"],
  hvac: ["Heating & Air", "Climate", "Comfort"],
  electrician: ["Electric", "Electrical", "Power"],
  roofer: ["Roofing", "Roof", "Exteriors"],
  landscaper: ["Landscaping", "Lawn", "Grounds"],
  tree_care: ["Tree Care", "Tree Service", "Arbor"],
  cleaning: ["Cleaning", "Maids", "Clean"],
  auto_repair: ["Auto", "Automotive", "Motors"],
  dentist: ["Dental", "Dentistry", "Smiles"],
  med_spa: ["Aesthetics", "Med Spa", "Skin"],
  chiropractor: ["Chiropractic", "Spine", "Wellness"],
  restoration: ["Restoration", "Recovery", "Restore"],
  contractor: ["Construction", "Builders", "Remodeling"],
  salon: ["Salon", "Hair Studio", "Beauty"],
};

const STREETS = [
  "E Monroe Ave", "SW Union Ave", "E Elm St", "NE Lake Dr", "NW Adams Rd",
  "S Walton Blvd", "W Central Ave", "N Main St", "S Bridge St", "E Oak Ln",
  "W Pine Ridge Rd", "N Commerce Dr", "S Harvest Way", "E Juniper St",
];

/** Deterministic pseudo-random so results are stable for a given query. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleSearch(q: FinderQuery): FinderResult {
  const limit = q.limit ?? 17;
  const rand = seeded(`${q.industry}|${q.city}|${q.state}`);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const used = new Set<string>();
  const all: Business[] = [];

  for (let i = 0; i < limit; i++) {
    let name = "";
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = `${pick(NAME_PARTS.prefix)} ${pick(CORE[q.industry])} ${pick(
        NAME_PARTS.suffix
      )}`.replace(/\s+/g, " ");
      if (!used.has(candidate)) {
        name = candidate;
        used.add(candidate);
        break;
      }
    }
    if (!name) continue;

    // Roughly 60% of local businesses in these categories have no real site.
    const noSite = rand() < 0.62;
    const rating = Math.round((3.6 + rand() * 1.3) * 10) / 10;
    const reviewCount = 18 + Math.floor(rand() * 240);
    const areaCode = 400 + Math.floor(rand() * 500);

    all.push({
      id: `sample_${q.industry}_${i}`,
      name,
      industry: q.industry,
      phone: `(${areaCode}) ${100 + Math.floor(rand() * 899)}-${1000 + Math.floor(rand() * 8999)}`,
      address: `${100 + Math.floor(rand() * 8900)} ${pick(STREETS)}`,
      city: q.city,
      state: q.state,
      rating,
      reviewCount,
      hours: "Mon-Fri 8:00 AM - 5:00 PM",
      website: noSite ? null : `https://www.${name.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
      source: "sample",
    });
  }

  return {
    provider: "sample",
    query: q,
    totalFound: all.length,
    withoutWebsite: all.filter((b) => !b.website),
    withWebsite: all.filter((b) => b.website),
    likelyChains: [],
    ranAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Chain / multi-location filtering + review-count tiering             */
/* ------------------------------------------------------------------ */

const NAME_NOISE_WORDS = new Set([
  "heating", "air", "hvac", "plumbing", "electric", "electrical", "conditioning",
  "cooling", "services", "service", "inc", "llc", "co", "company", "group",
  "and", "the", "of", "solutions", "pros", "team", "contractors",
]);

/** Strips generic industry words so "Estes Services" and "Estes Heating & Air" match as the same brand. */
export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((word) => word && !NAME_NOISE_WORDS.has(word))
    .join(" ")
    .trim();
}

/**
 * Splits results into good candidates vs. multi-location chains, then buckets
 * the candidates into review-count tiers. A business is always treated as a
 * chain — regardless of tier — if the same brand name (after stripping
 * generic industry words) appears more than once in this result set; that's
 * a direct signal of multiple locations, not a review-count judgment call.
 */
function partitionChains(
  all: Business[],
  excludeNormalizedNames?: Set<string>
): { byTier: Record<ReviewTierKey, Business[]>; likelyChains: Business[] } {
  const nameCounts = new Map<string, number>();
  for (const business of all) {
    const key = normalizeBusinessName(business.name);
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  const byTier: Record<ReviewTierKey, Business[]> = { small: [], mid: [], large: [] };
  const likelyChains: Business[] = [];

  for (const business of all) {
    const key = normalizeBusinessName(business.name);
    if (excludeNormalizedNames?.has(key)) continue;

    const isMultiLocationBrand = key.length > 0 && (nameCounts.get(key) ?? 0) > 1;
    if (isMultiLocationBrand) {
      likelyChains.push(business);
      continue;
    }

    const reviews = business.reviewCount ?? 0;
    const tier = REVIEW_TIERS.find((t) => reviews >= t.min && reviews <= t.max);
    if (tier) byTier[tier.key].push(business);
    else likelyChains.push(business); // outside every defined bracket (0 reviews, or > 1500)
  }

  // Best targets first within a tier: fewer reviews reads as more likely to
  // be a genuinely small, single-location operator worth a foot-in-the-door call.
  for (const tier of REVIEW_TIERS) {
    byTier[tier.key].sort((a, b) => (a.reviewCount ?? 0) - (b.reviewCount ?? 0));
  }

  return { byTier, likelyChains };
}

/* ------------------------------------------------------------------ */
/* Google Places provider                                              */
/* ------------------------------------------------------------------ */

interface PlacesPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
}

interface BoundingBox {
  low: { latitude: number; longitude: number };
  high: { latitude: number; longitude: number };
}

const MILES_PER_DEGREE_LATITUDE = 69.0;

/**
 * Text Search's locationRestriction only accepts a rectangle (a circle is
 * only valid for locationBias, which is a soft preference, not a hard cap —
 * confirmed directly against the API, which rejects {circle} here with a 400).
 * Approximates the requested radius as a square bounding box around the
 * center point; corners run slightly past the radius (up to radius * ~1.41),
 * but it's the closest hard restriction Text Search supports.
 */
function boundingBoxForRadius(lat: number, lng: number, radiusMiles: number): BoundingBox {
  const latDelta = radiusMiles / MILES_PER_DEGREE_LATITUDE;
  const milesPerDegreeLongitude = MILES_PER_DEGREE_LATITUDE * Math.cos((lat * Math.PI) / 180);
  const lngDelta = radiusMiles / milesPerDegreeLongitude;

  return {
    low: { latitude: lat - latDelta, longitude: lng - lngDelta },
    high: { latitude: lat + latDelta, longitude: lng + lngDelta },
  };
}

/**
 * Resolves a city/state into coordinates via Google's Geocoding API — needed
 * because Places Text Search has no notion of "radius" without a center
 * point. Returns null (rather than throwing) on any failure so the caller
 * can fall back to Google's own text-based scope.
 */
async function geocodeCity(key: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const address = encodeURIComponent(state ? `${city}, ${state}` : city);
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    };
    const location = data.results?.[0]?.geometry?.location;
    return location ? { lat: location.lat, lng: location.lng } : null;
  } catch {
    return null;
  }
}

async function fetchPlacesPage(
  key: string,
  textQuery: string,
  pageToken?: string,
  boundingBox?: BoundingBox
): Promise<{ places: PlacesPlace[]; nextPageToken?: string }> {
  // Google requires paging requests to repeat the same parameters as the
  // initial search (textQuery, locationRestriction, etc.) alongside pageToken.
  const body: Record<string, unknown> = {
    textQuery,
    ...(pageToken ? { pageToken } : { maxResultCount: 20 }),
    ...(boundingBox ? { locationRestriction: { rectangle: boundingBox } } : {}),
  };

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.rating",
        "places.userRatingCount",
        "places.websiteUri",
        "places.googleMapsUri",
        "places.regularOpeningHours",
        "nextPageToken",
      ].join(","),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Places API returned ${res.status}. ${detail.slice(0, 160)}`);
  }

  const data = (await res.json()) as { places?: PlacesPlace[]; nextPageToken?: string };
  return { places: data.places ?? [], nextPageToken: data.nextPageToken };
}

/**
 * Google's page 1 is the same handful of highly-reviewed chains for almost
 * every search — it's the least useful page for finding foot-in-the-door
 * targets. Page 1 is still fetched (it's the only way to get the token for
 * page 2), but its results are discarded; only pages 2 and up are kept.
 *
 * Google Places Text Search caps out at 60 total results (pages 1–3) —
 * nextPageToken stops being returned after that, so page 4/5 rarely exist in
 * practice. The loop still tries up to MAX_PAGES and simply stops early when
 * Google runs out.
 */
const SKIP_LEADING_PAGES = 1;
const MAX_PAGES = 5;
const PAGE_TOKEN_DELAY_MS = 2000; // Google's page token needs a moment to become valid.

export async function placesSearch(q: FinderQuery): Promise<FinderResult> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return { ...sampleSearch(q), notice: "No GOOGLE_PLACES_API_KEY set — showing sample data." };
  }

  const profile = INDUSTRIES[q.industry];
  const textQuery = `${profile.plural} in ${q.city}, ${q.state}`;

  try {
    let boundingBox: BoundingBox | undefined;
    let radiusNotice: string | undefined;

    if (q.radiusMiles) {
      const clampedMiles = Math.min(q.radiusMiles, MAX_RADIUS_MILES);
      const coords = await geocodeCity(key, q.city, q.state);
      if (coords) {
        boundingBox = boundingBoxForRadius(coords.lat, coords.lng, clampedMiles);
      } else {
        radiusNotice = `Couldn't pin down coordinates for "${q.city}, ${q.state}" to apply a radius — showing Google's own search area instead.`;
      }
    }

    const places: PlacesPlace[] = [];
    let pageToken: string | undefined;
    let pagesFetched = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      if (page > 0) await new Promise((resolve) => setTimeout(resolve, PAGE_TOKEN_DELAY_MS));
      const result = await fetchPlacesPage(key, textQuery, pageToken, boundingBox);
      pagesFetched++;
      if (page >= SKIP_LEADING_PAGES) places.push(...result.places);
      if (!result.nextPageToken || result.places.length === 0) break;
      pageToken = result.nextPageToken;
    }

    const notice =
      radiusNotice ??
      (pagesFetched <= SKIP_LEADING_PAGES
        ? "Google only returned one page of results for this search, so after skipping page 1 there was nothing left. Try a broader city, a wider radius, or a different industry."
        : undefined);

    const all: Business[] = places.map((pl, i) => {
      const full = pl.formattedAddress ?? "";
      const street = full.split(",")[0] ?? full;
      return {
        id: pl.id ?? `place_${i}`,
        name: pl.displayName?.text ?? "Unknown business",
        industry: q.industry,
        phone: pl.nationalPhoneNumber ?? "",
        address: street,
        city: q.city,
        state: q.state,
        rating: pl.rating,
        reviewCount: pl.userRatingCount,
        hours: pl.regularOpeningHours?.weekdayDescriptions?.[0],
        website: pl.websiteUri ?? null,
        placeUrl: pl.googleMapsUri,
        source: "places",
      };
    });

    const { byTier, likelyChains } = partitionChains(all, q.excludeNormalizedNames);
    const tier = q.reviewTier ?? "small";
    const candidates = byTier[tier];

    return {
      provider: "places",
      query: q,
      totalFound: all.length,
      // A business with no phone number cannot be cold-called, so it is not a prospect.
      withoutWebsite: candidates.filter((b) => !b.website && b.phone),
      withWebsite: candidates.filter((b) => b.website),
      likelyChains,
      ranAt: new Date().toISOString(),
      notice,
    };
  } catch (err) {
    return {
      ...sampleSearch(q),
      notice: `Places request failed (${
        err instanceof Error ? err.message : "unknown error"
      }). Showing sample data.`,
    };
  }
}

export async function findProspects(q: FinderQuery): Promise<FinderResult> {
  return hasPlacesKey() ? placesSearch(q) : sampleSearch(q);
}

/* ------------------------------------------------------------------ */
/* CSV export                                                          */
/* ------------------------------------------------------------------ */

export function toCsv(rows: Business[]): string {
  const head = ["Business", "Phone", "Address", "City", "State", "Rating", "Reviews", "Google Maps"];
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((b) =>
    [b.name, b.phone, b.address, b.city, b.state, b.rating ?? "", b.reviewCount ?? "", b.placeUrl ?? ""]
      .map(q)
      .join(",")
  );
  return [head.map(q).join(","), ...lines].join("\n");
}
