import { z } from "zod";

/**
 * Shared OpenAI-calling logic for the generated-site intake chat --
 * extracted so /api/site-chat (real, persists) and /api/sample-chat
 * (illustrative, structurally never persists) can share the exact same
 * prompt-building and model-calling code without either one importing
 * the other's persistence path. This module has no database import at
 * all, and never will -- it only ever returns a reply and, optionally,
 * the name/phone/reason the model extracted, letting the caller decide
 * what (if anything) to do with that.
 */

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(600)
});

export const chatBusinessSchema = z.object({
  name: z.string().max(200),
  industryLabel: z.string().max(100),
  phone: z.string().max(40),
  city: z.string().max(100),
  state: z.string().max(20),
  hours: z.string().max(200).optional(),
  services: z.array(z.object({ name: z.string().max(100), blurb: z.string().max(300) })).max(12),
  faq: z.array(z.object({ q: z.string().max(300), a: z.string().max(600) })).max(12)
});

export type ChatBusiness = z.infer<typeof chatBusinessSchema>;

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

function buildSystemPrompt(business: ChatBusiness): string {
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

export interface ChatCompletionResult {
  reply: string;
  capturedLead: { name: string; phone: string; reason: string | null } | null;
}

/**
 * Calls the model and returns a reply plus any captured-lead fields the
 * model extracted. Does not touch a database. Throws on a transport/API
 * failure so the caller can decide how to present that.
 */
export async function runChatCompletion(
  business: ChatBusiness,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  apiKey: string
): Promise<ChatCompletionResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
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
    throw new Error(`OpenAI error: ${detail}`);
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
    return {
      reply: `Thanks, ${args.name ?? "there"} — someone from ${business.name} will call you at ${args.phone ?? "the number you gave"} shortly. Anything else I can help with while you wait?`,
      capturedLead: args.name && args.phone ? { name: args.name, phone: args.phone, reason: args.reason ?? null } : null
    };
  }

  return { reply: choice?.content ?? "Sorry, could you say that again?", capturedLead: null };
}
