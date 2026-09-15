import dns from "node:dns/promises";
import net from "node:net";
import { z } from "zod";

const urlSchema = z.string().url();

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain"
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 0 ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized === "::"
  );
}

function isPrivateIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

export interface ValidatedUrl {
  normalizedUrl: string;
  hostname: string;
  resolvedAddresses: string[];
}

export async function validatePublicUrl(input: string): Promise<ValidatedUrl> {
  const parsed = urlSchema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_URL");

  const url = new URL(parsed.data);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("UNSUPPORTED_PROTOCOL");
  }

  // Finder website-preview hardening: embedded userinfo (`https://user:pass@host/`)
  // is never legitimate for a business's own public website and is a classic
  // SSRF/credential-leak vector (some HTTP clients interpret it, some ignore
  // it inconsistently) -- reject outright rather than silently stripping it.
  if (url.username || url.password) {
    throw new Error("CREDENTIALS_IN_URL");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    blockedHostnames.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("BLOCKED_HOST");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("BLOCKED_IP");
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) throw new Error("DNS_NOT_FOUND");

  const addresses = records.map((record) => record.address);
  if (addresses.some(isPrivateIp)) throw new Error("BLOCKED_IP");

  url.hash = "";
  if (url.pathname === "") url.pathname = "/";

  return {
    normalizedUrl: url.toString(),
    hostname,
    resolvedAddresses: addresses
  };
}

/**
 * Finder website-preview hardening -- shared bounds any capture-triggering
 * caller (currently only lib/prospect/finder-preview-capture.ts) applies to
 * every request the underlying headless browser makes, main document and
 * subresources alike. Centralized here, not duplicated per caller, so a
 * future capture path can't accidentally launch without them.
 */
export const CAPTURE_MAX_RESPONSE_BYTES = 15 * 1024 * 1024; // 15 MB -- generous for a real marketing page, not for an arbitrary large file.
export const CAPTURE_MAX_REDIRECTS = 5;

/** True only for a response whose Content-Type genuinely looks like an HTML document -- never assumed, always read from the real header. A capture that lands on a PDF, an image, or a JSON API response should report "unavailable," not screenshot garbage or feed non-HTML into the HTML feature extractor. */
export function isHtmlLikeContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  return /^text\/html\b|^application\/xhtml\+xml\b/i.test(contentType.trim());
}
