"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Panel } from "@/components/ui";
import { Logo } from "@/components/shell";

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
      <Panel className="w-full max-w-md">
        <Logo />
        <h1 className="mt-6 text-display-md font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Enter your email and password to sign in.</p>

        <div className="mt-7">
          <GoogleSignInButton />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-xs text-faint">or</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block">
            <span className="text-sm text-muted">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </label>
          <button
            disabled={loading}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-signal-bad">{message}</p> : null}

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-muted underline decoration-dotted underline-offset-4 hover:text-ink">
            Forgot your password?
          </Link>
          <Link href="/signup" className="text-muted underline decoration-dotted underline-offset-4 hover:text-ink">
            Create an account
          </Link>
        </div>
      </Panel>
    </main>
  );
}
