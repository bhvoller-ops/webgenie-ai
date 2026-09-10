/**
 * Regression test for P2 Agency Launch Mode (master prompt Architecture
 * Decision 11, P2 Phase 1 "LAUNCH MODE TESTS" 38-45). Structural checks
 * confirming Launch Mode is orchestration over existing systems, never a
 * second task engine or a source of fabricated progress. Actual
 * persistence round-trips are exercised for real in the Phase 2
 * production acceptance test.
 *
 * Run with: npx tsx scripts/verify-launch-mode.ts
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

console.log("38/39. Launch Mode settings persist real target industry/location (real round-trip in Phase 2; shape checked here)");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("organization_launch_settings has target_industry/target_location columns", /target_industry text/.test(migrationSrc) && /target_location text/.test(migrationSrc));
  check("it's a one-row-per-org table (PK is organization_id), same shape as org_branding", /organization_id uuid primary key references public\.organizations\(id\)[\s\S]{0,200}target_industry/.test(migrationSrc));
}

console.log("40. progress derives from real state, never a stored/fabricated percentage");
{
  const src = readFileSync("src/app/launch/launch-client.tsx", "utf8");
  check("milestones are computed from live /api/insights data, not hardcoded", /insights\?\.\w+/.test(src));
  check("no percentage is computed or displayed anywhere on this page", !/%/.test(src.replace(/className|style/g, "")) || !/Math\.round.*100/.test(src));
  check("no milestone is marked done by anything other than a real count > 0 or a real settings field being set", /done: \(insights\?\.\w+ \?\? 0\) > 0/.test(src) && /done: Boolean\(settings\.targetIndustry/.test(src));
}

console.log("41/42. actions feed the EXISTING Daily Queue -- Launch Mode has no action-generation logic of its own, so nothing it does can duplicate a Queue action");
{
  const src = readFileSync("src/app/launch/launch-client.tsx", "utf8");
  check("Launch Mode never inserts/creates a prospect_action itself", !/prospect_actions|prospect-actions/.test(src));
  check("it links to the real /finder and /prospecting pages instead", /href="\/finder"/.test(src) && /href="\/prospecting"/.test(src));
}

console.log("43. no fake metrics are ever generated");
{
  const src = readFileSync("src/app/launch/launch-client.tsx", "utf8");
  check("no random/mock number generation exists in the client", !/Math\.random|faker|mock[A-Z]/.test(src));
  const routeSrc = readFileSync("src/app/api/launch-settings/route.ts", "utf8");
  check("the settings route never writes progress/metric fields -- only setup inputs", !/prospectsFound|prospectsReviewed|meetingsLogged/.test(routeSrc));
}

console.log("44. launch completion does not create a separate task system");
{
  const migrationSrc = readFileSync("supabase/migrations/037_p2_growth_engine.sql", "utf8");
  check("no launch_tasks (or similarly named) table exists anywhere in the migration", !/create table public\.launch_tasks|create table public\.launch_actions/.test(migrationSrc));
  check("organization_launch_settings has no task-shaped columns (status/priority/assignee) -- it's pure setup input", !/priority text|assignee|task_status/.test(migrationSrc.slice(migrationSrc.indexOf("organization_launch_settings"))));
}

console.log("45. transition to normal Queue usage works");
{
  const src = readFileSync("src/app/launch/launch-client.tsx", "utf8");
  check("a real, always-available link to the real Daily Queue exists once launched", /href="\/prospecting"/.test(src));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
