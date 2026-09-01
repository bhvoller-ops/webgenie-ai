"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

export interface NavGroupItem {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}

/**
 * The Dashboard / Prospector top-bar menus. Was a plain link list; redone as
 * a card grid — icon, title, one-line description per destination — since a
 * bare list of five short labels ("Leads", "Onboard", "Partners"...) doesn't
 * tell anyone unfamiliar with the app what they actually do.
 */
export function NavGroup({ label, items }: { label: string; items: NavGroupItem[] }) {
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

  const wide = items.length > 2;

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
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 rounded-2xl border border-hairline bg-canvas p-2 shadow-2xl animate-fade-up",
            wide ? "grid w-[440px] grid-cols-2 gap-1" : "w-[260px]"
          )}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="focus-ring group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-raised"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-iris/25 bg-iris/10 text-iris-soft transition-colors group-hover:border-iris/45 group-hover:bg-iris/15">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">{item.label}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-faint">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
