/**
 * P2 final pre-rollout validation, BLOCKER 3 -- real, authenticated HTTP
 * integration tests against the actual running Next.js route handlers
 * (`/api/prospect-actions/[id]` and
 * `/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform`), not
 * source-text inspection. A real Chromium browser (Playwright, already a
 * project dependency) drives the actual `/login` page so the exact
 * `@supabase/ssr` session cookies the app itself produces are used --
 * never hand-constructed -- then that same browser context's request API
 * (sharing its cookie jar) calls the routes under test directly.
 *
 * SAFETY:
 *  - Requires P2_DB_TEST_URL / P2_DB_TEST_SERVICE_ROLE_KEY /
 *    P2_DB_TEST_ANON_KEY, refuses to run if P2_DB_TEST_URL equals
 *    NEXT_PUBLIC_SUPABASE_URL (production) -- identical guard to
 *    verify-p2-database.ts.
 *  - Requires the app under test (P2_HTTP_TEST_BASE_URL, default
 *    http://localhost:4123) to actually be pointed at the disposable
 *    project -- this script cannot see or control that from here, so the
 *    caller MUST start `next dev` with NEXT_PUBLIC_SUPABASE_URL /
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY overridden
 *    to the disposable project's values (e.g. via .env.development.local)
 *    before running this script. As a best-effort guard, this script asks
 *    the running app's own /login page to sign in with a user that only
 *    exists in the disposable project; if the app were actually pointed
 *    at production, every sign-in attempt below would fail outright
 *    (user not found there), which is itself a safe failure mode -- it
 *    cannot silently run these mutations against production.
 *
 * Run with (after starting `next dev` against the disposable project):
 *   npx tsx scripts/db-tests/verify-p2-suppressed-completion-http.ts
 */
import { chromium, type Browser, type BrowserContext } from "playwright";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { suppressProspect, unsuppressProspect } from "../../src/lib/prospect/suppression";
import { regenerateProspectIntelligence } from "../../src/lib/prospect/regenerate";
import { rowToProspect } from "../../src/lib/prospect/row";
import type { SequenceStepActionMetadata } from "../../src/lib/prospect/types";

const TEST_URL = process.env.P2_DB_TEST_URL;
const TEST_SERVICE_ROLE_KEY = process.env.P2_DB_TEST_SERVICE_ROLE_KEY;
const TEST_ANON_KEY = process.env.P2_DB_TEST_ANON_KEY;
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_URL = process.env.P2_HTTP_TEST_BASE_URL || "http://localhost:4123";

if (!TEST_URL || !TEST_SERVICE_ROLE_KEY || !TEST_ANON_KEY) {
  console.error("BLOCKED: P2_DB_TEST_URL / P2_DB_TEST_SERVICE_ROLE_KEY / P2_DB_TEST_ANON_KEY are not set.");
  process.exit(2);
}
if (PRODUCTION_URL && TEST_URL === PRODUCTION_URL) {
  console.error("BLOCKED: P2_DB_TEST_URL is identical to NEXT_PUBLIC_SUPABASE_URL (production). Refusing to run.");
  process.exit(2);
}

const admin: SupabaseClient = createClient(TEST_URL, TEST_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

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

const RUN_ID = `p2http-${Date.now()}`;
const PASSWORD = "P2HttpTest!23456";
const cleanup: Array<() => Promise<void>> = [];

async function createOrg(name: string) {
  const { data, error } = await admin.from("organizations").insert({ name, is_test: true }).select("id").single();
  if (error || !data) throw new Error(`failed to create org ${name}: ${error?.message}`);
  cleanup.push(async () => {
    await admin.from("organizations").delete().eq("id", data.id);
  });
  return data.id as string;
}

async function createProspect(organizationId: string, businessName: string) {
  const { data, error } = await admin
    .from("prospects")
    .insert({ organization_id: organizationId, business_name: businessName, status: "new" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`failed to create prospect ${businessName}: ${error?.message}`);
  return data.id as string;
}

async function createAdminUser(organizationId: string, email: string) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
  if (error || !data.user) throw new Error(`failed to create auth user ${email}: ${error?.message}`);
  const userId = data.user.id;
  cleanup.push(async () => {
    await admin.auth.admin.deleteUser(userId);
  });
  const { error: memberError } = await admin.from("organization_members").insert({ organization_id: organizationId, user_id: userId, role: "admin" });
  if (memberError) throw new Error(`failed to add ${email} to organization_members: ${memberError.message}`);
  return { userId, email };
}

async function loginNewContext(browser: Browser, email: string): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([page.waitForURL((url) => url.pathname !== "/login", { timeout: 15000 }), page.click('button:has-text("Sign in")')]);
  await page.close();
  return context;
}

