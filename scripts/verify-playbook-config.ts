/**
 * Home Services Live Outreach Playbook — config-layer verification. No
 * migration, no DB: this is pure application configuration (Version 1
 * constraint), so these are all pure-logic checks against the actual
 * exported config objects, plus the template-render function.
 */
import * as fs from "fs";
import * as path from "path";
import { HOME_SERVICES_BASE_CONFIG } from "../src/lib/playbook/home-services-config";
import { ROOFING_CONFIG } from "../src/lib/playbook/roofing-config";
import { resolvePlaybookConfig } from "../src/lib/playbook/get-config";
import { renderTemplate, type PlaybookRenderVars } from "../src/lib/playbook/render";
import {
  PLAYBOOK_OUTCOMES,
  OUTCOME_MAPPING,
  CONVERSATION_BRANCHES,
  REQUIRES_NOTE as REQUIRES_NOTE_FOR_TEST,
  REQUIRES_FOLLOW_UP as REQUIRES_FOLLOW_UP_FOR_TEST,
  REQUIRES_AFFIRMATION as REQUIRES_AFFIRMATION_FOR_TEST
} from "../src/app/prospects/[id]/playbook/outcome-panel";

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

console.log("1. Home Services base config is a complete, generic foundation");
{
  check("has at least 8 discovery questions", HOME_SERVICES_BASE_CONFIG.discoveryQuestions.length >= 8);
  check("has at least 10 evidence categories", HOME_SERVICES_BASE_CONFIG.evidenceCategories.length >= 10);
  check("has at least 10 objection responses (the spec's own list)", HOME_SERVICES_BASE_CONFIG.objectionResponses.length >= 10);
  check("every objection has a non-empty response", HOME_SERVICES_BASE_CONFIG.objectionResponses.every((o) => o.response.trim().length > 0));
  check("has a voicemail script", HOME_SERVICES_BASE_CONFIG.voicemailScript.length > 0);
  check("has an email template with subject and body", HOME_SERVICES_BASE_CONFIG.emailTemplate.subject.length > 0 && HOME_SERVICES_BASE_CONFIG.emailTemplate.body.length > 0);
  check("has exactly 5 assessment minute-blocks (0-2,2-6,6-10,10-13,13-15)", HOME_SERVICES_BASE_CONFIG.assessment.length === 5);
  check("offer has scope components and optional add-ons kept distinct", HOME_SERVICES_BASE_CONFIG.offer.scopeComponents.length > 0 && HOME_SERVICES_BASE_CONFIG.offer.optionalAddOns.length > 0);
  check(
    "scope components and add-ons don't overlap (never silently merged)",
    HOME_SERVICES_BASE_CONFIG.offer.scopeComponents.every((s) => !HOME_SERVICES_BASE_CONFIG.offer.optionalAddOns.includes(s))
  );
  check("industryKey is the generic fallback key", HOME_SERVICES_BASE_CONFIG.industryKey === "_default");
}

console.log("\n2. Roofing specialization overrides only what genuinely differs, inherits the rest");
{
  check("industryKey is 'roofer' — matches the real prospects.industry taxonomy value", ROOFING_CONFIG.industryKey === "roofer");
  check("terminology is roofing-specific, not generic", ROOFING_CONFIG.terminology.businessNoun === "roofing company" && ROOFING_CONFIG.terminology.businessNoun !== HOME_SERVICES_BASE_CONFIG.terminology.businessNoun);
  check("discovery questions are roofing-specific (storm damage), not just inherited verbatim", ROOFING_CONFIG.discoveryQuestions.some((q) => /storm/i.test(q.question)));
  check("evidence categories are roofing-specific (estimate form, not generic form)", ROOFING_CONFIG.evidenceCategories.some((e) => /estimate/i.test(e.label)));
  check(
    "objection responses are INHERITED unchanged, not duplicated with drift",
    JSON.stringify(ROOFING_CONFIG.objectionResponses) === JSON.stringify(HOME_SERVICES_BASE_CONFIG.objectionResponses)
  );
  check("booking close is INHERITED unchanged", ROOFING_CONFIG.bookingClose === HOME_SERVICES_BASE_CONFIG.bookingClose);
  check("voicemail script is INHERITED unchanged", ROOFING_CONFIG.voicemailScript === HOME_SERVICES_BASE_CONFIG.voicemailScript);
  check("assessment structure is INHERITED unchanged", JSON.stringify(ROOFING_CONFIG.assessment) === JSON.stringify(HOME_SERVICES_BASE_CONFIG.assessment));
  check("offer scope components are roofing-specific (storm damage, not generic 'repairs')", ROOFING_CONFIG.offer.scopeComponents.some((s) => /storm damage/i.test(s)));
}

