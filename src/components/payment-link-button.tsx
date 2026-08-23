"use client";

import { useState } from "react";
import { Check, Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Status = "idle" | "loading" | "copied" | "error";

export function PaymentLinkButton({ callLogId, className }: { callLogId: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleClick() {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/billing/checkout-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callLogId })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to create payment link.");

      await navigator.clipboard.writeText(json.url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create payment link.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        title="Create a $297/mo checkout link for this prospect and copy it, without leaving this page"
        className={cn(
          "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-iris/50 hover:text-ink disabled:opacity-60",
          status === "copied" && "border-signal-good/50 text-signal-good",
          status === "error" && "border-signal-bad/50 text-signal-bad",
          className
        )}
      >
        {status === "loading" ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : status === "copied" ? (
          <Check className="h-3 w-3" aria-hidden />
        ) : (
          <Link2 className="h-3 w-3" aria-hidden />
        )}
        {status === "loading" ? "Creating…" : status === "copied" ? "Link copied" : status === "error" ? "Couldn't create link" : "Copy payment link"}
      </button>
      {status === "error" && error ? <p className="mt-1 text-[11px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
