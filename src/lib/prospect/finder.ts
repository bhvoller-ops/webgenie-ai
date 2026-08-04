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

export interface FinderQuery {
  industry: IndustryKey;
  city: string;
  state: string;
  limit?: number;
}

export interface FinderResult {
  provider: "sample" | "places";
  query: FinderQuery;
  totalFound: number;
  withoutWebsite: Business[];
  withWebsite: Business[];
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
    ranAt: new Date().toISOString(),
  };
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

export async function placesSearch(q: FinderQuery): Promise<FinderResult> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return { ...sampleSearch(q), notice: "No GOOGLE_PLACES_API_KEY set — showing sample data." };
  }

  const profile = INDUSTRIES[q.industry];
  const textQuery = `${profile.plural} in ${q.city}, ${q.state}`;

  try {
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
        ].join(","),
      },
      body: JSON.stringify({ textQuery, maxResultCount: q.limit ?? 20 }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        ...sampleSearch(q),
        notice: `Places API returned ${res.status}. Showing sample data. ${detail.slice(0, 160)}`,
      };
    }

    const data = (await res.json()) as { places?: PlacesPlace[] };
    const places = data.places ?? [];

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

    return {
      provider: "places",
      query: q,
      totalFound: all.length,
      // A business with no phone number cannot be cold-called, so it is not a prospect.
      withoutWebsite: all.filter((b) => !b.website && b.phone),
      withWebsite: all.filter((b) => b.website),
      ranAt: new Date().toISOString(),
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
