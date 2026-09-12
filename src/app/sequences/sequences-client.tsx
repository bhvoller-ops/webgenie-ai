"use client";

import { useEffect, useState } from "react";
import { Archive, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shell";
import { PageHeader, EmptyState, LoadingSkeleton, DisclosurePanel } from "@/components/workspace";
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
      <PageHeader
        title="Sequences"
        description="Build a repeatable outreach plan and enroll a prospect — WebGenie surfaces each step in your Daily Queue exactly when it's due, never before, never sent automatically."
        primaryAction={
          <button
            onClick={() => setShowBuilder((v) => !v)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Sequence
          </button>
        }
      />

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
        <div className="mt-6">
          <LoadingSkeleton rows={3} />
        </div>
      ) : sequences.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No sequences yet"
            description="Create a sequence above — a flat, ordered list of steps you enroll a prospect into. WebGenie surfaces each step when it's due; nothing sends itself."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <SequenceGroup label="Active & draft" sequences={sequences.filter((s) => s.status !== "archived")} onSetStatus={setStatus} onRemove={remove} />
          <SequenceGroup label="Archived" sequences={sequences.filter((s) => s.status === "archived")} onSetStatus={setStatus} onRemove={remove} />
        </div>
      )}
    </PageShell>
  );
}

function SequenceGroup({
  label,
  sequences,
  onSetStatus,
  onRemove
}: {
  label: string;
  sequences: SequenceRow[];
  onSetStatus: (id: string, status: "draft" | "active" | "archived") => void;
  onRemove: (id: string) => void;
}) {
  if (sequences.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2.5 text-[12.5px] font-semibold uppercase tracking-wide text-muted">{label}</h3>
      <div className="space-y-2.5">
        {sequences.map((s) => (
          <div key={s.id} className="rounded-panel border border-hairline bg-canvas/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-ink">{s.name}</span>
                  <Pill tone={STATUS_TONE[s.status]}>{s.status}</Pill>
                  <span className="text-[12.5px] text-faint">{s.stepCount} step{s.stepCount === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {s.status === "draft" ? (
                  <button onClick={() => onSetStatus(s.id, "active")} className="focus-ring rounded-md border border-hairline bg-raised px-2.5 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink">
                    Activate
                  </button>
                ) : s.status === "active" ? (
                  <button onClick={() => onSetStatus(s.id, "archived")} className="focus-ring rounded-md border border-hairline bg-raised px-2.5 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink">
                    <Archive className="mr-1 inline h-3 w-3" aria-hidden />
                    Archive
                  </button>
                ) : null}
                {/* Destructive action, separated and secondary -- only reachable for a draft that was never activated. */}
                {s.status === "draft" ? (
                  <button onClick={() => onRemove(s.id)} aria-label={`Delete ${s.name}`} className="focus-ring rounded-md p-1.5 text-faint hover:text-signal-bad">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
            {s.description ? (
              <DisclosurePanel summary="Description" className="mt-2">
                <p>{s.description}</p>
              </DisclosurePanel>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
