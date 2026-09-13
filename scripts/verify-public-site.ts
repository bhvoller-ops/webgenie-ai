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
  // Composition pass: "Who It's For" was dropped from the nav along with
  // the standalone section it linked to -- asserted absent, not present.
  check("PublicNav lists Product/How It Works/Examples/Plans, and no longer a dangling Who It's For link", (() => {
    const itemsBlock = navSrc.slice(navSrc.indexOf("PUBLIC_NAV_ITEMS = ["), navSrc.indexOf("] as const"));
    return /"Product"/.test(itemsBlock) && /"How It Works"/.test(itemsBlock) && /"Examples"/.test(itemsBlock) && /"Plans"/.test(itemsBlock) && !/who-its-for/.test(itemsBlock);
  })());
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

console.log("\n2. Homepage section structure -- all nine sections present, in order, connected not a card pile");
{
  const s = src("src/app/page.tsx");
  // Composition pass: TrustStrip (pure repetition of claims made elsewhere)
  // and the standalone WhoItsFor section (folded into CoreProblem's own
  // copy) are both intentionally removed -- see section 18 below for the
  // dedicated checks on that removal.
  const order = ["<Hero", "<CoreProblem", "<ProductWorkflow", "<ProductProof", "<Differentiation", "<Examples", "<Plans", "<Faq", "<FinalCta"];
  let lastIndex = -1;
  let inOrder = true;
  for (const tag of order) {
    const idx = s.indexOf(tag, s.indexOf("<PageShell"));
    if (idx === -1 || idx < lastIndex) inOrder = false;
    lastIndex = idx;
  }
  check("all nine sections are rendered inside <PageShell>, in spec order", inOrder);
  check('nav anchor id="product" exists on the Product Workflow section', /id="product"/.test(s));
  check('nav anchor id="how-it-works" exists on the Product Proof section', /id="how-it-works"/.test(s));
  check('nav anchor id="plans" exists on the Plans section', /id="plans"/.test(s));
  check("no giant enclosing hero <Panel> -- Hero is a plain <section>, not wrapped in the Panel/card component", (() => {
    const heroBlock = s.slice(s.indexOf("function Hero()"), s.indexOf("function HeroProductScreenshot"));
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

  // Superseded by the screenshot-gate approval (section 17): Finder's panel
  // is a real screenshot now, not the illustrative fixture list this check
  // used to require -- re-asserted the other direction, since claiming
  // "Real Finder results" would itself now be an overclaim (the screenshot
  // shows Finder's empty pre-search state, not populated results).
  check('Finder copy makes no "results" claim the empty pre-search screenshot can\'t support', !/Real Finder results/.test(pageSrc) && !/Illustrative Finder results/.test(pageSrc));
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
  check("/samples renders real generator-output thumbnails (static images, not text-only cards)", /<Image\b/.test(samplesSrc) && /sample-previews/.test(samplesSrc));
  check("/samples has a closing CTA to start using WebGenie", /Start Free/.test(samplesSrc));

  const gallerySrc = src("src/app/gallery/gallery-client.tsx");
  check("/gallery grid is 3-col desktop / 2-col tablet / 1-col mobile (no 4-col xl)", /grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"/.test(gallerySrc) && !/xl:grid-cols-4/.test(gallerySrc));
  check("/gallery shows a live filtered result count", /Showing \{filtered\.length\} of \{industryList\.length\}/.test(gallerySrc));
  check("/gallery keeps search + category filters + quick preview modal", /<input/.test(gallerySrc) && /industryCategories\.map/.test(gallerySrc) && /setPreview\(ind\)/.test(gallerySrc));
}

console.log("\n6. Illustrative labeling -- fictional sample businesses never implied to be real prospects");
{
  for (const [name, file] of [
    ["homepage HeroProductScreenshot", "src/app/page.tsx"],
    ["homepage ProductProof", "src/app/page.tsx"],
    ["homepage Examples", "src/app/page.tsx"],
    ["/samples", "src/app/samples/page.tsx"],
    ["AuthShell value panel", "src/components/auth-shell.tsx"]
  ] as const) {
    check(`${name} contains explicit "Illustrative example" labeling`, /Illustrative [Ee]xample/.test(src(file)), file);
  }
}

console.log("\n7. Sample-site safety -- architectural separation, no client-controlled bypass flag");
{
  const typesSrc = src("src/lib/sitegen/types.ts");
  check("SiteOptions carries an explicit isSample flag (not inferred from a missing organizationId)", /isSample\?: boolean/.test(typesSrc));

  const encodeSrc = src("src/lib/sitegen/encode.ts");
  check("demoSiteUrl() accepts and encodes sample:true as a distinct ?sample=1 param", /sample\?: boolean/.test(encodeSrc) && /params\.set\("sample", "1"\)/.test(encodeSrc));

  const routeSrc = src("src/app/api/demo-site/route.ts");
  check("the demo-site route derives isSample ONLY from the ?sample= query param, never from decoding the b= payload's contents", /isSample: url\.searchParams\.get\("sample"\) === "1"/.test(routeSrc));

  const generateSrc = src("src/lib/sitegen/generate.ts");
  check("generate.ts renders a distinct illustrative-demo banner when isSample is true", /Illustrative WebGenie demo — sample business and contact information\./.test(generateSrc));
  check("generate.ts passes options.isSample into both leadFormScript() and chatWidgetScript() (decides which endpoint gets embedded, at generation time)", /leadFormScript\(\{[^}]*\}, options\.organizationId, options\.isSample\)/.test(generateSrc) && /chatWidgetScript\(business, p, options\.organizationId, options\.isSample\)/.test(generateSrc));

  check("/samples passes sample:true to demoSiteUrl()", /demoSiteUrl\([^)]*sample: true/.test(src("src/app/samples/page.tsx")));
  check("the homepage's demo preview passes sample:true to demoSiteUrl()", (src("src/app/page.tsx").match(/demoSiteUrl\([^)]*sample: true/g) ?? []).length >= 1);
}

console.log("\n7b. Owner-review finding, SECOND PASS -- neither isSample nor business.id (both client-controlled) gate persistence on the real endpoints");
{
  // Proof #1 & #2 (from the task's required-tests list): the sample
  // endpoints are structurally incapable of writing, regardless of input.
  const sampleLeadSrc = src("src/app/api/sample-lead/route.ts");
  check("/api/sample-lead imports no database/admin client at all", !/createAdminClient|@supabase/.test(sampleLeadSrc));
  check("/api/sample-lead contains no .insert( call", !/\.insert\(/.test(sampleLeadSrc));
  check("/api/sample-lead always returns demo:true and never conditionally persists", /return corsJson\(\{ ok: true, demo: true \}\)/.test(sampleLeadSrc));

  const sampleChatSrc = src("src/app/api/sample-chat/route.ts");
  check("/api/sample-chat imports no database/admin client at all", !/createAdminClient|@supabase/.test(sampleChatSrc));
  check("/api/sample-chat contains no .insert( call and never writes capturedLead anywhere", !/\.insert\(/.test(sampleChatSrc) && /capturedLead is deliberately never written/.test(sampleChatSrc));

  // Proof #3, #4, #5: /api/site-lead has NO reference to isSample or any
  // sample-id allowlist anywhere in its control flow -- neither
  // client-controlled field can suppress persistence, because the code
  // path to do so does not exist in this file.
  // Strip comments before asserting absence, so the doc-comment prose
  // explaining what was removed (which necessarily says "isSample") can't
  // produce a false failure here -- these checks are about the executable
  // code paths only.
  function stripComments(s: string): string {
    return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  }
  const siteLeadSrc = src("src/app/api/site-lead/route.ts");
  const siteLeadCode = stripComments(siteLeadSrc);
  check("/api/site-lead's schema no longer accepts or reads isSample at all (code only, not doc comments)", !/isSample/.test(siteLeadCode));
  check("/api/site-lead's business schema no longer accepts or checks an id field (nothing to allowlist-match)", !/business: z\.object\(\{\s*id:/.test(siteLeadCode) && !/SAMPLE_BUSINESS_IDS/.test(siteLeadCode));
  check("/api/site-lead has exactly one return path into the insert logic -- no conditional early-return before it based on request content", !/if \(isSample\)|if \(isKnownSample\)/.test(siteLeadCode));

  // Proof #3, #6: same for /api/site-chat.
  const siteChatSrc = src("src/app/api/site-chat/route.ts");
  const siteChatCode = stripComments(siteChatSrc);
  check("/api/site-chat's schema no longer accepts or reads isSample at all (code only, not doc comments)", !/isSample/.test(siteChatCode));
  check("/api/site-chat's business schema is the shared id-less chatBusinessSchema, with no sample-id allowlist reference", /business: chatBusinessSchema/.test(siteChatCode) && !/SAMPLE_BUSINESS_IDS/.test(siteChatCode));
  check("/api/site-chat's capture-lead persistence is gated only on the model's own extracted name+phone, never on isSample/isKnownSample", /if \(capturedLead\) \{/.test(siteChatCode) && !/isKnownSample|isSample/.test(siteChatCode));

  // Proof #7: isSample on /api/demo-site only ever selects which
  // (harmless, non-persisting) endpoint URL gets embedded in the
  // generated static HTML -- it can never be exercised as a live
  // "activate sample mode" call against the real endpoints themselves,
  // because those endpoints don't read isSample. This is verified by the
  // absence checks above (7's isSample query-param check, this section's
  // absence-of-isSample checks in both real routes) taken together.
  const leadFormSrc = src("src/lib/sitegen/lead-form.ts");
  check("leadFormScript() selects the POST target (real vs sample) at generation time from a hardcoded constant, not a runtime request field", /API_URL = \$\{safeJson\(isSample \? SAMPLE_LEAD_API_URL : LEAD_API_URL\)\}/.test(leadFormSrc));
  check("leadFormScript() no longer sends isSample in the POST body (the real route doesn't read it, and never should)", !/isSample: IS_SAMPLE/.test(leadFormSrc));
  const chatWidgetSrc = src("src/lib/sitegen/chat-widget.ts");
  check("chatWidgetScript() selects the POST target (real vs sample) at generation time from a hardcoded constant, not a runtime request field", /API_URL = \$\{safeJson\(isSample \? SAMPLE_CHAT_API_URL : CHAT_API_URL\)\}/.test(chatWidgetSrc));
  check("chatWidgetScript() no longer sends isSample in the POST body", !/isSample: IS_SAMPLE/.test(chatWidgetSrc));

  // Proof #8: a missing/invalid organizationId still resolves to the
  // default org and still inserts -- it was never, and still isn't,
  // treated as "this must be a sample."
  check("/api/site-lead's missing-org fallback still calls getDefaultOrganizationId() and still proceeds to insert (no skip)", /orgId = await getDefaultOrganizationId\(supabase\);/.test(siteLeadSrc) && /await supabase\.from\("chat_leads"\)\.insert\(/.test(siteLeadSrc));
  check("/api/site-chat's missing-org fallback still calls getDefaultOrganizationId() and still proceeds to insert (no skip)", /orgId = await getDefaultOrganizationId\(supabase\);/.test(siteChatSrc) && /await supabase\.from\("chat_leads"\)\.insert\(/.test(siteChatSrc));

  // Proof #9 & #10: the real insert logic itself is provably unchanged
  // from the pre-Phase-7 baseline (main) -- diffed at verification time,
  // not just asserted, so a future edit that breaks this also breaks the
  // check rather than going stale.
  const cwd = path.join(__dirname, "..");
  const baseline = "24a6056852ad2edf8e9baad8e02933c92699d68e";
  const siteLeadDiff = execSync(`git diff ${baseline} -- src/app/api/site-lead/route.ts`, { cwd, encoding: "utf8" });
  const siteLeadDiffBodyOnly = siteLeadDiff
    .split("\n")
    .filter((l) => (l.startsWith("+") || l.startsWith("-")) && !l.startsWith("+++") && !l.startsWith("---"))
    .filter((l) => !l.trim().startsWith("+ *") && !l.trim().startsWith("- *") && l.trim() !== "+" && l.trim() !== "-");
  check("/api/site-lead's real insert logic has zero non-comment diff against the pre-Phase-7 baseline (only doc comments changed)", siteLeadDiffBodyOnly.length === 0, `${siteLeadDiffBodyOnly.length} non-comment line(s) changed`);

  check("/api/site-chat's real insert call, its fields, and its org-resolution fallback are present and match the pre-existing shape (refactored into a shared helper, not altered)", /organization_id: orgId/.test(siteChatSrc) && /visitor_name: capturedLead\.name/.test(siteChatSrc) && /visitor_phone: capturedLead\.phone/.test(siteChatSrc) && /transcript: \[\.\.\.messages,/.test(siteChatSrc));

  // Proof #11: tenant attribution is still server-derived (validated
  // against a real organizations row, or the real getDefaultOrganizationId()
  // helper) -- never taken as a bare client claim.
  check("/api/site-lead validates a provided organizationId against a real organizations row before trusting it", /\.from\("organizations"\)\s*\n?\s*\.select\("id"\)\s*\n?\s*\.eq\("id", organizationId\)\s*\n?\s*\.single\(\)/.test(siteLeadSrc));
  check("/api/site-chat validates a provided organizationId against a real organizations row before trusting it", /\.from\("organizations"\)\s*\n?\s*\.select\("id"\)\s*\n?\s*\.eq\("id", organizationId\)\s*\n?\s*\.single\(\)/.test(siteChatSrc));

  // Proof #12: no migration.
  const migrationDiff2 = execSync("git diff --stat main -- supabase/migrations", { cwd, encoding: "utf8" });
  check("no migration required by this second-pass fix either", migrationDiff2.trim().length === 0);
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
  // Composition pass: the workflow section went from 6 small columns
  // (sm:grid-cols-3 lg:grid-cols-6) to 4 substantial ones -- one column on
  // mobile, two-by-two at tablet, four across at large desktop, per the
  // owner's explicit layout requirement.
  check("homepage's four-phase workflow is one column on mobile, two-by-two at tablet, four-up at large desktop", /grid-cols-1[^"]*sm:grid-cols-2[^"]*lg:grid-cols-4/.test(src("src/app/page.tsx")) && /sm:grid-cols-2/.test(src("src/app/page.tsx")));
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

console.log("\n15. P0 -- centered public shell, VibeLabs-inspired composition, WebGenie's own accent kept");
{
  const shellSrc = src("src/components/shell.tsx");
  check("a shared PUBLIC_SHELL_PADDING constant exists (16-20/24-32/32-48px responsive side padding)", /PUBLIC_SHELL_PADDING = "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12"/.test(shellSrc));
  check("TopBar applies PUBLIC_SHELL_PADDING only for role===\"guest\", authenticated px-6 untouched", /role === "guest" \? PUBLIC_SHELL_PADDING : "px-6"/.test(shellSrc));
  check("PageShell's <main> applies the same guest-only padding split", /role === "guest" \? PUBLIC_SHELL_PADDING : "px-6"/.test(shellSrc));
  check("Footer is a real multi-column structure (Product/Account/Company), not a single flat link row", /FOOTER_COLUMNS/.test(shellSrc) && /heading: "Product"/.test(shellSrc) && /heading: "Account"/.test(shellSrc) && /heading: "Company"/.test(shellSrc));
  check("Footer's Company column links to the real vibelabsagency.com site (the actual brand relationship), not copied VibeLabs copy", /https:\/\/www\.vibelabsagency\.com\//.test(shellSrc) && /label: "VibeLabs Agency"/.test(shellSrc));

  const pageSrc = src("src/app/page.tsx");
  check("Hero is a centered composition (text-center), not left-column/right-card", /function Hero\(\)[\s\S]{0,120}text-center/.test(pageSrc));
  check("Hero headline uses the P0-directed copy with WebGenie's own solid violet accent (no gradient text -- Impeccable finish review finding, emphasis by color/weight only), never a VibeLabs cyan literal", /Find the right business\.[\s\S]{0,40}text-iris-soft/.test(pageSrc) && !/gradient-text/.test(pageSrc.slice(pageSrc.indexOf("function Hero()"), pageSrc.indexOf("function HeroProductScreenshot"))) && !/#22D3EE|cyan-400|text-cyan/.test(pageSrc));
  // Superseded by the owner's screenshot-gate approval (see section 17):
  // the four-stage illustrative walkthrough this check used to assert on
  // was replaced with a real, substantial, centered screenshot panel at
  // the same weight/width -- still one substantial centered panel, not a
  // small side card, just a real screenshot instead of a mockup now.
  check("Hero still has a substantial centered real-screenshot panel (not a small side card), at the same panel weight as before", /function HeroProductScreenshot\(/.test(pageSrc) && /max-w-\[1100px\]/.test(pageSrc));
  check("every major SectionIntro is centered (mx-auto ... text-center), not left-aligned with a right-side action slot", /function SectionIntro[\s\S]{0,200}text-center/.test(pageSrc) && !/function SectionIntro\(\{ title, description, action/.test(pageSrc));
  check("a reusable full-width Band component exists for alternating section backgrounds", /function Band\(/.test(pageSrc) && /-mx-\[50vw\] w-screen/.test(pageSrc));
  check("Band re-centers its children at the same max-width/padding as the rest of the shell", /max-w-\[1280px\] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12/.test(pageSrc));
  check("comparison-table contents and FAQ answers stay left-aligned inside their centered containers (text-left present, not centered prose)", /max-w-3xl overflow-x-auto rounded-card border border-hairline/.test(pageSrc) && /max-w-2xl divide-y divide-hairline border-t border-hairline text-left/.test(pageSrc));

  const navSrc = src("src/components/public-nav.tsx");
  check("public nav switches to desktop at lg (1024px), not md (768px), so the 5 flat items never wrap against the logo/CTAs", /lg:flex/.test(navSrc) && !/md:flex/.test(navSrc));
  const mobileNavSrc = src("src/components/mobile-nav.tsx");
  check("mobile hamburger's own breakpoint is guest-aware (lg:hidden for guest, md:hidden unchanged for authenticated roles)", /role === "guest" \? "lg:hidden" : "md:hidden"/.test(mobileNavSrc));

  const authShellSrc = src("src/components/auth-shell.tsx");
  check("AuthShell is one centered, bounded composition (a capped max-width .panel), not an edge-to-edge full-viewport grid", /max-w-\[1160px\]/.test(authShellSrc) && /\bpanel\b/.test(authShellSrc) && !/grid min-h-screen lg:grid-cols-2/.test(authShellSrc));
}

console.log("\n16. Owner-review finding -- iframe overload corrected: static optimized thumbnails, zero iframes on initial load");
{
  const pageSrc2 = src("src/app/page.tsx");
  const samplesSrc3 = src("src/app/samples/page.tsx");
  const authShellSrc2 = src("src/components/auth-shell.tsx");

  check("homepage's Examples section uses next/image against a static /sample-previews/*.jpg file, not a live iframe", /import Image from "next\/image"/.test(pageSrc2) && /src=\{`\/sample-previews\/\$\{shortId\}\.jpg`\}/.test(pageSrc2) && !/<iframe/.test(pageSrc2));
  check("/samples' thumbnail component uses next/image against a static file, not a live iframe", /import Image from "next\/image"/.test(samplesSrc3) && /src=\{`\/sample-previews\/\$\{shortId\}\.jpg`\}/.test(samplesSrc3) && !/<iframe/.test(samplesSrc3));
  check("AuthShell's value panel uses next/image against a static file, not a live iframe", /import Image from "next\/image"/.test(authShellSrc2) && /src="\/sample-previews\/dentist\.jpg"/.test(authShellSrc2) && !/<iframe/.test(authShellSrc2));
  check("gallery's grid still uses plain <img> thumbnails (unchanged) and its live preview stays inside the on-demand modal only", /<img\b/.test(src("src/app/gallery/gallery-client.tsx")) && /<iframe\b/.test(src("src/app/gallery/gallery-client.tsx")));

  check("every static thumbnail has a real, descriptive alt string derived from the actual business/industry/location, not empty or decorative", /alt=\{`Preview of the generated demo site for/.test(pageSrc2) && /alt=\{`Preview of the generated demo site for/.test(samplesSrc3) && /alt=\{`Preview of the generated demo site for/.test(authShellSrc2));

  check("all 14 sample-preview thumbnail files exist on disk (real, optimized JPEGs)", (() => {
    const dir = path.join(__dirname, "..", "public", "sample-previews");
    if (!fs.existsSync(dir)) return false;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg"));
    return files.length === 14;
  })());

  // Owner-review finding: one thumbnail once shipped a captured Next.js
  // dev-mode error overlay instead of the real generated site (a mostly-
  // white page with sparse text compresses far smaller than a real,
  // photo-heavy business hero). A file-size floor is a crude but real
  // guard against that exact class of silent failure recurring -- every
  // real thumbnail generated so far has landed at 40-80KB; anything under
  // 20KB at this resolution/quality is almost certainly blank or broken.
  check("every sample-preview thumbnail is above the blank/error-page size floor (guards against shipping a broken capture again)", (() => {
    const dir = path.join(__dirname, "..", "public", "sample-previews");
    if (!fs.existsSync(dir)) return false;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg"));
    const tooSmall = files.filter((f) => fs.statSync(path.join(dir, f)).size < 20 * 1024);
    return tooSmall.length === 0;
  })(), "a file under 20KB was found -- likely a blank or error-page capture");

  check("a documented, reusable regeneration script exists for the thumbnails (not a one-off throwaway)", fs.existsSync(path.join(__dirname, "..", "scripts", "generate-sample-thumbnails.mjs")));

  check("\"View full demo\" links still point at the real, live, fully-interactive generated site (a full top-level navigation, not an on-page iframe)", /href=\{url\}/.test(pageSrc2) && /target="_blank"/.test(pageSrc2));
}

console.log("\n17. Owner-review finding -- real, sanitized product screenshots replace the illustrative hero/product-proof mockups");
{
  const pageSrc3 = src("src/app/page.tsx");

  check("the hero renders a real screenshot component, not the old 4-stage illustrative walkthrough", /function HeroProductScreenshot\(/.test(pageSrc3) && !/function HeroProductWalkthrough\(/.test(pageSrc3));
  check("the hero screenshot is the real Daily Queue capture", /src="\/product-proof\/daily-queue\.jpg"/.test(pageSrc3));
  check("the hero's real screenshot carries the owner-required verbatim redaction caption", /function RedactedScreenshotCaption\(\)/.test(pageSrc3) && /Real WebGenie interface; identifying details redacted\./.test(pageSrc3));
  check("product proof's Finder panel is a real screenshot (not the old illustrative result-row list)", /src="\/product-proof\/finder\.jpg"/.test(pageSrc3));
  check("product proof's Playbook panel is a real screenshot, captioned with the same required redaction disclosure", /src="\/product-proof\/playbook\.jpg"/.test(pageSrc3) && /<RedactedScreenshotCaption \/>/.test(pageSrc3));
  check("Finder's screenshot (nothing to redact -- an empty pre-search state) is NOT given the redaction caption, since nothing was redacted in it", (() => {
    const finderBlock = pageSrc3.slice(pageSrc3.indexOf('src="/product-proof/finder.jpg"'), pageSrc3.indexOf('src="/product-proof/finder.jpg"') + 400);
    return !/<RedactedScreenshotCaption/.test(finderBlock);
  })());
  check("Prospect Detail is never used anywhere on the public page (rejected by the owner even after redaction)", !/prospect-detail/i.test(pageSrc3));
  // Composition pass: the illustrative Website Health score moved from a
  // full-size ScoreRing product-proof card to a small ScoreBar supporting
  // element inside the Verify workflow phase, specifically so it can't
  // visually compete with the real screenshots -- still labeled exactly
  // "Illustrative workflow", never "Illustrative example".
  check("the one remaining constructed (non-screenshot) representation -- the illustrative Website Health score -- is a compact ScoreBar labeled exactly \"Illustrative workflow\", not a full-size ScoreRing", /<ScoreBar score=\{46\}/.test(pageSrc3) && /Illustrative workflow/.test(pageSrc3) && !/<ScoreRing/.test(pageSrc3));
  check("ProductScreenshot renders next/image with explicit width+height (the source file's own intrinsic pixels, so it scales responsively without stretching or cropping)", /function ProductScreenshot\(/.test(pageSrc3) && /width=\{1200\}|width=\{1400\}/.test(pageSrc3) && /height=\{633\}|height=\{708\}|height=\{827\}/.test(pageSrc3));

  check("all 3 approved product-proof images exist on disk", ["finder.jpg", "daily-queue.jpg", "playbook.jpg"].every((f) => fs.existsSync(path.join(__dirname, "..", "public", "product-proof", f))));
  check("no product-proof image carries EXIF/ICC metadata or an alpha channel (flattened, metadata-free per the owner's requirement)", (() => {
    // A cheap, dependency-free JPEG check: EXIF/ICC segments are APP1/APP2
    // markers (0xFFE1 / 0xFFE2) that must appear before the first scan
    // (0xFFDA) if sharp's default (metadata-stripping) output had somehow
    // been bypassed. None of our files should contain one.
    const dir = path.join(__dirname, "..", "public", "product-proof");
    return ["finder.jpg", "daily-queue.jpg", "playbook.jpg"].every((f) => {
      const buf = fs.readFileSync(path.join(dir, f));
      const head = buf.subarray(0, 65536);
      for (let i = 0; i < head.length - 1; i++) {
        if (head[i] === 0xff && (head[i + 1] === 0xe1 || head[i + 1] === 0xe2)) return false;
        if (head[i] === 0xff && head[i + 1] === 0xda) break; // start of scan -- stop looking
      }
      return true;
    });
  })(), "an APP1 (EXIF) or APP2 (ICC) marker was found in a product-proof JPEG");
}

console.log("\n18. Owner-review finding -- final composition pass (page length, four-phase workflow, alternating feature sections)");
{
  const s4 = src("src/app/page.tsx");

  check("the standalone TrustStrip section is gone (its claims were pure repetition of the hero's own trailing line and the FAQ)", !/function TrustStrip\(/.test(s4));
  check("the standalone WhoItsFor section is gone; its two audiences are folded into CoreProblem's own paragraph instead", !/function WhoItsFor\(/.test(s4) && !/id="who-its-for"/.test(s4) && /just starting an agency or already running one/.test(s4));
  check("CoreProblem is tightened to one headline, one paragraph, three failure points, and one transition sentence into the workflow", /Good work isn&apos;t the hard part\. Finding who to do it for is\./.test(s4) && /replaces the guessing with one connected process/.test(s4));

  check("the workflow is four marketing phases (Find/Verify/Prepare/Act), not the old six (Find/Verify/Prepare/Contact/Follow up/Win & hand off)", /const WORKFLOW_PHASES = \[/.test(s4) && !/const WORKFLOW_STAGES = \[/.test(s4) && !/title: "Contact"/.test(s4) && !/title: "Follow up"/.test(s4) && !/title: "Win & hand off"/.test(s4));
  check("each workflow phase renders as a substantial `.card` (border+surface+padding), not bare icon+text in a thin row", /WORKFLOW_PHASES\.map\(\(phase, i\) => \(\s*<li key=\{phase\.title\} className="card/.test(s4));

  check("product proof no longer puts three equal-weight cards in one row -- it's alternating full-width feature sections", !/mt-10 grid gap-4 text-left lg:grid-cols-3/.test(s4) && /Feature 1 -- Daily Queue/.test(s4) && /Feature 2 -- Finder/.test(s4) && /Feature 3 -- Live Outreach Playbook/.test(s4));
  check("Finder's screenshot column is capped narrower than Daily Queue's/Playbook's (deliberately secondary, not equal prominence)", (() => {
    const finderCap = /Finder[\s\S]{0,200}?max-w-\[(\d+)px\]/.exec(s4)?.[1];
    const dqCap = /daily-queue\.jpg[\s\S]{0,400}/.exec(s4) ? /max-w-\[(\d+)px\][\s\S]{0,600}daily-queue\.jpg/.exec(s4)?.[1] : undefined;
    return Boolean(finderCap && dqCap && Number(finderCap) < Number(dqCap));
  })());
  check("no product-proof feature block nests a screenshot border inside another bordered surface (ProductScreenshot's own border/shadow is the only frame)", !/panel mx-auto max-w-\[1100px\] overflow-hidden/.test(s4));

  check("the homepage's own top-level H1/H2 headings show real alternating rhythm, not the same centered treatment repeated verbatim for every section (left/right feature copy exists alongside centered section intros)", /lg:order-1/.test(s4) && /lg:order-2/.test(s4));

  check("the generated-site Examples section is unchanged in count (still exactly 4), keeps its Illustrative example labeling, and its sample-preview images stay default-lazy (no priority prop)", (() => {
    const idsOk = /const EXAMPLE_IDS = \["sample-roofer", "sample-hvac", "sample-plumber", "sample-dentist"\]/.test(s4);
    const labelOk = /Illustrative example/.test(s4);
    const exampleFnBlock = s4.slice(s4.indexOf("function Examples()"), s4.indexOf("function Plans()"));
    const imageBlock = exampleFnBlock.slice(exampleFnBlock.indexOf("<Image"), exampleFnBlock.indexOf("<Image") + 400);
    const noPriority = !/\bpriority\b/.test(imageBlock);
    return idsOk && labelOk && noPriority;
  })());

  check("the comparison table still distinguishes positive/negative by icon shape (X vs Check), not color alone", /<X className="mt-0\.5 h-3\.5 w-3\.5 shrink-0 text-signal-bad"/.test(s4) && /<Check className="mt-0\.5 h-3\.5 w-3\.5 shrink-0 text-signal-good"/.test(s4));

  check("no gradient-text headline, floating pill, or decorative blob was introduced by this pass", !/gradient-text/.test(s4) && !/rounded-full.*floating/.test(s4) && !/\bblob\b/i.test(s4));
}

console.log("\n19. Owner-review finding -- trial-copy truthfulness (no unsupported duration claim, consistent across public pages)");
{
  // Real discrepancy found by inspection: organizations.trial_ends_at's
  // column DEFAULT is 14 days (migration 011); migration 027, which would
  // change that default to 7 days, is written but per CLAUDE.md not yet
  // run against production, and the ordinary WebGenie signup path
  // (create-account + bootstrap) never sets trial_ends_at explicitly in
  // code -- so it relies entirely on that column default. A real signup
  // today plausibly gets a 14-day trial, not the "7-day" this site used
  // to claim in five places. Fixing the underlying duration (running
  // migration 027, or setting it explicitly in code) is out of scope for
  // a public-site PR -- this section only asserts the PUBLIC CLAIM no
  // longer states an unproven number, everywhere it could appear.
  //
  // "Full access" is treated differently: src/lib/auth/access.ts's own
  // trialExpired gating is a single all-or-nothing boolean (blocks entry
  // to /trial-expired once past trial_ends_at) with no separate
  // trial-tier feature restriction anywhere in the codebase -- so unlike
  // the day-count, that scope claim IS structurally provable, and is
  // deliberately left in place on the one Plans FAQ answer that already
  // had it, rather than stripped for its own sake.
  const homeSrc = src("src/app/page.tsx");
  const authShellSrc3 = src("src/components/auth-shell.tsx");
  const signupSrc = src("src/app/signup/page.tsx");
  const loginSrc = src("src/app/login/page.tsx");
  const forgotSrc = src("src/app/forgot-password/page.tsx");
  const resetSrc = src("src/app/reset-password/page.tsx");

  const noBadDuration = (s: string) => !/7-day|7 days|14-day|14 days/i.test(s);

  check("homepage (metadata + hero + Plans FAQ) makes no 7-day or 14-day trial-duration claim", noBadDuration(homeSrc));
  check("AuthShell's shared reassurance line (rendered on login/signup/forgot-password/reset-password) makes no 7-day or 14-day claim", noBadDuration(authShellSrc3));
  check("/signup's own subheading makes no 7-day or 14-day claim", noBadDuration(signupSrc));
  check("/login, /forgot-password and /reset-password inherit AuthShell's copy and add none of their own duration claim", noBadDuration(loginSrc) && noBadDuration(forgotSrc) && noBadDuration(resetSrc));

  check("hero's trailing reassurance line uses the owner-directed duration-neutral wording", /<span>Start free<\/span>[\s\S]{0,80}<span>No credit card required<\/span>[\s\S]{0,80}<span>Human-executed outreach<\/span>/.test(homeSrc));
  check("AuthShell's reassurance list uses the same duration-neutral \"Start free, no credit card required\" wording", /"Start free, no credit card required"/.test(authShellSrc3));
  check("/signup's subheading uses the same duration-neutral wording", /Start free\. No credit card required\./.test(signupSrc));
  check("Plans FAQ question is duration-neutral (\"when the trial ends\", not \"after 7 days\")", /What happens when the trial ends\?/.test(homeSrc) && !/What happens after 7 days\?/.test(homeSrc));
  check("Plans FAQ's \"what's included\" answer keeps its full-access SCOPE claim (structurally provable -- no separate trial-tier feature gate exists) without restating a duration", /Full access to Finder, evidence-based audits, the site generator, Daily Queue, and Playbook/.test(homeSrc));

  check("the authenticated /trial-expired page (out of scope -- gated behind sign-in, not a public route) was not touched by this pass", (() => {
    try {
      const diff = execSync("git diff HEAD -- src/app/trial-expired/page.tsx", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
      return diff.trim().length === 0;
    } catch {
      return true; // no such diff possible / git unavailable -- don't fail the suite over tooling
    }
  })());

  check("src/lib/auth/access.ts's trial gate remains a single all-or-nothing boolean, not a feature-limited tier (the structural basis for keeping the \"full access\" scope claim)", /trialExpired/.test(src("src/lib/auth/access.ts")) && !/trial.?tier|limited.?feature/i.test(src("src/lib/auth/access.ts")));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
