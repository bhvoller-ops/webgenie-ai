"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Radar,
  Search,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill } from "@/components/ui";
import { INDUSTRY_LIST } from "@/lib/sitegen/industries";
import type { IndustryKey } from "@/lib/sitegen/types";

interface QueueResponse {
  totalCandidates: number;
  queued: Array<{ projectId: string; jobId: string; businessName: string; url: string }>;
  skipped: Array<{ businessName: string; reason: string }>;
  excludedChains: Array<{ businessName: string; reviewCount: number | null }>;
  provider: "sample" | "places";
  notice?: string;
}

export default function AuditPage() {
  const [industry, setIndustry] = useState<IndustryKey>("plumber");
  const [location, setLocation] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseLocation(v: string) {
    const [c, s] = v.split(",").map((x) => x.trim());
    return { city: c || v.trim(), state: (s || "").toUpperCase() };
  }

  async function run() {
    if (!location.trim() || running) return;
    setRunning(true);
    setError(null);
    setResult(null);

    const { city, state } = parseLocation(location);

    try {
      const res = await fetch("/api/audits/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, city, state, limit: 10 })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setResult((await res.json()) as QueueResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <PageShell>
      <Panel className="relative overflow-hidden" padded={false}>
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.3]"
          style={{
            backgroundSize: "54px 54px",
            maskImage: "radial-gradient(620px 280px at 50% 0%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(620px 280px at 50% 0%, #000, transparent)",
          }}
          aria-hidden
        />
        <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16">
          <Pill tone="neon" className="mx-auto">
            <Radar className="h-3 w-3" aria-hidden />
            Find businesses with a bad website
          </Pill>

          <h1 className="mx-auto mt-6 max-w-3xl text-display-lg font-semibold">
            <span className="text-ink">Audit Local Businesses</span>
            <br />
            <span className="gradient-text">That Already Have a Site</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Enter an industry and city. We find businesses with an existing website and queue each
            one for a real eleven-module intelligence scan — the same engine, not a guess.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-panel border border-hairline bg-canvas/80 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="relative block">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryKey)}
                  className="focus-ring w-full appearance-none rounded-xl border border-hairline bg-surface py-3 pl-10 pr-9 text-left text-sm text-ink transition-colors hover:border-iris/40"
                >
                  {INDUSTRY_LIST.map((p) => (
                    <option key={p.key} value={p.key} className="bg-surface">
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative block">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && run()}
                  placeholder="Atlanta, GA"
                  className="focus-ring w-full rounded-xl border border-hairline bg-surface py-3 pl-10 pr-4 text-sm text-ink placeholder:text-faint transition-colors hover:border-iris/40"
                />
              </label>
            </div>

            <button
              onClick={run}
              disabled={running || !location.trim()}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-iris py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(34,211,238,.6)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Queuing analysis…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" aria-hidden />
                  Find & Queue Audits
                </>
              )}
            </button>
            <p className="mt-2 text-[11px] text-faint">
              Queues up to 10 real analysis jobs. Requires you to be signed in.
            </p>
          </div>

          {error ? (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-signal-bad/30 bg-signal-bad/10 px-4 py-3 text-[13px] text-signal-bad">
              {error}
            </div>
          ) : null}
        </div>
      </Panel>

      {result ? (
        <div className="mt-10 animate-fade-up">
          {result.notice ? (
            <div className="mb-6 rounded-xl border border-signal-warn/30 bg-signal-warn/[0.08] px-4 py-3 text-[13px] text-signal-warn">
              {result.notice}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="card p-5">
              <div className="eyebrow">Candidates found</div>
              <div className="mt-3 font-mono text-4xl font-semibold tabular-nums text-ink">
                {result.totalCandidates}
              </div>
            </div>
            <div className="card p-5">
              <div className="eyebrow">Queued for analysis</div>
              <div className="mt-3 font-mono text-4xl font-semibold tabular-nums text-signal-good">
                {result.queued.length}
              </div>
            </div>
            <div className="card p-5">
              <div className="eyebrow">Skipped</div>
              <div className="mt-3 font-mono text-4xl font-semibold tabular-nums text-signal-warn">
                {result.skipped.length}
              </div>
            </div>
            <div className="card p-5">
              <div className="eyebrow">Chains excluded</div>
              <div className="mt-3 font-mono text-4xl font-semibold tabular-nums text-faint">
                {result.excludedChains.length}
              </div>
            </div>
          </div>

          {result.queued.length ? (
            <div className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-display-md font-semibold text-ink">Now analyzing</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    Each one runs through the real capture + 11-module scoring pipeline. Scores
                    appear on your dashboard as jobs complete — usually a minute or two apart.
                  </p>
                </div>
                <Link
                  href="/"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="mt-6 space-y-2">
                {result.queued.map((q) => (
                  <div
                    key={q.jobId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-ink">{q.businessName}</div>
                      <div className="truncate font-mono text-[11px] text-faint">{q.url}</div>
                    </div>
                    <Pill tone="warn">queued</Pill>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.skipped.length ? (
            <div className="mt-8">
              <Eyebrow className="text-signal-warn">Skipped</Eyebrow>
              <div className="mt-4 space-y-2">
                {result.skipped.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] text-muted">
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />
                    <span className="text-ink">{s.businessName}</span>
                    <span className="text-faint">— {s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.excludedChains.length ? (
            <div className="mt-8">
              <Eyebrow className="text-faint">
                Chains excluded — multi-location or high-review operators, not good foot-in-the-door targets
              </Eyebrow>
              <div className="mt-4 space-y-2">
                {result.excludedChains.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] text-muted">
                    <span className="text-ink">{c.businessName}</span>
                    {c.reviewCount !== null ? (
                      <span className="font-mono text-faint">— {c.reviewCount} reviews</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
