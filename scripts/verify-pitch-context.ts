/**
 * Regression test for lib/prospect/pitch-context.ts — P1's grounded
 * Pitch Context Engine (master prompt sections 15/20). Covers test
 * matrix section 49 items 25-27 at the context-building layer (evidence
 * grounding, no fabrication, no unsupported "I reviewed your site").
 *
 * Run with: npx tsx scripts/verify-pitch-context.ts
 */
import { buildPitchContext, renderPitchContextForPrompt, PITCH_PROHIBITED_CLAIMS } from "../src/lib/prospect/pitch-context";
import type { OpportunityBrief, Prospect } from "../src/lib/prospect/types";

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

function prospect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: "p1", organizationId: "org1", source: "finder", businessName: "Atlanta Roofing Co.",
    hasWebsite: false, open24Hours: false, status: "new", createdAt: "", updatedAt: "",
    ...overrides
  };
}

function brief(overrides: Partial<OpportunityBrief> = {}): OpportunityBrief {
  return {
    id: "b1", prospectId: "p1", version: 1, opportunityLevel: "high",
    summary: "test", reasonsToContact: ["4.9 rating from 120 reviews"], topFindings: [],
    recommendedOffer: "website_package", recommendedOfferReason: "no website exists",
    secondaryOpportunities: [], salesAngle: null, suggestedOpener: null, confidence: 0.8,
    evidenceReferences: [{ type: "google_rating", sourceUrl: "", detail: "4.9 rating", weight: 1 }],
    inputFingerprint: "x", generatedAt: "",
    ...overrides
  };
}

console.log("1. no website, no audit -> auditFindings empty, unknowns say website conversion is unknown");
{
  const ctx = buildPitchContext(prospect(), brief(), false, "VibeLabs Agency");
  check("auditFindings is empty (no real audit exists)", ctx.auditFindings.length === 0);
  check("unknowns mention website conversion is unknown", ctx.unknowns.some((u) => u.toLowerCase().includes("convert")));
  check("evidence carries real reasons/detail", ctx.opportunityEvidence.length > 0);
}

console.log("2. has website + no audit -> auditFindings still empty even if brief has stale topFindings");
{
  const ctx = buildPitchContext(prospect({ hasWebsite: true }), brief({ topFindings: ["should never appear -- no real audit"] }), false, "VibeLabs Agency");
  check("auditFindings empty when hasCompletedAudit is false, regardless of brief content", ctx.auditFindings.length === 0);
}

console.log("3. has website + real completed audit -> real findings flow through");
{
  const ctx = buildPitchContext(prospect({ hasWebsite: true }), brief({ topFindings: ["Homepage takes 5.8s to become interactive"] }), true, "VibeLabs Agency");
  check("real audit findings present", ctx.auditFindings.includes("Homepage takes 5.8s to become interactive"));
}

console.log("4. no brief at all (not yet generated) -> safe empty context, no crash");
{
  const ctx = buildPitchContext(prospect(), null, false, "VibeLabs Agency");
  check("no crash, empty evidence", ctx.opportunityEvidence.length === 0);
  check("recommendedOffer is null, not fabricated", ctx.recommendedOffer === null);
}

console.log("5. rendered prompt text explicitly separates FACTS / AUDIT FINDINGS / RECOMMENDATIONS / UNKNOWN");
{
  const ctx = buildPitchContext(prospect({ hasWebsite: true }), brief({ topFindings: ["real finding"] }), true, "VibeLabs Agency");
  const text = renderPitchContextForPrompt(ctx);
  check("has FACTS section", text.includes("FACTS"));
  check("has AUDIT FINDINGS section", text.includes("AUDIT FINDINGS"));
  check("has RECOMMENDATIONS section", text.includes("RECOMMENDATIONS"));
  check("has UNKNOWN section", text.includes("UNKNOWN"));
  check("has an explicit NEVER SAY OR IMPLY section", text.includes("NEVER SAY OR IMPLY"));
}

console.log("6. no-audit prompt explicitly states no real audit exists (never silently omitted)");
{
  const ctx = buildPitchContext(prospect({ hasWebsite: true }), brief(), false, "VibeLabs Agency");
  const text = renderPitchContextForPrompt(ctx);
  check("explicitly says no completed audit exists", text.toLowerCase().includes("no real audit has been run") || text.toLowerCase().includes("no completed audit exists"));
}

console.log("7. prohibited claims list covers every section-18 example");
{
  const text = PITCH_PROHIBITED_CLAIMS.join(" ").toLowerCase();
  check("covers 'losing leads'", text.includes("losing leads"));
  check("covers 'SEO is bad'", text.includes("seo is bad"));
  check("covers 'I was reviewing your website'", text.includes("i was reviewing your website"));
  check("covers revenue/dollar claims", text.includes("dollar"));
  check("covers customer counts", text.includes("customer counts"));
  check("covers competitor claims", text.includes("competitor"));
  check("covers owner intent", text.includes("owner"));
  check("covers fabricated urgency", text.includes("urgency"));
  check("covers testimonials", text.includes("testimonial"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
