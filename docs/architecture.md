# WebGenie AI — Architecture Reference

> Extracted from CLAUDE.md during the 9 Sep 2026 memory reorganization. This covers current, specific architecture facts (repo layout, the data seam). For the original 5 ADRs ("do not relitigate"), see [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) in this same folder — not duplicated here. For the design-token/component system, see `DESIGN.md` at the repo root — also not duplicated here.

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
│   │   ├── partners/, partners/portal/  Admin partner console + partner self-service portal — see §2j
│   │   ├── invite/[token]/         Public invite-accept page (agency-staff and partner invites) — see §2j
│   │   ├── projects/, projects/[id]/  Report / blueprint / prompt viewers.
│   │   │                            projects/new is the bulk business-intake
│   │   │                            box (Google profile link / name / URL,
│   │   │                            up to 25 at once) — see §2n
│   │   ├── login/, signup/, auth/  Auth. Public self-serve signup + Google
│   │   │                          OAuth — see §2q (reopened; §2j is the
│   │   │                          history of why it was ever removed)
│   │   ├── forgot-password/, reset-password/  Password reset — see §2k
│   │   ├── settings/               Account settings
│   │   └── api/
│   │       ├── prospects/, demo-site/   Finder + site-gen routes
│   │       ├── projects/bulk/           New Project's bulk intake backend — see §2n
│   │       ├── billing/                 Stripe checkout + webhook
│   │       ├── site-chat/               AI intake chat widget backend
│   │       ├── site-lead/               Hero quote-form backend
│   │       ├── publish-site/            Real Vercel deployment, agency-only
│   │       ├── auth/create-account/     Server-side pre-confirmed account creation. Had no public UI
│   │       │                            entry point 30 Aug–1 Sep (§2j) — public again via /signup
│   │       │                            (§2q), and still reused internally by invite-accept
│   │       ├── auth/bootstrap/          Public, authenticated-only — creates a fresh signup's
│   │       │                            organization right after their first sign-in. Guarded to
│   │       │                            role "guest" only — see §2q for the privilege-escalation
│   │       │                            bug this guard fixes
│   │       ├── auth/request-reset/      Public — generates + emails a password-reset link (§2k)
│   │       ├── team/invite/             Admin-only — generates an agency-staff invite link (§2k;
│   │       │                            replaced the original inviteTeamMemberAction, which had a
│   │       │                            real bug — see §2k)
│   │       ├── partners/invite/         Admin-only — generates a partner's one-time portal invite link
│   │       ├── invite/accept/           Public — redeems an invite token, creates the account
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
│   │   ├── organizations.ts        getDefaultOrganizationId() — resolves *this agency's own*
│   │   │                           organization (org.is_default, migration 033) for its direct-
│   │   │                           intake routes; never .select().limit(1).single() — see
│   │   │                           docs/decisions.md and docs/history.md's 5 Sep 2026 entry
│   │   ├── stripe.ts               Stripe client + billing helpers
│   │   ├── auth/access.ts          The one place role (admin/partner/guest) is resolved — every gated
│   │   │                           page/route uses this, not an ad hoc auth.getUser() check. See §2j
│   │   ├── auth/reset-email.ts     Delivers Supabase recovery links via Resend, not Supabase's mailer — §2k
│   │   ├── partners/notify.ts      Emails a partner when their referral converts or gets paid — §2l
│   │   ├── jobs/, admin/, security/, visual/, format.ts, types.ts
│   │   └── supabase/               client / server / admin
│   └── workers/analysis-worker.ts  MUST run on a persistent host, not Vercel
├── supabase/migrations/            001–033, run in order
├── docs/                           Sprint checklists + architecture decisions
├── public/industry-photos/         Self-hosted hero photos referenced by absolute URL — see §2e
├── Dockerfile.worker               Container for the analysis worker
└── launch-kit/                     Sales assets (see §9)
```

`industry-photos/` also exists at the **repo root** (gitignored) — raw, unprocessed
source photos Cassey drops in for review before they're resized into
`public/industry-photos/`. Don't confuse the two; only the `public/` one is
ever deployed or referenced from code.

**Superseded — do not read, it will mislead you:**
- `C:\Users\User\Documents\SimpleOS Business-in-a-Box\WebGenie Intelligence Engine\WebGenie AI Production Repository v1.0.1\` — older snapshot stopping at Sprint 9.
- `C:\Users\User\projects\WebGenieMVP\` — this was the source of the v2 UI merge. **It has already been merged into this repo.** Do not re-merge it or treat it as a separate pending task.

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

