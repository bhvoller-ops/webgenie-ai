"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Replaces the old <form action={inviteTeamMemberAction}> in /settings —
 * that action stored a token_hash with no captured raw token, so it could
 * never produce a usable link. This calls /api/team/invite instead and
 * shows the one-time copyable link, same pattern as InvitePartnerButton.
 */
export function InviteTeamMemberForm({ onInvited }: { onInvited?: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to create invite.");
      setUrl(json.url);
      setStatus("done");
      onInvited?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create invite.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">
        <p className="text-sm">Invite created for {email}.</p>
        <CopyButton text={url} label="Copy invite link" />
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setEmail("");
            setUrl("");
          }}
          className="text-sm text-slate-400 underline decoration-dotted underline-offset-4"
        >
          Invite someone else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        required
        placeholder="team@example.com"
        className="rounded-lg px-3 py-2 text-slate-950"
      />
      <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-lg px-3 py-2 text-slate-950">
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>
      <button disabled={status === "loading"} className="rounded-lg bg-white px-4 py-2 font-medium text-slate-950 disabled:opacity-60">
        {status === "loading" ? "Creating…" : "Invite member"}
      </button>
      {status === "error" && error ? <p className="text-sm text-rose-300 md:col-span-3">{error}</p> : null}
    </form>
  );
}
