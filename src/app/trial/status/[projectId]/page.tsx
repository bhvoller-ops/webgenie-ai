"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface StatusResponse {
  stage: string;
  progress: number;
  status: string;
  ready: boolean;
  errorMessage?: string | null;
  technicalUrl?: string;
  plainUrl?: string;
  error?: string;
}

const STAGE_LABELS: Record<string, string> = {
  queued: "Queued",
  validating: "Validating the URL",
  capturing: "Capturing the live page",
  extracting: "Extracting content and structure",
  analyzing: "Running the 11 intelligence modules",
  scoring: "Scoring evidence",
  synthesizing: "Synthesizing findings",
  validating_output: "Validating the output",
  generating_blueprint: "Generating the rebuild blueprint",
  generating_prompt_package: "Generating the build-ready prompt",
  completed: "Done"
};

// Public — no login required to watch a trial's own progress or view its
// results once ready, same reasoning as the report pages themselves:
// project_id is an unguessable real UUID, and results need to be
// shareable without a Claude-account-style permission wall.
export default function TrialStatusPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [state, setState] = useState<StatusResponse | null>(null);
  const [pollError, setPollError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/trial/${projectId}/status`);
        const json: StatusResponse = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setPollError(json.error || "Unable to check trial status.");
          return;
        }
        setState(json);
        if (!json.ready) setTimeout(poll, 4000);
      } catch {
        if (!cancelled) setTimeout(poll, 6000);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <main className="min-h-screen bg-[#10151a] text-[#eceff1]">
      <div className="mx-auto max-w-lg px-6 py-24">
        <div className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#57c2b8]">Preflight — Free Trial</div>

        {pollError ? (
          <>
            <h1 className="mt-3 text-3xl font-bold">Something went wrong</h1>
            <p className="mt-4 text-[15px] text-[#e08672]">{pollError}</p>
          </>
        ) : !state ? (
          <>
            <h1 className="mt-3 text-3xl font-bold">Getting started…</h1>
            <p className="mt-4 text-[15px] text-[#9aa7ae]">Checking on your trial.</p>
          </>
        ) : state.ready ? (
          <>
            <h1 className="mt-3 text-3xl font-bold">Your audit is ready</h1>
            <p className="mt-4 text-[15px] text-[#9aa7ae]">Real, evidence-traced findings — a technical version and a plain-English version, ready to share.</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={state.technicalUrl ?? "#"}
                className="rounded-lg border border-[#2b3640] bg-[#181f26] px-5 py-3.5 text-center font-semibold text-[#eceff1] hover:border-[#57c2b8]/50"
              >
                View the technical report →
              </Link>
              <Link
                href={state.plainUrl ?? "#"}
                className="rounded-lg bg-[#57c2b8] px-5 py-3.5 text-center font-semibold text-[#0d3a36]"
              >
                View the plain-English report →
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-[#6d7a81]">Both links are public — share either one with anyone, no login required.</p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-bold">Running your audit…</h1>
            <p className="mt-4 text-[15px] text-[#9aa7ae]">{STAGE_LABELS[state.stage] ?? state.stage}. This usually takes a couple of minutes.</p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#1f2830]">
              <div className="h-2 rounded-full bg-[#57c2b8] transition-all" style={{ width: `${state.progress}%` }} />
            </div>
            {state.errorMessage ? <p className="mt-4 text-sm text-[#e08672]">{state.errorMessage}</p> : null}
          </>
        )}
      </div>
    </main>
  );
}
