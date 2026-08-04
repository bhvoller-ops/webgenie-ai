# WebGenie AI — Deployment Runbook

Written against your actual repository at `C:\Projects\webgenie-ai`
(GitHub: `bhvoller-ops/webgenie-ai`, currently at commit `73f0c99`, in sync with origin).

**Time required:** one focused afternoon. **Cost:** $0 to start, ~$12/month once the worker runs.

---

## Before you start — fix one broken dependency

Your `package.json` pins `eslint-config-next` at `^0.2.4`. That is a package from 2020 built for
Next.js 9; your project is on Next 15. It is locked at that version in `package-lock.json`, which
means `npm run lint` cannot work and your GitHub Actions lint step is failing.

It does **not** block `next build`, so this is not what is stopping your deployment — but fix it
now while you are in there.

```bash
cd C:\Projects\webgenie-ai
npm install --save-dev eslint-config-next@^15.5.22 eslint@^9.17.0
```

Then commit:

```bash
git add package.json package-lock.json
git commit -m "Fix eslint-config-next version to match Next 15"
```

---

## Phase 1 — Supabase (30 minutes)

### 1.1 Create the project

1. Go to **supabase.com** → New project
2. Name: `webgenie-production`
3. Choose a region close to you (US East if you are on the east coast)
4. Generate a strong database password and **save it in your password manager immediately** —
   Supabase will not show it again
5. Wait for provisioning (~2 minutes)

### 1.2 Run the migrations — in order, one at a time

Open **SQL Editor** in the Supabase dashboard. Your migrations live at
`C:\Projects\webgenie-ai\supabase\migrations\`. Run all eleven, in this exact order, checking each
one succeeds before starting the next:

| # | File | What it creates |
|---|---|---|
| 001 | `001_foundation.sql` | Workspaces, projects, references |
| 002 | `002_bootstrap_and_rls.sql` | New-user bootstrap, row-level security |
| 003 | `003_capture_engine.sql` | Capture jobs and stored artifacts |
| 004 | `004_intelligence_scoring.sql` | Module scores and findings |
| 005 | `005_blueprint_generator.sql` | Website blueprints |
| 006 | `006_prompt_intelligence.sql` | Prompt packages |
| 007 | `007_visual_intelligence.sql` | Vision model output |
| 008 | `008_ai_copywriter.sql` | Content packages |
| 009 | `009_multi_agent_orchestration.sql` | Specialist review runs |
| 010 | `010_delivery_and_implementation.sql` | Delivery packaging |
| 011 | `011_saas_administration.sql` | Plans, usage, roles, API keys, billing |

**Do not skip ahead or batch them.** Later migrations depend on earlier ones and the failure
messages are unhelpful if you run them out of sequence.

### 1.3 Storage

Go to **Storage**. Confirm a bucket named `website-captures` exists. If it does not, create it
and set it to **Private** — it holds full-page screenshots of client websites and must never be
publicly listable.

### 1.4 Collect your keys

**Settings → API.** Copy these three and keep them somewhere safe for the next phase:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

> **The `service_role` key bypasses all row-level security.** It goes in Vercel and your worker
> host and nowhere else. Never in client code, never in a repo, never in a screenshot.

---

## Phase 2 — Vercel (20 minutes)

### 2.1 Import

1. **vercel.com/new** → Import Git Repository → `bhvoller-ops/webgenie-ai`
2. Framework preset: **Next.js** (your `vercel.json` already sets this)
3. Do **not** deploy yet — add the environment variables first, or the first build fails and
   confuses you

### 2.2 Environment variables

Add each of these to **Production** and **Preview**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From 1.4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From 1.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | From 1.4 |
| `BILLING_WEBHOOK_SECRET` | Any long random string — generate one, do not type one |
| `VISUAL_AI_PROVIDER` | `heuristic` |

Leave `VISUAL_AI_API_KEY`, `VISUAL_AI_MODEL`, and `VISUAL_AI_BASE_URL` empty for now. The
heuristic provider works without a vision model and costs nothing. Add a real model later once
you have customers and can judge whether it improves the output enough to pay for.

`GITHUB_TOKEN`, `VERCEL_TOKEN`, and `NETLIFY_TOKEN` are optional delivery integrations. Skip them.

### 2.3 Deploy

Hit Deploy. Expect 2–4 minutes.

**If the build fails,** read the actual error — do not guess. The two most likely causes:

- A TypeScript error that only surfaces in a clean environment. Run `npm run typecheck` locally
  and fix what it reports.
- A missing environment variable. The error will name it.

### 2.4 Point Supabase Auth back at Vercel

Return to Supabase → **Authentication → URL Configuration**:

- **Site URL:** your Vercel production URL
- **Redirect URLs:** add both your production URL and `https://*-your-team.vercel.app` so preview
  deployments can authenticate too

