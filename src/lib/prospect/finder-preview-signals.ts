import type { ExtractedFeatures } from "@/lib/capture/extract-features";

/**
 * Finder website-preview preliminary signals (master prompt Phase 4/5).
 * Every signal is exactly one of three states -- never collapsed. "Unknown"
 * covers missing data, a timeout, blocked crawling, or a page that was
 * simply never inspected; it must never be presented as "Not detected."
 * Every signal also retains where it came from, so nothing here can be
 * confused with real audit evidence (Phase 5: "Do not describe Finder
 * detection as verified evidence, an audit finding, outreach-ready
 * evidence, or a confirmed business deficiency").
 */
export type SignalState = "present" | "not_detected" | "unknown";
export type SignalSource = "google_business_listing" | "website_capture" | "existing_audit" | "unknown";

export interface FinderSignal {
  key: SignalKey;
  label: string;
  state: SignalState;
  source: SignalSource;
}

export type SignalKey =
  | "chat_widget"
  | "online_booking"
  | "contact_form"
  | "click_to_call"
  | "email_link"
  | "https"
  | "mobile_viewport"
  | "google_open_24_hours"
  | "website_24_7_claim"
  | "full_audit";

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  chat_widget: "Chat widget",
  online_booking: "Online booking",
  contact_form: "Contact form",
  click_to_call: "Click-to-call",
  email_link: "Email link",
  https: "HTTPS",
  mobile_viewport: "Mobile viewport",
  google_open_24_hours: "Google open 24 hours",
  website_24_7_claim: "Website 24/7 claim",
  full_audit: "Full audit"
};

/** Display text per (key, state) -- "Full audit" reads as Run/Not run, not the generic Present/Not detected, per the master prompt's own worked example ("Full audit — Not run"). Every other signal uses the shared generic wording. */
export function signalStateLabel(key: SignalKey, state: SignalState): string {
  if (key === "full_audit") {
    return state === "present" ? "Run" : state === "not_detected" ? "Not run" : "Unknown";
  }
  return state === "present" ? "Present" : state === "not_detected" ? "Not detected" : "Unknown";
}

function bool3(value: boolean | undefined, source: SignalSource): { state: SignalState; source: SignalSource } {
  if (value === undefined) return { state: "unknown", source: "unknown" };
  return { state: value ? "present" : "not_detected", source };
}

/**
 * Google-listing-derived signals -- available the moment a Finder result
 * exists, no capture required. `open24Hours` is already three-state
 * (`boolean | undefined`) since lib/prospect/finder.ts's isOpen24Hours() fix
 * -- undefined here means Google returned no/incomplete hours data, not
 * "confirmed not 24/7."
 */
export function computeListingSignals(input: { open24Hours: boolean | undefined }): FinderSignal[] {
  const g = bool3(input.open24Hours, "google_business_listing");
  return [{ key: "google_open_24_hours", label: SIGNAL_LABELS.google_open_24_hours, state: g.state, source: g.source }];
}

/**
 * Full-audit status -- always knowable (a completed audit either exists or
 * it doesn't), so this is the one signal that's never "unknown."
 */
export function computeAuditSignal(hasCompletedAudit: boolean): FinderSignal {
  return { key: "full_audit", label: SIGNAL_LABELS.full_audit, state: hasCompletedAudit ? "present" : "not_detected", source: "existing_audit" };
}

/**
 * Website-capture-derived signals. Pass `null` for `features`/`finalUrl`
 * when no capture has ever succeeded for this business (preview state is
 * "not_generated," "unavailable," "loading," or "failed") -- every signal
 * in this group then reports "unknown," never "not_detected." This is the
 * one rule this module exists to enforce (master prompt Phase 4: "Never
 * convert missing data ... into Not detected").
 */
export function computeWebsiteCaptureSignals(input: { features: ExtractedFeatures | null; finalUrl: string | null }): FinderSignal[] {
  const { features, finalUrl } = input;
  const make = (key: SignalKey, value: boolean | undefined): FinderSignal => {
    const { state, source } = bool3(value, "website_capture");
    return { key, label: SIGNAL_LABELS[key], state, source };
  };

  if (!features) {
    return (["chat_widget", "online_booking", "contact_form", "click_to_call", "email_link", "https", "mobile_viewport", "website_24_7_claim"] as SignalKey[]).map((key) => make(key, undefined));
  }

  const isHttps = finalUrl ? finalUrl.toLowerCase().startsWith("https://") : undefined;

  return [
    make("chat_widget", features.hasChatWidget),
    make("online_booking", features.hasBookingWidget),
    make("contact_form", features.forms.length > 0),
    make("click_to_call", features.hasClickToCall),
    make("email_link", features.hasEmailLink),
    make("https", isHttps),
    make("mobile_viewport", features.hasMobileViewport),
    make("website_24_7_claim", features.claims24_7)
  ];
}

/** The full, ordered signal list a Finder result card renders -- listing signals, then website-capture signals, then the audit signal, matching the master prompt's own required-signal list order. */
export function computeAllSignals(input: {
  open24Hours: boolean | undefined;
  hasCompletedAudit: boolean;
  features: ExtractedFeatures | null;
  finalUrl: string | null;
}): FinderSignal[] {
  return [...computeWebsiteCaptureSignals({ features: input.features, finalUrl: input.finalUrl }), ...computeListingSignals({ open24Hours: input.open24Hours }), computeAuditSignal(input.hasCompletedAudit)];
}
