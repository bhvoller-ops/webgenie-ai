"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Settings, X } from "lucide-react";
import { signOut } from "@/app/actions";
import type { AccessRole } from "@/lib/auth/access";
import type { NavGroupItem as NavItem } from "@/components/nav-group";
import { PublicMobileNavLinks } from "@/components/public-nav";
import { cn } from "@/lib/format";

/**
 * The desktop nav (components/shell.tsx TopBar) is `hidden md:flex` with no
 * mobile fallback of any kind — below tablet width there was previously no
 * way to reach any nav link at all, including "My Referrals" for a partner
 * checking their portal from a phone. This is the fallback: a hamburger
 * button, `md:hidden`, opening a full list of the same links flattened
 * (no nested dropdowns needed at this width).
 *
 * UI clarity correction: regrouped to match the desktop WORK / OUTREACH /
 * DELIVERY / RESOURCES split (was "Prospector" / "Dashboard" / "More",
 * which put Samples and Gallery one tap away from Daily Queue). Each link
 * now also marks the current page (`aria-current="page"` plus a filled
 * dot), which the mobile menu previously had no equivalent of at all.
 */
function GroupLabel({ children }: { children: string }) {
  return <p className="mt-3 px-3 text-[12px] font-semibold uppercase tracking-wider text-faint first:mt-2">{children}</p>;
}

function MobileNavLink({ item, active, onClose }: { item: NavItem; active: boolean; onClose: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn("focus-ring flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-raised", active && "bg-raised")}
    >
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg border", active ? "border-iris/45 bg-iris/15 text-iris-soft" : "border-iris/25 bg-iris/10 text-iris-soft")}>
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {item.label}
          {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden /> : null}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-faint">{item.description}</span>
      </span>
    </Link>
  );
}

export function MobileNav({
  role,
  workItems,
  outreachItems,
  deliveryItems,
  resourcesItems
}: {
  role: AccessRole;
  workItems: NavItem[];
  outreachItems: NavItem[];
  deliveryItems: NavItem[];
  resourcesItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const close = () => setOpen(false);

  return (
    // P0 (centering pass): guest's hamburger stays visible until `lg`
    // (matching PublicNav's own lg:flex handoff) since the 5 flat public
    // nav items need more room at md than the authenticated NavGroup
    // dropdowns this same breakpoint still works fine for.
    <div className={role === "guest" ? "lg:hidden" : "md:hidden"}>
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
        <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-hairline bg-canvas px-4 py-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {role === "guest" ? <PublicMobileNavLinks onClose={close} /> : null}
            {role === "admin" ? (
              <>
                <GroupLabel>Work</GroupLabel>
                {workItems.map((item) => (
                  <MobileNavLink key={item.href} item={item} active={isActive(item.href)} onClose={close} />
                ))}
                <GroupLabel>Outreach</GroupLabel>
                {outreachItems.map((item) => (
                  <MobileNavLink key={item.href} item={item} active={isActive(item.href)} onClose={close} />
                ))}
                <GroupLabel>Delivery</GroupLabel>
                {deliveryItems.map((item) => (
                  <MobileNavLink key={item.href} item={item} active={isActive(item.href)} onClose={close} />
                ))}
                <GroupLabel>Resources</GroupLabel>
                {resourcesItems.map((item) => (
                  <MobileNavLink key={item.href} item={item} active={isActive(item.href)} onClose={close} />
                ))}
                <GroupLabel>System</GroupLabel>
                <Link
                  href="/settings"
                  onClick={close}
                  aria-current={isActive("/settings") ? "page" : undefined}
                  className={cn("focus-ring flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink", isActive("/settings") && "bg-raised text-ink")}
                >
                  <Settings className="h-4 w-4" aria-hidden />
                  Settings
                </Link>
              </>
            ) : null}
            {role === "partner" ? (
              <Link href="/partners/portal" onClick={close} className="focus-ring rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                My Referrals
              </Link>
            ) : null}
            {role === "beta" ? (
              <Link href="/trial/portal" onClick={close} className="focus-ring rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink">
                My Trials
              </Link>
            ) : null}
            <div className="mt-3 border-t border-hairline pt-3">
              {role === "guest" ? (
                <div className="space-y-2">
                  <Link href="/signup" onClick={close} className="focus-ring block rounded-lg bg-iris px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Start Free
                  </Link>
                  <Link href="/login" onClick={close} className="focus-ring block rounded-lg border border-hairline px-3 py-2.5 text-center text-sm text-muted hover:text-ink">
                    Sign in
                  </Link>
                </div>
              ) : (
                // Sign out is a plain bordered secondary control, deliberately
                // never styled like a primary workflow action.
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
