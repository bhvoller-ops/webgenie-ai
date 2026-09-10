# WebGenie AI — Project Context

> Read this first, every session. This file is now intentionally short — it
> was reorganized on 9 Sep 2026 from a single ~187,000-character file (the
> file that was triggering Claude Code's project-memory size warning) into
> this short instruction file plus the docs indexed at the bottom. Nothing
> was deleted; if you need the full story behind any claim here, the linked
> doc has it. If this file and a linked doc ever disagree on **current**
> state, this file wins; for **why** a decision was made, the doc wins.

---

## 1. What this is

WebGenie AI turns a local business's web presence into revenue for the
agency running it (VibeLabs Agency). Two motions, one engine:

- **Motion A (primary, cold outreach)** — find businesses with no website,
  generate a complete demo site for each one *before* contact, then pitch:
  *"I noticed you don't have a website, so I built you one."* Convert to
  **$297/mo** (hosting, AI chat, voice receptionist, review automation, CRM).
- **Motion B (secondary, warm)** — run the intelligence engine on businesses
  with a bad website, deliver a free evidence-traced audit, sell a **$497**
  rebuild blueprint, a **$2,500–6,000** build, and a **$497–997/mo** retainer.

Motion A closes faster and has no competition for attention; Motion B is
worth more per client. Both are real; A is the priority.

**Owner / sole operator:** Cassey (also runs VibeLabs Agency and Simple
Online Steps). **Goal: revenue, not feature completeness** — see §5 and
`docs/webgenie-roadmap.md`.

Full positioning — users, brand commitments, evidence-on-hand, product
principles — lives in **`PRODUCT.md`** (repo root). Don't restate it here;
that file is the source of truth for positioning, and this section is
deliberately just the two-motion summary.

---

## 2. Current phase (as of 9 Sep 2026)

- Core engine, the Supabase data layer, the 73-industry site generator,
  Finder/Audit/onboarding, the call tracker, live-mode Stripe billing, and
  real role-based access control (admin/partner/beta/guest) are all built
  and live on **`app.vibelabsagency.com`**.
- **VibeLabs Agency membership** (the white-label backend for the separate
  `VibeLabs-v2` marketing site) is built and live-verified end-to-end but
  sits on branch `vibelabs-membership-phase0` — **not yet merged to `main`**.
  `STRIPE_VIBELABS_PRICE_ID` is only in local `.env.local`, not yet on
  Vercel, so `/join`'s real signup flow won't work in production until it
  is added.
- **P0 (Opportunity Brief + Next Best Action)** — merged and live
  (`6cfc339`). `prospects` / `opportunity_briefs` / `next_best_actions`,
  migration `034` applied and RLS-verified both directions; a real
  audit-completion E2E confirmed the full cycle in production (score
  57/100 real audit → brief refreshed, offer assigned, `NBA` advanced
  `RUN_AUDIT → CONTACT`). One real production defect found and fixed
  10 Sep: Finder → "Open Opportunity" rejected any real business with
  no phone on Google Places (`phone: ""` failing a `.min(1)` check),
  merged as PR #24 (`abea62f`). `/api/publish-site` had the identical
  pattern — confirmed live, fixed by reuse (`publishSiteBusinessSchema`
  in `lib/prospect/business-schema.ts`), on its own hotfix branch/PR,
  **not yet merged**. See `docs/history.md`'s P0 entries (§2ad, §2ae, §2af).
- Two known open items, don't assume either is fixed without re-testing:
  - `audit_logs` INSERT — re-investigated 9 Sep 2026 and no longer
    reproduces (see `docs/history.md`), but that finding lives on branch
    `docs/2026-09-09-audit-logs-rls-reinvestigation`, not yet merged —
    don't trust this bullet's older "still broken" framing once it lands.
  - Migration `027` (7-day trial default, down from 14) is written but
    **not yet run** against production.
- **Status of first sale is unconfirmed from this repo** — check with
  Cassey directly rather than assuming either way.
- The full status table (every shipped feature, dated build/verification
  notes) and the complete "verified vs. assumed" ledger:
  **`docs/history.md`**.

---

## 3. Repository map (condensed — full annotated tree in `docs/architecture.md`)

```
C:\Projects\webgenie-ai\
├── CLAUDE.md, PRODUCT.md, DESIGN.md   ← load-every-session context
├── docs/                              ← see index at the bottom of this file
├── src/app/                           Next.js App Router pages + api/
├── src/lib/                           capture, intelligence, blueprint,
│                                       prompts, sitegen, publish, auth,
│                                       data/provider.ts (the data seam)
├── src/workers/analysis-worker.ts     Separate persistent process — never Vercel
├── supabase/migrations/               001–032, run in order
├── launch-kit/                        Sales assets — see docs/webgenie-roadmap.md
└── public/industry-photos/            Self-hosted hero photos, absolute URLs only
```

**Two superseded snapshots exist outside this repo — do not read or re-merge
them** (full paths in `docs/architecture.md`): an older pre-Sprint-10 copy,
and the source repo for the v2 UI merge, which is already merged here.

---

## 4. Architecture rules (do not relitigate)

- One repo; canonical JSON artifacts (Website Intelligence, Website
  Blueprint, Prompt Package) — every report/export is a *derived view*,
  never the source of truth.
- Deterministic scoring/blueprint/validation first; vision/language models
  enhance, they never replace canonical validation.
- The analysis worker is a separate persistent process (Railway) —
  **never** deploy it to Vercel, and run **exactly one replica** (job
  claiming is not atomic; add a Postgres claim function before scaling).
- One blueprint, many platform adapters — adding a builder is a profile,
  never a fork of business logic.
- Every page reads data through **`lib/data/provider.ts`** and nothing
  else (`DATA_MODE = "supabase"`, live, not fixtures). Never let a Supabase
  call leak into a component.

Full rationale for the 5 original ADRs: **`docs/ARCHITECTURE_DECISIONS.md`**.
Current specifics (full repo tree, the data-seam note): **`docs/architecture.md`**.

---

## 5. Design system

App chrome is **dark**; every generated client website is **light** —
deliberate, load-bearing contrast (tool reads technical, output reads
friendly/local). Never collapse it. Tailwind's stock `violet`/`cyan` were
renamed to `iris`/`neon` — don't reintroduce `violet-500`/`cyan-400`, they
render as nothing. Full token/component spec, do's and don'ts:
**`DESIGN.md`** (repo root).

---

## 6. Environment variables

This app won't run without Supabase (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), and won't do
anything revenue-generating without Stripe (`STRIPE_SECRET_KEY`,
`STRIPE_CLIENT_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`), Google Places
(`GOOGLE_PLACES_API_KEY`, must be **"API restriction" scoped to Places API
(New)** — "Websites"/"IP addresses" 403 every server call), and Vercel
publishing (`VERCEL_API_TOKEN`, must **not** be read-only). Full variable
list, purposes, and per-integration gotchas: **`docs/integrations.md`**.

**Never log or print** `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or
`VERCEL_API_TOKEN` — including in scripts, curl commands, or debug output.

---

## 7. Current priorities

1. **Verify, don't assume, before building more.** Biggest open items: a
   real card actually charging and paying out in live Stripe (not yet
   confirmed), and the `audit_logs` RLS bug (needs a real debugging
   session or explicit sign-off to bisect on production).
2. **Keep making Motion A calls.** Finder, site generator, call tracker,
   and billing are all real — no remaining technical excuse not to dial.
3. **Do not add product surface before the first ten paying customers** —
   an explicit, standing rule, not a general inference.

Full reasoning, the deferred-features research (Reddit/Yelp/Craigslist/
new-business-registration feeds/affiliate program), and what's explicitly
refused unless Cassey asks twice: **`docs/webgenie-roadmap.md`**. If that
doc (or this section) ever disagrees with `launch-kit/00-START-HERE.md`,
the launch-kit file wins.

---

## 8. Permanent traps — read before touching these areas

- Any new hero photo candidate needs a visual watermark check before
  wiring into `industries.ts` — a past "Magnific" AI-upscale watermark
  wasn't obvious until rendered.
- `heroImage`/`secondaryImage` must be an **absolute** URL, never relative
  — a published site or client domain isn't served from this app's origin.
- **Never give a partner login an `organization_members` row.** Nearly
  every RLS policy grants full access to "any member of this
  organization" — that table is the real trust boundary, not the
  app-level checks in `lib/auth/access.ts`. Partners/beta testers are
  deliberately kept out of it.
- **There is no `middleware.ts` in this repo.** Access control is
  per-page/per-route via `lib/auth/access.ts`
  (`requireAdminPage()`/`requirePartnerPage()`/`requireAdminApi()`) —
  nothing enforces this centrally; check a new page actually calls one.
- `organization_members` SELECT is scoped per-row, not per-org — any
  team-visibility feature must go through `my_organization_ids()`, never
  a direct `.select()` (a naive fix risks RLS infinite recursion).
- Never resolve "this agency's own organization" via
  `.select("id").limit(1).single()` — no `ORDER BY` means no guarantee
  once a second org exists. Use `getDefaultOrganizationId()`
  (`src/lib/organizations.ts`, migration `033`) instead.
- Run exactly one worker replica (see §4).
- Windows vs. Linux case sensitivity is the most common "builds locally,
  fails on Vercel" cause.
- Supabase Auth's Redirect URLs allow-list must include every real domain
  a `redirectTo` can point at — an unlisted one silently falls back to the
  Site URL with no error, not a visible failure.
- A link landing with `#access_token=...` in the URL fragment needs
  `supabase.auth.setSession()` called explicitly — the browser client's
  PKCE-flow auto-detection only recognizes `?code=` and silently never
  fires for the fragment shape.
- Migrations must run in order, one at a time — and **applying cleanly is
  not the same as working**: `audit_logs`'s insert policy is confirmed
  present via `pg_policies` and a real authenticated insert still fails
  RLS. Always exercise the actual behavior, not just check the policy
  exists.
- **Never loosen a production RLS policy to debug it, even temporarily,
  without explicit sign-off.**
- Google Places radius is a rectangle, not a circle — Text Search (New)
  rejects a circle parameter. Don't "simplify" this back.
- Combining `.wrap` with another class on one sitegen element: never give
  the second class a `padding`/`margin`/`max-width` shorthand unless it's
  meant to fully replace `.wrap`'s value — it will, silently.
- A Vercel personal access token can authenticate fine and still 403 on
  writes if its "Read-only" toggle was left on.
- **There is no error boundary anywhere in this app** (`app/error.tsx`
  doesn't exist) — an uncaught throw surfaces as Next's raw
  "Application error" page, not a usable message.

Full backstory for every one of these: **`docs/decisions.md`**.

---

## 9. Working style

Cassey is not a developer and is optimising for speed to revenue. She has
been burned by long silent work periods with nothing to show.

- Show something openable early rather than a perfect thing later
- State plainly what is verified versus what you believe
- Push back when a request adds scope before the first ten customers
- Do not narrate tool calls; report outcomes
- When something breaks, say so directly and give the next concrete step

---

## Docs index

| File | What's in it |
|---|---|
| `PRODUCT.md` (root) | Positioning, users, brand commitments, evidence-on-hand, product principles |
| `DESIGN.md` (root) | Full design-token/component spec for the app's dark dashboard chrome |
| `docs/architecture.md` | Full annotated repo tree, the data-seam note |
| `docs/ARCHITECTURE_DECISIONS.md` | The 5 original ADRs |
| `docs/integrations.md` | Google Places / Stripe / Vercel publish / lead capture / GoHighLevel / site generator — how each actually works, config, gotchas |
| `docs/webgenie-roadmap.md` | What to build and in what order, what to refuse, the deferred-data-source research |
| `docs/decisions.md` | Every permanent trap in §8 above, with full backstory |
| `docs/history.md` | The complete chronological build log (§2a–§2ab and counting) + the "verified vs. assumed" ledger |
| `docs/DEPLOYMENT_READINESS_REPORT.md`, `docs/SPRINT_*_CHECKLIST.md` | Pre-existing, untouched — early sprint-era history |
