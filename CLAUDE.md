# WebGenie AI — Project Context

> Read this first. It is the handoff from a long planning and design session and
> contains decisions, verified facts, and traps that are not obvious from the code.
> Last updated: 3 August 2026.

---

## 1. What this is

WebGenie AI turns a local business's web presence into revenue for the agency
running it. Two motions share one engine:

**Motion A — Businesses with NO website (primary, cold outreach).**
Find them on Google Maps, generate a complete website for each one before making
contact, then call: *"I noticed you don't have a website, so I built you one.
Would you like to see it?"* Convert to **$299/mo** covering hosting, AI chat,
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
| Database migrations `001`–`011` | **Written**, not yet run against a production Supabase project |
| Deployed to Vercel | Yes — but against an incomplete backend; the live UI is a prototype |
| Production Supabase project | **Not created yet.** This is the #1 blocker |
| Analysis worker | **Not deployed.** Without it, nothing analyses |
| Front-end design system | **Does not exist in this repo.** `globals.css` is 15 lines, `app-shell.tsx` is 34 |
| Prospect Finder / Site Generator / Onboarding | Built in a separate folder, **not yet merged** (see §4) |
| Stripe billing | Webhook boundary exists, not connected. Invoice manually |
| Transactional email | Invites stored, never sent. Send manually |

**Nothing has been sold yet. No customer has seen a report.**

---

## 3. Repository map

```
C:\Projects\webgenie-ai\            ← THIS REPO. Git → github.com/bhvoller-ops/webgenie-ai
├── CLAUDE.md                       ← you are here
├── src/
│   ├── app/                        Next.js 15 App Router
│   ├── lib/
│   │   ├── capture/                Playwright capture + feature extraction
│   │   ├── intelligence/           11 scoring modules — the core IP
│   │   ├── blueprint/              Rules → sitemap, tokens, components
│   │   ├── prompts/                Platform adapters for 9 AI builders
│   │   ├── copy/                   AI copywriter
│   │   ├── orchestration/          Multi-agent specialist review
│   │   ├── delivery/               ZIP / GitHub packaging
│   │   └── supabase/               client / server / admin
│   ├── workers/analysis-worker.ts  MUST run on a persistent host, not Vercel
│   └── middleware.ts               Auth
├── supabase/migrations/            001–011, run in order
├── docs/                           Sprint checklists + architecture decisions
└── launch-kit/                     Sales assets (see §9)

C:\Users\User\projects\WebGenieMVP\ ← v2 UI + new features. NOT yet merged. See §4
```

