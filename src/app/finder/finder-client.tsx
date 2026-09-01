"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import {
  Bot,
  Building2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Radar,
  Search,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill } from "@/components/ui";
import type { AccessRole } from "@/lib/auth/access";
import { PublishButton } from "@/components/publish-button";
import { IndustryPicker } from "@/components/industry-picker";
import { INDUSTRIES, INDUSTRY_LIST } from "@/lib/sitegen/industries";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import type { Business, IndustryKey } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";

interface FinderResponse {
  provider: "sample" | "places";
  totalFound: number;
  withoutWebsite: Business[];
  withWebsite: Business[];
  notice?: string;
}

const STAGES = [
  "Scanning Google Maps listings",
  "Identifying businesses without websites",
  "Pulling contact information",
  "Building demo websites",
  "Generating report",
];

const RADIUS_OPTIONS = [
  { label: "Google's default area", value: "" },
  { label: "Within 5 miles", value: "5" },
  { label: "Within 10 miles", value: "10" },
  { label: "Within 15 miles", value: "15" },
  { label: "Within 25 miles", value: "25" },
  { label: "Within 31 miles (max)", value: "31" },
];

export function FinderClient({ role }: { role: AccessRole }) {
  const [industry, setIndustry] = useState<IndustryKey>("plumber");
  const [location, setLocation] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<FinderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<
    Record<string, { heroImageOverride?: string; secondaryImageOverride?: string }>
  >({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const agency = "VibeLabs Agency";

  function withOverrides(b: Business): Business {
    return { ...b, ...overrides[b.id] };
  }

  function setOverride(id: string, patch: { heroImageOverride?: string; secondaryImageOverride?: string }) {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function parseLocation(v: string) {
    const [c, s] = v.split(",").map((x) => x.trim());
    return { city: c || v.trim(), state: (s || "").toUpperCase() };
  }

  function smsHref(b: Business) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${demoSiteUrl(b, { by: agency })}`;
    const body = `Hi, this is Cassey — here's the site I mentioned for ${b.name}: ${url}`;
    return `sms:${b.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
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
        fetch("/api/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry,
            city,
            state,
            radiusMiles: radiusMiles ? Number(radiusMiles) : undefined,
          }),
        }),
        new Promise((r) => setTimeout(r, STAGES.length * 620)),
      ]);

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Search failed (${res.status})`);
      }
      setResult((await res.json()) as FinderResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
      setStage(-1);
    }
  }

  const csvHref = useMemo(() => {
    if (!result?.withoutWebsite.length) return null;
    const head = ["Business", "Phone", "Address", "City", "State", "Rating", "Reviews"];
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = result.withoutWebsite.map((b) =>
      [b.name, b.phone, b.address, b.city, b.state, b.rating ?? "", b.reviewCount ?? ""].map(q).join(",")
    );
    const csv = [head.map(q).join(","), ...body].join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [result]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  return (
    <PageShell role={role}>
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
          <Pill tone="iris" className="mx-auto">
            <Sparkles className="h-3 w-3" aria-hidden />
            Find businesses that need your help
          </Pill>

          <h1 className="mx-auto mt-6 max-w-3xl text-display-lg font-semibold">
            <span className="text-ink">Find Local Businesses</span>
            <br />
            <span className="gradient-text">Without a Website</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Enter an industry and city. We scan Google Maps, identify businesses with no web
            presence, and build each one a personalised demo website — in seconds.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 max-w-2xl rounded-panel border border-hairline bg-canvas/80 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <IndustryPicker value={industry} onChange={setIndustry} />

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
                  className="focus-ring w-full appearance-none rounded-xl border border-hairline bg-surface py-3 pl-10 pr-9 text-left text-sm text-ink transition-colors hover:border-iris/40"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-surface">
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={run}
              disabled={running || !location.trim()}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" aria-hidden />
                  Find Prospects
                </>
              )}
            </button>
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
                        <Loader2 className="h-4 w-4 animate-spin text-iris-soft" aria-hidden />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-hairline" />
                      )}
                      <span
                        className={cn(
                          "text-[13px]",
                          done ? "text-muted" : active ? "text-iris-soft" : "text-faint"
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
                  className="h-full rounded-full bg-gradient-to-r from-iris to-neon transition-all duration-500"
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

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Building2 className="h-4 w-4 text-muted" aria-hidden />}
              label="Total found"
              value={result.totalFound}
              tone="ink"
            />
            <StatCard
              icon={<XCircle className="h-4 w-4 text-signal-warn" aria-hidden />}
              label="No website"
              value={result.withoutWebsite.length}
              tone="warn"
            />
            <StatCard
              icon={<Globe className="h-4 w-4 text-signal-good" aria-hidden />}
              label="Demo sites built"
              value={result.withoutWebsite.length}
              tone="good"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-display-md font-semibold text-ink">Businesses without a website</h2>
              <p className="mt-1.5 text-sm text-muted">
                {result.withoutWebsite.length} prospects ready for outreach
                {result.provider === "sample" ? " · sample data" : " · live Google data"}
              </p>
            </div>
            {csvHref ? (
              <a
                href={csvHref}
                download={`prospects-${industry}-${location.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-hairline bg-raised px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-iris/50"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download CSV
              </a>
            ) : null}
          </div>

          <div className="mt-6 overflow-x-auto rounded-panel border border-hairline">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-raised">
                <tr>
                  {["Business", "Phone", "Address", "Rating", "Demo site"].map((h) => (
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
                {result.withoutWebsite.map((b) => (
                  <Fragment key={b.id}>
                  <tr className="border-t border-hairline transition-colors hover:bg-raised/40">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/30 bg-iris/10 text-[13px] font-semibold text-iris-soft">
                          {b.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-ink">{b.name}</span>
                          <PitchBadges open24Hours={b.open24Hours} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => copy(b.phone, b.id + "p")}
                        className="focus-ring inline-flex items-center gap-2 rounded font-mono text-[12px] text-muted transition-colors hover:text-neon-soft"
                        title="Copy phone number"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {b.phone}
                        {copied === b.id + "p" ? (
                          <span className="text-[10px] text-signal-good">copied</span>
                        ) : (
                          <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-muted">{b.address}</td>
                    <td className="px-5 py-4">
                      {typeof b.rating === "number" ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px]">
                          <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                          <span className="font-mono text-ink">{b.rating}</span>
                          <span className="text-faint">({b.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-[12px] text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={smsHref(withOverrides(b))}
                          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-iris/35 bg-iris/10 px-3 py-1.5 text-[12px] font-medium text-iris-soft transition-colors hover:bg-iris/20"
                          title="Open your phone's texting app with the link pre-filled"
                        >
                          <MessageSquare className="h-3 w-3" aria-hidden />
                          Text
                        </a>
                        <a
                          href={demoSiteUrl(withOverrides(b), { by: agency })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-signal-good/35 bg-signal-good/10 px-3 py-1.5 text-[12px] font-medium text-signal-good transition-colors hover:bg-signal-good/20"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden />
                          View site
                        </a>
                        <a
                          href={demoSiteUrl(withOverrides(b), { by: agency, download: true })}
                          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
                          title="Download the HTML file"
                        >
                          <Download className="h-3 w-3" aria-hidden />
                        </a>
                        <button
                          onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                          className={cn(
                            "focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors",
                            editingId === b.id
                              ? "border-neon/40 bg-neon/10 text-neon-soft"
                              : "border-hairline bg-raised text-muted hover:text-ink"
                          )}
                          title="Swap the header/in-action photo for this site"
                        >
                          <ImageIcon className="h-3 w-3" aria-hidden />
                        </button>
                        <PublishButton business={withOverrides(b)} />
                      </div>
                    </td>
                  </tr>
                  {editingId === b.id ? (
                    <tr className="border-t border-hairline bg-raised/30">
                      <td colSpan={5} className="px-5 py-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <PhotoOverrideInput
                            label="Header photo URL"
                            placeholder={INDUSTRIES[b.industry].heroImage}
                            value={overrides[b.id]?.heroImageOverride ?? ""}
                            onChange={(v) => setOverride(b.id, { heroImageOverride: v || undefined })}
                          />
                          <PhotoOverrideInput
                            label="In-action photo URL"
                            placeholder={INDUSTRIES[b.industry].secondaryImage}
                            value={overrides[b.id]?.secondaryImageOverride ?? ""}
                            onChange={(v) => setOverride(b.id, { secondaryImageOverride: v || undefined })}
                          />
                        </div>
                        <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
                          Leave blank to use the default {INDUSTRIES[b.industry].label.toLowerCase()} photo.
                          Paste any direct image link — free stock (Pexels, Unsplash) or one the business
                          sent you. The Text and View site links above update immediately.
                        </p>
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-panel border border-iris/25 bg-iris/[0.06] p-6">
            <Eyebrow className="text-iris-soft">What to do next</Eyebrow>
            <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">
              Open a demo site, check it reads well, then call. The opener that works is short:{" "}
              <span className="text-ink">
                &ldquo;I was looking for a {INDUSTRY_LIST.find((i) => i.key === industry)?.label.toLowerCase()} in{" "}
                {parseLocation(location).city} and found you, but noticed you don&rsquo;t have a website — so I
                built you one. Would you like to see it?&rdquo;
              </span>{" "}
              Then stop talking. The pause is what pulls them in.
            </p>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function PhotoOverrideInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-hairline bg-canvas">
        <img
          src={value || placeholder}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
        />
      </div>
      <label className="block min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-widest text-faint">{label}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="focus-ring mt-1.5 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12px] text-ink placeholder:truncate placeholder:text-faint/70"
        />
      </label>
    </div>
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
  tone: "ink" | "warn" | "good";
}) {
  const color = { ink: "text-ink", warn: "text-signal-warn", good: "text-signal-good" }[tone];
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

/**
 * Talking points to lead with on the call, surfaced before you dial instead
 * of something you have to remember to check. Every row here already has no
 * website (that's why it's in this list), so "no AI receptionist" is always
 * true by definition — nothing to detect, it just needs saying out loud.
 * "No 24/7 coverage" comes from Places' own hours data (see isOpen24Hours in
 * lib/prospect/finder.ts) and is genuinely conditional, not assumed.
 */
function PitchBadges({ open24Hours }: { open24Hours?: boolean }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[10.5px] font-medium text-signal-warn">
        <Bot className="h-2.5 w-2.5" aria-hidden />
        No AI Receptionist
      </span>
      {!open24Hours ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[10.5px] font-medium text-signal-warn">
          <Clock className="h-2.5 w-2.5" aria-hidden />
          No 24/7 Coverage
        </span>
      ) : null}
    </div>
  );
}
