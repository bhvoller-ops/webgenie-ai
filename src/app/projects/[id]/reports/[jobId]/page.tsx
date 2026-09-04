import { notFound } from "next/navigation";
import { AlertTriangle, CircleSlash, Eye, FileDown, Layers } from "lucide-react";
import { Breadcrumbs, PageShell } from "@/components/shell";
import { Button, Eyebrow, MetaRow, Panel, Pill, SectionHeading } from "@/components/ui";
import { ScoreRing } from "@/components/score-ring";
import { ModuleCard } from "@/components/module-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { Tabs } from "@/components/tabs";
import { EvidenceList } from "@/components/evidence";
import { getIntelligence, getProject } from "@/lib/data/provider";
import { requireAdminPage } from "@/lib/auth/access";
import {
  MODULE_LABELS,
  MODULE_ORDER,
  PRIORITY_ORDER,
  type ModuleScore,
  type Recommendation,
} from "@/lib/intelligence/types";
import {
  BAND_LABEL,
  BAND_TEXT_CLASS,
  cn,
  formatDateTime,
  pct,
  scoreBand,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string; jobId: string }>;
}) {
  await requireAdminPage();
  const { id, jobId } = await params;
  const [project, intelligence] = await Promise.all([
    getProject(id),
    getIntelligence(id, jobId),
  ]);
  if (!project || !intelligence) notFound();

  const ordered = [...intelligence.moduleScores].sort(
    (a, b) => MODULE_ORDER.indexOf(a.module) - MODULE_ORDER.indexOf(b.module)
  );
  const byScore = [...intelligence.moduleScores].sort((a, b) => a.score - b.score);
  const allFindings = intelligence.moduleScores
    .flatMap((m) => m.recommendations)
    .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));

  const criticalCount = allFindings.filter((r) => r.priority === "critical").length;

  return (
    <PageShell role="admin">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/" },
          { label: project.name, href: `/projects/${id}` },
          { label: "Intelligence report" },
        ]}
      />

      <Panel className="mt-6 overflow-hidden" padded={false}>
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Eyebrow className="text-iris-soft">Website Intelligence · schema v{intelligence.schemaVersion}</Eyebrow>
            <h1 className="mt-4 max-w-xl text-display-md font-semibold text-ink">
              {project.name} scores{" "}
              <span className={BAND_TEXT_CLASS[scoreBand(intelligence.overallScore)]}>
                {intelligence.overallScore}
              </span>{" "}
              across eleven modules
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              {criticalCount} critical findings block the stated goal —{" "}
              <span className="text-ink">{project.primaryGoal.toLowerCase()}</span>. The lowest module is{" "}
              <span className="text-ink">{MODULE_LABELS[byScore[0].module]}</span> at {byScore[0].score}
              {intelligence.topRecommendations[0] ? (
                <>
                  , and the highest-leverage single fix is a{" "}
                  {intelligence.topRecommendations[0].module.replace("_", " ")} change.
                </>
              ) : (
                "."
              )}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={`/projects/${id}/blueprint`}>
                <Layers className="h-4 w-4" aria-hidden />
                View rebuild blueprint
              </Button>
              <Button href={`/projects/${id}/prompts`} variant="secondary">
                <FileDown className="h-4 w-4" aria-hidden />
                Export prompt package
              </Button>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <ScoreRing
              score={intelligence.overallScore}
              size={230}
              label="Overall intelligence"
              sublabel={`Confidence ${pct(intelligence.overallConfidence)} · ${formatDateTime(intelligence.generatedAt)}`}
            />
          </div>
        </div>

        <div className="border-t border-hairline">
          <MetaRow
            items={[
              { label: "Job", value: jobId },
              {
                label: "Captures analyzed",
                value: `${intelligence.sourceSummary.capturesAnalyzed}`,
              },
              {
                label: "References",
                value: `${intelligence.sourceSummary.referencesAttempted} attempted · ${intelligence.sourceSummary.referencesFailed} failed`,
              },
              {
                label: "Visual model",
                value: intelligence.visualSummary
                  ? `${intelligence.visualSummary.model} · ${intelligence.visualSummary.score}`
                  : "not run",
              },
            ]}
          />
        </div>
      </Panel>

      {intelligence.footInTheDoor && intelligence.footInTheDoor.length > 0 ? (
        <Panel className="mt-8 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <CircleSlash className="h-4 w-4 text-signal-bad" aria-hidden />
            <Eyebrow className="text-signal-bad">Foot in the door · say this on the call</Eyebrow>
          </div>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Every item below is something you can show the owner in their own browser in ten
            seconds. Nothing here is a guess.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {intelligence.footInTheDoor.map((item) => (
              <div key={item.id} className="rounded-panel border border-hairline bg-surface/60 p-4">
                <div className="text-sm font-semibold text-ink">{item.label}</div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-faint">{item.detail}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink">&ldquo;{item.pitch}&rdquo;</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="mt-14">
        <Tabs
          items={[
            {
              id: "priorities",
              label: "Priorities",
              badge: intelligence.topRecommendations.length,
              content: (
                <PrioritiesTab
                  findings={intelligence.topRecommendations}
                  weakest={byScore.slice(0, 4)}
                />
              ),
            },
            {
              id: "modules",
              label: "Modules",
              badge: ordered.length,
              content: (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {ordered.map((m) => (
                    <ModuleCard key={m.module} moduleScore={m} />
                  ))}
                </div>
              ),
            },
            {
              id: "findings",
              label: "All findings",
              badge: allFindings.length,
              content: (
                <div className="space-y-3">
                  {allFindings.map((r, i) => (
                    <RecommendationCard key={r.id} recommendation={r} index={i} />
                  ))}
                </div>
              ),
            },
            {
              id: "evidence",
              label: "Evidence",
              content: <EvidenceTab modules={ordered} />,
            },
          ]}
        />
      </div>
    </PageShell>
  );
}

function PrioritiesTab({
  findings,
  weakest,
}: {
  findings: Recommendation[];
  weakest: ModuleScore[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <div>
        <SectionHeading
          title="Highest-leverage findings"
          description="Ranked by impact on the project's stated goal, weighted by confidence and effort."
        />
        <div className="mt-6 space-y-3">
          {findings.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="card p-5">
          <div className="eyebrow mb-4 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-signal-warn" aria-hidden />
            Weakest modules
          </div>
          <ul className="space-y-3.5">
            {weakest.map((m) => {
              const band = scoreBand(m.score);
              return (
                <li key={m.module} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink">{MODULE_LABELS[m.module]}</div>
                    <div className="text-[11px] text-faint">{BAND_LABEL[band]}</div>
                  </div>
                  <span className={cn("font-mono text-lg font-semibold tabular-nums", BAND_TEXT_CLASS[band])}>
                    {m.score}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <div className="eyebrow mb-3 flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-neon" aria-hidden />
            Reading this report
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            Every finding carries the captures that produced it. Expand a card to see the source URL,
            the signal type, and the weight that signal carried in the score. Nothing here is a
            model opinion without an artifact behind it.
          </p>
        </div>
      </div>
    </div>
  );
}

function EvidenceTab({ modules }: { modules: ModuleScore[] }) {
  return (
    <div className="space-y-6">
      {modules.map((m) => (
        <div key={m.module} className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">{MODULE_LABELS[m.module]}</h3>
            <Pill>{m.evidence.length} captures</Pill>
          </div>
          <EvidenceList items={m.evidence} />
        </div>
      ))}
    </div>
  );
}
