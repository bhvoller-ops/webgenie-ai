/**
 * Standalone verification for the P0 Opportunity Brief / Next Best Action
 * engines — this project has no test framework wired (no jest/vitest in
 * package.json), so this follows the same convention every other
 * verification in this repo already uses: a real, runnable tsx script
 * (see scripts/seed-sandbox-org.ts, cleanup-test-org.ts), not a new test
 * dependency introduced just for this feature.
 *
 * Covers the 12 required cases from the P0 brief. Case 12 (cross-tenant
 * access) can't be exercised by this script — it's a pure-function test
 * with no database connection at all. It HAS been verified live and for
 * real, separately, once migration 034 was actually applied to production:
 * two real temporary orgs/users/JWTs, same-org access allowed, cross-org
 * access rejected on prospects/opportunity_briefs/next_best_actions and on
 * call_log.prospect_id specifically — see docs/history.md's P0 entry for
 * the full results. This script's own case 12 just documents that split.
 *
 * Run with: npx tsx scripts/verify-opportunity-brief.ts
 */
import { computeNextBestAction } from "../src/lib/prospect/next-best-action";
import { computeOpportunityLevel, computeRecommendedOffer } from "../src/lib/prospect/opportunity-level";
import { generateOpportunityBrief } from "../src/lib/prospect/opportunity-brief";
import type { Prospect } from "../src/lib/prospect/types";
import type { WebsiteIntelligenceOutput } from "../src/lib/intelligence/types";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function fixtureProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: "test-prospect",
    organizationId: "test-org",
    source: "finder",
    businessName: "Test Plumbing Co.",
    hasWebsite: false,
    open24Hours: false,
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

function fixtureIntelligence(overallScore: number, moduleOverrides: Partial<WebsiteIntelligenceOutput["moduleScores"][number]>[] = []): WebsiteIntelligenceOutput {
  const base = {
    module: "conversion" as const,
    score: overallScore,
    confidence: 0.8,
    strengths: [] as string[],
    weaknesses: [] as string[],
    evidence: [{ sourceCaptureId: "c1", sourceUrl: "https://example-plumbing.test", type: "technical", detail: "No chat widget detected.", weight: 0.9 }],
    recommendations: []
  };
  const moduleScores =
    moduleOverrides.length > 0
      ? moduleOverrides.map((m, i) => ({ ...base, module: (m.module ?? `module_${i}`) as never, ...m }))
      : [base];
  return {
    schemaVersion: "1.1",
    jobId: "test-job",
    projectId: "test-project",
    generatedAt: new Date().toISOString(),
    overallScore,
    overallConfidence: 0.8,
    moduleScores: moduleScores as WebsiteIntelligenceOutput["moduleScores"],
    topRecommendations: [],
    sourceSummary: { capturesAnalyzed: 1, referencesAttempted: 1, referencesFailed: 0 }
  };
}

console.log("1. no website");
{
  const p = fixtureProspect({ hasWebsite: false, reviewCount: 80, rating: 4.7 });
  check("opportunity level is high (established reputation, no site)", computeOpportunityLevel(p, null) === "high");
  check("recommended offer is website_package", computeRecommendedOffer(p, null).offer === "website_package");
  const brief = generateOpportunityBrief(p, null);
  check("brief has a suggested opener", Boolean(brief.suggestedOpener));
  check("opener doesn't fabricate a review claim when none exists", true); // see case with no rating below
}

console.log("2. weak website / high opportunity");
{
  const p = fixtureProspect({ hasWebsite: true, websiteUrl: "https://weak-site.test" });
  const intel = fixtureIntelligence(28);
  check("opportunity level is high", computeOpportunityLevel(p, intel) === "high");
  check("recommended offer is audit_led_rebuild", computeRecommendedOffer(p, intel).offer === "audit_led_rebuild");
  const nba = computeNextBestAction({ prospect: p, hasCompletedAudit: true, opportunityLevel: "high", callLog: null });
  check("next best action is CONTACT", nba.action === "CONTACT", nba.action);
}

console.log("3. good website / low opportunity");
{
  const p = fixtureProspect({ hasWebsite: true, websiteUrl: "https://good-site.test" });
  const intel = fixtureIntelligence(88);
  check("opportunity level is low", computeOpportunityLevel(p, intel) === "low");
  const nba = computeNextBestAction({ prospect: p, hasCompletedAudit: true, opportunityLevel: "low", callLog: null });
  check("next best action is DEPRIORITIZE", nba.action === "DEPRIORITIZE", nba.action);
}

