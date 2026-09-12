"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Stage 8 — Structured Outcome.
 *
 * SEMANTIC CORRECTION (owner-review pass 3): the prior version stored
 * several outcomes under a materially misleading status just because it
 * disclosed the approximation on screen -- disclosure does not make a
 * false stored fact acceptable. This version enforces a hard separation:
 *
 * - CONVERSATION BRANCHES (ConversationBranchKey) never reach any API on
 *   their own. Selecting one only reveals the further choices relevant
 *   to it -- it controls what the caller sees next, nothing more.
 * - PERSISTED OUTCOMES (PlaybookOutcomeKey) are the only values that can
 *   ever be sent to perform()/pitch-outcome(), and every one of them is
 *   EXACT -- a truthful, existing call_log status that actually matches
 *   what the mapping claims. There is no `exact:false` entry left in
 *   OUTCOME_MAPPING; if a scenario has no truthful exact fit, it is a
 *   branch or an operational (skip/snooze, no status at all) path
 *   instead, never a coerced final outcome.
 * - OPERATIONAL branches (wrong contact / number invalid / contact info
 *   disputed) never call perform()/pitch-outcome() at all -- they only
 *   ever reach the existing, truthful /api/prospect-actions/{id} skip or
 *   snooze operation (when an action id exists), which records no
 *   outcome status and claims nothing about what the prospect said.
 *
 * "Gatekeeper only" and "Spoke with decision-maker" are BRANCHES, not
 * outcomes -- selecting either reveals the same terminal-outcome list
 * filtered to what's actually possible from that branch, so the human
 * always states the real final result rather than a branch masquerading
 * as one.
 */
export type PlaybookOutcomeKey =
  | "no_answer"
  | "voicemail_left"
  | "email_sent"
  | "information_requested"
  | "callback_scheduled"
  | "interested"
  | "qualified_not_ready"
  | "not_interested"
  | "already_has_solution"
  | "assessment_booked"
  | "opted_out"
  | "won"
  | "lost";

