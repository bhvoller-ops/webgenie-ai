/**
 * WEBGENIE PUBLIC EXAMPLES — SAMPLES REMOVAL / GALLERY CONSOLIDATION.
 *
 * Supersedes the two earlier passes of this file (a classifier-based
 * /api/demo-site gate, then a dedicated /api/sample-preview route) --
 * both existed only because /samples was a distinct product area needing
 * its own auth surface. The owner's product decision removes /samples
 * entirely (it duplicated Gallery; authenticated users can already
 * generate their own sites). Gallery is now the one user-facing examples
 * destination, so this file narrows to: proving /samples is genuinely
 * gone (not just hidden), that its old bookmark URL safely and
 * permanently redirects to /gallery without ever touching auth, that no
 * hardcoded hostname was introduced, and that everything Gallery's own
 * auth gate already did (from the prior pass, still correct) keeps
 * working — plus the non-regression proofs for /api/demo-site, the real
 * Demo Room, the sample-lead/chat endpoints, Finder, and PR #33.
 *
 * The reported defect ("clicking Samples while signed in required another
 * login, Gallery didn't") is addressed structurally, not patched: there
 * is no more separate /samples auth surface for that inconsistency to
 * live in. Section 6 asserts Gallery's full-view flow uses the exact same
 * cookie-based getAccessContext() session and only ever relative URLs --
 * the same mechanism every other authenticated route in this app already
 * relies on, so there is nothing left that could authenticate differently
 * for Gallery vs. anywhere else.
 *
 * Evidence tiers, reported honestly:
 *  - REAL, executed: sanitizeReturnPath() (item 10) against real and
 *    adversarial inputs. The "unknown Gallery id" 404 proof (item 6)
 *    executes the SAME industryList.find() resolution logic
 *    /api/gallery-preview itself uses -- real, pure, no auth needed.
 *  - Source-inspection: the auth gate itself (item 5), the redirect
 *    config (item 2), hostname/nav absence (items 1/3/4), and the
 *    various zero-diff non-regression proofs (items 7/8/9/11/12) --
 *    faking a real Supabase session inside a bare tsx script isn't
 *    possible (getAccessContext() calls next/headers' cookies(), which
 *    throws outside an active Next.js request scope). The live,
 *    unauthenticated HTTP proof for item 5 was run separately against a
 *    real dev server and is quoted verbatim in the final report, not
 *    re-executed here.
 *
 * Run with: npx tsx scripts/verify-public-examples-auth-gate.ts
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { execSync } from "child_process";
import { industryList as GALLERY_TEMPLATE_LIST } from "../src/data/gallery/industries";
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
const repoRoot = path.join(__dirname, "..");

console.log("1. /samples no longer exists as a distinct product area");
{
  check("the /samples page route does not exist on disk", !existsSync(path.join(repoRoot, "src", "app", "samples", "page.tsx")));
  check("the /api/sample-preview route does not exist on disk (its auth logic existed only for /samples)", !existsSync(path.join(repoRoot, "src", "app", "api", "sample-preview")));
  check("no navigation, footer, or homepage code (comments excluded) references /samples anymore", (() => {
    const files = ["src/components/shell.tsx", "src/components/public-nav.tsx", "src/components/mobile-nav.tsx", "src/app/page.tsx"];
    return files.every((f) => !/\/samples/.test(withoutComments(src(f))));
  })());
}

console.log("\n2. /samples permanently redirects to /gallery -- same-origin, no auth, no query forwarding");
{
  const configSrc = src("next.config.ts");
  const redirectMatch = /redirects\(\)\s*\{[\s\S]*?return \[([\s\S]*?)\];/.exec(configSrc);
  const redirectBlock = redirectMatch?.[1] ?? "";
  check("a redirects() entry exists mapping /samples to /gallery", /source: "\/samples"/.test(redirectBlock) && /destination: "\/gallery"/.test(redirectBlock));
  check("the redirect is permanent (308 -- Next's convention for a permanent route consolidation, not the 307 an ordinary redirect() call would give)", /source: "\/samples"[\s\S]{0,80}permanent: true/.test(redirectBlock));
  check("the destination is a bare relative path (\"/gallery\"), never an absolute URL with a hostname -- structurally cannot cross origins", /destination: "\/gallery"/.test(redirectBlock) && !/destination: "https?:\/\//.test(redirectBlock));
  check("the redirect never points at /login -- an old /samples bookmark reaches the public thumbnail grid directly, not an auth wall", !/destination: "\/login/.test(redirectBlock));
  check("the redirect is a plain source/destination pair with no :path*/param capture that could carry an arbitrary query string through", !/\/samples\/:/.test(redirectBlock) && !/\/samples\?/.test(redirectBlock));
  check("this is a next.config.ts-level redirect, not a page-level permanentRedirect() call -- resolved by Next's routing layer before any page or auth code runs, so it structurally cannot check a session or touch a cookie", !existsSync(path.join(repoRoot, "src", "app", "samples")));
}

