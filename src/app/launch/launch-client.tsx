"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle, Loader2, Rocket } from "lucide-react";
import { PageShell } from "@/components/shell";
import { PageHeader } from "@/components/workspace";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/format";

interface Settings {
  targetIndustry: string | null;
  targetLocation: string | null;
  agencyOffer: string | null;
  dailyProspectingTarget: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface Insights {
  prospectsFound: number;
  prospectsReviewed: number;
  auditsCompleted: number;
  demosCreated: number;
  outreachPerformed: number;
  meetingsLogged: number;
  won: number;
}

/**
 * P2 Agency Launch Mode (master prompt Architecture Decision 11) --
 * orchestration only. Every progress figure below is fetched live from
 * real prospects/prospect_activities (via the same /api/insights the
 * Insights page uses) -- nothing here is a fabricated percentage or a
 * separate task system. See lib/prospect/insights.ts.
 */
export function LaunchClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [offer, setOffer] = useState("");
  const [dailyTarget, setDailyTarget] = useState("10");

  async function load() {
    setLoading(true);
    try {
      const [settingsRes, insightsRes] = await Promise.all([fetch("/api/launch-settings"), fetch("/api/insights")]);
      const settingsJson = await settingsRes.json();
      const insightsJson = await insightsRes.json();
      setSettings(settingsJson.settings ?? null);
      setInsights(insightsJson);
      if (settingsJson.settings) {
        setIndustry(settingsJson.settings.targetIndustry ?? "");
        setLocation(settingsJson.settings.targetLocation ?? "");
        setOffer(settingsJson.settings.agencyOffer ?? "");
        setDailyTarget(settingsJson.settings.dailyProspectingTarget ? String(settingsJson.settings.dailyProspectingTarget) : "10");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function start() {
    setSaving(true);
    try {
      const res = await fetch("/api/launch-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetIndustry: industry || null,
          targetLocation: location || null,
          agencyOffer: offer || null,
          dailyProspectingTarget: dailyTarget ? Number(dailyTarget) : null,
          start: true
        })
      });
      const json = await res.json();
      setSettings(json.settings);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell role="admin">
        <div className="mt-10 flex justify-center py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      </PageShell>
    );
  }

  if (!settings?.startedAt) {
    return (
      <PageShell role="admin">
        <PageHeader
          title="Launch Mode"
          description="A short setup, then WebGenie's real Finder, Queue, and Sequences take over — nothing fake, no separate task list."
        />

        <div className="mt-5 card max-w-xl space-y-3 p-6">
          <div>
            <label className="label mb-1.5 block">Target industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Roofing" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="label mb-1.5 block">Target location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Denver, CO" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="label mb-1.5 block">Your offer</label>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. $297/mo website package" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="label mb-1.5 block">Daily prospecting target</label>
            <input value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)} type="number" min={1} className="focus-ring w-32 rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <button
            onClick={start}
            disabled={saving}
            className="focus-ring mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
            Start My Launch
          </button>
        </div>
      </PageShell>
    );
  }

  const milestones = [
    { key: "market", label: "Market selected", done: Boolean(settings.targetIndustry && settings.targetLocation), count: null },
    { key: "found", label: "Prospects found", done: (insights?.prospectsFound ?? 0) > 0, count: insights?.prospectsFound ?? 0 },
    { key: "reviewed", label: "Reviewed", done: (insights?.prospectsReviewed ?? 0) > 0, count: insights?.prospectsReviewed ?? 0 },
    { key: "audited", label: "Audited", done: (insights?.auditsCompleted ?? 0) > 0, count: insights?.auditsCompleted ?? 0 },
    { key: "outreach", label: "Outreach performed", done: (insights?.outreachPerformed ?? 0) > 0, count: insights?.outreachPerformed ?? 0 },
    { key: "meetings", label: "Meetings", done: (insights?.meetingsLogged ?? 0) > 0, count: insights?.meetingsLogged ?? 0 },
    { key: "wins", label: "Wins", done: (insights?.won ?? 0) > 0, count: insights?.won ?? 0 }
  ];
  // The current bottleneck -- the first not-yet-real step in the funnel.
  const bottleneck = milestones.find((m) => !m.done);
  const recommendPlaybook = bottleneck && (bottleneck.key === "market" || bottleneck.key === "found" || bottleneck.key === "reviewed");

  return (
    <PageShell role="admin">
      <PageHeader
        title={`${settings.targetIndustry ?? "Your market"} · ${settings.targetLocation ?? "Your area"}`}
        context={
          <span className="text-[13px] text-muted">
            Offer: {settings.agencyOffer || "not set"} · Daily target: {settings.dailyProspectingTarget ?? "—"} prospects
          </span>
        }
        primaryAction={
          recommendPlaybook ? (
            <Link href="/finder" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)]">
              Find Prospects
            </Link>
          ) : (
            <Link href="/prospecting" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)]">
              Go to Daily Queue
            </Link>
          )
        }
        secondaryAction={
          <Link href={recommendPlaybook ? "/prospecting" : "/finder"} className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-muted hover:text-ink">
            {recommendPlaybook ? "Daily Queue" : "Find more prospects"}
          </Link>
        }
      />

      <div className="mt-6 card p-5">
        <div className="label mb-4 flex items-center justify-between">
          Real progress
          {bottleneck ? <Pill tone="warn">Bottleneck: {bottleneck.label}</Pill> : <Pill tone="good">Full funnel active</Pill>}
        </div>
        {/* Compact horizontal funnel -- wraps to a vertical list on narrow screens. */}
        <ol className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
          {milestones.map((m, i) => (
            <li key={m.key} className="flex flex-1 items-center gap-2.5 sm:flex-col sm:items-stretch sm:gap-1.5">
              <div className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:gap-1.5 sm:text-center">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                    m.done ? "border-signal-good/40 bg-signal-good/15 text-signal-good" : m === bottleneck ? "border-signal-warn/50 bg-signal-warn/15 text-signal-warn" : "border-hairline bg-raised text-faint"
                  )}
                >
                  {m.done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
                </span>
                <div className="sm:mt-1">
                  <div className={cn("text-[12.5px] font-medium leading-tight", m.done ? "text-ink" : "text-muted")}>{m.label}</div>
                  {m.count !== null ? <div className="font-mono text-[11.5px] text-faint">{m.count}</div> : null}
                </div>
              </div>
              {i < milestones.length - 1 ? <div className="ml-3.5 mt-1 h-4 w-px bg-hairline sm:ml-0 sm:mt-3.5 sm:h-px sm:w-full sm:flex-1" aria-hidden /> : null}
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
