import { industryList } from "@/data/gallery/industries";
import { renderIndustryPage } from "@/lib/renderIndustryPage";
import { getAccessContext } from "@/lib/auth/access";

/**
 * Public Examples auth gate (WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED
 * FULL-VIEW GATE): the real, server-side renderer for a /gallery
 * industry's full page -- gallery-client.tsx used to call
 * renderIndustryPage() directly in the browser (a pure function of
 * already-bundled static config, no server round trip at all). Full-view
 * access must be checked server-side, not only by hiding the trigger
 * button in React, so the actual full-page HTML now only ever leaves the
 * server after a real authenticated request.
 *
 * `id` identifies one of the 64 static, non-secret industry template
 * configs in data/gallery/industries -- looked up here against that same
 * server-side array, never constructed from caller-supplied content.
 *
 * Honest limitation (see the final report): industryList itself is still
 * part of the client bundle (gallery-client.tsx needs it for search,
 * filtering, and thumbnails, all of which stay public by design), so this
 * does not make the underlying template config secret -- it removes the
 * one-click unauthenticated action and the direct-URL path to the
 * assembled full-page output, which is the scope this correction asked
 * for. See generateSite's own `isSample`-equivalent here: renderIndustryPage
 * is always called with no `live` flag, same as gallery-client.tsx's
 * previous client-side call -- this route creates no lead, sends no
 * message, and persists nothing.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Missing industry id.", { status: 400 });
  }

  const config = industryList.find((ind) => ind.id === id);
  if (!config) {
    return new Response("Unknown industry id.", { status: 404 });
  }

  const { user } = await getAccessContext();
  if (!user) {
    const returnTo = encodeURIComponent(`${url.pathname}${url.search}`);
    return Response.redirect(new URL(`/login?returnTo=${returnTo}`, request.url), 302);
  }

  return new Response(renderIndustryPage(config), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
