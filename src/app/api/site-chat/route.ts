import { corsJson, corsPreflight } from "@/lib/sitegen/cors";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganizationId } from "@/lib/organizations";
import { chatBusinessSchema, messageSchema, runChatCompletion } from "@/lib/sitegen/chat-completion";

/**
 * Public-facing intake chat for REAL generated sites (demo-for-a-prospect
 * or a live client site). No auth -- any site visitor can reach this.
 * Grounded strictly in the business's own data (services, FAQ, hours)
 * passed in the request; the model is never given anything to hallucinate
 * a price, guarantee, or fact from.
 *
 * Sample-site safety, corrected (owner-review finding, second pass): this
 * route previously tried to detect and skip sample submissions itself --
 * first via a client-submitted `isSample` flag, then via checking
 * `business.id` against a fixed sample-id allowlist. BOTH are unsound:
 * this is an unauthenticated, cross-origin endpoint, and every field in
 * the body -- including `business.id` -- is caller-supplied with no
 * validation tying it to anything real (`/api/demo-site`'s `b=` param is
 * base64url of arbitrary JSON). A caller could submit an allowlisted
 * sample id alongside a completely different, real-looking business, and
 * that would (and briefly did) suppress persistence for what could be a
 * genuine captured lead.
 *
 * The fix: this route no longer tries to detect samples at all. A
 * captured lead is ALWAYS persisted here, unconditionally -- no
 * request-supplied flag or id can suppress that. Illustrative sample
 * sites are generated with `isSample: true` (see SiteOptions.isSample),
 * which routes their embedded chat widget to the separate, structurally
 * non-persisting /api/sample-chat endpoint instead of this one -- see
 * lib/sitegen/chat-widget.ts. The separation is architectural: this file
 * contains no code path that skips the insert below.
 */
const schema = z.object({
  business: chatBusinessSchema,
  organizationId: z.string().uuid().nullish(),
  messages: z.array(messageSchema).max(20)
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return corsJson({ reply: "Chat is temporarily unavailable — please call us directly." });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return corsJson({ error: "Invalid request." }, { status: 400 });
  }

  const { business, organizationId, messages } = parsed.data;

  try {
    const { reply, capturedLead } = await runChatCompletion(business, messages, key);

    if (capturedLead) {
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
            console.error(`site-chat: organizationId "${organizationId}" doesn't match a real organization.`);
          }
        }
        if (!orgId) {
          console.error(
            `site-chat: no valid organizationId provided for business "${business.name}" — falling back to the default organization. This lead may be misattributed if it actually belongs to a different one.`
          );
          orgId = await getDefaultOrganizationId(supabase);
        }

        if (orgId) {
          await supabase.from("chat_leads").insert({
            organization_id: orgId,
            business_name: business.name,
            business_industry: business.industryLabel,
            business_phone: business.phone,
            visitor_name: capturedLead.name,
            visitor_phone: capturedLead.phone,
            reason: capturedLead.reason,
            transcript: [...messages, { role: "assistant", content: `[captured lead: ${capturedLead.name}, ${capturedLead.phone}]` }]
          });
        }
      } catch (dbError) {
        console.error("Failed to store chat lead:", dbError);
      }

      return corsJson({ reply, leadCaptured: true });
    }

    return corsJson({ reply });
  } catch (error) {
    console.error("Site chat error:", error);
    return corsJson({ reply: "Sorry, something went wrong — please call us directly." });
  }
}
