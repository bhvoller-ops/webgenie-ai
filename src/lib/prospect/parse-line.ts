/**
 * Classifies one pasted line from the "New Project" bulk-add box into either
 * a Google Places search query or a direct website URL.
 *
 * Handles three shapes a person actually pastes:
 *   1. A Google Business Profile / Maps link — full (google.com/maps/place/...)
 *      or a shortened share link (maps.app.goo.gl/..., goo.gl/maps/..., g.co/kgs/...).
 *      Short links carry no readable info themselves, so this follows the
 *      redirect first, then pulls the business name out of the resolved
 *      /maps/place/<name>/ path segment.
 *   2. A plain website URL (not a Maps link) — passed straight through as
 *      the business's existing site.
 *   3. Plain text (a business name, optionally with a city) — used as-is
 *      for a Places Text Search.
 */

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "g.co", "g.page"]);

function isMapsUrl(url: URL): boolean {
  if (SHORT_LINK_HOSTS.has(url.hostname)) return true;
  if (!/(^|\.)google\.[a-z.]+$/i.test(url.hostname)) return false;
  // Covers both the /maps/place/<name>/... share link and the cid-based
  // permalink (maps.google.com/?cid=...) — the exact shape Places API's own
  // googleMapsUri field returns, and one Google's Business Profile "Share"
  // panel still produces. Without this second check a cid link would fall
  // through as an ordinary website URL and get treated as the business's
  // real site, which it isn't.
  return url.pathname.startsWith("/maps") || url.searchParams.has("cid");
}

export type ClassifiedLine = { kind: "search"; value: string } | { kind: "website"; value: string };

export async function classifyLine(rawLine: string): Promise<ClassifiedLine> {
  const line = rawLine.trim();

  let url: URL | null = null;
  try {
    url = new URL(line);
  } catch {
    url = null;
  }

  if (!url || !/^https?:$/.test(url.protocol)) {
    // Not a URL at all — a plain business name (and maybe a city).
    return { kind: "search", value: line };
  }

  if (!isMapsUrl(url)) {
    // A regular website URL — this is the "audit an existing site" case.
    return { kind: "website", value: url.toString() };
  }

  let resolved = url;
  if (SHORT_LINK_HOSTS.has(url.hostname)) {
    try {
      const res = await fetch(url.toString(), { redirect: "follow" });
      resolved = new URL(res.url);
    } catch {
      // Couldn't follow the short link — fall back to the raw line as search
      // text. Places Text Search will most likely find nothing for a bare
      // URL, but it's a harmless last resort rather than failing outright.
      return { kind: "search", value: line };
    }
  }

  const match = resolved.pathname.match(/\/maps\/place\/([^/]+)/);
  if (match) {
    const name = decodeURIComponent(match[1].replace(/\+/g, " "));
    return { kind: "search", value: name };
  }

  return { kind: "search", value: line };
}
