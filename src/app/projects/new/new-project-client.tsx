"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill, SectionHeading, Stat } from "@/components/ui";
import type { AccessRole } from "@/lib/auth/access";
import { PublishButton } from "@/components/publish-button";
import { IndustryPicker } from "@/components/industry-picker";
import { ProjectCard } from "@/components/project-card";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import type { Business, IndustryKey } from "@/lib/sitegen/types";
import type { ProjectSummary } from "@/lib/types";
import type { getPortfolioStats } from "@/lib/data/provider";
import { createProject } from "@/app/actions";
import { cn } from "@/lib/format";

interface QueuedProject {
  projectId: string;
  jobId: string;
  businessName: string;
  url: string;
  rating: number | null;
  reviewCount: number | null;
}

interface BulkResponse {
  generated: Business[];
  queued: QueuedProject[];
  notFound: string[];
  skipped: Array<{ businessName: string; reason: string }>;
}

const AGENCY = "VibeLabs Agency";

type PortfolioStats = Awaited<ReturnType<typeof getPortfolioStats>>;

export function NewProjectClient({
  role,
  projects,
  stats,
}: {
  role: AccessRole;
  projects: ProjectSummary[];
  stats: PortfolioStats;
}) {
  const [lines, setLines] = useState("");
  const [defaultIndustry, setDefaultIndustry] = useState<IndustryKey>("contractor");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BulkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [industryOverrides, setIndustryOverrides] = useState<Record<string, IndustryKey>>({});
  const [showManual, setShowManual] = useState(false);

  const lineCount = lines.split("\n").map((l) => l.trim()).filter(Boolean).length;

  function withIndustry(b: Business): Business {
    const override = industryOverrides[b.id];
    return override ? { ...b, industry: override } : b;
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  function smsHref(b: Business) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${demoSiteUrl(b, { by: AGENCY })}`;
    const body = `Hi, this is Cassey — here's the site I mentioned for ${b.name}: ${url}`;
    return `sms:${b.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
  }

  async function run() {
    const parsedLines = lines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!parsedLines.length || running) return;

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/projects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: parsedLines,
          defaultIndustry,
        }),
      });
      if (res.status === 401) {
        throw new Error("Your session has expired. Please refresh the page and sign in again.");
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setResult((await res.json()) as BulkResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <PageShell role={role}>
      <Panel className="relative overflow-hidden" padded={false}>
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.3]"
          style={{
            backgroundSize: "54px 54px",
            maskImage: "radial-gradient(620px 280px at 50% 0%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(620px 280px at 50% 0%, #000, transparent)",
          }}
          aria-hidden
        />
        <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16">
          <Pill tone="iris" className="mx-auto">
            <Sparkles className="h-3 w-3" aria-hidden />
            Add businesses to your dashboard
          </Pill>

          <h1 className="mx-auto mt-6 max-w-3xl text-display-lg font-semibold">
            <span className="text-ink">New Project</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Paste one or more businesses — a Google Business Profile link, a plain business name,
            or an existing website URL. One per line. A business with no website gets a demo site
            built instantly, just like Finder; a business with a website gets queued for a real
            audit, just like Audit.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-panel border border-hairline bg-canvas/80 p-4 text-left">
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-widest text-faint">
                Businesses (one per line, up to 25)
              </span>
              <textarea
                value={lines}
                onChange={(e) => setLines(e.target.value)}
                rows={6}
                placeholder={"https://maps.app.goo.gl/xxxxxx\nAce Plumbing, Marietta GA\nhttps://acmeroofing.com"}
                className="focus-ring mt-2 w-full rounded-xl border border-hairline bg-surface px-3 py-2.5 font-mono text-[12.5px] text-ink placeholder:text-faint transition-colors hover:border-iris/40"
              />
            </label>

            <div className="mt-3 max-w-xs">
              <span className="text-[11px] font-medium uppercase tracking-widest text-faint">
                If we can&rsquo;t tell the industry
              </span>
              <div className="mt-2">
                <IndustryPicker value={defaultIndustry} onChange={setDefaultIndustry} />
              </div>
            </div>

            <button
              onClick={run}
              disabled={running || lineCount === 0}
              className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Resolving {lineCount || ""} business{lineCount === 1 ? "" : "es"}…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" aria-hidden />
                  Add {lineCount || ""} business{lineCount === 1 ? "" : "es"}
                </>
              )}
            </button>
            <p className="mt-2 text-[11px] text-faint">
              Each line runs its own Google lookup, so a wrong or missing match on one line
              doesn&rsquo;t block the rest.
            </p>
          </div>

          {error ? (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-signal-bad/30 bg-signal-bad/10 px-4 py-3 text-[13px] text-signal-bad">
              {error}
            </div>
          ) : null}
        </div>
      </Panel>

      {result ? (
        <div className="mt-10 animate-fade-up space-y-10">
          {result.generated.length ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-display-md font-semibold text-ink">Ready for outreach</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {result.generated.length} business{result.generated.length === 1 ? "" : "es"} with no
                    website — a demo site is already built for each.
                  </p>
                </div>
                <Link
                  href="/"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-hairline bg-raised px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-iris/50"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.generated.map((b) => {
                  const biz = withIndustry(b);
                  return (
                    <div key={b.id} className="overflow-hidden rounded-2xl border border-hairline bg-surface">
                      <a
                        href={demoSiteUrl(biz, { by: AGENCY })}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open ${biz.name}'s demo site`}
                        className="focus-ring relative block h-40 w-full overflow-hidden border-b border-hairline bg-white"
                      >
                        <iframe
                          src={demoSiteUrl(biz, { by: AGENCY, badge: false })}
                          title={`Preview of ${biz.name}`}
                          loading="lazy"
                          tabIndex={-1}
                          aria-hidden
                          className="pointer-events-none origin-top-left"
                          style={{ width: "400%", height: "400%", transform: "scale(0.25)", border: "none" }}
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[11px] font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                          Open live preview
                        </span>
                      </a>

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/30 bg-iris/10 text-[13px] font-semibold text-iris-soft">
                            {biz.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-semibold text-ink">{biz.name}</p>
                            <p className="truncate text-[11.5px] text-faint">{biz.address || "No address on file"}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <IndustryPicker
                            compact
                            value={biz.industry}
                            onChange={(key) => setIndustryOverrides((prev) => ({ ...prev, [b.id]: key }))}
                          />
                          {typeof biz.rating === "number" ? (
                            <span className="inline-flex items-center gap-1 text-[11.5px] text-muted">
                              <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                              <span className="font-mono text-ink">{biz.rating}</span>
                              <span className="text-faint">({biz.reviewCount})</span>
                            </span>
                          ) : null}
                        </div>

                        {biz.phone ? (
                          <button
                            onClick={() => copy(biz.phone, biz.id + "p")}
                            className="focus-ring mt-2.5 inline-flex items-center gap-1.5 rounded font-mono text-[12px] text-muted transition-colors hover:text-neon-soft"
                          >
                            <Phone className="h-3 w-3" aria-hidden />
                            {biz.phone}
                            {copied === biz.id + "p" ? <span className="text-[10px] text-signal-good">copied</span> : null}
                          </button>
                        ) : null}

                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-hairline pt-3.5">
                          {biz.phone ? (
                            <a
                              href={smsHref(biz)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-iris/35 bg-iris/10 px-2.5 py-1.5 text-[12px] font-medium text-iris-soft transition-colors hover:bg-iris/20"
                            >
                              <MessageSquare className="h-3 w-3" aria-hidden />
                              Text
                            </a>
                          ) : null}
                          <a
                            href={demoSiteUrl(biz, { by: AGENCY })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-signal-good/35 bg-signal-good/10 px-2.5 py-1.5 text-[12px] font-medium text-signal-good transition-colors hover:bg-signal-good/20"
                          >
                            <ExternalLink className="h-3 w-3" aria-hidden />
                            View site
                          </a>
                          <a
                            href={demoSiteUrl(biz, { by: AGENCY, download: true })}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
                            title="Download the HTML file"
                          >
                            <Download className="h-3 w-3" aria-hidden />
                          </a>
                          <PublishButton business={biz} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {result.queued.length ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-display-md font-semibold text-ink">Now analyzing</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {result.queued.length} business{result.queued.length === 1 ? "" : "es"} with an
                    existing site, queued for a real 11-module scan — scores appear on your dashboard a
                    minute or two apart.
                  </p>
                </div>
                <Link
                  href="/"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-6 overflow-x-auto rounded-panel border border-hairline">
                <table className="w-full min-w-[640px] text-left">
                  <thead className="bg-raised">
                    <tr>
                      {["Business", "Rating", "Website", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-faint">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.queued.map((q) => (
                      <tr key={q.jobId} className="border-t border-hairline transition-colors hover:bg-raised/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neon/30 bg-neon/10 text-[13px] font-semibold text-neon-soft">
                              {q.businessName.charAt(0)}
                            </span>
                            <span className="text-[13px] font-medium text-ink">{q.businessName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {typeof q.rating === "number" ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px]">
                              <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                              <span className="font-mono text-ink">{q.rating}</span>
                              <span className="text-faint">({q.reviewCount ?? 0})</span>
                            </span>
                          ) : (
                            <span className="text-[12px] text-faint">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="truncate font-mono text-[11px] text-faint">{q.url}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Pill tone="warn">queued</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {result.notFound.length ? (
            <div>
              <Eyebrow className="text-signal-warn">Couldn&rsquo;t find a match</Eyebrow>
              <div className="mt-4 space-y-2">
                {result.notFound.map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px] text-muted">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />
                    <span className="text-ink">{line}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-faint">
                Try the plain business name and city instead of the link, or double-check the
                spelling — each line is a separate Google search.
              </p>
            </div>
          ) : null}

          {result.skipped.length ? (
            <div>
              <Eyebrow className="text-signal-bad">Couldn&rsquo;t queue</Eyebrow>
              <div className="mt-4 space-y-2">
                {result.skipped.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] text-muted">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />
                    <span className="text-ink">{s.businessName}</span>
                    <span className="text-faint">— {s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.queued.length || result.generated.length ? (
            <div className="rounded-panel border border-iris/25 bg-iris/[0.06] p-6">
              <Eyebrow className="text-iris-soft">
                <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                What to do next
              </Eyebrow>
              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">
                Open each demo site or dashboard entry above, confirm it reads well, then call.
                Queued audits finish in a minute or two — check the dashboard for scores.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-10">
          <SectionHeading
            eyebrow="Workspace"
            title="Every project"
            description="Every project holds a reference set, a scored intelligence artifact, an original rebuild blueprint, and an exportable prompt package."
          />

          {projects.length ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-panel border border-dashed border-hairline p-10 text-center">
              <h3 className="text-lg font-semibold text-ink">No projects yet</h3>
              <p className="mt-2 text-sm text-muted">
                Add a business above — an audit or a demo site becomes a project here.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="focus-ring flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
        >
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          {showManual ? "Hide manual setup" : "Prefer to set up a project by hand instead?"}
        </button>
        {showManual ? (
          <div className="mt-4 max-w-xl rounded-2xl border border-hairline bg-surface p-6">
            <p className="mb-4 text-[12.5px] text-faint">
              For a client with no Google presence to look up — e.g. a direct referral.
            </p>
            <form action={createProject} className="space-y-5">
              <label className="block">
                <span className="text-sm text-muted">Project name</span>
                <input name="name" required className="mt-2 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" placeholder="Atlas Roofing redesign" />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Industry</span>
                <input name="industry" required className="mt-2 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" placeholder="Roofing contractor" />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Primary goal</span>
                <select name="primaryGoal" className="mt-2 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink">
                  <option>Lead generation</option>
                  <option>Appointment booking</option>
                  <option>Online sale</option>
                  <option>Authority building</option>
                  <option>Information</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Primary CTA</span>
                <input name="primaryCta" required className="mt-2 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" placeholder="Request a free inspection" />
              </label>
              <button className={cn("rounded-lg bg-white px-4 py-2 font-medium text-slate-950")}>Create project</button>
            </form>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