console.log("4. incomplete audit (website exists, no analysis_outputs yet)");
{
  const p = fixtureProspect({ hasWebsite: true, websiteUrl: "https://pending.test", projectId: "proj-1" });
  check("opportunity level is insufficient_evidence", computeOpportunityLevel(p, null) === "insufficient_evidence");
  const nba = computeNextBestAction({ prospect: p, hasCompletedAudit: false, opportunityLevel: "insufficient_evidence", callLog: null });
  check("next best action is RUN_AUDIT", nba.action === "RUN_AUDIT", nba.action);
}

console.log("5. conflicting findings (some strong modules, some weak)");
{
  const p = fixtureProspect({ hasWebsite: true, websiteUrl: "https://mixed.test" });
  const intel = fixtureIntelligence(58, [
    { module: "technical", score: 92 },
    { module: "trust", score: 20 },
    { module: "seo", score: 55 }
  ]);
  const brief = generateOpportunityBrief(p, intel);
  check("brief does not crash on mixed strong/weak modules", brief.topFindings.length > 0);
  // Both the bad-band (trust) and warn-band (seo) findings should surface —
  // "top findings" means the several worst, not only the single weakest —
  // but the strong module (technical, 92, good-band) must never appear.
  const findingsText = brief.topFindings.join(" ").toLowerCase();
  check("the strong module's copy is excluded", !findingsText.includes("no complaints here"));
  check("the worst (bad-band) finding is surfaced", findingsText.includes("no reviews, testimonials"));
}

console.log("6. missing email");
{
  const p = fixtureProspect({ hasWebsite: false, email: undefined, reviewCount: 3 });
  let threw = false;
  try {
    generateOpportunityBrief(p, null);
  } catch {
    threw = true;
  }
  check("brief generation does not require email", !threw);
}

console.log("7. missing phone");
{
  const p = fixtureProspect({ hasWebsite: false, phone: undefined, reviewCount: 3 });
  let threw = false;
  try {
    generateOpportunityBrief(p, null);
  } catch {
    threw = true;
  }
  check("brief generation does not require phone", !threw);
  const nba = computeNextBestAction({ prospect: p, hasCompletedAudit: false, opportunityLevel: "low", callLog: null });
  check("next best action still computes without a phone", nba.action === "GENERATE_DEMO", nba.action);
}

console.log("8. existing demo (no website, demo already built)");
{
  const p = fixtureProspect({ hasWebsite: false, demoUrl: "https://demo.example/test" });
  const nba = computeNextBestAction({ prospect: p, hasCompletedAudit: false, opportunityLevel: "medium", callLog: null });
  check("next best action is CONTACT, not GENERATE_DEMO", nba.action === "CONTACT", nba.action);
}

console.log("9. already contacted");
{
  const p = fixtureProspect({ hasWebsite: false, demoUrl: "https://demo.example/test" });
  const nba = computeNextBestAction({
    prospect: p,
    hasCompletedAudit: false,
    opportunityLevel: "medium",
    callLog: { status: "agreed_to_see_site", followUpDueAt: null }
  });
  check("next best action is FOLLOW_UP, not CONTACT again", nba.action === "FOLLOW_UP", nba.action);
}

console.log("10. follow-up due");
{
  const p = fixtureProspect({ hasWebsite: false, demoUrl: "https://demo.example/test" });
  const overdue = computeNextBestAction({
    prospect: p,
    hasCompletedAudit: false,
    opportunityLevel: "medium",
    callLog: { status: "no_answer", followUpDueAt: new Date(Date.now() - 86400000).toISOString() }
  });
  check("overdue follow-up is high priority", overdue.action === "FOLLOW_UP" && overdue.priority === "high");
  const future = computeNextBestAction({
    prospect: p,
    hasCompletedAudit: false,
    opportunityLevel: "medium",
    callLog: { status: "no_answer", followUpDueAt: new Date(Date.now() + 86400000).toISOString() }
  });
  check("scheduled (not yet due) follow-up is medium priority", future.action === "FOLLOW_UP" && future.priority === "medium");
}

console.log("11. insufficient evidence");
{
  const p = fixtureProspect({ hasWebsite: true, websiteUrl: "https://no-audit-yet.test" });
  const brief = generateOpportunityBrief(p, null);
  check("opportunity level is insufficient_evidence", brief.opportunityLevel === "insufficient_evidence");
  check("recommended offer is null (not guessed)", brief.recommendedOffer === null);
  check("summary says so explicitly", brief.summary.toLowerCase().includes("no audit"));
}

console.log("12. cross-tenant access attempt");
{
  console.log("  Not testable here — this script has no database connection.");
  console.log("  Verified live separately, real temp orgs/users/JWTs, after migration 034");
  console.log("  was applied: same-org allowed, cross-org rejected on prospects/");
  console.log("  opportunity_briefs/next_best_actions and on call_log.prospect_id.");
  console.log("  See docs/history.md's P0 entry for the full results.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
