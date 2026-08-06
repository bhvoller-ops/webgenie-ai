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

  return {
    headings,
    ctas,
    forms,
    internalLinks: [...internalLinks].slice(0, 500),
    externalLinks: [...externalLinks].slice(0, 500),
    images,
    schemaTypes: [...schemaTypes],
    trustSignals,
    hasChatWidget,
    hasBookingWidget,
    hasMobileViewport
  };
}
