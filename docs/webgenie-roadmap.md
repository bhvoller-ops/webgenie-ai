# WebGenie AI — Roadmap & Priorities

> Extracted from CLAUDE.md during the 9 Sep 2026 memory reorganization. What to build, in what order, and what to actively refuse. If this file ever disagrees with `launch-kit/00-START-HERE.md`, that file wins (per its own original text below).

## 9. Priorities — what to build and what to refuse

The authoritative sales plan is `launch-kit/00-START-HERE.md` (v2.0). If this
section ever disagrees with it, that file wins.

**In order, right now:**
1. **Verify, don't assume.** Migrations `012`–`019` are now all checked live
   against production Supabase (§2g). One open problem remains:
   `audit_logs` INSERT is still confirmed broken for real authenticated
   users even after `019` re-added the missing policy from `014` — the
   policy exists correctly, the insert still fails RLS, root cause not
   found (§2g). Needs a real debugging session (Supabase dashboard's policy
   tester, or explicit sign-off to bisect on production) before audit
   logging can be trusted. (The analysis worker's deployment — previously
   the other item here — is now confirmed running; see the status table.)
2. **Billing loop is closed, in both modes.** Test-mode Checkout → webhook →
   DB write was verified end-to-end on 22 Aug; live mode went live 29 Aug
   with a real live Checkout Session verified through the actual UI
   (§2a-live). The one remaining unknown is whether a real card actually
   charges and pays out — that needs either Cassey's own deliberate
   self-test or the next real client's payment, not more building.
3. **Keep making Motion A calls** (`launch-kit/06-Motion-A-Call-Script.md`).
   The finder, site generator, call tracker, and billing (now live-mode) are
   all real — there is no remaining technical excuse to not be dialing.
4. **Motion B second.** The audit funnel is built and queues real analysis jobs;
   the worker is confirmed running (see status table).

**Why verification is first, not more building.** Every piece Motion A needs
(finder → generate → call → onboard → bill) now exists in code. The risk at this
point is not a missing feature, it's an unconfirmed deploy — shipping on top of
an assumption that turns out false wastes the next session re-diagnosing "why
isn't this working" instead of selling.

**Actively do not build** unless Cassey asks twice: AI image generation, the
marketplace, white-label mode, the industry template marketplace, the 21-prompt
library, an affiliate/reseller/referrer program, or Sprint 11 scope beyond what's
listed above. All are documented, none of them produce revenue this month.

**Finder data sources beyond Google Places — researched 27 Aug 2026, holding
off.** Cassey asked about adding Reddit, business forums, social media groups,
job boards, classified sites, and directories to `/finder`. Checked each
rather than assumed:
- **Craigslist** — ToS explicitly prohibits scraping; they've sued scrapers
  before. Declined outright, not just deprioritized.
- **Yelp Fusion API** — no longer has a free commercial tier (checked
  live, since this had been assumed free in an earlier draft of this
  conversation). 30-day/5,000-call trial only, then $7.99–14.99 per 1,000
  calls. Cheapest real option if this gets revisited.
- **Reddit API** — commercial use (this qualifies) requires Reddit's manual
  approval, a paid contract (~$0.24/1,000 calls, reportedly ~$12k/month
  minimum commitment), and a 2–4 week review with no approval guarantee.
  Not worth pursuing at this stage.
- **New-business-registration feed (GA, expanding to the Southeast)** —
  conceptually the best of the ideas raised (freshly registered businesses
  are almost certainly still website-less, a purer Motion A signal than
  Google Places). No free official API from Georgia's Secretary of State
  (eCorp portal blocks automated fetches); third-party aggregators like
  OpenCorporates have the data but real pricing wasn't published outright.
  Worth revisiting if Cassey gets a real quote from a data vendor — don't
  build against the state portal directly without confirming its ToS first.
- **Facebook/LinkedIn Groups** — no API for arbitrary group content since
  ~2018; not automatable without ToS violation and account-ban risk.
- **Affiliate/reseller/referrer program** (marketing/affiliate-forum
  audience) — a real idea, but it's recruiting resellers/affiliates, not
  finding local-business prospects, so it doesn't belong in Finder. It's a
  separate feature (referral tracking, commissions, its own signup flow) —
  now listed above with the other explicitly-deferred features.

**Decision: hold off entirely.** Google Places remains the only Finder data
source. Revisit only if Cassey raises it again with a specific budget in
mind for the paid options.

> The governing rule from the launch plan: **stop adding features and launch.**
> If a request would add surface area before the first ten customers, say so.

---

