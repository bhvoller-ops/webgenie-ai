import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill, SectionHeading, type PillTone } from "@/components/ui";
import { requireBetaPage } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { NewTrialForm } from "@/components/new-trial-form";

export const dynamic = "force-dynamic";

const MAX_TRIALS = 3;

const STATUS_TONE: Record<string, PillTone> = {
  queued: "neutral",
  completed: "good",
  failed: "bad"
};

interface TrialRow {
  id: string;
  name: string;
  created_at: string;
  url: string | null;
  jobId: string | null;
  jobStatus: string;
}

// beta_testers carries no RLS policies of its own (migration 024) — every
// read here goes through the admin client, scoped explicitly by this
// tester's own beta_tester_id, rather than relying on a row-level policy.
// Same reasoning as requirePartnerPage()'s portal.
export default async function TrialPortalPage() {
  const { betaTesterId } = await requireBetaPage();
  const admin = createAdminClient();

  const { data: projects } = await admin
    .from("projects")
    .select("id,name,created_at")
    .eq("beta_tester_id", betaTesterId)
    .eq("is_trial", true)
    .order("created_at", { ascending: false });

  const trials: TrialRow[] = [];
  for (const p of projects ?? []) {
    const [{ data: reference }, { data: job }] = await Promise.all([
      admin.from("website_references").select("url").eq("project_id", p.id).order("priority", { ascending: true }).limit(1).maybeSingle(),
      admin.from("analysis_jobs").select("id,status").eq("project_id", p.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
    ]);
    trials.push({ id: p.id, name: p.name, created_at: p.created_at, url: reference?.url ?? null, jobId: job?.id ?? null, jobStatus: job?.status ?? "queued" });
  }

  const usedCount = trials.length;

  return (
    <PageShell role="beta">
      <SectionHeading
        title="Your trials"
        description="Every audit you've run, with links to both the technical and plain-English versions once they're ready."
      />

      <Panel className="mt-10">
        <Eyebrow className="mb-4 text-ink font-bold">Run another trial</Eyebrow>
        <NewTrialForm remaining={Math.max(0, MAX_TRIALS - usedCount)} />
      </Panel>

      <div className="mt-10 space-y-4">
        {trials.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hairline p-10 text-center">
            <p className="text-sm text-ink">No trials yet — run your first one above.</p>
          </div>
        ) : (
          trials.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{t.name}</h3>
                    <Pill tone={STATUS_TONE[t.jobStatus] ?? "neutral"}>{t.jobStatus}</Pill>
                  </div>
                  {t.url ? <p className="mt-1 text-[12px] text-muted">{t.url}</p> : null}
                </div>
                {t.jobId && t.jobStatus === "completed" ? (
                  <div className="flex gap-2">
                    <a href={`/trial/report/${t.jobId}/technical`} className="focus-ring rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-ink hover:border-iris/50">
                      Technical
                    </a>
                    <a href={`/trial/report/${t.jobId}/plain`} className="focus-ring rounded-lg bg-iris px-3 py-1.5 text-[12px] font-medium text-white hover:bg-iris-soft">
                      Plain English
                    </a>
                  </div>
                ) : (
                  <a href={`/trial/status/${t.id}`} className="text-[12px] text-muted underline decoration-dotted underline-offset-2">
                    Check progress →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
