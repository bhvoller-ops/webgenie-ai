# WebGenie AI — Project Context

> Read this first. It is the handoff from the ongoing build and contains
> decisions, verified facts, and traps that are not obvious from the code.
> Last updated: 23 August 2026 (previous update: 3 August 2026 — that version
> undersold progress; the v2 UI merge and much more happened after it was written).

---

## 1. What this is

WebGenie AI turns a local business's web presence into revenue for the agency
running it. Two motions share one engine:

**Motion A — Businesses with NO website (primary, cold outreach).**
Find them on Google Maps, generate a complete website for each one before making
contact, then call: *"I noticed you don't have a website, so I built you one.
Would you like to see it?"* Convert to **$297/mo** covering hosting, AI chat,
voice receptionist, review automation, and CRM.

**Motion B — Businesses with a BAD website (warm, higher ticket).**
Run the intelligence engine, deliver an evidence-traced audit free, sell a
**$497** rebuild blueprint, a **$2,500–6,000** build, and a **$497–997/mo**
growth retainer.

Motion A closes faster and has no competition for attention. Motion B is worth
more per client. Both are real; A is the priority.

**Owner:** Cassey (also runs VibeLabs Agency and Simple Online Steps).
**Goal:** revenue, not feature completeness. See §10.

---

## 2. Current state — read before assuming anything

| Thing | State |
|---|---|
| Engine (capture → intelligence → blueprint → prompts → orchestration → delivery) | **Built**, Sprint 10 complete |
| v2 UI merge (design system, finder, onboard, sitegen, prospect finder) | **Done** — merged into this repo, no longer a separate folder |
| Data seam (`lib/data/provider.ts`) | **Live on Supabase** (`DATA_MODE = "supabase"`), not fixtures |
| Database migrations `001`–`017` | Written and committed. **Not confirmed run against production** — verify before trusting `/calls` payment status or `/leads` |
| Deployed to Vercel | Yes, production — `https://webgenie-ai-sooty.vercel.app` |
| Analysis worker (`src/workers/analysis-worker.ts`) | **Implemented** (polling loop). Containerized via `Dockerfile.worker`. **Deployment target unconfirmed** — a `.railway/` folder exists locally (gitignored) but has no linked config in it; verify a worker is actually running persistently somewhere before relying on analysis jobs completing |
| Prospect Finder (`/finder`) | **Built**, real Google Places integration, distance-radius control, chain filtering, review-count tiers, text-the-link button |
| Onboarding (`/onboard`) | **Built**, 10-step flow (site gen is real, GHL-equivalent steps still simulated — see §8) |
| Site generator | **Built**, 14 industries, real hero/in-action photos, per-client photo override |
| Audit funnel (`/audit`) | **Built**, matches `/finder` design, queues real analysis jobs |
| Call tracker (`/calls`) | **Built** — dial outcomes, follow-ups, and a "Collect payment" button |
| AI intake chat widget | **Built** — added to every generated demo site; leads land in `/leads` (migration `016_chat_leads.sql`) |
| Stripe billing | **Fully working and activated** as of 23 Aug — real account ("WebGenie sandbox," `acct_1U7QiMCwvOQv0LhT`), real $297/mo Checkout from `/calls`, webhook confirmed updating `call_log.payment_status` on a completed test payment, and business verification confirmed live (`charges_enabled`/`payouts_enabled` both `true`). Only remaining step is swapping test-mode keys for live-mode ones when there's a real client to bill — see §2a |
| Auth | **Switched from magic-link (OTP) to email+password** on 23 Aug — the OTP flow hit Supabase's default mailer rate limit mid-testing and locked out a real login with no recovery path. `/login` now supports sign-in and self-serve account creation (server-side, pre-confirmed, no email sent). `/settings` has a confirm-gated "delete my account" action. See §2b |
| Transactional email | Invites stored, never sent. Send manually |
| `eslint-config-next` version trap | **Fixed** — `package.json` now pins `eslint-config-next@^15.5.22` and `eslint@^9.39.5` |

**Status of first sale:** unconfirmed from this repo — check with Cassey directly rather than assuming either way.

### 2b. Auth — password login added 23 Aug 2026

`/login` was passwordless (Supabase magic-link OTP) since the original build.
That hit Supabase's default mailer rate limit during a normal testing session
and locked out the only real account with no way to recover except waiting —
unacceptable for a single-operator tool that needs to log in reliably.

