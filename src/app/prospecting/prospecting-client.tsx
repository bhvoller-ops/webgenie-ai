"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Rocket,
  Search,
  SkipForward,
  Sparkles,
  Target,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill, type PillTone } from "@/components/ui";
import type { QueueItem, QueueSummary } from "@/app/api/prospects/queue/route";
import { cn } from "@/lib/format";

type QueueFilter = "all" | "today" | "ready_to_contact" | "follow_ups" | "demos_ready" | "overdue";

const FILTERS: { key: QueueFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "ready_to_contact", label: "Ready to Contact" },
  { key: "follow_ups", label: "Follow-ups" },
  { key: "demos_ready", label: "Demos Ready" },
  { key: "overdue", label: "Overdue" },
];

const LEVEL_TONE: Record<string, PillTone> = { high: "good", medium: "warn", low: "neutral", insufficient_evidence: "info" };
const PRIORITY_TONE: Record<string, PillTone> = { high: "bad", medium: "warn", low: "neutral" };

const DEFAULT_VISIBLE = 5;

function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now() - 12 * 3600_000;
}

function isToday(dueAt: string | null): boolean {
  if (!dueAt) return true; // undated items are always "today" work
  return new Date(dueAt).getTime() <= Date.now();
}

export function ProspectingClient({ organizationId }: { organizationId: string }) {
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [summary, setSummary] = useState<QueueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prospects/queue");
      if (!res.ok) throw new Error("Couldn't load your queue.");
      const json = await res.json();
      setItems(json.items);
      setSummary(json.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // organizationId scopes every server-side query already; nothing client-side depends on it directly.
  }, [organizationId]);

  const filtered = useMemo(() => {
    if (!items) return [];
    switch (filter) {
      case "today":
        return items.filter((i) => isToday(i.dueAt));
      case "ready_to_contact":
        return items.filter((i) => i.actionType === "CONTACT");
      case "follow_ups":
        return items.filter((i) => i.actionType === "FOLLOW_UP");
      case "demos_ready":
        return items.filter((i) => i.actionType === "SEND_DEMO");
      case "overdue":
        return items.filter((i) => isOverdue(i.dueAt));
      case "all":
      default:
        return items;
    }
  }, [items, filter]);

  const visible = showAll ? filtered : filtered.slice(0, DEFAULT_VISIBLE);

  async function act(actionId: string, body: Record<string, unknown>) {
    setPendingId(actionId);
    try {
      const res = await fetch(`/api/prospect-actions/${actionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("That didn't work.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <PageShell role="admin">
      <div className="panel relative overflow-hidden p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.25]"
          style={{ backgroundSize: "54px 54px", maskImage: "radial-gradient(620px 260px at 20% 0%, #000, transparent)", WebkitMaskImage: "radial-gradient(620px 260px at 20% 0%, #000, transparent)" }}
          aria-hidden
        />
        <div className="relative">
          <Pill tone="iris">
            <Sparkles className="h-3 w-3" aria-hidden />
            Daily Prospecting Queue
          </Pill>
          <h1 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
            Good morning. <span className="gradient-text">Let&rsquo;s find your next client.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
            Here are the prospects and follow-ups that deserve your attention today.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-signal-bad/30 bg-signal-bad/10 px-4 py-3 text-[13px] text-signal-bad">{error}</div>
      ) : items && items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-panel border border-hairline bg-canvas/70 px-8 py-16 text-center">
          <Compass className="h-8 w-8 text-faint" aria-hidden />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            No actions yet. Find prospects worth pursuing and WebGenie will build your action queue.
          </p>
          <Link
            href="/finder"
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
          >
            <Search className="h-4 w-4" aria-hidden />
            Find Prospects
          </Link>
        </div>
      ) : summary && items ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-5">
            <SummaryCard icon={<Compass className="h-4 w-4 text-muted" aria-hidden />} label="New to Review" value={summary.newToReview} />
            <SummaryCard icon={<Target className="h-4 w-4 text-signal-good" aria-hidden />} label="Ready to Contact" value={summary.readyToContact} tone="good" />
            <SummaryCard icon={<Clock className="h-4 w-4 text-signal-warn" aria-hidden />} label="Follow-ups Due" value={summary.followUpsDue} tone="warn" />
            <SummaryCard icon={<Rocket className="h-4 w-4 text-neon" aria-hidden />} label="Demos Ready" value={summary.demosReady} tone="neon" />
            <SummaryCard icon={<CalendarClock className="h-4 w-4 text-iris-soft" aria-hidden />} label="Meetings Scheduled" value={summary.meetingsScheduled} tone="iris" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-display-md font-semibold text-ink">Your Next Actions</h2>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "focus-ring rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    filter === f.key ? "border-iris/40 bg-iris/15 text-iris-soft" : "border-hairline bg-raised text-muted hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-[13px] text-faint">Nothing here right now.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {visible.map((item) => (
                <QueueRow key={item.actionId} item={item} pending={pendingId === item.actionId} onAct={act} />
              ))}
            </div>
          )}

          {filtered.length > DEFAULT_VISIBLE ? (
            <button onClick={() => setShowAll((v) => !v)} className="focus-ring mt-4 text-[13px] font-medium text-iris-soft hover:underline">
              {showAll ? "Show fewer" : `View All (${filtered.length})`}
            </button>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: "good" | "warn" | "neon" | "iris" }) {
  const color = tone === "good" ? "text-signal-good" : tone === "warn" ? "text-signal-warn" : tone === "neon" ? "text-neon" : tone === "iris" ? "text-iris-soft" : "text-ink";
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-[10px]">{label}</span>
        {icon}
      </div>
      <div className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight", color)}>{value}</div>
    </div>
  );
}

function QueueRow({
  item,
  pending,
  onAct
}: {
  item: QueueItem;
  pending: boolean;
  onAct: (actionId: string, body: Record<string, unknown>) => void;
}) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const overdue = isOverdue(item.dueAt);

  return (
    <div className="rounded-panel border border-hairline bg-canvas/70 p-4 transition-colors hover:border-iris/30 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">{item.businessName}</span>
            {item.opportunityLevel ? <Pill tone={LEVEL_TONE[item.opportunityLevel]} className="text-[10.5px]">{item.opportunityLevel}</Pill> : null}
            {overdue ? <Pill tone="bad" className="text-[10.5px]">Overdue</Pill> : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-faint">
            {item.industry ? (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" aria-hidden />
                {item.industry}
              </span>
            ) : null}
            {item.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {item.city}
                {item.state ? `, ${item.state}` : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
            <span className="font-semibold text-iris-soft">{item.actionLabel}: </span>
            {item.reason}
          </p>
          {item.evidenceSummary ? <p className="mt-1.5 text-[12px] leading-relaxed text-faint">{item.evidenceSummary}</p> : null}
          <div className="mt-2 flex items-center gap-2">
            <Pill tone={PRIORITY_TONE[item.priority]} className="text-[10px]">{item.priority} priority</Pill>
            {item.dueAt ? <span className="text-[11px] text-faint">Due {new Date(item.dueAt).toLocaleDateString()}</span> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {item.playbookChannel ? (
            <Link
              href={`/prospects/${item.prospectId}/playbook?actionId=${item.actionId}${item.enrollmentId ? `&enrollmentId=${item.enrollmentId}` : ""}`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
            >
              Open Playbook
            </Link>
          ) : (
            <Link
              href={`/prospects/${item.prospectId}`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
            >
              Open Prospect
            </Link>
          )}
          <div className="relative flex items-center gap-1">
            <button
              onClick={() => onAct(item.actionId, { op: "complete" })}
              disabled={pending}
              title="Mark done"
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink disabled:opacity-40"
            >
              {pending ? <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden /> : <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />}
            </button>
            <button
              onClick={() => setSnoozeOpen((v) => !v)}
              disabled={pending}
              title="Snooze"
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink disabled:opacity-40"
            >
              <Clock className="h-2.5 w-2.5" aria-hidden />
            </button>
            <button
              onClick={() => onAct(item.actionId, { op: "skip" })}
              disabled={pending}
              title="Skip"
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-[10.5px] text-faint transition-colors hover:text-ink disabled:opacity-40"
            >
              <SkipForward className="h-2.5 w-2.5" aria-hidden />
            </button>
            {snoozeOpen ? (
              <div className="absolute right-0 top-full z-10 mt-1.5 w-36 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-xl">
                {[
                  { key: "tomorrow", label: "Tomorrow" },
                  { key: "three_days", label: "3 days" },
                  { key: "one_week", label: "1 week" }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSnoozeOpen(false);
                      onAct(item.actionId, { op: "snooze", option: opt.key });
                    }}
                    className="block w-full px-3 py-2 text-left text-[12px] text-muted hover:bg-raised hover:text-ink"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
