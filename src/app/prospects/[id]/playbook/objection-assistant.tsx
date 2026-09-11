"use client";

import { useState } from "react";
import { MessageCircleWarning, X } from "lucide-react";
import type { ObjectionResponse } from "@/lib/playbook/types";
import { renderTemplate, type PlaybookRenderVars } from "@/lib/playbook/render";

/**
 * Quick-access objection handling (Stage 6). Selecting an objection only
 * displays its response text — see EVENT SEMANTICS: this creates no
 * prospect activity of any kind, it's pure UI state.
 */
export function ObjectionAssistant({ objections, vars }: { objections: ObjectionResponse[]; vars: PlaybookRenderVars }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ObjectionResponse | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-signal-warn/40 bg-canvas px-4 py-2.5 text-[12.5px] font-semibold text-signal-warn shadow-lg sm:bottom-6 sm:right-6"
      >
        <MessageCircleWarning className="h-4 w-4" aria-hidden />
        Objections
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-20 max-h-[60vh] overflow-y-auto rounded-panel border border-hairline bg-canvas p-4 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink">Objection Assistant</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setActive(null);
          }}
          className="focus-ring rounded-md p-1 text-faint hover:text-ink"
          aria-label="Close objection assistant"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {active ? (
        <div className="mt-3">
          <button type="button" onClick={() => setActive(null)} className="focus-ring text-[11.5px] text-iris-soft hover:underline">
            ← Back to list
          </button>
          <p className="mt-2 text-[12px] font-semibold text-ink">{active.label}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/85">{renderTemplate(active.response, vars)}</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {objections.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setActive(o)}
              className="focus-ring rounded-full border border-hairline bg-raised px-3 py-1.5 text-[11.5px] text-muted hover:border-signal-warn/40 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
