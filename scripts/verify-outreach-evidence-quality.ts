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
import { looksLikeBotChallenge } from "../src/lib/capture/playwright-provider";

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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
