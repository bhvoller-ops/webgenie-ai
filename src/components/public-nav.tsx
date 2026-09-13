"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

/**
 * Public SaaS Impeccable rebuild (Phase 3): the credible-SaaS header nav —
 * Product / How It Works / Examples / Who It's For / Plans. Deliberately
 * flat links, not NavGroup dropdowns (there is nothing to browse here, each
 * is a single destination), and deliberately separate from the
 * authenticated WORK/OUTREACH/DELIVERY/RESOURCES NavGroups in shell.tsx —
 * this component is guest-only.
 *
 * The section anchors (`/#product`, `/#how-it-works`, `/#who-its-for`,
 * `/#plans`) target ids on the homepage; from any other guest page they
 * still resolve correctly (Next.js navigates to `/` and the browser
 * scrolls to the hash). "Examples" is a real route (`/gallery`, the full
 * library) rather than a homepage anchor, and is shown active from either
 * `/gallery` or `/samples` — the two example-browsing destinations.
 */
export const PUBLIC_NAV_ITEMS = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/gallery", label: "Examples", matchAlso: ["/samples"] },
  { href: "/#who-its-for", label: "Who It's For" },
  { href: "/#plans", label: "Plans" },
] as const;

function isNavItemActive(pathname: string | null, item: (typeof PUBLIC_NAV_ITEMS)[number]): boolean {
  if (item.href.startsWith("/#")) return false;
  if (pathname === item.href) return true;
  const matchAlso = "matchAlso" in item ? item.matchAlso : undefined;
  return Boolean(matchAlso?.some((path) => pathname === path));
}

export function PublicNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring rounded-lg px-3 py-2 text-sm transition-colors hover:bg-raised hover:text-ink",
              active ? "text-ink" : "text-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PublicMobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-raised hover:text-ink",
              active ? "bg-raised text-ink" : "text-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
