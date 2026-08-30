"use client";

import { useState } from "react";
import { Check, Loader2, Mail, UserPlus } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/format";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Generates a one-time portal-login invite link for a partner who doesn't
 * have one yet. The raw link is shown exactly once (only its hash is
 * stored server-side) — copy it and send it manually, same "invites
 * stored, sent by hand" pattern as the agency-staff team invite in
 * /settings.
 */
export function InvitePartnerButton({
  partnerId,
  hasEmail,
  alreadyInvited = false,
  className
}: {
  partnerId: string;
  hasEmail: boolean;
  /** A pending invite already exists for this partner — changes the idle label to "Resend" and the created label accordingly. */
  alreadyInvited?: boolean;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function handleClick() {
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/partners/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to create invite.");
      setUrl(json.url);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create invite.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={cn("inline-flex flex-wrap items-center gap-2", className)}>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-signal-good/35 bg-signal-good/10 px-2.5 py-1.5 text-[12px] font-medium text-signal-good">
          <Check className="h-3 w-3" aria-hidden />
          Invite created
        </span>
        <CopyButton text={url} label="Copy invite link" />
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading" || !hasEmail}
        title={hasEmail ? "Create a one-time portal-login link to copy and send" : "Add a contact email first"}
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink disabled:opacity-60",
          status === "error" && "border-signal-bad/50 text-signal-bad",
          className
        )}
      >
        {status === "loading" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <UserPlus className="h-3 w-3" aria-hidden />}
        {status === "loading" ? "Sending…" : status === "error" ? "Retry" : alreadyInvited ? "Resend invite" : "Invite to portal"}
      </button>
      {!hasEmail ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-faint">
          <Mail className="h-3 w-3" aria-hidden /> Needs a contact email
        </p>
      ) : null}
      {status === "error" && error ? <p className="mt-1 max-w-[260px] text-[11px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
