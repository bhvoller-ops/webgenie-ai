"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Copy, Loader2, Maximize2, Minimize2, PhoneOff, Shield, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/format";
import { renderTemplate, type PlaybookRenderVars } from "@/lib/playbook/render";
import { PLAYBOOK_STAGE_LABELS, type PlaybookStageKey } from "@/lib/playbook/types";
import type { PlaybookContext, PlaybookBlocked } from "@/lib/playbook/resolve-context";
import { IntelligenceCard } from "./intelligence-card";
import { ObjectionAssistant } from "./objection-assistant";
import { OutcomePanel, OUTCOME_MAPPING, type PlaybookOutcomeKey } from "./outcome-panel";

const LINEAR_STAGES: PlaybookStageKey[] = ["PRE_CALL_CHECK", "GATEKEEPER", "OPENING", "VERIFIED_OBSERVATION", "DISCOVERY", "BOOK_ASSESSMENT", "OUTCOME"];

const CALLER_NAME_STORAGE_KEY = "webgenie.playbook.callerName";
const CALLER_PHONE_STORAGE_KEY = "webgenie.playbook.callerPhone";
const ORG_WEBSITE_STORAGE_KEY = "webgenie.playbook.organizationWebsite";

interface GeneratedScript {
  id: string;
  subject: string | null;
  body: string;
}

