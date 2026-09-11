"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Stage 8 — Structured Outcome. The full 18-item vocabulary (the spec's
 * original 15, plus won/lost already used elsewhere in the app, plus
 * "Email sent" — Stage 9's own human-confirmation requirement had no
 * outcome to attach to before this correction), each mapped onto the
 * EXISTING supported outcome/event semantics already used by
 * /api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform and
 * /api/prospects/[id]/pitch/[pitchId]/outcome (no new database enum, no
 * new event key).
 *
 * OWNER-REVIEW CORRECTION (this pass): the prior mapping used "sent" for
 * several outcomes where nothing was actually sent, and "no_answer" for
 * "Gatekeeper only" even though someone genuinely answered — both would
 * have shown a misleading status on the real /calls dashboard
 * (STATUS_LABELS there renders call_log.status verbatim). Every mapping
 * below is chosen for FACTUAL accuracy first; where no existing value is
 * an exact fit, `exact: false` marks it LOSSY, a mandatory note is
 * required, and the confirmation UI discloses the stored value plainly
 * ("Stored as: X — closest available, see your note") rather than
 * quietly passing off an approximation as precise.
 *
 * `advancesSequence` mirrors the perform route's own hardcoded
 * stopOutcomes array verbatim (["replied","interested","not_interested",
 * "meeting_booked","won","lost"] all STOP; everything else continues) --
 * scripts/verify-playbook-config.ts cross-checks this against that
 * route's real source text so the two can never silently drift apart.
 *
 * "Opted out" is deliberately NOT routed through the outcome mapping at
 * all — it calls the canonical suppression endpoint
 * (/api/prospects/[id]/suppress) directly, exactly like Suppress Control
 * elsewhere in the app, never a second opt-out mechanism.
 */
export type PlaybookOutcomeKey =
  | "assessment_booked"
  | "information_requested"
  | "callback_scheduled"
  | "spoke_with_decision_maker"
  | "gatekeeper_only"
  | "wrong_contact"
  | "no_answer"
  | "voicemail_left"
  | "number_invalid"
  | "not_interested"
  | "already_has_solution"
  | "qualified_not_ready"
  | "contact_info_disputed"
  | "opted_out"
  | "won"
  | "lost"
  | "email_sent"
  | "other";

export const PLAYBOOK_OUTCOMES: { key: PlaybookOutcomeKey; label: string }[] = [
  { key: "assessment_booked", label: "Assessment booked" },
  { key: "information_requested", label: "Information requested" },
  { key: "callback_scheduled", label: "Callback scheduled" },
  { key: "spoke_with_decision_maker", label: "Spoke with decision-maker" },
  { key: "gatekeeper_only", label: "Gatekeeper only" },
  { key: "wrong_contact", label: "Wrong contact" },
  { key: "no_answer", label: "No answer" },
  { key: "voicemail_left", label: "Voicemail actually left" },
  { key: "number_invalid", label: "Number invalid" },
  { key: "not_interested", label: "Not interested" },
  { key: "already_has_solution", label: "Already has a solution" },
  { key: "qualified_not_ready", label: "Qualified but not ready" },
  { key: "contact_info_disputed", label: "Contact information disputed" },
  { key: "opted_out", label: "Opted out" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "email_sent", label: "Email actually sent" },
  { key: "other", label: "Other" }
];

export type ExistingOutcomeValue = "no_answer" | "left_voicemail" | "sent" | "replied" | "interested" | "not_interested" | "meeting_booked" | "won" | "lost";

interface MappingEntry {
  /** Existing call_log/perform-route outcome enum value. Never a new one. null only for opted_out, which bypasses this mapping entirely. */
  value: ExistingOutcomeValue | null;
  /** Whether `value` precisely and honestly represents this playbook outcome, or is the closest available approximation. */
  exact: boolean;
  /** Mirrors the perform route's real stopOutcomes array — true means the sequence does NOT advance further (a real stop condition), false means it continues to the next step. */
  isStopOutcome: boolean;
}

