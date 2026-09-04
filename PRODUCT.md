# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user today: **Cassey**, sole operator of VibeLabs Agency (also runs
Simple Online Steps), running WebGenie AI entirely solo — finding prospects,
reviewing and generating demo sites, making the calls, onboarding closed
clients, and tracking billing. A partner and other admin-invited people have
accounts and are browsing/getting oriented, but are not yet active day-to-day
operators — for design purposes, treat the primary user as solo.

Downstream audiences shaped by the product but not direct users of this
codebase:
- **Local business owners** targeted by Motion A (no website) and Motion B
  (bad website) outreach — non-technical, judge the product by whether the
  generated site or audit report looks credible and specific to them.
- **Visitors to a generated client website** who submit the AI chat widget or
  the hero quote-request form (become leads).
- **A closed client's own customers**, once that client's site goes live for
  real.

## Product Purpose

WebGenie AI turns a local business's web presence into revenue for the
agency running it (VibeLabs Agency). Two motions share one engine:

- **Motion A (primary):** find businesses with no website via Google Maps,
  generate a complete website for each *before* contact, then pitch "I
  noticed you don't have a website, so I built you one — want to see it?"
  Convert to **$297/mo** (hosting, AI chat, voice receptionist, review
  automation, CRM).
- **Motion B (secondary):** run the intelligence engine on businesses with a
  bad website, deliver a free evidence-traced audit, sell a **$497** rebuild
  blueprint, a **$2,500–6,000** build, and a **$497–997/mo** growth retainer.

Success is revenue — specifically MRR from Motion A clients closed by cold
calling — not feature completeness. This is an explicit, standing principle
of the project, not an inference (see Product Principles).

## Positioning

*"We built the system that we should have been given when we started."*
(Cassey, verbatim) — the product exists because the agency itself needed it
and nobody built it for them first.

The concrete mechanism a competitor selling a generic template can't
truthfully copy: a **finished, working demo website — built from that
specific business's real name, category, and (where available) real
photos/reviews — exists before any sales conversation happens.** The
prospect is shown something real and theirs, not told their website is bad
and asked to trust a stranger's judgment. Every generated site also ships
`LocalBusiness`/`FAQPage`/`AggregateRating` JSON-LD, making it visible to
ChatGPT and Perplexity from day one — a stated, deliberate differentiator.

## Operating Context

- Sole-operator daily loop: `/finder` (Motion A prospect search) or `/audit`
  (Motion B), review each generated site for ~2 minutes before calling
  (never skipped), place the call, log the outcome and collect Stripe
  payment in `/calls`.
- A closed client's onboarding runs through `/onboard`'s 10-step flow; site
  generation is real, GoHighLevel-equivalent provisioning is still
  simulated.
- A live client's leads (AI chat + hero quote form, from any generated site)
  land in one shared `/leads` inbox.
- Real production deployment at `app.vibelabsagency.com`; a background
  Railway worker processes longer-running capture/analysis jobs
  independently of the web app.
- VibeLabs Agency / Simple Online Steps has pre-existing clients that
  predate WebGenie AI's own branding and structure. No structured feedback
  loop from them exists yet — the team is still setting up that structure.
- One real, unsolicited piece of client feedback is already on hand: a
  prospect found it hard to tell what products/services are offered, who
  they're for, and why. That is a current, live gap in how the offer is
  communicated — not a hypothetical one, and not yet resolved.

## Capabilities and Constraints

- Core engine (capture → intelligence scoring → blueprint → prompts →
  orchestration → delivery) is built; scoring and validation are
  deterministic and testable by design — vision/language models enhance,
  never replace, canonical validation.
- Data layer is live on Supabase (not fixtures); deployed to Vercel
  production; the analysis worker runs on Railway as exactly one replica
  (job claiming is not atomic — do not scale replicas without a real claim
  function).
- Auth: email+password, plus public self-serve signup and "Continue with
  Google" (Google OAuth wired but not yet live — needs a provider secret
  set outside this repo). New signups get a 7-day free trial with usage
  caps; a `starter`-plan org past its trial is redirected to a plain
  "get in touch" page rather than a self-serve upgrade, since no self-serve
  payment flow exists yet for WebGenie-the-tool's own subscription.
