/**
 * Home Services Live Outreach Playbook — config-layer verification. No
 * migration, no DB: this is pure application configuration (Version 1
 * constraint), so these are all pure-logic checks against the actual
 * exported config objects, plus the template-render function.
 */
import { HOME_SERVICES_BASE_CONFIG } from "../src/lib/playbook/home-services-config";
import { ROOFING_CONFIG } from "../src/lib/playbook/roofing-config";
import { resolvePlaybookConfig } from "../src/lib/playbook/get-config";
import { renderTemplate } from "../src/lib/playbook/render";
import { PLAYBOOK_OUTCOMES, OUTCOME_MAPPING } from "../src/app/prospects/[id]/playbook/outcome-panel";

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
    Object.values(OUTCOME_MAPPING).every((v) => v === null || EXISTING_OUTCOME_ENUM.includes(v))
  );
  check("every playbook outcome option has a mapping entry (no orphan option)", PLAYBOOK_OUTCOMES.every((o) => o.key in OUTCOME_MAPPING));
  check("'opted_out' maps to null — routed through /suppress instead, never through the outcome enum", OUTCOME_MAPPING.opted_out === null);
  check("'won' maps to the existing 'won' status (-> call_log.status='closed')", OUTCOME_MAPPING.won === "won");
  check("'lost' maps to the existing 'lost' status", OUTCOME_MAPPING.lost === "lost");
  check("'assessment_booked' maps to the existing 'meeting_booked' status", OUTCOME_MAPPING.assessment_booked === "meeting_booked");
  check("'voicemail_left' maps to the existing 'left_voicemail' status", OUTCOME_MAPPING.voicemail_left === "left_voicemail");
  check("the full 17-option vocabulary from the spec is all present", PLAYBOOK_OUTCOMES.length === 17);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