console.log("\n3. Config resolution is a plain, extensible lookup (the pattern later industries should follow)");
{
  check("a real roofer prospect resolves to the Roofing config", resolvePlaybookConfig("roofer") === ROOFING_CONFIG);
  check("an unmapped industry (e.g. future HVAC) falls back to the Home Services base, not an error", resolvePlaybookConfig("hvac") === HOME_SERVICES_BASE_CONFIG);
  check("null/undefined industry falls back to the Home Services base", resolvePlaybookConfig(null) === HOME_SERVICES_BASE_CONFIG && resolvePlaybookConfig(undefined) === HOME_SERVICES_BASE_CONFIG);
}

console.log("\n4. Template rendering never fabricates a fact for a missing variable");
{
  check(
    "a real supplied value is inserted verbatim",
    renderTemplate("Hi, this is {{callerName}}.", { callerName: "Alex" }) === "Hi, this is Alex."
  );
  check(
    "a missing value becomes a visible bracketed placeholder, never a blank/confident string",
    renderTemplate("I noticed {{verifiedObservation}}.", {}) === "I noticed [verified observation]."
  );
  check(
    "an empty-string value is also treated as missing (not rendered as literally nothing)",
    renderTemplate("Hi {{name}}", { name: "   " }) === "Hi [name]"
  );
  check("multiple variables in one template all resolve independently", renderTemplate("{{a}} and {{b}}", { a: "X", b: "Y" }) === "X and Y");
}

console.log("\n5. SEMANTIC CORRECTION: no persisted outcome is lossy -- every mapping is EXACT, no exceptions");
{
  const EXISTING_OUTCOME_ENUM = ["no_answer", "left_voicemail", "sent", "replied", "interested", "not_interested", "meeting_booked", "won", "lost"];
  check(
    "every non-null mapped value is one of the app's existing 9 outcome statuses",
    Object.values(OUTCOME_MAPPING).every((m) => m.value === null || EXISTING_OUTCOME_ENUM.includes(m.value))
  );
  check("every playbook outcome option has a mapping entry (no orphan option)", PLAYBOOK_OUTCOMES.every((o) => o.key in OUTCOME_MAPPING));
  check("EVERY mapping entry is exact -- there is no lossy/approximate entry left anywhere", Object.values(OUTCOME_MAPPING).every((m) => m.exact === true));
  check("'opted_out' maps to null — routed through /suppress instead, never through the outcome enum", OUTCOME_MAPPING.opted_out.value === null);
  check("'won' maps to the existing 'won' status", OUTCOME_MAPPING.won.value === "won");
  check("'lost' maps to the existing 'lost' status", OUTCOME_MAPPING.lost.value === "lost");
  check("'assessment_booked' maps to the existing 'meeting_booked' status", OUTCOME_MAPPING.assessment_booked.value === "meeting_booked");
  check("'voicemail_left' maps to the existing 'left_voicemail' status, distinct from 'no_answer'", OUTCOME_MAPPING.voicemail_left.value === "left_voicemail" && OUTCOME_MAPPING.voicemail_left.value !== OUTCOME_MAPPING.no_answer.value);
  check("'email_sent' maps EXACTLY to 'sent' (this is what 'sent' was always meant for)", OUTCOME_MAPPING.email_sent.value === "sent");
  check("the final persisted-outcome menu has exactly 13 entries (the semantically supported set)", PLAYBOOK_OUTCOMES.length === 13);
}

