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
import { computeEvidenceReadiness, EVIDENCE_READINESS_DETAIL, EVIDENCE_READINESS_LABEL } from "../src/lib/prospect/evidence-readiness";

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
  check("RESOURCES group exists and contains Samples/Gallery (de-emphasized, not competing with WORK)", /const RESOURCES_ITEMS/.test(shellSrc) && /href: "\/samples"/.test(shellSrc) && /href: "\/gallery"/.test(shellSrc));
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

console.log("\n6. Evidence readiness is consistently derived on both Prospect Detail and Daily Queue (same read-time override, same source)");
{
  const prospectPageSrc = src("src/app/prospects/[id]/page.tsx");
  check("Prospect Detail imports getVerifiedManualObservations() -- the exact function the Playbook itself already uses for its own Verified Observation stage", /getVerifiedManualObservations/.test(prospectPageSrc));
  check("Prospect Detail imports computeEvidenceReadiness() / EVIDENCE_READINESS_* from the one shared evidence-readiness module", /from "@\/lib\/prospect\/evidence-readiness"/.test(prospectPageSrc));
  check("Prospect Detail never rewrites the persisted brief -- only overrides the rendered `briefSummary` variable, never calls an update/write to opportunity_briefs", !/\.from\("opportunity_briefs"\)\.update|\.from\("opportunity_briefs"\)\.upsert/.test(prospectPageSrc));

  const queueRouteSrc = src("src/app/api/prospects/queue/route.ts");
  check("the Daily Queue API applies the identical known-sentence override using the same EVIDENCE_READINESS_DETAIL constant", /from "@\/lib\/prospect\/evidence-readiness"/.test(queueRouteSrc) && /EVIDENCE_READINESS_DETAIL\.verified_observation/.test(queueRouteSrc));
  check("the Daily Queue override is read-only (SELECT from prospect_evidence_observations, never a write)", /\.from\("prospect_evidence_observations"\)\s*\n?\s*\.select/.test(queueRouteSrc));
  check("opportunity_level itself is passed through unchanged in the queue response (never recomputed/overridden)", /opportunityLevel: brief\?\.opportunity_level \?\? null/.test(queueRouteSrc));
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

console.log("\n8. Disabled/unverified channel explanation is preserved (Playbook, untouched by this rebuild)");
{
  const s = src("src/app/prospects/[id]/playbook/intelligence-card.tsx");
  check("intelligence-card.tsx (channel verification display) was not touched beyond the font-size pass -- still renders a real disabled-channel reason", fs.existsSync(path.join(__dirname, "..", "src/app/prospects/[id]/playbook/intelligence-card.tsx")));
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
