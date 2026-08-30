import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell";
import { addReference, generateContentPackageAction, generatePromptPackageAction, runOrchestrationAction, startAnalysis, createDeliveryAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPage } from "@/lib/auth/access";
import { platformProfiles } from "@/lib/prompts/platforms";
import { promptPlatforms } from "@/lib/prompts/types";
import { copyTones } from "@/lib/copy/types";
import { deliveryTargetProfiles } from "@/lib/delivery/adapters";
import { deliveryTargets } from "@/lib/delivery/types";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: references }, { data: jobs }, { data: blueprint }, { data: packages }, { data: contentPackages }, { data: orchestrationRuns }, { data: deliveryRuns }] = await Promise.all([
    supabase.from("projects").select("id,name,industry,primary_goal,primary_cta,status").eq("id", id).maybeSingle(),
    supabase.from("website_references").select("id,url,role,label,validation_status").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("analysis_jobs").select("id,status,progress,current_stage,error_message,created_at,analysis_outputs(overall_score,overall_confidence)").eq("project_id", id).order("created_at", { ascending: false }).limit(5),
    supabase.from("website_blueprints").select("id,status,blueprint,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("prompt_packages").select("id,target_platform,validation_status,token_estimate,created_at").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("content_packages").select("id,tone,provider,validation_status,created_at,content").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("orchestration_runs").select("id,status,overall_score,overall_confidence,blocking_findings,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("delivery_runs").select("id,target,status,file_count,total_bytes,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(10)
  ]);
  if (!project) notFound();
  const blueprintData = blueprint?.blueprint as any;
  const pages = blueprintData?.pages ?? [];

  return <PageShell role="admin"><div className="flex flex-col gap-8">
    <section><p className="text-sm uppercase tracking-[0.2em] text-slate-400">Production project</p><h1 className="mt-2 text-4xl font-semibold">{project.name}</h1><p className="mt-3 text-slate-400">{project.industry}</p></section>

    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Reference websites</h2>
      <form action={addReference} className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input type="hidden" name="projectId" value={project.id}/><input name="url" required className="rounded-lg px-3 py-2" placeholder="https://example.com"/>
        <select name="role" className="rounded-lg px-3 py-2"><option value="competitor">Competitor</option><option value="current_site">Current site</option><option value="inspiration">Inspiration</option><option value="benchmark">Benchmark</option></select>
        <button className="rounded-lg bg-white px-4 py-2 font-medium text-slate-950">Add reference</button>
      </form>
      <div className="mt-6 space-y-3">{references?.map((r)=><div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"><div><p>{r.label ?? r.url}</p><p className="text-sm text-slate-500">{r.url}</p></div><span className="rounded-full bg-slate-800 px-3 py-1 text-xs">{r.role.replace("_"," ")} · {r.validation_status}</span></div>)}</div>
    </section>

    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Intelligence pipeline</h2>
      <form action={startAnalysis}><input type="hidden" name="projectId" value={project.id}/><button disabled={!references?.length} className="mt-5 rounded-lg bg-indigo-400 px-4 py-2 font-medium text-slate-950 disabled:opacity-40">Run analysis and generate blueprint</button></form>
      <div className="mt-6 space-y-3">{jobs?.map((job:any)=>{const result=job.analysis_outputs?.[0];return <div key={job.id} className="rounded-xl border border-slate-800 p-4"><div className="flex justify-between text-sm"><span className="capitalize">{job.status.replace("_"," ")}</span><span>{result ? `Score ${result.overall_score}/100 · Confidence ${result.overall_confidence}% · ` : ""}{job.progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-indigo-400" style={{width:`${job.progress}%`}}/></div><p className="mt-2 text-xs text-slate-500">{job.current_stage ?? "queued"}</p><div className="mt-3"><a href={`/projects/${project.id}/reports/${job.id}`} className="text-xs font-medium text-indigo-300">Open full report →</a></div>{job.error_message?<p className="mt-2 text-xs text-amber-300">{job.error_message}</p>:null}</div>})}</div>
    </section>

    {blueprint ? <section className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Website blueprint</p><a href={`/projects/${project.id}/blueprint`} className="text-xs font-medium text-emerald-300">View full blueprint →</a></div>
      <h2 className="mt-2 text-2xl font-semibold">{pages.length} implementation-ready pages</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{pages.map((page:any)=><div key={page.id} className="rounded-xl border border-emerald-900/70 bg-slate-950/40 p-4"><div className="flex justify-between"><h3 className="font-semibold">{page.title}</h3><code className="text-xs text-emerald-300">{page.slug}</code></div><p className="mt-2 text-xs text-slate-400">{page.primaryGoal}</p><p className="mt-4 text-xs text-slate-500">{page.sections.length} sections</p></div>)}</div>
    </section>:null}


    {blueprint ? <section className="rounded-2xl border border-cyan-900 bg-cyan-950/20 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">AI Copywriter</p>
      <h2 className="mt-2 text-2xl font-semibold">Generate complete page content</h2>
      <p className="mt-2 text-sm text-slate-400">Creates headlines, body copy, CTAs, FAQs, SEO titles, meta descriptions, and brand-voice guidance for every blueprint page.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{copyTones.map((tone)=><form action={generateContentPackageAction} key={tone} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="blueprintId" value={blueprint.id}/><input type="hidden" name="tone" value={tone}/><h3 className="capitalize font-medium">{tone}</h3><p className="mt-2 text-xs text-slate-500">Generate a complete {tone} content package.</p><button className="mt-4 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950">Generate copy</button></form>)}</div>
      {contentPackages?.length ? <div className="mt-8 space-y-3"><h3 className="font-semibold">Generated content</h3>{contentPackages.map((pkg:any)=>{const pageCount=pkg.content?.pages?.length ?? 0;return <div key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3"><div><p className="capitalize font-medium">{pkg.tone} content package</p><p className="text-xs text-slate-500">{pageCount} pages · {pkg.provider} · {pkg.validation_status}</p></div><div className="flex gap-2"><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/content-packages/${pkg.id}/export?format=markdown`}>Markdown</a><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/content-packages/${pkg.id}/export?format=json`}>JSON</a><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/content-packages/${pkg.id}/export?format=yaml`}>YAML</a></div></div>})}</div>:null}
    </section>:null}

    {blueprint ? <section className="rounded-2xl border border-violet-900 bg-violet-950/20 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Prompt Intelligence Engine</p><h2 className="mt-2 text-2xl font-semibold">Generate platform-ready build packages</h2><p className="mt-2 text-sm text-slate-400">Each package includes master, UI, components, data, auth, API, SEO, AI Search, testing, and deployment prompts.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{promptPlatforms.map((platform)=><form action={generatePromptPackageAction} key={platform} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="blueprintId" value={blueprint.id}/><input type="hidden" name="platform" value={platform}/><h3 className="font-medium">{platformProfiles[platform].label}</h3><p className="mt-2 min-h-10 text-xs text-slate-500">{platformProfiles[platform].outputMode}</p><button className="mt-4 rounded-lg bg-violet-300 px-3 py-2 text-sm font-medium text-slate-950">Generate package</button></form>)}</div>
      {packages?.length ? <div className="mt-8 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Generated packages</h3><a href={`/projects/${project.id}/prompts`} className="text-xs font-medium text-violet-300">Browse in prompt explorer →</a></div>{packages.map((pkg)=><div key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3"><div><p className="font-medium">{platformProfiles[pkg.target_platform as keyof typeof platformProfiles]?.label ?? pkg.target_platform}</p><p className="text-xs text-slate-500">{pkg.validation_status} · approximately {pkg.token_estimate.toLocaleString()} tokens</p></div><div className="flex gap-2"><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/prompt-packages/${pkg.id}/export?format=markdown`}>Markdown</a><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/prompt-packages/${pkg.id}/export?format=json`}>JSON</a><a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={`/api/prompt-packages/${pkg.id}/export?format=yaml`}>YAML</a></div></div>)}</div>:null}
    </section>:null}

    {blueprint ? <section className="rounded-2xl border border-fuchsia-900 bg-fuchsia-950/20 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-300">Multi-Agent Orchestrator</p>
      <h2 className="mt-2 text-2xl font-semibold">Review and approve the production handoff</h2>
      <p className="mt-2 text-sm text-slate-400">Strategy, conversion, brand, SEO, accessibility, technical, copy, and prompt agents review the selected artifacts and create a prioritized revision plan.</p>
      <form action={runOrchestrationAction} className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="blueprintId" value={blueprint.id}/>
        <select name="contentPackageId" className="rounded-lg px-3 py-2 text-slate-950"><option value="">No content package</option>{contentPackages?.map((pkg:any)=><option key={pkg.id} value={pkg.id}>{pkg.tone} · {pkg.validation_status}</option>)}</select>
        <select name="promptPackageId" className="rounded-lg px-3 py-2 text-slate-950"><option value="">No prompt package</option>{packages?.map((pkg:any)=><option key={pkg.id} value={pkg.id}>{platformProfiles[pkg.target_platform as keyof typeof platformProfiles]?.label ?? pkg.target_platform} · {pkg.validation_status}</option>)}</select>
        <button className="rounded-lg bg-fuchsia-300 px-4 py-2 font-medium text-slate-950">Run specialist review</button>
      </form>
      {orchestrationRuns?.length ? <div className="mt-8 space-y-3"><h3 className="font-semibold">Review history</h3>{orchestrationRuns.map((run:any)=><a key={run.id} href={`/projects/${project.id}/orchestration/${run.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3 hover:border-fuchsia-700"><div><p className="capitalize font-medium">{run.status.replace("_", " ")}</p><p className="text-xs text-slate-500">Score {run.overall_score ?? "—"}/100 · Confidence {run.overall_confidence ?? "—"}%</p></div><span className="text-xs text-fuchsia-300">{run.blocking_findings} blocking findings →</span></a>)}</div>:null}
    </section>:null}


    {blueprint ? <section className="rounded-2xl border border-sky-900 bg-sky-950/20 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Builder delivery</p>
      <h2 className="mt-2 text-2xl font-semibold">Create the implementation handoff</h2>
      <p className="mt-2 text-sm text-slate-400">Bundle the blueprint, content, prompts, specialist review, deployment configuration, and release checklist into one traceable package.</p>
      <form action={createDeliveryAction} className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="blueprintId" value={blueprint.id}/>
        <select name="target" className="rounded-lg px-3 py-2 text-slate-950">{deliveryTargets.map((target)=><option key={target} value={target}>{deliveryTargetProfiles[target].label}</option>)}</select>
        <select name="contentPackageId" className="rounded-lg px-3 py-2 text-slate-950"><option value="">No content package</option>{contentPackages?.map((pkg:any)=><option key={pkg.id} value={pkg.id}>{pkg.tone} content</option>)}</select>
        <select name="promptPackageId" className="rounded-lg px-3 py-2 text-slate-950"><option value="">No prompt package</option>{packages?.map((pkg:any)=><option key={pkg.id} value={pkg.id}>{platformProfiles[pkg.target_platform as keyof typeof platformProfiles]?.label ?? pkg.target_platform}</option>)}</select>
        <select name="orchestrationRunId" className="rounded-lg px-3 py-2 text-slate-950"><option value="">No specialist review</option>{orchestrationRuns?.map((run:any)=><option key={run.id} value={run.id}>{run.status} · {run.overall_score ?? "—"}/100</option>)}</select>
        <button className="rounded-lg bg-sky-300 px-4 py-2 font-medium text-slate-950 md:col-span-2 lg:col-span-4">Generate delivery package</button>
      </form>
      {deliveryRuns?.length ? <div className="mt-8 space-y-3"><h3 className="font-semibold">Delivery history</h3>{deliveryRuns.map((run:any)=><a key={run.id} href={`/projects/${project.id}/delivery/${run.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3 hover:border-sky-700"><div><p className="font-medium">{deliveryTargetProfiles[run.target as keyof typeof deliveryTargetProfiles]?.label ?? run.target}</p><p className="text-xs text-slate-500">{run.file_count} files · {Math.ceil(Number(run.total_bytes)/1024)} KB</p></div><span className="capitalize text-xs text-sky-300">{run.status} →</span></a>)}</div>:null}
    </section>:null}

  </div></PageShell>;
}
