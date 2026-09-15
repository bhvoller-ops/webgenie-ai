import { generateSite } from "@/lib/sitegen/generate";
import { SAMPLE_BUSINESSES } from "@/lib/sitegen/samples";
import { getAccessContext } from "@/lib/auth/access";
import { sanitizeReturnPath } from "@/lib/auth/return-path";

/**
 * Public Examples auth gate (WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED
 * FULL-VIEW GATE, FINAL pass): the ONE and only authenticated full-view
 * route for the 14 curated SAMPLE_BUSINESSES fixtures. Replaces an
 * earlier, rejected approach that tried to classify a client-supplied
 * `/api/demo-site?b=<base64 business JSON>` payload as "a known sample" --
 * a minimally altered payload (any field off by one character) failed
 * that classification and fell straight through to /api/demo-site's
 * normal unauthenticated rendering, a real bypass. This route has no
 * equivalent failure mode because it never decodes or trusts ANY
 * client-supplied business data at all:
 *
 *  - The only input this route accepts is `?id=`, a canonical sample id
 *    ("sample-plumber", etc.) -- checked against SAMPLE_BUSINESSES by
 *    exact string equality on `.id`. An id that doesn't match returns a
 *    real 404, never a guess or a fallback render.
 *  - The complete business record is then resolved ENTIRELY server-side
 *    from that same array -- name, phone, address, city, state, rating,
 *    reviewCount, industry. None of it can be overridden by the request.
 *  - `isSample`/`source`/any other business field, and any organization
 *    id, are never read from the request at all -- there is nothing here
 *    for a caller to override even in principle, unlike /api/demo-site's
 *    `?org=`/`?by=`/`?badge=` (which are legitimate there because that
 *    route renders a REAL prospect's own business, not a fixture).
 *  - Auth is checked before generateSite() is ever called; an
 *    unauthenticated request never sees rendered content, only a 302 to
 *    /login with a sanitized returnTo.
 *  - No database or storage write of any kind. No call into
 *    lib/sitegen/lead-form.ts's or chat-widget.ts's live-persistence path
 *    -- generateSite() is called with isSample: true, the same flag that
 *    already made /api/demo-site's sample rendering point its embedded
 *    lead form/chat widget at the non-persisting /api/sample-lead and
 *    /api/sample-chat endpoints (see those routes' own headers).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Missing sample id.", { status: 400 });
  }

  const business = SAMPLE_BUSINESSES.find((b) => b.id === id);
  if (!business) {
    return new Response("Unknown sample id.", { status: 404 });
  }

  const { user } = await getAccessContext();
  if (!user) {
    const returnTo = sanitizeReturnPath(`${url.pathname}${url.search}`);
    return Response.redirect(new URL(`/login?returnTo=${encodeURIComponent(returnTo)}`, request.url), 302);
  }

  const site = generateSite(business, {
    builtBy: "WebGenie AI",
    demoBadge: true,
    isSample: true
  });

  return new Response(site.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