**What changed:**
- `/login` now has email + password sign-in, plus a "Create account" toggle
- New accounts go through `POST /api/auth/create-account`, which uses the
  Supabase **admin** client (`email_confirm: true`) to create a pre-confirmed
  user server-side — no confirmation email is sent, so this can't hit the same
  rate limit. The client then signs in immediately with the same credentials.
- `deleteMyAccountAction` (in `actions.ts`) added a confirm-gated "Delete my
  account" button to `/settings` → Danger zone. Deletes the auth identity only;
  it does not cascade/export org data first — do that separately if it matters.
- The existing `wallang@gmail.com` account had a password set directly via the
  Supabase admin API (`PUT /auth/v1/admin/users/{id}`) to unblock it immediately
  without waiting out the rate limit.

**Also fixed the same day, same investigation:** `getUserAndOrganization()` in
`actions.ts` used to `throw new Error("Authentication required.")` on a missing
session. There is no error boundary anywhere in this app, so that threw all the
way up to Next's generic "Application error: a server-side exception has
occurred" page — happens on any expired Supabase session (~1hr token life)
while a tab sits open, which is routine, not exceptional. Changed to
`redirect("/login")`. This function is the shared auth check for every server
action in the file, so the one change covers all of them, not just the one
that happened to get reported.

**Not done, worth doing before real users show up:** no password-reset flow,
no rate-limiting on login attempts, delete-account has no data export step.
Fine for one operator; revisit before onboarding anyone else.

### 2a. Stripe — corrected 22 Aug 2026

The 10 Aug session's claim of "Stripe billing connected" was **not actually
verified against a real account** — its `STRIPE_SECRET_KEY` pointed to a Stripe
account nobody could locate on 22 Aug. On investigation, the login `erngone@yahoo.com`
has five *other* businesses (Cassian Wallang, DPI Lodge LLC, Furnishedfinder,
"New business", SCAUF) — none of them WebGenie. A first attempt to fix this
landed the $297 product in the existing **SCAUF** account by accident (whatever
account is active in Stripe's top-left switcher when you create a product is
where it goes — it does not ask).

**The real, correct setup as of 22 Aug:**
- Dedicated Stripe account: **"WebGenie sandbox"** (`acct_1U7QiMCwvOQv0LhT`)
- Product: `WebGenie AI`, price `price_1U7QvnCwvOQv0LhTzjdR8Ky5`, $297.00/month USD, recurring, active
- `.env.local` and Vercel (Production, Preview, Development) all updated to this
  account's keys and redeployed — confirmed live in production as of deploy
  `dpl_BLakTJtsihiHiUZvKq29ba7sfW2X`
- **This account is brand new and unverified**: `charges_enabled: false`,
  `payouts_enabled: false`, `details_submitted: false` (confirmed via the Stripe
  API `GET /v1/account`, not just assumed). Test-mode Checkout will work today;
  real money will not move until "Verify your business" (business + bank
  details) is completed in this specific account.

**Update, same day — the full loop is now verified working, not just wired:**
1. Migration `017` is confirmed run in production — `call_log` has all four
   billing columns (checked live via the Supabase REST API).
2. A real test-mode Checkout was completed on `/calls` and the webhook round
   trip confirmed by querying `call_log` directly afterward: `payment_status`
   flipped to `"active"` with real `stripe_customer_id` / `stripe_subscription_id`
   / `stripe_checkout_session_id` values populated. Checkout → webhook →
   signature verification → DB write all work end to end.
3. **Business verification submitted and confirmed live** on 23 Aug — checked
   directly via the Stripe API: `charges_enabled: true`, `payouts_enabled: true`,
   `details_submitted: true`, no outstanding `requirements`. Real (non-test)
   payments will now actually pay out. Nothing technical is left blocking a
   real sale — switching this account's keys from `sk_test_...`/`pk_test_...`
   to live mode (`sk_live_...`/`pk_live_...`) is the only remaining step, and
   that only matters once there's a real client ready to pay (live and test
   mode have separate products/prices/webhooks — see §7's Stripe section).

