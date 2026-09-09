import { createHash } from "node:crypto";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import { buildPlainEnglishReport } from "@/lib/intelligence/plain-english";
import { computeOpportunityLevel, computeRecommendedOffer } from "@/lib/prospect/opportunity-level";
import type { EvidenceReference, OpportunityBrief, Prospect } from "@/lib/prospect/types";

/**
 * Composes the narrative fields (summary / sales angle / suggested opener)
 * from real, already-computed facts — deterministic and template-driven,
 * the same "deterministic first" approach lib/intelligence/plain-english.ts
 * already uses for the audit report, NOT a live LLM call. This codebase has
 * never wired one (lib/copy/generator.ts's "model-assisted" path is a
 * documented boundary, never implemented); adding a new AI dependency here
 * just to satisfy "AI-generated explanation" would be a new architectural
 * surface for zero real benefit over a template that can't fabricate
 * anything, and this project's own principle is deterministic first,
 * models only to *enhance*. See docs/history.md's P0 entry for the reasoning.
 *
 * Every sentence below traces to either a real Prospect field (rating,
 * review count, website presence) or a real ModuleScore/EvidenceItem from
 * an actual completed audit. Where there isn't enough evidence, this says
 * so explicitly rather than guessing — see the `!intelligence` branch.
 */

type ProspectFacts = Pick<
  Prospect,
  "businessName" | "hasWebsite" | "rating" | "reviewCount" | "websiteUrl" | "demoUrl" | "open24Hours"
>;

