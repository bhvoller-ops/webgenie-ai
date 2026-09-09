# WebGenie AI — Integration Reference

> Extracted from CLAUDE.md during the 9 Sep 2026 memory reorganization. How each external integration actually behaves and how to configure it, including the non-obvious gotchas already hit once. For the story of how each was built/debugged, see docs/history.md's dated sections (§2a, §2d, §2f, etc.).

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
`regularOpeningHours` is in the field mask and feeds `isOpen24Hours()` — see
§2f — for the "No 24/7 Coverage" pitch badge on `/finder` and `/audit`.

**403 PERMISSION_DENIED, twice now — actual cause found the second time.**
The key had "Websites" selected as its restriction type in Google Cloud
Console. That restricts calls by the request's browser Referer header — since
this app calls Places API (New) **server-side** (a Vercel function, no
browser, no Referer), every call was silently blocked despite the API itself
being correctly enabled. Fixed by changing the key's restriction type to
**"API restriction"** and scoping it to **"Places API (New)"** specifically —
the correct restriction for a server-only key, since it doesn't care about
request origin at all. Confirmed via a direct `curl` to
`https://places.googleapis.com/v1/places:searchText` before and after: real
403 before, real results after. Then confirmed again through the actual app —
logged into production, ran a real `/finder` search, got "8 prospects ready
for outreach · **live Google data**" with real Atlanta businesses (real
addresses, phones, review counts), no sample-data fallback banner. **If this
key ever 403s again, check the restriction type first** — "Websites" or "IP
addresses" will both break a server-side caller; only "API restriction" (or
no restriction) works here.

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
14 industries, a per-client photo override (paste an image URL in `/finder`
or `/onboard`, blank keeps the industry default), and a shared "How It
Works" 5-step section (`howItWorksSteps()` in `generate.ts`) on every site —
see §2e for which industries have a real curated hero/secondary photo vs.
generic stock. Every generated site emits `LocalBusiness`-family + `FAQPage`
+ `AggregateRating` JSON-LD. **That schema layer is the sales differentiator** —
it means the site is visible to ChatGPT and Perplexity on day one. Do not strip it.

To add an industry: add one entry to `INDUSTRIES` in `lib/sitegen/industries.ts`.
Write the services, trust points, and FAQ answers *properly* — the quality of the
generated site lives almost entirely in that file. Source any new photo directly
from Pexels, not an unverified AI tool — see §2e's watermark incident.

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

