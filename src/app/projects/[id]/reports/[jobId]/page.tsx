import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";

export const dynamic = "force-dynamic";

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Developing";
  return "Priority improvement";
}

export default async function AnalysisReportPage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: job }, { data: visualResults }, { data: captures }] = await Promise.all([
    supabase.from("projects").select("id,name,industry").eq("id", id).maybeSingle(),
    supabase.from("analysis_jobs").select("id,status,created_at,completed_at,analysis_outputs(output)").eq("id", jobId).eq("project_id", id).maybeSingle(),
    supabase.from("visual_analysis_results").select("id,provider,model,overall_score,overall_confidence,result,page_capture_id").eq("analysis_job_id", jobId),
    supabase.from("page_captures").select("id,source_url,title,screenshot_path,status_code").eq("analysis_job_id", jobId)
  ]);
  if (!project || !job) notFound();
  const row = Array.isArray(job.analysis_outputs) ? job.analysis_outputs[0] : job.analysis_outputs;
  const report = row?.output as WebsiteIntelligenceOutput & { visualSummary?: any };
  if (!report) notFound();

  return <PageShell><div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><Link href={`/projects/${id}`} className="text-sm text-indigo-300">← Back to project</Link><p className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-400">Website intelligence report</p><h1 className="mt-2 text-4xl font-semibold">{project.name}</h1><p className="mt-2 text-slate-400">{project.industry} · {new Date(job.created_at).toLocaleDateString("en-US")}</p></div>
      <div className="rounded-2xl border border-indigo-900 bg-indigo-950/40 px-6 py-5 text-center"><p className="text-5xl font-semibold">{report.overallScore}</p><p className="mt-1 text-sm text-indigo-200">{scoreLabel(report.overallScore)} · {report.overallConfidence}% confidence</p></div>
    </header>

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Pages analyzed</p><p className="mt-2 text-3xl font-semibold">{report.sourceSummary.capturesAnalyzed}</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Visual score</p><p className="mt-2 text-3xl font-semibold">{report.visualSummary?.score ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{report.visualSummary?.provider ?? "No visual provider"}</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Recommendations</p><p className="mt-2 text-3xl font-semibold">{report.topRecommendations.length}</p></div>
    </section>

    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-2xl font-semibold">Intelligence scorecard</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{report.moduleScores.map((module)=><article key={module.module} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><div className="flex items-center justify-between"><h3 className="font-medium capitalize">{module.module.replace("_", " ")}</h3><span className="text-lg font-semibold">{module.score}</span></div><div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-indigo-400" style={{width:`${module.score}%`}}/></div><p className="mt-2 text-xs text-slate-500">Confidence {module.confidence}%</p>{module.weaknesses[0]?<p className="mt-3 text-sm text-slate-300">{module.weaknesses[0]}</p>:null}</article>)}</div></section>

    <section className="rounded-2xl border border-amber-900 bg-amber-950/20 p-6"><h2 className="text-2xl font-semibold">Priority actions</h2><div className="mt-6 space-y-4">{report.topRecommendations.map((item, index)=><article key={item.id} className="rounded-xl border border-amber-900/60 bg-slate-950/50 p-5"><div className="flex flex-wrap items-center gap-3"><span className="text-sm text-slate-500">#{index+1}</span><span className="rounded-full bg-amber-900 px-2 py-1 text-[10px] uppercase">{item.priority}</span><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase">{item.module.replace("_", " ")}</span><h3 className="font-semibold">{item.title}</h3></div><p className="mt-3 text-sm text-slate-400">{item.rationale}</p><p className="mt-3 text-sm"><strong>Action:</strong> {item.action}</p></article>)}</div></section>

    {visualResults?.length ? <section className="rounded-2xl border border-violet-900 bg-violet-950/20 p-6"><h2 className="text-2xl font-semibold">Visual intelligence</h2><p className="mt-2 text-sm text-slate-400">Screenshot-level analysis across hierarchy, typography, spacing, color, consistency, credibility, and mobile readiness.</p><div className="mt-6 space-y-5">{visualResults.map((visual:any)=>{const capture=captures?.find((item)=>item.id===visual.page_capture_id);return <article key={visual.id} className="rounded-xl border border-violet-900/60 bg-slate-950/50 p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{capture?.title ?? capture?.source_url ?? "Captured page"}</h3><p className="text-xs text-slate-500">{visual.provider} · {visual.model}</p></div><p className="text-xl font-semibold">{visual.overall_score} <span className="text-xs font-normal text-slate-500">({visual.overall_confidence}% confidence)</span></p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(visual.result.metrics).map(([key,value]:any)=><div key={key} className="rounded-lg bg-slate-900 p-3"><div className="flex justify-between"><span className="text-xs capitalize text-slate-400">{key.replace(/([A-Z])/g," $1")}</span><span className="text-sm font-semibold">{value.score}</span></div><p className="mt-2 text-xs text-slate-500">{value.summary}</p></div>)}</div></article>})}</div></section>:null}
  </div></PageShell>;
}
