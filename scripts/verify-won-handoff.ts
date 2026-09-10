/**
 * Regression test for P2 Won Client Handoff (master prompt Architecture
 * Decision 12, P2 Phase 1 "WON HANDOFF TESTS" 46-54). Structural checks
 * confirming the recommended-offer/agreed-scope separation and the
 * no-auto-project-creation rule are real, not just described. Actual
 * persistence and cross-tenant rejection are exercised for real in the
 * Phase 2 production acceptance test.
 *
 * Run with: npx tsx scripts/verify-won-handoff.ts
 */
import { readFileSync } from "fs";

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

console.log("46. WON prospect can start handoff -- the panel is gated on real status, not shown for every prospect");
{
  const src = readFileSync("src/app/prospects/[id]/page.tsx", "utf8");
  check("HandoffPanel only renders when prospect.status === \"won\"", /prospect\.status === "won"[\s\S]{0,120}<HandoffPanel/.test(src));
}

console.log("47/48. handoff works whether or not a project exists -- the table has no dependency on project_id at all");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  const handoffTable = migrationSrc.slice(migrationSrc.indexOf("create table public.prospect_handoffs"), migrationSrc.indexOf("create table public.prospect_handoffs") + 600);
  check("prospect_handoffs is keyed on prospect_id only -- no project_id column, no FK to projects at all", !/project_id/.test(handoffTable));
  const routeSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  check("the handoff route never requires project_id to exist before reading/writing", !/if \(!prospect\.project_id\)|if \(!prospect\.projectId\)/.test(routeSrc));
}

console.log("49. recommended offer is preserved as a visibly separate concept, never merged into agreed scope");
{
  const routeSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  const patchBody = routeSrc.slice(routeSrc.indexOf("export async function PATCH"));
  check("the PATCH handler (the one that writes) never reads or copies opportunity_briefs.recommended_offer into agreed_scope", !/recommended_offer/.test(patchBody));
  check("GET (read-only, for display) is the only place recommended_offer is read", /recommended_offer/.test(routeSrc.slice(0, routeSrc.indexOf("export async function PATCH"))));
  const panelSrc = readFileSync("src/app/prospects/[id]/handoff-panel.tsx", "utf8");
  check("the UI labels it explicitly as an AI recommendation, not scope", /AI-recommended offer \(not scope\)/.test(panelSrc));
  check("the scope textarea is never pre-filled from the recommended offer prop", !/setScope\(recommendedOffer/.test(panelSrc));
}

console.log("50. agreed scope requires explicit human confirmation -- confirmedAt/status='ready' are set ONLY by the confirm flag");
{
  const routeSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  check("confirmed_at/confirmed_by/status='ready' are set only inside the `if (parsed.data.confirm)` branch", /if \(parsed\.data\.confirm\) \{\s*\n\s*patch\.status = "ready";\s*\n\s*patch\.confirmed_at = now;\s*\n\s*patch\.confirmed_by = user\.id;/.test(routeSrc));
  const panelSrc = readFileSync("src/app/prospects/[id]/handoff-panel.tsx", "utf8");
  check("the confirm button is a separate, explicit action from the plain save-draft button", /Confirm agreed scope/.test(panelSrc) && /Save draft/.test(panelSrc));
}

console.log("51. price is never inferred -- it's a plain user-typed number, never computed from brief/evidence");
{
  const routeSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  const patchBody = routeSrc.slice(routeSrc.indexOf("export async function PATCH"));
  check("agreed_price comes directly from the request body, never derived from any brief/evidence field", /patch\.agreed_price = parsed\.data\.agreedPrice/.test(patchBody));
  check("the PATCH handler never reads opportunity_briefs at all when saving a handoff", !/from\("opportunity_briefs"\)/.test(patchBody));
}

console.log("52. a project is never auto-created just because prospects.status = won");
{
  const regenerateSrc = readFileSync("src/lib/prospect/regenerate.ts", "utf8");
  const wonBlock = regenerateSrc.slice(regenerateSrc.indexOf('status === "won"'), regenerateSrc.indexOf('status === "won"') + 200);
  check("the won-transition branch only logs an activity -- it never touches the projects table", /logActivity/.test(wonBlock) && !/from\("projects"\)/.test(wonBlock));
  const handoffRouteSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  check("the handoff route itself never inserts into projects either", !/from\("projects"\)\.insert/.test(handoffRouteSrc));
}

console.log("53. source audit/brief/demo remain unchanged by any handoff action");
{
  const routeSrc = readFileSync("src/app/api/prospects/[id]/handoff/route.ts", "utf8");
  check("the handoff PATCH route never writes to opportunity_briefs, analysis_jobs, or demo_rooms", !/from\("opportunity_briefs"\)\.(update|insert|upsert)|from\("analysis_jobs"\)\.(update|insert)|from\("demo_rooms"\)\.(update|insert)/.test(routeSrc));
}

console.log("54. cross-tenant handoff access blocked -- RLS join-through-prospect, same shape as opportunity_briefs (real rejection verified in Phase 2)");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("prospect_handoffs RLS policy joins through prospects -> organization_members, identical shape to opportunity_briefs", /create policy "members can manage prospect handoffs"[\s\S]*?join public\.organization_members m on m\.organization_id = p\.organization_id/.test(migrationSrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
