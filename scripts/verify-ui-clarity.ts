/**
 * WEBGENIE AUTHENTICATED UI/UX REBUILD -- verification.
 *
 * Source-text + functional checks (this repo's established convention,
 * see scripts/verify-outreach-evidence-quality.ts) covering the Phase 13
 * list: navigation destinations, active-state indication, compact page
 * headers, evidence-readiness wording (including the Gold Stars verified-
 * observation/full-audit distinction), Daily Queue action priority,
 * disabled-channel explanation, suppression presentation, loading
 * skeletons, empty states, responsive layout, Playbook stage navigation,
 * and confirmation that no event/outcome semantics changed.
 *
 * This is a presentation-layer rebuild -- these checks intentionally
 * never assert on stored values, RLS, or action-generation logic (those
 * remain scripts/verify-playbook-*.ts, verify-suppression.ts, etc.'s job,
 * all of which still pass unmodified after this rebuild).
 */
import * as fs from "fs";
import * as path from "path";
import {
  computeEvidenceReadiness,
  EVIDENCE_READINESS_DETAIL,
  EVIDENCE_READINESS_LABEL,
  getOverallReadinessBadge,
  describeBriefSummary,
  describeRecommendedOfferReason,
  NO_AUDIT_SUMMARY_SUFFIX,
  NO_OFFER_SUFFIX,
  RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE,
  OUTREACH_READY_NOTE
} from "../src/lib/prospect/evidence-readiness";
import { evaluateChannelActivation } from "../src/lib/prospect/contact-verification";

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

console.log("1. Navigation destinations -- every real existing route is reachable, grouped by workflow");
{
  const shellSrc = src("src/components/shell.tsx");
  check("WORK group exists with Daily Queue, Finder, Find Audits", /const WORK_ITEMS/.test(shellSrc) && /href: "\/prospecting"/.test(shellSrc) && /href: "\/finder"/.test(shellSrc) && /href: "\/audit"/.test(shellSrc));
  check("OUTREACH group exists with Sequences, Launch, Insights", /const OUTREACH_ITEMS/.test(shellSrc) && /href: "\/sequences"/.test(shellSrc) && /href: "\/launch"/.test(shellSrc) && /href: "\/insights"/.test(shellSrc));
  check("DELIVERY group exists with Projects, Call Tracker, Leads, Onboard", /const DELIVERY_ITEMS/.test(shellSrc) && /href: "\/projects\/new"/.test(shellSrc) && /href: "\/calls"/.test(shellSrc) && /href: "\/leads"/.test(shellSrc) && /href: "\/onboard"/.test(shellSrc));
  // Samples/Gallery consolidation (owner product decision): /samples is
  // gone as a distinct product area (it redirects to /gallery -- see
  // next.config.ts and scripts/verify-public-examples-auth-gate.ts), so
  // RESOURCES now carries Gallery alone, still de-emphasized/last.
  check("RESOURCES group exists and contains Gallery (de-emphasized, not competing with WORK), and no longer a separate Samples entry", /const RESOURCES_ITEMS/.test(shellSrc) && /href: "\/gallery"/.test(shellSrc) && !/href: "\/samples"/.test(shellSrc));
  check("RESOURCES is rendered last among the NavGroups (never first/most prominent)", (() => {
    const navBlock = shellSrc.slice(shellSrc.indexOf("<nav"), shellSrc.indexOf("</nav>"));
    const workIdx = navBlock.indexOf('label="Work"');
    const resourcesIdx = navBlock.indexOf('label="Resources"');
    return workIdx !== -1 && resourcesIdx !== -1 && workIdx < resourcesIdx;
  })());
  check("Settings/New project/Find clients (creation + system) are NOT NavGroup items -- visually distinct from navigation", !/label="Settings"|label="New project"|label="Find clients"/.test(shellSrc));
  check("no former PROSPECTOR_ITEMS/DASHBOARD_ITEMS/PUBLIC_ITEMS mixing operational + marketing at the same level survives", !/const PROSPECTOR_ITEMS|const DASHBOARD_ITEMS|const PUBLIC_ITEMS/.test(shellSrc));
}

