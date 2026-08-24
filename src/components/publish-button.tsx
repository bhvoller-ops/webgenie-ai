"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2, Rocket } from "lucide-react";
import type { Business } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";

type Status = "idle" | "loading" | "done" | "error";

export function PublishButton({ business, className }: { business: Business; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function handleClick() {
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/publish-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Publishing failed.");
      setUrl(json.url);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Live on Vercel — click to open"
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-signal-good/35 bg-signal-good/10 px-2.5 py-1.5 text-[12px] font-medium text-signal-good transition-colors hover:bg-signal-good/20",
          className
        )}
      >
        <Check className="h-3 w-3" aria-hidden />
        Live
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
    );
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        title="Publish a real, permanent, live-hosted site on Vercel"
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink disabled:opacity-60",
          status === "error" && "border-signal-bad/50 text-signal-bad",
          className
        )}
      >
        {status === "loading" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Rocket className="h-3 w-3" aria-hidden />}
        {status === "loading" ? "Publishing…" : status === "error" ? "Retry publish" : "Publish"}
      </button>
      {status === "error" && error ? <p className="mt-1 max-w-[220px] text-[11px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
