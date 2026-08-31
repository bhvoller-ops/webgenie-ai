"use client";

import { useState } from "react";

export function NewTrialForm({ remaining }: { remaining: number }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (remaining <= 0) {
    return <p className="text-sm text-muted">You&apos;ve used all your free trials. Get in touch if you&apos;d like to run more.</p>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/trial/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "Unable to start trial.");
        setLoading(false);
        return;
      }
      window.location.href = `/trial/status/${json.projectId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        type="url"
        required
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://example.com"
        className="min-w-[260px] flex-1 rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
      />
      <button
        disabled={loading}
        className="focus-ring rounded-lg bg-iris px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft disabled:opacity-60"
      >
        {loading ? "Starting…" : "Run audit"}
      </button>
      <span className="text-[12px] text-faint">{remaining} left</span>
      {error ? <p className="w-full text-[12px] text-signal-bad">{error}</p> : null}
    </form>
  );
}