export const PLAYBOOK_OUTCOMES: { key: PlaybookOutcomeKey; label: string }[] = [
  { key: "no_answer", label: "No answer" },
  { key: "voicemail_left", label: "Voicemail actually left" },
  { key: "email_sent", label: "Email actually sent" },
  { key: "information_requested", label: "Information requested" },
  { key: "callback_scheduled", label: "Callback scheduled" },
  { key: "interested", label: "Interested" },
  { key: "qualified_not_ready", label: "Qualified but not ready" },
  { key: "not_interested", label: "Not interested" },
  { key: "already_has_solution", label: "Already has a solution" },
  { key: "assessment_booked", label: "Assessment booked" },
  { key: "opted_out", label: "Opted out" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
];

export type ExistingOutcomeValue = "no_answer" | "left_voicemail" | "sent" | "replied" | "interested" | "not_interested" | "meeting_booked" | "won" | "lost";

interface MappingEntry {
  /** Existing call_log/perform-route outcome enum value. Never a new one. null only for opted_out, which bypasses this mapping entirely via /suppress. */
  value: ExistingOutcomeValue | null;
  /** Every entry is now exact -- kept as a field (rather than removed) so tests can assert this invariant never regresses. */
  exact: true;
  /** Mirrors the perform route's real stopOutcomes array. */
  isStopOutcome: boolean;
}

export const OUTCOME_MAPPING: Record<PlaybookOutcomeKey, MappingEntry> = {
  no_answer: { value: "no_answer", exact: true, isStopOutcome: false },
  voicemail_left: { value: "left_voicemail", exact: true, isStopOutcome: false },
  email_sent: { value: "sent", exact: true, isStopOutcome: false },
  // The prospect genuinely responded -- "replied" is exact. The specific
  // promise/date lives in the required note; the real, existing, queue-
  // visible next action this produces is REVIEW_REPLY (computeProspectAction
  // routes status "replied" there unconditionally, before it would ever
  // look at a follow-up date) -- documented, not silently assumed.
  information_requested: { value: "replied", exact: true, isStopOutcome: true },
  callback_scheduled: { value: "replied", exact: true, isStopOutcome: true },
  // Only reachable after the caller explicitly affirms genuine interest
  // (see the confirmation gate in the component below) -- never implied
  // merely by reaching this branch.
  interested: { value: "interested", exact: true, isStopOutcome: true },
  qualified_not_ready: { value: "interested", exact: true, isStopOutcome: true },
  not_interested: { value: "not_interested", exact: true, isStopOutcome: true },
  already_has_solution: { value: "not_interested", exact: true, isStopOutcome: true },
  assessment_booked: { value: "meeting_booked", exact: true, isStopOutcome: true },
  opted_out: { value: null, exact: true, isStopOutcome: true },
  won: { value: "won", exact: true, isStopOutcome: true },
  lost: { value: "lost", exact: true, isStopOutcome: true }
};

export const REQUIRES_NOTE: PlaybookOutcomeKey[] = ["information_requested", "callback_scheduled", "interested", "qualified_not_ready"];

/** A promised future touchpoint must have a real date attached, not be silently dropped. */
export const REQUIRES_FOLLOW_UP: PlaybookOutcomeKey[] = ["callback_scheduled", "qualified_not_ready", "interested"];

/** Requires the caller to explicitly affirm the underlying fact before this outcome can be stored -- never assumed from merely reaching the option. */
export const REQUIRES_AFFIRMATION: PlaybookOutcomeKey[] = ["interested"];
const AFFIRMATION_TEXT: Partial<Record<PlaybookOutcomeKey, string>> = {
  interested: "The prospect affirmatively expressed interest in moving forward -- this was not assumed."
};

export type ConversationBranchKey = "gatekeeper_only" | "spoke_with_decision_maker" | "wrong_contact" | "number_invalid" | "contact_info_disputed";

interface BranchDef {
  key: ConversationBranchKey;
  label: string;
  /** true = operational branch (skip/snooze/note only, never a persisted outcome). false = reveals a filtered outcome sub-list. */
  operational: boolean;
  /** For non-operational branches: which real outcomes are actually reachable from here. */
  reachableOutcomes?: PlaybookOutcomeKey[];
}

export const CONVERSATION_BRANCHES: BranchDef[] = [
  {
    key: "gatekeeper_only",
    label: "Gatekeeper only",
    operational: false,
    reachableOutcomes: ["callback_scheduled", "information_requested", "no_answer"]
  },
  {
    key: "spoke_with_decision_maker",
    label: "Spoke with decision-maker",
    operational: false,
    reachableOutcomes: ["interested", "not_interested", "assessment_booked", "information_requested", "callback_scheduled", "qualified_not_ready", "already_has_solution", "won", "lost"]
  },
  { key: "wrong_contact", label: "Wrong contact", operational: true },
  { key: "number_invalid", label: "Number invalid", operational: true },
  { key: "contact_info_disputed", label: "Contact information disputed", operational: true }
];

type Selection = { type: "outcome"; key: PlaybookOutcomeKey } | { type: "branch"; key: ConversationBranchKey };

/** Structured extras for the two outcomes that need more than a free-text note -- see lib/prospect/operational-followup.ts. */
export interface OutcomeExtra {
  callbackDueAt?: string; // ISO 8601, resolved client-side from date+time (interpreted in the browser's own timezone)
  callbackPurpose?: string;
  requestedInfo?: string;
  promisedTiming?: string;
}

export function OutcomePanel({
  channel,
  hasActionId,
  willAdvanceSequence,
  onConfirm,
  onOperational,
  pending
}: {
  channel: "CALL" | "EMAIL";
  hasActionId: boolean;
  willAdvanceSequence: boolean;
  onConfirm: (outcome: PlaybookOutcomeKey, note: string, followUpOption: string, extra: OutcomeExtra) => void;
  onOperational: (branchKey: ConversationBranchKey, op: "skip" | "snooze" | "log", note: string, snoozeOption?: string) => void;
  pending: boolean;
}) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [note, setNote] = useState("");
  const [followUpOption, setFollowUpOption] = useState("");
  const [affirmed, setAffirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackPurpose, setCallbackPurpose] = useState("");
  const [requestedInfo, setRequestedInfo] = useState("");
  const [promisedTiming, setPromisedTiming] = useState("");

  const selectedOutcome = selection?.type === "outcome" ? selection.key : null;
  const selectedBranch = selection?.type === "branch" ? CONVERSATION_BRANCHES.find((b) => b.key === selection.key)! : null;
  const browserTimezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  function reset() {
    setSelection(null);
    setNote("");
    setFollowUpOption("");
    setAffirmed(false);
    setConfirming(false);
    setCallbackDate("");
    setCallbackTime("");
    setCallbackPurpose("");
    setRequestedInfo("");
    setPromisedTiming("");
  }

  // --- Top level: branches and directly-reachable outcomes ---
  if (!selection) {
    return (
      <div>
        <p className="text-[12.5px] font-medium text-ink">What actually happened?</p>
        <p className="mt-1 text-[11.5px] text-faint">Select the one real outcome — this determines what gets recorded. &ldquo;Gatekeeper only&rdquo; and &ldquo;Spoke with decision-maker&rdquo; ask a follow-up question rather than recording anything by themselves.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CONVERSATION_BRANCHES.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setSelection({ type: "branch", key: b.key })}
              className="focus-ring rounded-full border border-signal-warn/30 bg-signal-warn/5 px-3 py-1.5 text-[11.5px] text-signal-warn hover:border-signal-warn/50"
            >
              {b.label} →
            </button>
          ))}
          {PLAYBOOK_OUTCOMES.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSelection({ type: "outcome", key: o.key })}
              className="focus-ring rounded-full border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:border-iris/40 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- A branch was picked: show its filtered follow-up choices ---
  if (selectedBranch) {
    if (selectedBranch.operational) {
      return (
        <OperationalBranch
          label={selectedBranch.label}
          hasActionId={hasActionId}
          note={note}
          onNote={setNote}
          onBack={reset}
          onSkip={() => onOperational(selectedBranch.key, "skip", note)}
          onSnooze={(opt) => onOperational(selectedBranch.key, "snooze", note, opt)}
          onLogOnly={() => onOperational(selectedBranch.key, "log", note)}
          pending={pending}
        />
      );
    }
    const reachable = PLAYBOOK_OUTCOMES.filter((o) => selectedBranch.reachableOutcomes?.includes(o.key));
    return (
      <div>
        <button type="button" onClick={reset} className="focus-ring text-[11.5px] text-iris-soft hover:underline">
          ← Choose a different branch
        </button>
        <p className="mt-3 text-[12.5px] font-medium text-ink">{selectedBranch.label} — what was the real result?</p>
        <p className="mt-1 text-[11.5px] text-faint">A branch is never itself a recorded outcome — pick the one thing that actually happened.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reachable.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSelection({ type: "outcome", key: o.key })}
              className="focus-ring rounded-full border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:border-iris/40 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- A real outcome was picked: confirm/detail panel ---
  const outcome = selectedOutcome!;
  const label = PLAYBOOK_OUTCOMES.find((o) => o.key === outcome)!.label;
  const mapping = OUTCOME_MAPPING[outcome];
  const isOptOut = outcome === "opted_out";
  const noteRequired = REQUIRES_NOTE.includes(outcome);
  const followUpRequired = REQUIRES_FOLLOW_UP.includes(outcome);
  const affirmationRequired = REQUIRES_AFFIRMATION.includes(outcome);
  const isCallback = outcome === "callback_scheduled";
  const isInfoRequest = outcome === "information_requested";
  const callbackFieldsValid = !isCallback || (callbackDate.length > 0 && callbackTime.length > 0 && callbackPurpose.trim().length > 0);
  const infoFieldsValid = !isInfoRequest || requestedInfo.trim().length > 0;
  const canConfirm =
    (!noteRequired || note.trim().length > 0) &&
    (!followUpRequired || isCallback || followUpOption.length > 0) &&
    (!affirmationRequired || affirmed) &&
    callbackFieldsValid &&
    infoFieldsValid;
  const sequenceWillAdvance = !isOptOut && willAdvanceSequence && !mapping.isStopOutcome;
  const callbackDueAtPreview = isCallback && callbackDate && callbackTime ? new Date(`${callbackDate}T${callbackTime}`) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setSelection(selectedBranch ? selection : null)}
        className="focus-ring text-[11.5px] text-iris-soft hover:underline"
      >
        ← Choose a different outcome
      </button>

      <div className="mt-3 rounded-xl border border-hairline bg-raised/50 p-4">
        <p className="text-[12.5px] font-semibold text-ink">{label}</p>

        {!isOptOut ? (
          <div className="mt-2 rounded-lg border border-hairline bg-canvas/60 px-2.5 py-2 text-[11px] leading-relaxed text-faint">
            Stored as: <span className="font-mono text-ink">{mapping.value}</span> — exact, truthful match.
            {isCallback ? " This creates a real, due-dated \"Callback\" action that will appear in Daily Queue exactly when it comes due." : null}
            {isInfoRequest ? " This creates a real, immediately-actionable \"Send information\" action — it stays pending until you explicitly mark it sent." : null}
          </div>
        ) : null}

        {isCallback ? (
          <div className="mt-2 space-y-2 rounded-lg border border-iris/25 bg-iris/5 p-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-faint">
                Date
                <input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink" />
              </label>
              <label className="text-[11px] text-faint">
                Time
                <input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink" />
              </label>
            </div>
            <p className="text-[10.5px] text-faint">Timezone: {browserTimezone || "unknown — please also state it in the purpose note"}</p>
            <label className="block text-[11px] text-faint">
              Callback purpose (required)
              <input
                value={callbackPurpose}
                onChange={(e) => setCallbackPurpose(e.target.value)}
                placeholder="e.g. Discuss the assessment once their busy season ends"
                className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink"
              />
            </label>
            {callbackDueAtPreview && !isNaN(callbackDueAtPreview.getTime()) ? (
              <p className="text-[11px] text-signal-good">
                Resulting action: <span className="font-medium text-ink">Callback</span> due {callbackDueAtPreview.toLocaleString()} — will appear in Daily Queue exactly then.
              </p>
            ) : null}
          </div>
        ) : null}

        {isInfoRequest ? (
          <div className="mt-2 space-y-2 rounded-lg border border-iris/25 bg-iris/5 p-3">
            <label className="block text-[11px] text-faint">
              What information was requested (required)
              <input
                value={requestedInfo}
                onChange={(e) => setRequestedInfo(e.target.value)}
                placeholder="e.g. Pricing breakdown and sample before/after photos"
                className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink"
              />
            </label>
            <p className="text-[11px] text-faint">
              Verified delivery channel: <span className="font-medium text-ink">{channel}</span>
            </p>
            <label className="block text-[11px] text-faint">
              Promised timing (optional)
              <input
                value={promisedTiming}
                onChange={(e) => setPromisedTiming(e.target.value)}
                placeholder="e.g. by end of week"
                className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink"
              />
            </label>
            {requestedInfo.trim() ? (
              <p className="text-[11px] text-signal-good">
                Resulting action: <span className="font-medium text-ink">Send information</span> via {channel} — pending until you mark it sent yourself.
              </p>
            ) : null}
          </div>
        ) : null}

        {affirmationRequired ? (
          <label className="mt-2 flex items-start gap-2 rounded-lg border border-iris/30 bg-iris/10 p-2.5 text-[12px] text-ink">
            <input type="checkbox" checked={affirmed} onChange={(e) => setAffirmed(e.target.checked)} className="mt-0.5" />
            <span>{AFFIRMATION_TEXT[outcome]}</span>
          </label>
        ) : null}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={noteRequired ? "Concise factual note (required for this outcome)" : "Optional concise note"}
          className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink"
        />

        {followUpRequired && !isCallback ? (
          <label className="mt-2 block text-[11px] text-faint">
            Follow-up (required for this outcome)
            <select value={followUpOption} onChange={(e) => setFollowUpOption(e.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink">
              <option value="">Choose a follow-up date</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="three_days">3 days</option>
              <option value="one_week">1 week</option>
            </select>
          </label>
        ) : null}

        <div className="mt-3 space-y-1 rounded-lg border border-hairline bg-canvas/70 p-3 text-[11.5px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Before you save:</p>
          <p>• The underlying action will be marked performed: yes.</p>
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
          <p>• Suppression will be applied: {isOptOut ? "yes — this prospect will be suppressed" : "no"}.</p>
        </div>

        {isOptOut ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-signal-bad/30 bg-signal-bad/10 p-2.5 text-[11.5px] text-signal-bad">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>This uses the canonical Suppress Prospect action — the prospect will be permanently excluded from future outreach until explicitly unsuppressed.</span>
          </div>
        ) : null}

        {!confirming ? (
          <div className="mt-3">
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => setConfirming(true)}
              aria-describedby={!canConfirm ? "outcome-confirm-reason" : undefined}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              Preview & Confirm
            </button>
            {!canConfirm ? (
              <p id="outcome-confirm-reason" className="mt-1.5 text-[11px] text-signal-warn">
                {isCallback && !callbackFieldsValid
                  ? "Date, time, and a callback purpose are all required."
                  : isInfoRequest && !infoFieldsValid
                    ? "A description of the requested information is required."
                    : noteRequired && !note.trim()
                      ? "A note is required for this outcome."
                      : followUpRequired && !isCallback && !followUpOption
                        ? "A follow-up date is required for this outcome."
                        : affirmationRequired && !affirmed
                          ? "You must explicitly affirm this before saving."
                          : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-hairline bg-canvas/70 p-3">
            <p className="text-[12px] leading-relaxed text-ink/85">
              &ldquo;I confirm that I personally initiated this {channel === "CALL" ? "call" : "contact"}, that the displayed information was accurate to the best of my knowledge, and that I will honor any request not to be contacted.&rdquo;
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  onConfirm(outcome, note, followUpOption, {
                    callbackDueAt: isCallback && callbackDueAtPreview ? callbackDueAtPreview.toISOString() : undefined,
                    callbackPurpose: isCallback ? callbackPurpose : undefined,
                    requestedInfo: isInfoRequest ? requestedInfo : undefined,
                    promisedTiming: isInfoRequest ? promisedTiming : undefined
                  })
                }
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

/**
 * Wrong contact / Number invalid / Contact information disputed: purely
 * operational. Never calls perform()/pitch-outcome() -- the only real
 * mutations available are the existing, truthful skip/snooze operation
 * on the current prospect_action (when one exists). No status is ever
 * recorded; nothing claims what the prospect thinks.
 */
function OperationalBranch({
  label,
  hasActionId,
  note,
  onNote,
  onBack,
  onSkip,
  onSnooze,
  onLogOnly,
  pending
}: {
  label: string;
  hasActionId: boolean;
  note: string;
  onNote: (v: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onSnooze: (option: string) => void;
  onLogOnly: () => void;
  pending: boolean;
}) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={onBack} className="focus-ring text-[11.5px] text-iris-soft hover:underline">
        ← Choose a different outcome
      </button>
      <p className="mt-3 text-[12.5px] font-medium text-ink">{label}</p>
      <div className="mt-2 rounded-lg border border-hairline bg-canvas/60 p-3 text-[11.5px] leading-relaxed text-muted">
        <p className="font-medium text-ink">What will be recorded:</p>
        <p>• A structured operational event — never classified as not interested, no answer, engagement, or conversion.</p>
        <p>• The affected channel ({label.includes("Number") || label.includes("disputed") ? "the number/contact in question" : "this channel"}) becomes unavailable in the Playbook until reverified — other verified channels are untouched.</p>
        <p>• The business has NOT been classified as uninterested.</p>
        <p>• {hasActionId ? "The current action will be skipped or snoozed, as you choose below." : "No queue action is attached to this session, so nothing else changes."}</p>
      </div>
      <textarea
        value={note}
        onChange={(e) => onNote(e.target.value)}
        rows={2}
        placeholder="Factual note (saved with this event)"
        className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink"
      />
      {hasActionId ? (
        <div className="relative mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onSkip}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink disabled:opacity-60"
          >
            Skip this action
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setSnoozeOpen((v) => !v)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink disabled:opacity-60"
          >
            Snooze for later
          </button>
          {snoozeOpen ? (
            <div className="absolute left-0 top-full z-10 mt-1.5 w-36 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-xl">
              {[
                { key: "tomorrow", label: "Tomorrow" },
                { key: "three_days", label: "3 days" },
                { key: "one_week", label: "1 week" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setSnoozeOpen(false);
                    onSnooze(opt.key);
                  }}
                  className="block w-full px-3 py-2 text-left text-[12px] text-muted hover:bg-raised hover:text-ink"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-[11.5px] text-faint">No specific queue action is attached to this session — there&rsquo;s nothing to skip or snooze, but the event itself can still be recorded.</p>
          <button
            type="button"
            disabled={pending}
            onClick={onLogOnly}
            className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink disabled:opacity-60"
          >
            Record this issue
          </button>
        </div>
      )}
    </div>
  );
}
