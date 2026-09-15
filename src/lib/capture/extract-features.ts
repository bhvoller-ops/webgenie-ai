import { JSDOM } from "jsdom";

export interface ExtractedFeatures {
  headings: Array<{ level: number; text: string }>;
  ctas: Array<{ text: string; href: string | null; element: string }>;
  forms: Array<{ action: string | null; method: string; fieldCount: number }>;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{ src: string | null; alt: string | null }>;
  schemaTypes: string[];
  trustSignals: string[];
  hasChatWidget: boolean;
  hasBookingWidget: boolean;
  hasMobileViewport: boolean;
  /** Finder website-preview signals: a real `tel:` link anywhere in the document -- a deterministic presence check, same class as hasChatWidget/hasBookingWidget, never a phone-number-format guess. */
  hasClickToCall: boolean;
  /** Same pattern, for `mailto:`. */
  hasEmailLink: boolean;
  /**
   * Finder website-preview signals: the WEBSITE's own text claims 24/7
   * availability -- deliberately a distinct signal from Business.open24Hours
   * (which comes from Google's structured hours data, not page text). A
   * site can say "Available 24/7" in marketing copy while Google shows
   * normal business hours, or vice versa; collapsing these into one
   * "24/7 coverage" signal would misstate which one is which (master
   * prompt Phase 4).
   */
  claims24_7: boolean;
  /**
   * Hotfix (2026-09-11, docs/history.md): false when this extraction hit
   * the exact anomaly confirmed twice in real production data -- a large,
   * genuine capture (Findlay Roofing: 200, 290 KB, 1516 words; Superior
   * Roofing: 200, 450 KB, 2457 words) whose raw stored HTML was directly
   * verified (regex on the actual stored string) to contain 17+ real
   * heading tags and the literal words "guarantee"/"insured"/"reviews" --
   * yet this same JSDOM-based extraction returned 0 headings, 0 forms, 0
   * internal links, and 0 trust signals for both. A genuinely thin/simple
   * real page can legitimately have few of these; the anomaly signature is
   * ALL of headings/forms/internalLinks/trustSignals coming back exactly
   * zero at once on a document large enough that "nothing at all" is
   * implausible. Downstream code must never treat trustSignals/ctas/forms
   * as evidence of absence when this is false -- see
   * lib/intelligence/evidence-state.ts.
   */
  extractionReliable: boolean;
}

/** The anomaly signature confirmed twice in real production captures --
 * see ExtractedFeatures.extractionReliable's own comment. Exported for
 * direct testing (scripts/verify-outreach-evidence-quality.ts) without
 * needing to construct a full JSDOM document. */
export function isExtractionAnomalous(html: string, extracted: {
  headings: unknown[];
  forms: unknown[];
  internalLinks: unknown[];
  trustSignals: unknown[];
}): boolean {
  const SUBSTANTIAL_HTML_BYTES = 5000;
  return (
    html.length > SUBSTANTIAL_HTML_BYTES &&
    extracted.headings.length === 0 &&
    extracted.forms.length === 0 &&
    extracted.internalLinks.length === 0 &&
    extracted.trustSignals.length === 0
  );
}

// Literal script/embed signatures for widgets that are either present in the
// page or not — no scoring, no judgment, just "is this string in the HTML".
const CHAT_WIDGET_SIGNATURES = [
  "widget.intercom.io",
  "intercomsettings",
  "js.driftt.com",
  "embed.tawk.to",
  "client.crisp.chat",
  "code.tidio.co",
  "cdn.livechatinc.com",
  "static.zdassets.com",
  "fb-customerchat",
  "static.olark.com",
  "wchat.freshchat.com",
  "hs-chat"
];

const BOOKING_WIDGET_SIGNATURES = [
  "calendly.com",
  "acuityscheduling.com",
  "book.squareup.com",
  "squareup.com/appointments",
  "booking.setmore.com",
  "simplybook.me",
  "vagaro.com",
  "bookings.housecallpro.com",
  "schedulicity.com",
  "10to8.com"
];

// Finder website-preview signals: literal phrase match only, no scoring --
// same discipline as the widget signatures above. Deliberately narrow
// (requires "24" and "7" adjacent with a separator, or "24 hours" combined
// with an availability word) so it doesn't fire on unrelated uses of "24"
// or "7" elsewhere on the page.
const CLAIMS_24_7_PATTERNS = [/\b24\s*\/\s*7\b/i, /\b24[-\s]?hours?\b.{0,20}\b(a day|service|available|availability|emergency|support)\b/i, /\bavailable\b.{0,20}\b24[-\s]?hours?\b/i];

