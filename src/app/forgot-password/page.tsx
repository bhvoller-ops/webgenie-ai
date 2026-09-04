"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui";
import { Logo } from "@/components/shell";

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
      <Panel className="w-full max-w-md">
        <Logo />
        <h1 className="mt-6 text-display-md font-semibold text-ink">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">Enter your account email and we&apos;ll send you a reset link.</p>

        {!done ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm text-muted">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </label>
            <button
              disabled={loading}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft disabled:opacity-60"
            >
              {loading ? "Please wait…" : "Send reset link"}
            </button>
          </form>
        ) : null}

        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}

        <Link href="/login" className="mt-6 inline-block text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-ink">
          Back to sign in
        </Link>
      </Panel>
    </main>
  );
}
