import { corsJson, corsPreflight } from "@/lib/sitegen/cors";
import { z } from "zod";
import { chatBusinessSchema, messageSchema, runChatCompletion } from "@/lib/sitegen/chat-completion";

/**
 * Dedicated, non-persisting counterpart to /api/site-chat -- the intake
 * chat widget on an ILLUSTRATIVE sample site (/samples, the homepage
 * preview) posts here instead, per SiteOptions.isSample -- see
 * lib/sitegen/chat-widget.ts for the endpoint-selection logic.
 *
 * The chat itself still calls the real model (via the shared
 * runChatCompletion() helper, chat-completion.ts) so the widget's
 * behavior stays genuinely demonstrable -- but this file imports no
 * database client and contains no write of any kind, on purpose. Even if
 * the model calls capture_lead and a name/phone come back, this route
 * only acknowledges the visitor; it never persists that anywhere. The
 * safety property here is architectural, not a runtime flag or an
 * allowlist check on caller-supplied data -- see /api/site-lead/route.ts's
 * header comment for the full history of why the earlier approaches
 * (an `isSample` flag, then a `business.id` allowlist check) were both
 * unsound for an unauthenticated, cross-origin endpoint.
 */
const schema = z.object({
  business: chatBusinessSchema,
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

  const { business, messages } = parsed.data;

  try {
    const { reply, capturedLead } = await runChatCompletion(business, messages, key);
    // capturedLead is deliberately never written anywhere -- this is an
    // illustrative demo, not a real intake channel.
    return corsJson({ reply, leadCaptured: Boolean(capturedLead) });
  } catch (error) {
    console.error("Sample chat error:", error);
    return corsJson({ reply: "Sorry, something went wrong — please call us directly." });
  }
}
