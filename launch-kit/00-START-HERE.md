# WebGenie AI — Program Plan

**Owner:** Cassey · **PM:** Claude · **Version:** 2.0 · **Date:** 3 August 2026
**Supersedes:** v1.0 (audit-first plan). See §10 for what changed and why.

---

## 1. Situation

You have an intelligence engine most funded startups would envy — eleven scoring
modules, blueprint generation, prompt packaging, multi-agent review, delivery
export, and a full SaaS administration layer. You also have zero customers, zero
revenue, and nothing running in production.

**The constraint was never engineering.** It was that the plan required a deployed
platform before a single conversation could happen. This version removes that
dependency.

---

## 2. Two motions

### Motion A — Businesses with NO website · **PRIMARY**

Find them on Google Maps. Build each a complete website *before* making contact.
Then call:

> *"I was looking for a plumber in Bentonville and found you, but noticed you don't
> have a website — so I went ahead and built you one. Would you like to see it?"*

Convert to **$297/month** covering the site, AI chat, voice receptionist,
missed-call text-back, review automation, booking, and CRM.

**Why this is primary:**

| | Motion A | Motion B |
|---|---|---|
| Competition for attention | **None** — nobody is selling them a website | Whoever built their current site |
| Emotional posture | You're giving them something | You're criticising their work |
| Proof required | They see it, and it's theirs | They must trust your judgement |
| Delivery effort | Minutes, generated | Days, custom |
| Revenue shape | Recurring from day one | Project, then maybe recurring |
| Infrastructure needed | **None** | Supabase + worker + Vercel |

That last row is the one that changes the plan.

### Motion B — Businesses with a BAD website · secondary

The audit funnel: free intelligence report → **$497** rebuild blueprint →
**$2,500–6,000** build → **$497–997/month** growth retainer.

Higher ticket, longer cycle, needs the platform deployed. Real and worth running —
but *after* Motion A produces income, not before.

---

## 3. Locked pricing

Your source documents proposed $99, $249, $299, $499, and DFY at two different
ranges. That ends here.

| Offer | Price | Motion |
|---|---|---|
| **Website + AI services** | **$297/mo** | A |
| Setup fee (optional — drop it to close) | $0–297 one-time | A |
| Intelligence Audit | **Free** | B |
| Rebuild Blueprint | **$497** one-time | B |
| Done-For-You Build | **$2,500–6,000** | B |
| Growth Retainer | **$497–997/mo** | B |

**Do not deviate during the first twenty customers.** Discounting before you know
your close rate destroys the only data that matters.

**Why the audit stays free:** its job is proof, not revenue. Charging $99 halves
the number of people who say yes to step one, in exchange for coffee money. The
retainer is the business.

**Why no setup fee on Motion A at first:** you want volume and case studies. Add
$297 once you have closed ten and know the pitch works.

---

## 4. Unit economics — the honest version

**Per client at $297/mo:**

| Line | Monthly |
|---|---|
| Revenue | $297 |
| Voice AI usage | ~$25 |
| Phone number + SMS | ~$12 |
| Site hosting | ~$2 |
| **Contribution** | **~$258** |

**Fixed cost:** GoHighLevel agency tier ~$297/mo (unlimited sub-accounts).
Google Places will be free at your volume.

| Clients | Gross | Fixed | **Net/mo** |
|---|---|---|---|
| 5 | $1,300 | $297 | **~$1,000** |
| 10 | $2,600 | $297 | **~$2,300** |
| 25 | $6,500 | $297 | **~$6,200** |
| 50 | $13,000 | $297 | **~$12,700** |

**Break-even is client two.** Everything after is margin.

> Modelled, not measured. Voice and SMS costs depend on call volume — a busy
> plumber will cost more than $25. Revisit after five clients with real invoices.

---

## 5. Effort per client

| Step | Time | Automated? |
|---|---|---|
| Find prospects (20 at once) | 30 sec | Yes |
| Generate 20 websites | Instant | Yes |
| Review a site before calling | 2 min | No — always do this |
| The call | 5–10 min | No |
| Onboarding after they say yes | 30–60 min | Partly |

**Roughly 100 dials → 25 conversations → 12 view the site → 4–6 close.**
Those ratios are estimates. Your first hundred calls replace them with facts —
that is their real purpose.

---

## 6. The four weeks

### Week 1 — Make it run locally

**Goal:** you can find prospects and generate sites on your own laptop.

- [ ] Open Claude Code in `C:\Projects\webgenie-ai`
- [ ] `npm install && npm run build` — **this has never been run.** Expect 2–3 failures
- [ ] Merge the v2 UI (CLAUDE.md §4), building between each step
- [ ] Get a Google Places key, add `GOOGLE_PLACES_API_KEY` to `.env.local`
- [ ] `npm run dev` → `/finder` → search one industry in one city
- [ ] **Open five generated sites and read them as a business owner would**

**Does NOT require:** Supabase, the worker, Vercel, auth, or a domain.

