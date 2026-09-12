"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/shell";
import { PageHeader, LoadingSkeleton, DisclosurePanel } from "@/components/workspace";

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

  const funnel = data
    ? [
        { label: "Found", value: data.prospectsFound },
        { label: "Reviewed", value: data.prospectsReviewed },
        { label: "Audited", value: data.auditsCompleted },
        { label: "Contacted", value: data.outreachPerformed, note: "Human-recorded" },
        { label: "Meetings", value: data.meetingsLogged, note: "Human-recorded" },
        { label: "Won", value: data.won, tone: "good" as const },
      ]
    : [];

  return (
    <PageShell role="admin">
      <PageHeader title="Insights" description="Real counts of what's actually happened — never a fabricated pattern or a rate we can't verify." />

      {loading || !data ? (
        <div className="mt-6">
          <LoadingSkeleton rows={1} />
        </div>
      ) : data.isTestOrganization ? (
        <div className="mt-6 card p-8 text-center">
          <p className="text-[13.5px] text-muted">
            This is a test/sandbox organization — performance metrics are never computed for it, not just hidden. Real numbers require real production
            activity.
          </p>
        </div>
      ) : totalActivity === 0 ? (
        <div className="mt-6 card p-8 text-center">
          <p className="text-[13.5px] text-muted">Not enough activity yet to show anything meaningful. Find and work some prospects first.</p>
        </div>
      ) : (
        <>
          {/* The acquisition funnel is the primary structure -- a connected
              sequence, not ten unrelated equal-weight cards. */}
          <div className="mt-6 card p-5">
            <div className="label mb-4">Acquisition funnel</div>
            <ol className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
              {funnel.map((step, i) => (
                <li key={step.label} className="flex flex-1 items-center gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                    <div
                      className={`font-mono text-2xl font-semibold tabular-nums ${step.value === 0 ? "text-faint" : step.tone === "good" ? "text-signal-good" : "text-ink"}`}
                    >
                      {step.value}
                    </div>
                    <div className="sm:mt-0.5">
                      <div className="text-[12.5px] font-medium text-muted">{step.label}</div>
                      {step.note ? <div className="text-[11px] text-faint">{step.note}</div> : null}
                    </div>
                  </div>
                  {i < funnel.length - 1 ? (
                    <ArrowRight className="mx-1 hidden h-4 w-4 shrink-0 text-faint sm:block" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {/* Secondary metrics, compact table -- not equal-weight cards. */}
          <div className="mt-5 overflow-hidden rounded-panel border border-hairline">
            <table className="w-full text-left">
              <tbody>
                {[
                  { label: "Demos created", value: data.demosCreated },
                  { label: "Demo rooms shared", value: data.demoRoomsShared },
                  { label: "Follow-ups scheduled", value: data.followUpsScheduled },
                  { label: "Lost", value: data.lost, tone: "bad" as const },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-2.5 text-[13px] text-muted">{row.label}</td>
                    <td className={`px-4 py-2.5 text-right font-mono text-[13px] font-medium tabular-nums ${row.value === 0 ? "text-faint" : row.tone === "bad" ? "text-signal-bad" : "text-ink"}`}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 card p-5">
            <DisclosurePanel summary="How WebGenie calculates these numbers">
              <p className="mb-2">
                Every number above is a real structured-event or current-state count — never a parsed activity description, an estimate, or a fabricated
                pattern. What&rsquo;s deliberately not shown yet, and why:
              </p>
              <ul className="space-y-1.5">
                {data.deferredInsights.map((d) => (
                  <li key={d} className="text-[12.5px] leading-relaxed text-muted">
                    {d}
                  </li>
                ))}
              </ul>
            </DisclosurePanel>
          </div>
        </>
      )}
    </PageShell>
  );
}
