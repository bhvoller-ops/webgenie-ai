import { corsJson, corsPreflight } from "@/lib/sitegen/cors";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public-facing intake chat for generated sites (demo or client). No auth --
 * any site visitor can reach this. Grounded strictly in the business's own
 * data (services, FAQ, hours) passed in the request; the model is never
 * given anything to hallucinate a price, guarantee, or fact from.
 */

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(600)
});

const schema = z.object({
  business: z.object({
    name: z.string().max(200),
    industryLabel: z.string().max(100),
    phone: z.string().max(40),
    city: z.string().max(100),
    state: z.string().max(20),
    hours: z.string().max(200).optional(),
    services: z.array(z.object({ name: z.string().max(100), blurb: z.string().max(300) })).max(12),
    faq: z.array(z.object({ q: z.string().max(300), a: z.string().max(600) })).max(12)
  }),
  organizationId: z.string().uuid().nullish(),
  messages: z.array(messageSchema).max(20)
});

const CAPTURE_LEAD_TOOL = {
  type: "function" as const,
  function: {
    name: "capture_lead",
    description:
      "Call this once the visitor has given a name and phone number and wants someone to follow up with them.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's name" },
        phone: { type: "string", description: "Visitor's phone number, as given" },
        reason: { type: "string", description: "One short line on what they need" }
      },
      required: ["name", "phone", "reason"]
    }
  }
};

function buildSystemPrompt(business: z.infer<typeof schema>["business"]): string {
  const servicesList = business.services.map((s) => `- ${s.name}: ${s.blurb}`).join("\n");
  const faqList = business.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return `You are the intake assistant on ${business.name}'s website, a ${business.industryLabel.toLowerCase()} serving ${business.city}, ${business.state}.

Only use the facts below. Never invent a price, guarantee, availability, or claim that isn't stated here. If you don't know something, say the team will confirm it on the call.

Services:
${servicesList}

${business.hours ? `Hours: ${business.hours}` : "Hours: not listed — tell the visitor to call to confirm."}

Frequently asked questions:
${faqList}

Phone: ${business.phone}

Keep replies short (1-3 sentences), warm, and direct — this is a chat bubble, not an email. If the visitor wants to book, get a quote, or has a question you can't answer from the facts above, ask for their name and phone number so the team can call them back, then call capture_lead once you have both plus a short reason. Don't call capture_lead until you actually have a name and phone number.`;
}

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
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: buildSystemPrompt(business) }, ...messages],
        tools: [CAPTURE_LEAD_TOOL],
        max_tokens: 220,
        temperature: 0.4
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenAI error:", detail);
      return corsJson({ reply: "Sorry, something went wrong — please call us directly." });
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;
    const toolCall = choice?.tool_calls?.find((t: { function: { name: string } }) => t.function.name === "capture_lead");

    if (toolCall) {
      let args: { name?: string; phone?: string; reason?: string } = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        // fall through with empty args; still acknowledge the visitor
      }

      if (args.name && args.phone) {
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
              `site-chat: no valid organizationId provided for business "${business.name}" — falling back to the first organization. This lead may be misattributed.`
            );
            const { data: fallbackOrg } = await supabase.from("organizations").select("id").limit(1).single();
            orgId = fallbackOrg?.id ?? null;
          }

          if (orgId) {
            await supabase.from("chat_leads").insert({
              organization_id: orgId,
              business_name: business.name,
              business_industry: business.industryLabel,
              business_phone: business.phone,
              visitor_name: args.name,
              visitor_phone: args.phone,
              reason: args.reason ?? null,
              transcript: [...messages, { role: "assistant", content: `[captured lead: ${args.name}, ${args.phone}]` }]
            });
          }
        } catch (dbError) {
          console.error("Failed to store chat lead:", dbError);
        }
      }

      return corsJson({
        reply: `Thanks, ${args.name ?? "there"} — someone from ${business.name} will call you at ${args.phone ?? "the number you gave"} shortly. Anything else I can help with while you wait?`,
        leadCaptured: true
      });
    }

    return corsJson({ reply: choice?.content ?? "Sorry, could you say that again?" });
  } catch (error) {
    console.error("Site chat error:", error);
    return corsJson({ reply: "Sorry, something went wrong — please call us directly." });
  }
}
