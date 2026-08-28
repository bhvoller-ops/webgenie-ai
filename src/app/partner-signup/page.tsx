"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/shell";
import { Eyebrow, Pill } from "@/components/ui";

export default function PartnerSignupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [referralLink, setReferralLink] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name")?.toString() ?? "",
      contactEmail: form.get("contactEmail")?.toString() ?? "",
      contactPhone: form.get("contactPhone")?.toString() ?? "",
      message: form.get("message")?.toString() ?? ""
    };

    try {
      const response = await fetch("/api/partner-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Something went wrong.");
      setReferralLink(`${window.location.origin}/get-started?ref=${json.referralCode}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16">
        <Logo />

        <div className="mt-10 w-full rounded-panel border border-hairline bg-canvas p-8 sm:p-10">
          {status === "done" ? (
            <div className="text-center">
              <Pill tone="good" className="mx-auto">You're in</Pill>
              <h1 className="mt-4 text-2xl font-semibold text-ink">Thanks for signing up!</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                We'll review your account and reach out shortly to activate it. Once you're
                approved, share your link with anyone who needs a website — you'll earn a
                commission for every business that signs up through it.
              </p>
              <div className="mt-5 rounded-lg border border-hairline bg-white px-4 py-3 text-left">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Your referral link</div>
                <div className="mt-1 break-all font-mono text-[13px] text-slate-900">{referralLink}</div>
              </div>
            </div>
          ) : (
            <>
              <Eyebrow className="text-iris-soft">Refer & earn</Eyebrow>
              <h1 className="mt-2.5 text-display-md font-semibold text-ink">Become a WebGenie partner</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Know a local business that needs a website? Send them your link — you'll earn a
                commission for every one that signs up. No cost, no commitment on your end.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 grid gap-3">
                <input
                  name="name"
                  required
                  placeholder="Your name or agency name"
                  className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="contactEmail"
                    required
                    type="email"
                    placeholder="Email"
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    name="contactPhone"
                    type="tel"
                    placeholder="Phone (optional)"
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Anything you'd like us to know? (optional)"
                  className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                />

                {error ? <p className="text-sm text-signal-bad">{error}</p> : null}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="focus-ring mt-1 rounded-lg bg-iris px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-iris-soft disabled:opacity-60"
                >
                  {status === "loading" ? "Signing up…" : "Get my referral link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
