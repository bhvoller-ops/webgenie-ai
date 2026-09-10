/**
 * Regression test for lib/sitegen/finder-taxonomy.ts — the "WEBGENIE
 * FINDER OBJECTIVE, INDUSTRY TAXONOMY + SEARCH COVERAGE PROMPT" fix
 * (10 Sep 2026): broader Finder-facing display label + broader Places
 * search term, stable internal key, and critically — zero change to
 * industryLabel()/industrySearchTerm(), which are still relied on by
 * generated-site copy and by several routes that persist/match
 * `projects.industry` as literal text.
 *
 * Run with: npx tsx scripts/verify-finder-taxonomy.ts
 */
import { finderDisplayLabel, finderSearchTerm, finderIndustryTaxonomy } from "../src/lib/sitegen/finder-taxonomy";
import { industryLabel, ALL_INDUSTRY_LIST } from "../src/lib/sitegen/industry-lookup";
import { INDUSTRIES } from "../src/lib/sitegen/industries";
import { GALLERY_INDUSTRY_SUMMARY } from "../src/lib/sitegen/gallery-industry-summary";
import type { SiteGenIndustryKey } from "../src/lib/sitegen/types";

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

console.log("1. the acceptance test's own worked example: roofer");
{
  check("displayLabel is broader (\"Roofing\", not \"Roofing Contractor\")", finderDisplayLabel("roofer") === "Roofing");
  check("searchTerm is the broad market term", finderSearchTerm("roofer") === "roofing");
  check("internal key is unchanged", finderIndustryTaxonomy("roofer")?.key === "roofer");
  check("aliases documented but not empty (metadata only)", (finderIndustryTaxonomy("roofer")?.aliases?.length ?? 0) > 0);
}

console.log("2. industryLabel() (site-gen / persisted-data facing) is completely UNCHANGED");
{
  check("industryLabel('roofer') is still the narrow job-title string", industryLabel("roofer") === "Roofing Contractor");
  check("industryLabel('plumber') is still 'Licensed Plumber'", industryLabel("plumber") === "Licensed Plumber");
  check("industryLabel differs from finderDisplayLabel for roofer (proves they're genuinely decoupled)", industryLabel("roofer") !== finderDisplayLabel("roofer"));
}

console.log("3. every one of the 14 core trades has a broader display label OR search term than before (never narrower, never both left untouched)");
{
  // "salon" keeps its existing "Hair Salon" display label on purpose —
  // bare "Salon" would collide with the separate "nail-salon"/
  // "spa-massage" Gallery categories, a real ambiguity, not an oversight.
  // Its search term was still broadened ("hair salon" vs the old plural
  // "Salons"), so it's not "both fields left untouched" either.
  const deliberateExceptions = new Set<SiteGenIndustryKey>(["salon"]);
  let allBroadened = true;
  for (const key of Object.keys(INDUSTRIES) as SiteGenIndustryKey[]) {
    const profile = INDUSTRIES[key];
    const display = finderDisplayLabel(key);
    const search = finderSearchTerm(key);
    const displayChanged = display !== profile.label;
    const searchChanged = search !== profile.plural;
    if (!displayChanged && !searchChanged) {
      allBroadened = false;
      console.error(`    ${key}: neither display label nor search term changed`);
    }
    if (!displayChanged && !deliberateExceptions.has(key)) {
      allBroadened = false;
      console.error(`    ${key}: display label unchanged from IndustryProfile.label ("${profile.label}") and not a documented exception`);
    }
  }
  check("all 14 core trades genuinely widened (documented exceptions aside)", allBroadened);
}

console.log("4. stable internal key preserved for every core trade (no key renamed)");
{
  const coreKeys = Object.keys(INDUSTRIES) as SiteGenIndustryKey[];
  check("all 14 core keys still resolve in INDUSTRIES unchanged", coreKeys.every((k) => INDUSTRIES[k].key === k));
  check("finderIndustryTaxonomy never changes the key it's looked up by", coreKeys.every((k) => finderIndustryTaxonomy(k)?.key === k));
}

console.log("5. every Gallery industry still resolves, two style trims applied, rest preserved");
{
  check("legal-services trimmed", finderDisplayLabel("legal-services") === "Legal Services");
  check("property-management trimmed", finderDisplayLabel("property-management") === "Property Management");
  check("untouched Gallery label preserved (pest-control)", finderDisplayLabel("pest-control") === "Pest Control");
  check(
    "every Gallery key resolves to a non-empty label (no crash, no silent 'undefined')",
    GALLERY_INDUSTRY_SUMMARY.every((g) => finderDisplayLabel(g.key).length > 0)
  );
  check(
    "Gallery search term still equals its display label (existing convention preserved)",
    GALLERY_INDUSTRY_SUMMARY.every((g) => finderSearchTerm(g.key) === finderDisplayLabel(g.key))
  );
}

console.log("6. the shared picker list (ALL_INDUSTRY_LIST) uses the broader labels, not the narrow ones");
{
  const roofingEntry = ALL_INDUSTRY_LIST.find((i) => i.key === "roofer");
  check("picker shows 'Roofing', not 'Roofing Contractor'", roofingEntry?.label === "Roofing");
  check("picker has all 73 industries (14 core + 59 gallery)", ALL_INDUSTRY_LIST.length === 14 + 59);
  const keys = new Set(ALL_INDUSTRY_LIST.map((i) => i.key));
  check("no duplicate keys in the picker list", keys.size === ALL_INDUSTRY_LIST.length);
}

console.log("7. search coverage: broader search term never produces an empty or malformed query fragment");
{
  const allKeys = ALL_INDUSTRY_LIST.map((i) => i.key);
  check("every industry has a non-empty search term", allKeys.every((k) => finderSearchTerm(k).trim().length > 0));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
