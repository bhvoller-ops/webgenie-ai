"use client";

import { useEffect, useState } from "react";
import { Archive, Loader2, Plus, Repeat, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill } from "@/components/ui";
import { SEQUENCE_STEP_CHANNEL_LABELS, type SequenceStepChannel } from "@/lib/prospect/types";

const CHANNELS = Object.keys(SEQUENCE_STEP_CHANNEL_LABELS) as SequenceStepChannel[];

interface SequenceRow {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  stepCount: number;
}

interface DraftStep {
  channel: SequenceStepChannel;
  delayDays: number;
  instructions: string;
}

const STATUS_TONE = { draft: "neutral", active: "good", archived: "bad" } as const;

/**
 * P2 Assisted Outreach Sequences — the smallest possible sequence builder
 * (master prompt section F: "Avoid advanced campaign features. No bulk
 * blast UI."). One flat ordered list of steps, nothing more.
 */
export function SequencesClient() {
  const [sequences, setSequences] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<DraftStep[]>([{ channel: "CALL", delayDays: 0, instructions: "" }]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/sequences");
      const json = await res.json();
      setSequences(json.sequences ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function addStep() {
    setSteps((s) => [...s, { channel: "EMAIL", delayDays: 1, instructions: "" }]);
  }
  function removeStep(index: number) {
    setSteps((s) => s.filter((_, i) => i !== index));
  }
  function updateStep(index: number, patch: Partial<DraftStep>) {
    setSteps((s) => s.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  async function createSequence() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, steps })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't create that sequence.");
      setName("");
      setDescription("");
      setSteps([{ channel: "CALL", delayDays: 0, instructions: "" }]);
      setShowBuilder(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create that sequence.");
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: "draft" | "active" | "archived") {
    await fetch(`/api/sequences/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <PageShell role="admin">
      <div className="panel p-6 sm:p-10">
        <Pill tone="iris">
          <Repeat className="h-3 w-3" aria-hidden />
          Assisted Outreach Sequences
        </Pill>
        <h1 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
          You send it. <span className="gradient-text">WebGenie prepares it.</span>
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Build a repeatable outreach plan, enroll a prospect, and WebGenie will surface each step in your Daily Queue exactly when it&rsquo;s due — never before, never sent automatically.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-display-md font-semibold text-ink">Your Sequences</h2>
        <button
          onClick={() => setShowBuilder((v) => !v)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Sequence
        </button>
      </div>

      {showBuilder ? (
        <div className="mt-4 card p-6">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sequence name — e.g. New prospect, no reply"
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
            />
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-raised/60 p-2.5">
                  <span className="w-5 text-center text-[11px] font-mono text-faint">{i + 1}</span>
                  <select
                    value={step.channel}
                    onChange={(e) => updateStep(i, { channel: e.target.value as SequenceStepChannel })}
                    className="focus-ring rounded-md border border-hairline bg-canvas px-2 py-1 text-[12px] text-ink"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {SEQUENCE_STEP_CHANNEL_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-faint">wait</span>
                  <input
                    type="number"
                    min={0}
                    value={step.delayDays}
                    onChange={(e) => updateStep(i, { delayDays: Number(e.target.value) })}
                    className="focus-ring w-16 rounded-md border border-hairline bg-canvas px-2 py-1 text-[12px] text-ink"
                  />
                  <span className="text-[11px] text-faint">days</span>
                  <input
                    value={step.instructions}
                    onChange={(e) => updateStep(i, { instructions: e.target.value })}
                    placeholder="Instructions (optional)"
                    className="focus-ring min-w-[160px] flex-1 rounded-md border border-hairline bg-canvas px-2 py-1 text-[12px] text-ink"
                  />
                  <button onClick={() => removeStep(i)} disabled={steps.length <= 1} className="focus-ring rounded-md p-1 text-faint hover:text-signal-bad disabled:opacity-30">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addStep} className="focus-ring text-[12px] font-medium text-iris-soft hover:underline">
              + Add step
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={createSequence}
              disabled={creating || !name.trim()}
              className="focus-ring rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create sequence (draft)"}
            </button>
            {error ? <p className="text-[12px] text-signal-bad">{error}</p> : null}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 flex justify-center py-12 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : sequences.length === 0 ? (
        <p className="mt-8 text-[13px] text-faint">No sequences yet — create one above.</p>
      ) : (
        <div className="mt-5 space-y-2.5">
          {sequences.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-hairline bg-canvas/70 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{s.name}</span>
                  <Pill tone={STATUS_TONE[s.status]}>{s.status}</Pill>
                  <span className="text-[11px] text-faint">{s.stepCount} step{s.stepCount === 1 ? "" : "s"}</span>
                </div>
                {s.description ? <p className="mt-1 text-[12px] text-faint">{s.description}</p> : null}
              </div>
              <div className="flex items-center gap-1.5">
                {s.status === "draft" ? (
                  <button onClick={() => setStatus(s.id, "active")} className="focus-ring rounded-md border border-hairline bg-raised px-2.5 py-1 text-[11.5px] text-muted hover:text-ink">
                    Activate
                  </button>
                ) : s.status === "active" ? (
                  <button onClick={() => setStatus(s.id, "archived")} className="focus-ring rounded-md border border-hairline bg-raised px-2.5 py-1 text-[11.5px] text-muted hover:text-ink">
                    <Archive className="mr-1 inline h-3 w-3" aria-hidden />
                    Archive
                  </button>
                ) : null}
                {s.status === "draft" ? (
                  <button onClick={() => remove(s.id)} className="focus-ring rounded-md p-1.5 text-faint hover:text-signal-bad">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
