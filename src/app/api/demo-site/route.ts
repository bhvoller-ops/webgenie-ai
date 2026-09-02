import { generateSite } from "@/lib/sitegen/generate";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import { GALLERY_INDUSTRIES } from "@/lib/sitegen/gallery-industries";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Business } from "@/lib/sitegen/types";

/**
 * Renders a generated demo site.
 *
 * The business is passed as base64url-encoded JSON in `b`, so a preview
 * link can still be copied, shared, and rendered with no lookup at all —
 * that part stays a pure function of its inputs. The one exception: when
 * `?org=` is present, the org's real brand name (org_branding, migration
 * 029) overrides the free-text `?by=` param, so a member's demo links show
 * their real branding rather than whatever string a caller happened to
 * hardcode. Falls back to `?by=` when no branding row exists yet.
 *
 * `?download=1` returns it as a file attachment instead of rendering.
 */

function decode(param: string): Business | null {
  try {
    const json = Buffer.from(param, "base64url").toString("utf8");
    const b = JSON.parse(json) as Business;
    if (!b?.name || !b?.industry || !(b.industry in INDUSTRIES || b.industry in GALLERY_INDUSTRIES)) return null;
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

  const organizationId = url.searchParams.get("org") ?? undefined;
  let builtBy = url.searchParams.get("by") ?? undefined;
  if (organizationId) {
    const { data: branding } = await createAdminClient()
      .from("org_branding")
      .select("brand_name")
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (branding?.brand_name) builtBy = branding.brand_name;
  }

  const site = generateSite(business, {
    builtBy,
    demoBadge: url.searchParams.get("badge") !== "0",
    organizationId,
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