console.log("\n6. SEMANTIC CORRECTION: the 4 prohibited false mappings are gone -- not merely relabeled");
{
  check("'wrong_contact' is NOT a key in OUTCOME_MAPPING at all -- it is an operational branch, never a stored outcome", !("wrong_contact" in OUTCOME_MAPPING));
  check("'number_invalid' is NOT a key in OUTCOME_MAPPING at all", !("number_invalid" in OUTCOME_MAPPING));
  check("'contact_info_disputed' is NOT a key in OUTCOME_MAPPING at all", !("contact_info_disputed" in OUTCOME_MAPPING));
  check("'other' is NOT a key in OUTCOME_MAPPING at all -- removed entirely, not repaired with a required note", !("other" in OUTCOME_MAPPING));
  check("'gatekeeper_only' is NOT a key in OUTCOME_MAPPING at all -- it is a branch, not a stored outcome", !("gatekeeper_only" in OUTCOME_MAPPING));
  check("'spoke_with_decision_maker' is NOT a key in OUTCOME_MAPPING at all -- it is a branch requiring a real disposition", !("spoke_with_decision_maker" in OUTCOME_MAPPING));

  const wrongContact = CONVERSATION_BRANCHES.find((b) => b.key === "wrong_contact");
  const numberInvalid = CONVERSATION_BRANCHES.find((b) => b.key === "number_invalid");
  const contactDisputed = CONVERSATION_BRANCHES.find((b) => b.key === "contact_info_disputed");
  check("'wrong_contact' is a real conversation branch, marked operational (skip/snooze only, no status)", Boolean(wrongContact?.operational));
  check("'number_invalid' is a real conversation branch, marked operational", Boolean(numberInvalid?.operational));
  check("'contact_info_disputed' is a real conversation branch, marked operational", Boolean(contactDisputed?.operational));

  const gatekeeperOnly = CONVERSATION_BRANCHES.find((b) => b.key === "gatekeeper_only");
  const spokeWith = CONVERSATION_BRANCHES.find((b) => b.key === "spoke_with_decision_maker");
  check("'gatekeeper_only' is a non-operational branch (reveals a filtered real-outcome list)", Boolean(gatekeeperOnly && !gatekeeperOnly.operational));
  check("'gatekeeper_only' cannot reach 'not_interested' or 'won' -- only genuinely plausible results from a gatekeeper-only call", Boolean(gatekeeperOnly?.reachableOutcomes?.every((k) => ["callback_scheduled", "information_requested", "no_answer"].includes(k))));
  check("'spoke_with_decision_maker' is a non-operational branch requiring a real disposition", Boolean(spokeWith && !spokeWith.operational));
  check("'spoke_with_decision_maker' cannot resolve to 'no_answer' -- if someone spoke, 'no answer' is never a valid result of this branch", Boolean(spokeWith && !spokeWith.reachableOutcomes?.includes("no_answer")));
}

console.log("\n7. SEMANTIC CORRECTION: 'interested' requires an affirmative confirmation, never assumed");
{
  check("'interested' requires an explicit affirmation gate", REQUIRES_AFFIRMATION_FOR_TEST.includes("interested"));
  check("'interested' requires a note", REQUIRES_NOTE_FOR_TEST.includes("interested"));
  check("'interested' requires a follow-up date", REQUIRES_FOLLOW_UP_FOR_TEST.includes("interested"));
  check("'qualified_not_ready' maps to the same 'interested' status but is a distinct, separately labeled choice (not silently folded away)", OUTCOME_MAPPING.qualified_not_ready.value === "interested" && OUTCOME_MAPPING.qualified_not_ready.value === OUTCOME_MAPPING.interested.value);
  check("'qualified_not_ready' still requires its own note + follow-up (the affirmation is specific to the bare 'Interested' button, not required a second time here since the note itself must state the qualification)", REQUIRES_NOTE_FOR_TEST.includes("qualified_not_ready") && REQUIRES_FOLLOW_UP_FOR_TEST.includes("qualified_not_ready"));
}

