"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Search,
  SkipForward,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { PageHeader, SummaryStrip, SummaryStripSkeleton, ActionToolbar, EmptyState, ErrorState, LoadingSkeleton, DisclosurePanel, InlineSpinner, type SummaryStripItem } from "@/components/workspace";
import { Pill, type PillTone } from "@/components/ui";
import { getOverallReadinessBadge, OUTREACH_READY_NOTE } from "@/lib/prospect/evidence-readiness";
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

const PRIORITY_TONE: Record<string, PillTone> = { high: "bad", medium: "warn", low: "neutral" };

const DEFAULT_VISIBLE = 8;

function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now() - 12 * 3600_000;
}

function isToday(dueAt: string | null): boolean {
  if (!dueAt) return true; // undated items are always "today" work
  return new Date(dueAt).getTime() <= Date.now();
}

function isUpcoming(dueAt: string | null): boolean {
  return Boolean(dueAt) && new Date(dueAt as string).getTime() > Date.now();
}

const TODAY_LABEL = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

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

  // Grouped by due state (Phase 5C: "Group queue items by Overdue / Due
  // Today / Upcoming"). "Waiting/Paused" is intentionally not a separate
  // group here — the Daily Queue API only ever returns items that are
  // already actionable (see /api/prospects/queue's own dueItems filter),
  // so there's no real "paused, not yet due" signal in this data to group
  // on; inventing one would be a fabricated status, not a UI change.
  const overdueItems = visible.filter((i) => isOverdue(i.dueAt));
  const upcomingItems = visible.filter((i) => isUpcoming(i.dueAt));
  const todayItems = visible.filter((i) => !isOverdue(i.dueAt) && !isUpcoming(i.dueAt));

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

  // OWNER-REVIEW CORRECTION: the previous strip's 5 fixed categories
  // (New to Review / Ready to Contact / Follow-ups Due / Demos Ready /
  // Meetings Scheduled) don't count SEQUENCE_STEP or RUN_AUDIT actions at
  // all -- exactly the two action types that make up nearly every real
  // queue item today, so the strip showed 5 large zeros beside a header
  // saying "28 actions." This derives its categories directly from what's
  // actually visible in "Your Next Actions" below, so the numbers always
  // reconcile with the real queue -- never a fixed bucket set that happens
  // to miss whatever action types are actually present.
  const summaryItems: SummaryStripItem[] = useMemo(() => {
    if (!items || items.length === 0) return [];
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.actionLabel, (counts.get(item.actionLabel) ?? 0) + 1);
    const byType = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value }));
    // Meetings Scheduled is real pipeline context that isn't derivable from
    // today's queue rows (a scheduled meeting has no queue action of its
    // own) -- included only when it's actually non-zero, never as a
    // guaranteed-empty 5th tile.
    const meetingsScheduled = summary?.meetingsScheduled ?? 0;
    return meetingsScheduled > 0
      ? [...byType, { label: "Meetings Scheduled", value: meetingsScheduled, tone: "iris" as const, icon: <CalendarClock className="h-4 w-4" aria-hidden /> }]
      : byType;
  }, [items, summary]);

  const totalDue = items?.length ?? 0;
  const description =
    totalDue === 0
      ? "Nothing is due right now."
      : `${totalDue} action${totalDue === 1 ? "" : "s"} worth your attention today, in priority order.`;

  return (
    <PageShell role="admin">
      <PageHeader
        title="Daily Queue"
        description={description}
        context={<span className="text-[13px] text-faint">{TODAY_LABEL}</span>}
        primaryAction={items && items.length === 0 ? undefined : (
          <Link
            href="/finder"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-hairline bg-raised px-3.5 py-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            Find more prospects
          </Link>
        )}
      />

      {loading ? (
        <div className="mt-6 space-y-6">
          <SummaryStripSkeleton />
          <LoadingSkeleton rows={4} />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : items && items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Compass className="h-8 w-8" aria-hidden />}
            title="Nothing due right now"
            description="Find prospects worth pursuing and WebGenie will build your action queue automatically."
            action={
              <Link
                href="/finder"
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
              >
                <Search className="h-4 w-4" aria-hidden />
                Find Prospects
              </Link>
            }
          />
        </div>
      ) : summary && items ? (
        <>
          {summaryItems.length > 0 ? (
            <div className="mt-6">
              <SummaryStrip items={summaryItems} />
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-section-title font-semibold text-ink">Your Next Actions</h2>
            <ActionToolbar>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={cn(
                    "focus-ring rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    filter === f.key ? "border-iris/40 bg-iris/15 text-iris-soft" : "border-hairline bg-raised text-muted hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </ActionToolbar>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-[13px] text-faint">Nothing here right now.</p>
          ) : (
            <div className="mt-4 space-y-6">
              <QueueGroup label="Overdue" tone="bad" items={overdueItems} pendingId={pendingId} onAct={act} />
              <QueueGroup label="Due Today" tone="ink" items={todayItems} pendingId={pendingId} onAct={act} />
              <QueueGroup label="Upcoming" tone="neutral" items={upcomingItems} pendingId={pendingId} onAct={act} />
            </div>
          )}

          {filtered.length > DEFAULT_VISIBLE ? (
            <button onClick={() => setShowAll((v) => !v)} className="focus-ring mt-5 text-[13px] font-medium text-iris-soft hover:underline">
              {showAll ? "Show fewer" : `View All (${filtered.length})`}
            </button>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}

function QueueGroup({
  label,
  tone,
  items,
  pendingId,
  onAct
}: {
  label: string;
  tone: "bad" | "ink" | "neutral";
  items: QueueItem[];
  pendingId: string | null;
  onAct: (actionId: string, body: Record<string, unknown>) => void;
}) {
  if (items.length === 0) return null;
  const dotClass = tone === "bad" ? "bg-signal-bad" : tone === "ink" ? "bg-iris" : "bg-faint";
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} aria-hidden />
        <h3 className="text-[12.5px] font-semibold uppercase tracking-wide text-muted">
          {label} <span className="font-mono text-faint">({items.length})</span>
        </h3>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <QueueRow key={item.actionId} item={item} pending={pendingId === item.actionId} onAct={onAct} />
        ))}
      </div>
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

  // Phase 5C priority: Open Playbook dominates CALL/EMAIL sequence
  // actions; Run Audit dominates an unaudited prospect. Both still route
  // to the real, existing destination (the playbook or the prospect page
  // where the actual audit trigger lives) — this only makes the button's
  // own label say the true next step instead of a generic "Open Prospect".
  const primaryLabel = item.playbookChannel ? "Open Playbook" : item.actionType === "RUN_AUDIT" ? "Run Audit" : "Open Prospect";
  const primaryHref = item.playbookChannel
    ? `/prospects/${item.prospectId}/playbook?actionId=${item.actionId}${item.enrollmentId ? `&enrollmentId=${item.enrollmentId}` : ""}`
    : `/prospects/${item.prospectId}`;

  // OWNER-REVIEW CORRECTION (evidence contradiction): exactly ONE overall
  // readiness badge, via the same shared helper Prospect Detail and the
  // Playbook use -- never "Insufficient evidence" alongside "Verified
  // observation available." "Ready for verified-observation outreach" only
  // appears when a channel is REALLY activatable (item.verifiedChannel,
  // derived from real prospect_contact_verifications rows), never from the
  // looser playbookChannel routing hint.
  const overallBadge = item.opportunityLevel ? getOverallReadinessBadge(item.opportunityLevel, item.hasVerifiedObservation) : null;
  const showOutreachReady = item.hasVerifiedObservation && Boolean(item.verifiedChannel);

  // OWNER-REVIEW CORRECTION: the dominant sentence used to be the raw
  // stored sequence-step reason ("Sequence step due: VibeLabs Roofing —
  // Assessment to 15-Minute Call (v2, verified-channel): Call — Day 0 —
  // Personalized introduction (call opener). Objective: ..."). A concise,
  // human action reason replaces it for SEQUENCE_STEP rows specifically;
  // the complete original text always stays available, unabridged, inside
  // "Why this action?" below. Other action types (RUN_AUDIT, FOLLOW_UP,
  // REVIEW_REPLY, ...) already store a concise reason and are shown as-is.
  const conciseReason =
    item.actionType === "SEQUENCE_STEP" && item.playbookChannel
      ? item.playbookChannel === "CALL"
        ? item.hasVerifiedObservation
          ? "Call using the verified observation and ask permission to send the assessment."
          : "Call, introduce yourself, and ask permission to send a concise assessment."
        : item.hasVerifiedObservation
          ? "Email using the verified observation and ask permission to send the assessment."
          : "Email to introduce yourself and ask permission to send a concise assessment."
      : item.reason;

  return (
    <div className="rounded-panel border border-hairline bg-canvas/70 p-4 transition-colors hover:border-iris/30 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-ink">{item.businessName}</span>
            {overallBadge ? <Pill tone={overallBadge.tone} className="text-[11px]">{overallBadge.label}</Pill> : null}
            {showOutreachReady ? <Pill tone="good" className="text-[11px]">{OUTREACH_READY_NOTE}</Pill> : null}
            {overdue ? <Pill tone="bad" className="text-[11px]">Overdue</Pill> : null}
            <Pill tone={PRIORITY_TONE[item.priority]} className="text-[11px]">{item.priority} priority</Pill>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12.5px] text-faint">
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
            {item.verifiedChannel ? (
              <span className="inline-flex items-center gap-1 text-signal-good">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Verified {item.verifiedChannel === "CALL" ? "call" : "email"} channel
              </span>
            ) : null}
            {item.dueAt ? <span>Due {new Date(item.dueAt).toLocaleDateString()}</span> : null}
          </div>

          {/* One concise, human sentence dominates the row. The complete
              original reason (and any evidence summary) always lives inside
              "Why this action?" -- never trimmed out of existence, just no
              longer the dominant paragraph. */}
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink/85">
            <span className="font-semibold text-iris-soft">{item.actionLabel}: </span>
            {conciseReason}
          </p>
          <DisclosurePanel summary="Why this action?" className="mt-1.5">
            <p>{item.reason}</p>
            {item.evidenceSummary ? <p className="mt-1.5">{item.evidenceSummary}</p> : null}
          </DisclosurePanel>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={primaryHref}
            className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
          >
            {primaryLabel}
          </Link>
          <div className="relative flex items-center gap-1.5">
            <button
              onClick={() => onAct(item.actionId, { op: "complete" })}
              disabled={pending}
              className="focus-ring inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              {pending ? <InlineSpinner /> : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Mark done
                </>
              )}
            </button>
            <button
              onClick={() => setSnoozeOpen((v) => !v)}
              disabled={pending}
              aria-expanded={snoozeOpen}
              className="focus-ring inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Snooze
            </button>
            <button
              onClick={() => onAct(item.actionId, { op: "skip" })}
              disabled={pending}
              className="focus-ring inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-hairline bg-raised px-2.5 py-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <SkipForward className="h-3.5 w-3.5" aria-hidden />
              Skip
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
                    className="block w-full px-3 py-2 text-left text-[12.5px] text-muted hover:bg-raised hover:text-ink"
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
