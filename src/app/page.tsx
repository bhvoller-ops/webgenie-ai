import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Handshake,
  Lock,
  Radar,
  Repeat,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, Panel } from "@/components/ui";
import { getAccessContext } from "@/lib/auth/access";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import { industryList as GALLERY_TEMPLATE_LIST } from "@/data/gallery/industries";
import { GalleryThumbImage } from "@/components/gallery-thumb-image";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WebGenie AI — The Client-Acquisition Workspace for Agencies",
  description:
    "Find the right local business, verify the opportunity with real evidence, and prepare something worth showing before you ever call. The client-acquisition workspace for agencies — start free, no credit card required.",
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
      <CoreProblem />
      <Band tone="soft">
        <ProductWorkflow />
      </Band>
      <ProductProof />
      <Band tone="soft">
        <Differentiation />
      </Band>
      <Examples />
      <Plans />
      <Band tone="soft">
        <Faq />
      </Band>
      <FinalCta />
    </PageShell>
  );
}

/**
 * Shared vertical rhythm between sections. Composition-pass finding: at the
 * original py-32/mt-32 desktop values, these two constants alone accounted
 * for roughly 1,280px of the page's total height across their 7 uses --
 * tightened here as part of the required 20-30% page-length reduction.
 */
const SECTION = "py-7 sm:py-10 lg:py-14";
const SECTION_PLAIN = "mt-7 sm:mt-10 lg:mt-14";

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
      <h1 className="mx-auto max-w-3xl text-[clamp(2.375rem,1.4rem+4vw,4.25rem)] font-semibold leading-[1.05] tracking-tight text-ink">
        Find the right business. <span className="text-iris-soft">Start with something real.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-[720px] text-base leading-relaxed text-ink/80 sm:text-lg">
        WebGenie helps agencies find local prospects, verify the opportunity, prepare
        evidence-backed outreach and manage every next step.
      </p>

      <div className="mx-auto mt-7 flex max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
        <Button href="/signup" className="w-full sm:w-auto">
          Start Free
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button href="#how-it-works" variant="secondary" className="w-full sm:w-auto">
          See WebGenie in Action
        </Button>
      </div>
      <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-faint">
        <span>Start free</span>
        <span aria-hidden>·</span>
        <span>No credit card required</span>
        <span aria-hidden>·</span>
        <span>Human-executed outreach</span>
      </p>

      <HeroProductScreenshot />
    </section>
  );
}

/**
 * Owner-review finding (FINAL DESIGN-QUALITY CORRECTION, screenshot gate):
 * the hero previously showed a four-stage illustrative walkthrough built
 * from real component patterns but no actual screenshot. It's replaced
 * here with the real, owner-approved Daily Queue screenshot -- sanitized,
 * flattened, metadata-free (see public/product-proof/ and the PR's
 * sanitization notes). A discreet caption discloses the redaction per the
 * owner's explicit requirement. No fabricated metric appears anywhere in
 * this image; it is exactly what a signed-in account sees.
 *
 * Composition-pass finding: the screenshot frame's own dark chrome barely
 * separated from the page's own near-black background. Rather than stack
 * a second bordered `.panel` around it (which just doubled the border and
 * added a second surface for no visual gain), the screenshot now sits on
 * a single lifted `bg-raised` stage with a restrained ambient glow behind
 * it -- ProductScreenshot's own single border/shadow remains the only
 * border anywhere in this composition.
 */
function HeroProductScreenshot() {
  return (
    <div className="relative mt-9 lg:mt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-4 -z-10 mx-auto h-[80%] max-w-[900px] rounded-panel bg-iris/[0.08] blur-3xl"
        aria-hidden
      />
      <div className="mx-auto max-w-[1100px] rounded-panel bg-raised/70 p-3 sm:p-4">
        <ProductScreenshot
          src="/product-proof/daily-queue.jpg"
          width={1200}
          height={633}
          alt="The Daily Queue: today's prioritized actions, with evidence badges and an Open Playbook action on each card"
          sizes="(min-width: 1100px) 1100px, 100vw"
        />
      </div>
      <RedactedScreenshotCaption />
    </div>
  );
}

