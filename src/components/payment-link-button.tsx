"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/format";

export function PaymentLinkButton({ callLogId, className }: { callLogId: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    // A short, permanent link on our own domain — /pay/[callLogId] mints a
    // fresh Stripe Checkout session on each visit, so unlike copying a raw
    // Stripe URL this one never expires and there's nothing to regenerate.
    const url = `${window.location.origin}/pay/${callLogId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Copy a short, permanent payment link for this prospect to text or email"
      className={cn(
        "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-iris/50 hover:text-ink",
        copied && "border-signal-good/50 text-signal-good",
        className
      )}
    >
      {copied ? <Check className="h-3 w-3" aria-hidden /> : <Link2 className="h-3 w-3" aria-hidden />}
      {copied ? "Link copied" : "Copy payment link"}
    </button>
  );
}
