# Manual Audit Method — 20 minutes, no platform required

The WebGenie engine automates all of this. Until it's deployed, you can produce an identical
report by hand. **Your prospect cannot tell the difference, and does not care.**

Everything below uses free tools. Work through it in order and fill in
`01-Client-Audit-Report.html` as you go.

---

## Setup (once)

Open Chrome. Press **F12** to open DevTools, then **Ctrl+Shift+M** to toggle the device toolbar
(this is how you test at phone width). Set the device dropdown to **iPhone 12 Pro** — that's 390px,
the width most of your findings will reference.

---

## Check 1 — Speed (4 minutes)

**Tool:** [pagespeed.web.dev](https://pagespeed.web.dev)

Paste their homepage URL. Choose **Mobile**. Wait for the score.

**Record:**

| What you need | Where it is |
|---|---|
| LCP in seconds | "Largest Contentful Paint" in Core Web Vitals |
| CLS score | "Cumulative Layout Shift" |
| Total page weight | Bottom of the report, "Total size" |
| The offending image | Diagnostics → "Properly size images" → names the file and its size |

**Fills in:** `modules → Technical` score, and finding #1.

**Scoring guide:** LCP under 2.5s → 75+. 2.5–4s → 50–65. Over 4s → under 45.

> **The sentence that sells:** open Diagnostics → "Properly size images" and copy the actual
> filename and size. "Your `hero-office.jpg` is 2.4MB" is worth more than any score.

---

## Check 2 — The booking form (5 minutes)

**Tool:** their website, at phone width.

1. Navigate to their booking or contact page
2. **Count the input fields.** Count the ones marked required separately.
3. Try to actually complete it. Note anything that blocks you.
4. Scroll to the submit button. **Is it covered by a sticky bar?** This is extremely common on
   local business sites and it's the single most valuable thing you will find.
5. Note whether insurance, date of birth, or referral source are demanded up front.

**Fills in:** `modules → Conversion` and `UX`, and finding #2.

**Scoring guide:** 3–4 fields → 80+. 5–7 → 55–70. 8+ → under 45. If the submit button is
unreachable at 390px, score Conversion under 40 regardless of anything else.

> **Screenshot this one.** A picture of their own form with the submit button hidden behind the
> call bar is the most persuasive single asset in your entire sales process.

---

## Check 3 — AI search visibility (4 minutes)

This is your differentiator. Nobody else auditing local businesses is checking it.

**Part A — do they have structured data?**

Go to [validator.schema.org](https://validator.schema.org), paste their homepage URL, run it.

- Nothing found → AI Search score of 20–30
- Only `Organization` or `WebSite` → 35–45
- Industry schema (`Dentist`, `LocalBusiness`) plus `FAQPage` → 60+

**Part B — are they actually cited?**

Open ChatGPT (or Claude, or Perplexity) and ask, in a fresh chat:

> "Who are the best cosmetic dentists in Buckhead, Atlanta?"

Then:

> "I need veneers in Atlanta. Which practices should I look at?"

**Record whether they appear, and who does instead.** If a competitor is named and your prospect
isn't, that is the most alarming single fact you can put in front of them — and it's undeniable,
because they can reproduce it in thirty seconds.

**Fills in:** `modules → AI Search`, and finding #3.

---

## Check 4 — Trust placement (2 minutes)

1. Find their Google review count and rating (Google Maps, ten seconds)
2. Load their homepage at desktop width and scroll. **Where do reviews first appear?**
3. Do they have a before/after or results gallery? Is it linked from the homepage?

To get an exact scroll depth: in DevTools Console, paste
`document.querySelector('SELECTOR').getBoundingClientRect().top + window.scrollY`
— or just estimate. "Below the third scroll" is precise enough.

**Fills in:** `modules → Trust`, and finding #4.

**Scoring guide:** reviews in the first viewport → 80+. Mid-page → 60. Below 2,000px or absent → under 50.

---

## Check 5 — Pricing (1 minute)

Press **Ctrl+F** on their site and search for `$`. Check their services pages too.

Then check two local competitors the same way.

**Fills in:** `modules → Revenue`, and finding #5.

**Scoring guide:** ranges published with context → 80+. Some pricing → 60. Nothing at all → under 50.

---

## Check 6 — Accessibility (2 minutes)

**Tool:** the Lighthouse tab already in your DevTools (F12 → Lighthouse → Accessibility → Analyze).

Record the score and the top two failures. The two you'll see most often are insufficient colour
contrast and images missing alt text — both are easy to explain and easy to fix.

**Fills in:** `modules → Accessibility`.

---

## Check 7 — The competitors (5 minutes)

Pick three: two local rivals and one national brand doing it properly (for dentists, use **Tend**).

Run **Check 1** and **Check 3** on each — speed and structured data only. That's enough for a
credible comparison and takes 90 seconds per site.

**Fills in:** the `competitors` array.

---

## Scoring the remaining modules

Design, Brand, Content, SEO — judge these yourself. You are a professional; that is what they're
paying for. Guidelines:

| Module | Score it low when |
|---|---|
| **Design** | Many different font sizes, inconsistent spacing, mismatched button styles |
| **Brand** | Voice shifts between clinical and casual, no stated differentiator |
| **Content** | Service pages under 300 words, no answers to cost/pain/duration questions |
| **SEO** | Thin or duplicate title tags, blog that never links to service pages |

**Be honest and be consistent.** A 38 sells better than a generous 62, because the 82-after-we-fix-it
is what they're actually buying. But never invent a number you can't defend if challenged.

---

## Writing it up (5 minutes)

Open your copy of `01-Client-Audit-Report.html`, go to the CONFIG block, and fill in:

1. `client` — their details
2. `overallScore` — roughly the average of your eleven modules, rounded
3. `summary` — **write this last.** Three sentences: what's wrong, what it's costing, that it's fixable
4. `modules` — your eleven scores with a one-line note each
5. `findings` — your top five, worst first
6. `competitors` — from Check 7
7. `opportunities` — usually the same five, reworded for their industry
8. `packages` and `cta` — set once, leave alone

Save. Open it. **Read it as though you were them.** If a finding could be copy-pasted onto any
other website, delete it and use a more specific one.

---

## The quality bar

Before you send, check every finding against this:

- [ ] Names a real number, filename, or count from **their** site
- [ ] You could show it to them live in under ten seconds
- [ ] It states what it costs them in customers, not in points
- [ ] You would be comfortable if it were forwarded to their competitor

**If a finding fails any of those four, cut it.** Four specific findings beat eight vague ones.

---

## Realistic timing

- First one: 45 minutes. You'll be slow and that's fine.
- Third one: 25 minutes.
- Tenth one: 15 minutes, and you'll know what you're looking for before the page finishes loading.

**Ten prospects is an afternoon.** That afternoon is your entire week-3 pipeline.

---

## Why do this at all when the platform is coming

Three reasons, and they all matter:

1. **Revenue doesn't wait for infrastructure.** You can be sending reports this week.
2. **You'll find out what actually convinces people** before you've hard-coded assumptions into a
   product. Which findings get replies? Which get ignored? That's information you can only buy
   with real prospects.
3. **It tells you what the engine must get right.** When you deploy, you'll know exactly which
   outputs matter — because you'll have watched buyers react to them.

Doing ten by hand will make the automated version substantially better than building it in the dark.
