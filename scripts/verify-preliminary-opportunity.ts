/**
 * Regression test for lib/prospect/preliminary-opportunity.ts — P0.5's
 * deterministic Preliminary Opportunity scoring. Covers the P0.5 master
 * prompt's test matrix items 23-28 (opportunity separate from confidence,
 * evidence provenance, no unsupported website-weakness claims) plus the
 * two worked examples from section 12.
 *
 * Run with: npx tsx scripts/verify-preliminary-opportunity.ts
 */
import { computePreliminaryOpportunity } from "../src/lib/prospect/preliminary-opportunity";

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

console.log("1. section 12 example A: strong public profile + website -> should NOT be low/insufficient just for having a site");
{
  const r = computePreliminaryOpportunity({ website: "https://example.test", rating: 4.8, reviewCount: 250, phone: "(404) 555-0100" });
  check("level is high", r.level === "high");
  check("confidence is high (3 real data points)", r.confidence === "high");
  check("recommended next step is RUN_AUDIT (website exists, not yet audited)", r.recommendedNextStep === "RUN_AUDIT");
  check("websiteStatus is present", r.websiteStatus === "present");
}

console.log("2. section 12 example B: no website, 2 reviews, no phone, sparse data -> LOW or INSUFFICIENT_DATA, not automatically high");
{
  const r = computePreliminaryOpportunity({ website: null, rating: undefined, reviewCount: 2, phone: "" });
  check("level is low or insufficient_data (never high/medium)", r.level === "low" || r.level === "insufficient_data");
  check("no website did not automatically produce high opportunity", r.level !== "high");
}

console.log("3. strong public profile + no website -> high opportunity, Build New Site Demo");
{
  const r = computePreliminaryOpportunity({ website: null, rating: 4.9, reviewCount: 300, phone: "(404) 555-0199" });
  check("level is high", r.level === "high");
  check("recommendedNextStep is BUILD_NEW_SITE_DEMO", r.recommendedNextStep === "BUILD_NEW_SITE_DEMO");
  check("websiteStatus is absent", r.websiteStatus === "absent");
}

console.log("4. weak/sparse public profile (nothing at all) -> insufficient_data, low confidence");
{
  const r = computePreliminaryOpportunity({ website: undefined, rating: undefined, reviewCount: undefined, phone: "" });
  check("level is insufficient_data", r.level === "insufficient_data");
  check("confidence is low", r.confidence === "low");
  check("score is 0", r.score === 0);
  check("websiteStatus is unknown (website field itself absent)", r.websiteStatus === "unknown");
}

console.log("5. opportunity is kept separate from confidence");
{
  // High score signals but only 2 of 3 data points present -> confidence
  // should be "medium", independent of the level computed from the score.
  const r = computePreliminaryOpportunity({ website: null, rating: 4.9, reviewCount: 300, phone: "" });
  check("level is still high (strong signals)", r.level === "high");
  check("confidence is medium, not tied 1:1 to level (only 2 of 3 signals present)", r.confidence === "medium");
}

console.log("6. evidence preserves provenance (source + type on every item, never generated prose)");
{
  const r = computePreliminaryOpportunity({ website: "https://example.test", rating: 4.2, reviewCount: 40, phone: "(404) 555-0100" });
  check("every evidence item has a source", r.evidence.every((e) => typeof e.source === "string" && e.source.length > 0));
  check("every evidence item has a type", r.evidence.every((e) => typeof e.type === "string" && e.type.length > 0));
  check("sources are only the three legitimate ones", r.evidence.every((e) => ["finder", "google_places", "website_audit"].includes(e.source)));
  check("rating evidence sourced from google_places", r.evidence.find((e) => e.type === "google_rating")?.source === "google_places");
}

console.log("7. unsupported website-weakness claims are never generated");
{
  const r = computePreliminaryOpportunity({ website: "https://example.test", rating: 4.5, reviewCount: 80, phone: "(404) 555-0100" });
  const allText = [...r.reasons.map((x) => x.text), ...r.evidence.map((x) => x.label)].join(" ").toLowerCase();
  const forbidden = ["losing leads", "poor seo", "needs a redesign", "don't answer calls", "no booking system", "losing $", "outdated"];
  check("no forbidden unsupported claims present (no audit exists yet)", !forbidden.some((f) => allText.includes(f)));
}

console.log("8. multi-location chain flagged, not silently ignored");
{
  const r = computePreliminaryOpportunity({ website: "https://example.test", rating: 4.5, reviewCount: 500, phone: "(404) 555-0100", isLikelyChain: true });
  check("chain evidence present", r.evidence.some((e) => e.type === "multi_location_signal"));
  check("a chain reason is surfaced", r.reasons.some((x) => x.text.toLowerCase().includes("multi-location")));
}

console.log("9. once a real audit exists, defers to the same scale as opportunity-level.ts");
{
  const rGood = computePreliminaryOpportunity(
    { website: "https://example.test", rating: 4.5, reviewCount: 80, phone: "(404) 555-0100" },
    { hasCompletedAudit: true, auditOverallScore: 30 } // low score = high opportunity, same convention as opportunity-level.ts
  );
  check("low audit score -> high preliminary opportunity", rGood.level === "high");
  check("recommendedNextStep is CREATE_REDESIGN_DEMO", rGood.recommendedNextStep === "CREATE_REDESIGN_DEMO");
  check("confidence is high once a real audit exists", rGood.confidence === "high");

  const rWeak = computePreliminaryOpportunity(
    { website: "https://example.test", rating: 4.5, reviewCount: 80, phone: "(404) 555-0100" },
    { hasCompletedAudit: true, auditOverallScore: 90 } // high score = low opportunity (site is already good)
  );
  check("high audit score -> low preliminary opportunity", rWeak.level === "low");
  check("recommendedNextStep is REVIEW (not worth a redesign demo)", rWeak.recommendedNextStep === "REVIEW");
}

console.log("10. website present, no audit yet -> RUN_AUDIT, never a redesign recommendation");
{
  const r = computePreliminaryOpportunity({ website: "https://example.test", rating: 4.5, reviewCount: 80, phone: "(404) 555-0100" });
  check("recommendedNextStep is RUN_AUDIT, not CREATE_REDESIGN_DEMO", r.recommendedNextStep === "RUN_AUDIT");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
