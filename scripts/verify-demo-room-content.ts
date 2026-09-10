/**
 * Regression test for lib/prospect/demo-room-content.ts — P1 Demo Room's
 * client-safe filtering (master prompt sections 30-33, test matrix
 * section 50 items 38-42).
 *
 * Run with: npx tsx scripts/verify-demo-room-content.ts
 */
import { buildClientSafeFindings, buildWhatWedImprove, buildIntroLine } from "../src/lib/prospect/demo-room-content";
import type { OpportunityBrief } from "../src/lib/prospect/types";

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

function brief(overrides: Partial<OpportunityBrief> = {}): OpportunityBrief {
  return {
    id: "b1", prospectId: "p1", version: 1, opportunityLevel: "high",
    summary: "x", reasonsToContact: ["4.9 rating from 120 reviews", "No website listed", "Reachable by phone"],
    topFindings: ["Homepage takes 5.8s to become interactive", "No clear call to action above the fold", "Mobile layout breaks on small screens", "A fourth finding that should be truncated"],
    recommendedOffer: null, recommendedOfferReason: null, secondaryOpportunities: [], salesAngle: "internal only -- never shown", suggestedOpener: "internal only", confidence: 0.7,
    evidenceReferences: [], inputFingerprint: "x", generatedAt: "",
    ...overrides
  };
}

console.log("1. audited, has-website prospect -> real audit findings, capped at 3");
{
  const findings = buildClientSafeFindings({ hasWebsite: true }, brief(), true);
  check("exactly 3 findings (capped)", findings.length === 3);
  check("first finding is a real audit finding", findings[0].detail === "Homepage takes 5.8s to become interactive");
  check("the 4th finding is truncated, not included", !findings.some((f) => f.detail.includes("fourth finding")));
}

console.log("2. no-website prospect (no audit exists) -> uses reasonsToContact, never fabricated audit findings");
{
  const findings = buildClientSafeFindings({ hasWebsite: false }, brief(), false);
  check("uses public reasons-to-contact, not audit findings", findings.every((f) => brief().reasonsToContact.includes(f.detail)));
  check("never includes an audit-only finding", !findings.some((f) => f.detail.includes("interactive")));
}

console.log("3. no brief yet -> empty findings, no crash");
{
  const findings = buildClientSafeFindings({ hasWebsite: true }, null, false);
  check("empty array, no crash", findings.length === 0);
}

console.log("4. internal-only fields never leak into client-safe findings");
{
  const b = brief();
  const findings = buildClientSafeFindings({ hasWebsite: true }, b, true);
  const allText = findings.map((f) => f.detail).join(" ");
  check("sales angle never appears", !allText.includes("internal only"));
  check("suggested opener never appears", !allText.includes("internal only"));
}

console.log("5. what-we'd-improve: qualitative only, capped at 3, no revenue promise");
{
  const withSite = buildWhatWedImprove(true);
  const withoutSite = buildWhatWedImprove(false);
  check("capped at 3", withSite.length === 3 && withoutSite.length === 3);
  check("no revenue/dollar promise in either list", ![...withSite, ...withoutSite].some((s) => /revenue|\$|profit|sales increase/i.test(s)));
  check("no-website list mentions building a real website", withoutSite.some((s) => s.toLowerCase().includes("website")));
}

console.log("6. intro line avoids the word 'audit'");
{
  const line = buildIntroLine("Atlanta Roofing Co.");
  check("mentions the business by name", line.includes("Atlanta Roofing Co."));
  check("does not use the word 'audit'", !line.toLowerCase().includes("audit"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
