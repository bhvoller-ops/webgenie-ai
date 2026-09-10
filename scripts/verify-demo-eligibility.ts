/**
 * Regression test for lib/prospect/demo-eligibility.ts — P0.5 pre-merge
 * readiness review, section 3, items B (Create Redesign Demo) and C
 * (imported GMB data optionally feeds a demo). Pure functions, testable
 * without a DB; the server route (/api/prospects/[id]/actions) uses the
 * exact same functions, not a reimplementation.
 *
 * Run with: npx tsx scripts/verify-demo-eligibility.ts
 */
import { canCreateRedesignDemo, fieldsForDemoBusiness } from "../src/lib/prospect/demo-eligibility";

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

console.log("1. canCreateRedesignDemo -- section 34's exact rule");
{
  check(
    "no website at all -> never eligible, regardless of everything else",
    !canCreateRedesignDemo({ hasWebsite: false, projectId: "p1" }, true, "high")
  );
  check(
    "has website but no audit project yet -> not eligible",
    !canCreateRedesignDemo({ hasWebsite: true, projectId: undefined }, false, undefined)
  );
  check(
    "has website + project, but audit not completed (hasIntelligence false) -> not eligible",
    !canCreateRedesignDemo({ hasWebsite: true, projectId: "p1" }, false, "high")
  );
  check(
    "has website + completed audit + LOW opportunity -> not eligible (not worth a redesign pitch)",
    !canCreateRedesignDemo({ hasWebsite: true, projectId: "p1" }, true, "low")
  );
  check(
    "has website + completed audit + INSUFFICIENT_EVIDENCE -> not eligible",
    !canCreateRedesignDemo({ hasWebsite: true, projectId: "p1" }, true, "insufficient_evidence")
  );
  check(
    "has website + completed audit + HIGH opportunity -> eligible",
    canCreateRedesignDemo({ hasWebsite: true, projectId: "p1" }, true, "high")
  );
  check(
    "has website + completed audit + MEDIUM opportunity -> eligible",
    canCreateRedesignDemo({ hasWebsite: true, projectId: "p1" }, true, "medium")
  );
}

console.log("2. fieldsForDemoBusiness -- imported GMB data feeds the demo, source facts stay authoritative");
{
  const publicProfile = { placeId: "x", phone: "(404) 555-0199", rating: 4.7, reviewCount: 312, fetchedAt: new Date().toISOString() };

  const noOwnData = fieldsForDemoBusiness({ phone: undefined, rating: undefined, reviewCount: undefined }, publicProfile);
  check("phone filled in from public profile when prospect's own is missing", noOwnData.phone === "(404) 555-0199");
  check("rating filled in from public profile when prospect's own is missing", noOwnData.rating === 4.7);
  check("reviewCount filled in from public profile when prospect's own is missing", noOwnData.reviewCount === 312);

  const hasOwnData = fieldsForDemoBusiness({ phone: "(555) 000-1111", rating: 3.2, reviewCount: 9 }, publicProfile);
  check("prospect's own phone is never overridden by public profile", hasOwnData.phone === "(555) 000-1111");
  check("prospect's own rating is never overridden by public profile", hasOwnData.rating === 3.2);
  check("prospect's own reviewCount is never overridden by public profile", hasOwnData.reviewCount === 9);

  const noProfile = fieldsForDemoBusiness({ phone: undefined, rating: undefined, reviewCount: undefined }, null);
  check("no public profile at all -> empty phone string, undefined rating/reviewCount (never fabricated)", noProfile.phone === "" && noProfile.rating === undefined && noProfile.reviewCount === undefined);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
