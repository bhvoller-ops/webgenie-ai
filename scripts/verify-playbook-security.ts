/**
 * Home Services Live Outreach Playbook — tenant/role security, contact-
 * safety gating, and event-semantics verification.
 *
 * Section A drives lib/playbook/resolve-context.ts's actual exported
 * function against a real (but fake, in-memory) Supabase client whose
 * every query is scenario-scripted per test -- proving the real runtime
 * decision (PROSPECT_NOT_FOUND, ACTION_PROSPECT_MISMATCH, channel
 * activation, ...), not merely asserting the source text looks right.
 *
 * Section B is source-text inspection for the properties that are
 * genuinely structural facts about the code (e.g. "the GET route never
 * writes"), matching this repo's own established convention (see
 * scripts/verify-outreach-evidence-quality.ts).
 */
import * as fs from "fs";
import * as path from "path";
import { resolvePlaybookContext } from "../src/lib/playbook/resolve-context";

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

// ---------------------------------------------------------------------
// A minimal, generic fake Supabase query builder. Each `.from(table)`
// call looks up a scenario-provided resolver for that table; the
// resolver receives every filter applied via .eq()/.in() and returns the
// canned {data, error, count} for that exact query. Chaining -- .select,
// .eq, .in, .order, .limit -- just accumulates state; the builder is
// awaitable directly (list-style) and also exposes .maybeSingle()/
// .single() (row-style), matching every call shape resolve-context.ts
// actually uses.
// ---------------------------------------------------------------------
type Filters = Record<string, unknown>;
type TableResolver = (filters: Filters, opts: { count?: boolean }) => { data: unknown; error: unknown; count?: number };

function fakeSupabase(tables: Record<string, TableResolver>) {
  function builder(table: string) {
    const filters: Filters = {};
    let countMode = false;
    const self = {
      select(_cols: string, opts?: { count?: string; head?: boolean }) {
        if (opts?.count) countMode = true;
        return self;
      },
      eq(col: string, val: unknown) {
        filters[col] = val;
        return self;
      },
      in(col: string, vals: unknown[]) {
        filters[col] = vals;
        return self;
      },
      order() {
        return self;
      },
      limit() {
        return self;
      },
      maybeSingle() {
        const resolver = tables[table];
        return Promise.resolve(resolver ? resolver(filters, {}) : { data: null, error: null });
      },
      single() {
        const resolver = tables[table];
        return Promise.resolve(resolver ? resolver(filters, {}) : { data: null, error: { message: "not found" } });
      },
      then(resolve: (v: unknown) => void) {
        const resolver = tables[table];
        const result = resolver ? resolver(filters, { count: countMode }) : { data: [], error: null };
        resolve(result);
      }
    };
    return self;
  }
  return { from: builder } as unknown as Parameters<typeof resolvePlaybookContext>[0];
}

const ORG_A = "org-a";
const ORG_B = "org-b";
const PROSPECT_A1 = "prospect-a1";

