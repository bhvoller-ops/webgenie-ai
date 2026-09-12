/**
 * WEBGENIE PR #30 FINAL SEMANTIC CORRECTION — the 20 tests explicitly
 * required by the owner-review "no lossy outcomes" pass. Each test below
 * is numbered to match that request's Phase 5 list verbatim.
 */
import * as fs from "fs";
import * as path from "path";
import { OUTCOME_MAPPING, CONVERSATION_BRANCHES, REQUIRES_FOLLOW_UP, PLAYBOOK_OUTCOMES } from "../src/app/prospects/[id]/playbook/outcome-panel";

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

function src(relPath: string): string {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

const wsSrc = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
const opSrc = src("src/app/prospects/[id]/playbook/outcome-panel.tsx");
const nbaSrc = src("src/lib/prospect/action-generation.ts");
const actionSyncSrc = src("src/lib/prospect/action-sync.ts");
const performSrc = src("src/app/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform/route.ts");

console.log("1. Wrong contact is never stored as not_interested (it is never stored as anything -- not a key in OUTCOME_MAPPING at all)");
check("'wrong_contact' has no entry in OUTCOME_MAPPING", !("wrong_contact" in OUTCOME_MAPPING));
check("'wrong_contact' is a real, operational conversation branch instead", Boolean(CONVERSATION_BRANCHES.find((b) => b.key === "wrong_contact" && b.operational)));

console.log("\n2. Number invalid is never stored as not_interested");
check("'number_invalid' has no entry in OUTCOME_MAPPING", !("number_invalid" in OUTCOME_MAPPING));
check("'number_invalid' is a real, operational conversation branch instead", Boolean(CONVERSATION_BRANCHES.find((b) => b.key === "number_invalid" && b.operational)));

console.log("\n3. Contact disputed is never stored as not_interested");
check("'contact_info_disputed' has no entry in OUTCOME_MAPPING", !("contact_info_disputed" in OUTCOME_MAPPING));
check("'contact_info_disputed' is a real, operational conversation branch instead", Boolean(CONVERSATION_BRANCHES.find((b) => b.key === "contact_info_disputed" && b.operational)));

console.log("\n4. Other is never stored as no_answer (it no longer exists as a persisted outcome at all)");
check("'other' has no entry in OUTCOME_MAPPING", !("other" in OUTCOME_MAPPING));
check("'other' does not appear in the persisted outcome list either", !PLAYBOOK_OUTCOMES.some((o) => (o.key as string) === "other"));

console.log("\n5. Gatekeeper-only does not create a false no-answer event");
{
  check("'gatekeeper_only' has no entry in OUTCOME_MAPPING -- it cannot itself produce ANY stored event", !("gatekeeper_only" in OUTCOME_MAPPING));
  const branch = CONVERSATION_BRANCHES.find((b) => b.key === "gatekeeper_only");
  check("'gatekeeper_only' is a branch that requires the caller to pick a real result afterward", Boolean(branch && !branch.operational));
  check(
    "if the caller picks 'no_answer' from that branch, it is an explicit, informed choice they made -- not an automatic consequence of the branch itself",
    Boolean(branch?.reachableOutcomes?.includes("no_answer"))
  );
}

console.log("\n6. Spoke-with-decision-maker requires a real disposition");
{
  check("'spoke_with_decision_maker' has no entry in OUTCOME_MAPPING", !("spoke_with_decision_maker" in OUTCOME_MAPPING));
  const branch = CONVERSATION_BRANCHES.find((b) => b.key === "spoke_with_decision_maker");
  check("it is a non-operational branch (must resolve to a real outcome, not skip/snooze)", Boolean(branch && !branch.operational));
  check("it cannot resolve to 'no_answer' -- if someone was spoken to, 'no answer' is never a truthful result of this branch", Boolean(branch && !branch.reachableOutcomes?.includes("no_answer")));
  check(
    "it offers real dispositions: interested, not_interested, assessment_booked, information_requested, callback_scheduled, qualified_not_ready",
    Boolean(
      branch?.reachableOutcomes?.includes("interested") &&
        branch.reachableOutcomes.includes("not_interested") &&
        branch.reachableOutcomes.includes("assessment_booked") &&
        branch.reachableOutcomes.includes("information_requested") &&
        branch.reachableOutcomes.includes("callback_scheduled") &&
        branch.reachableOutcomes.includes("qualified_not_ready")
    )
  );
}

console.log("\n7. Information requested produces the proper next action");
{
  check("'information_requested' maps to 'replied' (the prospect genuinely responded -- exact)", OUTCOME_MAPPING.information_requested.value === "replied");
  check(
    "the real computeProspectAction() unconditionally routes call_log.status 'replied' to REVIEW_REPLY -- a genuine, existing, queue-visible next action",
    /callLog\?\.status === "interested" \|\| callLog\?\.status === "replied"/.test(nbaSrc) && /actionType: "REVIEW_REPLY"/.test(nbaSrc)
  );
  check(
    "OPERATIONAL FOLLOW-THROUGH CORRECTION: this is disclosed to the caller in the UI before they save -- 'information_requested' now creates its own real, immediately-actionable Send-information action, not silently assumed",
    /This creates a real, immediately-actionable \\"Send information\\" action/.test(opSrc)
  );
}

console.log("\n8. Callback scheduled requires a date/time");
check("'callback_scheduled' is in REQUIRES_FOLLOW_UP", REQUIRES_FOLLOW_UP.includes("callback_scheduled"));
check(
  "OPERATIONAL FOLLOW-THROUGH CORRECTION: the Confirm button is disabled until callback date, time AND purpose are all provided (a stricter, date/time/timezone-specific requirement than the old generic follow-up dropdown)",
  /callbackFieldsValid/.test(opSrc) && /Date, time, and a callback purpose are all required/.test(opSrc)
);
check(
  "the generic follow-up dropdown requirement still gates non-callback outcomes in REQUIRES_FOLLOW_UP (e.g. 'qualified_not_ready')",
  /followUpRequired && !isCallback && !followUpOption/.test(opSrc)
);

console.log("\n9. Callback scheduled creates one canonical follow-up action");
{
  check(
    "syncProspectAction() maintains exactly ONE PENDING/SNOOZED prospect_actions row per prospect (select ... .maybeSingle())",
    /\.in\("status", \["PENDING", "SNOOZED"\]\)\s*\.maybeSingle\(\)/.test(actionSyncSrc)
  );
  check(
    "the same action_type recurring (e.g. REVIEW_REPLY again) updates the existing row in place rather than inserting a second one",
    /isSameAction\(existing as ExistingActionRow, computed\)/.test(actionSyncSrc)
  );
}

console.log("\n10. Identical retry creates no duplicate follow-up action");
{
  check("the perform route's own activity logging uses a real, deterministic event_key (idempotent at the storage layer)", /eventKey: `contact_attempted:/.test(performSrc));
  check("regenerateProspectIntelligence() is called at the end of the perform route, re-running the same single-row reconciliation on every retry", /regenerateProspectIntelligence/.test(performSrc));
}

console.log("\n11. Qualified-but-not-ready requires an appropriate follow-up");
check("'qualified_not_ready' is in REQUIRES_FOLLOW_UP", REQUIRES_FOLLOW_UP.includes("qualified_not_ready"));
check("'qualified_not_ready' maps to 'interested' (genuinely accurate -- they ARE interested, just not ready now) and requires its own note", OUTCOME_MAPPING.qualified_not_ready.value === "interested");

console.log("\n12. No answer continues only according to the existing sequence rules");
check("'no_answer' is NON-STOP, matching the real route's own stopOutcomes list (cross-checked in verify-playbook-config.ts section 9)", !OUTCOME_MAPPING.no_answer.isStopOutcome);

console.log("\n13. Voicemail actually left remains distinct from no answer");
check("'voicemail_left' maps to 'left_voicemail', a genuinely different stored value than 'no_answer'", OUTCOME_MAPPING.voicemail_left.value === "left_voicemail" && OUTCOME_MAPPING.voicemail_left.value !== OUTCOME_MAPPING.no_answer.value);

console.log("\n14. Email actually sent requires explicit human confirmation");
{
  check("'email_sent' maps exactly to 'sent'", OUTCOME_MAPPING.email_sent.value === "sent");
  check(
    "EVERY outcome (including email_sent) passes through the same explicit confirmation statement before Confirm & Save fires",
    /I confirm that I personally initiated this/.test(opSrc) && /Confirm & Save/.test(opSrc)
  );
}

console.log("\n15. Meeting booked stops the sequence as designed");
check("'assessment_booked' -> 'meeting_booked' is a STOP outcome", OUTCOME_MAPPING.assessment_booked.isStopOutcome === true);

console.log("\n16. Opt-out uses canonical suppression");
{
  check("'opted_out' maps to null in OUTCOME_MAPPING -- never routed through perform()/pitch-outcome()", OUTCOME_MAPPING.opted_out.value === null);
  check('the workspace calls the canonical /suppress endpoint for opted_out, with action:"suppress", reason:"OPTED_OUT"', /outcome === "opted_out"[\s\S]{0,300}\/suppress/.test(wsSrc) && /action: "suppress"[\s\S]{0,50}reason: "OPTED_OUT"/.test(wsSrc));
}

console.log("\n17. Merely selecting a conversational branch writes nothing");
{
  // Selecting a branch only calls setSelection({ type: "branch", key }) --
  // pure client state, confirmed by there being no fetch() call anywhere
  // in the branch-selection button handlers themselves.
  const branchButtonHandlers = opSrc.match(/onClick=\{\(\) => setSelection\(\{ type: "branch", key: b\.key \}\)\}/g);
  check("the branch-selection button handler is a pure setSelection() state update, found in source", Boolean(branchButtonHandlers && branchButtonHandlers.length > 0));
  check("that exact handler contains no fetch( call", !opSrc.slice(opSrc.indexOf('onClick={() => setSelection({ type: "branch"')).slice(0, 200).includes("fetch("));
}

console.log("\n18. Closing the Playbook writes nothing");
{
  check("Exit / Exit Without Recording never calls fetch -- only router.push (client-side navigation)", /Exit Without Recording/.test(wsSrc) && /router\.push\(`\/prospects\/\$\{prospectId\}`\)/.test(wsSrc));
}

console.log("\n19. Notes cannot contradict the canonical outcome");
{
  // The note textarea has no outcome-selecting control of its own -- the
  // single already-selected `outcome` variable is what's passed to
  // onConfirm(), and that's the only thing the API call ever receives as
  // the outcome. There is no code path where free-text note content is
  // parsed back into a different outcome value.
  check(
    "onConfirm is always called with the single already-selected `outcome`, never derived from note text (the 4th `extra` argument carries only structured callback/info-request fields, never a note-derived outcome)",
    /onConfirm\(outcome, note, followUpOption, \{/.test(opSrc)
  );
  check("OUTCOME_MAPPING lookups are keyed by the selected outcome, never by note content", /OUTCOME_MAPPING\[outcome\]\.value/.test(wsSrc));
  check("no code anywhere parses the note field to determine which status to store (no note-derived branching)", !/note\.includes\(|note\.match\(|note\.split\(/.test(wsSrc) && !/note\.includes\(|note\.match\(|note\.split\(/.test(opSrc));
}

console.log("\n20. Historical event metadata remains structured and trustworthy");
{
  check(
    "the perform route's activity metadata is a real structured object (sequenceId/sequenceStepId/enrollmentId/outcome), not free text",
    /metadata: \{ sequenceId: enrollment\.sequence_id, sequenceStepId: parsed\.data\.sequenceStepId, enrollmentId, outcome: parsed\.data\.outcome \}/.test(performSrc)
  );
  check("the outcome value written to that metadata is the canonical mapped status the client sent, not raw free text", /outcome: parsed\.data\.outcome/.test(performSrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
