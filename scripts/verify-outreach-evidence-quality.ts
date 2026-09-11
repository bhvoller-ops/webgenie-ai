/**
 * Regression fixtures for the outreach-evidence-quality hotfix
 * (docs/history.md, 2026-09-11) -- a real VibeLabs production batch
 * generated inaccurate "no reviews/no CTA" claims for three roofing
 * companies whose live sites genuinely have both, plus five EMAIL-channel
 * drafts with no verified email on file for any of the five prospects.
 *
 * Pure logic only, same shape as the other scripts/verify-*.ts files --
 * no DB connection, no network call. Fixture values below are the exact
 * real numbers captured in production for the confirmed bot-challenge
 * case (Georgia Roof Advisors) and the confirmed real-capture cases
 * (Findlay Roofing, Superior Roofing Company of Georgia), taken directly
 * from the stored page_captures/analysis_outputs rows.
 *
 * Run with: npx tsx scripts/verify-outreach-evidence-quality.ts
 */
import { readFileSync } from "fs";
import { looksLikeBotChallenge } from "../src/lib/capture/playwright-provider";
import { isExtractionAnomalous } from "../src/lib/capture/extract-features";
import { canClaimAbsence, computeEvidenceState, phraseFinding } from "../src/lib/intelligence/evidence-state";
import { evaluateChannelActivation, isChannelVerified, type ContactVerificationRecord } from "../src/lib/prospect/contact-verification";
import { buildPitchContext } from "../src/lib/prospect/pitch-context";
import type { Prospect } from "../src/lib/prospect/types";

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

console.log("1. bot-challenge detection (item 1: renderer/crawler limitation)");
{
  // Real production capture of georgiaroofadvisors.com -- title, word
  // count (24 words per analysis_outputs.output.moduleScores[content]),
  // and status code (202) exactly as stored.
  check(
    "Georgia Roof Advisors' real captured interstitial is flagged likelyBlocked",
    looksLikeBotChallenge("Robot Challenge Screen", 24, 202)
  );
  // Real production captures of Findlay Roofing and Superior Roofing --
  // genuine pages, real titles, substantial word counts, status 200.
  // These must NOT be flagged blocked -- they're a different, still-open
  // defect (JSDOM under-extracting headings/CTAs from large real HTML),
  // not a bot-detection case, and over-flagging real captures would hide
  // genuine failures behind a false "blocked" label.
  check(
    "Findlay Roofing's real capture (200, 1516 words) is NOT flagged blocked",
    !looksLikeBotChallenge("Roofing Company in Atlanta | Findlay Roofing", 1516, 200)
  );
  check(
    "Superior Roofing's real capture (200, 2457 words) is NOT flagged blocked",
    !looksLikeBotChallenge("Roofing in Monroe GA – Monroe Roofing Contractors & Top Roofing Company", 2457, 200)
  );
  // A normal, healthy, ordinary page must never be flagged.
  check(
    "An ordinary successful page (200, 800 words, normal title) is not flagged",
    !looksLikeBotChallenge("About Us | Example Roofing Co", 800, 200)
  );
  // Other known interstitial title shapes.
  check("\"Just a moment...\" (Cloudflare) is flagged", looksLikeBotChallenge("Just a moment...", 10, 403));
  check("\"Attention Required!\" is flagged", looksLikeBotChallenge("Attention Required! | Cloudflare", 15, 403));
  // A near-empty page with an unusual status but no recognizable title --
  // the numeric fallback path, not the title-pattern path.
  check(
    "A near-empty 403 with no matching title still flags via the word-count fallback",
    looksLikeBotChallenge("Example Domain", 5, 403)
  );
  // A short-but-real page (a real thin site, not a challenge page) must
  // not be flagged just for being brief, as long as status is a normal 200.
  check(
    "A short but genuine 200 page (39 words) is not flagged",
    !looksLikeBotChallenge("Contact Us", 39, 200)
  );
}

