/**
 * Demo Site Generator — types.
 *
 * A Business (from Google Places or manual entry) plus an IndustryProfile
 * produces a complete, standalone, production-quality website.
 */

export interface Business {
  id: string;
  name: string;
  industry: IndustryKey;
  phone: string;
  address: string;
  city: string;
  state: string;
  rating?: number;
  reviewCount?: number;
  hours?: string;
  /** True only when Google Places' hours data shows the business open 24 hours every day. */
  open24Hours?: boolean;
  website?: string | null;
  placeUrl?: string;
  /** Distinguishes real API results from generated sample data. */
  source: "places" | "manual" | "sample";
  /** Replaces the industry's default hero photo for this business only. */
  heroImageOverride?: string;
  /** Replaces the industry's default "in action" photo for this business only. */
  secondaryImageOverride?: string;
}

/**
 * The original 14 — full IndustryProfile content (services, trust, FAQ)
 * written and curated for the core Motion A/B trades, rendered by
 * lib/sitegen/generate.ts. Kept as its own named type (not just "the
 * first 14 of IndustryKey") because INDUSTRIES in industries.ts is keyed
 * to exactly this set, not the broader one below.
 */
export type SiteGenIndustryKey =
  | "plumber"
  | "hvac"
  | "electrician"
  | "roofer"
  | "landscaper"
  | "tree_care"
  | "cleaning"
  | "auto_repair"
  | "dentist"
  | "med_spa"
  | "chiropractor"
  | "restoration"
  | "contractor"
  | "salon";

/**
 * The other 59 industries from the Gallery template library
 * (data/gallery/industries/), rendered via lib/sitegen/gallery-site.ts
 * instead — same "generate a real client site" job, different content
 * source. This is 64 Gallery niches minus the 5 that already have a
 * better-suited SiteGenIndustryKey equivalent (auto-repair, chiropractic,
 * dental, med-spa, restoration) — kept out so the picker never offers two
 * confusingly similar options for the same real-world trade. IDs match
 * data/gallery/industries/index.ts's keys exactly (kebab-case, unlike
 * SiteGenIndustryKey's snake_case) — that's what tells generateSite()
 * which pipeline to use, see lib/sitegen/generate.ts.
 */
export type GalleryIndustryKey =
  | "accounting-tax"
  | "appliance-repair"
  | "author-writer"
  | "auto-body"
  | "auto-detailing"
  | "bakery"
  | "barber-shop"
  | "boutique"
  | "car-wash"
  | "catering"
  | "coach-consultant"
  | "coffee-shop"
  | "dance-studio"
  | "deck-patio"
  | "dj-entertainment"
  | "dog-training"
  | "driving-school"
  | "drywall"
  | "event-planning"
  | "financial-advisor"
  | "flooring"
  | "florist"
  | "gift-shop"
  | "gutters"
  | "hair-braiding"
  | "home-inspection"
  | "insurance-agency"
  | "interior-design"
  | "it-services"
  | "junk-removal"
  | "legal-services"
  | "locksmith"
  | "makeup-artist"
  | "marketing-agency"
  | "masonry"
  | "medical-wellness"
  | "mental-health"
  | "mortgage-broker"
  | "moving"
  | "music-lessons"
  | "nail-salon"
  | "nonprofit-charity"
  | "optometry"
  | "pest-control"
  | "pet-boarding"
  | "photographer-videographer"
  | "physical-therapy"
  | "pressure-washing"
  | "property-management"
  | "restaurants-cafes"
  | "spa-massage"
  | "tattoo-studio"
  | "tire-shop"
  | "towing"
  | "tutoring"
  | "urgent-care"
  | "veterinary-clinic"
  | "wedding-services"
  | "windows-doors";

export type IndustryKey = SiteGenIndustryKey | GalleryIndustryKey;

export interface ServiceSpec {
  name: string;
  blurb: string;
  /** Lucide-style icon hint, rendered as inline SVG in the output. */
  icon: IconKey;
}

export type IconKey =
  | "wrench"
  | "droplet"
  | "flame"
  | "zap"
  | "home"
  | "leaf"
  | "tree"
  | "sparkles"
  | "car"
  | "tooth"
  | "heart"
  | "shield"
  | "clock"
  | "star"
  | "thumbsUp"
  | "phone"
  | "calendar"
  | "award";

export interface TrustPoint {
  title: string;
  blurb: string;
  icon: IconKey;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface IndustryProfile {
  key: SiteGenIndustryKey;
  /** How the business describes itself: "Licensed Plumber" */
  label: string;
  /** Plural for search: "Plumbers" */
  plural: string;
  /** schema.org type — this is what makes the site citable by AI search. */
  schemaType: string;
  /** Brand colour for the generated site. */
  primary: string;
  primaryDark: string;
  /** Full-bleed hero background photo — a real, industry-relevant stock photo. */
  heroImage: string;
  /** "In action" photo shown in a band between Services and Trust sections. */
  secondaryImage: string;
  /** Hero subheadline template. {city} is substituted. */
  heroSub: string;
  /** Primary CTA verb: "Call", "Book", "Get a Quote" */
  ctaLabel: string;
  ctaSub: string;
  emergency: boolean;
  services: ServiceSpec[];
  trust: TrustPoint[];
  faq: FaqItem[];
}

export interface SiteOptions {
  /** Agency attribution shown in the footer of the demo. */
  builtBy?: string;
  /** Adds a subtle "demo" ribbon so a prospect knows it is a preview. */
  demoBadge?: boolean;
}

export interface GeneratedSite {
  business: Business;
  html: string;
  /** Byte length of the output, for the UI. */
  bytes: number;
  /** Schema types emitted — the AI-search selling point. */
  schemaTypes: string[];
  sections: string[];
}
