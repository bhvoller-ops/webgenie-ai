import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Pill } from "@/components/ui";
import { ScoreBar } from "@/components/score-ring";
import { JOB_STAGE_LABELS, type ProjectSummary } from "@/lib/types";
import { BAND_TEXT_CLASS, cn, formatDate, hostOf, scoreBand } from "@/lib/format";

/**
 * Extracted from the old homepage (app/page.tsx) when the Dashboard moved
 * into /projects/new — see CLAUDE.md §2q. Unchanged otherwise.
 */
export function ProjectCard({ project }: { project: ProjectSummary }) {
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
