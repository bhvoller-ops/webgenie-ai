import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import { buildPlainEnglishReport, type Band } from "@/lib/intelligence/plain-english";

export const dynamic = "force-dynamic";

const BADGE_CLASS: Record<Band, string> = {
  good: "bg-[#e6f0e8] text-[#3f7d53]",
  warn: "bg-[#f7ecd7] text-[#b87816]",
  bad: "bg-[#f6e1dd] text-[#b23b2e]"
};
const BADGE_LABEL: Record<Band, string> = { good: "Good", warn: "Getting there", bad: "Needs work" };

// Public — no login, same trust model as the technical report. Same real
// audit data, translated by lib/intelligence/plain-english.ts instead of
// hand-written per business (that gap is what this page closes — see the
// "Website Report Card" sample this was validated against).
export default async function TrialPlainReport({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const admin = createAdminClient();

  const { data: job } = await admin.from("analysis_jobs").select("id,project_id").eq("id", jobId).maybeSingle();
  if (!job) notFound();

  const [{ data: project }, { data: reference }, { data: outputRow }] = await Promise.all([
    admin.from("projects").select("name,is_trial").eq("id", job.project_id).maybeSingle(),
    admin.from("website_references").select("url").eq("project_id", job.project_id).order("priority", { ascending: true }).limit(1).maybeSingle(),
    admin.from("analysis_outputs").select("output").eq("analysis_job_id", jobId).maybeSingle()
  ]);

  if (!project?.is_trial || !outputRow) notFound();

  const output = outputRow.output as WebsiteIntelligenceOutput;
  const report = buildPlainEnglishReport(output, project.name, reference?.url ?? "");

  return (
    <main className="min-h-screen bg-[#f2f0ea] text-[#26211b]">
      <div className="mx-auto max-w-[740px] px-6 py-13">
        <div className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6e675a]">Website Report Card</div>
        <h1 className="mt-2.5 text-[32px] font-bold leading-[1.15] sm:text-[38px]">
          {report.businessName}
          {reference?.url ? <span className="block text-[19px] font-medium text-[#6e675a]">{reference.url}</span> : null}
        </h1>
        <p className="mt-2.5 max-w-[56ch] text-base text-[#6e675a]">
          We looked at your website the way a <b className="text-[#26211b]">new customer</b> would — not as a designer, as someone deciding
          whether to call you. Here&apos;s what we found, in plain English.
        </p>

        <div className="mt-8 flex items-center gap-6 rounded-[18px] border border-[#e0dbcd] bg-white p-6.5">
          <div
            className={`grid h-[92px] w-[92px] flex-none place-items-center rounded-full border-[3px] ${
              report.overallBand === "good" ? "border-[#3f7d53] bg-[#e6f0e8]" : report.overallBand === "warn" ? "border-[#b87816] bg-[#f7ecd7]" : "border-[#b23b2e] bg-[#f6e1dd]"
            }`}
          >
            <span
              className={`text-[34px] font-bold ${
                report.overallBand === "good" ? "text-[#3f7d53]" : report.overallBand === "warn" ? "text-[#b87816]" : "text-[#b23b2e]"
              }`}
            >
              {report.overallGrade}
            </span>
          </div>
          <div>
            <div className="text-lg font-bold">{report.overallHeadline}</div>
            <div className="mt-1.5 text-[15px] text-[#6e675a]">{report.overallBody}</div>
          </div>
        </div>

        {report.categories.map((category, ci) => (
          <section key={category.heading} className="mt-11">
            <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#918a7b]">
              {ci + 1} of {report.categories.length}
            </div>
            <h2 className="mt-1.5 text-2xl font-bold">{category.heading}</h2>
            <p className="mt-2.5 max-w-[58ch] text-base text-[#6e675a]">{category.lead}</p>

            {category.items.map((item) => (
              <div key={item.title} className="mt-5 rounded-2xl border border-[#e0dbcd] bg-white p-6.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[19px] font-bold">{item.title}</div>
                  <span className={`flex-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${BADGE_CLASS[item.band]}`}>
                    {BADGE_LABEL[item.band]}
                  </span>
                </div>
                <p className="mt-3.5 text-[15.5px]">{item.body}</p>
                {item.analogy ? <p className="mt-2.5 text-[14.5px] italic text-[#6e675a]">{item.analogy}</p> : null}
                <div className="mt-3.5 border-t border-dashed border-[#e0dbcd] pt-3.5 text-[13.5px] text-[#918a7b]">{item.whatWeChecked}</div>
              </div>
            ))}
          </section>
        ))}

        {report.goodNews ? (
          <div className="mt-8 rounded-2xl border border-[#3f7d53]/35 bg-[#e6f0e8] p-6.5">
            <div className="text-[17px] font-bold text-[#3f7d53]">{report.goodNews.title}</div>
            <p className="mt-2.5 text-[15px]">{report.goodNews.body}</p>
          </div>
        ) : null}

        <div className="mt-12 rounded-[18px] border border-[#2c4a66]/30 bg-[#e7edf1] p-8">
          <h2 className="text-[22px] font-bold">The short version</h2>
          <p className="mt-3 max-w-[60ch] text-[15.5px] text-[#6e675a]">
            Nothing here is a matter of opinion — every item above came from actually checking the page. The fix isn&apos;t a full rebuild of
            who you are as a business. It&apos;s making the site do the specific jobs it isn&apos;t doing yet.
          </p>
        </div>

        <footer className="mt-14 border-t border-[#e0dbcd] pt-5.5 text-[13px] text-[#918a7b]">
          Checked against the live page{reference?.url ? ` at ${reference.url}` : ""}. Same findings as the full technical audit — written for
          the person deciding whether to pick up the phone.
        </footer>
      </div>
    </main>
  );
}
