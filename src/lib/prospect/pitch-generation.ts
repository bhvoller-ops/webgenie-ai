import { createHash } from "crypto";
import { completeChat } from "@/lib/ai/openai";
import { renderPitchContextForPrompt, type PitchContext } from "@/lib/prospect/pitch-context";
import type { PitchChannel } from "@/lib/prospect/types";

/**
 * P1 Pitch Generator (master prompt sections 16-19). AI generates
 * communication copy only — every fact it can reference comes from
 * PitchContext (lib/prospect/pitch-context.ts), never a live database
 * lookup of its own. One shared system prompt establishes the grounding
 * rules and style; a small per-channel instruction covers each channel's
 * own structure (section 19) and length (section 17: short, human,
 * specific, low-pressure, one observation, one CTA).
 */

const CHANNEL_INSTRUCTIONS: Record<PitchChannel, string> = {
  call_opener:
    "Write a phone call opener the agency owner will say out loud when the prospect answers. " +
    "Structure: a positive, specific observation about the business -> the real opportunity you found -> a low-friction reason to keep talking (e.g. 'mind if I show you what I mean?'). " +
    "2-4 sentences, spoken/conversational, not written like an email.",
  cold_email:
    "Write a short cold email. Respond in exactly this format, two lines: " +
    "\"SUBJECT: <short subject line>\" then a blank line then \"BODY: <the email body>\". " +
    "The body: one observation, why it's relevant to them specifically, what was prepared/found, one clear CTA. Keep it under 120 words.",
  sms: "Write a single SMS message. Very short (under 320 characters), permission-based (e.g. 'mind if I send over...'), no exaggerated claims, one clear next step.",
  linkedin: "Write a short LinkedIn message. Conversational, non-spammy, 2-3 sentences, one clear ask.",
  voicemail: "Write a voicemail script meant to be spoken aloud in 20-30 seconds (roughly 50-70 words). Name, why you're calling, one specific reason it's relevant, a callback ask.",
  loom_intro:
    "Write a 30-60 second Loom video intro script (roughly 80-140 words) the agency owner will read while recording a short screen-share video introducing the opportunity and the demo. " +
    "Should help them introduce the opportunity/demo naturally, not read a generic sales monologue."
};

const SYSTEM_PROMPT = `You write short, human, evidence-backed outreach copy for a local-business marketing agency reaching out to a real prospect. You are NOT a generic marketing copywriter — every claim you make must come from the FACTS, OPPORTUNITY EVIDENCE, or AUDIT FINDINGS sections you're given. If something is listed under UNKNOWN, never claim or imply you know it. Never produce any of the claims listed under NEVER SAY OR IMPLY, under any phrasing. Style: short, human, specific, low-pressure. Exactly one primary observation and one clear call to action. No bloated marketing language, no hype, no exclamation-point stacking.`;

export interface GeneratedPitch {
  subject: string | null;
  body: string;
}

export function parseEmailOutput(raw: string): GeneratedPitch {
  const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = raw.match(/BODY:\s*([\s\S]+)/i);
  if (subjectMatch && bodyMatch) {
    return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() };
  }
  // Model didn't follow the format exactly -- fall back to the whole
  // response as the body rather than failing the generation outright.
  return { subject: null, body: raw.trim() };
}

export async function generatePitch(channel: PitchChannel, context: PitchContext, agencyName: string): Promise<GeneratedPitch | null> {
  const contextText = renderPitchContextForPrompt(context);
  const userPrompt = `You are writing this on behalf of ${agencyName}.\n\n${contextText}\n\nTASK: ${CHANNEL_INSTRUCTIONS[channel]}`;

  const raw = await completeChat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    { maxTokens: channel === "loom_intro" ? 320 : 260, temperature: 0.5 }
  );
  if (!raw) return null;

  if (channel === "cold_email") return parseEmailOutput(raw);
  return { subject: null, body: raw.trim() };
}

/** A stable fingerprint of the grounding data used — lets the UI tell the user their saved pitch may be stale once the underlying evidence has materially changed. Same crypto.createHash pattern already established for opportunity_briefs.input_fingerprint. */
export function computePitchSourceFingerprint(context: PitchContext): string {
  return createHash("sha256").update(JSON.stringify(context)).digest("hex");
}
