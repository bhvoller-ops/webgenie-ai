import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Handshake,
  Minus,
  Phone,
  PhoneCall,
  Plus,
  Radar,
  Repeat,
  Rocket,
  ScanLine,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, Panel, Pill } from "@/components/ui";
import { ScoreRing } from "@/components/score-ring";
import { getAccessContext } from "@/lib/auth/access";
import { SAMPLE_BUSINESSES } from "@/lib/sitegen/samples";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import { industryList as GALLERY_TEMPLATE_LIST } from "@/data/gallery/industries";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WebGenie AI — The Client-Acquisition Workspace for Agencies",
  description:
    "Find the right local business, verify the opportunity with real evidence, and prepare something worth showing before you ever call. The client-acquisition workspace for agencies — 7-day full-access trial, no credit card required.",
};

/**
 * Public SaaS Impeccable rebuild (this build). / is the public marketing
 * funnel for a stranger who's never heard of WebGenie. A signed-in visitor
 * never sees it — the redirect below sends them to their real home first.
 *
 * P0 (VibeLabs brand-relationship + centering pass): the page architecture
 * is now built around a consistent centered shell (see
 * components/shell.tsx's PUBLIC_SHELL_PADDING) with intentional alignment
 * choices layered on top -- major section introductions and the hero are
 * centered (adapted from vibelabsagency.com's own composition discipline:
 * centered nav, centered hero, full-width bands with centered content,
 * alternating section rhythm), while comparison-table contents, feature
 * explanations, FAQ answers, and gallery cards stay left-aligned where
 * scanning benefits. WebGenie keeps its own violet accent and its own
 * copy throughout -- nothing here is copied from VibeLabs' site, which was
 * used only as directional inspiration for layout discipline, per the
 * task's explicit "do not clone it."
 *
 * Positioning: WebGenie is the client-acquisition *workspace* for agencies
 * -- not a CRM, not a lead database, not an autonomous outreach system, and
 * not a promise that clients close themselves. The human performs every
 * outreach step; WebGenie finds the opportunity, verifies it with evidence,
 * and prepares the material for the call. Every count and claim below is
 * derived from real product state (INDUSTRIES / the gallery's own
 * industryList) or explicitly labeled illustrative -- see docs/history.md
 * and CLAUDE.md §2 for what's actually shipped.
 */
const REAL_INDUSTRY_COUNT = Object.keys(INDUSTRIES).length;
// Same canonical source /gallery itself renders from (GALLERY_INDUSTRIES in
// lib/sitegen/gallery-industries.ts is a deliberately narrower, picker-only
// subset that excludes industries with a richer SiteGenIndustryKey
// equivalent -- not what a visitor sees when browsing /gallery).
const GALLERY_TEMPLATE_COUNT = GALLERY_TEMPLATE_LIST.length;

