import Link from "next/link";
import { ArrowRight, Clock, FileCode2, Layers, Radar, ScanLine } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, Eyebrow, Panel, Pill, SectionHeading, Stat } from "@/components/ui";
import { ScoreBar } from "@/components/score-ring";
import { getPortfolioStats, getProjects } from "@/lib/data/provider";
import { JOB_STAGE_LABELS, type ProjectSummary } from "@/lib/types";
import { BAND_TEXT_CLASS, cn, formatDate, hostOf, scoreBand } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projects, stats] = await Promise.all([getProjects(), getPortfolioStats()]);

  return (
    <PageShell>
      <Hero />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projects" value={stats.projectCount} hint="Across the workspace" />
        <Stat label="Runs in flight" value={stats.activeRuns} hint="Capture and analysis" tone="warn" />
        <Stat label="Mean score" value={stats.averageScore} hint="Weighted across 11 modules" />
        <Stat
          label="Critical findings"
          value={stats.criticalFindings}
          hint="Blocking conversion or performance"
          tone="bad"
        />
      </div>

      <div className="mt-16">
        <SectionHeading
          eyebrow="Workspace"
          title="Website intelligence projects"
          description="Every project holds a reference set, a scored intelligence artifact, an original rebuild blueprint, and an exportable prompt package."
          action={<Button href="/projects/new" variant="secondary">New project</Button>}
        />

        {projects.length ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-panel border border-dashed border-hairline p-10 text-center">
            <h3 className="text-lg font-semibold text-ink">Create your first project</h3>
            <p className="mt-2 text-sm text-muted">
              Start with a current website, competitor, benchmark, or inspiration URL.
            </p>
          </div>
        )}
      </div>

      <PipelineStrip />
    </PageShell>
  );
}

function Hero() {
  return (
    <Panel className="relative overflow-hidden" padded={false}>
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.35]"
        style={{ backgroundSize: "56px 56px", maskImage: "radial-gradient(700px 300px at 25% 0%, #000, transparent)" }}
        aria-hidden
      />
      <div className="relative px-6 py-14 sm:px-12 sm:py-20">
        <Eyebrow className="text-iris-soft">Digital presence intelligence</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-display-lg font-semibold">
          <span className="gradient-text">Turn any website into evidence,</span>
          <br />
          <span className="text-ink">a blueprint, and a build.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
          WebGenie captures a site and its reference set, scores it across eleven intelligence
          modules against traceable evidence, generates an original rebuild blueprint, and exports a
          production-ready prompt package for the builder of your choice.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/projects/new">
            Analyze a website
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {["11 scoring modules", "Evidence-traced findings", "9 export platforms", "Deterministic core"].map((f) => (
            <Pill key={f} tone="neutral">
              {f}
            </Pill>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const job = project.latestJob;
  const score = job?.overallScore;
  const isRunning = Boolean(job && job.status !== "completed" && job.status !== "failed");

  return (
    <Link
      href={`/projects/${project.id}`}
      className="focus-ring card group relative block overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-iris/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink">{project.name}</h3>
          <p className="mt-1 truncate font-mono text-[11px] text-faint">
            {project.primaryUrl ? hostOf(project.primaryUrl) : "No reference yet"}
          </p>
        </div>
        {typeof score === "number" ? (
          <div className="text-right">
            <div className={cn("font-mono text-3xl font-semibold tabular-nums", BAND_TEXT_CLASS[scoreBand(score)])}>
              {score}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-faint">score</div>
          </div>
        ) : (
          <Pill tone={isRunning ? "warn" : "neutral"}>
            {isRunning ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-signal-warn" aria-hidden />
                {JOB_STAGE_LABELS[job!.status]}
              </>
            ) : (
              "Not analyzed"
            )}
          </Pill>
        )}
      </div>

      {typeof score === "number" ? <ScoreBar score={score} className="mt-5" /> : null}

      <p className="mt-4 text-[13px] leading-relaxed text-muted">{project.primaryGoal}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Pill>{project.industry}</Pill>
        <Pill>{project.referenceCount} references</Pill>
        {project.deliverables.blueprint ? <Pill tone="iris">Blueprint</Pill> : null}
        {project.deliverables.promptPackage ? <Pill tone="neon">Prompt package</Pill> : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
          <Clock className="h-3 w-3" aria-hidden />
          Updated {formatDate(project.updatedAt)}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors group-hover:text-iris-soft">
          Open
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

const PIPELINE = [
  {
    icon: ScanLine,
    title: "Capture",
    body: "Headless capture of the current site plus competitors, benchmarks, and inspiration. Rendered DOM, computed styles, network waterfall, and full-page screenshots.",
  },
  {
    icon: Radar,
    title: "Score",
    body: "Eleven deterministic modules produce a score, a confidence figure, and a set of findings — each one tied back to the capture that produced it.",
  },
  {
    icon: Layers,
    title: "Blueprint",
    body: "An original sitemap, design token set, component library, and per-page section plan. Derived from the findings, never copied from the references.",
  },
  {
    icon: FileCode2,
    title: "Package",
    body: "A validated, platform-adapted prompt package that builds the blueprint in Claude Code, Cursor, v0, Lovable, Bolt, Framer, and more.",
  },
];

function PipelineStrip() {
  return (
    <div className="mt-20">
      <SectionHeading
        eyebrow="How it works"
        title="Four stages, one canonical artifact chain"
        description="Each stage emits a versioned JSON artifact. Human-readable reports and exports are derived views, so the data never drifts from the analysis."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PIPELINE.map((stage, i) => (
          <div key={stage.title} className="card relative overflow-hidden p-6">
            <span className="absolute right-5 top-5 font-mono text-4xl font-semibold leading-none text-hairline">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-iris/30 bg-iris/10">
              <stage.icon className="h-4 w-4 text-iris-soft" aria-hidden />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink">{stage.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{stage.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
