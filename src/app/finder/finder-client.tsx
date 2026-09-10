"use client";

import { useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Radar,
  Search,
  Sparkles,
  Star,
  Target,
  Radio,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill, type PillTone } from "@/components/ui";
import type { AccessRole } from "@/lib/auth/access";
import { PublishButton } from "@/components/publish-button";
import { OpportunityPreviewDrawer } from "@/components/opportunity-preview-drawer";
import { IndustryPicker } from "@/components/industry-picker";
import { industryHeroImage, industryLabel, industrySecondaryImage } from "@/lib/sitegen/industry-lookup";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import type { IndustryKey } from "@/lib/sitegen/types";
import type { FinderResultRow } from "@/app/api/prospects/route";
import { PRELIMINARY_LEVEL_LABELS } from "@/lib/prospect/preliminary-opportunity";
import {
  FINDER_FILTERS,
  FINDER_SORTS,
  filterResults,
  paginate,
  sortResults,
  statusLabel,
  type FinderFilter,
  type FinderSort,
} from "@/lib/prospect/finder-view";
import { cn } from "@/lib/format";

interface FinderResponse {
  provider: "sample" | "places";
  totalFound: number;
  results: FinderResultRow[];
  notice?: string;
}

const STAGES = [
  "Scanning Google Maps listings",
  "Reading public business signals",
  "Scoring preliminary opportunity",
  "Preparing results",
];

const RADIUS_OPTIONS = [
  { label: "Google's default area", value: "" },
  { label: "Within 5 miles", value: "5" },
  { label: "Within 10 miles", value: "10" },
  { label: "Within 15 miles", value: "15" },
  { label: "Within 25 miles", value: "25" },
  { label: "Within 31 miles (max)", value: "31" },
];

const LEVEL_TONE: Record<string, PillTone> = {
  high: "good",
  medium: "warn",
  low: "neutral",
  insufficient_data: "info",
};

const PAGE_SIZES = [25, 50] as const;

