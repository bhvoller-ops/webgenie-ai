import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  FileCode2,
  Handshake,
  Layers,
  Phone,
  Radar,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, Panel, Pill } from "@/components/ui";
import { getAccessContext } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

/**
 * / used to be the signed-in Dashboard for every role. It's now the public
 * marketing funnel — the page a stranger who's never heard of WebGenie
 * lands on — with the actual Dashboard content moved to /projects/new
 * (see CLAUDE.md §2q). A signed-in visitor never sees the funnel: this
 * redirects them to their real home before rendering anything below.
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
      <HowItWorks />
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
          <span className="gradient-text">Find the clients</span>
          <br />
          <span className="text-ink">other agencies miss.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          WebGenie finds local businesses with no website — or a bad one — and turns each into a
          personalized demo site or an evidence-backed audit in minutes. Built for agencies,
          freelancers, and consultants selling websites and AI services to local businesses.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/signup">
            Get started free
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/samples" variant="secondary">
            See a sample site
          </Button>
        </div>
        <p className="mt-3 text-xs text-faint">Free for 7 days, full access, no credit card required.</p>

        <div className="mt-12 flex flex-wrap gap-2">
          {["11 scoring modules", "Evidence-traced findings", "9 export platforms", "Deterministic core"].map((f) => (
            <Pill key={f} tone="neutral">
              {f}
            </Pill>
          ))}
        </div>
      </div>
    </Panel>
  );
}

const PIPELINE = [
  {
    icon: ScanLine,
    title: "Find",
    body: "Scan Google Maps for businesses with no website — or a bad one — sorted by review count so you always call the easiest yes first.",
  },
  {
    icon: Radar,
    title: "Score",
    body: "Eleven deterministic modules produce a score and a set of findings — each one tied back to real evidence, not a guess.",
  },
  {
    icon: Layers,
    title: "Blueprint",
    body: "An original sitemap, design token set, component library, and per-page section plan. Derived from the findings, never copied from a competitor.",
  },
  {
    icon: FileCode2,
    title: "Package",
    body: "A validated, platform-adapted prompt package that builds the blueprint in the AI tool you already use.",
  },
];

function HowItWorks() {
  return (
    <div className="mt-20">
      <SectionIntro
        title="Four stages, one canonical artifact chain"
        description="Each stage emits a versioned JSON artifact. Every report and export is a derived view, so the data never drifts from the analysis."
      />
      <ol className="relative mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-hairline lg:block" />
        {PIPELINE.map((stage, i) => (
          <li key={stage.title} className="relative flex flex-col items-start">
            <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-iris/30 bg-void">
              <stage.icon className="h-4 w-4 text-iris-soft" aria-hidden />
            </span>
            <span className="mt-4 font-mono text-[11px] tracking-wide text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-1 text-sm font-semibold text-ink">{stage.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{stage.body}</p>
          </li>
        ))}
      </ol>
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
        title="Everything the offer needs, not just the engine"
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
          <h2 className="text-display-md font-semibold text-ink">Start finding clients today</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Free for 7 days, full access, no credit card. After your trial, we&apos;ll reach out about
            the right plan for your agency.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/signup">
              Start finding clients
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
