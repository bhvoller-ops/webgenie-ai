import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/sitegen/cors";

/**
 * Public-facing hero quote-request form on every generated site. No auth --
 * any site visitor can reach this, same trust model as /api/site-chat. Cross-
 * origin by design once a site is deployed to a client's own domain — see
 * lib/sitegen/cors.ts.
 *
 * Attribution: `organizationId` is embedded into the generated site by
 * lib/sitegen (see SiteOptions.organizationId) and validated against a real
 * organizations row below. A site generated before that threading landed —
 * or any caller that still omits it — has no organizationId at all; that
 * case falls back to the old "whichever organization comes back first"
 * behavior, loudly logged so it stays visible rather than silently masking
 * misattributed leads.
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
        `site-lead: no valid organizationId provided for business "${business.name}" — falling back to the first organization. This lead may be misattributed.`
      );
      const { data: fallbackOrg } = await supabase.from("organizations").select("id").limit(1).single();
      orgId = fallbackOrg?.id ?? null;
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
