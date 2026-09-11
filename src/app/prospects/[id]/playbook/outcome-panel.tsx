"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Stage 8 — Structured Outcome. The full 15-item vocabulary the
 * implementation prompt specifies, each mapped onto the EXISTING
 * supported outcome/event semantics already used by
 * /api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform and
 * /api/prospects/[id]/pitch/[pitchId]/outcome (no new database enum, no
 * new event key) — the richer, real-world nuance of each choice is
 * preserved in the free-text note that always accompanies it, not by
 * inventing a parallel status column.
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
  { key: "other", label: "Other" }
];

/** Existing call_log/perform-route outcome enum this playbook choice maps onto. Never a new value. */
export const OUTCOME_MAPPING: Record<PlaybookOutcomeKey, "no_answer" | "left_voicemail" | "sent" | "replied" | "interested" | "not_interested" | "meeting_booked" | "won" | "lost" | null> = {
  assessment_booked: "meeting_booked",
  information_requested: "sent",
  callback_scheduled: "sent",
  spoke_with_decision_maker: "replied",
  gatekeeper_only: "no_answer",
  wrong_contact: "no_answer",
  no_answer: "no_answer",
  voicemail_left: "left_voicemail",
  number_invalid: "no_answer",
  not_interested: "not_interested",
  already_has_solution: "not_interested",
  qualified_not_ready: "interested",
  contact_info_disputed: "no_answer",
  opted_out: null, // routed through /suppress instead, never through the outcome mapping
  won: "won",
  lost: "lost",
  other: "sent"
};

const REQUIRES_NOTE: PlaybookOutcomeKey[] = ["other", "contact_info_disputed", "wrong_contact", "number_invalid"];

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
  const canConfirm = selected !== null && (!noteRequired || note.trim().length > 0);

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
  const isOptOut = selected === "opted_out";
  const marksPerformed = true; // every explicit outcome here marks the underlying action performed — only opening/navigating never does
  const suppressesFuture = isOptOut;

  return (
    <div>
      <button type="button" onClick={() => setSelected(null)} className="focus-ring text-[11.5px] text-iris-soft hover:underline">
        ← Choose a different outcome
      </button>

      <div className="mt-3 rounded-xl border border-hairline bg-raised/50 p-4">
        <p className="text-[12.5px] font-semibold text-ink">{label}</p>

        {noteRequired || selected === "other" ? (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Concise factual note (required for this outcome)"
            className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink"
          />
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Optional concise note"
            className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink"
          />
        )}

        {selected === "callback_scheduled" || selected === "qualified_not_ready" ? (
          <label className="mt-2 block text-[11px] text-faint">
            Follow-up
            <select value={followUpOption} onChange={(e) => setFollowUpOption(e.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink">
              <option value="">No follow-up</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="three_days">3 days</option>
              <option value="one_week">1 week</option>
            </select>
          </label>
        ) : null}

        <div className="mt-3 space-y-1 rounded-lg border border-hairline bg-canvas/70 p-3 text-[11.5px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Before you save:</p>
          <p>• The underlying action will be marked performed: {marksPerformed ? "yes" : "no"}.</p>
          <p>• The sequence will progress: {isOptOut ? "no (opted out)" : willAdvanceSequence ? "yes" : "no — this outcome ends the sequence"}.</p>
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