**Lesson from how this went wrong the first time:** verify integrations against
the actual external service (API call, dashboard check) before reporting them
as connected. "The code compiles and calls the SDK" is not the same as "the
account it's calling exists and is reachable" — and "I ran the migration" isn't
confirmed until a live query shows the columns. Both gaps surfaced only because
each claim got checked against the real system instead of taken at face value.

---

## 3. Repository map

```
C:\Projects\webgenie-ai\            ← THIS REPO. Git → github.com/bhvoller-ops/webgenie-ai
├── CLAUDE.md                       ← you are here
├── src/
│   ├── app/
│   │   ├── finder/                 Motion A: prospect finder
│   │   ├── onboard/                Motion A: client onboarding (10 steps)
│   │   ├── audit/                  Motion B: audit funnel
│   │   ├── calls/                  Call tracker + Stripe "Collect payment"
│   │   ├── leads/                  Chat-widget leads from generated sites
│   │   ├── projects/, projects/[id]/  Report / blueprint / prompt viewers
│   │   ├── login/, auth/           Auth
│   │   ├── settings/               Account settings
│   │   └── api/
│   │       ├── prospects/, demo-site/   Finder + site-gen routes
│   │       ├── billing/                 Stripe checkout + webhook
│   │       ├── site-chat/               AI intake chat widget backend
│   │       ├── analysis/, audits/, delivery-runs/, orchestration-runs/,
│   │       │   content-packages/, prompt-packages/, admin/, v1/, health/
│   ├── lib/
│   │   ├── capture/                Playwright capture + feature extraction
│   │   ├── intelligence/           11 scoring modules — the core IP
│   │   ├── blueprint/              Rules → sitemap, tokens, components
│   │   ├── prompts/                Platform adapters for 9 AI builders
│   │   ├── copy/                   AI copywriter
│   │   ├── orchestration/          Multi-agent specialist review
│   │   ├── delivery/               ZIP / GitHub packaging
│   │   ├── sitegen/                Demo site generator — the Motion A product
│   │   ├── prospect/               Google Places finder + sample fallback
│   │   ├── data/provider.ts        The one data seam — now backed by Supabase
│   │   ├── stripe.ts               Stripe client + billing helpers
│   │   ├── jobs/, admin/, security/, visual/, format.ts, types.ts
│   │   └── supabase/               client / server / admin
│   ├── workers/analysis-worker.ts  MUST run on a persistent host, not Vercel
│   └── middleware.ts               Auth
├── supabase/migrations/            001–017, run in order
├── docs/                           Sprint checklists + architecture decisions
├── Dockerfile.worker               Container for the analysis worker
└── launch-kit/                     Sales assets (see §9)
```

