"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Settings, X } from "lucide-react";
import { signOut } from "@/app/actions";
import type { AccessRole } from "@/lib/auth/access";
import type { NavGroupItem as NavItem } from "@/components/nav-group";

interface SimpleNavItem {
  href: string;
  label: string;
}

/**
 * The desktop nav (components/shell.tsx TopBar) is `hidden md:flex` with no
 * mobile fallback of any kind — below tablet width there was previously no
 * way to reach any nav link at all, including "My Referrals" for a partner
 * checking their portal from a phone. This is the fallback: a hamburger
 * button, `md:hidden`, opening a full list of the same links flattened
 * (no nested dropdowns needed at this width).
 */
export function MobileNav({
  role,
  prospectorItems,
  dashboardItems,
  publicItems
}: {
  role: AccessRole;
  prospectorItems: NavItem[];
  dashboardItems: NavItem[];
  publicItems: SimpleNavItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="focus-ring rounded-lg border border-hairline p-2 text-muted transition-colors hover:text-ink"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 border-b border-hairline bg-canvas px-4 py-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {role === "admin" ? (
              <>
                <p className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Prospector</p>
                {prospectorItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="focus-ring flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-raised">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/25 bg-iris/10 text-iris-soft">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-faint">{item.description}</span>
                    </span>
                  </Link>
                ))}
                <p className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Dashboard</p>
                {dashboardItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="focus-ring flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-raised">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/25 bg-iris/10 text-iris-soft">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-faint">{item.description}</span>
                    </span>
                  </Link>
                ))}
                <Link href="/settings" onClick={() => setOpen(false)} className="focus-ring mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                  <Settings className="h-4 w-4" aria-hidden />
                  Settings
                </Link>
              </>
            ) : null}
            {role === "partner" ? (
              <Link href="/partners/portal" onClick={() => setOpen(false)} className="focus-ring rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                My Referrals
              </Link>
            ) : null}
            {role === "beta" ? (
              <Link href="/trial/portal" onClick={() => setOpen(false)} className="focus-ring rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                My Trials
              </Link>
            ) : null}
            <p className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">More</p>
            {publicItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="focus-ring rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-hairline pt-3">
              {role === "guest" ? (
                <div className="space-y-2">
                  <Link href="/signup" onClick={() => setOpen(false)} className="focus-ring block rounded-lg bg-iris px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Get started free
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)} className="focus-ring block rounded-lg border border-hairline px-3 py-2.5 text-center text-sm text-muted hover:text-ink">
                    Sign in
                  </Link>
                </div>
              ) : (
                <form action={signOut}>
                  <button type="submit" className="focus-ring w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-muted hover:text-ink">
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