console.log("\n3. No hardcoded production/preview hostname was introduced");
{
  const files = ["next.config.ts", "src/app/page.tsx", "src/app/gallery/page.tsx", "src/app/gallery/gallery-client.tsx", "src/app/api/gallery-preview/route.ts", "src/components/public-nav.tsx", "src/components/shell.tsx"];
  for (const f of files) {
    check(`${f} contains no hardcoded app.vibelabsagency.com or *.vercel.app literal (code only -- an explanatory comment describing a debugging repro is not a live hostname reference)`, !/app\.vibelabsagency\.com|\.vercel\.app/.test(withoutComments(src(f))), f);
  }
}

console.log("\n4. Gallery preview trusts no client-supplied template data");
{
  const galleryPreviewSrc = src("src/app/api/gallery-preview/route.ts");
  check("the route resolves the industry config from the server-owned industryList by exact id match, never from a client-supplied config object", /industryList\.find\(\(ind\) => ind\.id === id\)/.test(galleryPreviewSrc));
  check("the route's only searchParams.get() call is \"id\" -- no other field (colors, images, copy) can be supplied by the caller", (() => {
    const calls = galleryPreviewSrc.match(/searchParams\.get\("[^"]+"\)/g) ?? [];
    return calls.length === 1 && calls[0] === 'searchParams.get("id")';
  })());
  check("an unknown id returns a real 404, never a guess or fallback render", /if \(!config\) \{\s*\n\s*return new Response\("Unknown industry id\.", \{ status: 404 \}\);/.test(galleryPreviewSrc));
}

console.log("\n5. Unauthenticated /api/gallery-preview redirects to login (source; live HTTP proof quoted in the final report)");
{
  const galleryPreviewSrc = src("src/app/api/gallery-preview/route.ts");
  check("/api/gallery-preview checks getAccessContext().user before ever calling renderIndustryPage()", (() => {
    const authIdx = galleryPreviewSrc.indexOf("await getAccessContext()");
    const renderIdx = galleryPreviewSrc.indexOf("renderIndustryPage(config)");
    return authIdx !== -1 && renderIdx !== -1 && authIdx < renderIdx;
  })());
  check("/api/gallery-preview redirects unauthenticated requests to /login with a sanitized returnTo, never renders content first", /if \(!user\) \{[\s\S]{0,200}Response\.redirect/.test(galleryPreviewSrc));
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("the gallery modal's iframe src points at the real (protected) /api/gallery-preview route, not a stub", /src=\{galleryPreviewUrl\(preview\)\}/.test(galleryClientSrc));
  check("the gallery card/modal trigger only ever fires when isAuthenticated is true -- a logged-out visitor gets no modal, no iframe, at all", /if \(!isAuthenticated\) return;/.test(galleryClientSrc));
}

console.log("\n6. Unknown Gallery ID resolution -- REAL execution of the same lookup /api/gallery-preview uses");
{
  check('industryList.find() returns undefined for a made-up id ("not-a-real-industry")', GALLERY_TEMPLATE_LIST.find((i) => i.id === "not-a-real-industry") === undefined);
  check('industryList.find() returns undefined for an empty string id', GALLERY_TEMPLATE_LIST.find((i) => i.id === "") === undefined);
  check("a real id (\"dental\") resolves to exactly one config with a non-empty heroImage/industryName", (() => {
    const dental = GALLERY_TEMPLATE_LIST.find((i) => i.id === "dental");
    return Boolean(dental && dental.industryName && dental.heroImage);
  })());
}

console.log("\n7. Session preservation -- Gallery's authenticated flow uses the app's one, ordinary cookie-based session, not a separate mechanism");
{
  const galleryPageSrc = src("src/app/gallery/page.tsx");
  const galleryPreviewSrc = src("src/app/api/gallery-preview/route.ts");
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("/gallery's page-level auth read uses the same getAccessContext() every other authenticated route uses -- no bespoke Gallery-only auth helper", /import \{ getAccessContext \} from "@\/lib\/auth\/access"/.test(galleryPageSrc));
  check("/api/gallery-preview uses the identical getAccessContext() import, not a second copy or a different cookie/session read", /import \{ getAccessContext \} from "@\/lib\/auth\/access"/.test(galleryPreviewSrc));
  check("Gallery's full-view URL (galleryPreviewUrl) is a bare relative path -- never prefixed with an absolute origin/hostname that could put it on a different cookie domain than the page it's opened from", /function galleryPreviewUrl\(ind: IndustryConfig\) \{\s*\n\s*return `\/api\/gallery-preview\?id=\$\{encodeURIComponent\(ind\.id\)\}`;/.test(galleryClientSrc));
  check("Gallery's full-view action opens that same-origin URL as a plain top-level navigation (new tab, same browser session/cookies) or an in-page iframe -- never a cross-origin redirect that could drop the session", /window\.open\(galleryPreviewUrl\(ind\), "_blank"/.test(galleryClientSrc) && /src=\{galleryPreviewUrl\(preview\)\}/.test(galleryClientSrc));
}

console.log("\n8. /api/demo-site retains its established real prospect-facing behavior");
{
  const demoSiteSrc = src("src/app/api/demo-site/route.ts");
  check("/api/demo-site's executable code no longer references isKnownSampleBusiness or any sample-classification logic at all (comments excluded -- this file's own doc comment explains the history in prose)", !/isKnownSampleBusiness/.test(withoutComments(demoSiteSrc)));
  check("/api/demo-site never imports getAccessContext -- it has no auth gate of any kind, by design", !/getAccessContext/.test(withoutComments(demoSiteSrc)));
  const mainDemoSiteSrc = execSync("git show main:src/app/api/demo-site/route.ts", { cwd: repoRoot, encoding: "utf8" });
  check("the route's executable code (doc comments excluded) is byte-identical to main's", withoutComments(demoSiteSrc).replace(/\s+/g, " ").trim() === withoutComments(mainDemoSiteSrc).replace(/\s+/g, " ").trim());
}

console.log("\n9. Real Demo Room /demo/[token] remains unchanged (zero diff against main)");
{
  for (const file of ["src/app/demo/[token]/page.tsx", "src/lib/prospect/demo-room-content.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log("\n10. Sample lead/chat endpoints remain non-persisting (zero diff against main)");
{
  for (const file of ["src/app/api/sample-lead/route.ts", "src/app/api/sample-chat/route.ts"]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
    const fileSrc = src(file);
    check(`${file} still contains no persistence call (no .from("prospects"/"projects"/"leads") insert)`, !/\.from\(["'](prospects|projects|leads)["']\)\.insert/.test(fileSrc));
  }
  // Why these are kept, not deleted as "obsolete Samples infra": /api/demo-site
  // still honors an old, already-shared ?sample=1 link (see that route's own
  // doc comment) by setting isSample: true, which still routes an embedded
  // lead form/chat widget at these exact endpoints -- see lib/sitegen/
  // lead-form.ts / chat-widget.ts. They have a real, live consumer independent
  // of whether /samples the PAGE exists.
  const demoSiteSrc2 = src("src/app/api/demo-site/route.ts");
  check("/api/demo-site still derives isSample from its own ?sample= param (the real, still-live consumer of /api/sample-lead and /api/sample-chat)", /isSample: url\.searchParams\.get\("sample"\) === "1"/.test(demoSiteSrc2));
}

console.log("\n11. Return paths reject open redirects -- REAL execution of sanitizeReturnPath()");
{
  check('a plain internal path is preserved: "/gallery" -> "/gallery"', sanitizeReturnPath("/gallery") === "/gallery");
  check('a nested internal path with a query string is preserved: "/gallery?x=1" -> "/gallery?x=1"', sanitizeReturnPath("/gallery?x=1") === "/gallery?x=1");
  check('a URL-encoded internal path decodes and is preserved', sanitizeReturnPath(encodeURIComponent("/api/gallery-preview?id=dental")) === "/api/gallery-preview?id=dental");
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
  const galleryPreviewSrc2 = src("src/app/api/gallery-preview/route.ts");
  check("/api/gallery-preview's own returnTo (its own current URL) is embedded via encodeURIComponent before being placed in the redirect, matching the same escaping discipline sanitizeReturnPath()'s own callers use elsewhere", /encodeURIComponent\(`\$\{url\.pathname\}\$\{url\.search\}`\)/.test(galleryPreviewSrc2));
}

console.log("\n12. Finder files remain untouched by PR #34's own historical diff (PR #33's later, legitimate Finder feature is a separate concern)");
{
  // PR #33 (feature/finder-website-preview-signals) legitimately touches
  // every file below -- that's its entire feature. Once PR #33's own
  // branch merges updated main (containing PR #34) back into itself, a
  // "zero diff against main" check for these files would start failing
  // permanently and for the right reason (Finder SHOULD differ from main
  // now) -- not a regression. Same fix as verify-public-site.ts section 9:
  // pin to PR #34's own fixed base/head SHAs, so this stays a permanent,
  // correct historical record of what PR #34 itself did, independent of
  // what any later, unrelated branch does to these same files.
  const PR34_BASE = "581042a1fc21f73c5220fbd07188084b6b2d6f38";
  const PR34_HEAD = "bcbd2d8dc70ced6131a2f3ee439b49e123c00183";
  for (const file of [
    "src/app/finder/finder-client.tsx",
    "src/lib/prospect/finder.ts",
    "src/app/api/finder/preview/route.ts",
    "src/lib/prospect/finder-preview-storage.ts",
    "src/lib/prospect/finder-preview-capture.ts"
  ]) {
    let diff = "";
    try {
      diff = execSync(`git diff ${PR34_BASE} ${PR34_HEAD} -- ${file}`, { cwd: repoRoot, encoding: "utf8" });
    } catch {
      console.log(`  (skipped ${file} -- PR #34's base/head SHAs aren't available in this checkout's history)`);
      continue;
    }
    check(`${file} has zero diff in PR #34's own historical diff (581042a..bcbd2d8)`, diff.trim() === "", diff.slice(0, 200));
  }
  const stat = execSync(`git diff --stat 581042a1fc21f73c5220fbd07188084b6b2d6f38 bcbd2d8dc70ced6131a2f3ee439b49e123c00183 -- supabase/migrations`, { cwd: repoRoot, encoding: "utf8" });
  check("no migration file appeared in PR #34's own historical diff", stat.trim() === "");
}

console.log("\n13. No billing, project, audit, outreach, suppression, sequence, or evidence semantics change (zero diff against main)");
{
  for (const file of [
    "src/lib/prospect/suppression.ts",
    "src/lib/prospect/sequence-engine.ts",
    "src/lib/prospect/sequence-sync.ts",
    "src/lib/prospect/insights-query.ts",
    "src/lib/prospect/contact-verification.ts",
    "src/lib/prospect/evidence-state.ts",
    "src/app/api/billing/webhook/route.ts",
    "src/app/api/prospects"
  ]) {
    const diff = diffAgainstMain(file);
    check(`${file} has zero diff against main`, diff.trim() === "", diff.slice(0, 200));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
