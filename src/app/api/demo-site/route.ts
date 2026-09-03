import { generateSite } from "@/lib/sitegen/generate";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import { GALLERY_INDUSTRIES } from "@/lib/sitegen/gallery-industries";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Business, SiteBranding } from "@/lib/sitegen/types";

/**
 * Renders a generated demo site.
 *
 * The business is passed as base64url-encoded JSON in `b`, so a preview
 * link can still be copied, shared, and rendered with no lookup at all —
 * that part stays a pure function of its inputs. The one exception: when
 * `?org=` is present, the org's real branding kit (org_branding, migration
 * 029 — name, logo, favicon, colors, support contact) overrides the
 * free-text `?by=` param and the industry defaults, so a member's demo
 * links show their real branding rather than whatever string a caller
 * happened to hardcode. Falls back to `?by=` when no branding row exists
 * yet, and to the industry defaults for anything the row doesn't set.
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
  let branding: SiteBranding | undefined;
  if (organizationId) {
    const { data: row } = await createAdminClient()
      .from("org_branding")
      .select("brand_name, logo_url, favicon_url, primary_color, accent_color, support_email, support_phone")
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (row?.brand_name) builtBy = row.brand_name;
    if (row) {
      branding = {
        logoUrl: row.logo_url,
        faviconUrl: row.favicon_url,
        primaryColor: row.primary_color,
        accentColor: row.accent_color,
        supportEmail: row.support_email,
        supportPhone: row.support_phone,
      };
    }
  }

  const site = generateSite(business, {
    builtBy,
    demoBadge: url.searchParams.get("badge") !== "0",
    organizationId,
    branding,
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