export const OUTCOME_MAPPING: Record<PlaybookOutcomeKey, MappingEntry> = {
  assessment_booked: { value: "meeting_booked", exact: true, isStopOutcome: true },
  // LOSSY: no existing value means "genuine two-way engagement, prospect
  // asked a follow-up question" -- "replied" is the closest honest fit
  // (real engagement occurred), never "sent" (nothing was transmitted).
  information_requested: { value: "replied", exact: false, isStopOutcome: true },
  // LOSSY, same reasoning as above -- and a follow-up date is REQUIRED
  // here (see REQUIRES_FOLLOW_UP below), not merely offered, since
  // "callback scheduled" with no recorded follow-up date is a broken
  // promise, not a real outcome.
  callback_scheduled: { value: "replied", exact: false, isStopOutcome: true },
  spoke_with_decision_maker: { value: "replied", exact: false, isStopOutcome: true },
  // LOSSY: someone genuinely answered (a gatekeeper), so "no_answer" is
  // not literally true -- it's the least-wrong NON-STOP value available
  // (the decision-maker still hasn't been reached, so the sequence
  // should keep trying, which is exactly what a non-stop outcome does).
  // The confirmation UI discloses this explicitly; it is never silent.
  gatekeeper_only: { value: "no_answer", exact: false, isStopOutcome: false },
  // LOSSY: reaching the wrong contact/entity means continuing to retry
  // this exact contact info is pointless -- "not_interested" is the
  // closest STOP-class value (stop pursuing this channel), not
  // "no_answer" (which would keep retrying known-bad data).
  wrong_contact: { value: "not_interested", exact: false, isStopOutcome: true },
  no_answer: { value: "no_answer", exact: true, isStopOutcome: false },
  voicemail_left: { value: "left_voicemail", exact: true, isStopOutcome: false },
  number_invalid: { value: "not_interested", exact: false, isStopOutcome: true },
  not_interested: { value: "not_interested", exact: true, isStopOutcome: true },
  already_has_solution: { value: "not_interested", exact: true, isStopOutcome: true },
  qualified_not_ready: { value: "interested", exact: true, isStopOutcome: true },
  contact_info_disputed: { value: "not_interested", exact: false, isStopOutcome: true },
  opted_out: { value: null, exact: true, isStopOutcome: true }, // routed through /suppress instead
  won: { value: "won", exact: true, isStopOutcome: true },
  lost: { value: "lost", exact: true, isStopOutcome: true },
  email_sent: { value: "sent", exact: true, isStopOutcome: false },
  // LOSSY, deliberately: "other" makes no specific claim about what
  // happened, so it defaults to the same safe non-stop bucket as
  // "gatekeeper_only" rather than assuming either a positive or negative
  // result it can't actually attest to.
  other: { value: "no_answer", exact: false, isStopOutcome: false }
};

export const REQUIRES_NOTE: PlaybookOutcomeKey[] = [
  "other",
  "contact_info_disputed",
  "wrong_contact",
  "number_invalid",
  "gatekeeper_only",
  "information_requested",
  "callback_scheduled",
  "spoke_with_decision_maker"
];

/** A promised future touchpoint must have a real date attached, not be silently dropped. */
export const REQUIRES_FOLLOW_UP: PlaybookOutcomeKey[] = ["callback_scheduled", "qualified_not_ready"];