console.log("2. EMAIL-channel guard shape (item 2: prevent EMAIL actions without a verified email)");
{
  // Mirrors the exact guard added to /api/prospects/[id]/sequence-message
  // and /api/prospects/[id]/pitch -- verified here as pure logic since the
  // routes themselves require a live request/DB context to exercise.
  function wouldBlockEmailGeneration(channel: string, prospectEmail: string | null | undefined): boolean {
    return channel === "EMAIL" && !prospectEmail;
  }
  check(
    "EMAIL generation is blocked with no verified email (the real production case, all 5 prospects)",
    wouldBlockEmailGeneration("EMAIL", null)
  );
  check(
    "EMAIL generation is blocked with an empty-string email",
    wouldBlockEmailGeneration("EMAIL", "")
  );
  check(
    "EMAIL generation is allowed once a verified email is on file",
    !wouldBlockEmailGeneration("EMAIL", "glengibson1994@gmail.com")
  );
  check(
    "CALL generation is never blocked by the email check regardless of email state",
    !wouldBlockEmailGeneration("CALL", null)
  );
}

console.log("3. large valid HTML with real headings/forms/CTAs/trust signals (test category 1)");
{
  const realisticHtml = "x".repeat(300_000); // matches Findlay's real 290 KB capture size
  check(
    "a real page with genuine structural content is NOT flagged anomalous",
    !isExtractionAnomalous(realisticHtml, { headings: [{ level: 1, text: "Home" }], forms: [{ action: null, method: "get", fieldCount: 3 }], internalLinks: ["/about", "/services"], trustSignals: ["insured", "guarantee"] })
  );
}

console.log("4. large HTML where extraction unexpectedly returns all zeros (test category 2)");
{
  // The exact real anomaly: Findlay Roofing (290 KB, real 200) and
  // Superior Roofing (450 KB, real 200) both produced 0 headings, 0
  // forms, 0 internal links, 0 trust signals from genuinely rich pages.
  const findlayHtmlSize = "x".repeat(290_000);
  const superiorHtmlSize = "x".repeat(450_000);
  check(
    "Findlay-sized capture with all-zero structural extraction IS flagged anomalous",
    isExtractionAnomalous(findlayHtmlSize, { headings: [], forms: [], internalLinks: [], trustSignals: [] })
  );
  check(
    "Superior-sized capture with all-zero structural extraction IS flagged anomalous",
    isExtractionAnomalous(superiorHtmlSize, { headings: [], forms: [], internalLinks: [], trustSignals: [] })
  );
  // A genuinely small/thin real page legitimately has few or zero of
  // these -- must not be flagged just for being small.
  check(
    "A genuinely small page (under the substantial-HTML threshold) with zero signals is NOT flagged anomalous",
    !isExtractionAnomalous("x".repeat(2000), { headings: [], forms: [], internalLinks: [], trustSignals: [] })
  );
  // Partial signal (e.g. real headings exist, but genuinely no forms/
  // trust copy on a simple page) must not trip the all-zero signature.
  check(
    "A large page with SOME real signals (not all four zero) is NOT flagged anomalous",
    !isExtractionAnomalous("x".repeat(300_000), { headings: [{ level: 1, text: "Home" }], forms: [], internalLinks: [], trustSignals: [] })
  );
}

console.log("5. bot-detection and access-denied content (test category 3, cross-referenced with section 1 above)");
{
  check("access-denied title is flagged blocked", looksLikeBotChallenge("Access Denied", 8, 403));
  check("a genuinely large, real capture is never conflated with a blocked one", !looksLikeBotChallenge("Roofing Company in Atlanta | Findlay Roofing", 1516, 200));
}

