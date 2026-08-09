"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Filter,
  Loader2,
  MapPin,
  Radar,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill } from "@/components/ui";
import { INDUSTRY_LIST } from "@/lib/sitegen/industries";
import { REVIEW_TIERS, type ReviewTierKey } from "@/lib/prospect/finder";
import type { IndustryKey } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";

interface QueuedBusiness {
  projectId: string;
  jobId: string;
  businessName: string;
  url: string;
  rating: number | null;
  reviewCount: number | null;
}

interface QueueResponse {
  totalCandidates: number;
  queued: QueuedBusiness[];
  skipped: Array<{ businessName: string; reason: string }>;
  excludedChains: Array<{ businessName: string; reviewCount: number | null }>;
  reviewTier: ReviewTierKey;
  provider: "sample" | "places";
  notice?: string;
}

const STAGES = [
  "Scanning Google Maps listings",
  "Filtering out multi-location chains",
  "Sorting into review-count tiers",
  "Queuing analysis jobs",
  "Starting the intelligence scan",
];

const RADIUS_OPTIONS = [
  { label: "Google's default area", value: "" },
  { label: "Within 5 miles", value: "5" },
  { label: "Within 10 miles", value: "10" },
  { label: "Within 15 miles", value: "15" },
  { label: "Within 25 miles", value: "25" },
  { label: "Within 31 miles (max)", value: "31" },
];

