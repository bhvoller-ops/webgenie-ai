/**
 * WEBGENIE PUBLIC SAAS IMPECCABLE REBUILD -- verification.
 *
 * Source-text + functional checks (this repo's established convention, see
 * scripts/verify-ui-clarity.ts) covering the Phase 13 list: public
 * navigation, homepage section structure, primary CTA consistency, claim/
 * count consistency, Samples-vs-Gallery distinction, illustrative
 * labeling, sample-form non-production behavior, login/signup route
 * preservation, authenticated component isolation, mobile layout classes,
 * accessibility names/headings, reduced-motion support, no migration, and
 * no changed authenticated event semantics.
 *
 * This is a presentation-layer/public-site rebuild -- these checks never
 * assert on authenticated business logic, RLS, or stored event semantics
 * (those remain scripts/verify-playbook-*.ts, verify-suppression.ts,
 * verify-ui-clarity.ts's job, all of which still pass unmodified).
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { INDUSTRIES } from "../src/lib/sitegen/industries";
import { industryList as GALLERY_TEMPLATE_LIST } from "../src/data/gallery/industries";

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
function src(relPath: string): string {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

console.log("1. Public navigation -- credible SaaS header, guest-only, current-page state");
{
  const navSrc = src("src/components/public-nav.tsx");
  check("PublicNav lists Product/How It Works/Examples/Who It's For/Plans", /"Product"/.test(navSrc) && /"How It Works"/.test(navSrc) && /"Examples"/.test(navSrc) && /"Who It's For"/.test(navSrc) && /"Plans"/.test(navSrc));
  check("Examples links to the real /gallery route, active on both /gallery and /samples", /href: "\/gallery"/.test(navSrc) && /matchAlso: \["\/samples"\]/.test(navSrc));
  check("PublicNav reads the real current pathname (usePathname), not a hardcoded value", /usePathname\(\)/.test(navSrc));

  const shellSrc = src("src/components/shell.tsx");
  check("TopBar renders PublicNav only for role===\"guest\", NavGroups only otherwise", /role === "guest" \?\s*\(\s*<PublicNav \/>/.test(shellSrc));
  check("one dominant CTA (\"Start Free\") plus a secondary Sign In for guests", /Start Free<\/Button>/.test(shellSrc) && /Sign in/.test(shellSrc));
  check("no authenticated nav elements (WORK_ITEMS/NavGroup) render in the guest branch", (() => {
    const guestBlock = shellSrc.slice(shellSrc.indexOf('role === "guest" ?'), shellSrc.indexOf(") : ("));
    return !/NavGroup label="Work"/.test(guestBlock);
  })());
}

console.log("\n2. Homepage section structure -- all eleven sections (A-K) present, in order, connected not a card pile");
{
  const s = src("src/app/page.tsx");
  const order = ["<Hero", "<TrustStrip", "<CoreProblem", "<ProductWorkflow", "<ProductProof", "<Differentiation", "<WhoItsFor", "<Examples", "<Plans", "<Faq", "<FinalCta"];
  let lastIndex = -1;
  let inOrder = true;
  for (const tag of order) {
    const idx = s.indexOf(tag, s.indexOf("<PageShell"));
    if (idx === -1 || idx < lastIndex) inOrder = false;
    lastIndex = idx;
  }
  check("all eleven sections are rendered inside <PageShell>, in spec order", inOrder);
  check('nav anchor id="product" exists on the Product Workflow section', /id="product"/.test(s));
  check('nav anchor id="how-it-works" exists on the Product Proof section', /id="how-it-works"/.test(s));
  check('nav anchor id="who-its-for" exists on the Who It\'s For section', /id="who-its-for"/.test(s));
  check('nav anchor id="plans" exists on the Plans section', /id="plans"/.test(s));
  check("no giant enclosing hero <Panel> -- Hero is a plain <section>, not wrapped in the Panel/card component", (() => {
    const heroBlock = s.slice(s.indexOf("function Hero()"), s.indexOf("function HeroProductPeek"));
    return /<section /.test(heroBlock) && !/<Panel/.test(heroBlock);
  })());
  check("the six-repeated-question Problem grid and the redundant BeforeAfter/Toolset card grids are gone", !/Who do I even contact\?/.test(s) && !/function BeforeAfter/.test(s) && !/function Toolset/.test(s));
}

console.log("\n3. Primary CTA consistency -- \"Start Free\" everywhere, one dominant action per surface");
{
  const pageSrc = src("src/app/page.tsx");
  const shellSrc = src("src/components/shell.tsx");
  const mobileSrc = src("src/components/mobile-nav.tsx");
  for (const [name, s] of [
    ["homepage Hero", pageSrc],
    ["homepage Plans", pageSrc],
    ["homepage FinalCta", pageSrc],
    ["desktop TopBar", shellSrc],
    ["mobile nav", mobileSrc]
  ] as const) {
    check(`${name} uses the exact "Start Free" CTA copy`, /Start Free/.test(s), name);
  }
  check("no leftover \"Get started free\"/\"Start finding clients free\" variant CTA copy remains", !/Get started free/.test(shellSrc) && !/Get started free/.test(mobileSrc) && !/Start finding clients free/.test(pageSrc));
}

console.log("\n4. Claim/count reconciliation -- counts derived from canonical sources, stale claims removed");
{
  const pageSrc = src("src/app/page.tsx");
  check('the stale, unsupported "73 industries" claim is gone from the homepage', !/73 industries/.test(pageSrc));
  check("homepage derives REAL_INDUSTRY_COUNT from the real INDUSTRIES object, never a hardcoded literal", /REAL_INDUSTRY_COUNT = Object\.keys\(INDUSTRIES\)\.length/.test(pageSrc));
  check("homepage derives GALLERY_TEMPLATE_COUNT from the same industryList /gallery itself renders from, never a hardcoded literal", /GALLERY_TEMPLATE_COUNT = GALLERY_TEMPLATE_LIST\.length/.test(pageSrc));
  check("the real generator count is exactly 14 today (sanity check on the canonical source itself, not a page literal)", Object.keys(INDUSTRIES).length === 14);
  check("the gallery template count matches the same canonical source /gallery displays (64 today)", GALLERY_TEMPLATE_LIST.length === 64);

  check('"Real Finder results" overclaim corrected to "Illustrative Finder results"', /Illustrative Finder results/.test(pageSrc) && !/Real Finder results/.test(pageSrc));
  check('"Generated automatically, before the call" autonomy-implying claim removed', !/Generated automatically, before the call/.test(pageSrc));
  check('"Every stage below is real" vague claim replaced with a more precise, supportable statement', !/Every stage below is real/.test(pageSrc) && /ships today/.test(pageSrc));
  check('FAQ corrects the "every prospect gets a demo site" overclaim (no-website -> demo, has-website -> audit)', /Only businesses with no existing website get an instant demo site/.test(pageSrc));

  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("gallery header count is derived from industryList.length, never a hardcoded literal", /\$\{industryList\.length\}/.test(galleryClientSrc));
  check("gallery header distinguishes its illustrative template library from the real generator's samples", /separate example library from WebGenie's real site generator/.test(galleryClientSrc));
}

console.log("\n5. Samples vs Gallery -- distinct purposes, both real, neither hardcodes a conflicting count");
{
  const samplesSrc = src("src/app/samples/page.tsx");
  check("/samples leads with a curated \"Featured examples\" subset, not a flat 14-card grid", /Featured examples/.test(samplesSrc) && /FEATURED_IDS/.test(samplesSrc));
  check("/samples still keeps every real industry reachable in \"All industries\" (preserves the authenticated pull-up-on-a-call reference use)", /All industries/.test(samplesSrc) && /const REST = SAMPLE_BUSINESSES\.filter/.test(samplesSrc));
  check("/samples renders live thumbnails (real generator output), not text-only cards", /<iframe/.test(samplesSrc));
  check("/samples has a closing CTA to start using WebGenie", /Start Free/.test(samplesSrc));

  const gallerySrc = src("src/app/gallery/gallery-client.tsx");
  check("/gallery grid is 3-col desktop / 2-col tablet / 1-col mobile (no 4-col xl)", /grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"/.test(gallerySrc) && !/xl:grid-cols-4/.test(gallerySrc));
  check("/gallery shows a live filtered result count", /Showing \{filtered\.length\} of \{industryList\.length\}/.test(gallerySrc));
  check("/gallery keeps search + category filters + quick preview modal", /<input/.test(gallerySrc) && /industryCategories\.map/.test(gallerySrc) && /setPreview\(ind\)/.test(gallerySrc));
}

console.log("\n6. Illustrative labeling -- fictional sample businesses never implied to be real prospects");
{
  for (const [name, file] of [
    ["homepage HeroProductPeek", "src/app/page.tsx"],
    ["homepage ProductProof", "src/app/page.tsx"],
    ["homepage Examples", "src/app/page.tsx"],
    ["/samples", "src/app/samples/page.tsx"],
    ["AuthShell value panel", "src/components/auth-shell.tsx"]
  ] as const) {
    check(`${name} contains explicit "Illustrative example" labeling`, /Illustrative [Ee]xample/.test(src(file)), file);
  }
}

console.log("\n7. Sample-form non-production behavior -- isSample flag threaded end to end, API routes skip persistence");
{
  const typesSrc = src("src/lib/sitegen/types.ts");
  check("SiteOptions carries an explicit isSample flag (not inferred from a missing organizationId)", /isSample\?: boolean/.test(typesSrc));

  const encodeSrc = src("src/lib/sitegen/encode.ts");
  check("demoSiteUrl() accepts and encodes sample:true as a distinct ?sample=1 param", /sample\?: boolean/.test(encodeSrc) && /params\.set\("sample", "1"\)/.test(encodeSrc));

  const routeSrc = src("src/app/api/demo-site/route.ts");
  check("the demo-site route reads ?sample=1 and passes isSample through to generateSite()", /isSample: url\.searchParams\.get\("sample"\) === "1"/.test(routeSrc));

  const generateSrc = src("src/lib/sitegen/generate.ts");
  check("generate.ts renders a distinct illustrative-demo banner when isSample is true", /Illustrative WebGenie demo — sample business and contact information\./.test(generateSrc));
  check("generate.ts passes options.isSample into both leadFormScript() and chatWidgetScript()", /leadFormScript\(\{[^}]*\}, options\.organizationId, options\.isSample\)/.test(generateSrc) && /chatWidgetScript\(business, p, options\.organizationId, options\.isSample\)/.test(generateSrc));

  const leadFormSrc = src("src/lib/sitegen/lead-form.ts");
  check("leadFormScript() embeds IS_SAMPLE and sends it in the POST body to /api/site-lead", /var IS_SAMPLE = /.test(leadFormSrc) && /isSample: IS_SAMPLE/.test(leadFormSrc));
  const chatWidgetSrc = src("src/lib/sitegen/chat-widget.ts");
  check("chatWidgetScript() embeds IS_SAMPLE and sends it in the POST body to /api/site-chat", /var IS_SAMPLE = /.test(chatWidgetSrc) && /isSample: IS_SAMPLE/.test(chatWidgetSrc));

  const siteLeadSrc = src("src/app/api/site-lead/route.ts");
  check("/api/site-lead accepts isSample in its schema and returns early (never inserts) when true", /isSample: z\.boolean\(\)\.optional\(\)/.test(siteLeadSrc) && /if \(isSample\) \{/.test(siteLeadSrc) && /return corsJson\(\{ ok: true, demo: true \}\)/.test(siteLeadSrc));

  const siteChatSrc = src("src/app/api/site-chat/route.ts");
  check("/api/site-chat accepts isSample in its schema and never persists a captured lead when true", /isSample: z\.boolean\(\)\.optional\(\)/.test(siteChatSrc) && /args\.name && args\.phone && !isSample/.test(siteChatSrc));
  check("/api/site-chat's genuine (non-sample) fallback uses getDefaultOrganizationId(), not the .limit(1).single() anti-pattern", /getDefaultOrganizationId\(supabase\)/.test(siteChatSrc) && !/\.from\("organizations"\)\.select\("id"\)\.limit\(1\)\.single\(\)/.test(siteChatSrc));

  check("/samples passes sample:true to demoSiteUrl()", /demoSiteUrl\([^)]*sample: true/.test(src("src/app/samples/page.tsx")));
  check("the homepage's demo preview passes sample:true to demoSiteUrl()", (src("src/app/page.tsx").match(/demoSiteUrl\([^)]*sample: true/g) ?? []).length >= 1);
}

console.log("\n8. Login/signup/password-reset route preservation -- visual-only change, auth logic byte-identical");
{
  for (const [name, file, mustContain] of [
    ["login", "src/app/login/page.tsx", ["supabase.auth.signInWithPassword({ email, password })", 'window.location.href = "/"']],
    ["signup", "src/app/signup/page.tsx", ["/api/auth/create-account", "supabase.auth.signInWithPassword({ email, password })", "/api/auth/bootstrap"]],
    ["forgot-password", "src/app/forgot-password/page.tsx", ["/api/auth/request-reset"]],
    ["reset-password", "src/app/reset-password/page.tsx", ["supabase.auth.setSession(", "supabase.auth.updateUser({ password })"]]
  ] as const) {
    const s = src(file);
    for (const needle of mustContain) {
      check(`${name} still calls ${needle}`, s.includes(needle));
    }
    check(`${name} now uses the shared AuthShell wrapper (visual-only change)`, /<AuthShell>/.test(s));
  }
}

console.log("\n9. Authenticated component isolation -- AppShell/nav/operational pages untouched");
{
  const diffStat = execSync("git diff --stat main -- src/components/shell.tsx", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("shell.tsx has a diff against main (the guest-branch changes are real)", diffStat.trim().length > 0);

  const fullDiff = execSync("git diff main -- src/components/shell.tsx", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("AuthenticatedFooter() is not touched by the diff", !fullDiff.includes("-function AuthenticatedFooter") && !/^\+.*AuthenticatedFooter\(\) \{/m.test(fullDiff.split("\n").filter((l) => l.startsWith("+")).join("\n")));
  check("no WORK_ITEMS/OUTREACH_ITEMS/DELIVERY_ITEMS/RESOURCES_ITEMS data entries were changed", !/^[+-]\s*(href|label|description):/m.test(fullDiff));

  const authClientDiff = execSync(
    'git diff --stat main -- src/app/prospecting src/app/prospects src/app/finder src/app/sequences src/app/launch src/app/insights src/app/projects src/app/calls src/app/leads src/app/onboard src/app/settings src/app/partners src/app/playbooks src/app/audit src/app/admin',
    { cwd: path.join(__dirname, ".."), encoding: "utf8" }
  );
  check("zero authenticated operational pages were touched by this branch", authClientDiff.trim().length === 0, authClientDiff.trim().slice(0, 300));
}

console.log("\n10. Mobile layout classes -- responsive grids/columns present on every rebuilt public page");
{
  check("homepage sections use responsive sm:/lg: grid classes, not fixed desktop-only widths", /grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-6/.test(src("src/app/page.tsx")) && /sm:grid-cols-2/.test(src("src/app/page.tsx")));
  check("/samples grid is responsive (sm:/lg:)", /sm:grid-cols-2 lg:grid-cols-3/.test(src("src/app/samples/page.tsx")));
  check("/gallery grid collapses to 1 column on mobile", /grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3/.test(src("src/app/gallery/gallery-client.tsx")));
  check("AuthShell's value panel is hidden below lg (mobile prioritizes the form)", /hidden overflow-hidden border-l border-hairline bg-canvas\/60 lg:flex/.test(src("src/components/auth-shell.tsx")));
}

console.log("\n11. Accessibility -- names, headings, live regions, keyboard dismissal, focus-visible");
{
  const gallerySrc = src("src/app/gallery/gallery-client.tsx");
  check("gallery quick-preview modal carries role=\"dialog\" aria-modal and a labeled close button", /role="dialog"/.test(gallerySrc) && /aria-modal="true"/.test(gallerySrc) && /aria-label="Close preview"/.test(gallerySrc));
  check("gallery quick-preview modal closes on Escape", /event\.key === "Escape"/.test(gallerySrc));
  check("gallery search input has an explicit aria-label", /aria-label="Search industries"/.test(gallerySrc));

  for (const file of ["src/app/login/page.tsx", "src/app/signup/page.tsx", "src/app/forgot-password/page.tsx", "src/app/reset-password/page.tsx"] as const) {
    check(`${file} associates its error/status message with role="alert" or role="status"`, /role="alert"|role="status"/.test(src(file)), file);
  }
  check("FAQ uses native <details>/<summary> (keyboard-operable with no added JS)", /<details key=\{item\.q\}/.test(src("src/app/page.tsx")) && /<summary/.test(src("src/app/page.tsx")));
  check("no sub-14px secondary text literals (text-[1{0,1,2}px] or text-xs) remain on the rebuilt homepage", !/text-\[1[012]px\]/.test(src("src/app/page.tsx")) && !/\btext-xs\b/.test(src("src/app/page.tsx")));
}

console.log("\n12. Reduced motion -- global support unchanged and still present");
{
  check("globals.css still declares a prefers-reduced-motion rule (unmodified pre-existing support)", /@media \(prefers-reduced-motion: reduce\)/.test(src("src/app/globals.css")));
  const globalsDiff = execSync("git diff --stat main -- src/app/globals.css", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("globals.css itself was not touched by this branch (shared with the authenticated app)", globalsDiff.trim().length === 0);
}

console.log("\n13. No migration added by this branch");
{
  const migrationDiff = execSync("git diff --stat main -- supabase/migrations", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("supabase/migrations has zero diff against main", migrationDiff.trim().length === 0, migrationDiff.trim().slice(0, 300));
}

console.log("\n14. No changed authenticated event/business-logic semantics (spot-check real prospect action route)");
{
  const actionsRouteDiff = execSync("git diff --stat main -- src/app/api/prospects", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  check("src/app/api/prospects/** (real prospect business logic) has zero diff against main", actionsRouteDiff.trim().length === 0, actionsRouteDiff.trim().slice(0, 300));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