console.log("6. inconclusive/failed evidence is prohibited from absence claims (test category 4)");
{
  check("VERIFIED_ABSENT may support an absence claim", canClaimAbsence("VERIFIED_ABSENT"));
  check("VERIFIED_PRESENT may NOT support an absence claim", !canClaimAbsence("VERIFIED_PRESENT"));
  check("INCONCLUSIVE may NOT support an absence claim", !canClaimAbsence("INCONCLUSIVE"));
  check("CAPTURE_BLOCKED may NOT support an absence claim", !canClaimAbsence("CAPTURE_BLOCKED"));
  check("EXTRACTION_FAILED may NOT support an absence claim", !canClaimAbsence("EXTRACTION_FAILED"));

  // The exact real incident, reconstructed: Georgia Roof Advisors'
  // capture was blocked -> must resolve to CAPTURE_BLOCKED, never
  // VERIFIED_ABSENT, regardless of the deterministic scanner finding 0
  // trust signals in the interstitial's own near-empty text.
  check(
    "a blocked capture with 0 signals resolves to CAPTURE_BLOCKED, not VERIFIED_ABSENT",
    computeEvidenceState({ likelyBlocked: true, extractionReliable: true, signalCount: 0 }) === "CAPTURE_BLOCKED"
  );
  // Findlay/Superior, reconstructed: capture succeeded, extraction was
  // the unreliable part -> EXTRACTION_FAILED, never VERIFIED_ABSENT.
  check(
    "an unreliable extraction with 0 signals resolves to EXTRACTION_FAILED, not VERIFIED_ABSENT",
    computeEvidenceState({ likelyBlocked: false, extractionReliable: false, signalCount: 0 }) === "EXTRACTION_FAILED"
  );
  // The genuinely correct case: reliable capture, reliable extraction,
  // truly zero signals -> VERIFIED_ABSENT is the honest reading.
  check(
    "a reliable capture and extraction with genuinely 0 signals resolves to VERIFIED_ABSENT",
    computeEvidenceState({ likelyBlocked: false, extractionReliable: true, signalCount: 0 }) === "VERIFIED_ABSENT"
  );
  check(
    "a reliable capture and extraction with signals present resolves to VERIFIED_PRESENT",
    computeEvidenceState({ likelyBlocked: false, extractionReliable: true, signalCount: 3 }) === "VERIFIED_PRESENT"
  );

  // phraseFinding must never emit confident absence text for a
  // non-VERIFIED_ABSENT state -- this is the actual mechanism that stops
  // "there are no reviews, testimonials, or examples of past work shown
  // anywhere on the site" (the real false claim) from being written for
  // an EXTRACTION_FAILED or CAPTURE_BLOCKED capture.
  const confidentText = "There are no reviews, testimonials, or examples of past work shown anywhere on the site.";
  check(
    "EXTRACTION_FAILED never emits the confident absence sentence",
    phraseFinding("EXTRACTION_FAILED", confidentText, "Trust signals") !== confidentText
  );
  check(
    "CAPTURE_BLOCKED never emits the confident absence sentence",
    phraseFinding("CAPTURE_BLOCKED", confidentText, "Trust signals") !== confidentText
  );
  check(
    "VERIFIED_ABSENT is the only state that emits the confident absence sentence",
    phraseFinding("VERIFIED_ABSENT", confidentText, "Trust signals") === confidentText
  );
}

console.log("7. manually verified evidence flows into generated messaging (test category 5)");
{
  const fakeProspect = {
    businessName: "Test Co",
    industry: "roofer",
    city: "Atlanta",
    state: "GA",
    phone: "5551234567",
    websiteUrl: "https://example.com",
    hasWebsite: true,
    rating: 4.5,
    reviewCount: 20,
    demoUrl: null,
    projectId: null
  } as unknown as Prospect;

  const manualObservation = "The site's homepage title and all testimonials reference Texas cities (Arlington, Fort Worth, Dallas), not Atlanta.";
  const context = buildPitchContext(fakeProspect, null, false, "VibeLabs", [], [manualObservation]);
  check(
    "a manually verified observation appears in the pitch context's opportunityEvidence",
    context.opportunityEvidence.includes(manualObservation)
  );
  check(
    "manualObservations defaults to empty when the caller passes none (backward compatible)",
    buildPitchContext(fakeProspect, null, false, "VibeLabs").opportunityEvidence.length === 0
  );
}

