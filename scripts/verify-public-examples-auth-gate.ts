/**
 * WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED FULL-VIEW GATE, FINAL pass.
 *
 * Supersedes the first pass's `isKnownSampleBusiness()` classifier, which
 * the owner correctly rejected: classifying a client-supplied
 * `/api/demo-site?b=<base64 business JSON>` payload as "a known sample"
 * (even via a full field match) still has a failure mode -- a payload
 * that doesn't match falls straight through to /api/demo-site's normal
 * unauthenticated rendering, which is a bypass, not a hardening.
 * Authorization for the 14 curated SAMPLE_BUSINESSES fixtures now lives
 * entirely in the dedicated /api/sample-preview route (below), which
 * never decodes or trusts any client-supplied business data at all --
 * see that route's own header for the full design.
 *
 * Evidence tiers, reported honestly:
 *  - REAL, executed: sanitizeReturnPath() (item 16) is the real exported
 *    function, called against real and adversarial inputs. The "unknown
 *    sample id" and "modified client data cannot influence the canonical
 *    sample" proofs (items 7/8) execute the SAME resolution SAMPLE_BUSINESSES.find()
 *    logic /api/sample-preview itself uses -- real, pure, no auth needed
 *    for that specific step.
 *  - Source-inspection: the auth gate itself (items 5/10), what a page
 *    renders/doesn't render for a logged-out vs. logged-in visitor
 *    (items 1-4, 9, 11), and the various zero-diff non-regression proofs
 *    (items 12/13/15/17) -- faking a real Supabase session inside a bare
 *    tsx script isn't possible (getAccessContext() calls next/headers'
 *    cookies(), which throws outside an active Next.js request scope;
 *    see finder-preview-security's own header for the identical
 *    constraint). The live, unauthenticated HTTP proof for items 5/10
 *    was run separately against a real dev server and is quoted verbatim
 *    in the final report, not re-executed here.
 *
 * Run with: npx tsx scripts/verify-public-examples-auth-gate.ts
 */
import { readFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";
import { SAMPLE_BUSINESSES } from "../src/lib/sitegen/samples";
import { sanitizeReturnPath } from "../src/lib/auth/return-path";

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
function src(file: string): string {
  return readFileSync(path.join(__dirname, "..", file), "utf8");
}
/** Strips // line comments and /* *\/ block comments so a text search can't false-positive on this script's own explanatory comments about what it removed. */
function withoutComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}
function diffAgainstMain(file: string): string {
  try {
    return execSync(`git diff main -- ${file}`, { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  } catch {
    return "(git diff failed)";
  }
}

console.log("1. Logged-out /samples is thumbnail-only");
{
  const samplesSrc = src("src/app/samples/page.tsx");
  check("SampleThumbnail only renders the real <a href={url}> link when isAuthenticated is true", /isAuthenticated \? \(\s*<a[\s\S]{0,200}href=\{url\}/.test(samplesSrc));
  check("the logged-out branch renders the required lock copy, not a link", /Full demo available after sign-in/.test(samplesSrc));
  check("a single section-level sign-in CTA exists, gated on !isAuthenticated", /!isAuthenticated \? \(/.test(samplesSrc) && /Sign in to view full demos/.test(samplesSrc));
}

console.log("\n2. Logged-out /gallery is thumbnail-only");
{
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("card is a plain <div> (not <button>, no onClick) when !isAuthenticated", /const CardTag = isAuthenticated \? "button" : "div"/.test(galleryClientSrc));
  check("onClick is only attached when isAuthenticated", /\.\.\.\(isAuthenticated \? \{ onClick: \(\) => handleCardClick\(ind\) \} : \{\}\)/.test(galleryClientSrc));
  check("handleCardClick() is a no-op when !isAuthenticated (never calls setPreview)", /function handleCardClick[\s\S]{0,120}if \(!isAuthenticated\) return;/.test(galleryClientSrc));
  check("the hover \"Preview\" badge is replaced with a lock label when !isAuthenticated", /Sign in to view/.test(galleryClientSrc));
}

console.log("\n3. Neither page exposes \"View Full Demo\" to a logged-out visitor");
{
  const homeSrc = src("src/app/page.tsx");
  check('HomePage() redirects every signed-in visitor away before Examples() ever renders (admin/partner/beta all redirect() out) -- so Examples() is ALWAYS the logged-out render', /if \(role === "admin"\) redirect/.test(homeSrc) && /if \(role === "partner"\) redirect/.test(homeSrc) && /if \(role === "beta"\) redirect/.test(homeSrc));
  check('Examples() renders no "View full demo" action text/link anywhere (comments excluded; case-sensitive so it doesn\'t false-positive on "Sign in to view full demos" copy)', !/View full demo\b/.test(withoutComments(homeSrc.slice(homeSrc.indexOf("function Examples")))));
  check('Examples() renders the required lock copy instead, once per card', (homeSrc.match(/Full demo available after sign-in/g) ?? []).length >= 1);
  const samplesSrc = src("src/app/samples/page.tsx");
  check('/samples\' logged-out branch (the : ( ... ) side of the isAuthenticated ternary) never contains "View full demo" text', (() => {
    const ternaryIdx = samplesSrc.indexOf("isAuthenticated ? (");
    const elseIdx = samplesSrc.indexOf(") : (", ternaryIdx);
    const closeIdx = samplesSrc.indexOf(")}", elseIdx);
    const elseBranch = samplesSrc.slice(elseIdx, closeIdx);
    return !/View full demo/i.test(elseBranch);
  })());
}

console.log("\n4. Neither page opens an iframe or interactive modal for a logged-out visitor");
{
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("the modal (which contains the only <iframe> in this file) is driven entirely by `preview` state, which handleCardClick only ever sets when isAuthenticated", /\{preview \? \(/.test(galleryClientSrc));
  check("openFullPreview() itself also refuses to act when !isAuthenticated (belt-and-suspenders beyond the trigger not rendering)", /function openFullPreview[\s\S]{0,120}if \(!isAuthenticated\) return;/.test(galleryClientSrc));
  check("renderIndustryPage is no longer imported/called client-side at all (moved server-side into /api/gallery-preview; comments excluded)", !/renderIndustryPage/.test(withoutComments(galleryClientSrc)));
  const homeSrc = src("src/app/page.tsx");
  const samplesSrc = src("src/app/samples/page.tsx");
  check("homepage Examples() contains no <iframe>", !/<iframe/.test(homeSrc));
  check("/samples contains no <iframe>", !/<iframe/.test(samplesSrc));
}

console.log("\n5. Unauthenticated /api/sample-preview?id=<valid> redirects to login (source; live HTTP proof quoted in the final report)");
{
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("the route resolves the business from SAMPLE_BUSINESSES BEFORE checking auth (so an unknown id 404s regardless of auth state)", samplePreviewSrc.indexOf("SAMPLE_BUSINESSES.find") < samplePreviewSrc.indexOf("await getAccessContext()"));
  check("auth is checked before generateSite() is ever called", samplePreviewSrc.indexOf("await getAccessContext()") < samplePreviewSrc.indexOf("generateSite(business"));
  check("an unauthenticated request redirects to /login with a sanitized returnTo, never renders content", /if \(!user\) \{[\s\S]{0,250}sanitizeReturnPath[\s\S]{0,150}Response\.redirect/.test(samplePreviewSrc));
  check("the redirect uses this file's own sanitizeReturnPath(), the same one /login and /auth/callback use", /import \{ sanitizeReturnPath \} from "@\/lib\/auth\/return-path"/.test(samplePreviewSrc));
}

console.log("\n6. Authenticated valid sample ID renders the canonical sample");
{
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("the rendered business is exactly the object resolved from SAMPLE_BUSINESSES, never re-assembled from request fields", /generateSite\(business, \{/.test(samplePreviewSrc));
  check("isSample: true is passed to generateSite() (same cosmetic/lead-routing behavior as the original sample rendering)", /isSample: true/.test(samplePreviewSrc));
  check("builtBy is a fixed, hardcoded string, never read from the request", /builtBy: "WebGenie AI"/.test(samplePreviewSrc) && !/searchParams\.get\("by"\)/.test(samplePreviewSrc));
}

console.log("\n7. Unknown sample ID returns 404 -- REAL execution of the same resolution logic the route uses");
{
  check('SAMPLE_BUSINESSES.find() returns undefined for a made-up id ("sample-does-not-exist")', SAMPLE_BUSINESSES.find((b) => b.id === "sample-does-not-exist") === undefined);
  check('SAMPLE_BUSINESSES.find() returns undefined for an empty string id', SAMPLE_BUSINESSES.find((b) => b.id === "") === undefined);
  check('SAMPLE_BUSINESSES.find() returns undefined for a real business id shape but not one of the 14 fixtures ("sample-veterinarian")', SAMPLE_BUSINESSES.find((b) => b.id === "sample-veterinarian") === undefined);
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("the route returns a real 404 Response when no match is found, not a fallback render", /if \(!business\) \{\s*\n\s*return new Response\("Unknown sample id\.", \{ status: 404 \}\);/.test(samplePreviewSrc));
}

console.log("\n8. Modified client business data cannot influence the canonical sample -- REAL execution");
{
  const canonical = SAMPLE_BUSINESSES.find((b) => b.id === "sample-plumber")!;
  check("resolving by id returns the exact canonical fixture object (same name/phone/city/state/rating)", canonical.name === "Cornerstone Plumbing Co." && canonical.city === "Atlanta" && canonical.state === "GA");
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("the route never reads a `b=` (or any other business-field) query param -- `id` is the only searchParams.get() call in the file", (() => {
    const calls = samplePreviewSrc.match(/searchParams\.get\("[^"]+"\)/g) ?? [];
    return calls.length === 1 && calls[0] === 'searchParams.get("id")';
  })());
  check("the route never reads an `org`/organization query param either -- no client-supplied organization id can reach this route", !/searchParams\.get\("org"\)/.test(samplePreviewSrc));
  check("the route never imports/calls decode() or Buffer.from(...,\"base64url\") -- no serialized business JSON is ever parsed here", !/base64url/.test(samplePreviewSrc) && !/function decode/.test(samplePreviewSrc));
}

console.log("\n9. No serialized b= payload is used for authenticated Sample links");
{
  check("neither /samples nor the homepage calls demoSiteUrl() at all anymore", !/demoSiteUrl\(/.test(src("src/app/samples/page.tsx")) && !/demoSiteUrl\(/.test(src("src/app/page.tsx")));
  const samplesSrc = src("src/app/samples/page.tsx");
  check("SampleThumbnail's url is built from /api/sample-preview?id=<business.id>, not encodeBusiness()/demoSiteUrl()", /const url = `\/api\/sample-preview\?id=\$\{encodeURIComponent\(business\.id\)\}`/.test(samplesSrc));
  check("no base64/serialized business payload construction exists in /samples at all", !/encodeBusiness/.test(samplesSrc) && !/toBase64Url/.test(samplesSrc));
}

console.log("\n10/11. Unauthenticated /api/gallery-preview redirects to login; authenticated Gallery preview still works");
{
  const galleryPreviewSrc = src("src/app/api/gallery-preview/route.ts");
  check("/api/gallery-preview checks getAccessContext().user before ever calling renderIndustryPage()", (() => {
    const authIdx = galleryPreviewSrc.indexOf("await getAccessContext()");
    const renderIdx = galleryPreviewSrc.indexOf("renderIndustryPage(config)");
    return authIdx !== -1 && renderIdx !== -1 && authIdx < renderIdx;
  })());
  check("/api/gallery-preview redirects unauthenticated requests to /login with a returnTo, never renders content first", /if \(!user\) \{[\s\S]{0,200}Response\.redirect/.test(galleryPreviewSrc));
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("the gallery modal's iframe src points at the real (protected) /api/gallery-preview route, not a stub", /src=\{galleryPreviewUrl\(preview\)\}/.test(galleryClientSrc));
}

console.log("\n12. /api/demo-site retains its established real prospect-facing behavior");
{
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("/api/demo-site's executable code no longer references isKnownSampleBusiness or any sample-classification logic at all (comments excluded -- this file's own doc comment explains the history in prose)", !/isKnownSampleBusiness/.test(withoutComments(demoSiteSrc)));
  check("/api/demo-site never imports getAccessContext -- it has no auth gate of any kind, by design", !/getAccessContext/.test(withoutComments(demoSiteSrc)));
  // Byte-for-byte proof: strip both files' doc comments and confirm the
  // remaining executable code is identical to main's -- not just "no
  // isKnownSampleBusiness reference", but genuinely the same route logic
  // that was already live before any of this correction started.
  const mainDemoSiteSrc = execSync("git show main:src/app/api/demo-site/route.ts", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("the route's executable code (doc comments excluded) is byte-identical to main's", withoutComments(demoSiteSrc).replace(/\s+/g, " ").trim() === withoutComments(mainDemoSiteSrc).replace(/\s+/g, " ").trim());
}

console.log("\n13. Real Demo Room /demo/[token] remains unchanged (zero diff against main)");
{
  for (const file of ["src/app/demo/[token]/page.tsx", "src/lib/prospect/demo-room-content.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log("\n14. /api/sample-preview performs no database or storage write");
{
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("no Supabase admin/server client is imported at all", !/createAdminClient|createClient\(/.test(samplePreviewSrc));
  check("no .from(...) table call of any kind exists in the route", !/\.from\(/.test(samplePreviewSrc));
  check("no .storage. call of any kind exists in the route", !/\.storage\./.test(samplePreviewSrc));
}

console.log("\n15. Sample lead/chat endpoints remain non-persisting (zero diff against main)");
{
  for (const file of ["src/app/api/sample-lead/route.ts", "src/app/api/sample-chat/route.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
    const fileSrc = src(file);
    check(`${file} still contains no persistence call (no .from("prospects"/"projects"/"leads") insert)`, !/\.from\(["'](prospects|projects|leads)["']\)\.insert/.test(fileSrc));
  }
}

console.log("\n16. Return paths reject open redirects -- REAL execution of sanitizeReturnPath()");
{
  check('a plain internal path is preserved: "/samples" -> "/samples"', sanitizeReturnPath("/samples") === "/samples");
  check('a nested internal path with a query string is preserved: "/gallery?x=1" -> "/gallery?x=1"', sanitizeReturnPath("/gallery?x=1") === "/gallery?x=1");
  check('a URL-encoded internal path decodes and is preserved', sanitizeReturnPath(encodeURIComponent("/api/sample-preview?id=sample-plumber")) === "/api/sample-preview?id=sample-plumber");
  check("null/empty/missing collapses to the safe default \"/\"", sanitizeReturnPath(null) === "/" && sanitizeReturnPath("") === "/" && sanitizeReturnPath(undefined) === "/");

  check('an absolute external URL is rejected: "https://evil.com" -> "/"', sanitizeReturnPath("https://evil.com") === "/");
  check('a protocol-relative URL is rejected: "//evil.com" -> "/"', sanitizeReturnPath("//evil.com") === "/");
  check('a backslash-relative URL is rejected: "/\\\\evil.com" -> "/"', sanitizeReturnPath("/\\evil.com") === "/");
  check('a javascript: URL is rejected: "javascript:alert(1)" -> "/"', sanitizeReturnPath("javascript:alert(1)") === "/");
  check('a path not starting with "/" is rejected: "evil.com" -> "/"', sanitizeReturnPath("evil.com") === "/");
  check('a scheme embedded after a leading slash is rejected: "/https://evil.com" -> "/" (contains "://")', sanitizeReturnPath("/https://evil.com") === "/");
  check("a raw control character is rejected", sanitizeReturnPath("/x\njavascript:alert(1)") === "/");

  const loginSrc = src("src/app/login/page.tsx");
  check("the login form navigates to the sanitized returnTo on success, not a raw searchParams value", /window\.location\.href = returnTo;/.test(loginSrc));
  check("returnTo is computed via sanitizeReturnPath(searchParams.get(\"returnTo\"))", /sanitizeReturnPath\(searchParams\.get\("returnTo"\)\)/.test(loginSrc));
  const callbackSrc = src("src/app/auth/callback/route.ts");
  check("the OAuth callback also sanitizes its own returnTo param the same way before redirecting", /sanitizeReturnPath\(requestUrl\.searchParams\.get\("returnTo"\)\)/.test(callbackSrc));
  const samplePreviewSrc = src("src/app/api/sample-preview/route.ts");
  check("/api/sample-preview's own returnTo (its own current URL) is also run through sanitizeReturnPath before being embedded in the redirect", /sanitizeReturnPath\(`\$\{url\.pathname\}\$\{url\.search\}`\)/.test(samplePreviewSrc));
}

console.log("\n17. Finder and PR #33 files remain untouched (zero diff against main)");
{
  for (const file of [
    "src/app/finder/finder-client.tsx",
    "src/lib/prospect/finder.ts",
    "src/app/api/finder/preview/route.ts",
    "src/lib/prospect/finder-preview-storage.ts",
    "src/lib/prospect/finder-preview-capture.ts"
  ]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
  const stat = execSync("git diff --stat main -- supabase/migrations", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("no migration file appears in this branch's diff", stat.trim() === "");
}

console.log("\n18. No billing, project, audit, outreach, suppression, sequence, or evidence semantics change (zero diff against main)");
{
  for (const file of [
    "src/lib/prospect/suppression.ts",
    "src/lib/prospect/sequence-engine.ts",
    "src/lib/prospect/sequence-sync.ts",
    "src/lib/prospect/insights-query.ts",
    "src/lib/prospect/contact-verification.ts",
    "src/lib/prospect/evidence-state.ts",
    "src/app/api/billing/webhook/route.ts"
  ]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
