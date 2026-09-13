import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/sitegen/cors";
import { getDefaultOrganizationId } from "@/lib/organizations";
import { SAMPLE_BUSINESS_IDS } from "@/lib/sitegen/samples";

/**
 * Public-facing hero quote-request form on every generated site. No auth --
 * any site visitor can reach this, same trust model as /api/site-chat. Cross-
 * origin by design once a site is deployed to a client's own domain -- see
 * lib/sitegen/cors.ts.
 *
 * Attribution: `organizationId` is embedded into the generated site by
 * lib/sitegen (see SiteOptions.organizationId) and validated against a real
 * organizations row below. A site generated before that threading landed --
 * or any caller that still omits it -- has no organizationId at all; that
 * case now falls back to getDefaultOrganizationId() (migration
 * 033_default_organization.sql) rather than "whichever organization comes
 * back first," still loudly logged so a stale/broken embed stays visible
 * instead of silently misattributing a lead.
 *
 * Sample-site safety, hardened (owner-review finding): this route used to
 * skip persistence purely because the request body claimed `isSample:
 * true` -- a value this endpoint has no auth and receives straight from
 * client-side JS, so anyone could craft a raw POST with that flag either
 * way. That's a real hole in both directions: `isSample: true` on a real
 * organization's traffic would silently drop a genuine lead, and
 * `isSample: false` against a sample business would create a real
 * database row (exactly what happened once during manual testing of this
 * fix -- see docs/history.md). The skip decision is now derived ONLY from
 * `business.id` matching SAMPLE_BUSINESS_IDS -- the fixed, literal ids of
 * this app's known fixture businesses ("sample-plumber", etc.), which a
 * real prospect's id (a Google Place ID or a prospects-table UUID) can
 * never coincidentally equal. The client-submitted `isSample` is kept only
 * to log a loud warning when it disagrees with the server-derived value,
 * which would mean either a bug or a tampering attempt.
 */
const schema = z.object({
  business: z.object({
    id: z.string().min(1).max(200),
    name: z.string().max(200),
    industryLabel: z.string().max(100),
    phone: z.string().max(40)
  }),
  organizationId: z.string().uuid().nullish(),
  isSample: z.boolean().optional(),
  name: z.string().min(1).max(160),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().min(1).max(40),
  city: z.string().max(100).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  message: z.string().max(600).optional().or(z.literal(""))
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return corsJson({ error: "Please fill in your name and phone number." }, { status: 400 });
  }
  const { business, organizationId, isSample, name, email, phone, city, service, message } = parsed.data;

  const isKnownSample = SAMPLE_BUSINESS_IDS.has(business.id);
  if (Boolean(isSample) !== isKnownSample) {
    console.error(
      `site-lead: client-submitted isSample (${isSample}) disagrees with the server-derived value (${isKnownSample}) for business.id "${business.id}" -- possible tampering or a stale embed. Trusting the server-derived value.`
    );
  }
  if (isKnownSample) {
    // Illustrative demo — never persists a real lead. See file-header note.
    return corsJson({ ok: true, demo: true });
  }

  try {
    const supabase = createAdminClient();

    let orgId: string | null = null;
    if (organizationId) {
      const { data: validOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", organizationId)
        .single();
      orgId = validOrg?.id ?? null;
      if (!orgId) {
        console.error(`site-lead: organizationId "${organizationId}" doesn't match a real organization.`);
      }
    }
    if (!orgId) {
      console.error(
        `site-lead: no valid organizationId provided for business "${business.name}" — falling back to the default organization. This lead may be misattributed if it actually belongs to a different one.`
      );
      orgId = await getDefaultOrganizationId(supabase);
    }
    if (!orgId) {
      return corsJson({ error: "This site isn't accepting requests right now." }, { status: 503 });
    }

    const { error } = await supabase.from("chat_leads").insert({
      organization_id: orgId,
      source: "form",
      business_name: business.name,
      business_industry: business.industryLabel,
      business_phone: business.phone,
      visitor_name: name,
      visitor_email: email || null,
      visitor_phone: phone,
      city: city || null,
      service_requested: service || null,
      reason: message || null
    });
    if (error) throw error;

    return corsJson({ ok: true });
  } catch (err) {
    console.error("Failed to store site lead:", err);
    return corsJson({ error: "Something went wrong — please call us directly instead." }, { status: 500 });
  }
}
