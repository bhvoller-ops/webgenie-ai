"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABELS: Record<string, string> = {
  partner: "Partner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer"
};

export function AcceptInviteForm({ token, email, role }: { token: string; email: string; role: string }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const json = await response.json();
      if (!response.ok) {
        setMessage(json.error || "Unable to accept this invite.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Account created, but sign-in failed: ${error.message}. Try signing in manually.`);
        setLoading(false);
        return;
      }

      window.location.href = json.role === "partner" ? "/partners/portal" : "/";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">You&apos;re invited</h1>
        <p className="mt-2 text-sm text-slate-400">
          {email} · {ROLE_LABELS[role] ?? role} access. Set a password to finish setting up your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg px-3 py-2"
              placeholder="••••••••"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Set password and continue"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </section>
    </main>
  );
}