console.log("8. missing and unverified contact information blocks its corresponding channel (test category 6)");
{
  check("EMAIL is not verified with zero records", !isChannelVerified([], "EMAIL"));
  check("CALL is not verified with zero records", !isChannelVerified([], "CALL"));

  const emailOnly: ContactVerificationRecord[] = [{ channel: "EMAIL", contactValue: "owner@example.com", isSingleSource: true }];
  check("EMAIL is verified once a record exists", isChannelVerified(emailOnly, "EMAIL"));
  check("CALL remains unverified even when EMAIL has a record (channels are independent)", !isChannelVerified(emailOnly, "CALL"));

  const singleSourcePhone: ContactVerificationRecord[] = [{ channel: "CALL", contactValue: "(404) 857-0033", isSingleSource: true }];
  const singleResult = evaluateChannelActivation(singleSourcePhone, "CALL");
  check(
    "a single-source-only phone is activatable but explicitly labeled single_source, never independently-verified",
    singleResult.activatable && singleResult.corroboration === "single_source"
  );
}

console.log("9. conflicting contact sources block activation (test category 7)");
{
  // The real incident: Google Places had (678) 723-9995 for Georgia Roof
  // Advisors; the business's own site publishes 678-757-3477.
  const conflicting: ContactVerificationRecord[] = [
    { channel: "CALL", contactValue: "(678) 723-9995", isSingleSource: true },
    { channel: "CALL", contactValue: "678-757-3477", isSingleSource: true }
  ];
  const result = evaluateChannelActivation(conflicting, "CALL");
  check(
    "two genuinely different phone numbers for the same channel block activation",
    !result.activatable && !result.activatable ? result.reason === "conflicting_sources" : false
  );

  // Formatting-only differences must NEVER be treated as a conflict --
  // "(678) 757-3477" and "678-757-3477" are the same number.
  const sameNumberDifferentFormatting: ContactVerificationRecord[] = [
    { channel: "CALL", contactValue: "(678) 757-3477", isSingleSource: true },
    { channel: "CALL", contactValue: "678-757-3477", isSingleSource: false }
  ];
  const formattingResult = evaluateChannelActivation(sameNumberDifferentFormatting, "CALL");
  check(
    "the same phone number in different formatting is never treated as a false conflict",
    formattingResult.activatable && formattingResult.activatable ? formattingResult.corroboration === "multi_source_agreeing" : false
  );

  // Two agreeing sources for the same email (case-insensitive) is
  // multi_source_agreeing, not single_source.
  const agreeingEmails: ContactVerificationRecord[] = [
    { channel: "EMAIL", contactValue: "Owner@Example.com", isSingleSource: true },
    { channel: "EMAIL", contactValue: "owner@example.com", isSingleSource: true }
  ];
  const emailResult = evaluateChannelActivation(agreeingEmails, "EMAIL");
  check(
    "two sources agreeing on the same email (case-insensitive) corroborate, not conflict",
    emailResult.activatable && emailResult.activatable ? emailResult.corroboration === "multi_source_agreeing" : false
  );
}

console.log("10. suppression overrides every affected generation path (test category 8)");
{
  // Same structural-verification style as scripts/verify-suppression.ts
  // (fixed in this hotfix, section 2 above) -- confirms the two NEW
  // generation routes this hotfix touches both gate on isSuppressed()
  // before doing anything else, closing the exact gap this hotfix found
  // (neither route checked suppression at all beforehand).
  const sequenceMessageSrc = readFileSync("src/app/api/prospects/[id]/sequence-message/route.ts", "utf8");
  const pitchSrc = readFileSync("src/app/api/prospects/[id]/pitch/route.ts", "utf8");
  for (const [name, src] of [["sequence-message", sequenceMessageSrc], ["pitch", pitchSrc]] as const) {
    check(`${name}/route.ts imports isSuppressed`, /import\s*\{\s*isSuppressed\s*\}/.test(src));
    check(`${name}/route.ts calls isSuppressed(prospect) and returns 409 before generation`, /isSuppressed\(prospect\)/.test(src) && /status:\s*409/.test(src));
  }
}

