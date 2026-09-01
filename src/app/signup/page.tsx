"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-signin-button";

/**
 * Public self-serve signup — reintroduced 1 Sep 2026, this time deliberately
 * (unlike the original one removed in §2j). Reuses the existing
 * /api/auth/create-account route (pre-confirmed account, no email needed,
 * same pattern as the invite-accept flow) rather than Supabase's own
 * signup+confirmation-email path, for the same reason §2b gives: that
 * mailer's rate limit is what caused the original OTP lockout.
 *
 * A brand-new account has no organization yet — landing on / (which
 * redirects an admin to /projects/new) triggers getUserAndOrganization()'s
 * auto-bootstrap the first time any server action runs, making the signer-up
 * the owner of a fresh workspace. See CLAUDE.md §2q for why this grants
 * full access immediately rather than a capped free tier — deliberate,
 * not an oversight.
 */
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const createRes = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        setMessage(createJson.error || "Unable to create your account.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // Creates the new workspace before landing on / — see
      // /api/auth/bootstrap's own doc comment for why this can't just wait
      // for it to happen incidentally later.
      await fetch("/api/auth/bootstrap", { method: "POST" });

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
        <h1 className="mt-3 text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Free to start, no credit card. Your workspace is ready the moment you sign up.
        </p>

        <div className="mt-7">
          <GoogleSignInButton label="Sign up with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg px-3 py-2"
              placeholder="At least 8 characters"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
          >
            {loading ? "Creating your workspace…" : "Create account"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-slate-200 underline decoration-dotted underline-offset-4 hover:text-white">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
