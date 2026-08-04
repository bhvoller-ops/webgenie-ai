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
  website?: string | null;
  placeUrl?: string;
  /** Distinguishes real API results from generated sample data. */
  source: "places" | "manual" | "sample";
}

export type IndustryKey =
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
  key: IndustryKey;
  /** How the business describes itself: "Licensed Plumber" */
  label: string;
  /** Plural for search: "Plumbers" */
  plural: string;
  /** schema.org type — this is what makes the site citable by AI search. */
  schemaType: string;
  /** Brand colour for the generated site. */
  primary: string;
  primaryDark: string;
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