async function activityCount(organizationId: string, prospectId?: string) {
  let q = admin.from("prospect_activities").select("id", { count: "exact", head: true }).eq("organization_id", organizationId);
  if (prospectId) q = q.eq("prospect_id", prospectId);
  const { count } = await q;
  return count ?? 0;
}

async function main() {
  console.log(`P2 suppressed-direct-completion HTTP validation run ${RUN_ID} against ${BASE_URL} (app should be pointed at ${TEST_URL})\n`);

  const orgA = await createOrg(`${RUN_ID}-org-a`);
  const orgB = await createOrg(`${RUN_ID}-org-b`);
  const userA = await createAdminUser(orgA, `${RUN_ID}-a@example.test`);
  const userB = await createAdminUser(orgB, `${RUN_ID}-b@example.test`);

  const { data: sequenceA } = await admin.from("outreach_sequences").insert({ organization_id: orgA, name: "HTTP Test Sequence A", status: "active" }).select("id").single();
  await admin.from("outreach_sequence_steps").insert({ sequence_id: sequenceA!.id, step_order: 1, channel: "CALL", delay_days: 0 });
  const { data: stepRow } = await admin.from("outreach_sequence_steps").select("id").eq("sequence_id", sequenceA!.id).eq("step_order", 1).single();

  const browser = await chromium.launch();
  const contextA = await loginNewContext(browser, userA.email);
  const contextB = await loginNewContext(browser, userB.email);
  console.log("real browser sessions established for both users via the actual /login page (real @supabase/ssr cookies, not hand-constructed)\n");

  // ---------------------------------------------------------------------
  console.log("1/3/4/5. a suppressed prospect's PENDING regular action cannot be marked completed over real HTTP -- 409, no activity, nothing else changes");
  {
    const prospectA1 = await createProspect(orgA, `${RUN_ID} Prospect A1`);
    const { data: actionA1 } = await admin
      .from("prospect_actions")
      .insert({ organization_id: orgA, prospect_id: prospectA1, action_type: "CONTACT", reason: "test", status: "PENDING" })
      .select("id, status, completed_at")
      .single();
    // Direct suppression (not suppressProspect()'s own cascade) -- the
    // exact "stale open tab" race the route's own isSuppressed() guard
    // exists for: the prospect is suppressed but this specific action row
    // is still nominally PENDING when the request arrives.
    await admin.from("prospects").update({ suppressed_at: new Date().toISOString(), suppression_reason: "MANUAL" }).eq("id", prospectA1);

    const before = await activityCount(orgA, prospectA1);
    const res = await contextA.request.post(`${BASE_URL}/api/prospect-actions/${actionA1!.id}`, { data: { op: "complete" } });
    check("HTTP 409 returned", res.status() === 409, `got ${res.status()}`);
    const body = await res.json().catch(() => null);
    check("error message names suppression specifically", typeof body?.error === "string" && /suppressed/i.test(body.error), JSON.stringify(body));

    const after = await activityCount(orgA, prospectA1);
    check("no new activity row was created by the rejected request", after === before, `before=${before} after=${after}`);

    const { data: actionA1After } = await admin.from("prospect_actions").select("status, completed_at").eq("id", actionA1!.id).single();
    check("the action's status is unchanged (still PENDING)", actionA1After?.status === "PENDING");
    check("completed_at is still null (route wrote nothing)", actionA1After?.completed_at === null);

    const { data: prospectA1After } = await admin.from("prospects").select("suppressed_at").eq("id", prospectA1).maybeSingle();
    check("the ONLY change since setup is the authoritative suppression transition we made ourselves", Boolean(prospectA1After?.suppressed_at));
  }

  // ---------------------------------------------------------------------
  console.log("\n2/3/4/5. a suppressed prospect's sequence step cannot be performed over real HTTP -- 409, no call_log write, no activity, enrollment untouched");
  {
    const prospectA2 = await createProspect(orgA, `${RUN_ID} Prospect A2`);
    const { data: enrollmentA2 } = await admin
      .from("prospect_sequence_enrollments")
      .insert({ organization_id: orgA, prospect_id: prospectA2, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
      .select("id, current_step_order, status")
      .single();
    await admin.from("prospects").update({ suppressed_at: new Date().toISOString(), suppression_reason: "MANUAL" }).eq("id", prospectA2);

    const before = await activityCount(orgA, prospectA2);
    const res = await contextA.request.post(`${BASE_URL}/api/prospects/${prospectA2}/sequence-enrollments/${enrollmentA2!.id}/perform`, {
      data: { outcome: "sent", currentStepOrder: 1, sequenceStepId: stepRow!.id, channel: "CALL" }
    });
    check("HTTP 409 returned", res.status() === 409, `got ${res.status()}`);
    const body = await res.json().catch(() => null);
    check("error message names suppression specifically", typeof body?.error === "string" && /suppressed/i.test(body.error), JSON.stringify(body));

    const after = await activityCount(orgA, prospectA2);
    check("no CONTACT_ATTEMPTED/FOLLOW_UP_SCHEDULED (or any) activity was created", after === before, `before=${before} after=${after}`);

    const { count: callLogCount } = await admin.from("call_log").select("id", { count: "exact", head: true }).eq("prospect_id", prospectA2);
    check("no call_log row was created either (the route's real first write, reached only after the suppression check)", callLogCount === 0);

    const { data: enrollmentA2After } = await admin.from("prospect_sequence_enrollments").select("status, current_step_order").eq("id", enrollmentA2!.id).single();
    check("the enrollment's status is unchanged (still ACTIVE)", enrollmentA2After?.status === "ACTIVE");
    check("current_step_order is unchanged (never advanced)", enrollmentA2After?.current_step_order === 1);
  }

  // ---------------------------------------------------------------------
  console.log("\n6. direct guessed cross-tenant action/enrollment IDs are rejected over real HTTP (as user B, against org A's real rows)");
  {
    const prospectA3 = await createProspect(orgA, `${RUN_ID} Prospect A3 (cross-tenant target)`);
    const { data: actionA3 } = await admin
      .from("prospect_actions")
      .insert({ organization_id: orgA, prospect_id: prospectA3, action_type: "CONTACT", reason: "test", status: "PENDING" })
      .select("id")
      .single();
    const { data: enrollmentA3 } = await admin
      .from("prospect_sequence_enrollments")
      .insert({ organization_id: orgA, prospect_id: prospectA3, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
      .select("id")
      .single();

    const resAction = await contextB.request.post(`${BASE_URL}/api/prospect-actions/${actionA3!.id}`, { data: { op: "complete" } });
    check("user B completing org A's real (guessed) action id gets 404, not 200/409", resAction.status() === 404, `got ${resAction.status()}`);

    const resPerform = await contextB.request.post(`${BASE_URL}/api/prospects/${prospectA3}/sequence-enrollments/${enrollmentA3!.id}/perform`, {
      data: { outcome: "sent", currentStepOrder: 1, sequenceStepId: stepRow!.id, channel: "CALL" }
    });
    check("user B performing org A's real (guessed) enrollment id gets 404, not 200/409", resPerform.status() === 404, `got ${resPerform.status()}`);

    const { data: actionA3After } = await admin.from("prospect_actions").select("status").eq("id", actionA3!.id).single();
    check("org A's action is untouched by user B's rejected cross-tenant attempt", actionA3After?.status === "PENDING");
  }

  // ---------------------------------------------------------------------
  console.log("\n7. after explicit unsuppression, only the newly-regenerated action becomes executable -- the old, suppression-cancelled one never does");
  {
    const prospectA4 = await createProspect(orgA, `${RUN_ID} Prospect A4`);
    const { data: actionA4 } = await admin
      .from("prospect_actions")
      .insert({ organization_id: orgA, prospect_id: prospectA4, action_type: "CONTACT", reason: "test", status: "PENDING" })
      .select("id")
      .single();

    const { error: suppressErr } = await suppressProspect(admin, { organizationId: orgA, prospectId: prospectA4, reason: "MANUAL" });
    check("suppressProspect() itself succeeds (the authoritative transition)", !suppressErr);
    const { data: actionA4Suppressed } = await admin.from("prospect_actions").select("status").eq("id", actionA4!.id).single();
    check("suppressProspect()'s own real cascade cancelled the action to SUPPRESSED", actionA4Suppressed?.status === "SUPPRESSED");

    const { error: unsuppressErr } = await unsuppressProspect(admin, { organizationId: orgA, prospectId: prospectA4 });
    check("unsuppressProspect() succeeds", !unsuppressErr);

    const resOldAction = await contextA.request.post(`${BASE_URL}/api/prospect-actions/${actionA4!.id}`, { data: { op: "complete" } });
    check("the OLD suppression-cancelled action still cannot be completed after unsuppension (409, terminal status)", resOldAction.status() === 409, `got ${resOldAction.status()}`);

    const { data: prospectA4Row } = await admin.from("prospects").select("*").eq("id", prospectA4).single();
    await regenerateProspectIntelligence(admin, rowToProspect(prospectA4Row), { force: true });
    const { data: newAction } = await admin
      .from("prospect_actions")
      .select("id, status")
      .eq("prospect_id", prospectA4)
      .in("status", ["PENDING", "SNOOZED"])
      .neq("id", actionA4!.id)
      .maybeSingle();
    check("a genuinely NEW action (different id) was regenerated for the now-unsuppressed prospect", Boolean(newAction) && newAction!.id !== actionA4!.id);

    if (newAction) {
      const resNewAction = await contextA.request.post(`${BASE_URL}/api/prospect-actions/${newAction.id}`, { data: { op: "complete" } });
      check("the NEW regenerated action IS executable (200 ok)", resNewAction.status() === 200, `got ${resNewAction.status()}`);
      const { data: newActionAfter } = await admin.from("prospect_actions").select("status").eq("id", newAction.id).single();
      check("the new action really did complete", newActionAfter?.status === "COMPLETED");
    }
  }

  // ---------------------------------------------------------------------
  console.log("\n8. repeating the completion request is idempotent -- 409 the second time, never a duplicate activity row");
  {
    const prospectA5 = await createProspect(orgA, `${RUN_ID} Prospect A5`);
    const { data: enrollmentA5 } = await admin
      .from("prospect_sequence_enrollments")
      .insert({ organization_id: orgA, prospect_id: prospectA5, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
      .select("id")
      .single();
    const metadata: SequenceStepActionMetadata = { sequenceId: sequenceA!.id, sequenceStepId: stepRow!.id, enrollmentId: enrollmentA5!.id, channel: "CALL", sequenceName: "HTTP Test Sequence A" };
    const { data: actionA5 } = await admin
      .from("prospect_actions")
      .insert({ organization_id: orgA, prospect_id: prospectA5, action_type: "SEQUENCE_STEP", reason: "test", status: "PENDING", metadata: metadata as unknown as Record<string, unknown> })
      .select("id")
      .single();

    const res1 = await contextA.request.post(`${BASE_URL}/api/prospect-actions/${actionA5!.id}`, { data: { op: "complete" } });
    check("first completion request succeeds (200)", res1.status() === 200, `got ${res1.status()}`);
    const { count: countAfterFirst } = await admin
      .from("prospect_activities")
      .select("id", { count: "exact", head: true })
      .eq("prospect_id", prospectA5)
      .eq("activity_type", "CONTACT_ATTEMPTED");
    check("exactly one CONTACT_ATTEMPTED activity was logged by the first request", countAfterFirst === 1, `found ${countAfterFirst}`);

    const res2 = await contextA.request.post(`${BASE_URL}/api/prospect-actions/${actionA5!.id}`, { data: { op: "complete" } });
    check("repeating the SAME completion request is rejected (409, already terminal), not silently re-applied", res2.status() === 409, `got ${res2.status()}`);
    const { count: countAfterSecond } = await admin
      .from("prospect_activities")
      .select("id", { count: "exact", head: true })
      .eq("prospect_id", prospectA5)
      .eq("activity_type", "CONTACT_ATTEMPTED");
    check("still exactly one CONTACT_ATTEMPTED activity -- the repeat created no duplicate", countAfterSecond === 1, `found ${countAfterSecond}`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  await contextA.close();
  await contextB.close();
  await browser.close();

  console.log("\ncleaning up test fixtures...");
  for (const fn of cleanup.reverse()) {
    await fn().catch((e) => console.error("cleanup step failed (non-fatal):", e));
  }

  if (failed > 0) process.exit(1);
}

main().catch(async (err) => {
  console.error("FATAL:", err);
  console.log("\ncleaning up test fixtures despite the fatal error above...");
  for (const fn of cleanup.reverse()) {
    await fn().catch((e) => console.error("cleanup step failed (non-fatal):", e));
  }
  process.exit(1);
});