function stableFingerprint(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

function noWebsiteBrief(prospect: ProspectFacts) {
  const hasReputation = (prospect.rating ?? 0) >= 4 && (prospect.reviewCount ?? 0) >= 10;
  const reasonsToContact = [
    "No website at all — every online search for this business comes up empty-handed.",
    ...(hasReputation
      ? [`${prospect.rating}★ from ${prospect.reviewCount} reviews — a real reputation with nowhere online to point people to.`]
      : []),
    ...(prospect.open24Hours ? [] : [])
  ];
  const topFindings = ["No website found for this business (source: Google Places)."];
  const evidenceReferences: EvidenceReference[] = [
    {
      type: "no_website",
      sourceUrl: "https://www.google.com/maps",
      detail: "Google Places listing has no website field set for this business.",
      weight: 1
    }
  ];
  if (hasReputation) {
    evidenceReferences.push({
      type: "google_rating",
      sourceUrl: "https://www.google.com/maps",
      detail: `${prospect.rating}★ average from ${prospect.reviewCount} Google reviews.`,
      weight: 0.8
    });
  }

  const opener = hasReputation
    ? `I noticed ${prospect.businessName} has a strong reputation online (${prospect.rating}★, ${prospect.reviewCount} reviews), but you don't have a website yet — so people searching for you come up empty. I put together a quick example of what one could look like. Want to see it?`
    : `I came across ${prospect.businessName} and noticed you don't have a website yet, so people searching for you online come up empty. I put together a quick example of what one could look like. Want to see it?`;

  return {
    summary: hasReputation
      ? `${prospect.businessName} has no website despite a real, established reputation (${prospect.rating}★, ${prospect.reviewCount} reviews) — the single clearest Motion A opportunity: build it, show it, close it.`
      : `${prospect.businessName} has no website. That's the entire opportunity here — nothing to diagnose, just something real to build and show.`,
    reasonsToContact,
    topFindings,
    secondaryOpportunities: prospect.open24Hours
      ? []
      : ["Could also be pitched a 24/7 AI receptionist once the site exists, if hours data ever shows a gap there."],
    salesAngle: "Give, don't criticize — show up with a finished thing, not a pitch about what's missing.",
    suggestedOpener: opener,
    evidenceReferences,
    confidence: hasReputation ? 0.9 : 0.75
  };
}

function hasWebsiteNoAuditBrief(prospect: ProspectFacts) {
  return {
    summary: `${prospect.businessName} has an existing website, but no audit has been run yet — there isn't enough evidence yet to say what the opportunity is.`,
    reasonsToContact: [],
    topFindings: [],
    secondaryOpportunities: [],
    salesAngle: null,
    suggestedOpener: null,
    evidenceReferences: [] as EvidenceReference[],
    confidence: 0
  };
}

function hasWebsiteAuditedBrief(prospect: ProspectFacts, intelligence: WebsiteIntelligenceOutput) {
  const report = buildPlainEnglishReport(intelligence, prospect.businessName, prospect.websiteUrl ?? "");
  const allItems = report.categories.flatMap((c) => c.items);
  const weakest = allItems.filter((i) => i.band !== "good").sort((a, b) => (a.band === "bad" ? -1 : 1) - (b.band === "bad" ? -1 : 1));
  const topWeak = weakest.slice(0, 3);
  const strongest = allItems.find((i) => i.band === "good");

  const byModule = new Map(intelligence.moduleScores.map((m) => [m.module, m]));
  const evidenceReferences: EvidenceReference[] = intelligence.moduleScores
    .flatMap((m) => m.evidence.map((e) => ({ ...e, module: m.module })))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((e) => ({ type: e.type, sourceUrl: e.sourceUrl, detail: e.detail, weight: e.weight }));

  const avgConfidence =
    topWeak.length > 0
      ? topWeak.reduce((sum, item) => sum + (byModuleConfidenceFor(byModule, item.title) ?? 0.5), 0) / topWeak.length
      : intelligence.moduleScores.reduce((sum, m) => sum + m.confidence, 0) / (intelligence.moduleScores.length || 1);

  const opener = strongest
    ? `I noticed ${prospect.businessName} does ${strongest.title.toLowerCase()} well, but ${topWeak[0]?.body.charAt(0).toLowerCase()}${topWeak[0]?.body.slice(1) ?? "there are a few gaps holding the site back"} I put together a few things I'd improve — want me to send them over?`
    : `I ran a quick audit on ${prospect.businessName}'s website and found a few real gaps I could send over — want to take a look?`;

  return {
    summary: `${report.overallHeadline} (${report.overallScore}/100, grade ${report.overallGrade}). ${report.overallBody}`,
    reasonsToContact: topWeak.map((i) => i.body),
    topFindings: topWeak.map((i) => i.body),
    secondaryOpportunities: report.goodNews ? [] : allItems.filter((i) => i.band === "warn").slice(0, 2).map((i) => i.body),
    salesAngle: "Don't tell them their website is bad — show them why, with real evidence.",
    suggestedOpener: opener,
    evidenceReferences,
    confidence: Number(avgConfidence.toFixed(2))
  };
}

function byModuleConfidenceFor(
  byModule: Map<string, WebsiteIntelligenceOutput["moduleScores"][number]>,
  title: string
): number | undefined {
  // Plain-English item titles are human copy, not module keys — fall back to
  // a simple average when we can't map back cleanly. Real confidence values
  // still come from the audit engine either way, never invented.
  for (const m of byModule.values()) {
    if (m.evidence.some((e) => e.detail.toLowerCase().includes(title.toLowerCase().slice(0, 8)))) return m.confidence;
  }
  return undefined;
}

export function generateOpportunityBrief(
  prospect: ProspectFacts,
  intelligence: WebsiteIntelligenceOutput | null,
  previousVersion = 0
): Omit<OpportunityBrief, "id" | "prospectId"> {
  const opportunityLevel = computeOpportunityLevel(prospect, intelligence);
  const { offer, reason: offerReason } = computeRecommendedOffer(prospect, intelligence);

  const content = !prospect.hasWebsite
    ? noWebsiteBrief(prospect)
    : intelligence
      ? hasWebsiteAuditedBrief(prospect, intelligence)
      : hasWebsiteNoAuditBrief(prospect);

  const inputFingerprint = stableFingerprint({
    hasWebsite: prospect.hasWebsite,
    demoUrl: Boolean(prospect.demoUrl),
    overallScore: intelligence?.overallScore ?? null,
    moduleCount: intelligence?.moduleScores.length ?? 0,
    rating: prospect.rating ?? null,
    reviewCount: prospect.reviewCount ?? null
  });

  return {
    version: previousVersion + 1,
    opportunityLevel,
    summary: content.summary,
    reasonsToContact: content.reasonsToContact,
    topFindings: content.topFindings,
    recommendedOffer: offer,
    recommendedOfferReason: offerReason,
    secondaryOpportunities: content.secondaryOpportunities,
    salesAngle: content.salesAngle,
    suggestedOpener: content.suggestedOpener,
    confidence: content.confidence,
    evidenceReferences: content.evidenceReferences,
    inputFingerprint,
    generatedAt: new Date().toISOString()
  };
}