**Superseded — do not read, it will mislead you:**
`C:\Users\User\Documents\SimpleOS Business-in-a-Box\WebGenie Intelligence Engine\WebGenie AI Production Repository v1.0.1\`
is an older snapshot stopping at Sprint 9 / migration 009. This repo is ahead of it.

---

## 4. FIRST TASK — merge the v2 UI

Everything below exists and typechecks cleanly (verified, `tsc --noEmit` exit 0),
but lives in `C:\Users\User\projects\WebGenieMVP` and must be brought in.

### Why it is not already merged

This repo's `tsconfig.json` includes `**/*.ts`. Copying the v2 source in without
wiring it up breaks the build and stops Vercel deploying. The merge needs a real
`npm run build` after each step. That is your job.

### What to bring over

| From `WebGenieMVP/src/` | What it is |
|---|---|
| `app/globals.css` + `tailwind.config.ts` | The design system. **Start here** |
| `components/ui.tsx`, `shell.tsx` | Primitives + app chrome |
| `components/score-ring.tsx`, `module-card.tsx`, `recommendation-card.tsx`, `evidence.tsx`, `tabs.tsx`, `markdown.tsx`, `copy-button.tsx`, `revenue.tsx`, `prompt-explorer.tsx` | Report + blueprint viewers |
| `lib/format.ts` | `cn`, score bands, formatters |
| `lib/sitegen/**` | **Demo site generator — the Motion A product** |
| `lib/prospect/finder.ts` | Google Places + sample fallback |
| `app/finder/`, `app/onboard/` | The two new product screens |
| `app/api/prospects/`, `app/api/demo-site/` | Their routes |
| `lib/data/` | Fixtures + provider seam |

### Order of work

1. `globals.css` + `tailwind.config.ts` first. Build. The existing app will look
   different but must still compile.
2. `lib/format.ts`, then `components/ui.tsx` + `shell.tsx`. Replace `app-shell.tsx`
   with `shell.tsx`, keeping the existing `signOut` server action wired in.
3. `lib/sitegen/**` + `lib/prospect/**` + the two API routes. Build.
4. `app/finder` + `app/onboard`. Build. These are self-contained.
5. Report/blueprint/prompt viewers last — they need the real Supabase data layer
   swapped in behind `lib/data/provider.ts` (see §6).

**Do not skip the build between steps.** Windows is case-insensitive and Vercel's
Linux build is not; a wrong-cased import will pass locally and fail in production.

### Type contracts are identical — verified

`lib/intelligence/types.ts` and `WebsiteBlueprint` in `lib/blueprint/types.ts`
are byte-identical between this repo and the v2 folder. **The engine needs zero
changes.** Do not "helpfully" refactor these — they are the schema contract for
stored JSON artifacts.

---

## 5. Architecture decisions (do not relitigate)

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

## 6. The data seam

Every v2 page reads through `lib/data/provider.ts` and nothing else. It currently
returns fixtures. To go live, replace each function body with a Supabase query —
return types already match the engine's artifacts, so **no component changes**:

```ts
export async function getIntelligence(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("website_intelligence")
    .select("artifact")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return (data?.artifact as WebsiteIntelligenceOutput) ?? null;
}
```

Keep the seam. Do not let Supabase calls leak into components.

---

## 7. Design system

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

## 8. Integration points

### Google Places — `lib/prospect/finder.ts`
Set `GOOGLE_PLACES_API_KEY` in `.env.local`. Enable **Places API (New)** — the
legacy API uses different endpoints and this code targets the new one. Falls back
to deterministic sample data when absent, so the UI always works.
Free tier is 5,000 Text Search calls/month; one call returns ~20 businesses.
Realistic usage is ~1% of that. Set a $10 budget cap anyway.

### GoHighLevel (or equivalent) — `app/onboard`
The ten provisioning steps are correctly sequenced but currently simulated. Each
should fire a real API call: create sub-account, import profile, provision voice
agent, configure review automation, build pipeline. Website generation is already
real and needs no external service.

### Site generator — `lib/sitegen/`
Pure function: `Business` + `IndustryProfile` → complete standalone HTML.
14 industries. Every generated site emits `LocalBusiness`-family + `FAQPage` +
`AggregateRating` JSON-LD. **That schema layer is the sales differentiator** —
it means the site is visible to ChatGPT and Perplexity on day one. Do not strip it.

To add an industry: add one entry to `INDUSTRIES` in `lib/sitegen/industries.ts`.
Write the services, trust points, and FAQ answers *properly* — the quality of the
generated site lives almost entirely in that file.

---

## 9. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server + worker only. Bypasses RLS. Never client-side
BILLING_WEBHOOK_SECRET=           # long random string
VISUAL_AI_PROVIDER=heuristic      # heuristic costs nothing and works
GOOGLE_PLACES_API_KEY=            # optional; sample data without it
```

---

## 10. Priorities — what to build and what to refuse

The authoritative plan is `launch-kit/00-START-HERE.md` (v2.0). If this section ever
disagrees with it, that file wins.

**In order:**
1. **`npm install && npm run build`.** This has never been run. Establish a green
   baseline before changing anything, or you will not know what the merge broke.
2. **Merge the v2 UI (§4).** Build between every step.
3. **`GOOGLE_PLACES_API_KEY` + `npm run dev` → `/finder`.** Generate twenty real
   sites. Read five of them as a business owner would.
4. **Fifty cold calls** (`launch-kit/06-Motion-A-Call-Script.md`). Build nothing
   during this week.
5. **Then** production Supabase + migrations 001–011 + worker → one end-to-end run
   with no manual database intervention.

**Why deployment is fifth, not first.** Motion A — find a business with no website,
generate them one, call them — is a pure function. No database, no auth, no worker,
no Vercel. It runs on `npm run dev`. Deployment is required for Motion B (the audit
funnel) and for being a real product, but it is not required for the first sale.
Sequencing it first is what kept this project pre-revenue.

**Actively do not build** unless Cassey asks twice: AI image generation, the
marketplace, white-label mode, the industry template marketplace, the 21-prompt
library, Stripe, or Sprint 11. All are documented, all are real, none of them
produce revenue this month.

> The governing rule from the launch plan: **stop adding features and launch.**
> If a request would add surface area before the first ten customers, say so.

---

## 11. Known traps

- **`eslint-config-next` is pinned at `^0.2.4`** — a 2020 package for Next 9, locked
  in `package-lock.json`. `npm run lint` cannot work and CI lint is failing. Fix with
  `npm install --save-dev eslint-config-next@^15.5.22 eslint@^9.17.0` so
  `package.json` and the lockfile update together. Editing one without the other
  breaks `npm ci`, which both GitHub Actions and `Dockerfile.worker` depend on.
- **Run exactly one worker replica.** Job claiming is not atomic; two workers will
  claim the same job. Add a Postgres claim function before scaling.
- **Windows vs Linux case sensitivity.** The most common cause of "builds locally,
  fails on Vercel".
- **Supabase Auth redirect URLs** must include both production and
  `https://*-your-team.vercel.app`, or login redirects to a blank page.
- **Migrations must run in order, one at a time.** Out-of-sequence failures produce
  unhelpful errors.
- **Some sites block headless capture.** Note the URL and move on. Do not rebuild
  the capture engine for one uncooperative website.

---

## 12. Verified vs assumed

**Verified in a sandbox on 3 Aug 2026:**
- `tsc --noEmit` exits 0 across the entire v2 codebase
- Generated site: 23,848 bytes, balanced tags, both JSON-LD blocks parse as valid
  JSON (`@type: Plumber`, `@type: FAQPage`), 5 click-to-call links
- Industry switching works (plumber and dentist both generate correctly)
- JavaScript in all standalone HTML deliverables parses cleanly

**Assumed, never seen rendered:**
- How any of it *looks*. There was no browser available. Visual QA has not happened.
- That `npm run build` succeeds. Only `tsc --noEmit` was run — a full Next build
  was never completed.

**Run `npm run build` early and treat the first failure as expected, not alarming.**

---

## 13. Working style

Cassey is not a developer and is optimising for speed to revenue. She has been
burned by long silent work periods with nothing to show.

- Show something openable early rather than a perfect thing later
- State plainly what is verified versus what you believe
- Push back when a request adds scope before the first ten customers
- Do not narrate tool calls; report outcomes
- When something breaks, say so directly and give the next concrete step
