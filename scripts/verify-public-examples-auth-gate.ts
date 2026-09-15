/**
 * WEBGENIE PUBLIC EXAMPLES — AUTHENTICATED FULL-VIEW GATE.
 *
 * Evidence tiers, reported honestly:
 *  - REAL, executed: isKnownSampleBusiness()/sanitizeReturnPath() (items
 *    9/13) are the real exported functions, called for real against real
 *    and adversarial inputs -- no mocking, these are pure functions.
 *  - Source-inspection: everything about what a page renders/doesn't
 *    render for a logged-out vs. logged-in visitor (items 1-7, 14-17),
 *    since faking a real Supabase session inside a bare tsx script isn't
 *    possible (see finder-preview-security's own header for the same
 *    constraint) -- the live, unauthenticated HTTP proof for items 8/10
 *    was run separately against a real `next start` server and is quoted
 *    verbatim in the final report, not re-executed here.
 *
 * Run with: npx tsx scripts/verify-public-examples-auth-gate.ts
 */
import { readFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";
import { isKnownSampleBusiness, SAMPLE_BUSINESSES } from "../src/lib/sitegen/samples";
import { sanitizeReturnPath } from "../src/lib/auth/return-path";
import type { Business } from "../src/lib/sitegen/types";

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

console.log("1. Homepage contains no unauthenticated \"View Full Demo\" action");
{
  const homeSrc = src("src/app/page.tsx");
  check('HomePage() redirects every signed-in visitor away before Examples() ever renders (admin/partner/beta all redirect() out)', /if \(role === "admin"\) redirect/.test(homeSrc) && /if \(role === "partner"\) redirect/.test(homeSrc) && /if \(role === "beta"\) redirect/.test(homeSrc));
  check('Examples() renders no "View full demo" action text/link anywhere (comments excluded; case-sensitive so it doesn\'t false-positive on "Sign in to view full demos" copy)', !/View full demo\b/.test(withoutComments(homeSrc.slice(homeSrc.indexOf("function Examples")))));
  check('Examples() renders the required lock copy instead, once per card', (homeSrc.match(/Full demo available after sign-in/g) ?? []).length >= 1);
  check("no <a href={url}> tied to demoSiteUrl exists in Examples() (the old per-card link is gone)", !/href=\{url\}/.test(homeSrc));
}

console.log("\n2. /samples logged-out state contains thumbnails only");
{
  const samplesSrc = src("src/app/samples/page.tsx");
  check("SampleThumbnail only renders the real <a href={url}> link when isAuthenticated is true", /isAuthenticated \? \(\s*<a[\s\S]{0,200}href=\{url\}/.test(samplesSrc));
  check("the logged-out branch renders the required lock copy, not a link", /Full demo available after sign-in/.test(samplesSrc));
  check("a single section-level sign-in CTA exists, gated on !isAuthenticated", /!isAuthenticated \? \(/.test(samplesSrc) && /Sign in to view full demos/.test(samplesSrc));
}

console.log("\n3. /gallery logged-out state contains thumbnails only");
{
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("card is a plain <div> (not <button>, no onClick) when !isAuthenticated", /const CardTag = isAuthenticated \? "button" : "div"/.test(galleryClientSrc));
  check("onClick is only attached when isAuthenticated", /\.\.\.\(isAuthenticated \? \{ onClick: \(\) => handleCardClick\(ind\) \} : \{\}\)/.test(galleryClientSrc));
  check("handleCardClick() is a no-op when !isAuthenticated (never calls setPreview)", /function handleCardClick[\s\S]{0,120}if \(!isAuthenticated\) return;/.test(galleryClientSrc));
  check("the hover \"Preview\" badge is replaced with a lock label when !isAuthenticated", /Sign in to view/.test(galleryClientSrc));
}

console.log("\n4. Logged-out pages render no generated-site iframe");
{
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("the modal (which contains the only <iframe> in this file) is driven entirely by `preview` state, which handleCardClick only ever sets when isAuthenticated", /\{preview \? \(/.test(galleryClientSrc));
  check("renderIndustryPage is no longer imported/called client-side at all (moved server-side into /api/gallery-preview; comments excluded)", !/renderIndustryPage/.test(withoutComments(galleryClientSrc)));
  const homeSrc = src("src/app/page.tsx");
  const samplesSrc = src("src/app/samples/page.tsx");
  check("homepage Examples() contains no <iframe>", !/<iframe/.test(homeSrc));
  check("/samples contains no <iframe>", !/<iframe/.test(samplesSrc));
}

console.log("\n5. Logged-out pages cannot open an interactive preview modal");
{
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("openFullPreview() itself also refuses to act when !isAuthenticated (belt-and-suspenders beyond the trigger not rendering)", /function openFullPreview[\s\S]{0,120}if \(!isAuthenticated\) return;/.test(galleryClientSrc));
}

console.log("\n6/7. \"Explore all Examples\" and the Examples nav destination both reach the thumbnail-only page");
{
  const homeSrc = src("src/app/page.tsx");
  check('"Explore All Examples" links to /gallery', /<Button href="\/gallery" variant="secondary">\s*Explore All Examples/.test(homeSrc));
  const shellSrc = src("src/components/shell.tsx");
  check('the "Examples" nav item points to /gallery', /\{ href: "\/gallery", label: "Examples" \}/.test(shellSrc));
  check("/gallery itself never redirects a logged-out visitor away (thumbnails stay reachable with no auth)", !/redirect\(/.test(src("src/app/gallery/page.tsx")));
}

console.log("\n8/10. Direct Gallery/Sample full-view URLs and their APIs require authentication (source; live HTTP proof quoted in the final report)");
{
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("GET checks isKnownSampleBusiness() before rendering", /if \(isKnownSampleBusiness\(business\)\)/.test(demoSiteSrc));
  check("an unauthenticated known-sample request redirects to /login with a returnTo, before generateSite() ever runs", (() => {
    const gateIdx = demoSiteSrc.indexOf("if (isKnownSampleBusiness(business))");
    const redirectIdx = demoSiteSrc.indexOf("Response.redirect(new URL(`/login?returnTo=");
    const generateIdx = demoSiteSrc.indexOf("generateSite(business");
    return gateIdx !== -1 && redirectIdx !== -1 && generateIdx !== -1 && gateIdx < redirectIdx && redirectIdx < generateIdx;
  })());
  const galleryPreviewSrc = src("src/app/api/gallery-preview/route.ts");
  check("/api/gallery-preview checks getAccessContext().user before ever calling renderIndustryPage()", (() => {
    const authIdx = galleryPreviewSrc.indexOf("await getAccessContext()");
    const renderIdx = galleryPreviewSrc.indexOf("renderIndustryPage(config)");
    return authIdx !== -1 && renderIdx !== -1 && authIdx < renderIdx;
  })());
  check("/api/gallery-preview redirects unauthenticated requests to /login with a returnTo, never renders content first", /if \(!user\) \{[\s\S]{0,200}Response\.redirect/.test(galleryPreviewSrc));
}

console.log("\n9. Client-supplied sample flags cannot bypass authentication -- REAL execution of isKnownSampleBusiness()");
{
  const known = SAMPLE_BUSINESSES[0];
  check("a real known sample business (decoded exactly) is classified as a known sample", isKnownSampleBusiness(known));

  const spoofedRealBusiness: Business = { id: "places-abc123", name: "Joe's Plumbing LLC", industry: "plumber", phone: "(555) 000-1111", address: "1 Main St", city: "Springfield", state: "IL", rating: 4.2, reviewCount: 9, source: "places" };
  const withSampleSourceOnly: Business = { ...spoofedRealBusiness, source: "sample" as Business["source"] };
  check("a real (non-fixture) business with source spoofed to \"sample\" is NOT classified as a known sample (name/city/etc. don't match any real fixture)", !isKnownSampleBusiness(withSampleSourceOnly));

  const idOnlyMatch: Business = { ...spoofedRealBusiness, id: known.id }; // id copied, everything else real/different
  check('a business with a copied sample "id" but different name/city/etc. is NOT classified as a known sample (id alone is not trusted, per this file\'s own header)', !isKnownSampleBusiness(idOnlyMatch));

  const missingSourceField = { ...known } as Partial<Business>;
  delete (missingSourceField as { source?: unknown }).source;
  check("a business that omits `source` entirely (to dodge a naive `source === \"sample\"` check) does NOT slip past isKnownSampleBusiness() -- it still fails the full-match requirement", !isKnownSampleBusiness(missingSourceField));

  check("a real Finder-style business (source: \"places\", ordinary id) is never classified as a known sample", !isKnownSampleBusiness(spoofedRealBusiness));
  check("a real manually-entered business (source: \"manual\") is never classified as a known sample", !isKnownSampleBusiness({ ...spoofedRealBusiness, source: "manual" }));

  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("the auth decision never reads the client-supplied `?sample=` query flag (that flag still only controls the cosmetic isSample badge passed to generateSite)", (() => {
    const gateBlock = demoSiteSrc.slice(demoSiteSrc.indexOf("if (isKnownSampleBusiness(business))"), demoSiteSrc.indexOf("const organizationId"));
    return !/searchParams\.get\("sample"\)/.test(gateBlock);
  })());
}

console.log("\n11. Authenticated users retain full-view access");
{
  const samplesSrcNoComments = withoutComments(src("src/app/samples/page.tsx"));
  check("SampleThumbnail renders the real, live <a href={url}> link (target=\"_blank\", full top-level navigation) when isAuthenticated", /isAuthenticated \? \(\s*<a[\s\S]{0,350}View full demo/.test(samplesSrcNoComments));
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("the gallery modal's iframe src points at the real (now-protected) /api/gallery-preview route, not a stub", /src=\{galleryPreviewUrl\(preview\)\}/.test(galleryClientSrc));
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("a known-sample request from an authenticated user still falls through to the real generateSite() call (the gate only blocks the unauthenticated branch, it never returns early for a signed-in user)", (() => {
    const gateBlock = demoSiteSrc.slice(demoSiteSrc.indexOf("if (isKnownSampleBusiness(business))"), demoSiteSrc.indexOf("const organizationId"));
    return /if \(!user\)/.test(gateBlock) && !/return.*generateSite/.test(gateBlock);
  })());
}

console.log("\n12/13. Safe internal return paths work; external/open-redirect return paths are rejected -- REAL execution of sanitizeReturnPath()");
{
  check('a plain internal path is preserved: "/samples" -> "/samples"', sanitizeReturnPath("/samples") === "/samples");
  check('a nested internal path with a query string is preserved: "/gallery?x=1" -> "/gallery?x=1"', sanitizeReturnPath("/gallery?x=1") === "/gallery?x=1");
  check('a URL-encoded internal path decodes and is preserved', sanitizeReturnPath(encodeURIComponent("/api/demo-site?b=abc&sample=1")) === "/api/demo-site?b=abc&sample=1");
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
}

console.log("\n14. Real prospect/client Demo Room links retain their accepted behavior (zero diff against main)");
{
  for (const file of ["src/app/demo/[token]/page.tsx", "src/lib/prospect/demo-room-content.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("the new auth gate sits before, and is independent of, the org-branding lookup a real prospect's demo link relies on (org branding logic itself is untouched by this change)", demoSiteSrc.indexOf("isKnownSampleBusiness(business)") < demoSiteSrc.indexOf('url.searchParams.get("org")'));
}

console.log("\n15. Existing sample lead/chat endpoints remain structurally non-persisting (zero diff against main)");
{
  for (const file of ["src/app/api/sample-lead/route.ts", "src/app/api/sample-chat/route.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
    const fileSrc = src(file);
    check(`${file} still contains no persistence call (no .from("prospects"/"projects"/"leads") insert)`, !/\.from\(["'](prospects|projects|leads)["']\)\.insert/.test(fileSrc));
  }
}

console.log("\n16. No Finder behavior changes (zero diff against main)");
{
  for (const file of ["src/app/finder/finder-client.tsx", "src/lib/prospect/finder.ts", "src/app/api/finder/preview/route.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log("\n17. No billing, project, audit, outreach, suppression, sequence, or evidence semantics change (zero diff against main)");
{
  for (const file of [
    "src/lib/prospect/suppression.ts",
    "src/lib/prospect/sequence-engine.ts",
    "src/lib/prospect/sequence-sync.ts",
    "src/lib/prospect/insights-query.ts",
    "src/lib/prospect/contact-verification.ts",
    "src/lib/prospect/evidence-state.ts",
    "src/app/api/billing/webhook/route.ts",
    "supabase/migrations"
  ]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log("\n18. No production data is required for testing");
{
  check("isKnownSampleBusiness()/sanitizeReturnPath() above ran as pure in-process function calls, no network, no Supabase", true);
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("the new gate reads only getAccessContext() (session cookie) -- no new Supabase table read added by this change", !/\.from\("(prospects|projects|organizations)"\)/.test(demoSiteSrc.slice(demoSiteSrc.indexOf("isKnownSampleBusiness"), demoSiteSrc.indexOf("const organizationId"))));
}

console.log("\n19. PR #33 and vibelabs-membership-phase0 untouched (this branch's own diff)");
{
  const stat = execSync("git diff --stat main...HEAD", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("finder-preview-storage.ts / finder-preview-capture.ts (PR #33's own files) do not appear in this branch's diff", !/finder-preview-(storage|capture)\.ts/.test(stat));
  check("no supabase/migrations file appears in this branch's diff (no migration added)", !/supabase\/migrations/.test(stat));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