export default async function HomePage() {
  const { user, role, trialExpired } = await getAccessContext();

  if (user) {
    if (role === "admin") redirect(trialExpired ? "/trial-expired" : "/projects/new");
    if (role === "partner") redirect("/partners/portal");
    if (role === "beta") redirect("/trial/portal");
    // Signed in, but nothing assigned to this account yet.
    return (
      <PageShell role="guest">
        <Panel className="mt-10">
          <h1 className="text-2xl font-semibold text-ink">Your account isn&apos;t set up with access yet</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            You&apos;re signed in, but nothing has been assigned to this account. Ask whoever invited you to grant access.
          </p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell role="guest">
      <Hero />
      <Band tone="soft">
        <TrustStrip />
      </Band>
      <CoreProblem />
      <Band tone="soft">
        <ProductWorkflow />
      </Band>
      <ProductProof />
      <Band tone="soft">
        <Differentiation />
      </Band>
      <WhoItsFor />
      <Band tone="soft">
        <Examples />
      </Band>
      <Plans />
      <Band tone="soft">
        <Faq />
      </Band>
      <FinalCta />
    </PageShell>
  );
}

/** Shared vertical rhythm between sections -- ~56-72px mobile, ~96-128px desktop. */
const SECTION = "py-14 sm:py-24 lg:py-32";
const SECTION_PLAIN = "mt-14 sm:mt-24 lg:mt-32";

/**
 * Full-width background band containing centered content -- adapted from
 * vibelabsagency.com's alternating panel/plain rhythm. Breaks out of the
 * page shell's own max-width to span the viewport (the standard
 * `left-1/2 -mx-[50vw] w-screen` trick, anchored to the viewport rather
 * than any ancestor's padding), then re-centers its children at the same
 * max-width + responsive padding as the rest of the shell so nothing
 * inside a band ever misaligns with the sections above/below it.
 */
function Band({ children, tone = "soft" }: { children: ReactNode; tone?: "soft" }) {
  return (
    <div className={cn("relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-hairline", tone === "soft" && "bg-surface/30")}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A. Hero -- centered composition                                     */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade opacity-[0.3]"
        style={{ backgroundSize: "56px 56px", maskImage: "radial-gradient(900px 420px at 50% -10%, #000, transparent)" }}
        aria-hidden
      />
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-iris-soft">Client acquisition for agencies</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-[clamp(2.375rem,1.4rem+4vw,4.25rem)] font-semibold leading-[1.05] tracking-tight text-ink">
        Find the right business. <span className="gradient-text">Start with something real.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-[720px] text-base leading-relaxed text-ink/80 sm:text-lg">
        WebGenie helps agencies find local prospects, verify the opportunity, prepare
        evidence-backed outreach and manage every next step.
      </p>

      <div className="mx-auto mt-9 flex max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
        <Button href="/signup" className="w-full sm:w-auto">
          Start Free
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button href="#how-it-works" variant="secondary" className="w-full sm:w-auto">
          See WebGenie in Action
        </Button>
      </div>
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-faint">
        <span>7-day full-access trial</span>
        <span aria-hidden>·</span>
        <span>No credit card required</span>
        <span aria-hidden>·</span>
        <span>Human-executed outreach</span>
      </p>

      <HeroProductWalkthrough />
    </section>
  );
}

/**
 * The hero's visual proof -- a single substantial, centered panel
 * (~1100px, matching vibelabsagency.com's "Meet Vivi" panel weight)
 * spanning the width beneath the headline, instead of a small card pushed
 * to one side. Walks through the same four real stages every prospect
 * actually moves through -- Find prospect -> Verify opportunity -> Prepare
 * outreach -> Take the next action -- using the app's real component
 * patterns (a Finder-shaped result row, the real ScoreRing component, a
 * Daily Queue row) rather than an abstract icon list. One sample business
 * carried through all four stages for narrative continuity; explicitly
 * labeled illustrative throughout -- this is not a screenshot, and no
 * fabricated metric appears anywhere in it.
 */
function HeroProductWalkthrough() {
  const biz = SAMPLE_BUSINESSES.find((b) => b.id === "sample-plumber")!;
  return (
    <div className="mt-14 text-left lg:mt-16">
      <div className="panel mx-auto max-w-[1100px] overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          <div className="p-6">
            <StageLabel index={1} title="Find prospect" />
            <div className="mt-4 rounded-lg border border-hairline bg-canvas/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{biz.name}</span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-[13px]">
                  <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                  <span className="font-mono text-faint">{biz.rating}</span>
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted">
                {biz.city}, {biz.state} · no website found
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center p-6 text-center">
            <StageLabel index={2} title="Verify opportunity" center />
            <div className="mt-4">
              <ScoreRing score={46} size={92} stroke={8} label="Website Health" sublabel="Illustrative example" />
            </div>
          </div>

          <div className="p-6">
            <StageLabel index={3} title="Prepare outreach" />
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-hairline bg-canvas/60 p-3">
                <p className="text-sm font-medium text-ink">Demo site generated</p>
                <p className="mt-0.5 text-sm text-muted">Ready before the call</p>
              </div>
              <div className="rounded-lg border border-hairline bg-canvas/60 p-3">
                <p className="text-sm font-medium text-ink">Playbook script ready</p>
                <p className="mt-0.5 text-sm text-muted">Suggested opening & next action</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6">
            <StageLabel index={4} title="Take the next action" />
            <div className="mt-4 rounded-lg border border-iris/30 bg-iris/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-iris-soft">
                <PhoneCall className="h-3.5 w-3.5" aria-hidden />
                Call {biz.phone}
              </p>
              <p className="mt-1.5 text-sm text-muted">You make the call — WebGenie prepared everything before it.</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-faint">
        Illustrative example — the same connected flow every real prospect moves through.
      </p>
    </div>
  );
}

function StageLabel({ index, title, center = false }: { index: number; title: string; center?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", center && "justify-center")}>
      <span className="font-mono text-[13px] tracking-wide text-faint">{String(index).padStart(2, "0")}</span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B. Trust / positioning strip                                        */
/* ------------------------------------------------------------------ */

const TRUST_ITEMS = [
  "Built for agency owners and sales teams",
  "Human-executed outreach",
  "Evidence-backed opportunity",
  "No automatic spam",
];

function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-5 text-center">
      {TRUST_ITEMS.map((item, i) => (
        <span key={item} className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted">{item}</span>
          {i < TRUST_ITEMS.length - 1 ? <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden /> : null}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C. Core problem — one centered argument + horizontal examples        */
/* ------------------------------------------------------------------ */

const PROBLEM_EXAMPLES = [
  {
    icon: ScanLine,
    title: "The right business never gets called.",
    body: "A great fit sits three pages down in a search nobody finishes.",
  },
  {
    icon: Radar,
    title: "A pitch with nothing behind it.",
    body: "Guessing what's wrong with their site is not the same as showing them.",
  },
  {
    icon: Repeat,
    title: "A good call with no next step.",
    body: "Without a queue, yesterday's promising lead quietly disappears.",
  },
];

function CoreProblem() {
  return (
    <div className={SECTION_PLAIN}>
      <div className="mx-auto max-w-[68ch] text-center">
        <h2 className="text-display-md font-semibold text-ink">
          Building services is not the hard part. Building a repeatable client-acquisition
          process is.
        </h2>
        <p className="mx-auto mt-5 max-w-[68ch] text-base leading-relaxed text-ink/80">
          Most agencies can deliver good work. What they don&apos;t have is a dependable way to
          find the next business worth calling — one that&apos;s actually a fit, not a guess from
          a spreadsheet. WebGenie doesn&apos;t replace outreach; it replaces the guessing that
          comes before it. It finds businesses with a real, evidence-backed reason to talk to
          you, then prepares the exact thing you&apos;d want in hand before that call — a working
          demo site or an audit that shows, not tells. You still make the call. You just stop
          wondering who to call and what to say.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-8 border-t border-hairline pt-8 sm:grid-cols-3">
        {PROBLEM_EXAMPLES.map((example) => (
          <div key={example.title} className="flex flex-col gap-2">
            <example.icon className="h-4 w-4 text-signal-bad" aria-hidden />
            <p className="text-sm font-semibold text-ink">{example.title}</p>
            <p className="text-sm leading-relaxed text-muted">{example.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D. Product workflow — nav anchor "Product" — full-width band         */
/* ------------------------------------------------------------------ */

const WORKFLOW_STAGES = [
  { icon: ScanLine, title: "Find", body: "Search a market with Finder — every result is scored, not just no-website businesses." },
  { icon: Radar, title: "Verify", body: "Confirm the opportunity with real evidence, traced to a specific audit finding — never a guess." },
  { icon: Sparkles, title: "Prepare", body: "Generate a demo site or an audit, plus a script from the Playbook — before you ever dial." },
  { icon: Phone, title: "Contact", body: "Reach out yourself, with something specific to show — WebGenie never contacts anyone for you." },
  { icon: Repeat, title: "Follow up", body: "Every call, outcome, and next step logged in the Daily Queue, so nothing falls through." },
  { icon: Handshake, title: "Win & hand off", body: "Close the deal, then onboard the client in the same workspace." },
];

function ProductWorkflow() {
  return (
    <div id="product" className={cn(SECTION, "scroll-mt-24")}>
      <SectionIntro
        title="One connected process, not six separate tools"
        description="Every stage below ships today — the same workflow a signed-in account actually runs, not a roadmap."
      />
      <ol className="relative mt-10 grid grid-cols-1 gap-8 text-left sm:grid-cols-3 lg:grid-cols-6">
        <div aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-hairline lg:block" />
        {WORKFLOW_STAGES.map((stage, i) => (
          <li key={stage.title} className="relative flex flex-col items-start">
            <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-iris/30 bg-void">
              <stage.icon className="h-4 w-4 text-iris-soft" aria-hidden />
            </span>
            <span className="mt-4 font-mono text-[13px] tracking-wide text-faint">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-1 text-sm font-semibold text-ink">{stage.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{stage.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* E. Product proof — nav anchor "How It Works"                        */
/* ------------------------------------------------------------------ */

/** Same curated fixture businesses /samples uses — nothing here is a real business. See lib/sitegen/samples.ts. */
const FINDER_PREVIEW = SAMPLE_BUSINESSES.filter((b) => ["sample-plumber", "sample-hvac", "sample-electrician"].includes(b.id));

const QUEUE_PREVIEW: Array<{ name: string; priority: "warn" | "good" | "neutral"; note: string }> = [
  { name: "Cornerstone Plumbing Co.", priority: "warn", note: "No website — demo ready" },
  { name: "Southern Comfort Heating & Air", priority: "good", note: "Follow-up due today" },
  { name: "Bright Line Electric", priority: "neutral", note: "Audit complete, awaiting call" },
];

function ProductProof() {
  return (
    <div id="how-it-works" className={cn(SECTION_PLAIN, "scroll-mt-24")}>
      <SectionIntro
        title="See it work, not just hear about it"
        description="Three real moments from the actual product — illustrative businesses throughout, real product behavior."
      />

      <div className="mt-10 grid gap-4 text-left lg:grid-cols-3">
        {/* Finder */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">A prioritized list, not a pile of leads</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Illustrative Finder results — every real search returns a list shaped like this,
              sorted so you call the easiest yes first.
            </p>
          </div>
          <div className="space-y-2 p-4">
            {FINDER_PREVIEW.map((b) => (
              <div key={b.id} className="rounded-lg border border-hairline bg-canvas/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{b.name}</span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-[13px]">
                    <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                    <span className="font-mono text-faint">
                      {b.rating} ({b.reviewCount})
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[13px] font-medium text-signal-warn">
                    <Bot className="h-2.5 w-2.5" aria-hidden />
                    No AI Receptionist
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[13px] font-medium text-signal-warn">
                    <Clock className="h-2.5 w-2.5" aria-hidden />
                    No 24/7 Coverage
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified opportunity */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">Don&apos;t tell them it&apos;s weak. Show them why.</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Illustrative example — every real audit runs the same 11-module engine and traces
              each finding back to real evidence, never a guess.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 p-5">
            <ScoreRing score={46} size={140} stroke={9} label="Website Health" sublabel="Illustrative example" />
            <ul className="w-full space-y-2">
              <li className="flex gap-2 text-sm leading-relaxed text-muted">
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-signal-bad" aria-hidden />
                No way to text or chat — every lead has to call during business hours
              </li>
              <li className="flex gap-2 text-sm leading-relaxed text-muted">
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-signal-bad" aria-hidden />
                Nothing on the homepage says why to pick them over a competitor
              </li>
              <li className="flex gap-2 text-sm leading-relaxed text-muted">
                <Plus className="mt-0.5 h-3 w-3 shrink-0 text-signal-good" aria-hidden />
                Loads fast on mobile
              </li>
            </ul>
          </div>
        </div>

        {/* Daily Queue + Playbook */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">One queue, always telling you what&apos;s next</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Illustrative example — the Daily Queue orders every prospect and follow-up by
              priority, and the Playbook prepares what to say.
            </p>
          </div>
          <div className="space-y-2 p-4">
            {QUEUE_PREVIEW.map((q) => (
              <div key={q.name} className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-canvas/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{q.name}</div>
                  <div className="mt-0.5 text-sm text-muted">{q.note}</div>
                </div>
                <Pill tone={q.priority === "warn" ? "warn" : q.priority === "good" ? "good" : "neutral"}>
                  {q.priority === "warn" ? "High" : q.priority === "good" ? "Due" : "Queued"}
                </Pill>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* F. Differentiation — not a CRM, not a lead list — full-width band    */
/* ------------------------------------------------------------------ */

const COMPARISON_ROWS: Array<{ traditional: string; webgenie: string }> = [
  { traditional: "Guessing who to contact", webgenie: "A prioritized list of real opportunities" },
  { traditional: "A claim with no evidence", webgenie: "A verified, evidence-backed reason to reach out" },
  { traditional: "Just a name and a phone number", webgenie: "Something concrete to show — a real demo site or audit" },
  { traditional: "Figuring out what to say yourself", webgenie: "A guided script and next action from the Playbook" },
  { traditional: "A spreadsheet you maintain by hand", webgenie: "One canonical queue that tracks itself" },
];

function Differentiation() {
  return (
    <div className={SECTION}>
      <SectionIntro
        title="This isn't a CRM, and it isn't a lead list"
        description="A CRM organizes clients you already have. A lead list gives you names with no context. WebGenie does the work in between."
      />
      <div className="mx-auto mt-8 max-w-4xl overflow-x-auto rounded-card border border-hairline">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <caption className="sr-only">Traditional prospecting compared with WebGenie</caption>
          <thead>
            <tr className="border-b border-hairline">
              <th scope="col" className="p-4 text-sm font-semibold text-faint">
                Without a real process
              </th>
              <th scope="col" className="p-4 text-sm font-semibold text-iris-soft">
                With WebGenie
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.traditional} className="border-b border-hairline last:border-b-0">
                <td className="p-4 align-top text-sm text-ink/80">
                  <span className="flex items-start gap-2.5">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-signal-bad" aria-hidden />
                    {row.traditional}
                  </span>
                </td>
                <td className="p-4 align-top text-sm text-ink">
                  <span className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-good" aria-hidden />
                    {row.webgenie}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* G. Who it's for — nav anchor "Who It's For" — audience split         */
/* ------------------------------------------------------------------ */

function WhoItsFor() {
  return (
    <div id="who-its-for" className={cn(SECTION_PLAIN, "scroll-mt-24")}>
      <SectionIntro title="Who WebGenie is built for" />
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left lg:grid-cols-2">
        <div className="card p-6">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-iris/30 bg-iris/10">
            <Rocket className="h-4 w-4 text-iris-soft" aria-hidden />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-ink">New to agency ownership?</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            WebGenie gives you the process — where to look, what to say, and something real to
            show on your very first call. It won&apos;t promise you clients; it will make sure
            you never start a call empty-handed.
          </p>
        </div>
        <div className="card p-6">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon/30 bg-neon/10">
            <TrendingUp className="h-4 w-4 text-neon-soft" aria-hidden />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-ink">Already have an agency?</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            WebGenie helps you and your team run the process you already know, faster and more
            consistently — with a queue a sales hire can pick up without losing quality.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* H. Examples — full-width band                                       */
/* ------------------------------------------------------------------ */

/**
 * Curated per PRODUCT.md's Motion A verticals — Roofing/HVAC/Plumbing/
 * Dental, matching the four labels the task named. Real, live-rendered
 * previews from the actual generator (isSample: true — see
 * lib/sitegen/types.ts), never a screenshot or a static mock.
 */
const EXAMPLE_IDS = ["sample-roofer", "sample-hvac", "sample-plumber", "sample-dentist"];
const EXAMPLE_BUSINESSES = EXAMPLE_IDS.map((id) => SAMPLE_BUSINESSES.find((b) => b.id === id)!);

function Examples() {
  return (
    <div className={SECTION}>
      <SectionIntro
        title="See the kind of site WebGenie builds"
        description={`Four real, live-rendered demo sites — illustrative businesses, real generator output. The product builds a site like this for ${REAL_INDUSTRY_COUNT} industries today.`}
      />
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left sm:grid-cols-2">
        {EXAMPLE_BUSINESSES.map((biz) => {
          const url = demoSiteUrl(biz, { by: "WebGenie AI", sample: true });
          const label = INDUSTRIES[biz.industry as keyof typeof INDUSTRIES]?.label ?? biz.industry;
          return (
            <div key={biz.id} className="card overflow-hidden p-0">
              <div className="relative h-48 w-full overflow-hidden bg-white">
                <iframe
                  src={url}
                  title={`Live preview of a generated demo site for ${biz.name}`}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden
                  className="pointer-events-none origin-top-left"
                  style={{ width: "400%", height: "400%", transform: "scale(0.25)", border: "none" }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-medium text-ink">{biz.name}</div>
                  <div className="mt-0.5 text-sm text-faint">
                    {label} · Illustrative example
                  </div>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-iris/50"
                >
                  View full demo
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Button href="/gallery" variant="secondary">
          Explore All Examples
        </Button>
        <p className="mx-auto mt-4 max-w-lg text-sm text-faint">
          Want more? The example gallery has {GALLERY_TEMPLATE_COUNT} illustrative templates
          across dozens of additional business types.{" "}
          <Link href="/samples" className="focus-ring underline decoration-dotted underline-offset-4 hover:text-muted">
            Or browse the curated sample set
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* I. Plans / trial — nav anchor "Plans"                                */
/* ------------------------------------------------------------------ */

const PLAN_FACTS: Array<{ q: string; a: string }> = [
  { q: "What's included in the trial?", a: "Full access to Finder, evidence-based audits, the site generator, Daily Queue, and Playbook — the same product, not a limited demo." },
  { q: "Is a card required to start?", a: "No. Start free, no credit card." },
  { q: "What happens after 7 days?", a: "We'll reach out about the right plan for your agency. There's no automatic charge." },
  { q: "Is outreach automatic?", a: "No. You make every call and send every message — WebGenie prepares the work, it never contacts anyone on your behalf." },
];

function Plans() {
  return (
    <div id="plans" className={cn(SECTION_PLAIN, "scroll-mt-24")}>
      <SectionIntro
        title="Plans"
        description="Pricing for WebGenie isn't finalized yet, so here's exactly what to expect instead of a number we'd have to walk back."
      />
      <dl className="mx-auto mt-8 grid max-w-3xl gap-x-8 gap-y-6 text-left sm:grid-cols-2">
        {PLAN_FACTS.map((fact) => (
          <div key={fact.q} className="border-t border-hairline pt-4">
            <dt className="text-sm font-semibold text-ink">{fact.q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink/80">{fact.a}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 text-center">
        <Button href="/signup">
          Start Free
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* J. FAQ — centered heading, left-aligned answers — full-width band    */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Does WebGenie contact anyone automatically?",
    a: "No. WebGenie never sends a message, calls, or emails a prospect on your behalf. You always initiate contact — WebGenie prepares what you need to make that call worth making.",
  },
  {
    q: "Where does the business data come from?",
    a: "From public business-listing sources — the same information a manual search would surface, gathered and organized so you don't have to do it one tab at a time.",
  },
  {
    q: "What counts as “verified evidence”?",
    a: "A specific, checkable fact about a business's web presence — no online chat, no booking widget, a broken contact form — traced back to a real audit module, never a generic guess.",
  },
  {
    q: "Does every prospect get a demo site?",
    a: `Only businesses with no existing website get an instant demo site, across ${REAL_INDUSTRY_COUNT} supported industries today. Businesses that already have a site get a real, evidence-based audit instead — WebGenie never rebuilds something that doesn't need it.`,
  },
  {
    q: "Can I use my own offer, pricing, and scripts?",
    a: "Yes. The Playbook gives you a starting script and a suggested next action, but every price, offer, and word you say on the call is yours.",
  },
  {
    q: "What happens after my trial?",
    a: "We'll reach out about the right plan for your agency. There's no automatic charge and no obligation to continue.",
  },
];

function Faq() {
  return (
    <div className={SECTION}>
      <SectionIntro title="Frequently asked" />
      <div className="mx-auto mt-8 max-w-2xl divide-y divide-hairline border-t border-hairline text-left">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink marker:hidden">
              {item.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-faint transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* K. Final CTA                                                        */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <div className={cn(SECTION_PLAIN, "mb-8 text-center")}>
      <h2 className="mx-auto max-w-xl text-display-md font-semibold text-ink">
        Your next client conversation should start with something real.
      </h2>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button href="/signup">
          Start Free
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Link href="/login" className="focus-ring text-sm font-medium text-muted transition-colors hover:text-ink">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}

/** Every major section introduction is centered -- adapted from
 * vibelabsagency.com's consistently centered section headings. */
function SectionIntro({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-display-md font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-2.5 text-sm leading-relaxed text-ink/80">{description}</p> : null}
    </div>
  );
}
