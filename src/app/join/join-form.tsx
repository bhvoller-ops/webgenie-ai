"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Check } from "lucide-react";
import { Logo } from "@/components/shell";
import { Pill } from "@/components/ui";

const TOOLS = [
  { name: "Lead Finder", desc: "Surfaces businesses that are a real fit — not a cold list." },
  { name: "Qualification & Audit Tool", desc: "Know exactly what each lead needs before you call." },
  { name: "Prebuilt AI-Integrated Websites", desc: "Deploy a lead-magnet site in minutes." },
  { name: "Upsell Path", desc: "A built-in sequence for growing past client one." },
];

export function JoinForm({ remaining, total }: { remaining: number; total: number }) {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const soldOut = remaining <= 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/vibelabs/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Something went wrong.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16">
        <Logo />

        <div className="mt-8 text-center">
          <Pill tone={soldOut ? "bad" : "warn"} className="mx-auto">
            {soldOut ? "All founding spots claimed" : `Founding launch — ${remaining} of ${total} spots left`}
          </Pill>
          <h1 className="mt-4 text-display-md font-semibold text-ink">
            Your White-Label AI Agency
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            A fully branded agency in your name, with the exact tools to find, qualify, and close
            your first client.
          </p>
        </div>

        <div className="mt-8 w-full rounded-panel border border-hairline bg-canvas p-8 sm:p-10">
          {cancelled && (
            <p className="mb-6 rounded-lg border border-hairline bg-raised px-4 py-3 text-[13px] text-muted">
              Checkout was cancelled — no charge was made. Ready when you are.
            </p>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-signal-good/25 bg-signal-good/[0.06] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal-good" aria-hidden />
            <p className="text-[13px] leading-relaxed text-ink">
              If you haven&rsquo;t landed a paying client within 60 days, we don&rsquo;t walk away
              — you get free, extended 1:1 support until you do. Not a refund — a standing
              commitment.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {TOOLS.map((t) => (
              <div key={t.name} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{t.name}</p>
                  <p className="text-[12.5px] text-faint">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-baseline gap-1.5 border-t border-hairline pt-6">
            <span className="text-3xl font-semibold tracking-tight text-ink">$97</span>
            <span className="text-sm text-muted">/mo</span>
            <span className="ml-2 text-[12.5px] text-faint">One price. No tiers.</span>
          </div>

          {soldOut ? (
            <p className="mt-5 text-sm text-muted">
              All {total} founding spots are claimed. Check back for the next opening.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
              />
              {error && <p className="mt-2 text-sm text-signal-bad">{error}</p>}
              <button
                type="submit"
                disabled={status === "loading"}
                className="focus-ring mt-3 w-full rounded-lg bg-iris px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft disabled:opacity-60"
              >
                {status === "loading" ? "Starting…" : "Start Your 14-Day Free Trial"}
              </button>
              <p className="mt-3 text-center text-[12px] text-faint">
                Card required to start, not charged for 14 days.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