export function extractFeatures(html: string, pageUrl: string): ExtractedFeatures {
  const dom = new JSDOM(html, { url: pageUrl });
  const document = dom.window.document;
  const base = new URL(pageUrl);

  const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
    .map((element) => ({
      level: Number(element.tagName.substring(1)),
      text: element.textContent?.trim() || ""
    }))
    .filter((item) => item.text.length > 0);

  const ctaSelectors = [
    "button",
    'a[role="button"]',
    'input[type="submit"]',
    "a"
  ];

  const actionWords =
    /(book|buy|get started|request|contact|call|schedule|sign up|start|learn more|download|quote|consultation)/i;

  const ctas = Array.from(document.querySelectorAll(ctaSelectors.join(",")))
    .map((element) => ({
      text:
        element.textContent?.trim() ||
        element.getAttribute("value")?.trim() ||
        "",
      href: element.getAttribute("href"),
      element: element.tagName.toLowerCase()
    }))
    .filter((item) => actionWords.test(item.text))
    .slice(0, 100);

  const forms = Array.from(document.querySelectorAll("form")).map((form) => ({
    action: form.getAttribute("action"),
    method: (form.getAttribute("method") || "get").toLowerCase(),
    fieldCount: form.querySelectorAll("input,select,textarea").length
  }));

  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();

  for (const anchor of Array.from(document.querySelectorAll("a[href]"))) {
    const href = anchor.getAttribute("href");
    if (!href) continue;

    try {
      const url = new URL(href, pageUrl);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      if (url.hostname === base.hostname) internalLinks.add(url.toString());
      else externalLinks.add(url.toString());
    } catch {
      continue;
    }
  }

  const images = Array.from(document.querySelectorAll("img"))
    .map((image) => ({
      src: image.getAttribute("src"),
      alt: image.getAttribute("alt")
    }))
    .slice(0, 300);

  const schemaTypes = new Set<string>();
  for (const script of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  )) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = item?.["@type"];
        if (typeof type === "string") schemaTypes.add(type);
        if (Array.isArray(type)) type.forEach((value) => schemaTypes.add(String(value)));
      }
    } catch {
      continue;
    }
  }

  const bodyText = document.body.textContent?.toLowerCase() || "";
  const trustKeywords = [
    "testimonial",
    "reviews",
    "trusted by",
    "certified",
    "licensed",
    "insured",
    "guarantee",
    "award",
    "years of experience",
    "case study"
  ];

  const trustSignals = trustKeywords.filter((keyword) => bodyText.includes(keyword));

  const lowerHtml = html.toLowerCase();
  const hasChatWidget = CHAT_WIDGET_SIGNATURES.some((signature) => lowerHtml.includes(signature));
  const hasBookingWidget = BOOKING_WIDGET_SIGNATURES.some((signature) => lowerHtml.includes(signature));
  const hasMobileViewport = Boolean(
    document.querySelector('meta[name="viewport"]')?.getAttribute("content")?.includes("width=device-width")
  );
  const hasClickToCall = Array.from(document.querySelectorAll("a[href]")).some((a) => (a.getAttribute("href") ?? "").toLowerCase().startsWith("tel:"));
  const hasEmailLink = Array.from(document.querySelectorAll("a[href]")).some((a) => (a.getAttribute("href") ?? "").toLowerCase().startsWith("mailto:"));
  const claims24_7 = CLAIMS_24_7_PATTERNS.some((pattern) => pattern.test(bodyText));

  const internalLinksArray = [...internalLinks].slice(0, 500);

  return {
    headings,
    ctas,
    forms,
    internalLinks: internalLinksArray,
    externalLinks: [...externalLinks].slice(0, 500),
    images,
    schemaTypes: [...schemaTypes],
    trustSignals,
    hasChatWidget,
    hasBookingWidget,
    hasMobileViewport,
    hasClickToCall,
    hasEmailLink,
    claims24_7,
    extractionReliable: !isExtractionAnomalous(html, { headings, forms, internalLinks: internalLinksArray, trustSignals })
  };
}
