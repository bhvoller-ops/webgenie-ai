import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCheck,
  FolderKanban,
  Handshake,
  Inbox,
  LifeBuoy,
  Phone,
  Plus,
  Radar,
  Repeat,
  Rocket,
  Search,
  Settings,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui";
import { NavGroup, type NavGroupItem } from "@/components/nav-group";
import { MobileNav } from "@/components/mobile-nav";
import { PublicNav } from "@/components/public-nav";
import { signOut } from "@/app/actions";
import { cn } from "@/lib/format";
import type { AccessRole } from "@/lib/auth/access";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring group inline-flex items-center gap-2.5 rounded-lg">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-iris to-iris-deep shadow-glow">
        <Sparkles className="h-4 w-4 text-white" aria-hidden />
      </span>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          WebGenie<span className="text-iris-soft"> AI</span>
        </span>
      ) : null}
    </Link>
  );
}

/**
 * UI clarity correction: regrouped around the user's actual workflow
 * (WORK -> OUTREACH -> DELIVERY), replacing the previous "Prospector" /
 * "Dashboard" split that mixed operational areas, project creation, and
 * public marketing resources at the same level. Public-facing reference
 * material (Samples, Gallery) moves to its own low-emphasis RESOURCES
 * group below so it stops competing visually with Daily Queue and
 * Finder — see RESOURCES_ITEMS.
 *
 * "Prospects" (the spec's third WORK destination) has no dedicated index
 * route in this app -- prospects are only ever reached via Daily Queue,
 * Finder, or a project -- so it's intentionally omitted rather than
 * invented. "Find Audits" (/audit), a real existing prospecting
 * destination, takes its place in WORK instead.
 */
const WORK_ITEMS: NavGroupItem[] = [
  {
    href: "/prospecting",
    label: "Daily Queue",
    description: "Today's prospects and follow-ups worth acting on, in priority order.",
    icon: <CheckCheck className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/finder",
    label: "Find Clients",
    // OWNER-REVIEW CORRECTION: Finder (P0.5) shows every result a search
    // returns, not only businesses with no website -- this previously
    // undersold current Finder behavior and read as identical to Find
    // Audits below. Rewritten to name the real distinguishing behavior:
    // a scored, mixed result set, with an instant demo only for the
    // no-website subset.
    description: "Search local businesses of any kind — every result scored, with a demo site ready instantly for anyone with no website yet.",
    icon: <Search className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/audit",
    label: "Find Audits",
    // Distinct from Find Clients above: this search is scoped to
    // businesses that already have a website, and queues each match
    // straight for the real 11-module audit -- no separate review step.
    description: "Search businesses that already have a website — each match is queued straight for a real 11-module audit.",
    icon: <Radar className="h-4 w-4" aria-hidden />,
  },
];

const OUTREACH_ITEMS: NavGroupItem[] = [
  {
    href: "/sequences",
    label: "Sequences",
    description: "Build a human-executed outreach plan and enroll prospects — you send it, WebGenie prepares it.",
    icon: <Repeat className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/launch",
    label: "Launch Mode",
    description: "A guided week one for a new agency — real progress, no fake pipeline.",
    icon: <Rocket className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/insights",
    label: "Insights",
    description: "Real, trustworthy counts of what's actually happened — never a fabricated pattern.",
    icon: <BarChart3 className="h-4 w-4" aria-hidden />,
  },
];

const DELIVERY_ITEMS: NavGroupItem[] = [
  {
    href: "/projects/new",
    label: "Projects",
    description: "Add a business, then browse every audit, blueprint, and prompt package you've generated.",
    icon: <FolderKanban className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/calls",
    label: "Call Tracker",
    description: "Log dial outcomes, follow-ups, and collect payment on the spot.",
    icon: <Phone className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/leads",
    label: "Leads",
    description: "Every lead a generated site's chat widget or quote form has captured.",
    icon: <Inbox className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/onboard",
    label: "Onboard",
    description: "Walk a new client through the 10-step setup flow.",
    icon: <UserPlus className="h-4 w-4" aria-hidden />,
  },
];

/**
 * Low-emphasis reference material -- public-facing (Samples, Gallery) and
 * account-adjacent (Partners, Playbooks, Support) destinations that don't
 * belong beside Daily Queue/Finder but still need to stay reachable.
 * Deliberately still a NavGroup (so it gets the same current-page
 * indication and keyboard behavior as WORK/OUTREACH/DELIVERY), just the
 * last, plainest-labeled item in the bar.
 */
const RESOURCES_ITEMS: NavGroupItem[] = [
  {
    href: "/partners",
    label: "Partners",
    description: "Manage referral partners, invites, and commission payouts.",
    icon: <Handshake className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "The plan, scripts, and templates this program actually runs on.",
    icon: <BookOpen className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/support",
    label: "Support",
    description: "Open a ticket — real people, not a bot.",
    icon: <LifeBuoy className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/samples",
    label: "Samples",
    description: "Every one of the 73 industry sample sites, browsable by name.",
    icon: <Sparkles className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/gallery",
    label: "Gallery",
    description: "A visual gallery of real generated sites.",
    icon: <FolderKanban className="h-4 w-4" aria-hidden />,
  },
];

/**
 * Public SaaS Impeccable rebuild (P0 centering pass): the public site's
 * shared responsive side padding -- 16-20px mobile, 24-32px tablet, 32-48px
 * desktop -- replacing the previous flat `px-6` (24px at every width) on
 * every guest surface (TopBar, Footer, PageShell's <main>). Authenticated
 * chrome keeps its own unchanged `px-6` literal, kept as a separate string
 * on purpose so a future public-only padding change can't silently reach
 * the authenticated app.
 */
