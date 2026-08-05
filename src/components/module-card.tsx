"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { ModuleScore } from "@/lib/intelligence/types";
import { MODULE_DESCRIPTIONS, MODULE_LABELS } from "@/lib/intelligence/types";
import { BAND_LABEL, BAND_TEXT_CLASS, cn, pct, scoreBand } from "@/lib/format";
import { ScoreBar } from "@/components/score-ring";
import { RecommendationCard } from "@/components/recommendation-card";

export function ModuleCard({ moduleScore }: { moduleScore: ModuleScore }) {
  const [open, setOpen] = useState(false);
  const m = moduleScore;
  const band = scoreBand(m.score);

  return (
    <div className="card overflow-hidden p-0 transition-colors duration-200 hover:border-iris/30">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">{MODULE_LABELS[m.module]}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">
              {BAND_LABEL[band]} · confidence {pct(m.confidence)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("font-mono text-2xl font-semibold tabular-nums", BAND_TEXT_CLASS[band])}>
              {m.score}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-faint transition-transform duration-300", open && "rotate-180")}
              aria-hidden
            />
          </div>
        </div>

        <ScoreBar score={m.score} className="mt-4" />

        <p className="mt-3 text-[12px] leading-relaxed text-faint">
          {MODULE_DESCRIPTIONS[m.module]}
        </p>
      </button>

      {open ? (
        <div className="animate-fade-up space-y-5 border-t border-hairline p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="eyebrow mb-2.5 text-signal-good">Strengths</div>
              <ul className="space-y-2">
                {m.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-[13px] leading-relaxed text-muted">
                    <Plus className="mt-1 h-3 w-3 shrink-0 text-signal-good" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-2.5 text-signal-bad">Weaknesses</div>
              <ul className="space-y-2">
                {m.weaknesses.map((w) => (
                  <li key={w} className="flex gap-2 text-[13px] leading-relaxed text-muted">
                    <Minus className="mt-1 h-3 w-3 shrink-0 text-signal-bad" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {m.recommendations.length ? (
            <div>
              <div className="eyebrow mb-2.5">
                Recommendations · {m.recommendations.length}
              </div>
              <div className="space-y-3">
                {m.recommendations.map((r) => (
                  <RecommendationCard key={r.id} recommendation={r} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
