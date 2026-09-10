"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle, Loader2, Rocket } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill } from "@/components/ui";

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
        <div className="panel p-6 sm:p-10">
          <Pill tone="iris">
            <Rocket className="h-3 w-3" aria-hidden />
            Agency Launch Mode
          </Pill>
          <h1 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
            What should I do this week <span className="gradient-text">to start building my pipeline?</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">A short setup, then WebGenie&rsquo;s real Finder, Queue, and Sequences take over — nothing fake, no separate task list.</p>
        </div>

        <div className="mt-6 card max-w-xl space-y-3 p-6">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Target industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Roofing" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Target location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Denver, CO" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Your offer</label>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. $297/mo website package" className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-faint">Daily prospecting target</label>
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
    { label: "Target market chosen", done: Boolean(settings.targetIndustry && settings.targetLocation) },
    { label: `Prospects found (${insights?.prospectsFound ?? 0})`, done: (insights?.prospectsFound ?? 0) > 0 },
    { label: `Prospects reviewed (${insights?.prospectsReviewed ?? 0})`, done: (insights?.prospectsReviewed ?? 0) > 0 },
    { label: `Audits completed (${insights?.auditsCompleted ?? 0})`, done: (insights?.auditsCompleted ?? 0) > 0 },
    { label: `Demos ready (${insights?.demosCreated ?? 0})`, done: (insights?.demosCreated ?? 0) > 0 },
    { label: `Outreach performed (${insights?.outreachPerformed ?? 0})`, done: (insights?.outreachPerformed ?? 0) > 0 },
    { label: `Meetings (${insights?.meetingsLogged ?? 0})`, done: (insights?.meetingsLogged ?? 0) > 0 },
    { label: `Wins (${insights?.won ?? 0})`, done: (insights?.won ?? 0) > 0 }
  ];

  return (
    <PageShell role="admin">
      <div className="panel p-6 sm:p-10">
        <Pill tone="good">
          <Rocket className="h-3 w-3" aria-hidden />
          Your Launch Plan
        </Pill>
        <h1 className="mt-4 text-display-lg font-semibold text-ink">
          {settings.targetIndustry ?? "Your market"} · {settings.targetLocation ?? "Your area"}
        </h1>
        <p className="mt-2 text-[13px] text-muted">Offer: {settings.agencyOffer || "not set"} · Daily target: {settings.dailyProspectingTarget ?? "—"} prospects</p>
      </div>

      <div className="mt-6 card p-6">
        <div className="eyebrow mb-4">Real progress</div>
        <ul className="space-y-2.5">
          {milestones.map((m) => (
            <li key={m.label} className="flex items-center gap-2.5 text-[13px]">
              {m.done ? <Check className="h-4 w-4 text-signal-good" aria-hidden /> : <Circle className="h-4 w-4 text-faint" aria-hidden />}
              <span className={m.done ? "text-ink" : "text-muted"}>{m.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/finder" className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-muted hover:text-ink">
          Find prospects
        </Link>
        <Link
          href="/prospecting"
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)]"
        >
          You&rsquo;re live — go to your Daily Queue
        </Link>
      </div>
    </PageShell>
  );
}
