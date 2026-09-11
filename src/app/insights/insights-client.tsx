"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill } from "@/components/ui";

interface InsightsData {
  prospectsFound: number;
  prospectsReviewed: number;
  auditsCompleted: number;
  demosCreated: number;
  demoRoomsShared: number;
  outreachPerformed: number;
  followUpsScheduled: number;
  meetingsLogged: number;
  won: number;
  lost: number;
  isTestOrganization: boolean;
  deferredInsights: string[];
}

/**
 * P2 Trustworthy Insights (master prompt Architecture Decision 13). Every
 * number is a real structured-event or current-state count — see
 * lib/prospect/insights.ts and /api/insights. Deliberately no "AI
 * insights," no comparative claims, no predictive scoring: those are all
 * named explicitly in `deferredInsights` and why, rather than silently
 * absent.
 */
export function InsightsClient() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/insights");
      setData(await res.json());
      setLoading(false);
    })();
  }, []);

  const totalActivity = data ? data.prospectsFound + data.outreachPerformed + data.meetingsLogged : 0;

  return (
    <PageShell role="admin">
      <div className="panel p-6 sm:p-10">
        <Pill tone="iris">
          <BarChart3 className="h-3 w-3" aria-hidden />
          Insights
        </Pill>
        <h1 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
          Is this process <span className="gradient-text">actually working?</span>
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">Real counts of what&rsquo;s actually happened — never a fabricated pattern or a rate we can&rsquo;t verify.</p>
      </div>

      {loading || !data ? (
        <div className="mt-8 flex justify-center py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : data.isTestOrganization ? (
        <div className="mt-8 card p-8 text-center">
          <p className="text-[13px] text-faint">
            This is a test/sandbox organization — performance metrics are never computed for it, not just hidden. Real numbers require real production
            activity.
          </p>
        </div>
      ) : totalActivity === 0 ? (
        <div className="mt-8 card p-8 text-center">
          <p className="text-[13px] text-faint">Not enough activity yet to show anything meaningful. Find and work some prospects first.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Prospects Found" value={data.prospectsFound} />
            <Metric label="Prospects Reviewed" value={data.prospectsReviewed} />
            <Metric label="Audits Completed" value={data.auditsCompleted} />
            <Metric label="Demos Created" value={data.demosCreated} />
            <Metric label="Demo Rooms Shared" value={data.demoRoomsShared} />
            <Metric label="Outreach Performed" value={data.outreachPerformed} note="Human-recorded" />
            <Metric label="Follow-ups" value={data.followUpsScheduled} />
            <Metric label="Meetings" value={data.meetingsLogged} note="Human-recorded" />
            <Metric label="Won" value={data.won} tone="good" />
            <Metric label="Lost" value={data.lost} tone="bad" />
          </div>

          <div className="mt-8 card p-6">
            <div className="eyebrow mb-3">Not shown yet — on purpose</div>
            <ul className="space-y-2">
              {data.deferredInsights.map((d) => (
                <li key={d} className="text-[12.5px] leading-relaxed text-faint">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </PageShell>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: number; note?: string; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-signal-good" : tone === "bad" ? "text-signal-bad" : "text-ink";
  return (
    <div className="card p-4">
      <div className="eyebrow text-[10px]">{label}</div>
      <div className={`mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight ${color}`}>{value}</div>
      {note ? <p className="mt-1 text-[10.5px] text-faint">{note}</p> : null}
    </div>
  );
}
