import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Layers, MapPin, Phone, Star } from "lucide-react";
import { Breadcrumbs, PageShell } from "@/components/shell";
import { Pill } from "@/components/ui";
import { ScoreRing } from "@/components/score-ring";
import { EvidenceList } from "@/components/evidence";
import { requireAdminPage } from "@/lib/auth/access";
import { getBlueprint, getIntelligence, getNextBestAction, getOpportunityBrief, getProspect } from "@/lib/data/provider";
import { NEXT_BEST_ACTION_LABELS, RECOMMENDED_OFFER_LABELS } from "@/lib/prospect/types";
import { ProspectActions } from "./prospect-actions";
import { PitchGenerator } from "./pitch-generator";
import { DemoRoomPanel } from "./demo-room-panel";

export const dynamic = "force-dynamic";

const LEVEL_TONE = {
  high: "good",
  medium: "info",
  low: "neutral",
  insufficient_evidence: "warn"
} as const;

const LEVEL_LABEL = {
  high: "High opportunity",
  medium: "Medium opportunity",
  low: "Low opportunity",
  insufficient_evidence: "Insufficient evidence"
} as const;

const PRIORITY_TONE = { high: "bad", medium: "warn", low: "neutral" } as const;

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const [brief, nextBestAction, intelligence, blueprint] = await Promise.all([
    getOpportunityBrief(id),
    getNextBestAction(id),
    prospect.projectId ? getIntelligence(prospect.projectId) : Promise.resolve(null),
    prospect.projectId ? getBlueprint(prospect.projectId) : Promise.resolve(null)
  ]);

  return (
    <PageShell role="admin">
      <Breadcrumbs items={[{ label: "Prospector", href: "/finder" }, { label: prospect.businessName }]} />

      {/* BUSINESS NAME + OPPORTUNITY LEVEL */}
      <div className="mt-6 panel relative overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {brief ? <Pill tone={LEVEL_TONE[brief.opportunityLevel]}>{LEVEL_LABEL[brief.opportunityLevel]}</Pill> : null}
              <Pill tone="neutral">{prospect.hasWebsite ? "Has a website" : "No website"}</Pill>
              {prospect.industry ? <Pill tone="neutral">{prospect.industry}</Pill> : null}
            </div>
            <h1 className="mt-4 text-display-md font-semibold text-ink">{prospect.businessName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-muted">
              {prospect.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {prospect.city}
                  {prospect.state ? `, ${prospect.state}` : ""}
                </span>
              ) : null}
              {prospect.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {prospect.phone}
                </span>
              ) : (
                <span className="text-faint">No phone on file</span>
              )}
              {typeof prospect.rating === "number" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-signal-warn text-signal-warn" aria-hidden />
                  <span className="font-mono text-ink">{prospect.rating}</span>
                  <span className="text-faint">({prospect.reviewCount ?? 0})</span>
                </span>
              ) : null}
            </div>
          </div>

          {intelligence ? (
            <div className="justify-self-center lg:justify-self-end">
              <ScoreRing score={intelligence.overallScore} size={140} stroke={9} label="Website Health" />
            </div>
          ) : null}
        </div>

        <ProspectActions
          prospect={prospect}
          hasBlueprint={Boolean(blueprint)}
          hasIntelligence={Boolean(intelligence)}
          opportunityLevel={brief?.opportunityLevel}
        />
      </div>

      {!brief ? (
        <div className="mt-8 card p-6">
          <p className="text-sm text-muted">Generating this prospect&apos;s Opportunity Brief…</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-6">
            {/* WHY THIS BUSINESS */}
            <div className="card p-6">
              <div className="eyebrow mb-3">Why this business</div>
              <p className="text-sm leading-relaxed text-ink/80">{brief.summary}</p>
              {brief.reasonsToContact.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {brief.reasonsToContact.map((r) => (
                    <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-ink/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-iris" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* TOP OPPORTUNITIES */}
            {brief.topFindings.length > 0 ? (
              <div className="card p-6">
                <div className="eyebrow mb-3">Top opportunities</div>
                <ul className="space-y-2.5">
                  {brief.topFindings.map((f) => (
                    <li key={f} className="text-[13px] leading-relaxed text-ink/80">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* SUGGESTED OPENER */}
            {brief.suggestedOpener ? (
              <div className="card p-6">
                <div className="eyebrow mb-3">Suggested opener</div>
                <p className="text-sm leading-relaxed text-ink">&ldquo;{brief.suggestedOpener}&rdquo;</p>
              </div>
            ) : null}

            {/* PITCH GENERATOR (P1) */}
            <PitchGenerator prospectId={prospect.id} />

            {/* EVIDENCE */}
            {brief.evidenceReferences.length > 0 ? (
              <div className="card p-6">
                <div className="eyebrow mb-3">Evidence this is based on</div>
                <EvidenceList
                  items={brief.evidenceReferences.map((e, i) => ({
                    sourceCaptureId: `brief-${i}`,
                    sourceUrl: e.sourceUrl,
                    type: e.type,
                    detail: e.detail,
                    weight: e.weight
                  }))}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            {/* NEXT BEST ACTION */}
            {nextBestAction ? (
              <div className="card p-5">
                <div className="eyebrow mb-3 flex items-center justify-between">
                  Next best action
                  <Pill tone={PRIORITY_TONE[nextBestAction.priority]}>{nextBestAction.priority}</Pill>
                </div>
                <div className="text-sm font-semibold text-ink">{NEXT_BEST_ACTION_LABELS[nextBestAction.action]}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{nextBestAction.reason}</p>
                {nextBestAction.dueAt ? (
                  <p className="mt-2 font-mono text-[11px] text-faint">Due {new Date(nextBestAction.dueAt).toLocaleDateString()}</p>
                ) : null}
              </div>
            ) : null}

            {/* RECOMMENDED OFFER */}
            <div className="card p-5">
              <div className="eyebrow mb-3">Recommended offer</div>
              {brief.recommendedOffer ? (
                <>
                  <div className="text-sm font-semibold text-ink">{RECOMMENDED_OFFER_LABELS[brief.recommendedOffer]}</div>
                  {brief.recommendedOfferReason ? (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{brief.recommendedOfferReason}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-[12.5px] leading-relaxed text-faint">
                  {brief.recommendedOfferReason ?? "Not enough evidence yet."}
                </p>
              )}
            </div>

            {/* SECONDARY OPPORTUNITY */}
            {brief.secondaryOpportunities.length > 0 ? (
              <div className="card p-5">
                <div className="eyebrow mb-3">Possible add-on</div>
                <ul className="space-y-2">
                  {brief.secondaryOpportunities.map((s) => (
                    <li key={s} className="text-[12.5px] leading-relaxed text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* SALES ANGLE */}
            {brief.salesAngle ? (
              <div className="card p-5">
                <div className="eyebrow mb-3">Best sales angle</div>
                <p className="text-[13px] leading-relaxed text-ink/80">{brief.salesAngle}</p>
              </div>
            ) : null}

            <div className="card p-5">
              <div className="eyebrow mb-2 flex items-center justify-between">
                Confidence
                <span className="font-mono text-sm text-ink">{Math.round(brief.confidence * 100)}%</span>
              </div>
              <p className="text-[11px] text-faint">Brief v{brief.version} · generated {new Date(brief.generatedAt).toLocaleString()}</p>
            </div>

            {/* DEMO ROOM (P1) */}
            <DemoRoomPanel prospectId={prospect.id} hasDemoUrl={Boolean(prospect.demoUrl)} />

            {prospect.projectId ? (
              <Link
                href={`/projects/${prospect.projectId}`}
                className="focus-ring flex items-center justify-between rounded-lg border border-hairline bg-raised px-4 py-3 text-[13px] font-medium text-muted transition-colors hover:text-ink"
              >
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  View full project
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </PageShell>
  );
}
