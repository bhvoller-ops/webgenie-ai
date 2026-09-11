/**
 * Home Services Live Outreach Playbook — typed application configuration.
 *
 * Version 1 constraint (explicit instruction): no database migration for
 * this feature. Every script, stage, objection response, and discovery
 * question below is plain TypeScript data, not a DB-backed content model.
 * A later industry (HVAC, plumbing, ...) should mostly mean writing a new
 * file shaped like roofing-config.ts, not touching this file or the UI.
 *
 * IMPORTANT: nothing in this module is outreach. It only describes what a
 * human could say and what the UI should show them — see the Human-
 * Execution Rule in the playbook's own implementation prompt. No function
 * here sends, calls, or contacts anyone.
 */

export type PlaybookStageKey =
  | "PRE_CALL_CHECK"
  | "GATEKEEPER"
  | "OPENING"
  | "VERIFIED_OBSERVATION"
  | "DISCOVERY"
  | "OBJECTIONS"
  | "BOOK_ASSESSMENT"
  | "OUTCOME"
  | "NO_ANSWER"
  | "ASSESSMENT_GUIDE"
  | "OFFER"
  | "WON_HANDOFF";

export const PLAYBOOK_STAGE_ORDER: PlaybookStageKey[] = [
  "PRE_CALL_CHECK",
  "GATEKEEPER",
  "OPENING",
  "VERIFIED_OBSERVATION",
  "DISCOVERY",
  "OBJECTIONS",
  "BOOK_ASSESSMENT",
  "OUTCOME"
];

export const PLAYBOOK_STAGE_LABELS: Record<PlaybookStageKey, string> = {
  PRE_CALL_CHECK: "Pre-Call Check",
  GATEKEEPER: "Gatekeeper or Decision-Maker",
  OPENING: "Permission-Based Opening",
  VERIFIED_OBSERVATION: "Verified Observation",
  DISCOVERY: "Discovery",
  OBJECTIONS: "Objection Assistant",
  BOOK_ASSESSMENT: "Book the Assessment",
  OUTCOME: "Structured Outcome",
  NO_ANSWER: "No-Answer / Voicemail / Email",
  ASSESSMENT_GUIDE: "15-Minute Assessment Guide",
  OFFER: "Home Services Offer",
  WON_HANDOFF: "Won Client Handoff"
};

export interface DiscoveryQuestion {
  key: string;
  question: string;
}

export interface ObjectionResponse {
  key: string;
  label: string;
  response: string;
}

/** Evidence categories a playbook variant considers a genuinely material, observable opportunity. Descriptive only — never auto-applied as a claim. */
export interface EvidenceCategory {
  key: string;
  label: string;
  description: string;
}

export interface AssessmentMinuteBlock {
  window: string;
  title: string;
  prompt: string;
}

export interface HomeServicesOfferConfig {
  name: string;
  scopeComponents: string[];
  optionalAddOns: string[];
}

/**
 * The full config one playbook variant needs. `industryKey` matches the
 * repo's existing prospect.industry values (see lib/sitegen/finder-
 * taxonomy.ts) so resolution from a real prospect is a plain lookup, never
 * a new taxonomy. Template strings use {{businessName}}-style placeholders
 * filled in by lib/playbook/render.ts against real, verified prospect data
 * only -- never invented facts.
 */
export interface PlaybookConfig {
  playbookName: string;
  industryKey: string;
  terminology: {
    /** e.g. "roofing company" / "home services business" */
    businessNoun: string;
    /** e.g. "roof inspection" / "on-site assessment" */
    assessmentNoun: string;
  };
  commonServices: string[];
  primaryCustomerAction: string;
  discoveryQuestions: DiscoveryQuestion[];
  evidenceCategories: EvidenceCategory[];
  openings: {
    gatekeeperOpening: string;
    gatekeeperWhatIsThisAbout: string;
    permissionOpening: string;
    verifiedObservationTemplate: string;
  };
  objectionResponses: ObjectionResponse[];
  bookingClose: string;
  voicemailScript: string;
  emailTemplate: { subject: string; body: string };
  offer: HomeServicesOfferConfig;
  assessment: AssessmentMinuteBlock[];
}
