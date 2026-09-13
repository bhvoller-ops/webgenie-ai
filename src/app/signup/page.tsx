"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { AuthShell } from "@/components/auth-shell";

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
    <AuthShell>
      <div className="mt-6 w-full">
        <h1 className="text-display-md font-semibold text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          7-day full-access trial. No credit card required.
        </p>

        <div className="mt-7">
          <GoogleSignInButton label="Sign up with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-sm text-faint">or</span>
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
              autoComplete="new-password"
              aria-describedby="signup-password-hint"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400"
              placeholder="At least 8 characters"
            />
            <span id="signup-password-hint" className="mt-1.5 block text-sm text-faint">
              Minimum 8 characters.
            </span>
          </label>
          <button
            disabled={loading}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft disabled:opacity-60"
          >
            {loading ? "Creating your workspace…" : "Create account"}
          </button>
        </form>

        {message ? (
          <p role="alert" className="mt-4 text-sm text-signal-bad">
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline decoration-dotted underline-offset-4 hover:text-iris-soft">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
