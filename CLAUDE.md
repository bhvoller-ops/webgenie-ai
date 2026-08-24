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
| Database migrations `001`–`018` | Written and committed. `017` and `018` **confirmed run** against production (checked live via the Supabase API, not assumed) — `012`–`016` still unconfirmed |
| Deployed to Vercel | Yes, production — `https://webgenie-ai-sooty.vercel.app` |
| Analysis worker (`src/workers/analysis-worker.ts`) | **Implemented** (polling loop). Containerized via `Dockerfile.worker`. **Deployment target unconfirmed** — a `.railway/` folder exists locally (gitignored) but has no linked config in it; verify a worker is actually running persistently somewhere before relying on analysis jobs completing |
| Prospect Finder (`/finder`) | **Built**, real Google Places integration, distance-radius control, chain filtering, review-count tiers, text-the-link button, one-click "Publish" to a real hosted site — see §2d. **Places API is 403ing again as of 23 Aug** (falls back to sample data) — was fixed once already; something's regressed since, check Google Cloud Console |
| Onboarding (`/onboard`) | **Built**, 10-step flow (site gen is real, GHL-equivalent steps still simulated — see §8) |
| Site generator | **Built**, 14 industries, real hero/in-action photos, per-client photo override, two-column hero with an embedded lead-capture form — see §2c |
| Audit funnel (`/audit`) | **Built**, matches `/finder` design, queues real analysis jobs |
| Call tracker (`/calls`) | **Built** — dial outcomes, follow-ups, "Collect payment" (pay on your device), and "Copy payment link" (short branded link to text/email a client) — see §7 |
| Lead capture on generated sites | **Built, two channels** — AI intake chat widget *and* a hero quote-request form, both landing in one **`/leads`** inbox (renamed from "Chat Leads"), tagged by source. See §2c |
| Samples gallery (`/samples`) | **Built** — one curated example per industry, always available without re-running Finder |
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

### 2c. Generated-site hero redesign + lead capture — 23 Aug 2026

Prompted by wanting the hero on generated sites to match a two-column
lead-capture layout (photo/headline on one side, an embedded quote-request
form on the other) instead of just CTA buttons.

**Shipped:**
- Hero is now a two-column grid (`lib/sitegen/generate.ts`): left column keeps
  the existing badge/h1/sub/CTAs/trust chips; right column is a new
  `quoteform` card (`lib/sitegen/lead-form.ts`) — "FREE, NO-OBLIGATION QUOTE"
  header, Name/Email/Phone/Message fields, submit button. Stacks to one column
  under 820px. (City and a per-industry Service dropdown were in the first
  version of this card; removed 23 Aug — see the tweak below.)
- The Google rating badge moved out of the cramped header text and into its
  own high-contrast pill at the bottom-left of the hero (previous version of
  this section documented it as still in the header — that's now stale, see
  the fix below).
- New `POST /api/site-lead` stores form submissions. Rather than a parallel
  table, it extends `chat_leads` (migration `018_site_lead_form.sql`: adds
  `source` / `visitor_email` / `service_requested` / `city`) so chat leads and
  form leads share **one inbox** — `/leads` (renamed from "Chat Leads") shows
  both with a Chat/Form badge.
- New `/samples` page + nav item: one curated fixture business per industry
  (`lib/sitegen/samples.ts`), linking to the same `/api/demo-site` URLs every
  generated site uses. For a quick quality check or pulling one up on a call.
- **Fixed a real bug found while testing this, not hypothetical:** neither
  `/api/site-chat` nor the new `/api/site-lead` sent CORS headers, and there's
  no global CORS config. That only "worked" because every generated site so
  far has been previewed from this same deployment — a site actually deployed
  to a client's own domain would have the browser silently block the response
  (or the preflight) on both the chat widget and this form. Fixed via a shared
  `lib/sitegen/cors.ts` used by both routes.

**Verified, not just built:** rendered the redesigned hero at desktop and
mobile widths via the browser tool before shipping; after deploying, sent a
real `POST /api/site-lead` against production and confirmed the row landed in
`chat_leads` with `source: "form"` and all fields intact, then deleted that
test row so it wouldn't sit in the real leads inbox. Re-verified again after
the follow-up tweak below (simplified fields, retitled headers) — filled and
submitted the actual live form on production at
`https://webgenie-ai-sooty.vercel.app/api/demo-site?...`, confirmed the
"Thanks — we'll be in touch shortly!" message, confirmed the row in
`chat_leads` with the new Name/Email/Phone/message shape, deleted it after.

**Browser-tool quirk worth knowing for next time:** the sandboxed preview
pane's simulated mouse click sometimes doesn't land on the actual button
element even at a ref's correct coordinates (confirmed by checking the DOM
directly — nothing fired). Calling `element.click()` via the JS console tool
instead still exercises the real production code path (same event handler,
same fetch), just not the synthetic mouse event itself — good enough to prove
the feature works, not a substitute for an actual human click if the click
*handler wiring itself* were ever in question.