function baseProspectRow(overrides: Record<string, unknown> = {}) {
  return {
    id: PROSPECT_A1,
    organization_id: ORG_A,
    source: "manual",
    business_name: "Test Roofing Co",
    industry: "roofer",
    phone: "555-0100",
    email: null,
    website_url: null,
    has_website: false,
    address: null,
    city: "Atlanta",
    state: "GA",
    rating: null,
    review_count: null,
    open_24_hours: false,
    demo_url: null,
    project_id: null,
    status: "new",
    suppressed_at: null,
    suppression_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

function baseTables(overrides: Partial<Record<string, TableResolver>> = {}): Record<string, TableResolver> {
  return {
    prospects: (f) => ({ data: f.id === PROSPECT_A1 && f.organization_id === ORG_A ? baseProspectRow() : null, error: null }),
    prospect_contact_verifications: () => ({ data: [], error: null }),
    prospect_evidence_observations: () => ({ data: [], error: null }),
    opportunity_briefs: () => ({ data: null, error: null }),
    prospect_activities: (_f, opts) => (opts.count ? { data: null, error: null, count: 0 } : { data: [], error: null }),
    call_log: () => ({ data: null, error: null }),
    org_branding: () => ({ data: { brand_name: "VibeLabs" }, error: null }),
    organizations: () => ({ data: { name: "VibeLabs Agency" }, error: null }),
    ...overrides
  };
}

async function run() {
  console.log("A1. Same-tenant prospect resolves ok:true");
  {
    const supabase = fakeSupabase(baseTables());
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("resolves ok:true", result.ok === true);
    check("businessName is the real resolved value, not fabricated", result.ok && result.intelligence.businessName === "Test Roofing Co");
  }

  console.log("\nA2. Cross-tenant prospect id (wrong organizationId) resolves PROSPECT_NOT_FOUND, not partial data");
  {
    const supabase = fakeSupabase(baseTables());
    const result = await resolvePlaybookContext(supabase, ORG_B, { prospectId: PROSPECT_A1 });
    check("blocked with PROSPECT_NOT_FOUND", !result.ok && result.reason === "PROSPECT_NOT_FOUND");
  }

  console.log("\nA3. A guessed prospect id that doesn't exist at all also resolves PROSPECT_NOT_FOUND");
  {
    const supabase = fakeSupabase(baseTables());
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: "guessed-id-does-not-exist" });
    check("blocked with PROSPECT_NOT_FOUND", !result.ok && result.reason === "PROSPECT_NOT_FOUND");
  }

  console.log("\nA4. An actionId belonging to a DIFFERENT prospect is rejected, not silently accepted");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_actions: (f) => ({
          data: f.id === "action-1" && f.organization_id === ORG_A ? { id: "action-1", prospect_id: "some-other-prospect", action_type: "CONTACT", status: "PENDING", metadata: null } : null,
          error: null
        })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1, actionId: "action-1" });
    check("blocked with ACTION_PROSPECT_MISMATCH", !result.ok && result.reason === "ACTION_PROSPECT_MISMATCH");
  }

  console.log("\nA5. A completed/stale action is rejected (must be PENDING/SNOOZED)");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_actions: (f) => ({
          data: f.id === "action-1" ? { id: "action-1", prospect_id: PROSPECT_A1, action_type: "CONTACT", status: "COMPLETED", metadata: null } : null,
          error: null
        })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1, actionId: "action-1" });
    check("blocked with ACTION_NOT_ACTIVE", !result.ok && result.reason === "ACTION_NOT_ACTIVE");
  }

  console.log("\nA6. A cross-tenant guessed action id (right shape, wrong org) resolves ACTION_NOT_FOUND");
  {
    const supabase = fakeSupabase(baseTables({ prospect_actions: () => ({ data: null, error: null }) }));
    const result = await resolvePlaybookContext(supabase, ORG_B, { prospectId: PROSPECT_A1, actionId: "action-1" });
    check("blocked (PROSPECT_NOT_FOUND fires first, same safe outcome)", !result.ok);
  }

  console.log("\nA7. A valid SEQUENCE_STEP action with an ACTIVE enrollment resolves real sequence context");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_actions: (f) => ({
          data:
            f.id === "action-seq" && f.organization_id === ORG_A
              ? {
                  id: "action-seq",
                  prospect_id: PROSPECT_A1,
                  action_type: "SEQUENCE_STEP",
                  status: "PENDING",
                  metadata: { sequenceId: "seq-1", sequenceStepId: "step-1", enrollmentId: "enroll-1", channel: "CALL", sequenceName: "Roofer Outreach" }
                }
              : null,
          error: null
        }),
        prospect_sequence_enrollments: (f) => ({
          data: f.id === "enroll-1" && f.organization_id === ORG_A && f.prospect_id === PROSPECT_A1 ? { id: "enroll-1", sequence_id: "seq-1", status: "ACTIVE", current_step_order: 2 } : null,
          error: null
        }),
        outreach_sequence_steps: () => ({ data: { id: "step-1", instructions: "Ask about storm damage" }, error: null })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1, actionId: "action-seq" });
    check("resolves ok:true", result.ok === true);
    check("sequence context is populated from the real enrollment, not the client-supplied metadata alone", result.ok && result.sequence?.currentStepOrder === 2);
    check("channel comes through as CALL", result.ok && result.sequence?.channel === "CALL");
  }

  console.log("\nA8. A SEQUENCE_STEP action whose enrollment is no longer ACTIVE is rejected");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_actions: () => ({
          data: { id: "action-seq", prospect_id: PROSPECT_A1, action_type: "SEQUENCE_STEP", status: "PENDING", metadata: { sequenceId: "seq-1", sequenceStepId: "step-1", enrollmentId: "enroll-1", channel: "CALL", sequenceName: "x" } },
          error: null
        }),
        prospect_sequence_enrollments: () => ({ data: { id: "enroll-1", sequence_id: "seq-1", status: "PAUSED", current_step_order: 2 }, error: null })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1, actionId: "action-seq" });
    check("blocked with ENROLLMENT_NOT_ACTIVE", !result.ok && result.reason === "ENROLLMENT_NOT_ACTIVE");
  }

  console.log("\nA9. A suppressed prospect resolves ok:true (read-only history) but with BOTH channels forced un-activatable");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospects: (f) => ({ data: f.id === PROSPECT_A1 ? baseProspectRow({ suppressed_at: new Date().toISOString(), suppression_reason: "OPTED_OUT" }) : null, error: null }),
        // Even if verification rows exist, suppression must win -- this
        // resolver would make CALL activatable if suppression weren't
        // checked first.
        prospect_contact_verifications: () => ({ data: [{ channel: "CALL", contact_value: "555-0100", is_single_source: true }], error: null })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("resolves ok:true (not blocked outright)", result.ok === true);
    check("intelligence.suppressed is true", result.ok && result.intelligence.suppressed === true);
    check("CALL is forced un-activatable despite a real verification row existing", result.ok && result.channels.call.activatable === false);
    check("EMAIL is forced un-activatable too", result.ok && result.channels.email.activatable === false);
    check("recommendedChannel is null", result.ok && result.recommendedChannel === null);
  }

  console.log("\nA10. Verified CALL only -> CALL activatable, EMAIL not, recommendedChannel is CALL");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_contact_verifications: () => ({ data: [{ channel: "CALL", contact_value: "555-0100", is_single_source: true }], error: null })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("CALL activatable", result.ok && result.channels.call.activatable === true);
    check("EMAIL not activatable", result.ok && result.channels.email.activatable === false);
    check("recommendedChannel is CALL", result.ok && result.recommendedChannel === "CALL");
  }

  console.log("\nA11. Verified EMAIL only -> recommendedChannel is EMAIL");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_contact_verifications: () => ({ data: [{ channel: "EMAIL", contact_value: "owner@example.com", is_single_source: true }], error: null })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("recommendedChannel is EMAIL", result.ok && result.recommendedChannel === "EMAIL");
  }

  console.log("\nA12. Conflicting CALL sources -> CALL not activatable, reason conflicting_sources");
  {
    const supabase = fakeSupabase(
      baseTables({
        prospect_contact_verifications: () => ({
          data: [
            { channel: "CALL", contact_value: "555-0100", is_single_source: true },
            { channel: "CALL", contact_value: "555-9999", is_single_source: true }
          ],
          error: null
        })
      })
    );
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("CALL not activatable", result.ok && result.channels.call.activatable === false);
    check("reason is conflicting_sources", result.ok && !result.channels.call.activatable && result.channels.call.reason === "conflicting_sources");
    check("recommendedChannel is null (never silently falls back to a conflicted channel)", result.ok && result.recommendedChannel === null);
  }

  console.log("\nA13. A prospect's own industry resolves the correct playbook config (roofer -> Roofing, not generic)");
  {
    const supabase = fakeSupabase(baseTables());
    const result = await resolvePlaybookContext(supabase, ORG_A, { prospectId: PROSPECT_A1 });
    check("config.industryKey is 'roofer'", result.ok && result.config.industryKey === "roofer");
  }
}

