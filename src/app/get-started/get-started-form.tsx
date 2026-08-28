"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/shell";
import { Eyebrow, Pill } from "@/components/ui";
import { INDUSTRY_LIST } from "@/lib/sitegen/industries";

export function GetStartedForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      businessName: form.get("businessName")?.toString() ?? "",
      contactName: form.get("contactName")?.toString() ?? "",
      phone: form.get("phone")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      industry: form.get("industry")?.toString() ?? "",
      city: form.get("city")?.toString() ?? "",
      state: form.get("state")?.toString() ?? "",
      message: form.get("message")?.toString() ?? "",
      ref
    };

    try {
      const response = await fetch("/api/get-started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Something went wrong.");
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
              <Pill tone="good" className="mx-auto">Request received</Pill>
              <h1 className="mt-4 text-2xl font-semibold text-ink">Thanks — we'll be in touch shortly!</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                We'll call or text you to talk through what you need and show you what a real site for
                your business could look like — no cost, no obligation.
              </p>
            </div>
          ) : (
            <>
              <Eyebrow className="text-iris-soft">Free, no-obligation website</Eyebrow>
              <h1 className="mt-2.5 text-display-md font-semibold text-ink">Get a site built for your business</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Tell us a bit about your business and we'll reach out to show you a real, working
                website built for you — hosting, AI chat, and review automation included.
              </p>
              {ref ? (
                <p className="mt-3 text-xs text-faint">
                  Referred by a WebGenie partner — thanks for stopping by.
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-7 grid gap-3">
                <input
                  name="businessName"
                  required
                  placeholder="Business name"
                  className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="contactName"
                    placeholder="Your name"
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="Phone"
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email (optional)"
                  className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    name="industry"
                    defaultValue=""
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 sm:col-span-1"
                  >
                    <option value="">What do you do?</option>
                    {INDUSTRY_LIST.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="city"
                    placeholder="City"
                    className="rounded-lg border border-hairline bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    name="state"
                    placeholder="State"
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
                  {status === "loading" ? "Sending…" : "Get my free site"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
