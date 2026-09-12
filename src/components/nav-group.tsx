"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

export interface NavGroupItem {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}

/**
 * UI clarity correction: a workflow-grouped top-bar menu (WORK / OUTREACH /
 * DELIVERY) -- icon, title, one-line description per destination, so a
 * short label ("Leads", "Onboard", "Partners"...) still tells anyone
 * unfamiliar with the app what it actually does. Now also reports the
 * current-page state on both the trigger (a filled dot when any item in
 * this group is the active route) and the active item itself -- the
 * previous version had no current-page indication at all.
 */
export function NavGroup({ label, items }: { label: string; items: NavGroupItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const hasActiveItem = items.some((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`));

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const wide = items.length > 2;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-raised hover:text-ink",
          open || hasActiveItem ? "text-ink" : "text-muted",
          open && "bg-raised"
        )}
      >
        {hasActiveItem ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden /> : null}
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 rounded-2xl border border-hairline bg-canvas p-2 shadow-2xl animate-fade-up",
            wide ? "grid w-[440px] grid-cols-2 gap-1" : "w-[260px]"
          )}
        >
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-raised",
                  active && "bg-raised"
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
                    active ? "border-iris/45 bg-iris/15 text-iris-soft" : "border-iris/25 bg-iris/10 text-iris-soft group-hover:border-iris/45 group-hover:bg-iris/15"
                  )}
                >
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
                    {item.label}
                    {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden /> : null}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-faint">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
