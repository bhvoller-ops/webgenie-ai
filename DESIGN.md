---
name: WebGenie AI — Dashboard
description: The Intelligence Console — a dark, glow-accented instrument panel for finding, scoring, and closing local-business prospects.
colors:
  void: "#05060A"
  canvas: "#080A11"
  surface: "#0D1018"
  raised: "#12161F"
  hairline: "#1C212D"
  ink: "#EAEEF7"
  muted: "#8E97AC"
  faint: "#5A6377"
  iris: "#7C5CFF"
  iris-soft: "#9B85FF"
  iris-deep: "#4A2FD6"
  neon: "#22D3EE"
  neon-soft: "#67E8F9"
  signal-good: "#34D399"
  signal-warn: "#FBBF24"
  signal-bad: "#F87171"
  signal-info: "#60A5FA"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  caption-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "24px"
  xl: "40px"
  container: "1400px"
components:
  button-primary:
    backgroundColor: "{colors.iris-deep}"
    textColor: "#FFFFFF"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.iris-deep}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "32px"
  pill:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: WebGenie AI — Dashboard

## Overview

**Creative North Star: "The Intelligence Console"**

This is a mission-control read on real business data, not a generic SaaS
admin theme. The canvas is near-black (`void`, #05060A) with two faint
radial glows fixed in the upper corners — the only ambient light source on
an otherwise flat, quiet field. Surfaces are separated by hairline borders
and light backdrop blur rather than drop shadows; nothing here pretends to
float above a desk. Color is spent deliberately: a single violet accent
(`iris`) carries every primary action, and a single cyan (`neon`) is
reserved specifically for data and metadata — never for decoration. Glow
(the `shadow-glow`/`shadow-cyan` tokens, and the Gaussian-blur filter on the
score ring's arc) marks *real signal* — a primary action, a live score — and
appears nowhere else. Every number, ID, URL, and score sets in JetBrains
Mono, so the eye can tell "measured fact" from "written copy" at a glance
before reading either.

This system exists to make an evidence-traced audit *look* evidence-traced:
the Evidence List component is a citation, not a bullet point — source type,
linked host, and confidence weight, all in mono, before the human-readable
detail. The console reads instruments; it does not decorate.

This is the internal dashboard's system only. Generated client websites are
a deliberately separate, light-themed world (see PRODUCT.md) — never pull
these tokens into one.

**Key Characteristics:**
- Near-black flat canvas with two fixed ambient glows, never a busy background
- One accent for action (iris), one accent for data (neon), both used sparingly
- Hairline borders + blur define surfaces; shadows are reserved for real signal
- JetBrains Mono for every number, ID, URL, and score — no exceptions
- Semantic color (good/warn/bad/info) always follows the same tint formula, never a solid fill

## Colors

Two accents, spent narrowly by role, on a near-black neutral scale; semantic status color follows its own consistent tint formula rather than ad hoc shades.

### Primary
- **Iris Violet** (`#7C5CFF`): the one primary-action color — buttons, the focus ring, the logo mark, links inside prose. `iris-soft` (`#9B85FF`) is its hover state; `iris-deep` (`#4A2FD6`) is its darkest step, used in the logo's gradient and deep accent fills.

### Secondary
- **Signal Cyan** (`#22D3EE`): reserved specifically for data and metadata — evidence-type tags, the "live Google data" badge, anything that says "this is a measured fact." Never used for a generic call to action. `neon-soft` (`#67E8F9`) is its lighter step, used for small mono labels on a tinted background.

### Tertiary — Status Signal
- **Signal Good** (`#34D399`): strong scores, healthy states, "strengths" list markers.
- **Signal Warn** (`#FBBF24`): weak/borderline scores, caution states.
- **Signal Bad** (`#F87171`): critical scores, failures, "weaknesses" list markers.
- **Signal Info** (`#60A5FA`): fair/neutral-informative scores and states.

### Neutral
- **Void** (`#05060A`): the page background — the darkest surface in the system.
- **Canvas** (`#080A11`): one step up from void; used for recessed inset areas like evidence-card backgrounds.
- **Surface** (`#0D1018`): the default card/panel background, always used at partial opacity (60–70%) over the void canvas so the ambient glow reads through.
- **Raised** (`#12161F`): the lightest neutral surface — secondary buttons, pill backgrounds, hover states, table header cells.
- **Hairline** (`#1C212D`): the single border color used everywhere a surface needs an edge instead of a shadow.
- **Ink** (`#EAEEF7`): primary text.
- **Muted** (`#8E97AC`): secondary text — descriptions, nav labels at rest.
- **Faint** (`#5A6377`): tertiary text — hints, timestamps, label-row text.

### Named Rules
**The Tint Formula Rule.** Every semantic color (iris, neon, and all four signal colors) appears as a pill/badge in exactly one shape: ~30%-opacity border, ~10%-opacity background, full-strength text. A solid fill is reserved for the primary button and the score ring/bar only — nothing else gets a solid semantic fill.

**The One Accent, One Job Rule.** Iris means "act on this." Neon means "this is data." Don't swap their roles or introduce a third general-purpose brand accent.

## Typography

**Body/UI Font:** Inter (with system-ui, -apple-system fallback)
**Data/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular fallback)

**Character:** Inter carries every word a human wrote; JetBrains Mono carries every value the system measured. The pairing is the console's core legibility trick — you can tell fact from prose without reading either.

### Hierarchy
- **Display** (600, `clamp(3rem, 7vw, 5.5rem)`, line-height 0.95, tracking -0.04em): hero-scale headlines on marketing/landing surfaces only.
- **Headline** (600, `clamp(1.75rem, 3vw, 2.5rem)`, line-height 1.1, tracking -0.03em): section headings inside the dashboard (`SectionHeading`'s `<h2>`).
- **Title** (600, 14px, line-height 1.3): card and component headers — module names, nav item labels, button labels.
- **Body** (400, 13.5px, line-height 1.6, set in `muted`): descriptions, paragraph copy, list items.
- **Label** (600, 11px, uppercase, tracking 0.18em, set in `faint`): strengths/weaknesses headers, table column labels, form field labels. Never above a section `<h2>` as a kicker — see Do's and Don'ts.
- **Caption** (400, 12px, line-height 1.5, set in `muted`/`faint`): the dashboard's real default for secondary detail text — card metadata, list-item subtext, helper copy under a control. This is the single most common text size in the app and was missing from earlier versions of this file; it is not a violation, it is the documented default.
- **Caption Large** (400, 12.5px): a marginally larger caption step used for slightly more prominent secondary text (e.g. helper copy directly under a primary input).
- **Micro** (500, 10px, line-height 1): the smallest step — inline badges, a stat's unit label, a timestamp squeezed into a tight row. Use sparingly; below this, use an icon or omit rather than shrinking further.

### Named Rules
**The Monospace Numbers Rule.** Every number, ID, URL, and score sets in JetBrains Mono — including inline inside an otherwise-Inter sentence. This is a hard project rule (see PRODUCT.md's design tokens), not a stylistic default: a stray sans-serif digit reads as a typo in this system, not a style choice.

## Layout

Content is capped at a **1400px** container (`max-w-[1400px]`), horizontally padded 24px (`px-6`), with generous 40px vertical rhythm between major page sections (`py-10` on `<main>`). The header is a sticky, translucent bar (`void` at 75% opacity + heavy backdrop blur) fixed at 64px tall, so the console's background glow stays visible even while scrolling under it.

Grids favor a **hairline-seam** technique over gutters: `MetaRow`'s stat grid sets a 1px gap filled with the `hairline` color between cells, so adjoining data cells read as one continuous instrument strip rather than separate floating cards. Card grids elsewhere use a conventional 20px (`gap-5`) gutter. Two-column layouts collapse to one column below the small breakpoint throughout.

## Elevation & Depth

Flat-by-default with layered blur, not drop-shadow elevation. Cards and panels are distinguished from the void canvas by a hairline border and partial-opacity surface color with backdrop blur — not by a shadow implying they float above the page. `boxShadow` tokens exist for exactly three roles, all meaning-carrying rather than decorative: `panel` (a near-invisible inset highlight + very soft ambient shadow, used only on the largest containers), `glow` (a violet halo, reserved for the primary button and the logo mark), and `cyan` (the same halo in signal cyan, reserved for cyan-accented UI). The score ring goes further and applies an SVG Gaussian-blur filter directly to its progress arc — glow as a literal "this is live and measured" cue, not ambient lighting.

### Shadow Vocabulary
- **Panel** (`0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.9)`): the largest containers only (`.panel`).
- **Glow** (`0 0 0 1px rgba(124,92,255,0.35), 0 0 48px -12px rgba(124,92,255,0.55)`): the primary button and the logo mark — signals "the one thing to click."
- **Cyan** (`0 0 0 1px rgba(34,211,238,0.3), 0 0 40px -14px rgba(34,211,238,0.5)`): cyan-accented elements needing the same halo treatment.

### Named Rules
**The Signal-Only Glow Rule.** Glow never means "this is important content." It means "this is live, active, or the one recommended action." A card full of real evidence gets a hairline border, not a glow — reserve glow for the score ring, the primary CTA, and comparable live-state indicators.

## Shapes

A soft, generous corner language, scaled by container size rather than one universal radius: **8px** (`rounded-lg`) for small interactive chrome — nav links, icon containers, form inputs; **12px** (`rounded-xl`) for buttons; **18px** (`rounded-card`) for cards; **24px** (`rounded-panel`) for full page-section panels; and **full/pill** (`rounded-full`) for badges, tags, the score-bar track, and the logo mark. Borders are uniformly 1px `hairline` — no heavier decorative borders anywhere in the system.

## Components

### Buttons
- **Shape:** 12px radius (`rounded-xl`), `px-4 py-2.5`, 14px medium-weight label, 200ms all-property transition.
- **Primary:** solid `iris-deep` background, white text, the `glow` shadow permanently applied (not just on hover) — hover darkens (`brightness-90`) rather than lightens, both for feedback and because white-on-`iris` alone measured 4.35:1, under the 4.5:1 AA threshold at this text size; `iris-deep` clears AAA at 7.87:1.
- **Secondary:** `raised` background with a `hairline` border and `ink` text; hover tints the border toward `iris` at 50% opacity.
- **Ghost:** transparent, `muted` text; hover fills `raised` and brightens text to `ink`.
- All three route through one `focus-ring` utility: a 2px `iris` ring at 70% opacity on `:focus-visible`, no default browser outline.

### Pills / Badges
- **Style:** `rounded-full`, 1px border, `px-2.5 py-1`, 11px medium text, built from one of seven tone keys (neutral/iris/neon/good/warn/bad/info) — every tone follows the Tint Formula Rule (30% border / 10% background / full-strength text).

### Cards / Containers
- **Cards** (`.card`): 18px radius, `hairline` border, `surface` background at 60% opacity, `backdrop-blur-md`, **no shadow** — deliberately flat/glass. Default internal padding 20px (`p-5`).
- **Panels** (`.panel`): 24px radius, `hairline` border, `surface` background at 70% opacity, `backdrop-blur-xl`, plus the `panel` shadow. Internal padding 24–32px (`p-6 sm:p-8`). One step "heavier" than a card — used for full page sections, not list items.

### Inputs / Fields
- **Style:** a deliberate exception to the dark palette — text inputs are white-filled (`bg-white`), not dark-on-dark, for legibility of typed text and native form-control contrast. 8px radius (`rounded-lg`), 1px `hairline` border, `px-3 py-2`, 13px text in `slate-900` (not `ink` — this is the one place off-palette dark text is correct, since it sits on a white fill) with `slate-400` placeholder text.
- **Focus:** the standard `focus-ring` treatment (2px `iris` ring at 70% opacity) — same as every other interactive element, even though the fill itself is off-palette.
- **Confirmed convention**, not an invented one — this exact pattern is used consistently wherever the app has a themed input (`ChangePasswordForm`, `NewTrialForm`, and now the full auth family).

### Navigation
- **Style:** sticky, translucent `void/75` bar with `backdrop-blur-xl`, 64px tall, `hairline` bottom border, content capped at 1400px.
- **Links:** 14px `muted` text, `rounded-lg` hover state filling `raised` with `ink` text.
- **Admin grouping:** related destinations (Prospector, Dashboard) render as icon + title + one-line-description card grids inside a dropdown (`NavGroup`), not a bare link list — every nav destination explains itself before it's clicked.

### Score Ring / Score Bar (signature component)
The product's visual signature, and the literal expression of "evidence-traced, not invented" (see PRODUCT.md). An SVG circular progress ring, rotated to start at 12 o'clock, whose stroke color is driven entirely by the score's semantic band (critical→`signal-bad`, weak→`signal-warn`, fair→`signal-info`, strong→`signal-good`). A gradient fill plus a Gaussian-blur filter glows the arc itself — the only place in the system glow is generated procedurally rather than via a shadow token. The center shows the score as a large JetBrains Mono number that count-up-animates on mount with a cubic-bezier ease. `ScoreBar` is the same band-color logic flattened into a 6px horizontal track with a matching colored glow, used inline inside module cards.

### Evidence List (signature component)
A citation-styled list item, not a plain bullet: a mono, uppercase evidence-type tag tinted `neon-soft`; a linked source host in mono with a link icon; a right-aligned mono confidence weight; then the human-readable detail text below, in muted body copy. Sits on a `canvas`-tinted, hairline-bordered card. This component is where the product's "don't invent, trace to evidence" principle becomes literally visible.

### Module Card (accordion)
Closed state shows the module title, band label + confidence percentage, the mono score, and a `ScoreBar`. Opening (an `animate-fade-up` reveal) exposes two columns of strengths/weaknesses — each line prefixed with a small `+`/`–` icon in `signal-good`/`signal-bad` — followed by a stack of recommendation cards.

## Do's and Don'ts

### Do:
- **Do** reserve glow (`shadow-glow`/`shadow-cyan`, or the score ring's blur filter) for elements carrying real, live signal — never as generic hover decoration on an ordinary card.
- **Do** build every semantic color as border/background/text per the Tint Formula Rule; never introduce a solid semantic fill outside the primary button and the score indicators.
- **Do** set every number, ID, URL, and score in JetBrains Mono, even mid-sentence inside otherwise-Inter text.
- **Do** use the 1px `hairline` border as the default way to separate two surfaces; reach for a shadow only when the Signal-Only Glow Rule actually applies.
- **Do** keep generated client websites out of this system entirely — they are an intentionally separate, light-themed world (see PRODUCT.md's Brand Commitments); never import `void`/`iris`/`neon` tokens into one.

### Don't:
- **Don't** reintroduce Tailwind's stock `violet-*` or `cyan-*` utility classes — they are undefined in this project's Tailwind config (renamed to `iris`/`neon`) and will silently render as nothing.
- **Don't** add a generic drop shadow to a `.card` for a "lift" effect — cards are deliberately flat/glass; reach for `.panel` or an explicit glow token if real depth is actually meant.
- **Don't** style a form's surrounding chrome (card, labels, headings, links) with raw `slate-*` Tailwind colors — use the token system throughout. The one deliberate exception is the input fill itself (see Inputs/Fields): white background with `slate-900` text is correct there, not a drift.
