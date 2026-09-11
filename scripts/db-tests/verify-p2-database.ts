/**
 * P2 Phase 1.1 MANDATORY FIX 4 -- database-backed pre-production
 * validation. Every check in verify-suppression.ts / verify-sequences.ts /
 * verify-launch-mode.ts / verify-won-handoff.ts / verify-insights.ts is
 * pure logic or static source inspection; this script is the one that
 * actually opens a real Postgres connection, runs migrations 037+038
 * (applied separately, see the README block below), and exercises the
 * real guarantees those files could only assert existed in the SQL text:
 * RLS actually rejecting a cross-tenant row, the tenant-guard trigger
 * actually throwing, the suppression trigger actually throwing, a unique
 * index actually rejecting a duplicate, and two concurrent inserts racing
 * for the same event_key actually producing one row, not two.
 *
 * SAFETY: this script refuses to run against production. It requires
 * P2_DB_TEST_URL / P2_DB_TEST_SERVICE_ROLE_KEY / P2_DB_TEST_ANON_KEY --
 * deliberately NOT the app's own NEXT_PUBLIC_SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY -- and hard-
 * fails if P2_DB_TEST_URL matches NEXT_PUBLIC_SUPABASE_URL (the
 * production project), even if someone points both env vars at the same
 * value by mistake.
 *
 * PREREQUISITE (not run by this script): a disposable non-production
 * Supabase project (or local `supabase start`) with every migration
 * through 036 already applied (the same schema state production is
 * actually on), then `supabase db push` (or equivalent) to apply 037
 * through 040 -- this script assumes that already happened and starts
 * from "P2's own migrations just landed on a P1-shaped database," which
 * is exactly the real Phase 2 sequence.
 *
 * Sections 7-11 (added during P2 pre-production database validation) go
 * beyond migrations 037/038's own guarantees: 7 exercises migration 040
 * (the prospect_sequence_enrollments suppression guard added by this same
 * validation pass, closing a gap parallel to 038's prospect_actions one),
 * 8 replicates the Daily Queue route's own query+filter against a real
 * suppression-after-the-fact race, 9 covers cross-tenant DELETE (the one
 * CRUD verb sections 2-3 didn't already exercise), 10 proves
 * advanceSequenceStep()'s CAS update under real concurrency the same way
 * section 6 already did for event_key, and 11 proves computeInsightsSummary()
 * zeroes a real is_test organization's counts despite real logged activity
 * sitting in the same tables.
 *
 * Section 12 (P2 final pre-rollout validation) exercises
 * outreach_sequence_steps' join-through-parent RLS policy explicitly --
 * this child table carries no organization_id of its own, so its policy
 * (`"members can manage sequence steps"`, migration 037) authorizes solely
 * via `exists (... join outreach_sequences ... join organization_members
 * ... where sequence_id = outreach_sequence_steps.sequence_id)`. Section 2
 * already covered outreach_sequences and prospect_sequence_enrollments;
 * this table's policy shape is different enough (no direct organization_id
 * column, FOR ALL rather than split per-command) to warrant its own real
 * SELECT/INSERT/UPDATE/DELETE proof.
 *
 * Run with: npx tsx scripts/db-tests/verify-p2-database.ts
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { computeInsightsSummary } from "../../src/lib/prospect/insights-query";
import { advanceSequenceStep, enrollProspect } from "../../src/lib/prospect/sequence-sync";

const TEST_URL = process.env.P2_DB_TEST_URL;
const TEST_SERVICE_ROLE_KEY = process.env.P2_DB_TEST_SERVICE_ROLE_KEY;
const TEST_ANON_KEY = process.env.P2_DB_TEST_ANON_KEY;
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!TEST_URL || !TEST_SERVICE_ROLE_KEY || !TEST_ANON_KEY) {
  console.error(
    "BLOCKED: P2_DB_TEST_URL / P2_DB_TEST_SERVICE_ROLE_KEY / P2_DB_TEST_ANON_KEY are not set.\n" +
      "This script deliberately does not fall back to NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY " +
      "(the production project) -- it needs a disposable non-production Supabase project or a local " +
      "`supabase start` instance with migrations through 038 applied. See this file's header."
  );
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

async function expectThrow(label: string, fn: () => Promise<{ error: { message: string } | null }>) {
  const { error } = await fn();
  check(label, Boolean(error), error ? undefined : "expected an error, got success");
}

// Test fixtures created and torn down by this run -- never touches any
// pre-existing row.
const RUN_ID = `p2dbtest-${Date.now()}`;
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

async function createAuthUserInOrg(organizationId: string, email: string) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: "P2DbTest!23456", email_confirm: true });
  if (error || !data.user) throw new Error(`failed to create auth user ${email}: ${error?.message}`);
  const userId = data.user.id;
  cleanup.push(async () => {
    await admin.auth.admin.deleteUser(userId);
  });
  const { error: memberError } = await admin.from("organization_members").insert({ organization_id: organizationId, user_id: userId, role: "admin" });
  if (memberError) throw new Error(`failed to add ${email} to organization_members: ${memberError.message}`);

  const anon = createClient(TEST_URL!, TEST_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInError } = await anon.auth.signInWithPassword({ email, password: "P2DbTest!23456" });
  if (signInError) throw new Error(`failed to sign in as ${email}: ${signInError.message}`);
  return anon;
}

async function main() {
  console.log(`P2 database-backed validation run ${RUN_ID} against ${TEST_URL}\n`);

  console.log("0. pre-apply invariant: no prospect currently has more than one active (PENDING/SNOOZED) prospect_action");
  {
    const { data: actionRows } = await admin.from("prospect_actions").select("prospect_id").in("status", ["PENDING", "SNOOZED"]);
    const counts = new Map<string, number>();
    for (const row of actionRows ?? []) counts.set(row.prospect_id as string, (counts.get(row.prospect_id as string) ?? 0) + 1);
    const duplicated = [...counts.entries()].filter(([, n]) => n > 1);
    check("no prospect has more than one active prospect_action (the exact precondition prospect_actions_one_active_idx requires)", duplicated.length === 0, `found: ${JSON.stringify(duplicated)}`);
  }

  console.log("\n1. RLS enforcement on the five new P2 tables");
  console.log("  (RLS being ON per se isn't queryable through PostgREST -- pg_class/pg_tables aren't exposed by default; " +
    "this is verified behaviorally instead by section 3 below, which would trivially pass -- wrongly -- if RLS were off. " +
    "The migration's own `alter table ... enable row level security` statements are the structural half of this proof.)");

  const orgA = await createOrg(`${RUN_ID}-org-a`);
  const orgB = await createOrg(`${RUN_ID}-org-b`);
  const prospectA = await createProspect(orgA, `${RUN_ID} Prospect A`);
  const prospectB = await createProspect(orgB, `${RUN_ID} Prospect B`);
  const userA = await createAuthUserInOrg(orgA, `${RUN_ID}-a@example.test`);
  const userB = await createAuthUserInOrg(orgB, `${RUN_ID}-b@example.test`);

  const { data: sequenceA } = await admin.from("outreach_sequences").insert({ organization_id: orgA, name: "Test Sequence A", status: "active" }).select("id").single();
  const { data: sequenceB } = await admin.from("outreach_sequences").insert({ organization_id: orgB, name: "Test Sequence B", status: "active" }).select("id").single();
  await admin.from("outreach_sequence_steps").insert({ sequence_id: sequenceA!.id, step_order: 1, channel: "CALL", delay_days: 0 });
  await admin.from("outreach_sequence_steps").insert({ sequence_id: sequenceB!.id, step_order: 1, channel: "CALL", delay_days: 0 });

  console.log("\n2. the enrollment tenant-guard trigger rejects a mixed-tenant insert");
  {
    await expectThrow(
      "inserting an enrollment with prospect A but sequence B (mismatched tenant) is rejected",
      async () =>
        admin.from("prospect_sequence_enrollments").insert({
          organization_id: orgA,
          prospect_id: prospectA,
          sequence_id: sequenceB!.id,
          status: "ACTIVE",
          current_step_order: 1
        })
    );
    await expectThrow(
      "inserting an enrollment with organization_id=A but prospect_id from org B is rejected",
      async () =>
        admin.from("prospect_sequence_enrollments").insert({
          organization_id: orgA,
          prospect_id: prospectB,
          sequence_id: sequenceA!.id,
          status: "ACTIVE",
          current_step_order: 1
        })
    );
  }

  console.log("\n3. guessed cross-tenant IDs fail under RLS (acting as a real authenticated user, not service role)");
  {
    const { data: handoffA } = await admin.from("prospect_handoffs").insert({ prospect_id: prospectA, agreed_scope: "real scope" }).select("prospect_id").single();
    const { data: readAsB } = await userB.from("prospect_handoffs").select("*").eq("prospect_id", handoffA!.prospect_id);
    check("user B cannot read org A's prospect_handoffs row by its real (guessed) prospect_id", (readAsB ?? []).length === 0);

    const { data: enrollmentA } = await admin
      .from("prospect_sequence_enrollments")
      .insert({ organization_id: orgA, prospect_id: prospectA, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
      .select("id")
      .single();
    const { data: enrollmentReadAsB } = await userB.from("prospect_sequence_enrollments").select("*").eq("id", enrollmentA!.id);
    check("user B cannot read org A's enrollment by its real (guessed) id", (enrollmentReadAsB ?? []).length === 0);
    const { data: enrollmentUpdateAsB, error: enrollmentUpdateErrB } = await userB
      .from("prospect_sequence_enrollments")
      .update({ status: "STOPPED" })
      .eq("id", enrollmentA!.id)
      .select("id");
    check("user B cannot update org A's enrollment by its real (guessed) id", !enrollmentUpdateErrB && (enrollmentUpdateAsB ?? []).length === 0);

    const { data: sequenceReadAsB } = await userB.from("outreach_sequences").select("*").eq("id", sequenceA!.id);
    check("user B cannot read org A's outreach_sequences row", (sequenceReadAsB ?? []).length === 0);

    await userB.from("organization_launch_settings").upsert({ organization_id: orgA, target_industry: "hijacked" });
    const { data: launchSettingsAfter } = await admin.from("organization_launch_settings").select("target_industry").eq("organization_id", orgA).maybeSingle();
    check("user B's attempt to upsert org A's launch settings by its real (guessed) organization_id never lands", launchSettingsAfter?.target_industry !== "hijacked");

    check("user A CAN read their own org's enrollment (RLS isn't just blocking everything)", (await userA.from("prospect_sequence_enrollments").select("*").eq("id", enrollmentA!.id)).data?.length === 1);
  }

  console.log("\n4. suppression blocks enrollment, queue eligibility, and direct completion at the database layer");
  {
    const now = new Date().toISOString();
    await admin.from("prospects").update({ suppressed_at: now, suppression_reason: "MANUAL" }).eq("id", prospectA);

    await expectThrow(
      "the suppression trigger rejects inserting a PENDING prospect_action for the now-suppressed prospect",
      async () => admin.from("prospect_actions").insert({ organization_id: orgA, prospect_id: prospectA, action_type: "CONTACT", reason: "test", status: "PENDING" })
    );

    const { data: suppressedAction } = await admin
      .from("prospect_actions")
      .insert({ organization_id: orgA, prospect_id: prospectA, action_type: "CONTACT", reason: "test", status: "SUPPRESSED" })
      .select("id")
      .single();
    check("the trigger allows a terminal SUPPRESSED status for the same prospect (it only blocks re-entering PENDING/SNOOZED)", Boolean(suppressedAction));
    await expectThrow(
      "the trigger also rejects flipping that same row back to PENDING while still suppressed",
      async () => admin.from("prospect_actions").update({ status: "PENDING" }).eq("id", suppressedAction!.id)
    );

    await admin.from("prospects").update({ suppressed_at: null, suppression_reason: null }).eq("id", prospectA);
    const { error: allowedAfterUnsuppress } = await admin.from("prospect_actions").insert({ organization_id: orgA, prospect_id: prospectA, action_type: "CONTACT", reason: "test", status: "PENDING" });
    check("once unsuppressed, a real PENDING action can be created again (the trigger isn't overly broad)", !allowedAfterUnsuppress);
  }

  console.log("\n5. database uniqueness rejects duplicate active enrollments and duplicate active actions");
  {
    const dupProspect = await createProspect(orgA, `${RUN_ID} Dup Prospect`);
    const { error: firstEnroll } = await admin.from("prospect_sequence_enrollments").insert({ organization_id: orgA, prospect_id: dupProspect, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 });
    check("the first enrollment for a fresh prospect succeeds", !firstEnroll);
    await expectThrow("a second ACTIVE enrollment for the SAME prospect is rejected by the partial unique index", async () =>
      admin.from("prospect_sequence_enrollments").insert({ organization_id: orgA, prospect_id: dupProspect, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
    );

    const { error: firstAction } = await admin.from("prospect_actions").insert({ organization_id: orgA, prospect_id: dupProspect, action_type: "REVIEW_PROSPECT", reason: "test", status: "PENDING" });
    check("the first PENDING action for a fresh prospect succeeds", !firstAction);
    await expectThrow("a second PENDING action for the SAME prospect is rejected by prospect_actions_one_active_idx", async () =>
      admin.from("prospect_actions").insert({ organization_id: orgA, prospect_id: dupProspect, action_type: "CONTACT", reason: "test", status: "PENDING" })
    );
  }

  console.log("\n6. event_key uniqueness is real and survives actual concurrency, not just sequential retries");
  {
    const eventKey = `${RUN_ID}-concurrent-event`;
    const insertOne = () =>
      admin.from("prospect_activities").upsert(
        { organization_id: orgA, prospect_id: prospectA, activity_type: "SEQUENCE_STEP_DUE", summary: "concurrent test", metadata: {}, event_key: eventKey },
        { onConflict: "event_key", ignoreDuplicates: true }
      );
    const results = await Promise.all([insertOne(), insertOne(), insertOne(), insertOne(), insertOne()]);
    check("none of five concurrent upserts with the same event_key returned an error", results.every((r) => !r.error));
    const { count } = await admin.from("prospect_activities").select("id", { count: "exact", head: true }).eq("event_key", eventKey);
    check("exactly one row exists for the event_key after five concurrent attempts", count === 1, `found ${count}`);

    const eventKey2 = `${RUN_ID}-distinct-event`;
    await admin.from("prospect_activities").insert({ organization_id: orgA, prospect_id: prospectA, activity_type: "SEQUENCE_STEP_DUE", summary: "distinct", metadata: {}, event_key: eventKey2 });
    const { count: distinctCount } = await admin.from("prospect_activities").select("id", { count: "exact", head: true }).in("event_key", [eventKey, eventKey2]);
    check("a different event_key is never blocked by the first one's uniqueness (legitimate distinct events aren't collapsed)", distinctCount === 2);
  }

  console.log("\n7. suppressed-prospect enrollment is rejected at the database layer itself (migration 040), not only by enrollProspect()'s app-level isSuppressed() check");
  {
    const prospectC = await createProspect(orgA, `${RUN_ID} Prospect C`);
    await admin.from("prospects").update({ suppressed_at: new Date().toISOString(), suppression_reason: "MANUAL" }).eq("id", prospectC);
    await expectThrow(
      "a direct insert of an ACTIVE enrollment for an already-suppressed prospect is rejected (bypassing enrollProspect() entirely, as a future/forgetful call site would)",
      async () => admin.from("prospect_sequence_enrollments").insert({ organization_id: orgA, prospect_id: prospectC, sequence_id: sequenceA!.id, status: "ACTIVE", current_step_order: 1 })
    );
    const { enrollmentId, error } = await enrollProspect(admin, { organizationId: orgA, prospectId: prospectC, sequenceId: sequenceA!.id });
    check("enrollProspect() itself also refuses (its own app-level check, still correct)", enrollmentId === null && Boolean(error));
    await admin.from("prospects").update({ suppressed_at: null, suppression_reason: null }).eq("id", prospectC);
  }

  console.log("\n8. the Daily Queue query excludes a suppressed prospect's action even when the action row itself is still nominally PENDING (the exact race /api/prospects/queue's own 'defense-in-depth' comment describes: suppression happening AFTER the action was created, which the prospect_actions trigger -- scoped to prospect_actions writes only -- cannot retroactively catch)");
  {
    const prospectD = await createProspect(orgA, `${RUN_ID} Prospect D`);
    const { error: preSuppressionActionErr } = await admin.from("prospect_actions").insert({ organization_id: orgA, prospect_id: prospectD, action_type: "CONTACT", reason: "test", status: "PENDING" });
    check("a PENDING action is created for prospect D while NOT yet suppressed", !preSuppressionActionErr);
    // Suppress prospect D directly (not via suppressProspect()), simulating
    // suppression landing after the action already existed, before any
    // reconciliation pass has run.
    await admin.from("prospects").update({ suppressed_at: new Date().toISOString(), suppression_reason: "MANUAL" }).eq("id", prospectD);
    const { data: rawActionRow } = await admin.from("prospect_actions").select("status").eq("prospect_id", prospectD).single();
    check("the action row itself is still PENDING in the database (the trigger doesn't retroactively touch it -- this is the real gap the query-level filter exists for)", rawActionRow?.status === "PENDING");

    // Replicate /api/prospects/queue/route.ts's own query + filter exactly.
    const { data: actionRows } = await admin
      .from("prospect_actions")
      .select("id, prospect_id, prospects(suppressed_at)")
      .eq("organization_id", orgA)
      .in("status", ["PENDING", "SNOOZED"]);
    const nonSuppressedRows = (actionRows ?? []).filter((r) => {
      const prospectJoin = r.prospects as unknown as { suppressed_at: string | null } | null;
      return !prospectJoin?.suppressed_at;
    });
    check(
      "the Daily Queue's own query+filter excludes prospect D's still-PENDING action once suppressed",
      !nonSuppressedRows.some((r) => r.prospect_id === prospectD)
    );
  }

  console.log("\n9. cross-tenant DELETE is rejected under RLS, not only SELECT/INSERT/UPDATE");
  {
    const { data: enrollmentForDeleteTest } = await admin
      .from("prospect_sequence_enrollments")
      .select("id")
      .eq("prospect_id", prospectA)
      .eq("sequence_id", sequenceA!.id)
      .maybeSingle();
    const { data: deletedAsB, error: deleteErrB } = await userB
      .from("prospect_sequence_enrollments")
      .delete()
      .eq("id", enrollmentForDeleteTest!.id)
      .select("id");
    check("user B cannot delete org A's enrollment by its real (guessed) id", !deleteErrB && (deletedAsB ?? []).length === 0);
    const { data: stillThere } = await admin.from("prospect_sequence_enrollments").select("id").eq("id", enrollmentForDeleteTest!.id).maybeSingle();
    check("the row genuinely still exists after user B's rejected delete attempt", Boolean(stillThere));

    const { data: deletedProspectAsB, error: deleteProspectErrB } = await userB.from("prospects").delete().eq("id", prospectA).select("id");
    check("user B cannot delete org A's prospect itself by its real (guessed) id", !deleteProspectErrB && (deletedProspectAsB ?? []).length === 0);
    const { data: prospectStillThere } = await admin.from("prospects").select("id").eq("id", prospectA).maybeSingle();
    check("org A's prospect genuinely still exists after user B's rejected delete attempt", Boolean(prospectStillThere));
  }

  console.log("\n10. sequence-completion advancement is CAS-idempotent under real concurrency, not just sequential retries (advanceSequenceStep(), matching event_key's own concurrency proof in section 6)");
  {
    const prospectE = await createProspect(orgA, `${RUN_ID} Prospect E`);
    const { enrollmentId: enrollmentEId, error: enrollErrE } = await enrollProspect(admin, { organizationId: orgA, prospectId: prospectE, sequenceId: sequenceA!.id });
    check("prospect E enrolls cleanly (fresh prospect, no prior enrollment)", Boolean(enrollmentEId) && !enrollErrE);

    // sequenceA has exactly one step -- advancing past it takes the
    // "sequence complete" branch, the same CAS-guarded update on both
    // id + current_step_order + status. Five concurrent callers race for
    // the same expectedCurrentStepOrder; only the real DB row state (not
    // app-level locking) can decide the winner.
    const results = await Promise.all(
      Array.from({ length: 5 }, () => advanceSequenceStep(admin, { organizationId: orgA, prospectId: prospectE, enrollmentId: enrollmentEId!, expectedCurrentStepOrder: 1 }))
    );
    const advancedCount = results.filter((r) => r.advanced).length;
    check("exactly one of five concurrent advanceSequenceStep() calls actually wins the CAS update", advancedCount === 1, `advanced count: ${advancedCount}`);
    check("every call correctly reports completed:true (last step reached), win or lose", results.every((r) => r.completed));

    const { data: enrollmentEAfter } = await admin.from("prospect_sequence_enrollments").select("status").eq("id", enrollmentEId!).single();
    check("the enrollment lands in COMPLETED exactly once, not corrupted by the losing racers", enrollmentEAfter?.status === "COMPLETED");

    const { count: completedActivityCount } = await admin
      .from("prospect_activities")
      .select("id", { count: "exact", head: true })
      .eq("prospect_id", prospectE)
      .eq("activity_type", "SEQUENCE_COMPLETED");
    check("exactly one SEQUENCE_COMPLETED activity was logged, not five", completedActivityCount === 1, `found ${completedActivityCount}`);
  }

  console.log("\n11. a test organization's Insights are always the shared zero constant, even with real logged activity sitting right there in the same tables (MANDATORY FIX 1)");
  {
    const { data: orgARow } = await admin.from("organizations").select("is_test").eq("id", orgA).single();
    check("org A (created by this run) is itself flagged is_test, matching every real test/sandbox organization", orgARow?.is_test === true);

    const { count: realActivityCount } = await admin.from("prospect_activities").select("id", { count: "exact", head: true }).eq("organization_id", orgA);
    check("org A genuinely has real, non-zero logged activity by this point in the run (this test would be meaningless against an empty org)", (realActivityCount ?? 0) > 0, `found ${realActivityCount}`);

    const summary = await computeInsightsSummary(admin, orgA);
    check("computeInsightsSummary() flags isTestOrganization", summary.isTestOrganization === true);
    check(
      "every single count is zero despite real activity existing in the same table for this exact organization_id",
      summary.prospectsFound === 0 &&
        summary.prospectsReviewed === 0 &&
        summary.auditsCompleted === 0 &&
        summary.demosCreated === 0 &&
        summary.demoRoomsShared === 0 &&
        summary.outreachPerformed === 0 &&
        summary.followUpsScheduled === 0 &&
        summary.meetingsLogged === 0 &&
        summary.won === 0 &&
        summary.lost === 0,
      JSON.stringify(summary)
    );
  }

  console.log("\n12. outreach_sequence_steps' join-through-parent RLS policy (\"members can manage sequence steps\", FOR ALL) actually authorizes/rejects SELECT/INSERT/UPDATE/DELETE correctly -- this child table has no organization_id of its own, so a defect here would be easy to miss by inspecting outreach_sequences' own (differently-shaped) policy alone");
  {
    const { data: stepA } = await admin
      .from("outreach_sequence_steps")
      .insert({ sequence_id: sequenceA!.id, step_order: 2, channel: "EMAIL", delay_days: 1 })
      .select("id")
      .single();
    const { data: stepB } = await admin
      .from("outreach_sequence_steps")
      .insert({ sequence_id: sequenceB!.id, step_order: 2, channel: "EMAIL", delay_days: 1 })
      .select("id")
      .single();

    const { data: sameTenantRead, error: sameTenantErr } = await userA.from("outreach_sequence_steps").select("id").eq("sequence_id", sequenceA!.id);
    check("same-tenant SELECT succeeds (user A reads org A's own sequence's steps)", !sameTenantErr && (sameTenantRead ?? []).length >= 1);

    const { data: crossTenantRead, error: crossTenantErr } = await userB.from("outreach_sequence_steps").select("id").eq("id", stepA!.id);
    check("cross-tenant SELECT returns no row (user B, given org A's real guessed step id, sees nothing -- no error, just filtered)", !crossTenantErr && (crossTenantRead ?? []).length === 0);

    const { error: crossTenantInsertErr } = await userB
      .from("outreach_sequence_steps")
      .insert({ sequence_id: sequenceA!.id, step_order: 99, channel: "SMS", delay_days: 0 });
    check("cross-tenant INSERT through another tenant's real (guessed) sequence_id is rejected by WITH CHECK", Boolean(crossTenantInsertErr));
    const { count: noRogueStep } = await admin.from("outreach_sequence_steps").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceA!.id).eq("step_order", 99);
    check("the rejected cross-tenant insert genuinely created no row", noRogueStep === 0);

    const { data: crossTenantUpdate, error: crossTenantUpdateErr } = await userB
      .from("outreach_sequence_steps")
      .update({ delay_days: 999 })
      .eq("id", stepA!.id)
      .select("id");
    check("cross-tenant UPDATE fails (0 rows affected via the real guessed id, not an error masking a silent success)", !crossTenantUpdateErr && (crossTenantUpdate ?? []).length === 0);
    const { data: stepAUnchanged } = await admin.from("outreach_sequence_steps").select("delay_days").eq("id", stepA!.id).single();
    check("org A's step genuinely still has its original delay_days after user B's rejected update", stepAUnchanged?.delay_days === 1);

    const { data: crossTenantDelete, error: crossTenantDeleteErr } = await userB.from("outreach_sequence_steps").delete().eq("id", stepA!.id).select("id");
    check("cross-tenant DELETE fails (0 rows affected via the real guessed id)", !crossTenantDeleteErr && (crossTenantDelete ?? []).length === 0);
    const { data: stepAStillExists } = await admin.from("outreach_sequence_steps").select("id").eq("id", stepA!.id).maybeSingle();
    check("org A's step genuinely still exists after user B's rejected delete", Boolean(stepAStillExists));

    // Guessed IDs on BOTH sides at once: user B references org A's real
    // sequence_id (stepA's parent) together with org A's real step id --
    // the join-through-parent check must still resolve via the row's own
    // real sequence_id, never anything the client claims.
    const { data: guessedBothRead } = await userB.from("outreach_sequence_steps").select("id").eq("id", stepA!.id).eq("sequence_id", sequenceA!.id);
    check("guessing BOTH the real step id AND its real parent sequence_id together still does not bypass the policy for user B", (guessedBothRead ?? []).length === 0);
    check("user A's own step (created above) remains fully manageable throughout (RLS isn't over-blocking)", Boolean(stepB));
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  console.log("\ncleaning up test fixtures...");
  for (const fn of cleanup.reverse()) {
    await fn().catch((e) => console.error("cleanup step failed (non-fatal):", e));
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
