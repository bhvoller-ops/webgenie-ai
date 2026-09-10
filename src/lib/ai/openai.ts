/**
 * Shared OpenAI chat-completion helper — the same provider and calling
 * pattern already used by app/api/site-chat/route.ts (a real, already-
 * paid, already-configured vendor: OPENAI_API_KEY is set in production
 * today). Reused rather than introducing a new AI vendor for the Pitch
 * Generator (master prompt section 21).
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function hasOpenAiKey(): Promise<boolean> {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * A single, non-streaming completion. Returns null (never throws) on any
 * failure so a caller can fall back gracefully — matching site-chat's own
 * "something went wrong, please call directly" pattern rather than a 500.
 */
export async function completeChat(
  messages: ChatMessage[],
  opts: { model?: string; maxTokens?: number; temperature?: number } = {}
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: opts.model ?? "gpt-4o-mini",
        messages,
        max_tokens: opts.maxTokens ?? 400,
        temperature: opts.temperature ?? 0.5
      })
    });
    if (!res.ok) {
      console.error("OpenAI chat completion failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("OpenAI chat completion error:", error);
    return null;
  }
}
