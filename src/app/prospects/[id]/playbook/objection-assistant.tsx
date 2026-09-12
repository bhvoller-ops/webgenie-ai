"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleWarning, X } from "lucide-react";
import type { ObjectionResponse } from "@/lib/playbook/types";
import { renderTemplate, type PlaybookRenderVars } from "@/lib/playbook/render";

/**
 * Quick-access objection handling (Stage 6). Selecting an objection only
 * displays its response text — see EVENT SEMANTICS: this creates no
 * prospect activity of any kind, it's pure UI state.
 *
 * Owner-review accessibility fix: this is a dismissible overlay, so
 * Escape must close it (it didn't before) and focus must return to the
 * trigger button that opened it, not get lost on the now-removed panel.
 */
export function ObjectionAssistant({ objections, vars }: { objections: ObjectionResponse[]; vars: PlaybookRenderVars }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ObjectionResponse | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    setActive(null);
    // Return focus to the control that opened this overlay -- never leave
    // focus on a now-unmounted element after a keyboard-driven close.
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) {
    return (
      <button
        ref={triggerRef}
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
    <div
      role="dialog"
      aria-label="Objection Assistant"
      className="fixed inset-x-3 bottom-20 z-20 max-h-[60vh] overflow-y-auto rounded-panel border border-hairline bg-canvas p-4 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink">Objection Assistant</span>
        <button type="button" onClick={close} className="focus-ring rounded-md p-1 text-faint hover:text-ink" aria-label="Close objection assistant">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {active ? (
        <div className="mt-3">
          <button type="button" onClick={() => setActive(null)} className="focus-ring text-[13px] text-iris-soft hover:underline">
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
              className="focus-ring rounded-full border border-hairline bg-raised px-3 py-1.5 text-[13px] text-muted hover:border-signal-warn/40 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