export default function AuditPage() {
  const [industry, setIndustry] = useState<IndustryKey>("plumber");
  const [location, setLocation] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("");
  const [reviewTier, setReviewTier] = useState<ReviewTierKey>("small");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function parseLocation(v: string) {
    const [c, s] = v.split(",").map((x) => x.trim());
    return { city: c || v.trim(), state: (s || "").toUpperCase() };
  }

  async function run() {
    if (!location.trim() || running) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(true);
    setError(null);
    setResult(null);
    setStage(0);

    STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), i * 620));
    });

    const { city, state } = parseLocation(location);

    try {
      const [res] = await Promise.all([
        fetch("/api/audits/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry,
            city,
            state,
            limit: 10,
            reviewTier,
            radiusMiles: radiusMiles ? Number(radiusMiles) : undefined,
          }),
        }),
        new Promise((r) => setTimeout(r, STAGES.length * 620)),
      ]);

      if (res.status === 401) {
        throw new Error("Your session has expired. Please refresh the page and sign in again.");
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setResult((await res.json()) as QueueResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
      setStage(-1);
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

          {/* Search */}
          <div className="mx-auto mt-10 max-w-2xl rounded-panel border border-hairline bg-canvas/80 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
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

              <label className="relative block">
                <Radar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                <select
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(e.target.value)}
                  className="focus-ring w-full appearance-none rounded-xl border border-hairline bg-surface py-3 pl-10 pr-9 text-left text-sm text-ink transition-colors hover:border-neon/40"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-surface">
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {REVIEW_TIERS.map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setReviewTier(tier.key)}
                  className={cn(
                    "focus-ring rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
                    reviewTier === tier.key
                      ? "border-neon bg-neon/10 text-ink"
                      : "border-hairline bg-surface text-muted hover:border-neon/40"
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-faint">
              Small is the best foot-in-the-door pool. Mid/Large let you pull more established
              operators on purpose.
            </p>

            <button
              onClick={run}
              disabled={running || !location.trim()}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-iris py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(34,211,238,.6)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Processing…
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

          {/* Progress */}
          {running ? (
            <div className="mx-auto mt-4 max-w-2xl rounded-panel border border-hairline bg-canvas/80 p-5 text-left">
              <ul className="space-y-2.5">
                {STAGES.map((s, i) => {
                  const done = stage > i;
                  const active = stage === i;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      {done ? (
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-signal-good/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-signal-good" />
                        </span>
                      ) : active ? (
                        <Loader2 className="h-4 w-4 animate-spin text-neon-soft" aria-hidden />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-hairline" />
                      )}
                      <span
                        className={cn(
                          "text-[13px]",
                          done ? "text-muted" : active ? "text-neon-soft" : "text-faint"
                        )}
                      >
                        {s}…
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon to-iris transition-all duration-500"
                  style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-signal-bad/30 bg-signal-bad/10 px-4 py-3 text-[13px] text-signal-bad">
              {error}
            </div>
          ) : null}
        </div>
      </Panel>

      {/* Results */}
      {result ? (
        <div className="mt-10 animate-fade-up">
          {result.notice ? (
            <div className="mb-6 rounded-xl border border-signal-warn/30 bg-signal-warn/[0.08] px-4 py-3 text-[13px] text-signal-warn">
              {result.notice}
            </div>
          ) : null}

          <p className="mb-4 text-[13px] text-muted">
            Showing <span className="text-ink">{REVIEW_TIERS.find((t) => t.key === result.reviewTier)?.label}</span>
          </p>

          {result.totalCandidates === 0 ? (
            <div className="mb-6 rounded-xl border border-hairline bg-surface/60 px-4 py-3 text-[13px] text-muted">
              No new businesses in this tier for this industry/city — you've likely already queued
              everyone available here. Try a different tier, city, or industry.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard
              icon={<Building2 className="h-4 w-4 text-muted" aria-hidden />}
              label="Candidates found"
              value={result.totalCandidates}
              tone="ink"
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-signal-good" aria-hidden />}
              label="Queued for analysis"
              value={result.queued.length}
              tone="good"
            />
            <StatCard
              icon={<XCircle className="h-4 w-4 text-signal-warn" aria-hidden />}
              label="Skipped"
              value={result.skipped.length}
              tone="warn"
            />
            <StatCard
              icon={<Filter className="h-4 w-4 text-faint" aria-hidden />}
              label="Chains excluded"
              value={result.excludedChains.length}
              tone="faint"
            />
          </div>

          {result.queued.length ? (
            <>
              <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-display-md font-semibold text-ink">Now analyzing</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {result.queued.length} businesses running through the real capture +
                    11-module scoring pipeline
                    {result.provider === "sample" ? " · sample data" : " · live Google data"} —
                    scores appear on your dashboard a minute or two apart.
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

              <div className="mt-6 overflow-x-auto rounded-panel border border-hairline">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-raised">
                    <tr>
                      {["Business", "Reviews", "Website", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-faint"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.queued.map((q) => (
                      <tr key={q.jobId} className="border-t border-hairline transition-colors hover:bg-raised/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neon/30 bg-neon/10 text-[13px] font-semibold text-neon-soft">
                              {q.businessName.charAt(0)}
                            </span>
                            <span className="text-[13px] font-medium text-ink">{q.businessName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {typeof q.rating === "number" ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px]">
                              <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                              <span className="font-mono text-ink">{q.rating}</span>
                              <span className="text-faint">({q.reviewCount ?? 0})</span>
                            </span>
                          ) : (
                            <span className="text-[12px] text-faint">
                              {q.reviewCount !== null ? `${q.reviewCount} reviews` : "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="truncate font-mono text-[11px] text-faint">{q.url}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Pill tone="warn">queued</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                Chains excluded — multi-location brands, or over 1,500 reviews (outside every tier)
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

          {result.queued.length ? (
            <div className="mt-6 rounded-panel border border-neon/25 bg-neon/[0.06] p-6">
              <Eyebrow className="text-neon-soft">What to do next</Eyebrow>
              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">
                Give each job a minute or two, then open its report from the dashboard. The{" "}
                <span className="text-ink">Foot in the door</span> panel at the top lists only
                gaps you can show the owner in their own browser in ten seconds — that's your
                opener on the call.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "ink" | "warn" | "good" | "faint";
}) {
  const color = {
    ink: "text-ink",
    warn: "text-signal-warn",
    good: "text-signal-good",
    faint: "text-faint",
  }[tone];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {icon}
      </div>
      <div className={cn("mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tight", color)}>
        {value}
      </div>
    </div>
  );
}
