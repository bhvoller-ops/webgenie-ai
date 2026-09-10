"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Phone,
  Star,
  X,
  Building2,
  Globe,
  Maximize2,
} from "lucide-react";
import { Pill, type PillTone } from "@/components/ui";
import { industryLabel } from "@/lib/sitegen/industry-lookup";
import { NEXT_STEP_LABELS, PRELIMINARY_LEVEL_LABELS, type PreliminaryNextStep } from "@/lib/prospect/preliminary-opportunity";
import type { FinderResultRow } from "@/app/api/prospects/route";
import { cn } from "@/lib/format";

const LEVEL_TONE: Record<string, PillTone> = {
  high: "good",
  medium: "warn",
  low: "neutral",
  insufficient_data: "info",
};

const CONFIDENCE_LABEL: Record<string, string> = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" };

/**
 * Finder's "View Opportunity" — a fast preview without leaving Finder
 * (P0.5 section 15). The primary action always opens/creates the real
 * Prospect (idempotent, the same /api/prospects/open PR #24/#25 already
 * hardened) and navigates to /prospects/[id] — the existing P0 workspace —
 * rather than duplicating any action-triggering logic here. Section 16:
 * "Do NOT build a duplicate prospect workspace."
 */
export function OpportunityPreviewDrawer({ row, onClose }: { row: FinderResultRow | null; onClose: () => void }) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  if (!row) return null;
  const opp = row.preliminaryOpportunity;

  async function openFullScreen() {
    if (!row) return;
    setOpening(true);
    setError("");
    try {
      const response = await fetch("/api/prospects/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to open this prospect.");
      router.push(`/prospects/${json.prospectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open this prospect.");
      setOpening(false);
    }
  }

  const unknowns = buildUnknowns(row);
  const nextStepLabel = NEXT_STEP_LABELS[opp.recommendedNextStep as PreliminaryNextStep];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-void/70 backdrop-blur-sm"
      />
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-hairline bg-canvas shadow-2xl animate-fade-up">
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
          <div className="min-w-0">
            <div className="eyebrow">Preliminary Opportunity</div>
            <h2 className="mt-1 truncate text-lg font-semibold text-ink">{row.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
              <Building2 className="h-3 w-3" aria-hidden />
              {industryLabel(row.industry)}
              <span className="text-faint">·</span>
              <MapPin className="h-3 w-3" aria-hidden />
              {row.city}, {row.state}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring shrink-0 rounded-lg border border-hairline bg-raised p-2 text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={LEVEL_TONE[opp.level]} className="text-[12px]">
              {PRELIMINARY_LEVEL_LABELS[opp.level]} Opportunity
            </Pill>
            <Pill tone="neutral" className="text-[12px]">{CONFIDENCE_LABEL[opp.confidence]}</Pill>
          </div>

          <section>
            <Eyebrow>Why this prospect stands out</Eyebrow>
            <ul className="mt-2.5 space-y-1.5">
              {opp.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-iris" />
                  {r.text}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <Eyebrow>Public business signals</Eyebrow>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <SignalTile icon={<Globe className="h-3.5 w-3.5" aria-hidden />} label="Website" value={row.website ? "Present" : "None listed"} />
              <SignalTile
                icon={<Star className="h-3.5 w-3.5" aria-hidden />}
                label="Reputation"
                value={typeof row.rating === "number" ? `${row.rating} (${row.reviewCount ?? 0})` : "—"}
              />
              <SignalTile icon={<Phone className="h-3.5 w-3.5" aria-hidden />} label="Phone" value={row.phone || "Not on file"} />
              <SignalTile icon={<MapPin className="h-3.5 w-3.5" aria-hidden />} label="Address" value={row.address || "—"} />
            </div>
          </section>

          <section>
            <Eyebrow>What we know</Eyebrow>
            <ul className="mt-2.5 space-y-1.5">
              {opp.evidence.map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-raised/50 px-3 py-2 text-[12.5px]">
                  <span className="text-ink">{e.label}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{e.source}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <Eyebrow>What we don&rsquo;t know yet</Eyebrow>
            <ul className="mt-2.5 space-y-1.5">
              {unknowns.map((u, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-faint">{u}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="sticky bottom-0 border-t border-hairline bg-canvas px-6 py-5">
          {error ? <p className="mb-3 text-[12px] text-signal-bad">{error}</p> : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openFullScreen}
              disabled={opening}
              className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {opening ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
              Full Screen
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-faint">
            Recommended next step: <span className="text-muted">{nextStepLabel}</span> — available inside Full Screen.
          </p>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-widest text-faint">{children}</div>;
}

function SignalTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-raised/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-faint">
        {icon}
        {label}
      </div>
      <div className={cn("mt-1 truncate text-[12.5px] text-ink")}>{value}</div>
    </div>
  );
}

/** Strict, honest unknowns only — never a claim implying we've assessed something we haven't. Section 15/26/33. */
function buildUnknowns(row: FinderResultRow): string[] {
  const list: string[] = [];
  if (!row.website) {
    list.push("Whether a new site would convert this business into a paying client is not yet known.");
  } else if (!row.hasCompletedAudit) {
    list.push("Website quality has not yet been audited.");
    list.push("Lead conversion capability has not yet been assessed.");
  }
  list.push("Owner intent to switch providers has not been assessed.");
  return list;
}