/** Minimal window-chrome frame around a real screenshot -- signals "this is
 * a captured app window," not a designed graphic, without adding a second
 * decorative surface. Width/height are the screenshot's own intrinsic
 * pixel dimensions, so the browser scales it responsively without ever
 * stretching or cropping it. The one border + restrained shadow here are
 * the only frame a screenshot ever gets -- never nested inside another
 * bordered surface. */
function ProductScreenshot({
  src,
  width,
  height,
  alt,
  sizes,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-canvas/60 shadow-panel">
      <div className="flex items-center gap-1.5 border-b border-hairline bg-canvas/80 px-3 py-2" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-signal-bad/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-warn/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-good/50" />
      </div>
      <Image src={src} width={width} height={height} alt={alt} sizes={sizes} className="h-auto w-full" />
    </div>
  );
}

/** Required verbatim by the owner wherever a redacted production screenshot
 * appears on this page. */
function RedactedScreenshotCaption() {
  return <p className="mt-3 text-center text-sm text-faint">Real WebGenie interface; identifying details redacted.</p>;
}

/* ------------------------------------------------------------------ */
/* B. Core problem — one centered argument + horizontal examples        */
/* Composition pass: the standalone trust strip ("Built for agency      */
/* owners...", "Human-executed outreach", etc.) was pure repetition --  */
/* every claim in it is already made once, either in the hero's own     */
/* trailing line or the FAQ ("Does WebGenie contact anyone              */
/* automatically?"). Removed rather than kept as a fourth restatement.  */
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

/**
 * Composition pass: this section previously ran a five-sentence paragraph
 * followed by 3 failure points with no transition into what comes next.
 * Tightened to the owner's exact required shape -- one headline, one
 * concise paragraph, three short failure points, one transition sentence
 * into the workflow below -- and the standalone "Who WebGenie is built
 * for" two-card section is folded into that one paragraph instead of
 * kept as its own section (its two audiences: new to agency ownership /
 * already running one).
 */
