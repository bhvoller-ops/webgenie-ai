"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email and password to sign in. New accounts are set up by invite only — ask the
          workspace owner if you need access.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg px-3 py-2"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
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
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

        <Link href="/forgot-password" className="mt-6 inline-block text-sm text-slate-400 underline decoration-dotted underline-offset-4 hover:text-slate-200">
          Forgot your password?
        </Link>
      </section>
    </main>
  );
}
