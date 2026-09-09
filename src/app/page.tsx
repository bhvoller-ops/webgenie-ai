import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileCode2,
  Handshake,
  Minus,
  Phone,
  Plus,
  Radar,
  Rocket,
  ScanLine,
  Sparkles,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, Panel, Pill } from "@/components/ui";
import { ScoreRing } from "@/components/score-ring";
import { getAccessContext } from "@/lib/auth/access";
import { SAMPLE_BUSINESSES } from "@/lib/sitegen/samples";
import { demoSiteUrl } from "@/lib/sitegen/encode";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WebGenie AI — The Client-Acquisition Workspace for Agencies",
  description:
    "Find businesses worth contacting, build something worth showing them, and start better sales conversations. The client-acquisition workspace for agencies, freelancers, and consultants — free for 7 days.",
};

/**
 * / used to be the signed-in Dashboard for every role. It's now the public
 * marketing funnel — the page a stranger who's never heard of WebGenie
 * lands on — with the actual Dashboard content moved to /projects/new
 * (see CLAUDE.md §2q). A signed-in visitor never sees the funnel: this
 * redirects them to their real home before rendering anything below.
 *
 * Rebuilt 9 Sep 2026 (the "Homepage Conversion Build") around a single
 * story — WebGenie is the *client-acquisition* workspace, not a lead
 * scraper/site generator/audit tool in isolation. See docs/history.md for
 * the entry this build adds. Every "real product" visual below is either
 * the actual component the authenticated app uses (ScoreRing) or an
 * actually-live render of the real generator (the embedded demo-site
 * iframe) — not a screenshot, not invented UI.
 */
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
      <Problem />
      <BeforeAfter />
      <ProductShowcase />
      <Workflow />
      <Audience />
      <Toolset />
      <ClosingCta />
    </PageShell>
  );
}