**Success test:** twenty real businesses found, twenty sites generated, and you
would be happy for a stranger to see any of them.

### Week 2 — First fifty calls

**Goal:** find out if the pitch works. Nothing else.

- [ ] Pick **one** industry and **one** metro. Recommended: plumbers or HVAC
- [ ] Generate 50 sites, export the CSV
- [ ] Call. The opener and full script are in `06-Motion-A-Call-Script.md`
- [ ] Log every call: no answer / not interested / viewed site / closed
- [ ] After 25 calls, stop, read your notes, adjust the opener once
- [ ] Target: **2–4 clients**

**The single most important instruction in this document: do not build anything
this week.** You will be tempted. The urge to improve the product is a way of
avoiding the phone.

### Week 3 — Deliver properly, then deploy

- [ ] Onboard your won clients for real (GoHighLevel sub-accounts, live sites)
- [ ] Wire the `/onboard` provisioning steps to real GoHighLevel API calls
- [ ] **Now** work `04-Deployment-Runbook.md` — Supabase, migrations, Vercel, worker
- [ ] Publish `02-Landing-Page.html` and point a domain at it
- [ ] Write up your first client as a case study with before/after

### Week 4 — Repeat, and open Motion B

- [ ] Another 50 calls in the same vertical. Your close rate should improve
- [ ] Run the audit funnel on 10 businesses that *do* have websites
- [ ] Send those audits using `01-Client-Audit-Report.html`
- [ ] Target cumulative: **8–12 recurring clients** = $2,400–3,600 MRR

---

## 7. What we are deliberately not building

AI image generation · the marketplace · white-label mode · industry template
marketplace · the 21-prompt library · Stripe · Sprint 11 · a mobile app ·
multi-user teams.

All documented. All real. **None produce revenue this quarter.**

The 21-prompt library is the strongest of these and a genuine Q4 product. Park it.

> **Standing rule:** if a request adds product surface before twenty paying
> clients, the PM answer is no. Ask twice if you disagree.

---

## 8. Metrics — track five, ignore the rest

| Metric | Target | What it tells you |
|---|---|---|
| Sites generated | 50/week | The only pure input |
| Dial → conversation | 25% | Whether you're calling at the right times |
| Conversation → site viewed | 45% | **Whether the opener works** |
| Site viewed → closed | 40% | Whether the site is good enough |
| MRR | $3,000 by day 60 | The only one that counts |

**If "site viewed" is low, the opener is wrong. If "closed" is low, the site is
wrong.** Those two tell you exactly where to look, which is why they are measured
separately.

---

## 9. Risks

| Risk | Likelihood | Response |
|---|---|---|
| Generated sites look generic at volume | Medium | Add industries and vary hero copy in `lib/sitegen/industries.ts`. Quality lives in that file |
| Cold calling doesn't convert | Medium | Fall back to direct mail with a printed screenshot, or walk in. The asset works on any channel |
| GoHighLevel onboarding is slower than 18 seconds | **High** | It will be. The demo is theatre; budget an hour per client until it's wired |
| Places returns businesses that do have sites | Low | The `websiteUri` check is reliable. Still verify before calling |
| Client churns after month two | Medium | Retention is the review automation and the monthly report. Show value or lose them |
| You keep building instead of calling | **High** | This is the real risk. See §7 |

---

## 10. What changed from v1.0, and why

**v1.0 was audit-first.** Free audit → $497 blueprint → build → retainer, gated
behind full production deployment.

**v2.0 makes the no-website motion primary.** Three reasons:

1. **It removes the deployment blocker.** v1.0 could not start until Supabase, the
   worker, and Vercel were live. v2.0 starts on your laptop this week.
2. **The screenshots describe a better funnel** than the one I originally designed.
   Giving someone a finished website beats telling them theirs is broken — no
   competition for attention, no criticism, and the pitch is one sentence.
3. **Recurring from day one.** v1.0's first sale was a $497 one-off. v2.0's first
   sale is $297/month.

The audit funnel is not cancelled. It is sequenced second, where it belongs — the
higher-ticket motion, funded by the platform Motion A pays for.

---

## 11. The kit

| File | Use it for |
|---|---|
| `00-START-HERE.md` | This plan. Re-read weekly |
| `01-Client-Audit-Report.html` | Motion B deliverable |
| `02-Landing-Page.html` | Inbound, week 3 |
| `03-Sales-Playbook.md` | Motion B: outreach, Loom script, calls, objections |
| `06-Motion-A-Call-Script.md` | **Motion A: the cold call. Your primary script** |
| `04-Deployment-Runbook.md` | Week 3, not week 1 |
| `05-Manual-Audit-Method.md` | Producing audits before the platform is live |
| `samples/SAMPLE-Generated-Site.html` | What Motion A delivers |
| `samples/WebGenie-Demo.html` | Screen-share on Motion B calls |

---

## 12. The one sentence

**Twenty websites can be generated and waiting inside an hour; the only untested
thing left is whether a plumber says yes — so make the call.**
