/**
 * Public Examples auth gate (WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED
 * FULL-VIEW GATE): a shared, deliberately tiny validator for post-login
 * return paths, used by both the server-side redirects that send an
 * unauthenticated visitor to /login (see api/demo-site/route.ts and
 * api/gallery-preview/route.ts) and by /login itself when deciding where
 * to send the user after a real sign-in.
 *
 * Open-redirect prevention: a return path must be a same-origin, relative
 * path -- never an absolute URL, protocol-relative URL ("//evil.com"), a
 * backslash-relative URL ("/\evil.com", which some browsers also resolve
 * as protocol-relative), or anything containing a scheme ("javascript:",
 * "https://", etc). Anything that doesn't clearly satisfy that collapses
 * to the safe default ("/").
 */
const SAFE_DEFAULT = "/";

export function sanitizeReturnPath(raw: string | null | undefined): string {
  if (!raw) return SAFE_DEFAULT;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return SAFE_DEFAULT;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.startsWith("/\\")) return SAFE_DEFAULT;
  if (/^[a-z][a-z0-9+.-]*:/i.test(decoded) || decoded.includes("://")) return SAFE_DEFAULT;
  // A raw control character (including a bare newline/tab) has no
  // legitimate place in a real internal path and can be used to smuggle a
  // scheme past naive checks in some contexts -- reject outright.
  if (/[\x00-\x1f]/.test(decoded)) return SAFE_DEFAULT;
  return decoded;
}
