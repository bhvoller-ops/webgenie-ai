"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Phone, RefreshCw, Sparkles, TestTube } from "lucide-react";
import type { Prospect } from "@/lib/prospect/types";
import { cn } from "@/lib/format";

type ActionKey = "run_audit" | "generate_demo" | "contact" | "refresh";

export function ProspectActions({
  prospect,
  hasBlueprint,
  hasIntelligence
}: {
  prospect: Prospect;
  hasBlueprint: boolean;
  hasIntelligence: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ActionKey | null>(null);
  const [error, setError] = useState("");

  async function run(action: ActionKey) {
    if (pending) return;
    setPending(action);
    setError("");
    try {
      const response = await fetch(`/api/prospects/${prospect.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "That didn't work.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setPending(null);
    }
  }

  const buttonClass =
    "focus-ring inline-flex items-center gap-2 rounded-xl border border-hairline bg-raised px-4 py-2.5 text-sm font-medium text-ink transition-all duration-200 hover:border-iris/50 hover:bg-raised/70 disabled:opacity-60";

  return (
    <div className="mt-6 border-t border-hairline pt-6">
      <div className="flex flex-wrap gap-3">
        {!prospect.hasWebsite ? (
          <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => run("generate_demo")}>
            {pending === "generate_demo" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {prospect.demoUrl ? "Regenerate demo" : "Generate demo"}
          </button>
        ) : null}
        {prospect.demoUrl ? (
          <a href={prospect.demoUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonClass, "no-underline")}>
            View demo
          </a>
        ) : null}

        {prospect.hasWebsite && !prospect.projectId ? (
          <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => run("run_audit")}>
            {pending === "run_audit" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <TestTube className="h-4 w-4" aria-hidden />}
            Run audit
          </button>
        ) : null}
        {hasIntelligence && prospect.projectId ? (
          <a href={`/projects/${prospect.projectId}`} className={cn(buttonClass, "no-underline")}>
            View audit
          </a>
        ) : null}
        {hasBlueprint && prospect.projectId ? (
          <a href={`/projects/${prospect.projectId}/blueprint`} className={cn(buttonClass, "no-underline")}>
            View blueprint
          </a>
        ) : null}

        <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => run("contact")}>
          {pending === "contact" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Phone className="h-4 w-4" aria-hidden />}
          Contact prospect
        </button>

        <button
          type="button"
          className="focus-ring ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
          disabled={pending !== null}
          onClick={() => run("refresh")}
        >
          {pending === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
          Refresh brief
        </button>
      </div>
      {error ? <p className="mt-3 text-[13px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