**Superseded — do not read, it will mislead you:**
- `C:\Users\User\Documents\SimpleOS Business-in-a-Box\WebGenie Intelligence Engine\WebGenie AI Production Repository v1.0.1\` — older snapshot stopping at Sprint 9.
- `C:\Users\User\projects\WebGenieMVP\` — this was the source of the v2 UI merge. **It has already been merged into this repo.** Do not re-merge it or treat it as a separate pending task.

---

## 4. Architecture decisions (do not relitigate)

- **One repo.** Sprints are milestones, not products.
- **Canonical artifacts.** Website Intelligence, Website Blueprint, and Prompt
  Package are versioned JSON. Every report and export is a *derived view*. Never
  let a viewer become the source of truth.
- **Deterministic first.** Scoring, blueprint generation, validation, and export
  are deterministic and testable. Vision and language models enhance; they never
  replace canonical validation.
- **Worker separation.** Long-running capture runs in a worker process. The web
  app handles auth and artifact delivery.
- **Platform adapters.** One blueprint, nine builder profiles. Adding a platform
  is a profile, never a fork of business logic.

---

## 5. The data seam

Every page reads through `lib/data/provider.ts` and nothing else. `DATA_MODE` is
now `"supabase"` — it queries real tables (`website_references`, `analysis_jobs`,
`analysis_outputs`, blueprints, prompt packages, etc.) instead of fixtures.
Return types match the engine's canonical artifacts, so components did not need
to change. **Keep it that way** — do not let a Supabase call leak into a component.

If something in the UI looks wrong, check first whether the underlying migration
actually ran in production (§2) before assuming the query logic is broken.

---

## 6. Design system

Tokens in `tailwind.config.ts`, component classes in `globals.css`.

- **Surfaces:** `void` → `canvas` → `surface` → `raised`; hairline borders `#1C212D`
- **Accents:** `iris` (#7C5CFF) primary, `neon` (#22D3EE) for data and metadata
- **Signals:** `signal-bad` / `warn` / `info` / `good`, mapped by `scoreBand()`
- **Type:** Inter for UI, JetBrains Mono for **every** number, ID, URL, and score

⚠️ Tailwind's stock `violet` and `cyan` were deliberately renamed to `iris` and
`neon`. Do not reintroduce `violet-500` / `cyan-400` — they are not defined and
will silently render as nothing.

**App chrome is dark. Generated client websites are light.** That contrast is
intentional: the tool reads as technical, the output reads as friendly and local.

---

## 7. Integration points

### Google Places — `lib/prospect/finder.ts`
Set `GOOGLE_PLACES_API_KEY` in `.env.local`. Enable **Places API (New)** — the
legacy API uses different endpoints and this code targets the new one. Falls back
to deterministic sample data when absent, so the UI always works. Distance-radius
control and multi-location-chain filtering are implemented; Places Text Search
rejects a circle parameter, so radius is applied as a rectangle instead — do not
"fix" this back to a circle.
Free tier is 5,000 Text Search calls/month; one call returns ~20 businesses.
Realistic usage is ~1% of that. Set a $10 budget cap anyway.

### Stripe — `lib/stripe.ts`, `app/api/billing/`
$297/mo recurring Price. `/calls` has a "Collect payment" button that creates a
real Checkout session; a signature-verified webhook updates `call_log.payment_status`
(`none` / `pending` / `active` / `past_due` / `canceled`). Requires migration `017`
applied and the Stripe account claimed + activated (§2a) to actually move money.

### AI intake chat — `app/api/site-chat/`
Every generated demo site now embeds a real chat widget. Conversations that leave
contact info land in `/leads` (backed by migration `016_chat_leads.sql`).

### GoHighLevel (or equivalent) — `app/onboard`
The ten provisioning steps are correctly sequenced but still simulated beyond
site generation: create sub-account, import profile, provision voice agent,
configure review automation, build pipeline. Website generation is real and
needs no external service.

### Site generator — `lib/sitegen/`
Pure function: `Business` + `IndustryProfile` → complete standalone HTML.
14 industries, each with real hero + in-action photos and a per-client photo
override (paste an image URL in `/finder` or `/onboard`, blank keeps the
industry default). Every generated site emits `LocalBusiness`-family + `FAQPage`
+ `AggregateRating` JSON-LD. **That schema layer is the sales differentiator** —
it means the site is visible to ChatGPT and Perplexity on day one. Do not strip it.

To add an industry: add one entry to `INDUSTRIES` in `lib/sitegen/industries.ts`.
Write the services, trust points, and FAQ answers *properly* — the quality of the
generated site lives almost entirely in that file.

---

## 8. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server + worker only. Bypasses RLS. Never client-side
BILLING_WEBHOOK_SECRET=           # long random string
VISUAL_AI_PROVIDER=heuristic      # heuristic costs nothing and works
GOOGLE_PLACES_API_KEY=            # optional; sample data without it

# Stripe (added since the 3 Aug version of this file)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=                # server only. Never client-side, never log it
STRIPE_CLIENT_PRICE_ID=           # the $297/mo recurring Price
STRIPE_WEBHOOK_SECRET=            # verifies /api/billing webhook signatures
STRIPE_MCP_KEY=                   # for the Stripe MCP tool, if used from Claude Code
```

All of the above are already populated in `.env.local` as of the last session.
Confirm the same values (or the correct live-mode equivalents) are set on Vercel
before assuming production billing works.

---

## 9. Priorities — what to build and what to refuse

The authoritative sales plan is `launch-kit/00-START-HERE.md` (v2.0). If this
section ever disagrees with it, that file wins.

**In order, right now:**
1. **Verify, don't assume.** Confirm migrations `012`–`017` actually ran against
   production Supabase (check `call_log` for `payment_status`, check `chat_leads`
   exists), confirm the analysis worker is actually deployed and polling
   somewhere persistent, and confirm Stripe is claimed + activated (§2a). None of
   this was verified after the last session ended.
2. **Close the billing loop.** Once verified, do one real `/calls` → Checkout →
   webhook round trip end to end, in test mode first.
3. **Keep making Motion A calls** (`launch-kit/06-Motion-A-Call-Script.md`).
   The finder, site generator, call tracker, and billing are all real now —
   there is no remaining technical excuse to not be dialing.
4. **Motion B second.** The audit funnel is built and queues real analysis jobs;
   use it once the worker is confirmed running.

**Why verification is first, not more building.** Every piece Motion A needs
(finder → generate → call → onboard → bill) now exists in code. The risk at this
point is not a missing feature, it's an unconfirmed deploy — shipping on top of
an assumption that turns out false wastes the next session re-diagnosing "why
isn't this working" instead of selling.

**Actively do not build** unless Cassey asks twice: AI image generation, the
marketplace, white-label mode, the industry template marketplace, the 21-prompt
library, or Sprint 11 scope beyond what's listed above. All are documented, none
of them produce revenue this month.

> The governing rule from the launch plan: **stop adding features and launch.**
> If a request would add surface area before the first ten customers, say so.

---

## 10. Known traps

- **Run exactly one worker replica.** Job claiming is not atomic; two workers will
  claim the same job. Add a Postgres claim function before scaling.
- **Windows vs Linux case sensitivity.** The most common cause of "builds locally,
  fails on Vercel."
- **Supabase Auth redirect URLs** must include both production and
  `https://*-your-team.vercel.app`, or login redirects to a blank page.
- **Migrations must run in order, one at a time.** Out-of-sequence failures produce
  unhelpful errors. As of this update there are six migrations (`012`–`017`)
  whose production status is unconfirmed — check before adding `018`.
- **Some sites block headless capture.** Note the URL and move on. Do not rebuild
  the capture engine for one uncooperative website.
- **Google Places radius** is implemented as a rectangle, not a circle — Places
  Text Search (New) rejects a circle parameter. Don't "simplify" this back.
- **Never log or print `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`**,
  including in scripts, curl commands, or debugging output.
- **There is no error boundary anywhere in this app** (`app/error.tsx` doesn't
  exist). Any uncaught throw — a Zod validation error, an auth check, anything —
  surfaces as Next's raw "Application error: a server-side exception has
  occurred" digest page, not a usable message. Fixed the two known instances of
  this (missing session in `getUserAndOrganization`, an overly strict
  `demoUrl` validator in `addCallLogEntryAction`) on 23 Aug, but the
  underlying gap — no boundary — is still there for the next one. Adding a
  real `error.tsx` is worth doing before more of these get found by a user
  clicking around instead of in review.

---

## 11. Verified vs assumed

**Verified from the repo on 22 Aug 2026:**
- 24 commits landed since the 3 Aug snapshot; `git log` and current `src/`
  layout confirm the v2 UI merge, worker implementation, Supabase-backed data
  seam, and Stripe integration are all real code in `main`, not aspirational.
- `eslint-config-next`/`eslint` versions are current; the lint-config trap from
  the previous version of this file is fixed.
- `.env.local` has all Stripe and Supabase variable names populated.
- Working tree is clean, `main` is up to date with `origin/main`, latest deploy
  on Vercel is production and "Ready" as of 10 Aug.

**Assumed, not verified — do this before trusting the state above:**
- That migrations `012`–`016` and `018+` (whatever comes after `017`) actually
  executed against the production Supabase project. `017` specifically is
  **confirmed not run** as of 22 Aug (queried `call_log`'s columns directly).
- That the analysis worker is deployed and running anywhere persistent (only
  that the code and Dockerfile exist; the local `.railway/` folder has no
  linked project config in it).
- That a live (not just test-mode) Stripe key set will exist — it won't until
  the WebGenie sandbox account passes business verification (§2a).
- Whether any customer has actually paid yet.

**Run a real end-to-end check (§9, item 1) early and treat a failure there as
expected, not alarming — it just means the "two things only a human can do"
from the last session are still open.**

---

## 12. Working style

Cassey is not a developer and is optimising for speed to revenue. She has been
burned by long silent work periods with nothing to show.

- Show something openable early rather than a perfect thing later
- State plainly what is verified versus what you believe
- Push back when a request adds scope before the first ten customers
- Do not narrate tool calls; report outcomes
- When something breaks, say so directly and give the next concrete step
