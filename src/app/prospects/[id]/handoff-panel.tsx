"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, FolderPlus, Loader2 } from "lucide-react";

interface HandoffData {
  agreedScope: string | null;
  agreedPrice: number | null;
  approvedDemoReference: string | null;
  implementationNotes: string | null;
  status: "not_started" | "in_progress" | "ready";
  confirmedAt: string | null;
}

/**
 * P2 Won Client Handoff (master prompt Architecture Decision 12). Only
 * ever shown for a WON prospect. `agreedScope`/`agreedPrice` are plain
 * text/number fields the human types here — nothing pre-fills them from
 * opportunity_briefs.recommendedOffer; that stays a visibly separate,
 * clearly-labeled AI suggestion the user may look at but must retype or
 * explicitly confirm, never something that silently becomes scope.
 */
export function HandoffPanel({ prospectId, hasProject, recommendedOffer, recommendedOfferReason }: { prospectId: string; hasProject: boolean; recommendedOffer: string | null; recommendedOfferReason: string | null }) {
  const router = useRouter();
  const [handoff, setHandoff] = useState<HandoffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [confirmingProject, setConfirmingProject] = useState(false);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("");
  const [price, setPrice] = useState("");
  const [demoRef, setDemoRef] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prospects/${prospectId}/handoff`);
        const json = await res.json();
        if (json.handoff) {
          setHandoff(json.handoff);
          setScope(json.handoff.agreedScope ?? "");
          setPrice(json.handoff.agreedPrice != null ? String(json.handoff.agreedPrice) : "");
          setDemoRef(json.handoff.approvedDemoReference ?? "");
          setNotes(json.handoff.implementationNotes ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [prospectId]);

  async function save(confirm: boolean) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/handoff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreedScope: scope || null,
          agreedPrice: price ? Number(price) : null,
          approvedDemoReference: demoRef || null,
          implementationNotes: notes || null,
          confirm
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't save the handoff.");
      setHandoff(json.handoff);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the handoff.");
    } finally {
      setSaving(false);
    }
  }

  async function createFulfillmentProject() {
    setCreatingProject(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_fulfillment_project" })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn't create the project.");
      setConfirmingProject(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create the project.");
    } finally {
      setCreatingProject(false);
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <Loader2 className="h-4 w-4 animate-spin text-faint" aria-hidden />
      </div>
    );
  }

  const ready = handoff?.status === "ready";

  return (
    <div className="card border-signal-good/30 p-6">
      <div className="eyebrow mb-3 flex items-center justify-between text-signal-good">
        Start Client Handoff
        {ready ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <ClipboardCheck className="h-4 w-4" aria-hidden />}
      </div>

      {recommendedOffer ? (
        <div className="mb-4 rounded-lg border border-hairline bg-raised/60 p-3 text-[12px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">AI-recommended offer (not scope):</span> {recommendedOffer}
          {recommendedOfferReason ? <span> — {recommendedOfferReason}</span> : null}
        </div>
      ) : null}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-faint">Agreed scope (what was actually sold — confirmed by you, not AI)</label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={3}
            className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
            placeholder="e.g. $2,500 rebuild + $497/mo retainer, 5 pages, review automation"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Agreed price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
              placeholder="2500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Approved demo/reference</label>
            <input
              value={demoRef}
              onChange={(e) => setDemoRef(e.target.value)}
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
              placeholder="Demo Room link they approved"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-faint">Implementation notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => save(false)} disabled={saving} className="focus-ring rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-muted hover:text-ink disabled:opacity-60">
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || !scope.trim()}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-signal-good to-signal-good px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <CheckCircle2 className="h-3 w-3" aria-hidden />}
          Confirm agreed scope
        </button>
        {ready ? <span className="text-[11px] text-signal-good">Confirmed {handoff?.confirmedAt ? new Date(handoff.confirmedAt).toLocaleDateString() : ""}</span> : null}
      </div>

      {!hasProject ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-[11.5px] text-faint">No project exists yet for this prospect — nothing is created automatically.</p>
          {!confirmingProject ? (
            <button
              onClick={() => setConfirmingProject(true)}
              disabled={creatingProject}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-iris/35 bg-iris/10 px-2.5 py-1.5 text-[11.5px] font-medium text-iris-soft disabled:opacity-60"
            >
              <FolderPlus className="h-3 w-3" aria-hidden />
              Create Fulfillment Project
            </button>
          ) : (
            // Owner-review correction: this creates real, billable project
            // data -- an explicit second step, not a single click.
            <div className="flex items-center gap-2 rounded-lg border border-iris/30 bg-iris/10 px-2.5 py-1.5">
              <span className="text-[11.5px] text-iris-soft">Create a real fulfillment project now?</span>
              <button
                onClick={createFulfillmentProject}
                disabled={creatingProject}
                className="focus-ring inline-flex items-center gap-1 rounded-md bg-iris px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
              >
                {creatingProject ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
                Yes, create it
              </button>
              <button onClick={() => setConfirmingProject(false)} disabled={creatingProject} className="focus-ring text-[11px] text-faint hover:text-muted">
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[12px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