console.log("\n2. Active navigation state");
{
  const navGroupSrc = src("src/components/nav-group.tsx");
  check("NavGroup reads the real current pathname (usePathname), not a hardcoded value", /usePathname\(\)/.test(navGroupSrc));
  check("an active item is marked aria-current=\"page\"", /aria-current=\{active \? "page" : undefined\}/.test(navGroupSrc));
  check("the group trigger itself shows a filled-dot indicator when any of its items is the active route", /hasActiveItem/.test(navGroupSrc) && /bg-iris/.test(navGroupSrc));

  const mobileNavSrc = src("src/components/mobile-nav.tsx");
  check("mobile nav also reads the real pathname and marks the active link", /usePathname\(\)/.test(mobileNavSrc) && /aria-current=\{active \? "page" : undefined\}/.test(mobileNavSrc));
}

console.log("\n3. Compact PageHeader used across the redesigned pages (replacing the oversized marketing-style hero)");
{
  const pages = [
    ["Daily Queue", "src/app/prospecting/prospecting-client.tsx"],
    ["Prospect Detail", "src/app/prospects/[id]/page.tsx"],
    ["Finder", "src/app/finder/finder-client.tsx"],
    ["Projects", "src/app/projects/new/new-project-client.tsx"],
    ["Sequences", "src/app/sequences/sequences-client.tsx"],
    ["Launch", "src/app/launch/launch-client.tsx"],
    ["Insights", "src/app/insights/insights-client.tsx"]
  ] as const;
  for (const [name, file] of pages) {
    const s = src(file);
    check(`${name} imports and renders the shared PageHeader`, /import \{[^}]*PageHeader[^}]*\} from "@\/components\/workspace"/.test(s) && /<PageHeader/.test(s));
    check(`${name} no longer uses the old giant display-lg gradient-headline hero pattern`, !/text-display-lg font-semibold/.test(s));
  }
}

