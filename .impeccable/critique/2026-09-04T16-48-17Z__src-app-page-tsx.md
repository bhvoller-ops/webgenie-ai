---
target: homepage (/)
total_score: 16
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 3
p1_count: 2
target_identity: "file:C:\\Projects\\webgenie-ai\\src\\app\\page.tsx"
target_fingerprint: "sha256:34c9282b21fa2340b2761ce44796797a3d659b92bf90fbf417c245c06c1fd0a6"
target_path: "C:\\Projects\\webgenie-ai\\src\\app\\page.tsx"
timestamp: 2026-09-04T16-48-17Z
slug: src-app-page-tsx
closed: true
---
Method: dual-agent (A: design review · B: detector + live-browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Static page, little to show; nav open/close states correctly signaled |
| 2 | Match Between System & Real World | 2 | Engineering vocabulary ("canonical artifact chain," "deterministic core") over buyer outcomes |
| 3 | User Control & Freedom | 3 | Low-commitment path ("See a sample site") isn't repeated near the closing CTA |
| 4 | Consistency & Standards | 2 | Hero gradient spends `neon` decoratively — violates DESIGN.md's own One Accent, One Job Rule |
| 5 | Error Prevention | n/a | No form or destructive action on this page |
| 6 | Recognition Rather Than Recall | 3 | CTA copy repeats verbatim; nav plainly labeled |
| 7 | Flexibility & Efficiency | n/a | Persuade-mode page |
| 8 | Aesthetic & Minimalist Design | 3 | Clean overall, but the 6-card grid gives equal weight to core and peripheral features |
| 9 | Error Recovery | n/a | No error state exists to evaluate |
| 10 | Help & Documentation | n/a | Persuade-mode page |
| **Total** | | **16/24** | **Acceptable (67%)** |

## Design Specificity Verdict

**LLM assessment:** More specific in copy than in composition. The page names real mechanics (Find→Score→Blueprint→Package, "11 scoring modules," four real destination tools) that a generic template couldn't say — but the shape (gradient hero, two CTAs, a 4-card process grid, a 6-card feature grid, a closing CTA panel) is an interchangeable SaaS-landing skeleton. Specificity lives in the words, not the structure.

**Deterministic scan:** 3 CLI findings (design-system-color x2 at lines 63 & 189 — raw #000 in a maskImage, outside the DESIGN.md palette; design-system-font-size x1 at line 73 — text-[15px] off the type ramp). Minor, real token drift.

The live-detector overlay (57 matched elements, confirmed actually injected and rendered) independently corroborates the LLM's genericness verdict from a different angle: gpt-thin-border-wide-shadow fired on both .panel sections (thin border + 60px soft shadow is a recognized generic-AI-design signature), and icon-tile-stack fired on all 10 of the page's content cards (the 4-stage pipeline and the 6-feature grid) — the exact craft-floor-banned pattern ("same-size cards of icon + heading + text as the page structure... cards are the lazy container"). This is the strongest single finding in this critique: two independent methods, working blind to each other, converged on "this page's structure is a template."

**Likely false positives:** low-contrast (4.3:1 vs. 4.5:1) may pass AA for large/bold button text at the 3:1 large-text threshold — confirm manually. ai-color-palette's raw count (~30 of 57 findings) is inflated by firing once per SVG sub-path inside each icon rather than once per icon (really ~7 distinct instances).

## Overall Impression

The copy is disciplined and honest — no fabricated proof, real mechanism-level specificity — but the page is built almost entirely from one repeated shape (icon-tile card, 10 times) and spends its one expressive move (the gradient headline) on a generic phrase rather than the product's actual differentiator. And the page never states what a visitor is actually signing up for: no price, no trial length, nothing about what happens after "free."

## What's Working

- Zero fabricated social proof. No logos, star ratings, or "trusted by" claims — a real, disciplined restraint most landing pages fail, directly honoring PRODUCT.md's explicit ban on inventing evidence.
- Mechanism-level specificity in the copy. "Find→Score→Blueprint→Package" maps to the real engine stages and names four real AI tools by name instead of "AI-powered" vagueness.
- Consistent component reuse. Panel/Card/Button/Pill are pulled from the real design system throughout — nothing looks bolted on.

## Priority Issues

**[P0] The hero's gradient headline breaks the system's own accent rule — and is a flagged anti-pattern independently.**
Why it matters: .gradient-text blends white -> iris-soft -> neon-soft purely for decoration on "Find the clients." DESIGN.md's One Accent, One Job Rule says neon means "this is data" and explicitly warns against a third general-purpose accent. The detector flags the identical element for two separate reasons (gradient-text — a hard craft-floor ban — and ai-color-palette). Repeated identically on /finder and /audit — systemic, not a typo.
Fix: Keep the gradient inside iris's own tonal range (white -> iris-soft -> iris), or drop the gradient and use weight/size for emphasis.
Suggested command: /impeccable polish

**[P0] Ten of the page's content blocks are the same icon-tile card, used as the entire page structure.**
Why it matters: The 4-stage pipeline and the 6-feature grid both use identical icon-badge + h3 + body cards. Craft-floor's explicit banned scaffold ("cards are the lazy container"), confirmed by the detector's icon-tile-stack firing 10 times, and independently reached by the LLM review's cognitive-load check (4 of 8 items failed) and its Casey persona walkthrough.
Fix: Break the sameness — lead with Prospect Finder + Site Generator at larger visual weight, demote or fold the other 4; give the 4-stage pipeline a different, more sequential treatment than the feature grid.
Suggested command: /impeccable distill

**[P0] Pricing and trial terms appear nowhere on the one page whose job is conversion.**
Why it matters: "Free to start, no credit card" is the only monetary claim anywhere. It never states the 7-day trial or the $297/mo price. A real signup hits /trial-expired exactly 7 days later with no self-serve upgrade path. A visitor who reads this as free-forever hits an unexplained wall a week in — reproducing, post-signup, the exact real customer complaint this page exists to fix.
Fix: State the trial length and post-trial price near the CTA.
Suggested command: /impeccable clarify

**[P1] "How it works" and "One workspace" both use a kicker-above-heading — a hard, explicit ban.**
Why it matters: craft-floor: "A kicker or eyebrow above a heading. This one is a ban, not a default: no brief earns it back." The detector confirms it fires on both sections. This is the exact pattern just removed from /login, /signup, /forgot-password, /reset-password earlier this session — the homepage is now the odd one out.
Fix: Delete the eyebrow line in SectionIntro; let the h2 carry the weight alone.
Suggested command: /impeccable polish

**[P1] Primary CTA button contrast measures 4.3:1, under the 4.5:1 AA threshold for normal text.**
Why it matters: White text on #7C5CFF (iris), on both primary CTAs (hero and closing). May legitimately pass AA at the 3:1 large/bold-text threshold; flagged as needing manual confirmation rather than an automatic fail.
Fix: Verify against actual button font-size/weight; if it fails, darken to iris-deep or use a heavier weight.
Suggested command: /impeccable audit

## Persona Red Flags

**Jordan (skeptical, scans fast):** "Find the clients other agencies miss" is an unsupported superiority claim with zero evidence directly under the fold. "Free to start, no credit card" with no trial length disclosed, and no pricing page linked anywhere in nav — Jordan assumes a catch and has no way to go verify it.

**Casey (visually-driven, judges credibility from polish):** The 6-card grid uses one identical neon icon-badge shape for every item with no imagery — flat and templated exactly where she needs to feel something, right before the ask. No actual preview of a generated demo site appears on the homepage itself; "See a sample site" forces her off the funnel just to judge if the product is real. The gradient headline — the page's single most expressive move — is spent on "Find the clients" instead of the one differentiated idea.

**Sam (solo agency operator — the real target audience per PRODUCT.md):** Nothing states what happens right after "Get started free" — PRODUCT.md confirms it's instant full access with no payment gate, but the page never says so, reproducing the documented "why/who" gap at the exact moment it should be resolved. Complete absence of any price reads as either "toy" or "hiding something" at the moment she's asked for an email and password.

## Minor Observations

- PRODUCT.md's own stated differentiator — a finished demo site built from the prospect's real name/photos before any sales call — never appears on the page at all; it stays at the process level. Worth a line naming the actual pitch. (/impeccable bolder)
- "Get started free" repeats identically 3x (nav, hero, closing) with no variation, compounding the pricing-opacity issue.
- Raw #000 (lines 63, 189) and text-[15px] (line 73) are minor DESIGN.md token drift — low severity, cheap to fix in the same pass.
- dark-glow fired on the logo and both CTAs — but this is exactly where DESIGN.md's Signal-Only Glow Rule says glow belongs. Read this as confirmation the rule is being followed correctly, not a defect.
- Mobile viewport (verified at real 390x844) wraps cleanly, no overflow.

## Questions to Consider

- What if the CTA named a concrete first output ("See your first 5 prospects free") instead of the generic "Get started free" — would the free claim feel earned rather than hollow?
- What if the page opened with the actual sales line ("I noticed you don't have a website, so I built you one") instead of a competitive tagline?
