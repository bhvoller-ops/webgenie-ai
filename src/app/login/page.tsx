"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setMessage(error ? error.message : "Check your email for the secure sign-in link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email to receive a passwordless sign-in link.
        </p>

        <form onSubmit={signIn} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg px-3 py-2"
              placeholder="you@example.com"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </section>
    </main>
  );
}
