---
target: generated demo sites (lib/sitegen/generate.ts)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Projects\\webgenie-ai\\src\\lib\\sitegen\\generate.ts"
target_fingerprint: "sha256:d94ae8d05c4e3f948a75f9623c2485aabb9b0776c1e3ae266973879c5a9b328d"
target_path: "C:\\Projects\\webgenie-ai\\src\\lib\\sitegen\\generate.ts"
timestamp: 2026-09-04T17-24-21Z
slug: src-lib-sitegen-generate-ts
---
Method: dual-agent (A: design review across 3 live generated sites · B: detector + live-browser evidence across the same 3 sites)

Scope note: this critique covers `lib/sitegen/generate.ts` and its 14 hand-written industries (the original Plumber/HVAC/Dentist/etc. set). The 59 Gallery-sourced industries render through a separate file (`gallery-site.ts`/`renderIndustryPage`) not reviewed here.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Lead form shows Sending -> confirmation/error; no loading state on hero photo |
| 2 | Match Between System & Real World | 2 | "Professional {label} services for homes and businesses" doesn't match non-trade industries (dentist, salon, med spa...) |
| 3 | User Control & Freedom | 3 | Phone CTA, anchor links, closable chat panel all present |
| 4 | Consistency & Standards | 4 | Identical, disciplined component patterns across every industry inspected |
| 5 | Error Prevention | 3 | Name+phone required client-side; no format hint before server-side email validation |
| 6 | Recognition Rather Than Recall | 4 | Sticky header + mobile call bar keep the one action always visible |
| 7 | Flexibility & Efficiency | n/a | Single-visit marketing page, no power-user path needed |
| 8 | Aesthetic & Minimalist Design | 3 | Clean per-section, but hero crams badge+h1+sub+2 buttons+3 chips+rating+form into one view |
| 9 | Error Recovery | 2 | Lead-form fallback message is fine; but the badge/button contrast gap is a design-level error the user can't work around |
| 10 | Help & Documentation | n/a | Not applicable to a single-visit local-business site |
| **Total** | | **24/32** | **Good (75%)** |

## Design Specificity Verdict

**LLM assessment:** Real per-industry investment exists and isn't lazy — brand color, hero/secondary photos, 6 service names+blurbs, trust points, and FAQ are all genuinely written per industry (confirmed by direct comparison: Plumber's "Bond repair, gloss, and smoothing treatments" vs. a dentist's dental-anxiety-specific FAQ answer). But one line breaks the illusion identically everywhere it's wrong: `generate.ts`'s Services-section dek is a single hardcoded template — `Professional ${label} services for homes and businesses across ${city}.` Confirmed rendering verbatim as "Professional dental practice services for homes and businesses across Raleigh, NC" and "...hair salon services for homes and businesses..." — neither serves "businesses." This is the exact "same shape, nouns swapped" tell, and it sits in the second thing a visitor reads.

**Deterministic scan:** CLI scan against `generate.ts` returned 76 findings, but **73 of 76 are structurally false positives** — the detector compared this file's literal CSS values against `DESIGN.md`, which documents the unrelated dark dashboard system. Generated client sites are a deliberately separate, undocumented light-theme system (per `CLAUDE.md` §6 — confirmed correctly, not assumed). The 3 real CLI findings (2x overused-font, 1x codex-grid-background) plus the live-browser detector's per-site scan (19-21 findings/site) are the real evidence — see Priority Issues.

**Live overlay across 3 sites (Plumber, Dentist, Salon):** confirmed injected and rendered, not just logged. Shared findings present identically on all 3 (systemic, generator-wide): `overused-font` (Inter, 91%), `codex-grid-background` (hero grid overlay), `tiny-text` (11.52px privacy note), `gpt-thin-border-wide-shadow` (chat widget), `kicker-above-heading` x5 per site, `dark-glow` (header CTA), `low-contrast` x2, `line-length` x7-8. One per-industry-only finding: `ai-color-palette` on Dentist's teal/cyan gradient (Plumber/Salon don't trigger it — a brand-color choice, not a generator defect).

**Likely false positive, confirmed by direct code read:** the `.imgband` caption's "1.0:1 white-on-white" flag is wrong — its background is `linear-gradient(0deg,rgba(15,23,42,.75),transparent)` (`generate.ts:253`), not a solid color; the checker's background-resolution falls through the gradient. Visually legible in every screenshot.

## Overall Impression

