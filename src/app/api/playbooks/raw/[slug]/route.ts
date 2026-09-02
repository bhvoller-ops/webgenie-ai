import { requireAdminApi } from "@/lib/auth/access";
import { getPlaybook, readPlaybookRawHtml } from "@/lib/playbooks/content";

/**
 * Serves a playbook's raw standalone HTML for the sandboxed iframe on
 * /playbooks/[slug] — never rendered inline in the main app, since these
 * are complete documents (own <html>/<head>/<style>), not fragments.
 * Admin-gated same as the page that embeds it; a bare <iframe src> with no
 * auth would otherwise leak these past the page's own access check.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { slug } = await params;
  const entry = getPlaybook(slug);
  if (!entry || entry.kind !== "html") {
    return new Response("Not found.", { status: 404 });
  }

  const html = await readPlaybookRawHtml(entry);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, max-age=300" }
  });
}
