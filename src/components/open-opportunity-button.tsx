"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target } from "lucide-react";
import type { Business } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";

/**
 * Turns a Finder result into a real, addressable Prospect and opens its
 * Opportunity Brief — the P0 build's entry point from the ephemeral
 * results list into the persisted prospect detail page. Mirrors
 * PublishButton's own loading/error pattern.
 */
export function OpenOpportunityButton({ business, className }: { business: Business; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/prospects/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to open this prospect.");
      router.push(`/prospects/${json.prospectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open this prospect.");
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title="See why this business matters, what to offer, and what to say"
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-neon/35 bg-neon/10 px-2.5 py-1.5 text-[12px] font-medium text-neon-soft transition-colors hover:bg-neon/20 disabled:opacity-60",
          className
        )}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Target className="h-3 w-3" aria-hidden />}
        Opportunity
      </button>
      {error ? <p className="mt-1 max-w-[220px] text-[11px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
