import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, History, Layers, MapPin, Phone, PhoneCall, Star } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill } from "@/components/ui";
import { PageHeader, DisclosurePanel } from "@/components/workspace";
import { ScoreRing } from "@/components/score-ring";
import { EvidenceList } from "@/components/evidence";
import { requireAdminPage } from "@/lib/auth/access";
import { getBlueprint, getIntelligence, getNextBestAction, getOpportunityBrief, getProspect } from "@/lib/data/provider";
import { NEXT_BEST_ACTION_LABELS, RECOMMENDED_OFFER_LABELS } from "@/lib/prospect/types";
import { getVerifiedManualObservations } from "@/lib/prospect/manual-evidence";
import { computeEvidenceReadiness, EVIDENCE_READINESS_DETAIL, EVIDENCE_READINESS_LABEL, EVIDENCE_READINESS_TONE } from "@/lib/prospect/evidence-readiness";
import { ProspectActions } from "./prospect-actions";
import { PitchGenerator } from "./pitch-generator";
import { DemoRoomPanel } from "./demo-room-panel";
import { SuppressControl } from "./suppress-control";
import { SequencePanel } from "./sequence-panel";
import { HandoffPanel } from "./handoff-panel";

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

/** The exact stored sentence hasWebsiteNoAuditBrief() always produces -- see evidence-readiness.ts. */
const NO_AUDIT_SUMMARY_SUFFIX = "there isn't enough evidence yet to say what the opportunity is.";

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, organizationId } = await requireAdminPage();
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const [brief, nextBestAction, intelligence, blueprint, verifiedObservations] = await Promise.all([
    getOpportunityBrief(id),
    getNextBestAction(id),
    prospect.projectId ? getIntelligence(prospect.projectId) : Promise.resolve(null),
    prospect.projectId ? getBlueprint(prospect.projectId) : Promise.resolve(null),
    getVerifiedManualObservations(supabase, organizationId, id)
  ]);

  // Evidence-display consistency fix (see evidence-readiness.ts): a
  // read-time-only override of the one known stale sentence, never a
  // rewrite of the persisted brief and never a change to opportunityLevel/
  // recommendedOffer/confidence.
  const hasVerifiedObservation = verifiedObservations.length > 0;
  const readiness = computeEvidenceReadiness({
    hasWebsite: prospect.hasWebsite,
    hasAudit: Boolean(intelligence),
    hasVerifiedObservation
  });
  const briefSummary =
    brief && brief.summary.endsWith(NO_AUDIT_SUMMARY_SUFFIX) && hasVerifiedObservation
      ? EVIDENCE_READINESS_DETAIL.verified_observation
      : (brief?.summary ?? null);

  const primaryHref = `/prospects/${prospect.id}/playbook`;

  return (
    <PageShell role="admin">
      <PageHeader
        breadcrumbs={[{ label: "Prospector", href: "/finder" }, { label: prospect.businessName }]}
        title={prospect.businessName}
        context={
          <>
            {brief ? <Pill tone={LEVEL_TONE[brief.opportunityLevel]}>{LEVEL_LABEL[brief.opportunityLevel]}</Pill> : null}
            <Pill tone="neutral">{prospect.hasWebsite ? "Has a website" : "No website"}</Pill>
            {prospect.hasWebsite ? <Pill tone={EVIDENCE_READINESS_TONE[readiness]}>{EVIDENCE_READINESS_LABEL[readiness]}</Pill> : null}
            {prospect.industry ? <Pill tone="neutral">{prospect.industry}</Pill> : null}
            {prospect.city ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {prospect.city}
                {prospect.state ? `, ${prospect.state}` : ""}
              </span>
            ) : null}
            {prospect.phone ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {prospect.phone}
              </span>
            ) : (
              <span className="text-[13px] text-faint">No phone on file</span>
            )}
            {typeof prospect.rating === "number" ? (
              <span className="inline-flex items-center gap-1.5 text-[13px]">
                <Star className="h-3.5 w-3.5 fill-signal-warn text-signal-warn" aria-hidden />
                <span className="font-mono text-ink">{prospect.rating}</span>
                <span className="text-faint">({prospect.reviewCount ?? 0})</span>
              </span>
            ) : null}
          </>
        }
        primaryAction={
          /* OWNER-REVIEW CORRECTION (preserved): a suppressed prospect keeps a
             real entry point into the playbook, renamed and re-styled to make
             the read-only nature obvious rather than hidden -- see
             playbook-workspace.tsx's own suppressed branch, which is what
             actually enforces read-only (this label change is honesty, not
             the security boundary itself). */
          <Link
            href={primaryHref}
            className={
              prospect.suppressedAt
                ? "focus-ring inline-flex items-center gap-2 rounded-xl border border-signal-bad/35 bg-signal-bad/10 px-4 py-2.5 text-sm font-semibold text-signal-bad transition-all hover:bg-signal-bad/15"
                : "focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
            }
          >
            {prospect.suppressedAt ? <History className="h-4 w-4" aria-hidden /> : <PhoneCall className="h-4 w-4" aria-hidden />}
            {prospect.suppressedAt ? "View Outreach History" : "Open Playbook"}
          </Link>
        }
        secondaryAction={
          intelligence ? <ScoreRing score={intelligence.overallScore} size={64} stroke={6} label="Health" /> : undefined
        }
      />

      <div className="mt-4">
        <ProspectActions
          prospect={prospect}
          hasBlueprint={Boolean(blueprint)}
          hasIntelligence={Boolean(intelligence)}
          opportunityLevel={brief?.opportunityLevel}
        />
        {/* Suppression is a danger-zone control -- kept visually separated
            from the routine header actions above, never at the same
            prominence as Open Playbook (Phase 5G: "Place suppression
            inside a clearly separated overflow or danger area"). */}
        <SuppressControl prospectId={prospect.id} suppressedAt={prospect.suppressedAt ?? null} suppressionReason={prospect.suppressionReason ?? null} />
      </div>

      {/* WON CLIENT HANDOFF (P2) — only once a sale is actually confirmed */}
      {prospect.status === "won" ? (
        <div className="mt-6">
          <HandoffPanel
            prospectId={prospect.id}
            hasProject={Boolean(prospect.projectId)}
            recommendedOffer={brief?.recommendedOffer ? RECOMMENDED_OFFER_LABELS[brief.recommendedOffer] : null}
            recommendedOfferReason={brief?.recommendedOfferReason ?? null}
          />
        </div>
      ) : null}

      {!brief ? (
        <div className="mt-8 card p-6">
          <p className="text-sm text-muted">Generating this prospect&apos;s Opportunity Brief…</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          {/* PRIMARY WORK AREA */}
          <div className="space-y-5">
            {/* WHY THIS BUSINESS + top opportunities + suggested opener, one
                grouped surface -- these three were the same opportunity
                brief split across three identical cards for no structural
                reason. */}
            <div className="card p-6">
              <div className="label mb-3">Why this business</div>
              <p className="text-[15px] leading-relaxed text-ink/85">{briefSummary}</p>
              {readiness === "verified_observation" && verifiedObservations[0] ? (
                <p className="mt-3 rounded-lg border border-signal-warn/25 bg-signal-warn/[0.06] px-3 py-2.5 text-[13px] leading-relaxed text-ink/80">
                  <span className="font-medium text-signal-warn">Verified observation: </span>
                  {verifiedObservations[0]}
                </p>
              ) : null}
              {brief.reasonsToContact.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {brief.reasonsToContact.map((r) => (
                    <li key={r} className="flex gap-2 text-[14px] leading-relaxed text-ink/80">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-iris" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}

              {brief.topFindings.length > 0 ? (
                <div className="mt-5 border-t border-hairline pt-4">
                  <div className="label mb-2.5">Top opportunities</div>
                  <ul className="space-y-2">
                    {brief.topFindings.map((f) => (
                      <li key={f} className="text-[14px] leading-relaxed text-ink/80">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {brief.suggestedOpener ? (
                <div className="mt-5 border-t border-hairline pt-4">
                  <div className="label mb-2.5">Suggested opener</div>
                  <p className="text-[14.5px] leading-relaxed text-ink">&ldquo;{brief.suggestedOpener}&rdquo;</p>
                </div>
              ) : null}
            </div>

            {/* PITCH GENERATOR (P1) */}
            <PitchGenerator prospectId={prospect.id} />

            {/* ASSISTED OUTREACH SEQUENCE (P2) */}
            <SequencePanel prospectId={prospect.id} />

            {/* EVIDENCE — kept as a disclosure rather than an always-open
                card; the citations matter but shouldn't outrank the pitch
                and sequence workflows above them. */}
            {brief.evidenceReferences.length > 0 ? (
              <div className="card p-5">
                <DisclosurePanel summary={`Evidence this is based on (${brief.evidenceReferences.length})`}>
                  <EvidenceList
                    items={brief.evidenceReferences.map((e, i) => ({
                      sourceCaptureId: `brief-${i}`,
                      sourceUrl: e.sourceUrl,
                      type: e.type,
                      detail: e.detail,
                      weight: e.weight
                    }))}
                  />
                </DisclosurePanel>
              </div>
            ) : null}
          </div>

          {/* SECONDARY DETAIL */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* WHAT TO DO NEXT — next best action + recommended offer merged;
                both answer the same question ("what happens next and why"). */}
            <div className="card p-5">
              <div className="label mb-3 flex items-center justify-between">
                What to do next
                {nextBestAction ? <Pill tone={PRIORITY_TONE[nextBestAction.priority]}>{nextBestAction.priority}</Pill> : null}
              </div>
              {nextBestAction ? (
                <>
                  <div className="text-[15px] font-semibold text-ink">{NEXT_BEST_ACTION_LABELS[nextBestAction.action]}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{nextBestAction.reason}</p>
                  {nextBestAction.dueAt ? (
                    <p className="mt-1.5 font-mono text-[12px] text-faint">Due {new Date(nextBestAction.dueAt).toLocaleDateString()}</p>
                  ) : null}
                  <div className="my-3.5 hairline-x h-px w-full" />
                </>
              ) : null}
              <div className="text-[12px] font-medium uppercase tracking-wide text-faint">Recommended offer</div>
              {brief.recommendedOffer ? (
                <>
                  <div className="mt-1 text-[14px] font-semibold text-ink">{RECOMMENDED_OFFER_LABELS[brief.recommendedOffer]}</div>
                  {brief.recommendedOfferReason ? <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{brief.recommendedOfferReason}</p> : null}
                </>
              ) : (
                <p className="mt-1 text-[12.5px] leading-relaxed text-faint">{brief.recommendedOfferReason ?? "Not enough evidence yet."}</p>
              )}
            </div>

            {/* ADDITIONAL CONTEXT — secondary opportunity, sales angle, and
                confidence/version metadata, grouped behind one disclosure
                instead of three separate cards nobody needed open by
                default. */}
            {brief.secondaryOpportunities.length > 0 || brief.salesAngle ? (
              <div className="card p-5">
                <DisclosurePanel summary="Additional context">
                  <div className="space-y-4">
                    {brief.secondaryOpportunities.length > 0 ? (
                      <div>
                        <div className="text-[12px] font-medium uppercase tracking-wide text-faint">Possible add-on</div>
                        <ul className="mt-1.5 space-y-1.5">
                          {brief.secondaryOpportunities.map((s) => (
                            <li key={s} className="text-[13px] leading-relaxed text-muted">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {brief.salesAngle ? (
                      <div>
                        <div className="text-[12px] font-medium uppercase tracking-wide text-faint">Best sales angle</div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">{brief.salesAngle}</p>
                      </div>
                    ) : null}
                    <p className="font-mono text-[11.5px] text-faint">
                      Confidence {Math.round(brief.confidence * 100)}% · Brief v{brief.version} · generated {new Date(brief.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </DisclosurePanel>
              </div>
            ) : (
              <p className="px-1 font-mono text-[11.5px] text-faint">
                Confidence {Math.round(brief.confidence * 100)}% · Brief v{brief.version} · generated {new Date(brief.generatedAt).toLocaleString()}
              </p>
            )}

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