export function PlaybookWorkspace({ prospectId, actionId, enrollmentId }: { prospectId: string; actionId: string | null; enrollmentId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<PlaybookContext | null>(null);
  const [blocked, setBlocked] = useState<PlaybookBlocked | null>(null);
  const [loadError, setLoadError] = useState("");

  const [stageIndex, setStageIndex] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [organizationWebsite, setOrganizationWebsite] = useState("");
  const [gatekeeper, setGatekeeper] = useState({ name: "", role: "", directNumber: "", email: "", callbackTime: "" });
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [restrainedImpact, setRestrainedImpact] = useState("");
  const [bookingOptionA, setBookingOptionA] = useState("");
  const [bookingOptionB, setBookingOptionB] = useState("");
  const [bookedTime, setBookedTime] = useState("");
  const [showNoAnswerStage, setShowNoAnswerStage] = useState(false);

  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [preparingScript, setPreparingScript] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [copied, setCopied] = useState(false);

  const [outcomePending, setOutcomePending] = useState(false);
  const [outcomeError, setOutcomeError] = useState("");
  const [outcomeSaved, setOutcomeSaved] = useState(false);
  const [operationalDone, setOperationalDone] = useState<"skip" | "snooze" | null>(null);

  // OWNER-REVIEW CORRECTION: caller identity is never hardcoded and never
  // silently blank. Name/phone/website are per-viewer conveniences stored
  // ONLY in this browser's localStorage (never sent to WebGenie, never
  // read back by the server) -- see the exact keys below. Nothing here is
  // sensitive (a name, a phone number the caller already has, a public
  // website URL); clearing them is just clearing these three keys, which
  // "Clear caller identity" in Pre-Call Check does directly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = window.localStorage.getItem(CALLER_NAME_STORAGE_KEY);
    const savedPhone = window.localStorage.getItem(CALLER_PHONE_STORAGE_KEY);
    const savedWebsite = window.localStorage.getItem(ORG_WEBSITE_STORAGE_KEY);
    if (savedName) setCallerName(savedName);
    if (savedPhone) setCallerPhone(savedPhone);
    if (savedWebsite) setOrganizationWebsite(savedWebsite);
  }, []);

  // A real, org-configured support phone (org_branding.support_phone) is
  // offered as the callback number's starting value ONLY if the caller
  // hasn't already set their own -- never overwrites a value they typed.
  useEffect(() => {
    if (!context?.intelligence.organizationSupportPhone) return;
    if (callerPhone) return;
    const savedPhone = typeof window !== "undefined" ? window.localStorage.getItem(CALLER_PHONE_STORAGE_KEY) : null;
    if (!savedPhone) setCallerPhone(context.intelligence.organizationSupportPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.intelligence.organizationSupportPhone]);

  function clearCallerIdentity() {
    setCallerName("");
    setCallerPhone("");
    setOrganizationWebsite("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CALLER_NAME_STORAGE_KEY);
      window.localStorage.removeItem(CALLER_PHONE_STORAGE_KEY);
      window.localStorage.removeItem(ORG_WEBSITE_STORAGE_KEY);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const qs = new URLSearchParams();
        if (actionId) qs.set("actionId", actionId);
        if (enrollmentId) qs.set("enrollmentId", enrollmentId);
        const res = await fetch(`/api/prospects/${prospectId}/playbook?${qs.toString()}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setBlocked({ ok: false, reason: json.reason, message: json.error });
        } else {
          setContext(json as PlaybookContext);
        }
      } catch {
        if (!cancelled) setLoadError("Couldn't load this prospect's playbook.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prospectId, actionId, enrollmentId]);

  // Warn before leaving with unsaved information — never write anything
  // automatically on unload, only warn.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty || outcomeSaved) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, outcomeSaved]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  const channel: "CALL" | "EMAIL" | null = context?.sequence
    ? context.sequence.channel === "CALL" || context.sequence.channel === "EMAIL"
      ? context.sequence.channel
      : null
    : context?.recommendedChannel ?? null;

  const stage = LINEAR_STAGES[stageIndex];

  const vars: PlaybookRenderVars = useMemo(() => {
    if (!context) return {};
    return {
      businessName: context.intelligence.businessName,
      callerName,
      organizationName: context.intelligence.organizationName,
      location: context.intelligence.city ? `${context.intelligence.city}${context.intelligence.state ? `, ${context.intelligence.state}` : ""}` : "",
      businessNoun: context.config.terminology.businessNoun,
      industryAdjective: context.config.terminology.industryAdjective,
      evidenceTarget: context.intelligence.websiteUrl ?? `${context.intelligence.businessName}'s online presence`,
      verifiedObservation: context.intelligence.verifiedObservations[0] ?? "",
      restrainedImpact,
      callbackNumber: callerPhone,
      contactName: gatekeeper.name,
      optionA: bookingOptionA,
      optionB: bookingOptionB,
      timeA: bookingOptionA,
      timeB: bookingOptionB,
      callerPhone,
      organizationWebsite
    };
  }, [context, callerName, callerPhone, organizationWebsite, restrainedImpact, gatekeeper.name, bookingOptionA, bookingOptionB]);

  async function prepareScript() {
    if (!context || !channel) return;
    setPreparingScript(true);
    setScriptError("");
    try {
      if (context.sequence) {
        const res = await fetch(`/api/prospects/${prospectId}/sequence-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Couldn't prepare that message.");
        setScript({ id: "", subject: json.message?.subject ?? null, body: json.message?.body ?? "" });
      } else {
        const pitchChannel = channel === "CALL" ? "call_opener" : "cold_email";
        const existingRes = await fetch(`/api/prospects/${prospectId}/pitch`);
        const existingJson = await existingRes.json();
        const existing = (existingJson.pitches ?? []).find((p: { channel: string }) => p.channel === pitchChannel);
        if (existing) {
          setScript({ id: existing.id, subject: existing.subject, body: existing.body });
        } else {
          const res = await fetch(`/api/prospects/${prospectId}/pitch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel: pitchChannel })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Couldn't prepare that opener.");
          setScript({ id: json.pitch.id, subject: json.pitch.subject, body: json.pitch.body });
        }
      }
    } catch (e) {
      setScriptError(e instanceof Error ? e.message : "Couldn't prepare that script.");
    } finally {
      setPreparingScript(false);
    }
  }

  function copyScript() {
    if (!script) return;
    const text = script.subject ? `${script.subject}\n\n${script.body}` : script.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
    // Copying a script is not outreach — no activity, no state change here.
  }

  async function handleOutcomeConfirm(outcome: PlaybookOutcomeKey, outcomeNote: string, followUpOption: string) {
    if (!context || !channel) return;
    setOutcomePending(true);
    setOutcomeError("");
    try {
      if (outcome === "opted_out") {
        const res = await fetch(`/api/prospects/${prospectId}/suppress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "suppress", reason: "OPTED_OUT" })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Couldn't record the opt-out.");
      } else {
        const mapped = OUTCOME_MAPPING[outcome].value;
        if (!mapped) throw new Error("This outcome has no destination — that's a bug, not a valid save.");
        if (context.sequence) {
          const res = await fetch(`/api/prospects/${prospectId}/sequence-enrollments/${context.sequence.enrollmentId}/perform`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              outcome: mapped,
              currentStepOrder: context.sequence.currentStepOrder,
              sequenceStepId: context.sequence.sequenceStepId,
              channel,
              followUp: followUpOption ? { option: followUpOption } : undefined
            })
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error || "Couldn't save that outcome.");
        } else {
          // A non-sequence CALL/EMAIL outcome requires the prepared pitch to
          // exist first — generate it now if the user skipped "Prepare
          // script" entirely, so the outcome route (which needs a real
          // pitchId) has something real to reference.
          let pitchId = script?.id;
          if (!pitchId) {
            const pitchChannel = channel === "CALL" ? "call_opener" : "cold_email";
            const res = await fetch(`/api/prospects/${prospectId}/pitch`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channel: pitchChannel })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Couldn't prepare the opener needed to log this outcome.");
            pitchId = json.pitch.id;
          }
          const res = await fetch(`/api/prospects/${prospectId}/pitch/${pitchId}/outcome`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outcome: mapped, followUp: followUpOption ? { option: followUpOption } : undefined })
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error || "Couldn't save that outcome.");
        }
      }
      setOutcomeSaved(true);
      setDirty(false);
    } catch (e) {
      setOutcomeError(e instanceof Error ? e.message : "Couldn't save that outcome.");
    } finally {
      setOutcomePending(false);
    }
  }

  /**
   * Wrong contact / Number invalid / Contact information disputed:
   * purely operational, never a recorded outcome. Reuses the EXISTING
   * truthful skip/snooze operation on the current prospect_action --
   * never perform()/pitch-outcome(), never a call_log status write.
   */
  async function handleOperational(op: "skip" | "snooze", snoozeOption?: string) {
    if (!actionId) return; // OutcomePanel only offers this when hasActionId is true
    setOutcomePending(true);
    setOutcomeError("");
    try {
      const body: Record<string, unknown> = op === "skip" ? { op: "skip" } : { op: "snooze", option: snoozeOption };
      const res = await fetch(`/api/prospect-actions/${actionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn't update this action.");
      setOperationalDone(op);
      setDirty(false);
    } catch (e) {
      setOutcomeError(e instanceof Error ? e.message : "Couldn't update this action.");
    } finally {
      setOutcomePending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-faint" aria-hidden />
      </div>
    );
  }

  if (blocked || loadError || !context) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-panel border border-signal-bad/30 bg-signal-bad/10 p-6 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-signal-bad" aria-hidden />
        <p className="mt-3 text-[13.5px] leading-relaxed text-signal-bad">{blocked?.message || loadError}</p>
        <Link href={`/prospects/${prospectId}`} className="focus-ring mt-4 inline-block text-[12.5px] font-medium text-iris-soft hover:underline">
          Back to prospect
        </Link>
      </div>
    );
  }

  if (outcomeSaved) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-panel border border-signal-good/30 bg-signal-good/10 p-6 text-center">
        <Check className="mx-auto h-6 w-6 text-signal-good" aria-hidden />
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink">Outcome saved. The Daily Queue and sequence have been updated.</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          If this prospect just went WON, open its prospect page to start Won Client Handoff — WON never creates a fulfillment project automatically.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link href={`/prospects/${prospectId}`} className="focus-ring text-[12.5px] font-medium text-iris-soft hover:underline">
            Back to prospect
          </Link>
          <Link href="/prospecting" className="focus-ring text-[12px] text-faint hover:text-muted">
            Back to Daily Queue
          </Link>
        </div>
      </div>
    );
  }

  if (operationalDone) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-panel border border-hairline bg-canvas/70 p-6 text-center">
        <Check className="mx-auto h-6 w-6 text-muted" aria-hidden />
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
          Action {operationalDone === "skip" ? "skipped" : "snoozed"}. No outcome was recorded — nothing was claimed about the prospect&rsquo;s interest.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link href={`/prospects/${prospectId}`} className="focus-ring text-[12.5px] font-medium text-iris-soft hover:underline">
            Back to prospect
          </Link>
          <Link href="/prospecting" className="focus-ring text-[12px] text-faint hover:text-muted">
            Back to Daily Queue
          </Link>
        </div>
      </div>
    );
  }

  // OWNER-REVIEW CORRECTION: a suppressed prospect gets its own unmistakable
  // read-only view (per the spec's own "may display historical information
  // in a read-only state") instead of being hidden behind a generic
  // no-channel message. Every channel action, message preparation, outcome
  // control, and project/contact mutation is simply absent from this view
  // -- there is no code path here that could perform any of them, so this
  // holds even against a direct URL open, not merely a hidden button.
  if (context.intelligence.suppressed) {
    return (
      <div className="mx-auto mt-10 max-w-2xl px-4">
        <div className="flex items-start gap-3 rounded-panel border border-signal-bad/30 bg-signal-bad/10 p-5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-signal-bad" aria-hidden />
          <div>
            <p className="text-[14px] font-semibold text-signal-bad">This prospect is suppressed. New outreach is blocked.</p>
            {context.intelligence.suppressionReason ? <p className="mt-1 text-[12px] text-signal-bad/90">Reason: {context.intelligence.suppressionReason}</p> : null}
          </div>
        </div>

        <div className="mt-4">
          <IntelligenceCard intelligence={context.intelligence} channels={context.channels} />
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-faint">
          Every channel action, message preparation, outcome control, follow-up, sequence progression, and project/contact mutation is disabled for a suppressed prospect. This page is read-only history only.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/prospects/${prospectId}`} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3.5 py-2 text-[12.5px] font-medium text-muted hover:text-ink">
            Back to prospect
          </Link>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-panel border border-hairline bg-canvas/70 p-6 text-center">
        <PhoneOff className="mx-auto h-6 w-6 text-faint" aria-hidden />
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">No verified CALL or EMAIL channel is available for this prospect. The playbook cannot enable outreach here.</p>
        <Link href={`/prospects/${prospectId}`} className="focus-ring mt-4 inline-block text-[12.5px] font-medium text-iris-soft hover:underline">
          Back to prospect
        </Link>
      </div>
    );
  }

  function goNext() {
    setStageIndex((i) => Math.min(i + 1, LINEAR_STAGES.length - 1));
  }
  function goBack() {
    setStageIndex((i) => Math.max(i - 1, 0));
  }
  function jumpToOutcome() {
    setStageIndex(LINEAR_STAGES.indexOf("OUTCOME"));
  }
  function jumpToNoAnswer() {
    setShowNoAnswerStage(true);
  }

  function handleExitClick() {
    if (dirty && !outcomeSaved) {
      setConfirmExit(true);
    } else {
      router.push(`/prospects/${prospectId}`);
    }
  }

  const willAdvanceSequence = Boolean(context.sequence);

  if (showNoAnswerStage) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <NoAnswerStage
          vars={vars}
          config={context.config}
          channel={channel}
          email={context.intelligence.email}
          onBack={() => setShowNoAnswerStage(false)}
          onContinue={() => {
            setShowNoAnswerStage(false);
            jumpToOutcome();
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6", focusMode ? "bg-canvas" : "")}>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink">{context.intelligence.businessName}</p>
          <p className="text-[11.5px] text-faint">
            {context.config.playbookName} · {channel} · Stage {stageIndex + 1} of {LINEAR_STAGES.length}: {PLAYBOOK_STAGE_LABELS[stage]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:text-ink"
          >
            {focusMode ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
            Focus Mode
          </button>
          <button type="button" onClick={handleExitClick} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:text-signal-bad">
            <X className="h-3.5 w-3.5" aria-hidden />
            Exit
          </button>
        </div>
      </div>

      {confirmExit ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-signal-warn/30 bg-signal-warn/10 px-3 py-2.5">
          <p className="text-[12px] text-signal-warn">Leave without recording an outcome? Nothing typed here has been saved.</p>
          <div className="flex gap-2">
            <button onClick={() => router.push(`/prospects/${prospectId}`)} className="focus-ring rounded-md border border-signal-warn/40 px-2.5 py-1 text-[11.5px] font-medium text-signal-warn">
              Exit Without Recording
            </button>
            <button onClick={() => setConfirmExit(false)} className="focus-ring rounded-md px-2.5 py-1 text-[11.5px] text-faint hover:text-muted">
              Stay
            </button>
          </div>
        </div>
      ) : null}

      {/* STAGE PROGRESS */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {LINEAR_STAGES.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10.5px] font-medium",
              i === stageIndex ? "bg-iris/20 text-iris-soft" : i < stageIndex ? "bg-signal-good/15 text-signal-good" : "bg-raised text-faint"
            )}
          >
            {PLAYBOOK_STAGE_LABELS[s]}
          </span>
        ))}
      </div>

      <div className={cn("mt-6 grid gap-6", focusMode ? "grid-cols-1" : "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start")}>
        {/* MAIN STAGE PANEL */}
        <div className="card p-6">
          {stage === "PRE_CALL_CHECK" ? (
            <PreCallCheck
              callerName={callerName}
              onCallerName={(v) => {
                setCallerName(v);
                if (typeof window !== "undefined") window.localStorage.setItem(CALLER_NAME_STORAGE_KEY, v);
              }}
              callerPhone={callerPhone}
              onCallerPhone={(v) => {
                setCallerPhone(v);
                if (typeof window !== "undefined") window.localStorage.setItem(CALLER_PHONE_STORAGE_KEY, v);
              }}
              organizationWebsite={organizationWebsite}
              onOrganizationWebsite={(v) => {
                setOrganizationWebsite(v);
                if (typeof window !== "undefined") window.localStorage.setItem(ORG_WEBSITE_STORAGE_KEY, v);
              }}
              onClearIdentity={clearCallerIdentity}
              channel={channel}
              suppressed={context.intelligence.suppressed}
              hasPriorContact={context.intelligence.priorContactCount > 0}
              lastOutcome={context.intelligence.lastContactOutcome}
            />
          ) : null}

          {stage === "GATEKEEPER" ? (
            <GatekeeperStage
              vars={vars}
              config={context.config}
              gatekeeper={gatekeeper}
              onChange={(g) => { setGatekeeper(g); markDirty(); }}
              onNoAnswer={jumpToNoAnswer}
              onRequestedNoContact={jumpToOutcome}
            />
          ) : null}

          {stage === "OPENING" ? <OpeningStage vars={vars} config={context.config} /> : null}

          {stage === "VERIFIED_OBSERVATION" ? (
            <VerifiedObservationStage
              vars={vars}
              config={context.config}
              restrainedImpact={restrainedImpact}
              onRestrainedImpact={(v) => { setRestrainedImpact(v); markDirty(); }}
              script={script}
              preparingScript={preparingScript}
              scriptError={scriptError}
              onPrepare={prepareScript}
              onCopy={copyScript}
              copied={copied}
            />
          ) : null}

          {stage === "DISCOVERY" ? (
            <DiscoveryStage
              questions={context.config.discoveryQuestions}
              answers={discoveryAnswers}
              onAnswer={(key, val) => { setDiscoveryAnswers((prev) => ({ ...prev, [key]: val })); markDirty(); }}
              painPoints={painPoints}
              onTogglePain={(q) => { setPainPoints((prev) => (prev.includes(q) ? prev.filter((p) => p !== q) : [...prev, q])); markDirty(); }}
            />
          ) : null}

          {stage === "BOOK_ASSESSMENT" ? (
            <BookAssessmentStage
              vars={vars}
              config={context.config}
              optionA={bookingOptionA}
              optionB={bookingOptionB}
              onOptionA={(v) => { setBookingOptionA(v); markDirty(); }}
              onOptionB={(v) => { setBookingOptionB(v); markDirty(); }}
              bookedTime={bookedTime}
              onBookedTime={(v) => { setBookedTime(v); markDirty(); }}
            />
          ) : null}

          {stage === "OUTCOME" ? (
            <>
              {outcomeError ? <p className="mb-3 text-[12.5px] text-signal-bad">{outcomeError}</p> : null}
              <OutcomePanel
                channel={channel}
                hasActionId={Boolean(actionId)}
                willAdvanceSequence={willAdvanceSequence}
                onConfirm={handleOutcomeConfirm}
                onOperational={handleOperational}
                pending={outcomePending}
              />
            </>
          ) : null}

          {/* STICKY-FEELING FOOTER NAV (in-flow here; wrapper below makes it sticky on scroll) */}
          <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
            <button
              type="button"
              onClick={goBack}
              disabled={stageIndex === 0}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3.5 py-2 text-[12.5px] font-medium text-muted disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
            </button>
            {stage !== "OUTCOME" ? (
              <button
                type="button"
                onClick={goNext}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[12.5px] font-semibold text-white"
              >
                Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        {/* PROSPECT INTELLIGENCE CARD */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <IntelligenceCard intelligence={context.intelligence} channels={context.channels} collapsible />
        </div>
      </div>

      <ObjectionAssistant objections={context.config.objectionResponses} vars={vars} />
    </div>
  );
}

function PreCallCheck({
  callerName,
  onCallerName,
  callerPhone,
  onCallerPhone,
  organizationWebsite,
  onOrganizationWebsite,
  onClearIdentity,
  channel,
  suppressed,
  hasPriorContact,
  lastOutcome
}: {
  callerName: string;
  onCallerName: (v: string) => void;
  callerPhone: string;
  onCallerPhone: (v: string) => void;
  organizationWebsite: string;
  onOrganizationWebsite: (v: string) => void;
  onClearIdentity: () => void;
  channel: "CALL" | "EMAIL";
  suppressed: boolean;
  hasPriorContact: boolean;
  lastOutcome: string | null;
}) {
  const items = [
    "Confirm business identity",
    channel === "CALL" ? "Confirm decision-maker if known" : "Confirm the recipient's role if known",
    "Confirm channel is permitted",
    "Review the verified observation",
    hasPriorContact ? `Review prior contact history — last outcome: ${lastOutcome?.replace(/_/g, " ") ?? "unknown"}` : "No prior contact on file",
    suppressed ? "This prospect is SUPPRESSED — no new outreach may be initiated" : "Check suppression — clear",
    "Open factual notes",
    "Confirm the objective"
  ];
  return (
    <div>
      <div className="eyebrow mb-3">Pre-Call Check</div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink/85">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-faint">Your name (used in scripts)</label>
          <input
            value={callerName}
            onChange={(e) => onCallerName(e.target.value)}
            placeholder="e.g. Alex"
            className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-faint">Your callback number (used in voicemail/email scripts)</label>
          <input
            value={callerPhone}
            onChange={(e) => onCallerPhone(e.target.value)}
            placeholder="Required before a voicemail/email script is shown"
            className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-medium text-faint">Your organization&rsquo;s website (optional — omitted from scripts if left blank)</label>
          <input
            value={organizationWebsite}
            onChange={(e) => onOrganizationWebsite(e.target.value)}
            placeholder="e.g. https://vibelabsagency.com"
            className="focus-ring w-full max-w-sm rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
          />
        </div>
      </div>
      {callerName || callerPhone || organizationWebsite ? (
        <button type="button" onClick={onClearIdentity} className="focus-ring mt-2 text-[11px] text-faint hover:text-signal-bad">
          Clear saved caller identity (stored only in this browser)
        </button>
      ) : null}
      <p className="mt-4 rounded-lg border border-iris/25 bg-iris/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-iris-soft">
        Your goal is not to sell the entire service on this call. Your goal is to earn permission for the next useful step.
      </p>
    </div>
  );
}

function GatekeeperStage({
  vars,
  config,
  gatekeeper,
  onChange,
  onNoAnswer,
  onRequestedNoContact
}: {
  vars: PlaybookRenderVars;
  config: import("@/lib/playbook/types").PlaybookConfig;
  gatekeeper: { name: string; role: string; directNumber: string; email: string; callbackTime: string };
  onChange: (g: typeof gatekeeper) => void;
  onNoAnswer: () => void;
  onRequestedNoContact: () => void;
}) {
  return (
    <div>
      <div className="eyebrow mb-3">Gatekeeper or Decision-Maker</div>
      <ScriptBlock text={renderTemplate(config.openings.gatekeeperOpening, vars)} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(
          [
            ["Decision-maker answered", () => {}],
            ["Receptionist / gatekeeper answered", () => {}],
            ["Wrong person", onNoAnswer],
            ["No answer", onNoAnswer],
            ["Voicemail", onNoAnswer],
            ["Number invalid", onNoAnswer],
            ["Prospect requested no contact", onRequestedNoContact]
          ] as [string, () => void][]
        ).map(([label, action]) => (
          <button key={label} type="button" onClick={action} className="focus-ring rounded-lg border border-hairline bg-raised px-3 py-2 text-left text-[12px] text-muted hover:border-iris/35 hover:text-ink">
            {label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[11px] font-medium uppercase tracking-wide text-faint">If a gatekeeper answers</p>
      <ScriptBlock text={renderTemplate(config.openings.gatekeeperReachingRightPerson, vars)} />

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-faint">If asked what this is about</p>
      <ScriptBlock text={renderTemplate(config.openings.gatekeeperWhatIsThisAbout, vars)} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Decision-maker name" value={gatekeeper.name} onChange={(v) => onChange({ ...gatekeeper, name: v })} />
        <Field label="Role" value={gatekeeper.role} onChange={(v) => onChange({ ...gatekeeper, role: v })} />
        <Field label="Direct number" value={gatekeeper.directNumber} onChange={(v) => onChange({ ...gatekeeper, directNumber: v })} />
        <Field label="Best callback time" value={gatekeeper.callbackTime} onChange={(v) => onChange({ ...gatekeeper, callbackTime: v })} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-faint">
        Any contact info captured here is not automatically treated as verified — it follows the same verification workflow before it can activate a channel.
      </p>
    </div>
  );
}

function OpeningStage({ vars, config }: { vars: PlaybookRenderVars; config: import("@/lib/playbook/types").PlaybookConfig }) {
  return (
    <div>
      <div className="eyebrow mb-3">Permission-Based Opening</div>
      <ScriptBlock text={renderTemplate(config.openings.permissionOpening, vars)} />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["Yes", "I'm busy", "What is this about?", "Not interested", "Call later"].map((b) => (
          <div key={b} className="rounded-lg border border-hairline bg-raised/50 px-3 py-2 text-[12px] text-muted">
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifiedObservationStage({
  vars,
  config,
  restrainedImpact,
  onRestrainedImpact,
  script,
  preparingScript,
  scriptError,
  onPrepare,
  onCopy,
  copied
}: {
  vars: PlaybookRenderVars;
  config: import("@/lib/playbook/types").PlaybookConfig;
  restrainedImpact: string;
  onRestrainedImpact: (v: string) => void;
  script: GeneratedScript | null;
  preparingScript: boolean;
  scriptError: string;
  onPrepare: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const hasObservation = Boolean(vars.verifiedObservation);
  return (
    <div>
      <div className="eyebrow mb-3">Verified Observation</div>
      {!hasObservation ? (
        <p className="mb-3 rounded-lg border border-signal-warn/30 bg-signal-warn/10 px-3 py-2.5 text-[12px] text-signal-warn">
          No structured verified observation is on file for this prospect yet — the script below will show a placeholder rather than an invented claim.
        </p>
      ) : null}
      {/* renderTemplate() already substitutes a visible "[verified observation]" placeholder when vars.verifiedObservation is empty -- no separate ternary/hardcoded fallback string needed here. */}
      <ScriptBlock text={renderTemplate(config.openings.verifiedObservationTemplate, vars)} />

      <div className="mt-3">
        <label className="mb-1 block text-[11px] font-medium text-faint">Restrained potential impact (your words — avoid causation claims)</label>
        <input
          value={restrainedImpact}
          onChange={(e) => onRestrainedImpact(e.target.value)}
          placeholder="e.g. make prospective customers less confident before they call"
          className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
        />
      </div>

      <ScriptBlock className="mt-3" text={renderTemplate(config.openings.verifiedObservationImpactTemplate, vars)} />

      <div className="mt-4 rounded-xl border border-hairline bg-raised/40 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-ink">Prepared script (AI-generated, evidence-grounded)</p>
          <Sparkles className="h-3.5 w-3.5 text-iris-soft" aria-hidden />
        </div>
        {script ? (
          <div className="mt-2">
            {script.subject ? <p className="text-[12px] font-semibold text-ink">{script.subject}</p> : null}
            <p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink/85">{script.body}</p>
            <button onClick={onCopy} className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1 text-[11px] text-muted hover:text-ink">
              {copied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              Copy
            </button>
          </div>
        ) : (
          <button
            onClick={onPrepare}
            disabled={preparingScript}
            className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg border border-iris/35 bg-iris/10 px-2.5 py-1.5 text-[11.5px] font-medium text-iris-soft disabled:opacity-60"
          >
            {preparingScript ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Sparkles className="h-3 w-3" aria-hidden />}
            Prepare script
          </button>
        )}
        {scriptError ? <p className="mt-2 text-[11.5px] text-signal-bad">{scriptError}</p> : null}
        <p className="mt-2 text-[10.5px] leading-relaxed text-faint">Preparing or copying this script is not outreach — nothing is sent until you act on it yourself.</p>
      </div>
    </div>
  );
}

function DiscoveryStage({
  questions,
  answers,
  onAnswer,
  painPoints,
  onTogglePain
}: {
  questions: { key: string; question: string }[];
  answers: Record<string, string>;
  onAnswer: (key: string, val: string) => void;
  painPoints: string[];
  onTogglePain: (q: string) => void;
}) {
  return (
    <div>
      <div className="eyebrow mb-3">Discovery</div>
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.key} className="rounded-lg border border-hairline bg-raised/40 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] leading-relaxed text-ink">{q.question}</p>
              <button
                type="button"
                onClick={() => onTogglePain(q.key)}
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  painPoints.includes(q.key) ? "border-signal-warn/40 bg-signal-warn/15 text-signal-warn" : "border-hairline text-faint"
                )}
              >
                Pain point
              </button>
            </div>
            <textarea
              value={answers[q.key] ?? ""}
              onChange={(e) => onAnswer(q.key, e.target.value)}
              rows={2}
              placeholder="Concise factual note — leave blank to skip"
              className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-[12.5px] text-ink"
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-faint">An unanswered question is never converted into a negative finding.</p>
    </div>
  );
}

function BookAssessmentStage({
  vars,
  config,
  optionA,
  optionB,
  onOptionA,
  onOptionB,
  bookedTime,
  onBookedTime
}: {
  vars: PlaybookRenderVars;
  config: import("@/lib/playbook/types").PlaybookConfig;
  optionA: string;
  optionB: string;
  onOptionA: (v: string) => void;
  onOptionB: (v: string) => void;
  bookedTime: string;
  onBookedTime: (v: string) => void;
}) {
  return (
    <div>
      <div className="eyebrow mb-3">Book the Assessment</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Proposed time A" value={optionA} onChange={onOptionA} />
        <Field label="Proposed time B" value={optionB} onChange={onOptionB} />
      </div>
      <ScriptBlock className="mt-3" text={renderTemplate(config.bookingClose, vars)} />
      <div className="mt-4">
        <label className="mb-1 block text-[11px] font-medium text-faint">Agreed appointment time (only if actually confirmed)</label>
        <input
          value={bookedTime}
          onChange={(e) => onBookedTime(e.target.value)}
          placeholder="Not booked yet"
          className="focus-ring w-full max-w-xs rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
        />
        <p className="mt-1.5 text-[11px] text-faint">This is not marked booked until you record that outcome explicitly in the next stage.</p>
      </div>
    </div>
  );
}

function NoAnswerStage({
  vars,
  config,
  channel,
  email,
  onBack,
  onContinue
}: {
  vars: PlaybookRenderVars;
  config: import("@/lib/playbook/types").PlaybookConfig;
  channel: "CALL" | "EMAIL";
  email: string | null;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [voicemailCopied, setVoicemailCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const hasCallbackNumber = Boolean(vars.callbackNumber && vars.callbackNumber.trim().length > 0);
  const hasEmail = Boolean(email);

  const voicemailText = renderTemplate(config.voicemailScript, vars);
  const emailSubject = renderTemplate(config.emailTemplate.subject, vars);
  const emailBodyBase = renderTemplate(config.emailTemplate.body, vars);
  // The website signature line is appended ONLY when a real value is
  // present this session -- never a dangling "[organization website]"
  // placeholder in a script meant to actually be sent.
  const emailBody = vars.organizationWebsite && vars.organizationWebsite.trim().length > 0 ? `${emailBodyBase}\n${vars.organizationWebsite}` : emailBodyBase;

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="card p-6">
      <div className="eyebrow mb-3">No-Answer / Voicemail / Email</div>

      {channel === "CALL" ? (
        <div>
          <p className="text-[12px] font-semibold text-ink">Voicemail script</p>
          {!hasCallbackNumber ? (
            <p className="mt-2 rounded-lg border border-signal-warn/30 bg-signal-warn/10 px-3 py-2.5 text-[12px] text-signal-warn">
              Enter your callback number in Pre-Call Check first — a voicemail script with no real callback number is not shown.
            </p>
          ) : (
            <>
              <ScriptBlock className="mt-2" text={voicemailText} />
              <button
                onClick={() => copy(voicemailText, setVoicemailCopied)}
                className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] text-muted hover:text-ink"
              >
                {voicemailCopied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                Copy
              </button>
            </>
          )}
        </div>
      ) : null}

      <div className={channel === "CALL" ? "mt-6 border-t border-hairline pt-5" : ""}>
        <p className="text-[12px] font-semibold text-ink">Email (only when appropriate and permitted)</p>
        {!hasEmail ? (
          <p className="mt-2 rounded-lg border border-hairline bg-raised/40 px-3 py-2.5 text-[12px] text-faint">No verified email is on file for this prospect — email preparation is disabled.</p>
        ) : (
          <>
            <div className="mt-2 rounded-lg border border-hairline bg-raised/40 p-4">
              <p className="text-[12.5px] font-semibold text-ink">{emailSubject}</p>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink/85">{emailBody}</p>
            </div>
            <button
              onClick={() => copy(`${emailSubject}\n\n${emailBody}`, setEmailCopied)}
              className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] text-muted hover:text-ink"
            >
              {emailCopied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              Copy
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        Copying a script is not outreach. The next stage requires you to explicitly confirm whether a voicemail was actually left or an email was actually sent — nothing here marks either as done.
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
        <button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3.5 py-2 text-[12.5px] font-medium text-muted">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
        </button>
        <button type="button" onClick={onContinue} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[12.5px] font-semibold text-white">
          Continue to Outcome <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function ScriptBlock({ text, className }: { text: string; className?: string }) {
  return <p className={cn("rounded-lg border border-hairline bg-raised/40 px-4 py-3 text-[14px] leading-relaxed text-ink", className)}>{text}</p>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-faint">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink" />
    </div>
  );
}
