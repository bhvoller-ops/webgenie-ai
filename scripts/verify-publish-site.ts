/**
 * Regression test for /api/publish-site's phone-validation defect (10 Sep
 * 2026, docs/history.md) -- the identical bug already fixed once for
 * Finder -> Open Opportunity (scripts/verify-open-opportunity.ts): a real
 * Google Places business with no phone on file was rejected with a
 * generic "Invalid business data.", because lib/prospect/finder.ts
 * normalizes a missing phone to "" and this route's own inline schema
 * required it non-empty. Confirmed live against production (a real
 * phone-less Roofing business) before this fix, safely -- the Zod
 * rejection happens before any real Vercel API call, so no deployment was
 * ever created by that reproduction.
 *
 * Imports the real, unmodified `publishSiteBusinessSchema` the route
 * itself now uses (lib/prospect/business-schema.ts) -- not a
 * reimplementation, so this can never silently drift from the route's
 * actual behavior the way the original bug happened in the first place.
 *
 * Run with: npx tsx scripts/verify-publish-site.ts
 */
import { publishSiteBusinessSchema } from "../src/lib/prospect/business-schema";
import { INDUSTRIES } from "../src/lib/sitegen/industries";

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
  id: "ChIJtest456",
  name: "Test Roofing Co.",
  industry: "roofer",
  city: "Atlanta",
  state: "GA",
  source: "places" as const
};

console.log("1. Roofing business with website, all publish-site fields set");
{
  const r = publishSiteBusinessSchema.safeParse({
    ...base,
    phone: "(404) 555-0100",
    website: "https://example-roofing.test",
    hours: "Mon-Fri 8am-5pm",
    placeUrl: "https://maps.google.com/?cid=123",
    heroImageOverride: "https://example.test/hero.jpg",
    secondaryImageOverride: "https://example.test/secondary.jpg"
  });
  check("accepted", r.success);
}

console.log("2. business with phone missing (the real production defect)");
{
  const rEmpty = publishSiteBusinessSchema.safeParse({ ...base, phone: "" });
  check("empty-string phone accepted (the real Google Places shape)", rEmpty.success);
  const rAbsent = publishSiteBusinessSchema.safeParse({ ...base });
  check("phone field entirely absent also accepted", rAbsent.success);
}

console.log("3. business with no publish-site-specific fields (all optional)");
{
  const r = publishSiteBusinessSchema.safeParse({ ...base, phone: "" });
  check(
    "hours/placeUrl/heroImageOverride/secondaryImageOverride all omitted, still accepted",
    r.success
  );
}

console.log("4. business with rating/reviewCount missing");
{
  const r = publishSiteBusinessSchema.safeParse({ ...base, phone: "(404) 555-0100" });
  check("accepted (rating/reviewCount already optional on the base schema)", r.success);
}

console.log("5. business with address fields partially missing");
{
  const r = publishSiteBusinessSchema.safeParse({ ...base, phone: "(404) 555-0100", address: "" });
  check("empty address accepted (existing convention, inherited from base schema)", r.success);
  const rNoCity = publishSiteBusinessSchema.safeParse({ ...base, phone: "(404) 555-0100", city: "" });
  check("empty city correctly still REJECTED (city stays required)", !rNoCity.success);
}

console.log("6. valid real-shaped Google Places place_id, no phone");
{
  const r = publishSiteBusinessSchema.safeParse({
    ...base,
    id: "ChIJq6qqqpr784gRQcrkHrZpu_Q",
    phone: ""
  });
  check("real-shaped place id accepted alongside missing phone", r.success);
}

console.log("7. malformed payloads — must still be rejected");
{
  const r1 = publishSiteBusinessSchema.safeParse({ ...base, name: "" }); // blank name
  check("blank name rejected", !r1.success);
  const r2 = publishSiteBusinessSchema.safeParse({ ...base, source: "not-a-real-source" });
  check("invalid source enum rejected", !r2.success);
  const r3 = publishSiteBusinessSchema.safeParse(null);
  check("null payload rejected", !r3.success);
  const r4 = publishSiteBusinessSchema.safeParse({ ...base, id: "" });
  check("blank id rejected", !r4.success);
}

console.log("8. route's industry-membership check (not schema-level, but same guard the route runs)");
{
  const r = publishSiteBusinessSchema.safeParse({ ...base, phone: "", industry: "roofer" });
  check("schema accepts it", r.success);
  check(
    "route's separate `industry in INDUSTRIES` check would also pass for a known industry",
    r.success && r.data.industry in INDUSTRIES
  );
  const rBogus = publishSiteBusinessSchema.safeParse({ ...base, phone: "", industry: "not-a-real-industry" });
  check(
    "an unknown industry passes the schema (industry is just z.string().min(1)) but the route's separate check would reject it",
    rBogus.success && !(rBogus.data.industry in INDUSTRIES)
  );
}

console.log("9. cross-tenant protections remain unchanged");
{
  // Same as the Open Opportunity schema: no tenant data lives in this
  // payload at all -- organizationId comes from requireAdminApi()'s real
  // session inside the route, never trusted from the request body.
  const shape = publishSiteBusinessSchema.safeParse({
    ...base,
    phone: "(404) 555-0100",
    organizationId: "some-other-org"
  });
  check(
    "an org id in the payload is silently stripped, never trusted",
    shape.success && !("organizationId" in (shape.data as object))
  );
}

console.log("10. no real Vercel deployment risk from this test");
{
  console.log("  This script only exercises publishSiteBusinessSchema.safeParse() -- it never");
  console.log("  calls publishBusinessSite() or the Vercel API. Confirmed separately, live, that");
  console.log("  the Zod rejection happens before any Vercel call: the pre-fix 400 for a real");
  console.log("  phone-less business came back with no Vercel project ever created. See docs/history.md.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