export const PUBLIC_SHELL_PADDING = "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12";

export function TopBar({ role = "guest" }: { role?: AccessRole }) {
  const contentWidth = "max-w-[1280px]";
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-void/75 backdrop-blur-xl">
      <div className={cn("relative mx-auto flex h-16 items-center gap-6", role === "guest" ? PUBLIC_SHELL_PADDING : "px-6", contentWidth)}>
        <Logo />
        {role === "guest" ? (
          <PublicNav />
        ) : (
          <nav className="hidden items-center gap-1 md:flex">
            {role === "admin" ? (
              <>
                <NavGroup label="Work" items={WORK_ITEMS} />
                <NavGroup label="Outreach" items={OUTREACH_ITEMS} />
                <NavGroup label="Delivery" items={DELIVERY_ITEMS} />
                {/* Deliberately last and unstyled-different from the others in
                    every way except position -- still a full NavGroup (current-
                    page indication included), just never first in reading
                    order, so it can't visually compete with Work/Outreach. */}
                <NavGroup label="Resources" items={RESOURCES_ITEMS} />
              </>
            ) : null}
            {role === "partner" ? (
              <Link
                href="/partners/portal"
                className="focus-ring rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                My Referrals
              </Link>
            ) : null}
            {role === "beta" ? (
              <Link
                href="/trial/portal"
                className="focus-ring rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                My Trials
              </Link>
            ) : null}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">
          <MobileNav role={role} workItems={WORK_ITEMS} outreachItems={OUTREACH_ITEMS} deliveryItems={DELIVERY_ITEMS} resourcesItems={RESOURCES_ITEMS} />
          {role === "admin" ? (
            <>
              <Link
                href="/settings"
                className="focus-ring hidden items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-iris/50 hover:text-ink sm:inline-flex"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              {/* Creation is visually distinct from navigation (its own
                  outlined button, never a NavGroup item) -- "New project" and
                  "Find clients" are actions, not destinations to browse. */}
              <Button href="/projects/new" variant="secondary" className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" />
                New project
              </Button>
              <Button href="/finder">Find clients</Button>
            </>
          ) : null}
          {role === "guest" ? (
            <>
              <Link
                href="/login"
                className="focus-ring hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:inline-flex"
              >
                Sign in
              </Link>
              <Button href="/signup">Start Free</Button>
            </>
          ) : (
            <form action={signOut}>
              <button
                type="submit"
                className="focus-ring rounded-lg border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-iris/50 hover:text-ink"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * P0 (VibeLabs brand-relationship pass): rebuilt as a structured
 * multi-column footer -- brand+description, then grouped Product/Account
 * columns, then a Company column naming the real VibeLabs relationship
 * (an external link to vibelabsagency.com, not copied VibeLabs copy) --
 * inspired by vibelabsagency.com's own footer structure. Still no
 * Privacy/Terms links: neither route exists on this app yet, and copying
 * VibeLabs' legal links here would misrepresent WebGenie's own state, so
 * this phase still does not fabricate one.
 */
const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/#product", label: "Product" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/gallery", label: "Examples" },
      { href: "/#plans", label: "Plans" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/signup", label: "Start Free" },
      { href: "/login", label: "Sign In" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Company",
    links: [{ href: "https://www.vibelabsagency.com/", label: "VibeLabs Agency", external: true }],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className={cn("mx-auto max-w-[1280px] py-12", PUBLIC_SHELL_PADDING)}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo compact />
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
              The client-acquisition workspace for agencies — find the right prospects, verify the
              opportunity, and prepare the work before you ever pick up the phone.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="text-[13px] font-semibold text-ink">{col.heading}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="focus-ring rounded text-[13.5px] text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} VibeLabs Agency. All rights reserved.</span>
          <span>WebGenie AI is a product built and operated by VibeLabs Agency.</span>
        </div>
      </div>
    </footer>
  );
}

/**
 * UI clarity correction: the authenticated app previously carried the same
 * marketing footer as the public site on every operational page ("Website
 * intelligence, blueprints, and build-ready prompt packages" doesn't help
 * someone mid-task complete work). A signed-in workspace page gets this
 * minimal version instead — just a version/build tag, no marketing copy,
 * no repeated logo+tagline. The full marketing Footer is preserved
 * unchanged for `role="guest"` (the public site).
 */
function AuthenticatedFooter() {
  return (
    <footer className="mt-16 border-t border-hairline">
      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-6 py-5">
        <span className="font-mono text-[11px] text-faint">SimpleOS · WebGenie AI</span>
      </div>
    </footer>
  );
}

export function PageShell({ children, role = "guest" }: { children: ReactNode; role?: AccessRole }) {
  // Public SaaS Impeccable rebuild (Phase 9): the guest content column was
  // tightened from 1400px to 1280px to match the spec'd max content width
  // (~1200-1280px) for the public site. Authenticated workspace pages keep
  // their own unchanged 1280px/py-8 — same number, but a separate literal,
  // deliberately not shared, so a future public-only width change can't
  // silently touch the authenticated app.
  const contentWidth = role === "guest" ? "max-w-[1280px] py-10" : "max-w-[1280px] py-8";
  return (
    <div className="min-h-screen">
      <TopBar role={role} />
      <main className={cn("mx-auto", role === "guest" ? PUBLIC_SHELL_PADDING : "px-6", contentWidth)}>{children}</main>
      {role === "guest" ? <Footer /> : <AuthenticatedFooter />}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-faint">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="focus-ring rounded transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-muted">{item.label}</span>
          )}
          {i < items.length - 1 ? <span aria-hidden>/</span> : null}
        </span>
      ))}
    </nav>
  );
}