function CoreProblem() {
  return (
    <div className={SECTION_PLAIN}>
      <div className="mx-auto max-w-[62ch] text-center">
        <h2 className="text-display-md font-semibold text-ink">
          Starting an agency is easy. Finding clients is the hard part.
        </h2>
        <p className="mx-auto mt-4 max-w-[62ch] text-base leading-relaxed text-ink/80">
          Whether you&apos;re just starting an agency or already running one, the bottleneck is
          the same — a dependable way to find the next real opportunity, not a guess from a
          spreadsheet.
        </p>
      </div>
      <div className="mx-auto mt-6 grid max-w-4xl gap-4 border-t border-hairline pt-5 text-left sm:grid-cols-3">
        {PROBLEM_EXAMPLES.map((example) => (
          <div key={example.title} className="flex flex-col gap-2">
            <example.icon className="h-4 w-4 text-signal-bad" aria-hidden />
            <p className="text-sm font-semibold text-ink">{example.title}</p>
            <p className="text-sm leading-relaxed text-muted">{example.body}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-[62ch] text-center text-sm font-medium text-iris-soft">
        WebGenie replaces the guessing with one connected process — here&apos;s how it works.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C. Product workflow — nav anchor "Product" — full-width band         */
/* ------------------------------------------------------------------ */

/**
 * Composition pass: six small columns (Find/Verify/Prepare/Contact/Follow
 * up/Win & hand off) compressed into four substantial marketing phases --
 * Act now carries what Contact/Follow up/Win & hand off used to say each
 * in their own column, as supporting language inside one phase. Each
 * phase is a real `.card` now (border/surface/padding) instead of bare
 * icon+text in a thin 6-up grid, so four phases read as substantial, not
 * small.
 *
 * PR #32 owner correction: the constructed illustrative Website Health
 * score/progress visual that used to live inside the Verify card (first
 * a full-size product-proof card of its own, then downsized here) is
 * removed entirely, per the owner's explicit instruction -- it was a
 * fabricated score with nothing behind it, and no replacement illustration,
 * score, or decorative card takes its place. Verify stays concise and
 * text-based, matching the other three phases.
 */
const WORKFLOW_PHASES = [
  { icon: ScanLine, title: "Find", body: "Search a market with Finder — every result comes back scored, not just no-website businesses." },
  { icon: Radar, title: "Verify", body: "Confirm the opportunity with a specific, checkable finding — never a guess." },
  { icon: Sparkles, title: "Prepare", body: "Generate a demo site or an audit, plus a script from the Playbook, before you ever dial." },
  { icon: Handshake, title: "Act", body: "Call, follow up and hand off the win yourself — every step logged in the Daily Queue, nothing on autopilot." },
];

function ProductWorkflow() {
  return (
    <div id="product" className={cn(SECTION, "scroll-mt-24")}>
      <SectionIntro
        title="One connected process, four phases"
        description="Every phase below ships today — the same workflow a signed-in account actually runs, not a roadmap."
      />
      <ol className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
        {WORKFLOW_PHASES.map((phase, i) => (
          <li key={phase.title} className="card flex flex-col gap-2 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-iris/30 bg-void">
                <phase.icon className="h-4 w-4 text-iris-soft" aria-hidden />
              </span>
              <div>
                <span className="font-mono text-[13px] tracking-wide text-faint">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-sm font-semibold text-ink">{phase.title}</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink/80">{phase.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D. Product proof — nav anchor "How It Works"                        */
/* ------------------------------------------------------------------ */

/**
 * Composition pass: replaces three equal, same-weight cards (which put a
 * full-size illustrative ScoreRing on equal visual footing with two real
 * screenshots) with three substantial alternating feature sections --
 * copy and screenshot swap sides each time for rhythm, and each section
 * gets exactly one headline, one paragraph, and up to three benefits.
 * Daily Queue (prominent, real, also the hero image -- deliberately shown
 * again here with room to actually explain it) and the Playbook (real,
 * shown at a materially larger size than the old 1/3-width card) both get
 * the full ambient-glow treatment; Finder stays visibly secondary -- its
 * screenshot is capped narrower within its own column, and its copy
 * doesn't claim "results" since the approved screenshot is Finder's empty
 * pre-search state. The illustrative Website Health score never appears
 * here (PR #32: it's now removed from the page entirely, see
 * ProductWorkflow's own comment) -- nothing here ever competed with the
 * real product screens for attention in the first place.
 */
function ProductProof() {
  return (
    <div id="how-it-works" className={cn(SECTION_PLAIN, "scroll-mt-24")}>
      <SectionIntro title="See it work, not just hear about it" description="Real screens from the actual product, redacted for privacy." />

      <div className="mt-6 space-y-6 lg:space-y-10">
        {/* Feature 1 -- Daily Queue: prominent, text left / image right */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -inset-y-10 -z-10 bg-iris/[0.06] blur-3xl" aria-hidden />
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="text-left">
              <p className="eyebrow text-iris-soft">Daily Queue</p>
              <h3 className="mt-2.5 text-display-sm font-semibold text-ink">Know exactly what deserves attention today.</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/80">
                Every open item ranked by priority, not by whoever asked last — so the next call
                is always obvious.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  Prioritized actions, not a flat list
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  Each one shows whether the evidence is ready to pitch
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  You decide what happens next — WebGenie prepares, you execute
                </li>
              </ul>
            </div>
            <div className="mx-auto w-full max-w-[440px]">
              <ProductScreenshot
                src="/product-proof/daily-queue.jpg"
                width={1200}
                height={633}
                alt="The Daily Queue: today's prioritized actions, with evidence badges and an Open Playbook action on each card"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <RedactedScreenshotCaption />
            </div>
          </div>
        </div>

        {/* Feature 2 -- Finder: secondary proof, image left / text right, deliberately smaller */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="mx-auto w-full max-w-[330px] lg:order-1">
            <ProductScreenshot
              src="/product-proof/finder.jpg"
              width={1400}
              height={708}
              alt="Finder's search screen, ready to search by industry, location and radius"
              sizes="(min-width: 1024px) 32vw, 100vw"
            />
          </div>
          <div className="text-left lg:order-2">
            <p className="eyebrow text-iris-soft">Finder</p>
            <h3 className="mt-2.5 text-display-sm font-semibold text-ink">Start every search with a real market.</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/80">
              Pick an industry, a location and a radius — Finder searches real public business
              signals and comes back with every result already checked for a website, or the lack
              of one. Shown here before a search runs.
            </p>
          </div>
        </div>

        {/* Feature 3 -- Live Outreach Playbook: materially larger, text left / image right */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -inset-y-10 -z-10 bg-iris/[0.06] blur-3xl" aria-hidden />
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="text-left">
              <p className="eyebrow text-iris-soft">Live Outreach Playbook</p>
              <h3 className="mt-2.5 text-display-sm font-semibold text-ink">Go into every call knowing what to say next.</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/80">
                A guided script for every stage of the call, grounded in real evidence instead of
                a generic pitch.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  Stage-by-stage guidance, including exactly what to say if a gatekeeper answers
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  Prospect intelligence grounds every line in a real, checkable fact
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-soft" aria-hidden />
                  Every outcome recorded factually — no assumed intent, no invented urgency
                </li>
              </ul>
            </div>
            <div className="mx-auto w-full max-w-[440px]">
              <ProductScreenshot
                src="/product-proof/playbook.jpg"
                width={1200}
                height={827}
                alt="Live Outreach Playbook Stage 2, gatekeeper script with response options and a Prospect Intelligence panel"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <RedactedScreenshotCaption />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* E. Differentiation — not a CRM, not a lead list — full-width band    */
/* Composition pass: kept (it's the one explanation of WebGenie's own    */
/* category, not a repeat of anything else on the page) but compacted -- */
/* shorter row copy, tighter cell padding, shorter intro. Positive/      */
/* negative is still distinguished by icon shape (X vs Check), not only  */
/* by red/green.                                                         */
/* ------------------------------------------------------------------ */

const COMPARISON_ROWS: Array<{ traditional: string; webgenie: string }> = [
  { traditional: "Guessing who to contact", webgenie: "A prioritized, evidence-backed list" },
  { traditional: "A claim with no evidence", webgenie: "A verified reason to reach out" },
  { traditional: "Just a name and a number", webgenie: "A real demo site or audit to show" },
  { traditional: "Figuring out what to say", webgenie: "A guided script, ready to use" },
  { traditional: "A spreadsheet you maintain", webgenie: "One queue that tracks itself" },
];

function Differentiation() {
  return (
    <div className={SECTION}>
      <SectionIntro title="This isn't a CRM, and it isn't a lead list" description="A CRM organizes clients you already have. WebGenie finds the opportunity first." />
      <div className="mx-auto mt-6 max-w-3xl overflow-x-auto rounded-card border border-hairline">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="sr-only">Traditional prospecting compared with WebGenie</caption>
          <thead>
            <tr className="border-b border-hairline">
              <th scope="col" className="p-3 text-sm font-semibold text-faint">
                Without a real process
              </th>
              <th scope="col" className="p-3 text-sm font-semibold text-iris-soft">
                With WebGenie
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.traditional} className="border-b border-hairline last:border-b-0">
                <td className="p-3 align-top text-sm text-ink/80">
                  <span className="flex items-start gap-2">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />
                    {row.traditional}
                  </span>
                </td>
                <td className="p-3 align-top text-sm text-ink">
                  <span className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-good" aria-hidden />
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
/* F. Examples — full-width band                                       */
/* Composition pass: the standalone "Who WebGenie is built for" section */
/* that used to follow here is removed -- its two audiences (new to      */
/* agency ownership / already running one) are now one clause in         */
/* CoreProblem's own paragraph instead of a second two-card section.     */
/* ------------------------------------------------------------------ */

/**
 * Samples/Gallery consolidation (owner product decision): /samples is gone
 * as a distinct product area -- Gallery is now the only user-facing
 * examples destination, and this section is a small, static preview of
 * it, not a second, parallel example set. The 4 featured ids below are
 * just diverse picks from the same GALLERY_TEMPLATE_LIST /gallery itself
 * renders from (one per category: health-wellness, home-services,
 * pet-services, creative-events) -- there is no dedicated "featured" flag
 * on IndustryConfig, so this is the same kind of curated constant /gallery
 * used to keep for its old Featured/All split.
 *
 * These are illustrative industry TEMPLATES (stock photo + copy, rendered
 * by renderIndustryPage() -- see /gallery), not live output of the real
 * site generator (generateSite(), Finder/Projects/Audit) -- copy here is
 * deliberately worded to match, never "real demo site."
 *
 * P0 (iframe-overload correction, still true here): zero iframes load on
 * initial render -- GalleryThumbImage renders a static image exactly like
 * /gallery's own thumbnail grid does, reusing that same component rather
 * than a second copy of its host-detection logic.
 */
const FEATURED_GALLERY_IDS = ["dental", "restoration", "veterinary-clinic", "restaurants-cafes"];
const FEATURED_GALLERY_TEMPLATES = FEATURED_GALLERY_IDS.map((id) => GALLERY_TEMPLATE_LIST.find((ind) => ind.id === id)!);

function Examples() {
  // PUBLIC EXAMPLES AUTH GATE (owner-directed correction): HomePage()
  // above already redirects every signed-in visitor away before this ever
  // renders (admin -> /projects/new, partner -> /partners/portal, beta ->
  // /trial/portal, anything else -> the "not set up" panel) -- so every
  // real render of this section is a logged-out visitor, unconditionally.
  // No "View full demo" link renders here at all; the real enforcement
  // lives server-side in /api/gallery-preview/route.ts regardless.
  return (
    <div className={SECTION}>
      <SectionIntro
        title="Browse our industry example gallery"
        description={`A few of our ${GALLERY_TEMPLATE_COUNT} illustrative industry templates. Sign in to open a full preview of any of them.`}
      />
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-faint">
        Full previews are available inside WebGenie.{" "}
        <Link href="/login?returnTo=/gallery" className="font-medium text-iris-soft underline decoration-dotted underline-offset-4 hover:text-iris">
          Sign in to view full previews
        </Link>
      </p>
      <div className="mx-auto mt-6 grid max-w-5xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_GALLERY_TEMPLATES.map((template) => (
          <div key={template.id} className="card overflow-hidden p-0">
            <div className="relative h-28 w-full overflow-hidden bg-raised">
              <GalleryThumbImage heroImage={template.heroImage} thumbnailImage={template.thumbnailImage} industryName={template.industryName} />
            </div>
            <div className="flex flex-col gap-2 p-3">
              <div>
                <div className="text-sm font-medium text-ink">{template.businessName}</div>
                <div className="mt-0.5 text-[13px] text-faint">
                  {template.industryName} · Illustrative example
                </div>
              </div>
              <p className="inline-flex items-center gap-1.5 text-sm text-faint">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Full preview available after sign-in
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button href="/gallery" variant="secondary">
          Explore All Examples
        </Button>
        <p className="mx-auto mt-3 max-w-lg text-sm text-faint">
          The example gallery has {GALLERY_TEMPLATE_COUNT} illustrative templates across dozens of
          business types — the product itself builds a real, live site for {REAL_INDUSTRY_COUNT}{" "}
          industries today.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* G. Plans / trial — nav anchor "Plans"                                */
/* ------------------------------------------------------------------ */

const PLAN_FACTS: Array<{ q: string; a: string }> = [
  { q: "What's included in the trial?", a: "Full access to Finder, evidence-based audits, the site generator, Daily Queue, and Playbook — the same product, not a limited demo." },
  { q: "Is a card required to start?", a: "No. Start free, no credit card." },
  { q: "What happens when the trial ends?", a: "We'll contact you about the right plan for your agency. There is no automatic charge." },
  { q: "Is outreach automatic?", a: "No. You make every call and send every message — WebGenie prepares the work, it never contacts anyone on your behalf." },
];

function Plans() {
  return (
    <div id="plans" className={cn(SECTION_PLAIN, "scroll-mt-24")}>
      <SectionIntro
        title="Plans"
        description="Pricing for WebGenie isn't finalized yet, so here's exactly what to expect instead of a number we'd have to walk back."
      />
      <dl className="mx-auto mt-6 grid max-w-3xl gap-x-8 gap-y-5 text-left sm:grid-cols-2">
        {PLAN_FACTS.map((fact) => (
          <div key={fact.q} className="border-t border-hairline pt-4">
            <dt className="text-sm font-semibold text-ink">{fact.q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink/80">{fact.a}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 text-center">
        <Button href="/signup">
          Start Free
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* H. FAQ — centered heading, left-aligned answers — full-width band    */
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
      <div className="mx-auto mt-6 max-w-2xl divide-y divide-hairline border-t border-hairline text-left">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group py-3">
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
/* I. Final CTA                                                        */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <div className={cn(SECTION_PLAIN, "mb-6 text-center")}>
      <h2 className="mx-auto max-w-xl text-display-md font-semibold text-ink">
        Your next client conversation should start with something real.
      </h2>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
