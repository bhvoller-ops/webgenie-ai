/**
 * Regression test for lib/prospect/finder-view.ts — P0.5's Finder table
 * filter/sort/pagination/status logic. Covers test matrix items 11-22
 * (result display) using synthetic rows built from real Preliminary
 * Opportunity output (not a reimplementation of that scoring).
 *
 * Run with: npx tsx scripts/verify-finder-view.ts
 */
import { filterResults, sortResults, paginate, statusLabel } from "../src/lib/prospect/finder-view";
import { computePreliminaryOpportunity } from "../src/lib/prospect/preliminary-opportunity";
import type { FinderResultRow } from "../src/app/api/prospects/route";

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

function row(
  partial: Partial<FinderResultRow> & { name: string; noPhone?: boolean; auditOverallScore?: number }
): FinderResultRow {
  const business = {
    id: partial.id ?? `id_${partial.name}`,
    name: partial.name,
    industry: "roofer" as const,
    phone: partial.noPhone ? "" : partial.phone ?? "(404) 555-0100",
    address: "1 Main St",
    city: "Atlanta",
    state: "GA",
    rating: partial.rating,
    reviewCount: partial.reviewCount,
    website: partial.website,
    source: "places" as const,
    isLikelyChain: partial.isLikelyChain
  };
  return {
    ...business,
    prospectId: partial.prospectId,
    prospectStatus: partial.prospectStatus,
    hasCompletedAudit: partial.hasCompletedAudit ?? false,
    preliminaryOpportunity: computePreliminaryOpportunity(
      business,
      partial.hasCompletedAudit ? { hasCompletedAudit: true, auditOverallScore: partial.auditOverallScore ?? 90 } : null
    )
  };
}

// 11-14: all returned businesses accessible, website/no-website remain visible, pagination
console.log("11-14. all real results accessible, website/no-website remain visible, pagination works");
{
  const rows: FinderResultRow[] = [];
  for (let i = 0; i < 40; i++) {
    rows.push(row({ name: `Business ${i}`, website: i % 3 === 0 ? null : "https://example.test", rating: 4, reviewCount: 30 + i }));
  }
  check("40 real rows all present via 'all' filter", filterResults(rows, "all").length === 40);
  check("website businesses remain visible under 'all'", filterResults(rows, "all").some((r) => r.website));
  check("no-website businesses remain visible under 'all'", filterResults(rows, "all").some((r) => !r.website));
  const page1 = paginate(rows, 1, 25);
  const page2 = paginate(rows, 2, 25);
  check("pagination page 1 has 25", page1.length === 25);
  check("pagination page 2 has remaining 15", page2.length === 15);
  check("pages don't overlap", page1[0].name !== page2[0].name);
}

console.log("15-19. filters");
{
  const rows = [
    row({ name: "A", website: "https://a.test", rating: 4.9, reviewCount: 300 }), // recommended, has website
    row({ name: "B", website: null, rating: undefined, reviewCount: undefined, noPhone: true }), // genuinely no data at all -> insufficient_data
    // audited with a strong existing site (auditOverallScore 90) -> "low" preliminary opportunity, kept out of "Recommended"
    row({ name: "C", website: "https://c.test", hasCompletedAudit: true, prospectId: "p1", prospectStatus: "audited", auditOverallScore: 90 }),
    row({ name: "D", website: null, rating: 4.8, reviewCount: 200 }) // no website, recommended
  ];
  check("Has Website filter", filterResults(rows, "has_website").every((r) => r.website) && filterResults(rows, "has_website").length === 2);
  check("No Website filter", filterResults(rows, "no_website").every((r) => !r.website) && filterResults(rows, "no_website").length === 2);
  check("Not Audited filter excludes C", !filterResults(rows, "not_audited").some((r) => r.name === "C"));
  check("Audited filter includes only C", filterResults(rows, "audited").length === 1 && filterResults(rows, "audited")[0].name === "C");
  check("Recommended filter includes A and D (high opportunity), excludes low-opportunity audited C", filterResults(rows, "recommended").map((r) => r.name).sort().join(",") === "A,D");
  check("Needs Data filter includes B (genuinely no data)", filterResults(rows, "needs_data").some((r) => r.name === "B"));
}

console.log("20-22. sorting");
{
  const rows = [
    row({ name: "Zeta", rating: 3.0, reviewCount: 10 }),
    row({ name: "Alpha", rating: 4.9, reviewCount: 500 }),
    row({ name: "Mid", rating: 4.0, reviewCount: 50 })
  ];
  const byRating = sortResults(rows, "rating");
  check("rating sort descending", byRating[0].name === "Alpha" && byRating[2].name === "Zeta");
  const byReviews = sortResults(rows, "reviews");
  check("review sort descending", byReviews[0].name === "Alpha" && byReviews[2].name === "Zeta");
  const byRecommended = sortResults(rows, "recommended");
  check("recommended sort descending by score", byRecommended[0].preliminaryOpportunity.score >= byRecommended[1].preliminaryOpportunity.score);
  const byName = sortResults(rows, "name");
  check("name sort alphabetical", byName[0].name === "Alpha" && byName[1].name === "Mid" && byName[2].name === "Zeta");
  check("sortResults does not mutate the original array order", rows[0].name === "Zeta");
}

console.log("status labels");
{
  check("not opened", statusLabel({ prospectId: undefined, prospectStatus: undefined, hasCompletedAudit: false, website: null }) === "Not Opened");
  check("prospect (opened, no website)", statusLabel({ prospectId: "p1", prospectStatus: "new", hasCompletedAudit: false, website: null }) === "Prospect");
  check("audit ready (opened, has website, no audit)", statusLabel({ prospectId: "p1", prospectStatus: "new", hasCompletedAudit: false, website: "https://x.test" }) === "Audit Ready");
  check("audited", statusLabel({ prospectId: "p1", prospectStatus: "audited", hasCompletedAudit: true, website: "https://x.test" }) === "Audited");
  check("demo ready", statusLabel({ prospectId: "p1", prospectStatus: "demo_ready", hasCompletedAudit: false, website: null }) === "Demo Ready");
  check("contacted falls back to its own real label", statusLabel({ prospectId: "p1", prospectStatus: "contacted", hasCompletedAudit: false, website: null }) === "Contacted");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