export function FinderClient({ role, organizationId }: { role: AccessRole; organizationId: string }) {
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

  const [filter, setFilter] = useState<FinderFilter>("all");
  const [sort, setSort] = useState<FinderSort>("recommended");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewRow, setPreviewRow] = useState<FinderResultRow | null>(null);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [bulkImportProgress, setBulkImportProgress] = useState<{ done: number; total: number } | null>(null);

  const agency = "VibeLabs Agency";

  function withOverrides(b: FinderResultRow): FinderResultRow {
    return { ...b, ...overrides[b.id] };
  }

  function setOverride(id: string, patch: { heroImageOverride?: string; secondaryImageOverride?: string }) {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function parseLocation(v: string) {
    const [c, s] = v.split(",").map((x) => x.trim());
    return { city: c || v.trim(), state: (s || "").toUpperCase() };
  }

  function smsHref(b: FinderResultRow) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${demoSiteUrl(b, { by: agency, org: organizationId })}`;
    const body = `Hi, this is Cassey — here's the site I mentioned for ${b.name}: ${url}`;
    return `sms:${(b.phone || "").replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
  }

  async function run() {
    if (!location.trim() || running) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(true);
    setError(null);
    setResult(null);
    setSelected(new Set());
    setPage(1);
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

  const rows = useMemo(() => result?.results ?? [], [result]);
  const filtered = useMemo(() => filterResults(rows, filter), [rows, filter]);
  const sorted = useMemo(() => sortResults(filtered, sort), [filtered, sort]);
  const pageRows = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const recommendedCount = useMemo(() => rows.filter((r) => r.preliminaryOpportunity.level === "high").length, [rows]);
  const noWebsiteCount = useMemo(() => rows.filter((r) => r.preliminaryOpportunity.websiteStatus === "absent").length, [rows]);
  const auditedCount = useMemo(() => rows.filter((r) => r.hasCompletedAudit).length, [rows]);

  const csvHref = useMemo(() => {
    if (!rows.length) return null;
    const head = ["Business", "Phone", "Address", "City", "State", "Rating", "Reviews", "Website", "Opportunity"];
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = rows.map((b) =>
      [b.name, b.phone, b.address, b.city, b.state, b.rating ?? "", b.reviewCount ?? "", b.website ? "yes" : "no", PRELIMINARY_LEVEL_LABELS[b.preliminaryOpportunity.level]]
        .map(q)
        .join(",")
    );
    const csv = [head.map(q).join(","), ...body].join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [rows]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageRows.every((r) => next.has(r.id));
      pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }

  async function importGmb(businesses: FinderResultRow[]) {
    if (businesses.length === 0) return;
    setImportingIds((prev) => {
      const next = new Set(prev);
      businesses.forEach((b) => next.add(b.id));
      return next;
    });
    if (businesses.length > 1) setBulkImportProgress({ done: 0, total: businesses.length });
    try {
      const response = await fetch("/api/prospects/import-gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses: businesses.map(withOverrides) }),
      });
      const json = (await response.json()) as { imported: { businessId: string }[]; failed: { businessId: string; reason: string }[] };
      if (json.imported) {
        setImportedIds((prev) => {
          const next = new Set(prev);
          json.imported.forEach((r) => next.add(r.businessId));
          return next;
        });
      }
      if (json.failed?.length) {
        setError(`Import GMB Data: ${json.failed.length} of ${businesses.length} failed (${json.failed[0].reason}).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import GMB Data failed.");
    } finally {
      setImportingIds((prev) => {
        const next = new Set(prev);
        businesses.forEach((b) => next.delete(b.id));
        return next;
      });
      setBulkImportProgress(null);
      setSelected(new Set());
    }
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
            Find businesses worth contacting
          </Pill>

          <h1 className="mx-auto mt-6 max-w-3xl text-display-lg font-semibold">
            <span className="text-ink">Find Local Businesses</span>
            <br />
            <span className="gradient-text">Worth Contacting</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Search your market. WebGenie analyzes public business signals, surfaces promising
            prospects, and helps you decide who deserves a closer look.
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

          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard icon={<Building2 className="h-4 w-4 text-muted" aria-hidden />} label="Total found" value={result.totalFound} tone="ink" />
            <StatCard icon={<Target className="h-4 w-4 text-signal-good" aria-hidden />} label="Recommended" value={recommendedCount} tone="good" />
            <StatCard icon={<Globe className="h-4 w-4 text-signal-warn" aria-hidden />} label="No website" value={noWebsiteCount} tone="warn" />
            <StatCard icon={<Radio className="h-4 w-4 text-neon" aria-hidden />} label="Audited" value={auditedCount} tone="neon" />
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-display-md font-semibold text-ink">Prospects</h2>
              <p className="mt-1.5 text-sm text-muted">
                {sorted.length} of {rows.length} shown
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

          {/* Filters + sort */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {FINDER_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setPage(1);
                  }}
                  className={cn(
                    "focus-ring rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    filter === f.key
                      ? "border-iris/40 bg-iris/15 text-iris-soft"
                      : "border-hairline bg-raised text-muted hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as FinderSort)}
                className="focus-ring appearance-none rounded-xl border border-hairline bg-surface py-2 pl-3 pr-9 text-[12.5px] text-ink transition-colors hover:border-iris/40"
              >
                {FINDER_SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-surface">
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" aria-hidden />
            </label>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-iris/30 bg-iris/[0.07] px-4 py-3">
              <span className="text-[12.5px] text-iris-soft">{selected.size} selected</span>
              <div className="flex items-center gap-2">
                {bulkImportProgress ? (
                  <span className="text-[12px] text-muted">
                    Importing {bulkImportProgress.done} of {bulkImportProgress.total}…
                  </span>
                ) : (
                  <button
                    onClick={() => importGmb(sorted.filter((r) => selected.has(r.id)))}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-neon/35 bg-neon/10 px-3 py-1.5 text-[12px] font-medium text-neon-soft transition-colors hover:bg-neon/20"
                  >
                    <Radio className="h-3 w-3" aria-hidden />
                    Import GMB Data
                  </button>
                )}
                <button onClick={() => setSelected(new Set())} className="focus-ring text-[12px] text-faint hover:text-muted">
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto rounded-panel border border-hairline">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-raised">
                <tr>
                  <th className="w-10 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                      onChange={toggleSelectAllOnPage}
                      className="h-3.5 w-3.5 rounded border-hairline"
                      aria-label="Select all on page"
                    />
                  </th>
                  {["Business", "Website", "Google Reputation", "Opportunity", "Evidence", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((raw) => {
                  const b = withOverrides(raw);
                  const opp = b.preliminaryOpportunity;
                  const isImporting = importingIds.has(b.id);
                  const wasImported = importedIds.has(b.id) || Boolean(b.prospectId && b.hasCompletedAudit);
                  return (
                    <>
                    <tr key={b.id} className="border-t border-hairline transition-colors hover:bg-raised/40">
                      <td className="px-4 py-4 align-top">
                        <input
                          type="checkbox"
                          checked={selected.has(b.id)}
                          onChange={() => toggleSelected(b.id)}
                          className="h-3.5 w-3.5 rounded border-hairline"
                        />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/30 bg-iris/10 text-[13px] font-semibold text-iris-soft">
                            {b.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-[13px] font-medium text-ink">{b.name}</span>
                            <span className="block text-[11.5px] text-faint">
                              {industryLabel(b.industry)} · {b.city}
                              {b.state ? `, ${b.state}` : ""}
                            </span>
                            {b.isLikelyChain ? (
                              <Pill tone="neutral" className="mt-1 text-[10px]">Possible chain</Pill>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Pill tone={b.website ? "good" : "neutral"} className="text-[11px]">
                          {opp.websiteStatus === "present" ? "Present" : opp.websiteStatus === "absent" ? "No Website" : "Unknown"}
                        </Pill>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {typeof b.rating === "number" ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px]">
                            <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                            <span className="font-mono text-ink">{b.rating}</span>
                            <span className="text-faint">({b.reviewCount ?? 0})</span>
                          </span>
                        ) : (
                          <span className="text-[12px] text-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <Pill tone={LEVEL_TONE[opp.level]} className="text-[11px]">
                            {PRELIMINARY_LEVEL_LABELS[opp.level]}
                          </Pill>
                          <span className="text-[10.5px] text-faint">{opp.confidence} confidence</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex max-w-[220px] flex-wrap gap-1">
                          {opp.evidence
                            .filter((e) => e.type !== "website_status")
                            .slice(0, 3)
                            .map((e, i) => (
                              <span
                                key={i}
                                className="rounded-full border border-hairline bg-raised px-2 py-0.5 text-[10px] text-muted"
                              >
                                {e.label}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Pill tone="neutral" className="text-[11px]">{statusLabel(b)}</Pill>
                        {wasImported ? (
                          <span className="mt-1 block text-[10px] text-signal-good">GMB data imported</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <button
                            onClick={() => setPreviewRow(b)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3 py-2 text-[12px] font-semibold text-white shadow-[0_6px_20px_-10px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
                          >
                            <Target className="h-3 w-3" aria-hidden />
                            View Opportunity
                          </button>

                          {/* Secondary actions — visually subordinate, section 9 */}
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              onClick={() => importGmb([b])}
                              disabled={isImporting || b.source !== "places"}
                              title="Import publicly available Google Business Profile / Maps data."
                              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink disabled:opacity-40"
                            >
                              {isImporting ? <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden /> : <Radio className="h-2.5 w-2.5" aria-hidden />}
                              GMB
                            </button>
                            {b.phone ? (
                              <a
                                href={smsHref(b)}
                                title="Text this business's demo link"
                                className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink"
                              >
                                <MessageSquare className="h-2.5 w-2.5" aria-hidden />
                              </a>
                            ) : null}
                            <a
                              href={demoSiteUrl(b, { by: agency, org: organizationId })}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview a generated demo site"
                              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink"
                            >
                              <ExternalLink className="h-2.5 w-2.5" aria-hidden />
                            </a>
                            <button
                              onClick={() => copy(b.phone || "", b.id + "p")}
                              title="Copy phone number"
                              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink"
                            >
                              {copied === b.id + "p" ? <Check className="h-2.5 w-2.5 text-signal-good" aria-hidden /> : <Copy className="h-2.5 w-2.5" aria-hidden />}
                            </button>
                            <button
                              onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                              title="Swap the header/in-action photo"
                              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink"
                            >
                              <ImageIcon className="h-2.5 w-2.5" aria-hidden />
                            </button>
                            <PublishButton business={b} className="!px-2 !py-1 !text-[10.5px]" />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {editingId === b.id ? (
                      <tr className="border-t border-hairline bg-raised/30">
                        <td colSpan={8} className="px-5 py-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <PhotoOverrideInput
                              label="Header photo URL"
                              placeholder={industryHeroImage(b.industry)}
                              value={overrides[b.id]?.heroImageOverride ?? ""}
                              onChange={(v) => setOverride(b.id, { heroImageOverride: v || undefined })}
                            />
                            <PhotoOverrideInput
                              label="In-action photo URL"
                              placeholder={industrySecondaryImage(b.industry)}
                              value={overrides[b.id]?.secondaryImageOverride ?? ""}
                              onChange={(v) => setOverride(b.id, { secondaryImageOverride: v || undefined })}
                            />
                          </div>
                          <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
                            Leave blank to use the default {industryLabel(b.industry).toLowerCase()} photo.
                            Paste any direct image link — free stock (Pexels, Unsplash) or one the business
                            sent you.
                          </p>
                        </td>
                      </tr>
                    ) : null}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sorted.length > pageRows.length || sorted.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px] text-muted">
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                    setPage(1);
                  }}
                  className="focus-ring rounded-lg border border-hairline bg-surface px-2 py-1 text-[12px] text-ink"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="focus-ring rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-muted disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-[12px] text-faint">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="focus-ring rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-muted disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-panel border border-iris/25 bg-iris/[0.06] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-iris-soft">What to do next</div>
            <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">
              Open a prospect&rsquo;s Opportunity Preview, check the evidence, then decide: build a new
              site demo for a no-website prospect, or run an audit on one with a website. The opener
              that works is short:{" "}
              <span className="text-ink">
                &ldquo;I was looking for a {industryLabel(industry).toLowerCase()} in{" "}
                {parseLocation(location).city} and found you, so I built you one. Would you like to see it?&rdquo;
              </span>{" "}
              Then stop talking. The pause is what pulls them in.
            </p>
          </div>
        </div>
      ) : null}

      <OpportunityPreviewDrawer row={previewRow} onClose={() => setPreviewRow(null)} />
    </PageShell>
  );
}

function Panel({ children, className, padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return <section className={cn("panel", padded && "p-6 sm:p-8", className)}>{children}</section>;
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
  tone: "ink" | "warn" | "good" | "neon";
}) {
  const color = { ink: "text-ink", warn: "text-signal-warn", good: "text-signal-good", neon: "text-neon" }[tone];
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