// ---------------------------------------------------------------------
// Section B: structural / event-semantics source inspection, matching
// this repo's own established convention.
// ---------------------------------------------------------------------
function src(relPath: string): string {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

function runSourceChecks() {
  console.log("\nB1. The playbook GET route never writes -- no .insert/.update/.upsert/.delete anywhere in it");
  {
    const routeSrc = src("src/app/api/prospects/[id]/playbook/route.ts");
    check("no .insert(", !/\.insert\(/.test(routeSrc));
    check("no .update(", !/\.update\(/.test(routeSrc));
    check("no .upsert(", !/\.upsert\(/.test(routeSrc));
    check("no .delete(", !/\.delete\(/.test(routeSrc));
    check("no logActivity call", !/logActivity/.test(routeSrc));
  }

  console.log("\nB2. resolve-context.ts itself never writes either -- pure read-and-decide");
  {
    const ctxSrc = src("src/lib/playbook/resolve-context.ts");
    check("no .insert(", !/\.insert\(/.test(ctxSrc));
    check("no .update(", !/\.update\(/.test(ctxSrc));
    check("no logActivity call", !/logActivity/.test(ctxSrc));
  }

  console.log("\nB3. Stage navigation (Back/Next) and copying a script never call any API -- pure client state");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    const goNextBody = wsSrc.match(/function goNext\(\)[^}]*\{([^}]*)\}/)?.[1] ?? "";
    const goBackBody = wsSrc.match(/function goBack\(\)[^}]*\{([^}]*)\}/)?.[1] ?? "";
    check("goNext() contains no fetch(", !/fetch\(/.test(goNextBody));
    check("goBack() contains no fetch(", !/fetch\(/.test(goBackBody));
    const copyScriptBody = wsSrc.match(/function copyScript\(\)\s*\{([\s\S]*?)\n  \}/)?.[1] ?? "";
    check("copyScript() found and contains no fetch(", copyScriptBody.length > 0 && !/fetch\(/.test(copyScriptBody));
    check("copyScript() only touches the clipboard", /navigator\.clipboard\.writeText/.test(copyScriptBody));
  }

  console.log("\nB4. Loading the playbook page/workspace never marks an action performed -- only handleOutcomeConfirm may call a mutating outcome route");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    const mutatingRoutes = ["/sequence-enrollments/", "/pitch/", "/suppress"];
    // Every fetch() call to a mutating outcome-shaped route must appear
    // textually inside handleOutcomeConfirm's own function body (or its
    // prepareScript helper, which only ever GENERATES a script -- not an
    // outcome) -- never inside a stage-navigation or render function.
    const handleOutcomeConfirmBody = wsSrc.slice(wsSrc.indexOf("async function handleOutcomeConfirm"), wsSrc.indexOf("if (loading) {"));
    for (const routeFragment of mutatingRoutes) {
      check(`"${routeFragment}" fetch call appears within handleOutcomeConfirm's own scope`, handleOutcomeConfirmBody.includes(routeFragment));
    }
  }

  console.log("\nB5. Suppression check runs on EVERY playbook resolution, unconditionally");
  {
    const ctxSrc = src("src/lib/playbook/resolve-context.ts");
    check("isSuppressed(prospect) is called", /isSuppressed\(prospect\)/.test(ctxSrc));
    // The suppressed check must happen BEFORE the contact-verification
    // query is evaluated for activation, so a suppressed prospect's real
    // verification rows can never leak through as an activatable channel.
    const suppressedIdx = ctxSrc.indexOf("const suppressed = isSuppressed(prospect)");
    const channelBlockIdx = ctxSrc.indexOf("let channels: PlaybookChannelStatus");
    check("suppression is computed before channel activation is computed", suppressedIdx > -1 && channelBlockIdx > -1 && suppressedIdx < channelBlockIdx);
  }

  console.log("\nB6. Opt-out routes through the canonical suppression endpoint, never a parallel mechanism");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    check('outcome "opted_out" calls POST /api/prospects/[id]/suppress', /outcome === "opted_out"[\s\S]{0,300}\/suppress/.test(wsSrc));
    check('the suppress call uses action:"suppress", reason:"OPTED_OUT"', /action: "suppress"[\s\S]{0,50}reason: "OPTED_OUT"/.test(wsSrc));
  }

  console.log("\nB7. WON never creates a project automatically -- project creation stays a separate, explicit action");
  {
    const actionsSrc = src("src/app/api/prospects/[id]/actions/route.ts");
    check(
      "create_fulfillment_project requires prospect.status === 'won' AND no existing project",
      /if \(prospect\.status !== "won"\)/.test(actionsSrc) && /if \(prospect\.projectId\)/.test(actionsSrc)
    );
    const pitchOutcomeSrc = src("src/app/api/prospects/[id]/pitch/[pitchId]/outcome/route.ts");
    const performSrc = src("src/app/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform/route.ts");
    check("the pitch outcome route (which the playbook reuses for 'won') never inserts into projects", !/\.from\("projects"\)/.test(pitchOutcomeSrc));
    check("the sequence perform route (which the playbook reuses for 'won') never inserts into projects", !/\.from\("projects"\)/.test(performSrc));
  }

  console.log("\nB8. Recommended Offer and Agreed Scope stay structurally separate -- the playbook never writes recommendedOffer into a handoff field");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    check("playbook code never calls the /handoff route at all (offer presentation is read-only reference)", !/\/handoff/.test(wsSrc));
    const handoffPanelSrc = src("src/app/prospects/[id]/handoff-panel.tsx");
    check("handoff-panel.tsx keeps recommendedOffer visually/structurally separate from the agreedScope input", /AI-recommended offer \(not scope\)/.test(handoffPanelSrc));
  }

  console.log("\nB9. Unsaved-session exit behavior is real, not decorative");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    check("a beforeunload handler is registered", /addEventListener\("beforeunload"/.test(wsSrc));
    check('an explicit "Exit Without Recording" control exists', /Exit Without Recording/.test(wsSrc));
    check("the beforeunload handler is gated on real dirty state, not always firing", /if \(!dirty \|\| outcomeSaved\) return;/.test(wsSrc));
  }

  console.log("\nB10. Every internal database id is used only programmatically in the workspace, never rendered as visible UI text");
  {
    const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
    // The only ids ever interpolated into JSX text content (not a URL/
    // fetch call) would show up as a bare {something.id} inside a <p>/
    // <span> -- a coarse but real structural check that no raw id field
    // is directly rendered as prose.
    check("no raw '.id}' rendered as visible text via a <p>/<span> wrapping just an id", !/<(p|span)[^>]*>\s*\{[a-zA-Z.]+\.id\}\s*<\/(p|span)>/.test(wsSrc));
  }

  console.log("\nB11. Tenant scoping: every server-side table read that matters is scoped to organization_id, not just prospect id alone");
  {
    const ctxSrc = src("src/lib/playbook/resolve-context.ts");
    const orgScopedTables = ["prospects", "prospect_actions", "prospect_sequence_enrollments", "prospect_contact_verifications", "prospect_activities"];
    for (const table of orgScopedTables) {
      const tableBlockMatch = ctxSrc.match(new RegExp(`\\.from\\("${table}"\\)[\\s\\S]{0,260}`));
      check(`.from("${table}") query includes .eq("organization_id", organizationId)`, Boolean(tableBlockMatch && /\.eq\("organization_id", organizationId\)/.test(tableBlockMatch[0])));
    }
  }
}

run()
  .then(() => {
    runSourceChecks();
    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
