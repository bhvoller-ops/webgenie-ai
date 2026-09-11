import { completeChat } from "@/lib/ai/openai";
import { renderPitchContextForPrompt, type PitchContext } from "@/lib/prospect/pitch-context";
import { SYSTEM_PROMPT, parseEmailOutput, type GeneratedPitch } from "@/lib/prospect/pitch-generation";
import type { SequenceStepChannel } from "@/lib/prospect/types";

/**
 * P2 Assisted Outreach Sequences — message preparation (master prompt
 * section G: "Reuse the existing P1 PitchContext and pitch generation
 * architecture. Do not create an unrelated second copywriting engine.").
 * Reuses buildPitchContext()/renderPitchContextForPrompt()/SYSTEM_PROMPT/
 * completeChat() verbatim — this file only adds the small, sequence-step-
 * specific channel instruction map (a different vocabulary than
 * PitchChannel: CALL/EMAIL/SMS/LINKEDIN/VOICEMAIL/LOOM/SEND_DEMO/
 * FOLLOW_UP, since a sequence step's channel is the master prompt's own
 * richer step vocabulary, not the Pitch Generator's tab vocabulary).
 *
 * Deliberately generates on demand and persists nothing: a sequence step's
 * draft is single-use (once performed, that step is done; the next step
 * is a different channel with different content) and there's no
 * regenerate-with-history need the way the ad-hoc Pitch Generator has.
 * See docs/history.md's P2 entry for why this avoids widening `pitches`'
 * unique constraint or inventing a new persistence table for the same
 * concern `pitches` already owns for the non-sequence case.
 *
 * CUSTOM_TASK has no entry here on purpose — it's the user's own free-text
 * task, never AI-generated.
 */

const SEQUENCE_CHANNEL_INSTRUCTIONS: Partial<Record<SequenceStepChannel, string>> = {
  CALL: "Write a phone call opener the agency owner will say out loud when the prospect answers. 2-4 sentences, spoken/conversational, not written like an email.",
  EMAIL:
    'Write a short email. Respond in exactly this format, two lines: "SUBJECT: <short subject line>" then a blank line then "BODY: <the email body>". Under 120 words.',
  SMS: "Write a single SMS message. Under 320 characters, permission-based, one clear next step.",
  LINKEDIN: "Write a short LinkedIn message. Conversational, non-spammy, 2-3 sentences, one clear ask.",
  VOICEMAIL: "Write a voicemail script meant to be spoken aloud in 20-30 seconds (roughly 50-70 words).",
  LOOM: "Write a 30-60 second Loom video intro script (roughly 80-140 words) introducing the opportunity and the demo naturally.",
  SEND_DEMO:
    "Write a very short message (2-3 sentences, any channel) whose sole purpose is to share the already-built demo referenced in FACTS. Reference the demo directly. No hard sell.",
  // Master prompt's own "FOLLOW-UP WRITING STYLE": brief, human, specific,
  // non-repetitive, low pressure, grounded. May reference a prior contact
  // ONLY via PRIOR ACTUAL INTERACTIONS (renderPitchContextForPrompt
  // already makes this an explicit hard rule).
  FOLLOW_UP:
    "Write a brief follow-up message (any short channel — email or SMS style, whichever fits the facts better). Human, specific, non-repetitive, low-pressure, grounded. Do not generate manipulative urgency. Do not fabricate familiarity. Reference a previous contact only if PRIOR ACTUAL INTERACTIONS says one actually happened."
};

/** Generates fresh, ungrounded-nothing copy for a sequence step channel. Returns null for CUSTOM_TASK (nothing to generate) or on a provider failure — never throws. */
export async function generateSequenceStepMessage(
  channel: SequenceStepChannel,
  context: PitchContext,
  agencyName: string
): Promise<GeneratedPitch | null> {
  const instruction = SEQUENCE_CHANNEL_INSTRUCTIONS[channel];
  if (!instruction) return null; // CUSTOM_TASK

  const contextText = renderPitchContextForPrompt(context);
  const userPrompt = `You are writing this on behalf of ${agencyName}.\n\n${contextText}\n\nTASK: ${instruction}`;

  const raw = await completeChat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    { maxTokens: 260, temperature: 0.5 }
  );
  if (!raw) return null;

  if (channel === "EMAIL") return parseEmailOutput(raw);
  return { subject: null, body: raw.trim() };
}
