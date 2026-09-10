"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, MessageSquare, PenLine, RefreshCw, Save, Sparkles } from "lucide-react";
import { PITCH_CHANNEL_LABELS, type PitchChannel } from "@/lib/prospect/types";
import { cn } from "@/lib/format";

const CHANNELS: PitchChannel[] = ["call_opener", "cold_email", "sms", "linkedin", "voicemail", "loom_intro"];

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

interface PitchRow {
  id: string;
  channel: PitchChannel;
  subject: string | null;
  body: string;
  status: "draft" | "used";
  version: number;
}

export function PitchGenerator({ prospectId }: { prospectId: string }) {
  const [pitches, setPitches] = useState<Record<string, PitchRow>>({});
  const [activeChannel, setActiveChannel] = useState<PitchChannel>("call_opener");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [followUpOption, setFollowUpOption] = useState<string>("");

  async function loadPitches() {
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/pitch`);
      const json = await res.json();
      const map: Record<string, PitchRow> = {};
      for (const p of json.pitches ?? []) {
        map[p.channel] = { id: p.id, channel: p.channel, subject: p.subject, body: p.body, status: p.status, version: p.version };
      }
      setPitches(map);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPitches();
  }, [prospectId]);

  const current = pitches[activeChannel];

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: activeChannel })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed.");
      setPitches((prev) => ({ ...prev, [activeChannel]: json.pitch }));
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  function startEdit() {
    if (!current) return;
    setDraftSubject(current.subject ?? "");
    setDraftBody(current.body);
    setEditing(true);
  }

  async function saveEdit() {
    if (!current) return;
    try {
      const res = await fetch(`/api/prospects/${prospectId}/pitch/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: draftSubject || null, body: draftBody })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setPitches((prev) => ({ ...prev, [activeChannel]: json.pitch }));
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
  }

  function copyPitch() {
    if (!current) return;
    const text = current.subject ? `${current.subject}\n\n${current.body}` : current.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  async function markUsed(outcome: string) {
    if (!current) return;
    try {
      const res = await fetch(`/api/prospects/${prospectId}/pitch/${current.id}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, followUp: followUpOption ? { option: followUpOption } : undefined })
      });
      if (!res.ok) throw new Error("Couldn't log that outcome.");
      setShowOutcome(false);
      setFollowUpOption("");
      await loadPitches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't log that outcome.");
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Pitch Generator</div>
        <Sparkles className="h-4 w-4 text-iris-soft" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CHANNELS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setActiveChannel(c);
              setEditing(false);
            }}
            className={cn(
              "focus-ring rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              activeChannel === c ? "border-iris/40 bg-iris/15 text-iris-soft" : "border-hairline bg-raised text-muted hover:text-ink",
              pitches[c] ? "" : "opacity-70"
            )}
          >
            {PITCH_CHANNEL_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 flex justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-faint" aria-hidden />
        </div>
      ) : (
        <div className="mt-5">
          {!current ? (
            <button
              onClick={generate}
              disabled={generating}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              Create {PITCH_CHANNEL_LABELS[activeChannel]}
            </button>
          ) : editing ? (
            <div className="space-y-3">
              {current.channel === "cold_email" ? (
                <input
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="Subject"
                  className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
                />
              ) : null}
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={6}
                className="focus-ring w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-signal-good/35 bg-signal-good/10 px-3 py-1.5 text-[12px] font-medium text-signal-good">
                  <Save className="h-3 w-3" aria-hidden /> Save
                </button>
                <button onClick={() => setEditing(false)} className="focus-ring text-[12px] text-faint hover:text-muted">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="rounded-lg border border-hairline bg-raised/40 p-4">
                {current.subject ? <p className="mb-2 text-[12.5px] font-semibold text-ink">{current.subject}</p> : null}
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink/85">{current.body}</p>
              </div>
              {current.status === "used" ? <p className="mt-2 text-[11px] text-signal-good">Marked as used.</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={copyPitch} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] text-muted hover:text-ink">
                  {copied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                  Copy
                </button>
                <button onClick={startEdit} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] text-muted hover:text-ink">
                  <PenLine className="h-3 w-3" aria-hidden /> Edit
                </button>
                <button onClick={generate} disabled={generating} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] text-muted hover:text-ink disabled:opacity-50">
                  {generating ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <RefreshCw className="h-3 w-3" aria-hidden />} Regenerate
                </button>
                <button onClick={() => setShowOutcome((v) => !v)} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-neon/35 bg-neon/10 px-2.5 py-1.5 text-[11.5px] font-medium text-neon-soft">
                  <MessageSquare className="h-3 w-3" aria-hidden /> Mark as Used
                </button>
              </div>
              {showOutcome ? (
                <div className="mt-3 rounded-lg border border-hairline bg-canvas/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-faint">What happened?</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {OUTCOMES.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => markUsed(o.key)}
                        className="focus-ring rounded-full border border-hairline bg-raised px-2.5 py-1 text-[11px] text-muted hover:border-iris/40 hover:text-ink"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 block text-[11px] text-faint">
                    Optional follow-up
                    <select
                      value={followUpOption}
                      onChange={(e) => setFollowUpOption(e.target.value)}
                      className="focus-ring mt-1 w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink"
                    >
                      <option value="">No follow-up</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="three_days">3 days</option>
                      <option value="one_week">1 week</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
      {error ? <p className="mt-3 text-[12px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