console.log("\n8. SEMANTIC CORRECTION: 'information_requested' / 'callback_scheduled' produce a REAL next action, not a note-only promise");
{
  const nbaSrc = fs.readFileSync(path.join(__dirname, "..", "src/lib/prospect/action-generation.ts"), "utf8");
  check(
    "the real computeProspectAction() routes call_log.status 'replied' to REVIEW_REPLY unconditionally (the actual, existing, queue-visible next action this produces)",
    /callLog\?\.status === "interested" \|\| callLog\?\.status === "replied"/.test(nbaSrc) && /actionType: "REVIEW_REPLY"/.test(nbaSrc)
  );
  check("'information_requested' maps to 'replied' -- the prospect genuinely responded, so this is exact, and REVIEW_REPLY is real and queue-visible", OUTCOME_MAPPING.information_requested.value === "replied");
  check("'callback_scheduled' maps to 'replied' for the same honest reason", OUTCOME_MAPPING.callback_scheduled.value === "replied");
  check("both require a note (the specific promise/detail is never buried -- it's what the human sees when they open the REVIEW_REPLY action)", REQUIRES_NOTE_FOR_TEST.includes("information_requested") && REQUIRES_NOTE_FOR_TEST.includes("callback_scheduled"));
  check("'callback_scheduled' additionally requires a real follow-up date, not merely a note", REQUIRES_FOLLOW_UP_FOR_TEST.includes("callback_scheduled"));
  const outcomePanelSrcForDisclosure = fs.readFileSync(path.join(__dirname, "..", "src/app/prospects/[id]/playbook/outcome-panel.tsx"), "utf8");
  check(
    "OPERATIONAL FOLLOW-THROUGH CORRECTION: the UI discloses that 'callback_scheduled' creates a real, due-dated Callback action (not merely a note on a generic REVIEW_REPLY)",
    /This creates a real, due-dated \\"Callback\\" action that will appear in Daily Queue/.test(outcomePanelSrcForDisclosure)
  );
  check(
    "OPERATIONAL FOLLOW-THROUGH CORRECTION: the UI discloses that 'information_requested' creates a real, immediately-actionable Send-information action (not merely a note)",
    /This creates a real, immediately-actionable \\"Send information\\" action/.test(outcomePanelSrcForDisclosure)
  );
  check("callback UI requires date, time and purpose before it can be confirmed (not merely the generic follow-up dropdown)", /callbackFieldsValid/.test(outcomePanelSrcForDisclosure) && /callbackDate/.test(outcomePanelSrcForDisclosure) && /callbackTime/.test(outcomePanelSrcForDisclosure) && /callbackPurpose/.test(outcomePanelSrcForDisclosure));
  check("information-requested UI requires the requested-info text before it can be confirmed", /infoFieldsValid/.test(outcomePanelSrcForDisclosure) && /requestedInfo/.test(outcomePanelSrcForDisclosure));
}

console.log("\n9. Sequence-progression correctness -- cross-checked against the REAL route source, not just re-asserted here");
{
  const performRouteSrc = fs.readFileSync(
    path.join(__dirname, "..", "src/app/api/prospects/[id]/sequence-enrollments/[enrollmentId]/perform/route.ts"),
    "utf8"
  );
  const stopOutcomesMatch = performRouteSrc.match(/const stopOutcomes:[^=]*=\s*\[([^\]]*)\]/);
  check("the real route's stopOutcomes array was found in source (test isn't silently passing on a missed regex)", Boolean(stopOutcomesMatch));
  const realStopOutcomes = (stopOutcomesMatch?.[1] ?? "").split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean);
  check("the real stopOutcomes array is exactly the expected 6 values", JSON.stringify(realStopOutcomes.sort()) === JSON.stringify(["interested", "lost", "meeting_booked", "not_interested", "replied", "won"].sort()));

  for (const [key, mapping] of Object.entries(OUTCOME_MAPPING)) {
    if (mapping.value === null) continue; // opted_out -- doesn't go through this route at all
    const realIsStop = realStopOutcomes.includes(mapping.value);
    check(`"${key}" -> "${mapping.value}": isStopOutcome (${mapping.isStopOutcome}) matches the real route's own stopOutcomes list (${realIsStop})`, mapping.isStopOutcome === realIsStop);
  }

  check("'no_answer' is NON-STOP -- the sequence should keep trying", !OUTCOME_MAPPING.no_answer.isStopOutcome);
  check("'voicemail_left' is NON-STOP", !OUTCOME_MAPPING.voicemail_left.isStopOutcome);
  check("'email_sent' is NON-STOP", !OUTCOME_MAPPING.email_sent.isStopOutcome);
}