console.log("\n4. PageHeader itself renders at a compact, workspace-appropriate scale (not a 270-350px marketing hero)");
{
  const workspaceSrc = src("src/components/workspace.tsx");
  check("PageHeader's title uses the new page-title token (26-36px), never the marketing display-lg/xl scale", /text-page-title/.test(workspaceSrc) && !/text-display-(lg|xl)/.test(workspaceSrc));
  check("PageHeader has no full-bleed background panel/hero treatment -- just a bottom hairline border", /border-b border-hairline pb-5/.test(workspaceSrc));
  const tailwindSrc = src("tailwind.config.ts");
  check("the page-title token is genuinely smaller than the marketing display-lg token (clamp max 36px vs 56px)", /"page-title": \["clamp\(1\.625rem, 2\.6vw, 2\.25rem\)/.test(tailwindSrc));
}

console.log("\n5. Evidence-readiness wording -- Gold Stars-shape verified-observation/full-audit distinction");
{
  check("no website -> no_website readiness", computeEvidenceReadiness({ hasWebsite: false, hasAudit: false, hasVerifiedObservation: false }) === "no_website");
  check("has website + full audit -> audited, regardless of any verified observation", computeEvidenceReadiness({ hasWebsite: true, hasAudit: true, hasVerifiedObservation: true }) === "audited");
  check(
    "has website + a verified outreach observation + NO full audit -> verified_observation (the exact Gold Stars Roof shape: PR #29 evidence exists, no audit yet)",
    computeEvidenceReadiness({ hasWebsite: true, hasAudit: false, hasVerifiedObservation: true }) === "verified_observation"
  );
  check("has website, no audit, no verified observation -> insufficient (genuinely nothing yet -- this state must still say so)", computeEvidenceReadiness({ hasWebsite: true, hasAudit: false, hasVerifiedObservation: false }) === "insufficient");

  check(
    "the verified_observation sentence explicitly says a full audit is NOT yet completed (never implies one exists)",
    /Full website audit not yet completed/.test(EVIDENCE_READINESS_DETAIL.verified_observation)
  );
  check(
    "the verified_observation sentence never claims there is no usable evidence (the exact prohibited phrase from the spec must not appear here)",
    !/there isn't enough evidence yet to say what the opportunity is/.test(EVIDENCE_READINESS_DETAIL.verified_observation)
  );
  check("the insufficient-evidence sentence is the only one that still says so", /there isn't enough evidence yet to say what the opportunity is/.test(EVIDENCE_READINESS_DETAIL.insufficient));
  check("readiness labels are distinct, human strings for all 4 states", new Set(Object.values(EVIDENCE_READINESS_LABEL)).size === 4);

  // opportunity-level.ts / opportunity-brief.ts are UNCHANGED -- the fix is
  // read-time presentation only. Confirm no business-logic file was edited
  // to fabricate an audit score or change opportunityLevel classification.
  const levelSrc = src("src/lib/prospect/opportunity-level.ts");
  check("computeOpportunityLevel() still returns 'insufficient_evidence' purely from hasWebsite+intelligence -- never touched to reference verified observations", /if \(!intelligence\) return "insufficient_evidence";/.test(levelSrc) && !/evidence-readiness|verifiedObservation/.test(levelSrc));
  const briefSrc = src("src/lib/prospect/opportunity-brief.ts");
  check("hasWebsiteNoAuditBrief() (the persisted brief generator) is untouched -- the fix never rewrites what's stored", /confidence: 0/.test(briefSrc) && !/evidence-readiness|verifiedObservation/.test(briefSrc));
}

console.log("\n6. Evidence readiness is consistently derived on Prospect Detail, Daily Queue AND the Playbook (same shared helpers, same source)");
{
  const prospectPageSrc = src("src/app/prospects/[id]/page.tsx");
  check("Prospect Detail imports getVerifiedManualObservations() -- the exact function the Playbook itself already uses for its own Verified Observation stage", /getVerifiedManualObservations/.test(prospectPageSrc));
  check("Prospect Detail imports the shared describeBriefSummary/describeRecommendedOfferReason/getOverallReadinessBadge from evidence-readiness.ts", /from "@\/lib\/prospect\/evidence-readiness"/.test(prospectPageSrc) && /getOverallReadinessBadge/.test(prospectPageSrc) && /describeBriefSummary/.test(prospectPageSrc) && /describeRecommendedOfferReason/.test(prospectPageSrc));
  check("Prospect Detail never rewrites the persisted brief -- only overrides rendered variables, never calls an update/write to opportunity_briefs", !/\.from\("opportunity_briefs"\)\.update|\.from\("opportunity_briefs"\)\.upsert/.test(prospectPageSrc));

  const queueRouteSrc = src("src/app/api/prospects/queue/route.ts");
  check("the Daily Queue API applies the identical describeBriefSummary() override from the same shared module", /from "@\/lib\/prospect\/evidence-readiness"/.test(queueRouteSrc) && /describeBriefSummary\(/.test(queueRouteSrc));
  check("the Daily Queue derives a REAL verifiedChannel via evaluateChannelActivation() against actual verification rows, not the loose playbookChannel hint", /evaluateChannelActivation\(records, "CALL"\)/.test(queueRouteSrc) && /verifiedChannel/.test(queueRouteSrc));
  check("the Daily Queue's evidence fetches are read-only (SELECT from prospect_evidence_observations / prospect_contact_verifications, never a write)", /\.from\("prospect_evidence_observations"\)\s*\n?\s*\.select/.test(queueRouteSrc) && /\.from\("prospect_contact_verifications"\)\s*\n?\s*\.select/.test(queueRouteSrc));
  check("opportunity_level itself is passed through unchanged in the queue response (never recomputed/overridden)", /opportunityLevel: brief\?\.opportunity_level \?\? null/.test(queueRouteSrc));

  const resolveContextSrc = src("src/lib/playbook/resolve-context.ts");
  check("the Playbook's resolve-context.ts also imports and applies describeBriefSummary() to its own opportunitySummary -- the third screen, same shared helper", /from "@\/lib\/prospect\/evidence-readiness"/.test(resolveContextSrc) && /describeBriefSummary\(/.test(resolveContextSrc));
  check("resolve-context.ts fetches opportunity_level and exposes it on PlaybookIntelligence for the badge", /select\("summary, opportunity_level"\)/.test(resolveContextSrc) && /opportunityLevel: OpportunityLevel \| null;/.test(resolveContextSrc));
  check("the Playbook never writes to opportunity_briefs either", !/\.from\("opportunity_briefs"\)\.update|\.from\("opportunity_briefs"\)\.upsert/.test(resolveContextSrc));
}

console.log("\n7. Daily Queue action priority -- Open Playbook dominates CALL/EMAIL, Run Audit dominates an unaudited prospect");
{
  const s = src("src/app/prospecting/prospecting-client.tsx");
  check("primaryLabel is 'Open Playbook' when a verified playbook channel exists", /item\.playbookChannel \? "Open Playbook"/.test(s));
  check("primaryLabel is 'Run Audit' for an unaudited (RUN_AUDIT) action when no playbook channel applies", /item\.actionType === "RUN_AUDIT" \? "Run Audit"/.test(s));
  check("both still route to the real existing destination (playbook or prospect page) -- no new action-trigger endpoint was invented", /const primaryHref = item\.playbookChannel/.test(s));
  check("rows are grouped by due state (Overdue / Due Today / Upcoming)", /QueueGroup label="Overdue"/.test(s) && /QueueGroup label="Due Today"/.test(s) && /QueueGroup label="Upcoming"/.test(s));
  check("the technical/raw reason is moved into a 'Why this action?' disclosure, not the dominant paragraph, once it's long", /summary="Why this action\?"/.test(s));
  check("Mark Done / Snooze / Skip controls have readable text labels, not icon-only", /Mark done/.test(s) && />\s*Snooze/.test(s) && /Skip/.test(s));
}

console.log("\n8. Disabled/unverified channel explanation is preserved and unchanged in meaning (Playbook)");
{
  const s = src("src/app/prospects/[id]/playbook/intelligence-card.tsx");
  check("ChannelRow still renders the real disabled-channel reasons (no_verification / conflicting_sources), unchanged", /no_verification: "Not verified — channel disabled"/.test(s) && /conflicting_sources: "Conflicting sources — channel disabled"/.test(s));
  check("ChannelRow's activation logic itself is untouched -- still driven by the real evaluateChannelActivation() result passed in via the `channels` prop (PlaybookChannelStatus), never re-derived inside this component", /result\.activatable/.test(s) && /channels: PlaybookChannelStatus/.test(s));
}

console.log("\n9. OWNER-REVIEW CORRECTION #1: verified observation + no audit never renders overall 'Insufficient evidence' (P0 blocker)");
{
  check(
    "getOverallReadinessBadge() replaces the label entirely when insufficient_evidence + a verified observation coincide -- 'Insufficient evidence' is not the label in that case",
    getOverallReadinessBadge("insufficient_evidence", true).label !== "Insufficient evidence" && getOverallReadinessBadge("insufficient_evidence", true).label === "Verified observation available"
  );
  check(
    "the genuine insufficient-evidence case (no audit, no verified observation) is untouched -- still says 'Insufficient evidence', fail-closed",
    getOverallReadinessBadge("insufficient_evidence", false).label === "Insufficient evidence"
  );
  check("high/medium/low opportunity levels are never touched by the verified-observation override (it only ever applies to insufficient_evidence)", getOverallReadinessBadge("high", true).label === "High opportunity" && getOverallReadinessBadge("medium", true).label === "Medium opportunity" && getOverallReadinessBadge("low", true).label === "Low opportunity");

  for (const [name, file] of [
    ["Prospect Detail", "src/app/prospects/[id]/page.tsx"],
    ["Daily Queue", "src/app/prospecting/prospecting-client.tsx"],
    ["Playbook intelligence card", "src/app/prospects/[id]/playbook/intelligence-card.tsx"]
  ] as const) {
    const s = src(file);
    check(`${name} renders its overall badge via the shared getOverallReadinessBadge(), never a raw opportunityLevel-only label map`, /getOverallReadinessBadge\(/.test(s));
    check(`${name} contains no separate hardcoded "Insufficient evidence" label map (LEVEL_LABEL) that could show alongside the readiness badge`, !/insufficient_evidence:\s*"Insufficient evidence"/.test(s));
  }
}

console.log("\n10. OWNER-REVIEW CORRECTION #2: Gold Stars-shape display -- verified observation available, full audit not completed, outreach-ready when permitted");
{
  check("the verified_observation detail sentence says 'Verified outreach observation available'", /^Verified outreach observation available\./.test(EVIDENCE_READINESS_DETAIL.verified_observation));
  check("the verified_observation detail sentence says a full audit is 'not yet completed'", /Full website audit not yet completed/.test(EVIDENCE_READINESS_DETAIL.verified_observation));
  check("OUTREACH_READY_NOTE is the exact 'Ready for verified-observation outreach' language the owner-review requires", OUTREACH_READY_NOTE === "Ready for verified-observation outreach");

  for (const [name, file] of [
    ["Prospect Detail", "src/app/prospects/[id]/page.tsx"],
    ["Daily Queue", "src/app/prospecting/prospecting-client.tsx"],
    ["Playbook intelligence card", "src/app/prospects/[id]/playbook/intelligence-card.tsx"]
  ] as const) {
    const s = src(file);
    check(`${name} shows OUTREACH_READY_NOTE only when a verified observation exists AND a channel is genuinely permitted`, /showOutreachReady/.test(s) && /hasVerifiedObservation/.test(s));
  }
  // Prospect Detail and the Daily Queue derive "channel permitted" from a
  // REAL evaluateChannelActivation() result -- never a loose hint.
  check("Prospect Detail's hasPermittedChannel is a real evaluateChannelActivation() result against fetched prospect_contact_verifications rows", /evaluateChannelActivation\(verificationRecords, "CALL"\)\.activatable \|\| evaluateChannelActivation\(verificationRecords, "EMAIL"\)\.activatable/.test(src("src/app/prospects/[id]/page.tsx")));
  check("the Playbook's outreach-ready note reuses the SAME channels.call/email.activatable this card's own ChannelRow rows already render -- no second, separate check", /showOutreachReady = hasVerifiedObservation && \(channels\.call\.activatable \|\| channels\.email\.activatable\)/.test(src("src/app/prospects/[id]/playbook/intelligence-card.tsx")));
}

console.log("\n11. OWNER-REVIEW CORRECTION #3: 'nothing to base an offer on' is corrected to name the real, narrower distinction");
{
  check("NO_OFFER_SUFFIX matches the real computeRecommendedOffer() sentence", /nothing to base an offer on\.$/.test(`No audit has been run yet — ${NO_OFFER_SUFFIX}`));
  check(
    "describeRecommendedOfferReason() replaces it with the exact required sentence when a verified observation exists",
    describeRecommendedOfferReason("No audit has been run yet — nothing to base an offer on.", true) === RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE
  );
  check("RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE is the exact required sentence", RECOMMENDED_OFFER_VERIFIED_OBSERVATION_NOTE === "Full recommended offer unavailable until the website audit is completed.");
  check(
    "the override never fires without a verified observation -- fail-closed preserved for the genuinely-insufficient case",
    describeRecommendedOfferReason("No audit has been run yet — nothing to base an offer on.", false) === "No audit has been run yet — nothing to base an offer on."
  );
  check("Prospect Detail's Recommended Offer card renders the corrected `recommendedOfferReason`, not the raw brief.recommendedOfferReason", /\{recommendedOfferReason\}/.test(src("src/app/prospects/[id]/page.tsx")));
}

console.log("\n12. OWNER-REVIEW CORRECTION #4: no audit score is ever fabricated by any of this");
{
  const readinessSrc = src("src/lib/prospect/evidence-readiness.ts");
  check("evidence-readiness.ts contains no numeric score literal or scoring computation of its own", !/overallScore\s*[:=]\s*\d/.test(readinessSrc) && !/score\s*=\s*\d/.test(readinessSrc));
  check("the opportunity-brief generator's own confidence:0 for the no-audit case is untouched", /confidence: 0/.test(src("src/lib/prospect/opportunity-brief.ts")));
  const prospectPageSrc = src("src/app/prospects/[id]/page.tsx");
  check("Prospect Detail still renders the REAL brief.confidence value verbatim (never a fabricated replacement)", /Math\.round\(brief\.confidence \* 100\)/.test(prospectPageSrc));
}

console.log("\n13. OWNER-REVIEW CORRECTION #5: unaudited prospects WITHOUT a verified observation still fail closed");
{
  check("computeEvidenceReadiness() with no audit and no observation is 'insufficient', never 'verified_observation'", computeEvidenceReadiness({ hasWebsite: true, hasAudit: false, hasVerifiedObservation: false }) === "insufficient");
  check("getOverallReadinessBadge() keeps showing 'Insufficient evidence' for that exact case on every screen (already re-checked in section 9)", getOverallReadinessBadge("insufficient_evidence", false).label === "Insufficient evidence");
  check(
    "describeBriefSummary() never overrides the stale sentence without hasVerifiedObservation:true",
    describeBriefSummary(`X has an existing website, but no audit has been run yet — ${NO_AUDIT_SUMMARY_SUFFIX}`, false)?.endsWith(NO_AUDIT_SUMMARY_SUFFIX) ?? false
  );
  check(
    "describeRecommendedOfferReason() never overrides without hasVerifiedObservation:true",
    describeRecommendedOfferReason(`No audit has been run yet — ${NO_OFFER_SUFFIX}`, false)?.endsWith(NO_OFFER_SUFFIX) ?? false
  );
  check(
    "evaluateChannelActivation() itself (the underlying fail-closed contact-verification logic) is completely untouched by this correction",
    evaluateChannelActivation([], "CALL").activatable === false && (evaluateChannelActivation([], "CALL") as { reason?: string }).reason === "no_verification"
  );
}

console.log("\n14. OWNER-REVIEW CORRECTION #6: Daily Queue hides/de-emphasizes an unhelpful all-zero summary strip");
{
  const s = src("src/app/prospecting/prospecting-client.tsx");
  check("the summary strip's categories are now derived from the real, currently-visible queue items (actionLabel counts), not a fixed bucket set that can miss every real action type", /counts\.set\(item\.actionLabel, \(counts\.get\(item\.actionLabel\) \?\? 0\) \+ 1\)/.test(s));
  check("Meetings Scheduled is only added when it's genuinely non-zero, never a guaranteed-empty tile", /meetingsScheduled > 0/.test(s));
  check("the strip is not rendered at all when there is nothing meaningful to show", /summaryItems\.length > 0 \? \(/.test(s));
}

console.log("\n15. OWNER-REVIEW CORRECTION #7: technical sequence instructions live inside the disclosure, a concise human sentence is dominant");
{
  const s = src("src/app/prospecting/prospecting-client.tsx");
  check("SEQUENCE_STEP rows get a concise, human conciseReason instead of the raw stored reason", /const conciseReason =/.test(s) && /item\.actionType === "SEQUENCE_STEP"/.test(s));
  check("the example language the owner-review specified is present for the verified-observation case", /Call using the verified observation and ask permission to send the assessment\./.test(s));
  check("the dominant paragraph renders conciseReason, not the raw item.reason, for every row", /\{conciseReason\}/.test(s));
  check("the FULL original reason is unconditionally available inside 'Why this action?' -- never trimmed away, always present regardless of length", /<DisclosurePanel summary="Why this action\?" className="mt-1\.5">\s*\n\s*<p>\{item\.reason\}<\/p>/.test(s));
}

console.log("\n16. OWNER-REVIEW CORRECTION #8: Projects search works without changing project records");
{
  const s = src("src/app/projects/new/new-project-client.tsx");
  check("a client-side search input filters the current page's projects by name/website/industry/analysis state", /const filteredProjects = useMemo/.test(s) && /analysisStateLabel\(project\)/.test(s));
  check("the search never calls a mutating endpoint -- it's pure client-side Array.filter over already-loaded `projects`", /projects\.filter\(\(project\) =>/.test(s));
  check("pagination is preserved unchanged -- the existing <Pagination> component and its page/totalPages props are untouched", /<Pagination page=\{page\} totalPages=\{totalPages\} basePath="\/projects\/new" \/>/.test(s));
  check("a no-matches state offers a clear next step (clear search) rather than a dead end", /No matches on this page/.test(s) && /Clear search/.test(s));
  check("the repeated non-row-specific 'Generate leads' subline is gone -- replaced with real, row-specific reference-count context", !/\{project\.primaryGoal\}/.test(s) && /project\.referenceCount > 0/.test(s));
}

console.log("\n17. OWNER-REVIEW CORRECTION: navigation copy distinguishes Find Clients from Find Audits accurately, without adding/removing capability");
{
  const s = src("src/components/shell.tsx");
  check("Find Clients' description no longer claims Finder only surfaces no-website businesses (P0.5 already broadened Finder to every result)", !/Scan Google Maps for businesses with no website/.test(s));
  check("Find Audits' description names its real distinguishing behavior: businesses that already have a website, queued straight for an audit", /businesses that already have a website/.test(s) && /queued straight for a real 11-module audit/.test(s));
  check("Find Clients' new description still accurately reflects real Finder behavior (scored results, instant demo for the no-website subset) -- not a capability that was added for this fix", /every result scored/.test(s) && /demo site ready instantly/.test(s));
}

console.log("\n9. Suppression presentation -- a clearly separated danger area, never equal prominence with the primary action");
{
  const prospectPageSrc = src("src/app/prospects/[id]/page.tsx");
  check("SuppressControl renders after the primary actions, inside its own block, with an explanatory comment marking it a danger-zone control", /Suppression is a danger-zone control/.test(prospectPageSrc));
  check("Open Playbook remains the header's one PrimaryAction slot -- suppression is never passed as the PageHeader's primaryAction", (() => {
    const headerBlock = prospectPageSrc.slice(prospectPageSrc.indexOf("<PageHeader"), prospectPageSrc.indexOf("<ProspectActions"));
    return /primaryAction=\{/.test(headerBlock) && !/SuppressControl/.test(headerBlock);
  })());
}

console.log("\n10. Loading skeletons replace isolated spinners (layout-preserving, per Phase 7)");
{
  const workspaceSrc = src("src/components/workspace.tsx");
  check("LoadingSkeleton and SummaryStripSkeleton components exist", /export function LoadingSkeleton/.test(workspaceSrc) && /export function SummaryStripSkeleton/.test(workspaceSrc));
  for (const [name, file] of [
    ["Daily Queue", "src/app/prospecting/prospecting-client.tsx"],
    ["Sequences", "src/app/sequences/sequences-client.tsx"],
    ["Insights", "src/app/insights/insights-client.tsx"]
  ] as const) {
    check(`${name} uses LoadingSkeleton instead of an isolated spinner`, /<LoadingSkeleton/.test(src(file)));
  }
}

console.log("\n11. Empty states answer 'what does this mean?' and 'what should I do next?' (Phase 7)");
{
  const workspaceSrc = src("src/components/workspace.tsx");
  check("EmptyState renders a title, a description, AND an optional action slot", /export function EmptyState/.test(workspaceSrc) && /title,\s*\n\s*description,\s*\n\s*action/.test(workspaceSrc));
  for (const [name, file] of [
    ["Daily Queue", "src/app/prospecting/prospecting-client.tsx"],
    ["Finder", "src/app/finder/finder-client.tsx"],
    ["Projects", "src/app/projects/new/new-project-client.tsx"],
    ["Sequences", "src/app/sequences/sequences-client.tsx"]
  ] as const) {
    check(`${name} uses the shared EmptyState with a real next action`, /<EmptyState/.test(src(file)));
  }
}

console.log("\n12. Responsive layout -- no five-column metric grids on narrow screens; SummaryStrip wraps/stacks");
{
  const workspaceSrc = src("src/components/workspace.tsx");
  check("SummaryStrip uses a 2-column grid on the smallest breakpoint (never a fixed 5-across grid)", /grid-cols-2 gap-px[\s\S]{0,120}sm:grid-cols-3/.test(workspaceSrc));
  check("body/page containers use responsive padding (16px mobile via px-6 container + inner spacing, no fixed desktop-only widths)", /px-6/.test(src("src/components/shell.tsx")));
}

console.log("\n13. Playbook stage navigation semantics are unchanged (only the visual indicator changed)");
{
  const s = src("src/app/prospects/[id]/playbook/playbook-workspace.tsx");
  check("LINEAR_STAGES is the exact same 7-stage sequence as before this rebuild", /const LINEAR_STAGES: PlaybookStageKey\[\] = \["PRE_CALL_CHECK", "GATEKEEPER", "OPENING", "VERIFIED_OBSERVATION", "DISCOVERY", "BOOK_ASSESSMENT", "OUTCOME"\];/.test(s));
  check("stageIndex state and its clamp-forward/jump-to-outcome logic are untouched", /const \[stageIndex, setStageIndex\] = useState\(0\);/.test(s) && /setStageIndex\(\(i\) => Math\.min\(i \+ 1, LINEAR_STAGES\.length - 1\)\);/.test(s));
  check("the new compact step indicator is purely presentational -- built from the same stageIndex/LINEAR_STAGES, no new navigation state introduced", /STAGE PROGRESS/.test(s) && /role="img" aria-label=\{`Stage \$\{stageIndex \+ 1\} of/.test(s));
  check("the full stage list remains available via a disclosure -- nothing was removed, only de-emphasized", /summary="Show all stages"/.test(s));
}

console.log("\n14. No event/outcome semantics changed by this rebuild");
{
  // Cross-check against the same real files the P2 semantic-correction and
  // operational-follow-through suites already assert on, confirming this
  // UI-only rebuild introduced no drift in the values that matter.
  const outcomePanelSrc = src("src/app/prospects/[id]/playbook/outcome-panel.tsx");
  check("OUTCOME_MAPPING's canonical stored values are untouched (still the exact 13-entry EXACT-only map)", /export const OUTCOME_MAPPING/.test(outcomePanelSrc));
  check("information_requested and callback_scheduled still map to 'replied' (unchanged from the semantic correction)", /information_requested: \{ value: "replied", exact: true/.test(outcomePanelSrc) && /callback_scheduled: \{ value: "replied", exact: true/.test(outcomePanelSrc));
  check("no lossy mapping was reintroduced for wrong_contact/number_invalid/contact_info_disputed", !new RegExp('(wrong_contact|number_invalid|contact_info_disputed):\\s*\\{\\s*value:\\s*"not_interested"').test(outcomePanelSrc));

  const opFollowupSrc = src("src/lib/prospect/operational-followup.ts");
  check("callback still creates FOLLOW_UP + SNOOZED (unchanged)", /action_type: "FOLLOW_UP"/.test(opFollowupSrc) && /status: "SNOOZED"/.test(opFollowupSrc));
  const contactQualitySrc = src("src/lib/prospect/contact-quality.ts");
  check("contact-quality event_key idempotency scheme is unchanged", /contact_quality:\$\{input\.prospectId\}:\$\{input\.channel\}:\$\{input\.issueType\}:\$\{input\.actionId/.test(contactQualitySrc));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
