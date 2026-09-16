import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/sitegen/cors";
import { getDefaultOrganizationId } from "@/lib/organizations";

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
 * Sample-site safety, corrected (owner-review finding, second pass): this
 * route previously tried to detect and skip sample submissions itself --
 * first via a client-submitted `isSample` flag, then via checking
 * `business.id` against a fixed sample-id allowlist. BOTH are unsound:
 * this is an unauthenticated, cross-origin endpoint, and `business.id` is
 * just another field in the POST body -- `/api/demo-site`'s `b=` param is
 * base64url of caller-supplied JSON with no validation beyond `name` and
 * `industry`, so a caller can submit an allowlisted sample id alongside
 * completely different, real-looking business/visitor data. Checking the
 * id here would (and, briefly, did) let that request skip persistence for
 * what could be a genuine lead.
 *
 * The fix: this route no longer tries to detect samples at all. It ALWAYS
 * persists a real lead, unconditionally -- no request-supplied flag, id,
 * or missing organizationId can suppress that. Illustrative sample sites
 * are generated with `isSample: true` (see SiteOptions.isSample), which
 * routes their embedded form to the
 * separate, structurally non-persisting /api/sample-lead endpoint instead
 * of this one -- see lib/sitegen/lead-form.ts. The separation is
 * architectural, not a runtime check: this file contains no code path
 * that skips the insert below.
 */
const schema = z.object({
  business: z.object({
    name: z.string().max(200),
    industryLabel: z.string().max(100),
    phone: z.string().max(40)
  }),
  organizationId: z.string().uuid().nullish(),
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
  const { business, organizationId, name, email, phone, city, service, message } = parsed.data;

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