export function OutcomePanel({
  channel,
  willAdvanceSequence,
  onConfirm,
  pending
}: {
  channel: "CALL" | "EMAIL";
  willAdvanceSequence: boolean;
  onConfirm: (outcome: PlaybookOutcomeKey, note: string, followUpOption: string) => void;
  pending: boolean;
}) {
  const [selected, setSelected] = useState<PlaybookOutcomeKey | null>(null);
  const [note, setNote] = useState("");
  const [followUpOption, setFollowUpOption] = useState("");
  const [confirming, setConfirming] = useState(false);

  const noteRequired = selected ? REQUIRES_NOTE.includes(selected) : false;
  const followUpRequired = selected ? REQUIRES_FOLLOW_UP.includes(selected) : false;
  const canConfirm = selected !== null && (!noteRequired || note.trim().length > 0) && (!followUpRequired || followUpOption.length > 0);

  if (!selected) {
    return (
      <div>
        <p className="text-[12.5px] font-medium text-ink">What actually happened?</p>
        <p className="mt-1 text-[11.5px] text-faint">Select the one real outcome — this determines what gets recorded.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PLAYBOOK_OUTCOMES.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSelected(o.key)}
              className="focus-ring rounded-full border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:border-iris/40 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const label = PLAYBOOK_OUTCOMES.find((o) => o.key === selected)!.label;
  const mapping = OUTCOME_MAPPING[selected];
  const isOptOut = selected === "opted_out";
  const marksPerformed = true; // every explicit outcome here marks the underlying action performed — only opening/navigating never does
  const suppressesFuture = isOptOut;
  const sequenceWillAdvance = !isOptOut && willAdvanceSequence && !mapping.isStopOutcome;

  return (
    <div>
      <button type="button" onClick={() => setSelected(null)} className="focus-ring text-[11.5px] text-iris-soft hover:underline">
        ← Choose a different outcome
      </button>

      <div className="mt-3 rounded-xl border border-hairline bg-raised/50 p-4">
        <p className="text-[12.5px] font-semibold text-ink">{label}</p>

        {!isOptOut ? (
          <div className="mt-2 rounded-lg border border-hairline bg-canvas/60 px-2.5 py-2 text-[11px] leading-relaxed text-faint">
            Stored as: <span className="font-mono text-ink">{mapping.value}</span>
            {!mapping.exact ? " — closest available status; your note preserves what actually happened." : "."}
          </div>
        ) : null}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={noteRequired ? "Concise factual note (required for this outcome)" : "Optional concise note"}
          className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink"
        />

        {followUpRequired || selected === "information_requested" ? (
          <label className="mt-2 block text-[11px] text-faint">
            Follow-up{followUpRequired ? " (required for this outcome)" : ""}
            <select value={followUpOption} onChange={(e) => setFollowUpOption(e.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink">
              <option value="">{followUpRequired ? "Choose a follow-up date" : "No follow-up"}</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="three_days">3 days</option>
              <option value="one_week">1 week</option>
            </select>
          </label>
        ) : null}

        <div className="mt-3 space-y-1 rounded-lg border border-hairline bg-canvas/70 p-3 text-[11.5px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Before you save:</p>
          <p>• The underlying action will be marked performed: {marksPerformed ? "yes" : "no"}.</p>
          <p>
            • The sequence will progress:{" "}
            {isOptOut
              ? "no (opted out)"
              : !willAdvanceSequence
                ? "not applicable — this isn't a sequence step"
                : sequenceWillAdvance
                  ? "yes"
                  : "no — this outcome ends the sequence"}
            .
          </p>
          <p>• Follow-up will be scheduled: {followUpOption ? "yes" : "no"}.</p>
          <p>• Suppression will be applied: {suppressesFuture ? "yes — this prospect will be suppressed" : "no"}.</p>
        </div>

        {isOptOut ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-signal-bad/30 bg-signal-bad/10 p-2.5 text-[11.5px] text-signal-bad">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>This uses the canonical Suppress Prospect action — the prospect will be permanently excluded from future outreach until explicitly unsuppressed.</span>
          </div>
        ) : null}

        {!confirming ? (
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => setConfirming(true)}
            className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            Preview & Confirm
          </button>
        ) : (
          <div className="mt-3 rounded-lg border border-hairline bg-canvas/70 p-3">
            <p className="text-[12px] leading-relaxed text-ink/85">
              &ldquo;I confirm that I personally initiated this {channel === "CALL" ? "call" : "contact"}, that the displayed information was accurate to the best of my knowledge, and that I will honor any request not to be contacted.&rdquo;
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => onConfirm(selected, note, followUpOption)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-signal-good to-signal-good px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                Confirm & Save
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="focus-ring text-[11.5px] text-faint hover:text-muted">
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
