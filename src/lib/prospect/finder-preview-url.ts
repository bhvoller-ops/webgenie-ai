/**
 * Finder website-preview signals -- server-side URL normalization, the one
 * step Phase 6 (master prompt) requires before any request touches
 * validatePublicUrl()/the capture pipeline. A raw Google Places `website`
 * field is usually already a full `https://...` URL, but this is defensive
 * against a bare domain, stray whitespace, or a trailing slash-less origin
 * that would otherwise reach the network layer unnormalized. Deliberately
 * does NOT perform any DNS/network work itself -- that's validatePublicUrl's
 * job; this is pure string handling, testable without a network call.
 */
export interface NormalizedWebsiteUrl {
  url: string;
  error?: never;
}
export interface NormalizeError {
  url?: never;
  error: "EMPTY" | "MALFORMED";
}

export function normalizeWebsiteUrl(raw: string | null | undefined): NormalizedWebsiteUrl | NormalizeError {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { error: "EMPTY" };

  // A bare domain ("example.com") has no scheme -- default to https, never
  // http, since a real business site that only serves http would still
  // resolve (validatePublicUrl allows http) but defaulting a GUESS to the
  // safer scheme is the right call when the input didn't say.
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { error: "MALFORMED" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return { error: "MALFORMED" };
  if (!parsed.hostname || !parsed.hostname.includes(".")) return { error: "MALFORMED" };

  parsed.hash = "";
  return { url: parsed.toString() };
}