This is a real, disciplined generator, not a mail-merge — the per-industry investment (photos, copy, trust points, FAQ) is genuine and the reviews section makes the right call (an honest aggregate sentence, never a fabricated quote, matching PRODUCT.md's evidence-only rule). But one hardcoded line undermines the pitch specifically on medical/personal-care industries, and a missing text-shadow on two hero elements creates a real first-impression risk on any bright photo — both are one-line-scale fixes with outsized impact, since this page IS the sales pitch.

## What's Working

- The reviews section turns a real rating/count into an honest aggregate sentence instead of inventing a testimonial — the correct solution to PRODUCT.md's evidence-only constraint, not a corner cut.
- The lead-capture form is a well-built conversion object: minimal fields (name+phone only), clear framing, disabled-state + inline success/error feedback, honest privacy note.
- Consistent, predictable information architecture across every industry inspected — genuinely supports the documented 2-minute pre-call review workflow.

## Priority Issues

**[P0] The Services-section dek is a single hardcoded line that's factually wrong for non-trade industries.**
Why it matters: `generate.ts:385-387` — "Professional {label} services for homes and businesses across {city}." A dentist, salon, med spa, or chiropractor doesn't serve "homes and businesses." Confirmed rendering verbatim on Dentist and Salon. This is the highest-visibility "same template, nouns swapped" tell in the product, on the exact medical/personal-care industries where credibility matters most.
Fix: Either drop the audience clause entirely ("Professional {label} services in {city}.") or add a per-industry audience field to `IndustryProfile`, same pattern already used for `emergency`/`schemaType`.
Suggested command: /impeccable clarify

**[P0] Hero badge and outline-button text have no contrast-guaranteeing background — risk of illegibility on bright photos.**
Why it matters: `.hero h1`, `.herosub`, and `.chips` all get `text-shadow` for legibility over the photo (`generate.ts:229-234`) — but `.badge` and `.btn-outline` (lines 226-228, 195-196) do not, and rely on a translucent-white fill (16%/border 28% opacity) with no shadow or solid backing. Confirmed via screenshot: on the Dentist site, "View Our Services" is nearly illegible against a bright dental-tool photo region — the first interactive element a skeptical prospect sees, on the exact page meant to prove "this is professional work."
Fix: Add text-shadow to `.badge`/`.btn-outline` matching the other hero text elements, or give both a solid/blurred dark backing independent of photo brightness.
Suggested command: /impeccable harden

**[P1] Kicker-above-heading appears 5x per generated site — the same hard ban already fixed twice elsewhere this session.**
Why it matters: `.eyebrow` precedes every section h2 (What We Do, How It Works, Why Choose Us, Reputation, Questions) — craft-floor: "no brief earns it back." Detector confirms it fires 5x on every one of the 3 sites tested. This is now the third surface in this codebase with the identical pattern (already removed from the auth pages and the homepage this session) — the generated sites are the one place it's still live, and it's the highest-reach instance since it appears on every generated site, every industry.
Fix: Remove the `.eyebrow` line above each h2; let the heading itself carry the section identity (e.g., "Our Services" alone, no "What We Do" kicker above it).
Suggested command: /impeccable polish

**[P1] Footer copyright text fails WCAG AA contrast (3.8:1, needs 4.5:1) — on every generated site.**
Why it matters: `.fbot{color:#64748B}` on `footer{background:#0F172A}` (generate.ts:298,302) — confirmed 3.8:1, and confirmed visually as genuinely faint, not overstated. Minor individually but present on every single site this generator has ever produced or will produce.
Fix: Lighten to a color that clears 4.5:1 against `#0F172A` (e.g. `#94A3B8`, already used elsewhere in the same footer for body text).
Suggested command: /impeccable audit

**[P2] On mobile, the hero rating pill collides with the fixed chat-widget launcher on first paint.**
Why it matters: at a real 390x844 viewport, `.herorating` (the review-count social proof) wraps and its second line sits behind `#wg-chat-launcher` (fixed, right:20px, bottom:78px at this breakpoint) — confirmed by direct screenshot, no scrolling needed. This swallows the one third-party trust signal on the hero, on the exact device a real prospect will open this on after a cold call.
Fix: Add spacing/padding to `.heroin` or `.herorating` at the `max-width:820px` breakpoint sized to clear the chat launcher's footprint.
Suggested command: /impeccable polish

## Persona Red Flags

**The prospect business owner** (e.g. the real dentist behind "Bright Smile Dental"), opening the link on a phone right after a cold call: their own name/phone in the header is a genuine trust signal that works. But "View Our Services" nearly disappearing into the hero photo reads as unfinished, not professional — directly undercutting "I built you one" in the first 5 seconds. "Professional dental practice services for homes and businesses" is a small but real "wait, is this actually about me?" moment right as they're deciding whether to trust it. Recovers well after that — the FAQ answers are genuinely written for the audience (e.g. dental-anxiety-specific reassurance), and the honest, non-fabricated reviews section lands well.

**The agency operator (Cassey)**, reviewing a freshly generated site for ~2 minutes before calling: the contrast gap is something a 2-minute skim would likely catch (visible in 3 seconds, no scrolling) — her review process is a working safety net for that class of defect. But the "for homes and businesses" line and the kicker pattern are things a single-site skim wouldn't surface — they only become visible by comparing multiple generated sites side by side, which her per-site workflow doesn't naturally do. That's exactly the gap this critique exists to close.

## Minor Observations

- Three "AI-genericness" signature patterns are present on every generated site: an Inter-only type system (91% of text), a faint dot-grid hero overlay (`.hero::after`), and the chat widget's thin-border+wide-shadow panel. Individually cosmetic, collectively a real contributor to "this looks templated" — worth a future `/impeccable typeset` or `/impeccable delight` pass, not urgent.
- An empty `business.address` renders an unconditional blank line in the footer (`generate.ts:530`) — every sample business has `address: ""`, so this is live today. Same conditional pattern already used for `business.hours`/`emergency` would fix it. (/impeccable polish)
- Several paragraph blocks (reviews copy, FAQ answers) aren't width-constrained to a comfortable reading measure, unlike the Services dek which already has an explicit `max-width:560px`. (/impeccable typeset)
- The `.imgband` caption's flagged "1.0:1" contrast is a false positive — see Design Specificity Verdict.
- Confirm the footer's "Site by WebGenie AI" line correctly swaps to the agency's own branding (`builtBy`) once white-labeled for a real client — the code already supports this (`options.builtBy`), just worth a real check before assuming it's live everywhere it should be.

## Questions to Consider

- What if the hero showed less at once — headline + one CTA + the form only, with trust chips/rating moved just below the fold — would the first 3 seconds become unambiguously strong instead of a coin-flip depending on that industry's photo brightness?
- What if a lightweight per-industry "who we serve" field existed on `IndustryProfile` (same pattern as `emergency`/`schemaType`), closing the "homes and businesses" gap and any future audience-mismatch line at the source, once, for every industry at once?
