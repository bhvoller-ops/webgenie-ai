"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const json = await response.json();
      setMessage(json.message || json.error || "Something went wrong.");
      if (response.ok) setDone(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your account email and we&apos;ll send you a reset link.</p>

        {!done ? (
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
            <button
              disabled={loading}
              className="w-full rounded-lg bg-white px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
            >
              {loading ? "Please wait…" : "Send reset link"}
            </button>
          </form>
        ) : null}

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

        <Link href="/login" className="mt-6 inline-block text-sm text-slate-400 underline decoration-dotted underline-offset-4 hover:text-slate-200">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
