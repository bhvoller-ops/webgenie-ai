import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  FolderKanban,
  Handshake,
  Inbox,
  Phone,
  Plus,
  Radar,
  Search,
  Settings,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui";
import { NavGroup, type NavGroupItem } from "@/components/nav-group";
import { MobileNav } from "@/components/mobile-nav";
import { signOut } from "@/app/actions";
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

const PROSPECTOR_ITEMS: NavGroupItem[] = [
  {
    href: "/finder",
    label: "Find Clients",
    description: "Scan Google Maps for businesses with no website — build each one a demo site instantly.",
    icon: <Search className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/audit",
    label: "Find Audits",
    description: "Find businesses with a bad website and queue a real 11-module intelligence scan.",
    icon: <Radar className="h-4 w-4" aria-hidden />,
  },
];

const DASHBOARD_ITEMS: NavGroupItem[] = [
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
  {
    href: "/partners",
    label: "Partners",
    description: "Manage referral partners, invites, and commission payouts.",
    icon: <Handshake className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/projects/new",
    label: "Projects",
    description: "Add a business, then browse every audit, blueprint, and prompt package you've generated.",
    icon: <FolderKanban className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "The plan, scripts, and templates this program actually runs on.",
    icon: <BookOpen className="h-4 w-4" aria-hidden />,
  },
];

const PUBLIC_ITEMS = [
  { href: "/samples", label: "Samples" },
  { href: "/gallery", label: "Gallery" },
];

export function TopBar({ role = "guest" }: { role?: AccessRole }) {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-void/75 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {role === "admin" ? (
            <>
              <NavGroup label="Prospector" items={PROSPECTOR_ITEMS} />
              <NavGroup label="Dashboard" items={DASHBOARD_ITEMS} />
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
          {PUBLIC_ITEMS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <MobileNav role={role} prospectorItems={PROSPECTOR_ITEMS} dashboardItems={DASHBOARD_ITEMS} publicItems={PUBLIC_ITEMS} />
          {role === "admin" ? (
            <>
              <Link
                href="/settings"
                className="focus-ring hidden items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-iris/50 hover:text-ink sm:inline-flex"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
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
              <Button href="/signup">Get started free</Button>
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

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-8">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="text-xs text-faint">
            Website intelligence, blueprints, and build-ready prompt packages.
          </span>
        </div>
        <span className="font-mono text-[11px] text-faint">SimpleOS · WebGenie AI</span>
      </div>
    </footer>
  );
}

export function PageShell({ children, role = "guest" }: { children: ReactNode; role?: AccessRole }) {
  return (
    <div className="min-h-screen">
      <TopBar role={role} />
      <main className="mx-auto max-w-[1400px] px-6 py-10">{children}</main>
      <Footer />
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