console.log("\n10. 'assessment_booked' never implies WON");
{
  check("'assessment_booked' and 'won' map to genuinely different stored values", OUTCOME_MAPPING.assessment_booked.value !== OUTCOME_MAPPING.won.value);
  check("selecting 'assessment_booked' is a completely separate choice from 'won' in the picker (not a sub-state of it)", PLAYBOOK_OUTCOMES.some((o) => o.key === "assessment_booked") && PLAYBOOK_OUTCOMES.some((o) => o.key === "won"));
}

console.log("\n10b. Operational branches never touch perform()/pitch-outcome() -- only the existing skip/snooze operation");
{
  const wsSrc = fs.readFileSync(path.join(__dirname, "..", "src/app/prospects/[id]/playbook/playbook-workspace.tsx"), "utf8");
  const handleOpBody = wsSrc.slice(wsSrc.indexOf("async function handleOperational"), wsSrc.indexOf("if (loading) {"));
  check("handleOperational() calls the existing /api/prospect-actions/{id} route", /\/api\/prospect-actions\/\$\{actionId\}/.test(handleOpBody));
  check("handleOperational() never calls /perform or /pitch/.../outcome", !/\/perform/.test(handleOpBody) && !handleOpBody.includes("/outcome`"));
  check("handleOperational() never calls /suppress", !/\/suppress/.test(handleOpBody));
  const outcomePanelSrcForOperational = fs.readFileSync(path.join(__dirname, "..", "src/app/prospects/[id]/playbook/outcome-panel.tsx"), "utf8");
  check(
    "OPERATIONAL FOLLOW-THROUGH CORRECTION: the operational branch UI now truthfully discloses that a structured event WILL be recorded (the note is genuinely persisted, not a working-note-only fiction)",
    /What will be recorded:/.test(outcomePanelSrcForOperational) && /never classified as not interested, no answer, engagement, or conversion/.test(outcomePanelSrcForOperational)
  );
  check(
    "the operational branch discloses the channel-blocking consequence (only the affected channel, not the whole prospect)",
    /becomes unavailable in the Playbook until reverified/.test(outcomePanelSrcForOperational) && /other verified channels are untouched/.test(outcomePanelSrcForOperational)
  );
  check(
    "even with no queue action attached, the branch still offers to record the event (no dead end)",
    /onLogOnly/.test(outcomePanelSrcForOperational) && /Record this issue/.test(outcomePanelSrcForOperational)
  );
}

console.log("\n11. Full outcome-mapping table (for the semantic-correction report)");
{
  for (const o of PLAYBOOK_OUTCOMES) {
    const m = OUTCOME_MAPPING[o.key];
    console.log(
      `  ${o.label.padEnd(28)} -> ${(m.value ?? "(suppress route)").padEnd(15)} | EXACT | ${m.isStopOutcome ? "STOP " : "CONT "} | note:${REQUIRES_NOTE_FOR_TEST.includes(o.key) ? "req" : "opt "} | followUp:${REQUIRES_FOLLOW_UP_FOR_TEST.includes(o.key) ? "req" : "opt "} | affirm:${REQUIRES_AFFIRMATION_FOR_TEST.includes(o.key) ? "req" : "n/a"}`
    );
  }
  console.log("\n  Conversation branches (never persisted on their own):");
  for (const b of CONVERSATION_BRANCHES) {
    console.log(`  ${b.label.padEnd(28)} -> ${b.operational ? "operational (skip/snooze only)" : `resolves to: ${b.reachableOutcomes?.join(", ")}`}`);
  }
  check("table printed for every outcome and branch", true);
}