**Known limitation, carried over from the chat widget and still true:**
generated sites don't carry which agency (`organization_id`) built them, so
both lead-capture paths attribute every lead to whichever organization comes
back first from the database (`select().limit(1).single()`). Harmless with
one agency using WebGenie. Threading real attribution through
`Business`/`generateSite` is a real but deliberately deferred fix — flagged
twice now, not silently ignored — needed before a second agency signs on.

**Follow-up fix, same day:** the two-column hero shipped with a real spacing
bug — text sat flush at the true left edge, the form card flush at the true
right edge, no margin from either. Root cause: `.heroin{padding:80px 0}`'s
shorthand silently overwrote `.wrap`'s horizontal padding on the same element
(later rule, same specificity — shorthand replaces all four sides rather than
merging with an earlier rule's), and `.heroin{max-width:none}` was overriding
`.wrap`'s 1140px width cap the same way, so the hero would've had no width
limit at all on a wide monitor. Fixed by giving `.heroin` its own `40px` side
padding (`24px` on mobile) and dropping the width-cap override so it matches
the rest of the page. **General lesson for this codebase:** when combining
`.wrap` with another class on one element, never give the second class a
`padding`/`margin`/`max-width` shorthand unless it's meant to fully replace
`.wrap`'s value — it will, silently, rather than adding to it.

**Follow-up tweak, same day:** simplified the quote-form card after seeing it
rendered — dropped the "How Can We Help?" heading (the eyebrow line is the
only header text now) and removed the City field and per-industry Service
dropdown, leaving just Name / Email / Phone / a single message field
(placeholder "Tell us what's going on."). `leadFormMarkup()` no longer takes
a `services` param. Also nudged the card itself a little right — `.heroin`'s
right-side padding went from `40px` to `20px` (left unchanged) — since the
equal-padding version from the spacing fix above read as too centered. The
AI chat widget's panel header was retitled too: leads with "How Can We Help
You" now, business name moved to the smaller subtitle line beneath it.

### 2d. One-click publish to a real Vercel site — 23 Aug 2026

Before this, a generated site had exactly one output: the ephemeral
`/api/demo-site?b=...` link, which re-renders HTML on every visit and lives
nowhere permanent. There was no way to hand a client a real, standing,
hosted site, and **no Vercel integration existed anywhere in the codebase**
prior to today — checked before building anything.

**Shipped:**
- `lib/publish/vercel.ts` calls the Vercel REST API directly (no CLI, no SDK)
  to create a deployment of the generated static HTML, then attaches
  `<slug>.vibelabsagency.com` as its domain.
- **Idempotent by design.** The Vercel *project* is keyed off the business's
  own stable `id` (a real Google Place ID for Places-sourced businesses,
  `sample_.../manual_...` otherwise) — so publishing the same business again
  after a photo swap redeploys into the same project and keeps the same URL,
  rather than creating a duplicate. The *subdomain* is derived from the
  business name and only changes if it collides with a **different**
  business's project (retries `-2`, `-3`, ... up to 8 times).
- `POST /api/publish-site` is **agency-only** — requires a logged-in session,
  unlike the public `site-chat`/`site-lead` routes, since publishing spends a
  real Vercel deployment + domain and shouldn't be reachable by a site visitor.
- `PublishButton` (`components/publish-button.tsx`) on `/finder` turns into a
  "Live" link once done.

**Why `vibelabsagency.com`:** of the three domains on this Vercel account
(`vibelabsagency.com`, `promptobook.com`, `simpleonlinesteps.com`), it's the
one that reads as the agency brand *and* has its nameservers already on
Vercel (`ns1/ns2.vercel-dns.com`) — confirmed via the Vercel API before
choosing it, not assumed from the name alone. That means attaching a new
subdomain needs no manual DNS step; Vercel provisions it instantly since it
manages the zone.

**Vercel API token:** stored as `VERCEL_API_TOKEN` (`.env.local` + Vercel
env vars, all three environments). The first token Cassey generated was
**read-only** — could list projects but not create one or touch domains,
confirmed by trying both and getting `403 forbidden` back. Vercel's token
creation UI has a "Read-only" toggle that's easy to leave on by default; the
working token needed it off. If publishing ever starts failing with a 403
from Vercel specifically, check that toggle before assuming the code broke.

**Verified, not just built:** called `publishBusinessSite` directly against
the real Vercel API first (created a project, deployed, attached a domain,
curled the live URL and got the real page back, deleted the test project) —
*then*, separately, logged into production, ran a real Finder search, and
clicked the actual "Publish" button in the actual UI, confirmed the same
thing end to end. Both test projects removed from Vercel afterward so they
don't clutter the account.

**Known limitation:** same one flagged twice already in §2c — generated
sites don't carry which agency built them, so this shares that gap. Not
relevant yet with one agency using WebGenie.

**Scaling note, not a problem today:** each published business gets its own
Vercel project. Fine at prospect-list volumes; if this ever runs into
hundreds of published sites, check Vercel's per-team project limits on
whatever plan is active before assuming it'll keep scaling silently.

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
│   │   ├── calls/                  Call tracker + Stripe "Collect payment" / "Copy payment link"
│   │   ├── pay/                    Public per-prospect payment link redirect + outcome pages
│   │   ├── leads/                  All site leads (chat + hero form), one inbox
│   │   ├── samples/                One curated example site per industry
│   │   ├── projects/, projects/[id]/  Report / blueprint / prompt viewers
│   │   ├── login/, auth/           Auth
│   │   ├── settings/               Account settings
│   │   └── api/
│   │       ├── prospects/, demo-site/   Finder + site-gen routes
│   │       ├── billing/                 Stripe checkout + webhook
│   │       ├── site-chat/               AI intake chat widget backend
│   │       ├── site-lead/               Hero quote-form backend
│   │       ├── publish-site/            Real Vercel deployment, agency-only
│   │       ├── auth/create-account/     Server-side pre-confirmed signup
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
│   │   │   ├── generate.ts         Hero, services, reviews, FAQ, JSON-LD — the HTML itself
│   │   │   ├── lead-form.ts        Hero quote-request card (markup/styles/script)
│   │   │   ├── chat-widget.ts      AI intake chat (markup/styles/script)
│   │   │   ├── cors.ts             Shared CORS for site-chat + site-lead
│   │   │   └── samples.ts          Fixture businesses behind /samples
│   │   ├── publish/vercel.ts       Publishes a generated site to a real <slug>.vibelabsagency.com
│   │   ├── prospect/               Google Places finder + sample fallback
│   │   ├── data/provider.ts        The one data seam — now backed by Supabase
│   │   ├── stripe.ts               Stripe client + billing helpers
│   │   ├── jobs/, admin/, security/, visual/, format.ts, types.ts
│   │   └── supabase/               client / server / admin
│   ├── workers/analysis-worker.ts  MUST run on a persistent host, not Vercel
│   └── middleware.ts               Auth
├── supabase/migrations/            001–018, run in order
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

### Stripe — `lib/stripe.ts`, `app/api/billing/`, `app/pay/`
$297/mo recurring Price. Session creation lives in one shared
`createClientCheckoutSession()` (`lib/stripe.ts`) used by two entry points on
`/calls`, both per-prospect and both tracked the same way:

- **"Collect payment"** — redirects the agency's own browser straight to
  Checkout. For paying on the spot, in person or on a call.
- **"Copy payment link"** — copies `https://<domain>/pay/<call_log_id>` to the
  clipboard. This is what actually gets texted or emailed to a client. It's a
  public, unauthenticated route (`app/pay/[callLogId]/route.ts`) — the client
  has no WebGenie login, so the call_log UUID is the only "auth," same trust
  model as any emailed magic link. It mints a **fresh** Checkout session on
  every visit rather than baking one in, so unlike a raw Stripe URL it never
  expires. Lands on public `/pay/success`, `/pay/cancelled`, or
  `/pay/already-active` — not `/calls`, which would dead-end an external
  client at a login screen they don't have an account for.

Either path's completed Checkout fires the same signature-verified webhook,
which updates `call_log.payment_status` (`none` / `pending` / `active` /
`past_due` / `canceled`). Requires migration `017` applied and the Stripe
account claimed + activated (§2a) to actually move money — both confirmed
done as of 23 Aug.

### Lead capture on generated sites — `app/api/site-chat/`, `app/api/site-lead/`, `lib/sitegen/cors.ts`
Two independent capture paths on every generated site, both landing in the
same `/leads` inbox tagged by `source`:
- **AI intake chat widget** (`lib/sitegen/chat-widget.ts`) — conversational,
  grounded only in that business's real services/FAQ/hours.
- **Hero quote-request form** (`lib/sitegen/lead-form.ts`, added 23 Aug) —
  Name/Email/Phone/Message, embedded directly in the hero. Simplified down
  from an initial Name/Email/Phone/City/Service/Message version the same day
  (§2c) — `chat_leads`' `city`/`service_requested` columns from migration
  `018` exist but neither capture path writes to them anymore.

Both write to `chat_leads` (migrations `016` + `018`) and both call back
cross-origin to this deployment via `lib/sitegen/cors.ts` — required once a
site is deployed to a client's own domain, not just previewed here. Neither
path knows which agency generated the site yet (see §2c's known limitation).

### Publish to Vercel — `lib/publish/vercel.ts`, `app/api/publish-site/`
"Publish" on `/finder` deploys a generated site as a real, permanent site at
`<slug>.vibelabsagency.com` via the Vercel REST API — not the ephemeral
`/api/demo-site` link. Idempotent (keyed off the business's stable `id`), so
re-publishing after an edit updates the same site rather than duplicating it.
Requires `VERCEL_API_TOKEN` with write access — a read-only token fails with
403 on both project creation and domain assignment. See §2d for the full
story, including why this particular domain and how the token issue surfaced.

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

# Vercel publishing (added 23 Aug 2026 — see §2d)
VERCEL_API_TOKEN=                 # must NOT be read-only — check the token's toggle in Vercel if 403s appear
VERCEL_TEAM_ID=                   # team_fwiYeCiBw0ayQL8dP0F6qSBj
VERCEL_PUBLISH_DOMAIN=            # vibelabsagency.com — nameservers already on Vercel
```

All of the above are already populated in `.env.local` as of the last session.
Confirm the same values (or the correct live-mode equivalents) are set on Vercel
before assuming production billing works.

---

## 9. Priorities — what to build and what to refuse

The authoritative sales plan is `launch-kit/00-START-HERE.md` (v2.0). If this
section ever disagrees with it, that file wins.

**In order, right now:**
1. **Verify, don't assume.** Migrations `012`–`016` (call tracker, org bootstrap,
   RLS insert policies, default plan, chat leads) are still unconfirmed against
   production Supabase — `017` and `018` now are (checked live via the API).
   Also confirm the analysis worker is actually deployed and polling somewhere
   persistent — that's still unverified.
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
  unhelpful errors. `012`–`016` still have unconfirmed production status —
  check before adding `019`.
- **Some sites block headless capture.** Note the URL and move on. Do not rebuild
  the capture engine for one uncooperative website.
- **Google Places radius** is implemented as a rectangle, not a circle — Places
  Text Search (New) rejects a circle parameter. Don't "simplify" this back.
- **Combining `.wrap` with another class on one sitegen element** (e.g.
  `class="wrap heroin"`) — never give the second class a `padding`/`margin`/
  `max-width` shorthand unless it's meant to fully replace `.wrap`'s value.
  It will, silently, same-specificity-later-rule-wins, not merge with it. Bit
  the two-column hero on 23 Aug — see §2c.
- **Never log or print `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or
  `VERCEL_API_TOKEN`**, including in scripts, curl commands, or debugging output.
- **A Vercel personal access token can be valid and still do nothing.** Vercel's
  token creation UI has a "Read-only" toggle that's easy to leave on — such a
  token authenticates fine and can list projects, but 403s on creating a
  project or touching a domain. Bit the Vercel-publishing feature on 23 Aug
  (§2d). If publishing 403s, check that toggle before assuming the code broke.
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

**Verified from the repo on 22–23 Aug 2026:**
- 24 commits landed since the 3 Aug snapshot; `git log` and current `src/`
  layout confirm the v2 UI merge, worker implementation, Supabase-backed data
  seam, and Stripe integration are all real code in `main`, not aspirational.
- `eslint-config-next`/`eslint` versions are current; the lint-config trap from
  the previous version of this file is fixed.
- `.env.local` has all Stripe and Supabase variable names populated.
- Migrations `017` and `018` confirmed run against production — queried the
  live columns directly via the Supabase API rather than assuming.
- Stripe: real `/calls` → Checkout → webhook round trip completed and confirmed
  in `call_log`; business verification confirmed live (`charges_enabled`/
  `payouts_enabled` both `true`) via the Stripe API.
- Hero redesign + lead form: rendered at desktop and mobile widths via the
  browser tool, then a real `POST /api/site-lead` against production confirmed
  landing in `chat_leads` with the right fields before being cleaned up.
- Vercel publishing: called `publishBusinessSite` directly against the real
  Vercel API (project created, deployed, domain attached, live URL curled and
  confirmed serving the real page), then separately re-verified through the
  actual logged-in `/finder` UI end to end. Both test projects deleted after.
- Working tree is clean, `main` is up to date with `origin/main`, latest deploy
  on Vercel is production and "Ready."

**Assumed, not verified — do this before trusting the state above:**
- That migrations `012`–`016` actually executed against the production
  Supabase project.
- That the analysis worker is deployed and running anywhere persistent (only
  that the code and Dockerfile exist; the local `.railway/` folder has no
  linked project config in it).
- Stripe is still on **test-mode** keys (`sk_test_`/`pk_test_`) even though the
  account is activated — real money won't move until those are swapped for
  live-mode keys, product, price, and webhook (§2a notes this needs redoing
  in live mode, not just flipping a toggle).
- That generated-site leads attribute to the correct agency once more than one
  agency uses WebGenie — known single-tenant limitation, see §2c.
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