function Hero() {
  return (
    <Panel className="relative overflow-hidden" padded={false}>
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.35]"
        style={{ backgroundSize: "56px 56px", maskImage: "radial-gradient(700px 300px at 25% 0%, #000, transparent)" }}
        aria-hidden
      />
      <div className="relative px-6 py-14 sm:px-12 sm:py-20">
        <h1 className="max-w-3xl text-display-lg font-semibold">
          <span className="gradient-text">Stop wondering</span>
          <br />
          <span className="text-ink">where your next client is coming from.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          WebGenie finds local businesses worth contacting, diagnoses what&apos;s actually wrong with
          their web presence, and builds something real to show them — a demo site or an
          evidence-backed audit — before you ever pick up the phone.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/signup">
            Start finding clients free
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="#product" variant="secondary">
            See how it works
          </Button>
        </div>
        <p className="mt-3 text-xs text-faint">Free for 7 days, full access, no credit card required.</p>

        <div className="mt-12 flex flex-wrap items-center gap-2">
          {["Find", "Diagnose", "Show", "Pitch"].map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <Pill tone={i === 0 ? "iris" : "neutral"}>{stage}</Pill>
              {i < 3 ? <ArrowRight className="h-3 w-3 text-faint" aria-hidden /> : null}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Problem() {
  return (
    <div className="mt-20 grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="text-display-md font-semibold text-ink">
          Starting an agency is easy.
          <br />
          Finding clients is the hard part.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          You can learn websites. You can learn AI. You can learn automation. You can buy every tool
          on the market. None of that matters if you don&apos;t have a business to sell it to.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Most agency software starts <em className="text-ink">after</em> you already have the
          client — CRMs, funnels, reporting. WebGenie works on the problem before that one:{" "}
          <span className="text-ink">finding someone worth talking to</span>, and giving you a real
          reason to start the conversation.
        </p>
        <p className="mt-4 text-sm font-medium text-iris-soft">
          We built the tool we wish we had when we started.
        </p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline lg:col-span-3 lg:grid-cols-2">
        {[
          "Who do I even contact?",
          "Which businesses actually need what I sell?",
          "What should I say when I reach out?",
          "What can I show them, not just tell them?",
          "Who should I contact first?",
          "How do I do this every week, not just once?",
        ].map((q) => (
          <div key={q} className="bg-surface p-5">
            <p className="text-sm leading-relaxed text-ink">&ldquo;{q}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const WITHOUT = [
  "Manually searching Google Maps, one city at a time",
  "Opening every business's site individually to check it",
  "Guessing whether they'd even want your help",
  "Writing the same generic pitch to everyone",
  "Building a demo by hand, if you build one at all",
  "Tracking it all in a spreadsheet, or not tracking it",
];

const WITH = [
  "Choose a market, get a sorted list of real opportunities",
  "Every result already checked for a website — or the lack of one",
  "A real, evidence-traced reason to reach out to this one",
  "Something concrete to show them in the first message",
  "A finished demo site, generated before you call",
  "One tracker for every prospect, call, and follow-up",
];

function BeforeAfter() {
  return (
    <div className="mt-20">
      <SectionIntro
        title="The work doesn't disappear. It gets a lot shorter."
        description="WebGenie doesn't magically close clients for you. It gives you a better reason to start the conversation — and it does the part that used to eat your whole afternoon."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-signal-bad">
            <XCircle className="h-4 w-4" aria-hidden />
            <h3 className="text-sm font-semibold">Without WebGenie</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {WITHOUT.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-signal-good">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            <h3 className="text-sm font-semibold">With WebGenie</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {WITH.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-good" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Real, curated fixture businesses — same ones /samples uses. Nothing here is a real business or a real customer result; see lib/sitegen/samples.ts. */
const FINDER_PREVIEW = SAMPLE_BUSINESSES.filter((b) =>
  ["sample-plumber", "sample-hvac", "sample-electrician"].includes(b.id)
);
const DEMO_PREVIEW_BUSINESS = SAMPLE_BUSINESSES.find((b) => b.id === "sample-dentist")!;

function ProductShowcase() {
  return (
    <div id="product" className="mt-20 scroll-mt-20">
      <SectionIntro
        title="Open WebGenie. Pick a market. Find an opportunity."
        description="Three real pieces of the actual product — not mockups. This is what opens the moment you sign in."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* FIND */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">Find better prospects</h3>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Real Finder results, sorted by review count so you call the easiest yes first.
            </p>
          </div>
          <div className="space-y-2 p-4">
            {FINDER_PREVIEW.map((b) => (
              <div key={b.id} className="rounded-lg border border-hairline bg-canvas/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink">{b.name}</span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px]">
                    <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                    <span className="font-mono text-faint">
                      {b.rating} ({b.reviewCount})
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[10px] font-medium text-signal-warn">
                    <Bot className="h-2.5 w-2.5" aria-hidden />
                    No AI Receptionist
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-2 py-0.5 text-[10px] font-medium text-signal-warn">
                    <Clock className="h-2.5 w-2.5" aria-hidden />
                    No 24/7 Coverage
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIAGNOSE */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">Don&apos;t tell them it&apos;s bad. Show them why.</h3>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Illustrative example — every real audit runs the same 11-module engine and traces
              each finding back to real evidence, never a guess.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 p-5">
            <ScoreRing score={46} size={140} stroke={9} label="Website Health" sublabel="Illustrative example" />
            <ul className="w-full space-y-2">
              <li className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-signal-bad" aria-hidden />
                No way to text or chat — every lead has to call during business hours
              </li>
              <li className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-signal-bad" aria-hidden />
                Nothing on the homepage says why to pick them over a competitor
              </li>
              <li className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
                <Plus className="mt-0.5 h-3 w-3 shrink-0 text-signal-good" aria-hidden />
                Loads fast on mobile
              </li>
            </ul>
          </div>
        </div>

        {/* SHOW */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-hairline p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-iris-soft" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">The best pitch is the website you already built</h3>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              A real, live demo site — generated by the actual product for a sample business, not a
              screenshot.
            </p>
          </div>
          <div className="relative h-52 w-full overflow-hidden bg-white">
            <iframe
              src={demoSiteUrl(DEMO_PREVIEW_BUSINESS, { by: "WebGenie AI", badge: false })}
              title={`Live preview of a generated demo site for ${DEMO_PREVIEW_BUSINESS.name}`}
              loading="lazy"
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none origin-top-left"
              style={{ width: "400%", height: "400%", transform: "scale(0.25)", border: "none" }}
            />
          </div>
          <div className="p-4">
            <a
              href={demoSiteUrl(DEMO_PREVIEW_BUSINESS, { by: "WebGenie AI", badge: false })}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-[13px] font-medium text-iris-soft transition-colors hover:text-iris"
            >
              Open the live preview <ArrowRight className="inline h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-faint">
        73 industries covered.{" "}
        <Link href="/samples" className="focus-ring underline decoration-dotted underline-offset-4 hover:text-muted">
          See a real sample site for every one
        </Link>
        .
      </p>
    </div>
  );
}

const WORKFLOW_STAGES = [
  { icon: ScanLine, title: "Find", body: "Scan a market for businesses worth contacting." },
  { icon: Radar, title: "Audit", body: "Diagnose exactly what's wrong, with real evidence." },
  { icon: Sparkles, title: "Build", body: "Generate a real demo site or rebuild blueprint." },
  { icon: Phone, title: "Pitch", body: "Call with something specific to show, not a guess." },
  { icon: Compass, title: "Track", body: "Log every call, follow-up, and outcome in one place." },
  { icon: Handshake, title: "Close", body: "Collect payment on the spot or send a payment link." },
];

function Workflow() {
  return (
    <div className="mt-20">
      <SectionIntro
        title="One prospect. One workspace. One path to the sale."
        description="Every stage below is real, built, and already what a signed-in session does — this isn't a roadmap slide."
      />
      <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-6">
        <div aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-hairline lg:block" />
        {WORKFLOW_STAGES.map((stage, i) => (
          <li key={stage.title} className="relative flex flex-col items-start">
            <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-iris/30 bg-void">
              <stage.icon className="h-4 w-4 text-iris-soft" aria-hidden />
            </span>
            <span className="mt-4 font-mono text-[11px] tracking-wide text-faint">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-1 text-sm font-semibold text-ink">{stage.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{stage.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-card border border-dashed border-hairline bg-canvas/40 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-neon/30 bg-neon/10">
            <Compass className="h-3.5 w-3.5 text-neon-soft" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">Where this is going next</h3>
              <Pill tone="neon">Coming next</Pill>
            </div>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
              For every prospect, WebGenie will surface a plain-language <em className="text-ink">Opportunity
              Brief</em> (why this business, specifically) and a <em className="text-ink">Next Best Action</em>{" "}
              (what to do about it right now). Not live yet — flagged here honestly, not presented as built.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Audience() {
  return (
    <div className="mt-20 grid gap-4 lg:grid-cols-2">
      <div className="card p-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-iris/30 bg-iris/10">
          <Rocket className="h-4 w-4 text-iris-soft" aria-hidden />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-ink">New to agency ownership?</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          WebGenie gives you the process — where to look, what to say, and something real to show on
          your very first call.
        </p>
      </div>
      <div className="card p-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon/30 bg-neon/10">
          <TrendingUp className="h-4 w-4 text-neon-soft" aria-hidden />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-ink">Already have an agency?</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          WebGenie helps you execute the process you already know faster — and hand it to a sales
          hire without losing quality.
        </p>
      </div>
    </div>
  );
}

const LEAD_CAPABILITIES = [
  { icon: Building2, title: "Prospect Finder", body: "Search by industry and city — every result already has a demo site built for it." },
  { icon: Sparkles, title: "Site Generator", body: "73 industries, real lead capture, an AI intake chat, and full LocalBusiness schema on every page." },
];

const SUPPORTING_CAPABILITIES = [
  { icon: Radar, title: "Audit Funnel" },
  { icon: FileCode2, title: "Blueprints & Prompts" },
  { icon: Phone, title: "Call Tracker" },
  { icon: Handshake, title: "Partner Program" },
];

function Toolset() {
  return (
    <div className="mt-20">
      <SectionIntro
        title="Everything the workflow needs, in one workspace"
        description="The intelligence engine is the differentiator — the rest of the workspace is what turns a finding into a closed deal."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LEAD_CAPABILITIES.map((c) => (
          <div key={c.title} className="card p-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon/30 bg-neon/10">
              <c.icon className="h-4 w-4 text-neon-soft" aria-hidden />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink">{c.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {SUPPORTING_CAPABILITIES.map((c) => (
          <div key={c.title} className="flex items-center gap-2.5 bg-surface px-4 py-3.5">
            <c.icon className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
            <span className="text-[13px] text-muted">{c.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingCta() {
  return (
    <div className="mt-20 mb-8">
      <Panel className="relative overflow-hidden text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade opacity-[0.25]"
          style={{ backgroundSize: "56px 56px", maskImage: "radial-gradient(600px 260px at 50% 0%, #000, transparent)" }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-display-md font-semibold text-ink">Your next client is already out there.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Agencies don&apos;t fail because they can&apos;t build. They fail because they never build a
            reliable way to get clients. You need a better way to find the opportunity — and a
            better reason to start the conversation. That&apos;s WebGenie.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-faint">
            Free for 7 days, full access, no credit card. After your trial, we&apos;ll reach out about
            the right plan for your agency.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/signup">
              Start finding clients free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Link href="/login" className="focus-ring text-sm font-medium text-muted transition-colors hover:text-ink">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-display-md font-semibold text-ink">{title}</h2>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
