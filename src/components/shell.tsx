import Link from "next/link";
import type { ReactNode } from "react";
import { Plus, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { signOut } from "@/app/actions";

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

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-void/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "/finder", label: "Find Clients" },
            { href: "/audit", label: "Find Audits" },
            { href: "/calls", label: "Call Tracker" },
            { href: "/leads", label: "Chat Leads" },
            { href: "/onboard", label: "Onboard" },
            { href: "/", label: "Projects" },
          ].map((l) => (
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
          <form action={signOut}>
            <button
              type="submit"
              className="focus-ring rounded-lg border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-iris/50 hover:text-ink"
            >
              Sign out
            </button>
          </form>
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

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
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
