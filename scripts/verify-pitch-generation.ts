/**
 * Regression test for the pure parts of lib/prospect/pitch-generation.ts
 * (email-output parsing, source fingerprinting). The actual AI call
 * (generatePitch) needs a real OpenAI request — exercised in the P1
 * real acceptance test instead, not here.
 *
 * Run with: npx tsx scripts/verify-pitch-generation.ts
 */
import { parseEmailOutput, computePitchSourceFingerprint } from "../src/lib/prospect/pitch-generation";
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

console.log("1. parseEmailOutput handles the requested SUBJECT/BODY format");
{
  const r = parseEmailOutput("SUBJECT: Quick idea for Atlanta Roofing\n\nBODY: Hey, noticed you don't have a site yet...");
  check("subject parsed", r.subject === "Quick idea for Atlanta Roofing");
  check("body parsed", r.body.startsWith("Hey, noticed"));
}

console.log("2. parseEmailOutput falls back gracefully when the model doesn't follow the format");
{
  const r = parseEmailOutput("Just a plain response with no subject/body markers.");
  check("subject is null, not fabricated", r.subject === null);
  check("body is the raw text", r.body === "Just a plain response with no subject/body markers.");
}

console.log("3. computePitchSourceFingerprint is deterministic and sensitive to real changes");
{
  const prospect: Prospect = { id: "p1", organizationId: "o1", source: "finder", businessName: "A", hasWebsite: false, open24Hours: false, status: "new", createdAt: "", updatedAt: "" };
  const ctxA = buildPitchContext(prospect, null, false, "VibeLabs");
  const ctxB = buildPitchContext(prospect, null, false, "VibeLabs");
  const ctxC = buildPitchContext({ ...prospect, rating: 4.9 }, null, false, "VibeLabs");
  check("same input produces the same fingerprint", computePitchSourceFingerprint(ctxA) === computePitchSourceFingerprint(ctxB));
  check("a real change in the underlying facts changes the fingerprint", computePitchSourceFingerprint(ctxA) !== computePitchSourceFingerprint(ctxC));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
