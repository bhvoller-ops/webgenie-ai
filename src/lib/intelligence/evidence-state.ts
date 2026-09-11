/**
 * Hotfix (2026-09-11, docs/history.md): the evidence-state model that
 * replaces "zero detections -> absent" everywhere in the audit/outreach
 * pipeline. A real production batch generated confident "no reviews, no
 * CTA" claims for three roofing companies whose live sites genuinely have
 * both -- one capture was silently a bot-detection interstitial, two were
 * genuine large captures that a JSDOM extraction bug under-read. Neither
 * case should ever have been able to produce a confident absence claim.
 */
export type EvidenceState =
  | "VERIFIED_PRESENT"
  | "VERIFIED_ABSENT"
  | "INCONCLUSIVE"
  | "CAPTURE_BLOCKED"
  | "EXTRACTION_FAILED";

/**
 * Only VERIFIED_ABSENT may support language stating an element is missing
 * (the master prompt's own rule, carried into code). Every other state --
 * including a plain zero count from a reliable extraction that simply
 * didn't happen to match a keyword list -- must be treated as "we don't
 * know," never "we know it's not there."
 */
export function canClaimAbsence(state: EvidenceState): boolean {
  return state === "VERIFIED_ABSENT";
}

/**
 * The single place that turns a capture's reliability signals into an
 * EvidenceState for one deterministic signal category (trust signals,
 * CTAs, forms, headings, ...). `signalCount` is the count of whatever was
 * actually detected (e.g. trustSignals.length); a reliable extraction
 * finding genuinely zero is VERIFIED_ABSENT (the deterministic scanner's
 * own ground truth), but only once capture and extraction are both
 * trustworthy -- either failure mode short-circuits straight to the
 * failure state, never to a lower-confidence "found nothing" reading.
 */
export function computeEvidenceState(input: {
  likelyBlocked: boolean;
  extractionReliable: boolean;
  signalCount: number;
}): EvidenceState {
  if (input.likelyBlocked) return "CAPTURE_BLOCKED";
  if (!input.extractionReliable) return "EXTRACTION_FAILED";
  return input.signalCount > 0 ? "VERIFIED_PRESENT" : "VERIFIED_ABSENT";
}

/**
 * Human-readable weakness/finding phrasing gated by evidence state --
 * the actual mechanism that stops "not detected" becoming "does not
 * exist" in generated prose. Callers pass the confident phrasing they'd
 * use for a real VERIFIED_ABSENT finding; every other state gets an
 * honest, non-absence-claiming substitute instead of that text.
 */
export function phraseFinding(state: EvidenceState, confidentAbsenceText: string, subjectLabel: string): string {
  switch (state) {
    case "VERIFIED_ABSENT":
      return confidentAbsenceText;
    case "VERIFIED_PRESENT":
      return `${subjectLabel} was detected -- see the evidence detail for specifics.`;
    case "CAPTURE_BLOCKED":
      return `Could not reliably assess ${subjectLabel.toLowerCase()} -- the page load appears to have been blocked (bot detection or similar); this is not evidence the site lacks it.`;
    case "EXTRACTION_FAILED":
      return `Could not reliably assess ${subjectLabel.toLowerCase()} -- the page captured successfully but structural extraction did not behave as expected; this is not evidence the site lacks it.`;
    case "INCONCLUSIVE":
    default:
      return `Not enough reliable evidence to assess ${subjectLabel.toLowerCase()} either way.`;
  }
}
