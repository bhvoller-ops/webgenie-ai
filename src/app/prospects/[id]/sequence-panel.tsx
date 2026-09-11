"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Pause, Play, Repeat, Square, Sparkles } from "lucide-react";
import { SEQUENCE_STEP_CHANNEL_LABELS, type SequenceStepChannel } from "@/lib/prospect/types";

const OUTCOMES: { key: string; label: string }[] = [
  { key: "no_answer", label: "No Answer" },
  { key: "left_voicemail", label: "Left Voicemail" },
  { key: "sent", label: "Sent" },
  { key: "replied", label: "Replied" },
  { key: "interested", label: "Interested" },
  { key: "not_interested", label: "Not Interested" },
  { key: "meeting_booked", label: "Meeting Booked" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
];

interface SequenceOption {
  id: string;
  name: string;
  status: string;
  stepCount: number;
}

interface EnrollmentInfo {
  id: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "STOPPED";
  sequenceId: string;
  sequenceName: string;
  currentStepOrder: number;
  nextStepDueAt: string | null;
}

interface StepInfo {
  id: string;
  stepOrder: number;
  channel: SequenceStepChannel;
  instructions: string | null;
}

/**
 * P2 Assisted Outreach Sequences — human-executed (master prompt
 * Architecture Decisions 1/3). WebGenie never sends anything from here:
 * every button either prepares/orchestrates (generate copy, show what's
 * due) or records what the user says they already did externally.
 */
export function SequencePanel({ prospectId }: { prospectId: string }) {
  const [sequences, setSequences] = useState<SequenceOption[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentInfo | null>(null);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ subject: string | null; body: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [seqRes, enrollRes] = await Promise.all([fetch("/api/sequences"), fetch(`/api/prospects/${prospectId}/sequence-enrollments`)]);
      const seqJson = await seqRes.json();
      const enrollJson = await enrollRes.json();
      setSequences((seqJson.sequences ?? []).filter((s: SequenceOption) => s.status === "active"));

      const current = (enrollJson.enrollments ?? []).find((e: EnrollmentInfo) => e.status === "ACTIVE" || e.status === "PAUSED") ?? null;
      setEnrollment(current);
      setMessage(null);

      if (current) {
        const seqDetailRes = await fetch(`/api/sequences/${current.sequenceId}`);
        const seqDetail = await seqDetailRes.json();
        setSteps(seqDetail.steps ?? []);
      } else {
        setSteps([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId]);

  async function enroll(sequenceId: string) {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/sequence-enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequenceId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't enroll this prospect.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't enroll this prospect.");
    } finally {
      setPending(false);
    }
  }

  async function control(op: "pause" | "resume" | "stop") {
    if (!enrollment) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/sequence-enrollments/${enrollment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "That didn't work.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setPending(false);
    }
  }

  const currentStep = enrollment ? steps.find((s) => s.stepOrder === enrollment.currentStepOrder) ?? null : null;
  const isDue = Boolean(enrollment?.nextStepDueAt && new Date(enrollment.nextStepDueAt).getTime() <= Date.now());

  async function generate() {
    if (!currentStep) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/sequence-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: currentStep.channel })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't generate that message.");
      setMessage(json.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't generate that message.");
    } finally {
      setGenerating(false);
    }
  }

  function copy() {
    if (!message) return;
    const text = message.subject ? `${message.subject}\n\n${message.body}` : message.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  async function logOutcome(outcome: string) {
    if (!enrollment || !currentStep) return;
    setPending(true);
    setError("");
    setShowOutcome(false);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/sequence-enrollments/${enrollment.id}/perform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, currentStepOrder: enrollment.currentStepOrder, sequenceStepId: currentStep.id, channel: currentStep.channel })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't log that outcome.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't log that outcome.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="card p-5">
        <Loader2 className="h-4 w-4 animate-spin text-faint" aria-hidden />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="eyebrow mb-3 flex items-center justify-between">
        Outreach Sequence
        <Repeat className="h-4 w-4 text-iris-soft" aria-hidden />
      </div>

      {!enrollment ? (
        sequences.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-faint">
            No active sequences yet. <a href="/sequences" className="text-iris-soft underline">Build one</a> to enroll this prospect.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-[12.5px] leading-relaxed text-muted">Not currently in a sequence.</p>
            <div className="flex flex-wrap gap-2">
              {sequences.map((s) => (
                <button
                  key={s.id}
                  onClick={() => enroll(s.id)}
                  disabled={pending}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:opacity-60"
                >
                  Start &ldquo;{s.name}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-ink">{enrollment.sequenceName}</div>
              <p className="text-[11.5px] text-faint">
                Step {enrollment.currentStepOrder} of {steps.length}
                {enrollment.status === "PAUSED" ? " · Paused" : null}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {enrollment.status === "ACTIVE" ? (
                <button onClick={() => control("pause")} disabled={pending} title="Pause" className="focus-ring rounded-md border border-hairline bg-raised p-1.5 text-faint hover:text-ink disabled:opacity-40">
                  <Pause className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : (
                <button onClick={() => control("resume")} disabled={pending} title="Resume" className="focus-ring rounded-md border border-hairline bg-raised p-1.5 text-faint hover:text-ink disabled:opacity-40">
                  <Play className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
              <button onClick={() => control("stop")} disabled={pending} title="Stop sequence" className="focus-ring rounded-md border border-hairline bg-raised p-1.5 text-faint hover:text-signal-bad disabled:opacity-40">
                <Square className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>

          {currentStep ? (
            <div className="rounded-xl border border-hairline bg-raised/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-ink">{SEQUENCE_STEP_CHANNEL_LABELS[currentStep.channel]}</span>
                {!isDue ? (
                  <span className="text-[11px] text-faint">Due {enrollment.nextStepDueAt ? new Date(enrollment.nextStepDueAt).toLocaleDateString() : "—"}</span>
                ) : (
                  <span className="text-[11px] font-medium text-signal-warn">Due now</span>
                )}
              </div>
              {currentStep.channel === "CUSTOM_TASK" ? (
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink/85">{currentStep.instructions || "No instructions written for this task."}</p>
              ) : (
                <>
                  {currentStep.instructions ? <p className="mt-2 text-[11.5px] italic text-faint">{currentStep.instructions}</p> : null}
                  {message ? (
                    <div className="mt-2.5 space-y-1.5">
                      {message.subject ? <p className="text-[12px] font-semibold text-ink">{message.subject}</p> : null}
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink/85">{message.body}</p>
                      <button onClick={copy} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1 text-[11px] text-muted hover:text-ink">
                        {copied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                        Copy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={generate}
                      disabled={generating}
                      className="focus-ring mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-iris/35 bg-iris/10 px-2.5 py-1.5 text-[11.5px] font-medium text-iris-soft disabled:opacity-60"
                    >
                      {generating ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Sparkles className="h-3 w-3" aria-hidden />}
                      Prepare message
                    </button>
                  )}
                </>
              )}

              <div className="relative mt-3">
                <button
                  onClick={() => setShowOutcome((v) => !v)}
                  disabled={pending || enrollment.status !== "ACTIVE"}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-neon/35 bg-neon/10 px-2.5 py-1.5 text-[11.5px] font-medium text-neon-soft disabled:opacity-40"
                >
                  Mark Performed
                </button>
                {showOutcome ? (
                  <div className="absolute left-0 top-full z-10 mt-1.5 w-40 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-xl">
                    {OUTCOMES.map((o) => (
                      <button key={o.key} onClick={() => logOutcome(o.key)} className="block w-full px-3 py-1.5 text-left text-[12px] text-muted hover:bg-raised hover:text-ink">
                        {o.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {error ? <p className="mt-2 text-[12px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