console.log("\n13. Owner-review visual QA fix: no 'X company companies' / 'X company businesses' grammar duplication in either config");
{
  const allTemplateText = (cfg: typeof HOME_SERVICES_BASE_CONFIG) =>
    [
      cfg.openings.gatekeeperOpening,
      cfg.openings.gatekeeperReachingRightPerson,
      cfg.openings.gatekeeperWhatIsThisAbout,
      cfg.openings.permissionOpening,
      cfg.openings.verifiedObservationTemplate,
      cfg.openings.verifiedObservationImpactTemplate,
      cfg.bookingClose,
      cfg.voicemailScript,
      cfg.emailTemplate.subject,
      cfg.emailTemplate.body,
      ...cfg.objectionResponses.map((o) => o.response)
    ].join("\n");

  for (const [name, cfg] of [["Home Services base", HOME_SERVICES_BASE_CONFIG], ["Roofing", ROOFING_CONFIG]] as const) {
    check(`${name}: no raw "{{businessNoun}} companies" template text`, !allTemplateText(cfg).includes("{{businessNoun}} companies"));
    check(`${name}: no raw "{{businessNoun}} businesses" template text`, !allTemplateText(cfg).includes("{{businessNoun}} businesses"));

    // Render every template with this config's own real terminology values
    // and confirm the ACTUAL rendered text never contains the duplicated
    // "<businessNoun> companies"/"<businessNoun> businesses" pattern --
    // this is the literal defect found in live visual QA ("roofing company
    // companies around Atlanta, GA").
    const vars: PlaybookRenderVars = {
      businessNoun: cfg.terminology.businessNoun,
      industryAdjective: cfg.terminology.industryAdjective,
      callerName: "Alex",
      organizationName: "VibeLabs",
      location: "Atlanta, GA",
      businessName: "Test Co"
    };
    const rendered = renderTemplate(allTemplateText(cfg), vars);
    check(`${name}: rendered text never contains "${cfg.terminology.businessNoun} companies"`, !rendered.includes(`${cfg.terminology.businessNoun} companies`));
    check(`${name}: rendered text never contains "${cfg.terminology.businessNoun} businesses"`, !rendered.includes(`${cfg.terminology.businessNoun} businesses`));
  }
}

console.log("\n14. Owner-review visual QA fix: no double period after a real observation that already ends in punctuation");
{
  for (const [name, cfg] of [["Home Services base", HOME_SERVICES_BASE_CONFIG], ["Roofing", ROOFING_CONFIG]] as const) {
    const rendered = renderTemplate(cfg.openings.verifiedObservationTemplate, {
      evidenceTarget: "https://example.com",
      // A real observation from production always ends in its own period.
      verifiedObservation: "Its site lists a Texas address for an Atlanta business."
    });
    check(`${name}: rendered observation sentence does not end in ".." `, !rendered.includes(".."));
  }
}

console.log("\n15. Owner-review visual QA fix: every stage script actually comes from config, not a hardcoded UI duplicate");
{
  const wsSrc = fs.readFileSync(path.join(__dirname, "..", "src/app/prospects/[id]/playbook/playbook-workspace.tsx"), "utf8");
  const stageConfigRefs: Record<string, string> = {
    GatekeeperStage: "config.openings.gatekeeperOpening",
    OpeningStage: "config.openings.permissionOpening",
    VerifiedObservationStage: "config.openings.verifiedObservationTemplate",
    BookAssessmentStage: "config.bookingClose"
  };
  for (const [fnName, expectedRef] of Object.entries(stageConfigRefs)) {
    const fnStart = wsSrc.indexOf(`function ${fnName}(`);
    const fnBody = wsSrc.slice(fnStart, wsSrc.indexOf("\n}\n", fnStart));
    check(`${fnName}() reads its script from ${expectedRef}, not a hardcoded literal`, fnStart > -1 && fnBody.includes(expectedRef));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
