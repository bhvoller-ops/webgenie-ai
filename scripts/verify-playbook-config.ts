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
import { renderTemplate } from "../src/lib/playbook/render";
import { PLAYBOOK_OUTCOMES, OUTCOME_MAPPING, REQUIRES_NOTE as REQUIRES_NOTE_FOR_TEST, REQUIRES_FOLLOW_UP as REQUIRES_FOLLOW_UP_FOR_TEST } from "../src/app/prospects/[id]/playbook/outcome-panel";

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

console.log("\n5. Outcome vocabulary maps only onto EXISTING enums — no invented duplicate event semantics");
{
  const EXISTING_OUTCOME_ENUM = ["no_answer", "left_voicemail", "sent", "replied", "interested", "not_interested", "meeting_booked", "won", "lost"];
  check(
    "every non-null mapped value is one of the app's existing 9 outcome statuses",
    Object.values(OUTCOME_MAPPING).every((m) => m.value === null || EXISTING_OUTCOME_ENUM.includes(m.value))
  );
  check("every playbook outcome option has a mapping entry (no orphan option)", PLAYBOOK_OUTCOMES.every((o) => o.key in OUTCOME_MAPPING));
  check("'opted_out' maps to null — routed through /suppress instead, never through the outcome enum", OUTCOME_MAPPING.opted_out.value === null);
  check("'won' maps to the existing 'won' status", OUTCOME_MAPPING.won.value === "won" && OUTCOME_MAPPING.won.exact);
  check("'lost' maps to the existing 'lost' status", OUTCOME_MAPPING.lost.value === "lost" && OUTCOME_MAPPING.lost.exact);
  check("'assessment_booked' maps to the existing 'meeting_booked' status", OUTCOME_MAPPING.assessment_booked.value === "meeting_booked" && OUTCOME_MAPPING.assessment_booked.exact);
  check("'voicemail_left' maps to the existing 'left_voicemail' status", OUTCOME_MAPPING.voicemail_left.value === "left_voicemail" && OUTCOME_MAPPING.voicemail_left.exact);
  check("the full 18-option vocabulary (spec's 15 + won/lost + email_sent) is all present", PLAYBOOK_OUTCOMES.length === 18);
}

console.log("\n6. Owner-review correction: no outcome claims something that didn't happen (rules 1 & 2)");
{
  check(
    "'gatekeeper_only' does NOT claim nothing happened -- 'no_answer' is used only as the least-wrong non-stop bucket, and is marked lossy (disclosed, not silent)",
    OUTCOME_MAPPING.gatekeeper_only.value === "no_answer" && !OUTCOME_MAPPING.gatekeeper_only.exact
  );
  check(
    "'information_requested' is never stored as 'sent' -- nothing was transmitted, so 'sent' would be a materially misleading stored value",
    OUTCOME_MAPPING.information_requested.value !== "sent"
  );
  check(
    "'callback_scheduled' is never stored as 'sent' either, for the same reason",
    OUTCOME_MAPPING.callback_scheduled.value !== "sent"
  );
  check(
    "'voicemail_left' is genuinely distinct from 'no_answer' -- never conflated",
    OUTCOME_MAPPING.voicemail_left.value !== OUTCOME_MAPPING.no_answer.value
  );
  check("'email_sent' exists and maps EXACTLY to 'sent' (this is what 'sent' was always meant for)", OUTCOME_MAPPING.email_sent.value === "sent" && OUTCOME_MAPPING.email_sent.exact);
  check(
    "every LOSSY mapping requires a note (so the real detail is never lost, only the stored enum is approximate)",
    Object.entries(OUTCOME_MAPPING).every(([key, m]) => {
      if (m.exact || key === "opted_out") return true;
      return REQUIRES_NOTE_FOR_TEST.includes(key as keyof typeof OUTCOME_MAPPING);
    })
  );
}

console.log("\n7. Owner-review correction: sequence-progression correctness (rule 3) -- cross-checked against the REAL route source, not just re-asserted here");
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

  check(
    "'wrong_contact' / 'number_invalid' / 'contact_info_disputed' are all STOP outcomes -- continuing to retry known-bad contact data would be wrong, not merely imprecise",
    OUTCOME_MAPPING.wrong_contact.isStopOutcome && OUTCOME_MAPPING.number_invalid.isStopOutcome && OUTCOME_MAPPING.contact_info_disputed.isStopOutcome
  );
  check(
    "'gatekeeper_only' is NON-STOP -- the decision-maker hasn't been reached yet, so the sequence should keep trying",
    !OUTCOME_MAPPING.gatekeeper_only.isStopOutcome
  );
}

console.log("\n8. Owner-review correction: a promised follow-up is never silently dropped (part of rule 1's spirit)");
{
  check("'callback_scheduled' requires a follow-up date, not merely offers one", REQUIRES_FOLLOW_UP_FOR_TEST.includes("callback_scheduled"));
  check("'qualified_not_ready' requires a follow-up date too", REQUIRES_FOLLOW_UP_FOR_TEST.includes("qualified_not_ready"));
}

console.log("\n9. Owner-review correction: 'assessment_booked' never implies WON (rule 6)");
{
  check("'assessment_booked' and 'won' map to genuinely different stored values", OUTCOME_MAPPING.assessment_booked.value !== OUTCOME_MAPPING.won.value);
  check("selecting 'assessment_booked' is a completely separate choice from 'won' in the picker (not a sub-state of it)", PLAYBOOK_OUTCOMES.some((o) => o.key === "assessment_booked") && PLAYBOOK_OUTCOMES.some((o) => o.key === "won"));
}

console.log("\n10. Full outcome-mapping table (for the owner-review report)");
{
  for (const o of PLAYBOOK_OUTCOMES) {
    const m = OUTCOME_MAPPING[o.key];
    console.log(
      `  ${o.label.padEnd(28)} -> ${(m.value ?? "(suppress route)").padEnd(15)} | ${m.exact ? "EXACT" : "LOSSY"} | ${m.isStopOutcome ? "STOP " : "CONT "} | note:${REQUIRES_NOTE_FOR_TEST.includes(o.key) ? "req" : "opt "} | followUp:${REQUIRES_FOLLOW_UP_FOR_TEST.includes(o.key) ? "req" : "opt "}`
    );
  }
  check("table printed for every outcome", true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
