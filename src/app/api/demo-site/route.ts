import { generateSite } from "@/lib/sitegen/generate";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import type { Business } from "@/lib/sitegen/types";

/**
 * Renders a generated demo site.
 *
 * The business is passed as base64url-encoded JSON in `b`, so no database is
 * required — a generated site is a pure function of its inputs. That also means
 * a preview link can be copied, shared, and will still work.
 *
 * `?download=1` returns it as a file attachment instead of rendering.
 */

function decode(param: string): Business | null {
  try {
    const json = Buffer.from(param, "base64url").toString("utf8");
    const b = JSON.parse(json) as Business;
    if (!b?.name || !b?.industry || !(b.industry in INDUSTRIES)) return null;
    return b;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const param = url.searchParams.get("b");
  if (!param) {
    return new Response("Missing business data.", { status: 400 });
  }

  const business = decode(param);
  if (!business) {
    return new Response("Invalid or malformed business data.", { status: 400 });
  }

  const site = generateSite(business, {
    builtBy: url.searchParams.get("by") ?? undefined,
    demoBadge: url.searchParams.get("badge") !== "0",
  });

  const filename = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
  const download = url.searchParams.get("download") === "1";

  return new Response(site.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}),
    },
  });
}
