"use client";

import { useState } from "react";
import { Ban, Loader2, ShieldOff } from "lucide-react";
import type { SuppressionReason } from "@/lib/prospect/types";

const REASON_LABELS: Record<SuppressionReason, string> = {
  OPTED_OUT: "Opted out",
  DO_NOT_CONTACT: "Do not contact",
  INVALID_CONTACT: "Invalid contact info",
  MANUAL: "Manually suppressed"
};

/**
 * Hard, sticky suppression control (master prompt Architecture Decision
 * 4). Both directions are explicit user actions — nothing else in the app
 * calls this route. Once suppressed, this prospect is never recommended,
 * never enrollable, and any active sequence stops automatically.
 */
export function SuppressControl({ prospectId, suppressedAt, suppressionReason }: { prospectId: string; suppressedAt: string | null; suppressionReason: SuppressionReason | null }) {
  const [suppressed, setSuppressed] = useState(Boolean(suppressedAt));
  const [reason, setReason] = useState<SuppressionReason | null>(suppressionReason);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function suppress(r: SuppressionReason) {
    setPending(true);
    setError("");
    setPickerOpen(false);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/suppress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suppress", reason: r })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't suppress this prospect.");
      setSuppressed(true);
      setReason(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't suppress this prospect.");
    } finally {
      setPending(false);
    }
  }

  async function unsuppress() {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/suppress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsuppress" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't unsuppress this prospect.");
      setSuppressed(false);
      setReason(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't unsuppress this prospect.");
    } finally {
      setPending(false);
    }
  }

  if (suppressed) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-signal-bad/30 bg-signal-bad/10 px-4 py-3 text-[12.5px]">
        <span className="inline-flex items-center gap-2 text-signal-bad">
          <ShieldOff className="h-3.5 w-3.5" aria-hidden />
          Suppressed ({reason ? REASON_LABELS[reason] : "unknown reason"}) — never recommended or enrolled in outreach.
        </span>
        <button onClick={unsuppress} disabled={pending} className="focus-ring text-[12px] font-medium text-muted underline hover:text-ink disabled:opacity-50">
          {pending ? "Working…" : "Unsuppress"}
        </button>
        {error ? <p className="w-full text-[11px] text-signal-bad">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      <button
        onClick={() => setPickerOpen((v) => !v)}
        disabled={pending}
        className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-faint transition-colors hover:text-signal-bad disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Ban className="h-3 w-3" aria-hidden />}
        Suppress / Do Not Contact
      </button>
      {pickerOpen ? (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-48 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-xl">
          {(Object.keys(REASON_LABELS) as SuppressionReason[]).map((r) => (
            <button key={r} onClick={() => suppress(r)} className="block w-full px-3 py-2 text-left text-[12px] text-muted hover:bg-raised hover:text-ink">
              {REASON_LABELS[r]}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-[11px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
