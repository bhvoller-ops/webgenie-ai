/**
 * Regression test for the Finder -> Open Opportunity production defect
 * (10 Sep 2026, docs/history.md): real Google Places businesses with no
 * phone on file were rejected with a generic "Invalid business data.",
 * because lib/prospect/finder.ts normalizes a missing phone to "" and the
 * route's schema required it non-empty. Reproduced live against
 * production with real Roofing/Atlanta-metro Finder results before this
 * fix; see docs/history.md for the exact failing businesses.
 *
 * Imports the real, unmodified validation schema the route itself uses
 * (lib/prospect/business-schema.ts) -- not a reimplementation.
 *
 * Run with: npx tsx scripts/verify-open-opportunity.ts
 */
import { businessSchema } from "../src/lib/prospect/business-schema";

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

const base = {
  id: "ChIJtest123",
  name: "Test Roofing Co.",
  industry: "roofer",
  city: "Atlanta",
  state: "GA",
  source: "places" as const
};

console.log("1. Roofing business with website");
{
  const r = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", website: "https://example-roofing.test" });
  check("accepted", r.success);
}

console.log("2. Roofing business without website");
{
  const r = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", website: null });
  check("accepted", r.success);
}

console.log("3. business with phone missing (the real production defect)");
{
  const rEmpty = businessSchema.safeParse({ ...base, phone: "" });
  check("empty-string phone accepted (the real Google Places shape)", rEmpty.success);
  const rAbsent = businessSchema.safeParse({ ...base });
  check("phone field entirely absent also accepted", rAbsent.success);
}

console.log("4. business with rating missing");
{
  const r = businessSchema.safeParse({ ...base, phone: "(404) 555-0100" });
  check("accepted (rating was already optional)", r.success);
}

console.log("5. business with review count missing");
{
  const r = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", rating: 4.5 });
  check("accepted (reviewCount was already optional)", r.success);
}

console.log("6. business with address fields partially missing");
{
  const r = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", address: "" });
  check("empty address accepted (already the existing convention)", r.success);
  const rNoCity = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", city: "" });
  check("empty city correctly still REJECTED (city stays required)", !rNoCity.success);
}

console.log("7. valid Google Places place_id");
{
  const r = businessSchema.safeParse({ ...base, id: "ChIJq6qqqpr784gRQcrkHrZpu_Q", phone: "" });
  check("real-shaped place id accepted alongside missing phone", r.success);
}

console.log("8. malformed payload — must still be rejected");
{
  const r1 = businessSchema.safeParse({ ...base, name: "" }); // blank name
  check("blank name rejected", !r1.success);
  const r2 = businessSchema.safeParse({ ...base, source: "not-a-real-source" });
  check("invalid source enum rejected", !r2.success);
  const r3 = businessSchema.safeParse(null);
  check("null payload rejected", !r3.success);
  const r4 = businessSchema.safeParse({ ...base, id: "" });
  check("blank id rejected", !r4.success);
}

console.log("9. cross-tenant protections remain unchanged");
{
  // The schema itself carries no tenant data at all -- organizationId
  // comes from requireAdminApi()'s real session, never the request body.
  // Confirming the schema has no organization_id/organizationId field a
  // caller could even attempt to set.
  const shape = businessSchema.safeParse({ ...base, phone: "(404) 555-0100", organizationId: "some-other-org" });
  check(
    "an org id in the payload is silently stripped, never trusted",
    shape.success && !("organizationId" in (shape.data as object))
  );
}

console.log("10. duplicate open of same Finder business behaves correctly");
{
  console.log("  Verified live in production (not a schema-level concern): re-opening the same");
  console.log("  business (same Google Place id) twice returned the identical prospectId both");
  console.log("  times, HTTP 200 -- idempotent, no duplicate row created. See docs/history.md.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