- Role-based access: admin (agency operator), partner (referral portal,
  read-only to their own data), beta (public trial signer-up), guest. Partner
  and beta logins are deliberately kept outside the main
  organization-membership table so they can never inherit full data access.
- Site generator covers 73 industries (14 hand-written + 59 templated),
  each producing a real site with working lead capture, a per-client photo
  override, and a shared "How It Works" section. A finished site can be
  one-click published to a real, permanent `<slug>.vibelabsagency.com` site.
- Billing is live-mode Stripe ($297/mo). A real live Checkout session has
  been created and visually confirmed through the actual UI; a real card
  has not yet been charged and paid out end-to-end — that is the one
  remaining unconfirmed step, not a build gap.
- Known open defect: `audit_logs` inserts fail Postgres RLS for real
  authenticated users even after the missing policy was re-added; root
  cause unresolved.
- Known limitation: a generated site's leads don't yet carry which agency
  built them, so all leads currently attribute to one organization —
  harmless with a single agency using the product today, a real gap before
  a second agency could use it.
- There is no global error boundary; most known instances of an uncaught
  throw surfacing as a raw Next.js error page have been fixed individually,
  but the underlying gap remains.

## Brand Commitments

- Agency brand is **VibeLabs Agency**; production domain
  `app.vibelabsagency.com`. Published client sites are provisioned at
  `<slug>.vibelabsagency.com`.
- **Deliberate visual contrast, load-bearing, do not collapse it:** the app
  chrome (the internal dashboard Cassey uses) is dark; every generated
  client website is light. The tool is meant to read as technical; the
  output is meant to read as friendly and local.
- Design tokens already in use: surface scale `void → canvas → surface →
  raised`, hairline borders `#1C212D`; accent colors are named `iris`
  (`#7C5CFF`, primary) and `neon` (`#22D3EE`, data/metadata) — Tailwind's
  stock `violet`/`cyan` utilities were deliberately renamed away and are
  **not** defined in this project.
- Typography already in use: Inter for UI text, JetBrains Mono for every
  number, ID, URL, and score.
- Every generated site ships `LocalBusiness`/`FAQPage`/`AggregateRating`
  JSON-LD — a stated sales differentiator; never strip it.

## Evidence on Hand

- **No completed case study or documented testimonial exists yet.** Even
  the project's own engineering notes state the status of a first WebGenie
  sale is unconfirmed from the repo alone.
- VibeLabs Agency / Simple Online Steps has real pre-existing clients that
  predate WebGenie's own branding/structure; no feedback has been
  systematically collected from them.
- One real, unsolicited piece of client feedback is on hand (see Operating
  Context): confusion about what's offered, for whom, and why. Treat this
  as a real, current signal about messaging clarity — not resolved, not to
  be papered over with invented clarity in future copy.
- **Do not fabricate testimonials, customer counts, logos, or before/after
  results** on any surface (marketing homepage, sales collateral, generated
  sample sites) until Cassey supplies real ones.
- `launch-kit/` holds real sales collateral (the Motion A call script, a
  sample audit report, a landing page draft) reflecting the intended pitch
  and tone, and is worth reading before writing new sales-facing copy.

## Product Principles

1. **Revenue over feature completeness.** Do not add product surface before
   the first ten paying customers — an explicit, standing rule from the
   project's own plan, not a general inference.
2. **Give, don't criticize.** Motion A's posture (handing someone a finished
   thing) is primary precisely because it beats Motion B's posture
   (telling someone their existing thing is bad) — proof-by-showing over
   persuasion-by-telling.
3. **Evidence-traced over invented.** Scores, audits, and on-site claims
   should trace to real checked data (real Google Places results, real
   captured evidence) — this discipline extends to design/marketing
   surfaces too: no fabricated proof, ever (see Evidence on Hand).
4. **Verify before trusting, always.** This project's own history is full
   of "built but not confirmed live" gaps caught only by checking the real
   system. The same standard applies to any claim a future design or copy
   change makes about what the product does.
5. **"What we offer, for whom, why" is a known, unresolved weak point.**
   Treat this as a live constraint on any homepage, pitch, or onboarding
   copy work — not a solved problem to design around.
