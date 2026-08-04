import type { Business } from "@/lib/sitegen/types";

/**
 * A generated site is a pure function of its inputs, so a demo link needs no
 * database — the business travels in the URL. Works in the browser and on the
 * server, which is why this uses btoa/atob rather than Buffer.
 */

function toBase64Url(s: string) {
  const b64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(s)))
      : Buffer.from(s, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encodeBusiness(b: Business): string {
  return toBase64Url(JSON.stringify(b));
}

export function demoSiteUrl(
  b: Business,
  opts: { by?: string; download?: boolean; badge?: boolean } = {}
) {
  const params = new URLSearchParams({ b: encodeBusiness(b) });
  if (opts.by) params.set("by", opts.by);
  if (opts.download) params.set("download", "1");
  if (opts.badge === false) params.set("badge", "0");
  return `/api/demo-site?${params.toString()}`;
}