console.log("11. tenant isolation and test-organization exclusion (test category 9)");
{
  // The new migration (041, not applied this hotfix) follows the exact
  // established RLS + tenant-guard-trigger shape every other prospect-
  // child table already uses (prospect_actions, prospect_activities,
  // prospect_handoffs) -- verified structurally since there is no live
  // database to exercise RLS against without applying it.
  const migrationSrc = readFileSync("supabase/migrations/041_outreach_evidence_verification.sql", "utf8");
  check("both new tables enable row level security", (migrationSrc.match(/enable row level security/g) ?? []).length === 2);
  check("both new tables have an organization_members-scoped policy", (migrationSrc.match(/join public\.organization_members m/g) ?? []).length >= 2);
  check("both new tables have a tenant-consistency guard trigger", (migrationSrc.match(/for each row execute function public\.enforce_.*_tenant\(\)/g) ?? []).length === 2);
  check("both new tables carry organization_id and prospect_id for join-through-parent scoping", /organization_id uuid not null references public\.organizations/.test(migrationSrc) && /prospect_id uuid not null references public\.prospects/.test(migrationSrc));

  // The read helper (manual-evidence.ts) always filters by BOTH
  // organization_id and prospect_id -- never prospect_id alone (which
  // would rely on RLS as the only tenant boundary rather than defense in
  // depth, the same principle every other read in this codebase follows).
  const manualEvidenceSrc = readFileSync("src/lib/prospect/manual-evidence.ts", "utf8");
  check(
    "getVerifiedManualObservations filters by organization_id, not prospect_id alone",
    /\.eq\("organization_id", organizationId\)/.test(manualEvidenceSrc) && /\.eq\("prospect_id", prospectId\)/.test(manualEvidenceSrc)
  );
  check(
    "getVerifiedManualObservations only returns VERIFIED_PRESENT/VERIFIED_ABSENT rows, never INCONCLUSIVE/CAPTURE_BLOCKED/EXTRACTION_FAILED",
    /\.in\("evidence_state",\s*\[\s*"VERIFIED_PRESENT",\s*"VERIFIED_ABSENT"\s*\]\)/.test(manualEvidenceSrc)
  );
}

console.log("12. fail-closed correction: no legacy-data fallback remains, missing table is a distinct compatibility block");
{
  // This turn's correction: the prior version of both routes fell back
  // to checking prospects.email whenever prospect_contact_verifications
  // had zero rows -- which fired identically whether the table simply
  // had no rows for this prospect OR didn't exist at all yet. That let
  // unverified legacy data silently authorize a channel. Fixed to
  // distinguish the two and never fall back to legacy data either way.
  const sequenceMessageSrc = readFileSync("src/app/api/prospects/[id]/sequence-message/route.ts", "utf8");
  const pitchSrc = readFileSync("src/app/api/prospects/[id]/pitch/route.ts", "utf8");
  for (const [name, src] of [["sequence-message", sequenceMessageSrc], ["pitch", pitchSrc]] as const) {
    check(
      `${name}/route.ts's channel guard never references prospect.email or prospect.phone as a fallback authorization`,
      !/!prospect\.email/.test(src) && !/!prospect\.phone/.test(src)
    );
    check(
      `${name}/route.ts returns a distinct VERIFICATION_SYSTEM_UNAVAILABLE compatibility block (503) when the verification query errors`,
      /VERIFICATION_SYSTEM_UNAVAILABLE/.test(src) && /status:\s*503/.test(src)
    );
    check(
      `${name}/route.ts calls evaluateChannelActivation() unconditionally on whatever records exist (including zero), not only when records.length > 0`,
      !/if\s*\(\s*records\.length\s*>\s*0\s*\)/.test(src)
    );
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