Miss this and login will appear to work but redirect to nowhere.

---

## Phase 3 — The worker (30 minutes)

**This is the step people skip, and then nothing analyses.**

The worker polls for queued jobs and launches Chromium to capture websites. It cannot run on
Vercel — serverless functions time out and cannot hold a browser process. It needs a persistent
container.

### 3.1 Deploy to Railway (simplest option)

1. **railway.app** → New Project → Deploy from GitHub → `webgenie-ai`
2. Settings → **Dockerfile Path**: `Dockerfile.worker`
3. Add environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as Vercel |
| `VISUAL_AI_PROVIDER` | `heuristic` |

4. Deploy. Watch the logs until you see the polling loop start.

**Render and Fly.io both work equally well.** Railway is the least configuration.

> **Run exactly one worker instance.** Your `DEPLOYMENT_READINESS_REPORT.md` flags this and it is
> correct: job claiming is not atomic, so two workers will both grab the same job and you will
> get duplicated or corrupted analyses. One replica is plenty for your first fifty customers.
> Add a PostgreSQL claim function before you scale.

---

## Phase 4 — The acceptance test

**Do not tell anyone the platform is live until every one of these passes.** If a step fails,
fix it before moving on — a half-working pipeline produces reports you cannot send.

- [ ] 1. Open your production URL. The page loads.
- [ ] 2. Register a new account with a real email address.
- [ ] 3. Confirm the email and log in successfully.
- [ ] 4. A workspace was created automatically (this is the 002 bootstrap migration working).
- [ ] 5. Create a project.
- [ ] 6. Add one public website reference — **use your own site**, not a client's.
- [ ] 7. Queue an analysis.
- [ ] 8. **Watch the worker logs.** The job is claimed within 60 seconds.
- [ ] 9. Status advances through capturing → extracting → analyzing → scoring → completed.
- [ ] 10. Screenshots appear in the `website-captures` bucket.
- [ ] 11. Open the intelligence report. Eleven module scores are present with real findings.
- [ ] 12. A blueprint was generated.
- [ ] 13. Generate a content package.
- [ ] 14. Generate a prompt package.
- [ ] 15. Run the multi-agent orchestration and approve the review.
- [ ] 16. Generate and download the delivery ZIP. **Open it** and confirm the files are real.
- [ ] 17. Visit `/settings`. Plan, usage, and team sections render.
- [ ] 18. Create an API key. It displays exactly once.
- [ ] 19. Test it: `curl -H "Authorization: Bearer YOUR_KEY" https://YOUR-URL/api/v1/projects`
- [ ] 20. Confirm none of the above required you to touch the database manually.

**Step 20 is the real test.** If you had to run SQL by hand at any point, the pipeline is not
ready for customers.

---

## When something breaks

**Analysis stays "queued" forever**
The worker is not running or cannot reach Supabase. Check its logs. Ninety percent of the time
this is a missing or mistyped `SUPABASE_SERVICE_ROLE_KEY`.

**Capture fails on a specific site**
Some sites block headless browsers. Note the URL and move on — do not rebuild the capture engine
for one uncooperative website. If it is a prospect's site, take screenshots manually and fill in
`01-Client-Audit-Report.html` by hand. The client cannot tell.

**Login redirects to a blank page**
Section 2.4. Your redirect URLs are wrong.

**"Row level security" errors**
Migration 002 did not apply cleanly. Re-run it and check for errors in the SQL Editor output.

**Build succeeds locally, fails on Vercel**
Almost always a case-sensitivity issue. Windows does not care about `Button.tsx` versus
`button.tsx`; Vercel's Linux build does. Check your import paths.

---

## What you are deliberately not doing yet

Your own launch plan is right about this, and the order matters:

- **Stripe billing** — the webhook boundary exists but is not connected. Invoice manually for
  your first ten customers. It takes four minutes per invoice and teaches you what to automate.
- **Transactional email** — team invitations are stored but never sent. Send them yourself.
- **Error monitoring** — add Sentry after ten customers, not before.
- **Custom domain** — do it, but after the acceptance test passes.

---

## The honest note about the front end

Once deployed, your app works but looks like a prototype — `app-shell.tsx` is 34 lines and
`globals.css` is 15. The v2 design system in `C:\Users\User\projects\WebGenieMVP` ports onto it
cleanly (the type contracts are byte-identical, so the engine needs no changes at all).

**Do that after the acceptance test passes, not before.** And note that it does not block selling
at all: `01-Client-Audit-Report.html` is what your prospects actually see, and it is already
finished. The platform is your production line; the report is your product.
