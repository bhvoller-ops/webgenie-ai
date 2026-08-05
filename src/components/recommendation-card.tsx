"use client";

import { useState } from "react";
import { ChevronDown, Target } from "lucide-react";
import type { Recommendation } from "@/lib/intelligence/types";
import { MODULE_LABELS } from "@/lib/intelligence/types";
import { cn, pct } from "@/lib/format";
import { EvidenceList } from "@/components/evidence";
import { Pill, type PillTone } from "@/components/ui";

const priorityTone: Record<Recommendation["priority"], PillTone> = {
  critical: "bad",
  high: "warn",
  medium: "info",
  low: "neutral",
};

const priorityRail: Record<Recommendation["priority"], string> = {
  critical: "bg-signal-bad",
  high: "bg-signal-warn",
  medium: "bg-signal-info",
  low: "bg-hairline",
};

export function RecommendationCard({
  recommendation,
  index,
  defaultOpen = false,
}: {
  recommendation: Recommendation;
  index?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const r = recommendation;

  return (
    <article className="card relative overflow-hidden p-0">
      <div className={cn("absolute inset-y-0 left-0 w-[3px]", priorityRail[r.priority])} aria-hidden />

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-start gap-4 p-5 pl-6 text-left"
      >
        {typeof index === "number" ? (
          <span className="mt-0.5 font-mono text-xs tabular-nums text-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={priorityTone[r.priority]}>{r.priority}</Pill>
            <Pill>{MODULE_LABELS[r.module]}</Pill>
            <span className="font-mono text-[11px] text-faint">confidence {pct(r.confidence)}</span>
          </div>
          <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-ink">{r.title}</h3>
          {!open ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{r.rationale}</p>
          ) : null}
        </div>

        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-faint transition-transform duration-300",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="animate-fade-up space-y-5 px-6 pb-6 pl-6">
          <div>
            <div className="eyebrow mb-2">Why it matters</div>
            <p className="text-[13px] leading-relaxed text-muted">{r.rationale}</p>
          </div>

          <div className="rounded-xl border border-iris/25 bg-iris/[0.07] p-4">
            <div className="eyebrow mb-2 flex items-center gap-1.5 text-iris-soft">
              <Target className="h-3 w-3" aria-hidden />
              Recommended action
            </div>
            <p className="text-[13px] leading-relaxed text-ink/90">{r.action}</p>
          </div>

          <div>
            <div className="eyebrow mb-2">Evidence · {r.evidence.length} captures</div>
            <EvidenceList items={r.evidence} />
          </div>
        </div>
      ) : null}
    </article>
  );
}
