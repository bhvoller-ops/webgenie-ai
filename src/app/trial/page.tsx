"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TrialStartPage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        setMessage(json.error || "Unable to start your trial.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Trial started, but sign-in failed: ${error.message}. Try signing in manually.`);
        setLoading(false);
        return;
      }

      window.location.href = `/trial/status/${json.projectId}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#10151a] text-[#eceff1]">
      <div className="mx-auto max-w-lg px-6 py-20">
        <div className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#57c2b8]">Preflight — Free Trial</div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">See it on a real site — yours</h1>
        <p className="mt-4 text-[15.5px] text-[#9aa7ae]">
          Paste any live URL. In a couple of minutes you&apos;ll get a real, evidence-traced audit, a rebuild blueprint, and a build-ready
          prompt package — plus the plain-English version to hand a client. Free, no card.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-[#9aa7ae]">Website URL</span>
            <input
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-lg border border-[#2b3640] bg-[#181f26] px-3 py-2.5 text-[#eceff1] placeholder:text-[#6d7a81]"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#9aa7ae]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-[#2b3640] bg-[#181f26] px-3 py-2.5 text-[#eceff1] placeholder:text-[#6d7a81]"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#9aa7ae]">Set a password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8+ characters"
              className="mt-2 w-full rounded-lg border border-[#2b3640] bg-[#181f26] px-3 py-2.5 text-[#eceff1] placeholder:text-[#6d7a81]"
            />
          </label>
          <button
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#57c2b8] px-4 py-3 font-semibold text-[#0d3a36] transition-opacity disabled:opacity-60"
          >
            {loading ? "Starting your trial…" : "Run my free audit"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-[#e08672]">{message}</p> : null}

        <p className="mt-6 text-[13px] text-[#6d7a81]">
          This creates a free account so you can come back and see your results — up to 3 trial audits, no charge.
        </p>
      </div>
    </main>
  );
}
