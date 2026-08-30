"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * A small dropdown for grouping related nav links under one top-bar item
 * ("Prospector" → Find Clients / Find Audits, "Dashboard" → Call Tracker /
 * Leads / etc.). No existing dropdown primitive in components/ui.tsx, so
 * this is self-contained rather than pulling in a menu library for two
 * short lists of links.
 */
export function NavGroup({ label, items }: { label: string; items: Array<{ href: string; label: string }> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "focus-ring inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink",
          open && "bg-raised text-ink"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-hairline bg-canvas p-1.5 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="focus-ring block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
