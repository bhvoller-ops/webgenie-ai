---
target: /projects/new (new-project-client.tsx)
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Projects\\webgenie-ai\\src\\app\\projects\\new\\new-project-client.tsx"
target_fingerprint: "sha256:e12644cfe82e3dd8ea8937b8ce832faa754f3816a0f0a99557b41a6f079f1439"
target_path: "C:\\Projects\\webgenie-ai\\src\\app\\projects\\new\\new-project-client.tsx"
timestamp: 2026-09-04T18-36-54Z
slug: src-app-projects-new-new-project-client-tsx
---
⚠️ DEGRADED: single-context, no live rendering (page requires an authenticated admin session; creating a test account or entering a password is not something this session does, per policy — confirmed via CLAUDE.md's own repeated history of the same constraint on this exact page). Method: single-pass code review of `new-project-client.tsx`, `page.tsx`, `project-card.tsx`, `industry-picker.tsx`, plus the `/api/projects/bulk` route, plus a detector CLI scan (no browser injection). Live verification limited to confirming the auth redirect (307 -> /login) for an unauthenticated request, which requires no credentials.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Spinner + disabled button while running, but no per-line progress across up to 25 concurrent lookups |
| 2 | Match Between System & Real World | 4 | Plain language throughout ("Ready for outreach," "Now analyzing") |
| 3 | User Control & Freedom | 3 | No way to clear a completed run's results without starting a new one |
| 4 | Consistency & Standards | 2 | Manual-entry form uses `bg-white text-slate-950` + dark-canvas inputs — the same off-system drift already fixed twice elsewhere this session |
| 5 | Error Prevention | 2 | Pasting >25 lines has zero client-side warning; server just rejects the whole request |
| 6 | Recognition Rather Than Recall | 4 | Searchable, categorized industry picker; nothing hidden |
| 7 | Flexibility & Efficiency | 3 | The bulk-paste flow itself is a real efficiency win; no other shortcuts |
| 8 | Aesthetic & Minimalist Design | 4 | Clean, well-organized sections, no clutter |
| 9 | Error Recovery | 2 | Per-line failures (notFound/skipped) get specific reasons — good; the >25-line case returns a bare "Invalid request." that names nothing |
| 10 | Help and Documentation | 3 | Self-explanatory for its target user; no dedicated help, doesn't obviously need it |
| **Total** | | **30/40** | **Good (75%)** |

## Design Specificity Verdict

This page is genuinely built for this product's actual workflow — the demo-site preview iframes, the SMS-to-prospect deep link with real pre-filled copy ("Hi, this is Cassey..."), and the notFound/skipped per-line reasoning all reflect real product mechanics, not a generic CRUD form. The manual-entry fallback form is the one place that reads as bolted-on: raw `slate-*` Tailwind instead of the app's own tokens, the exact pattern already found and fixed on the auth pages this session.

**Deterministic scan** (code only, no browser): 16 `design-system-font-size` findings across just these 4 files (10px/12px/12.5px/15px, none matching `DESIGN.md`'s documented 5-step type scale). Given the volume in a small sample, this isn't file-local drift — it's evidence `DESIGN.md`'s Typography section, as written, under-documents the real granularity already in consistent use across the dashboard. Not fixed here; flagged as a documentation gap, not 16 separate bugs — see Minor Observations.

## Overall Impression

A functional, well-built page with one real structural surprise: the exact kicker-above-heading pattern already banned and fixed twice this session (homepage, generated sites) turns out to be **built into the shared `SectionHeading` component itself**, and is live on 13 pages across the entire dashboard — this file is just one of them. That's the most important thing this pass found, and it's bigger than this page.

## What's Working

- The demo-site preview iframes (real `/api/demo-site` pages, scaled down) let an operator judge quality without leaving the page — a genuinely useful, non-generic feature.
- The SMS deep link pre-fills real, specific copy in Cassey's own voice, not a placeholder — built for the actual outreach workflow, not a generic "share" button.
- Per-line failure handling (notFound vs. skipped, each with its own reason) means a bad line never silently vanishes or blocks the rest of the batch.

## Priority Issues

**[P1] The exact kicker-above-heading ban is built into the shared `SectionHeading` component and live on 13 pages, not just this one.**
Why it matters: `SectionHeading`'s optional `eyebrow` prop renders a small-caps label directly above its `<h2>` — the same pattern already removed from the homepage and the generated sites this session, per craft-floor's explicit ban ("no brief earns it back"). This file uses it once ("Workspace" above "Every project"), but the same prop is used with real content on `/calls`, `/leads`, `/settings/branding`, `/support`, `/samples`, `/gallery`, `/playbooks`, `/partners`, `/partners/portal`, `/trial/portal`, `/admin/support`, and a projects report page — 13 files total.
Fix: Remove the `eyebrow` prop/rendering from `SectionHeading` (matching what was already done to the homepage's `SectionIntro`), and drop the prop from all 13 call sites. This is real cross-cutting work, not a one-line fix — flagging for a decision rather than doing it unprompted.
Suggested command: /impeccable polish (sitewide sweep)

**[P1] Pasting more than 25 lines fails with no client-side warning and an uninformative server error.**
Why it matters: `/api/projects/bulk`'s Zod schema (`z.array(z.string()).min(1).max(25)`) rejects the whole request outright at 26+ lines, and the route's catch-all returns `{ error: "Invalid request." }` — it never says what's wrong or how to fix it. The client never checks `lineCount` against 25 before submitting. A user who pastes a long list gets a generic failure with no path to understanding why.
Fix: Disable/warn client-side once `lineCount > 25` (the label already says "up to 25" — make it enforce that, not just state it); if the server path is ever hit anyway, name the actual problem ("Only 25 businesses per batch — you pasted N.").
Suggested command: /impeccable harden

**[P1] The manual project-creation form is visually off-system — the same drift already fixed twice elsewhere this session.**
Why it matters: line ~520's submit button is `bg-white text-slate-950` (raw Tailwind, not `iris`/`ink`), and its four inputs use `bg-canvas` with `border-hairline` — a third, undocumented input treatment, different from both the app's `iris` action-button convention and the `white-fill` input convention `DESIGN.md` documents as the real, confirmed pattern used everywhere else (auth pages, `ChangePasswordForm`, `NewTrialForm`).
Fix: Swap the button to the shared `Button` component (`variant="primary"`); bring the four inputs onto the documented white-fill convention.
Suggested command: /impeccable polish

**[P2] "Every project" has no pagination, unlike every other list in the dashboard.**
Why it matters: `/calls`, `/leads`, and `/partners` all use the shared `Pagination` component (added specifically because unbounded lists were a real problem, per project history). This page's project grid (`projects.map(...)`) has no page-size limit at all — it will render every project in the workspace on one page, growing unbounded as the workspace does.
Fix: Apply the same `Pagination` component and page-slicing pattern already used on the other three lists.
Suggested command: /impeccable optimize

**[P3] `DESIGN.md`'s documented type scale (5 named roles) doesn't cover the real granularity in active, consistent use across the dashboard.**
Why it matters: 16 arbitrary `text-[Npx]` findings turned up in just 4 files — 10/12/12.5/15px, none matching the documented Display/Headline/Title/Body/Label steps. This almost certainly repeats across the rest of the dashboard. Treating each instance as a bug to fix would mean flattening real, functional hierarchy (primary body vs. secondary meta vs. tertiary caption text) into 5 steps that don't actually capture it — the more honest fix is documenting the real scale, the same correction already made once this session to `DESIGN.md`'s Inputs section.
Suggested command: /impeccable document (refresh the Typography section against real usage)

## Minor Observations

- Same `maskImage:"...,#000,..."` alpha-mask pattern already confirmed as a false positive on the homepage appears again here (line 136) — same reasoning applies; needs the same scoped ignore, not a fix.
- No "clear results" affordance after a run completes — starting a new paste is the only way to reset the view.
- The `<select>` for "Primary goal" in the manual form shares the same off-system styling as its sibling inputs — covered by the same P1 fix above.

## Questions to Consider

- Since the kicker pattern turns out to be a shared-component default rather than scattered drift, is there a reason it was chosen deliberately (a consistent page-header identity) that's worth preserving in a different, non-banned form — or was it simply never reconsidered since `SectionHeading` was first written?
- Now that three different corners of the app (auth pages, this manual form, and presumably others) have independently drifted to raw `slate-*` Tailwind, is that a sign the actual convention needs to be easier to reach for than it currently is — e.g., a documented snippet or a second shared form-input component?
