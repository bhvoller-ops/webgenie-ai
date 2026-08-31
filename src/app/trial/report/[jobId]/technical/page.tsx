import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import { MODULE_LABELS, MODULE_ORDER } from "@/lib/intelligence/types";
import { scoreBand } from "@/lib/intelligence/plain-english";

export const dynamic = "force-dynamic";

// Public — no login. project_id/job_id are real UUIDs, unguessable, same
// trust model as /pay/[callLogId]. This is the technical counterpart to
// /trial/report/[jobId]/plain — real data, not the hand-authored sample
// this page's design was validated against (see the "Preflight" artifact).
export default async function TrialTechnicalReport({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const admin = createAdminClient();

  const { data: job } = await admin.from("analysis_jobs").select("id,project_id,created_at").eq("id", jobId).maybeSingle();
  if (!job) notFound();

  const [{ data: project }, { data: reference }, { data: outputRow }, { data: blueprint }] = await Promise.all([
    admin.from("projects").select("name,is_trial").eq("id", job.project_id).maybeSingle(),
    admin.from("website_references").select("url").eq("project_id", job.project_id).order("priority", { ascending: true }).limit(1).maybeSingle(),
    admin.from("analysis_outputs").select("output,overall_score,overall_confidence").eq("analysis_job_id", jobId).maybeSingle(),
    admin.from("website_blueprints").select("id,blueprint").eq("analysis_job_id", jobId).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (!project?.is_trial || !outputRow) notFound();

  const output = outputRow.output as WebsiteIntelligenceOutput;
  const bp = blueprint?.blueprint as
    | { pages?: Array<{ title: string; slug: string; sections?: unknown[] }>; designTokens?: { colorRoles?: Record<string, string>; typography?: { scale?: string[] } } }
    | undefined;

  const { data: promptPackage } = blueprint
    ? await admin.from("prompt_packages").select("target_platform,prompt_markdown,token_estimate,validation_status").eq("blueprint_id", blueprint.id).limit(1).maybeSingle()
    : { data: null };

  const overallBand = scoreBand(output.overallScore);
  const bandBorder = { good: "border-emerald-500", warn: "border-amber-500", bad: "border-rose-500" }[overallBand];

  const modules = MODULE_ORDER.map((name) => output.moduleScores.find((m) => m.module === name)).filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <main className="min-h-screen bg-[#10151a] text-[#eceff1]">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex flex-wrap items-center gap-9 border-b border-[#2b3640] pb-9">
          <div className="min-w-[260px] flex-1">
            <div className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#57c2b8]">Preflight — Trial Report</div>
            <h1 className="mt-2.5 text-[34px] font-bold leading-tight tracking-tight sm:text-[42px]">{project.name}</h1>
            <div className="mt-2 text-[15px] text-[#9aa7ae]">
              Audited at <span className="font-mono text-[#eceff1]">{reference?.url ?? "—"}</span>
            </div>
          </div>
          <div className="flex flex-none flex-col items-center gap-1.5">
            <div className={`grid h-[110px] w-[110px] place-items-center rounded-full border-[3px] bg-[#181f26] ${bandBorder}`}>
              <div className="text-center">
                <div className="font-mono text-3xl font-bold leading-none">{output.overallScore}</div>
                <div className="text-[11px] text-[#6d7a81]">/100</div>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#6d7a81]">Overall score</div>
          </div>
        </div>

        <div className="mt-5 rounded-[10px] border border-[#2b3640] bg-[#181f26] px-4.5 py-3.5 text-[13.5px] text-[#9aa7ae]">
          Confidence on this run: <span className="font-mono text-[#eceff1]">{output.overallConfidence}%</span> — every score below ships
          with the evidence that produced it. That&apos;s the honest number, not a marketing one.
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold">Eleven modules, each one traceable</h2>
          <p className="mt-2 max-w-[62ch] text-[15px] text-[#9aa7ae]">
            Not a single composite grade — eleven independent scores, each tied back to the specific markup, copy, or structural signal that
            produced it.
          </p>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {modules.map((m) => {
              const band = scoreBand(m.score);
              const color = { good: "text-emerald-500", warn: "text-amber-500", bad: "text-rose-500" }[band];
              const strip = { good: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-rose-500" }[band];
              return (
                <div key={m.module} className="rounded-xl border border-[#2b3640] bg-[#181f26] px-[18px] py-4">
                  <div className="flex items-baseline justify-between gap-2.5">
                    <span className="text-[14.5px] font-semibold">{MODULE_LABELS[m.module]}</span>
                    <span className={`font-mono text-[22px] font-bold ${color}`}>{m.score}</span>
                  </div>
                  <div className="mt-2 text-[12.5px] leading-relaxed text-[#6d7a81]">{m.evidence[0]?.detail ?? "—"}</div>
                  <div className={`mt-3 h-[3px] rounded ${strip}`} />
                </div>
              );
            })}
          </div>
        </section>

        {output.footInTheDoor && output.footInTheDoor.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">What the pitch opens with</h2>
            <p className="mt-2 max-w-[62ch] text-[15px] text-[#9aa7ae]">Written in the visitor&apos;s language, not audit jargon.</p>
            <div className="mt-5 flex flex-col gap-2.5">
              {output.footInTheDoor.map((f, i) => (
                <div key={f.id} className="flex gap-3.5 rounded-[10px] border border-[#2b3640] border-l-[3px] border-l-[#57c2b8] bg-[#181f26] px-4.5 py-4">
                  <div className="grid h-6.5 w-6.5 flex-none place-items-center rounded-full bg-[#1f2830] font-mono text-[13px] font-bold text-[#57c2b8]">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-[14.5px] font-semibold">{f.label}</div>
                    <div className="mt-1 text-[14px] text-[#9aa7ae]">{f.pitch}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {bp?.pages ? (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">The rebuild blueprint</h2>
            <p className="mt-2 max-w-[62ch] text-[15px] text-[#9aa7ae]">
              An original sitemap and design token set — derived from the findings above, not copied from the source site.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {bp.pages.map((p) => (
                <div key={p.slug} className="grid grid-cols-[140px_1fr_auto] items-center gap-3.5 rounded-[9px] border border-[#2b3640] bg-[#181f26] px-4 py-3 text-[13.5px]">
                  <span className="font-mono text-[#57c2b8]">{p.slug}</span>
                  <span className="font-semibold">{p.title}</span>
                  <span className="whitespace-nowrap text-right text-[#6d7a81]">{p.sections?.length ?? 0} sections</span>
                </div>
              ))}
            </div>
            {bp.designTokens?.colorRoles ? (
              <div className="mt-7">
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[#6d7a81]">Color roles</h3>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(bp.designTokens.colorRoles).map(([name, hex]) => (
                    <div key={name} className="flex w-[82px] flex-col items-center gap-1.5">
                      <div className="h-14 w-14 rounded-[10px] border border-[#2b3640]" style={{ background: hex }} />
                      <div className="text-center text-[10.5px] text-[#6d7a81]">{name}</div>
                      <div className="font-mono text-[10px] text-[#9aa7ae]">{hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {promptPackage ? (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Build-ready, not just a wireframe</h2>
            <p className="mt-2 max-w-[62ch] text-[15px] text-[#9aa7ae]">
              The blueprint above compiles into a validated master prompt for whichever builder you use — this one targeted{" "}
              {promptPackage.target_platform}. Eight more platforms read from the same blueprint.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="rounded-full border border-[#2b3640] bg-[#181f26] px-3.5 py-1.5 text-[12.5px] text-[#9aa7ae]">
                Target <span className="font-mono font-semibold text-[#eceff1]">{promptPackage.target_platform}</span>
              </div>
              <div className="rounded-full border border-[#2b3640] bg-[#181f26] px-3.5 py-1.5 text-[12.5px] text-[#9aa7ae]">
                Est. tokens <span className="font-mono font-semibold text-[#eceff1]">{promptPackage.token_estimate}</span>
              </div>
              <div className="rounded-full border border-[#2b3640] bg-[#181f26] px-3.5 py-1.5 text-[12.5px] text-[#9aa7ae]">
                Validation{" "}
                <span className={`font-mono font-semibold ${promptPackage.validation_status === "valid" ? "text-emerald-500" : "text-amber-500"}`}>
                  {promptPackage.validation_status}
                </span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#263039] bg-[#0b0f13]">
              <div className="border-b border-[#263039] px-4 py-2.5 font-mono text-[11.5px] text-[#7c8891]">{promptPackage.target_platform}-master-prompt.md</div>
              <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap px-5 py-5 font-mono text-[12.5px] leading-relaxed text-[#d9e2e4]">
                {promptPackage.prompt_markdown.slice(0, 1800)}
                {promptPackage.prompt_markdown.length > 1800 ? "\n\n…continues with full component specs, copy direction, and a complete design system." : ""}
              </pre>
            </div>
          </section>
        ) : null}

        <footer className="mt-16 border-t border-[#2b3640] pt-6 text-[12.5px] text-[#6d7a81]">
          Generated from a real, live URL for this trial — no fixtures, no mockups.
        </footer>
      </div>
    </main>
  );
}
