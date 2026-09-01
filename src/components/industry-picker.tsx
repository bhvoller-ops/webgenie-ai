"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Search } from "lucide-react";
import { INDUSTRY_LIST } from "@/lib/sitegen/industries";
import type { IndustryKey } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";

/**
 * A searchable dropdown for picking an industry — replaces the plain
 * <select> everywhere one was used (Finder, Audit, New Project). A native
 * select is fine for a handful of options; scanning 14 (and growing)
 * alphabetical labels in a stock browser dropdown isn't, especially on a
 * call where the goal is picking fast, not reading carefully.
 */
export function IndustryPicker({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: IndustryKey;
  onChange: (key: IndustryKey) => void;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const current = INDUSTRY_LIST.find((p) => p.key === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? INDUSTRY_LIST.filter((p) => p.label.toLowerCase().includes(q)) : INDUSTRY_LIST;
    return [...list].sort((a, b) => a.label.localeCompare(b.label));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = setTimeout(() => searchRef.current?.focus(), 10);
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "focus-ring flex w-full items-center gap-2 rounded-xl border border-hairline bg-surface text-left text-sm text-ink transition-colors hover:border-iris/40",
          compact ? "px-2.5 py-1.5 text-[12px]" : "py-3 pl-10 pr-9"
        )}
      >
        {!compact ? <Building2 className="pointer-events-none absolute left-3.5 h-4 w-4 text-faint" aria-hidden /> : null}
        <span className="min-w-0 flex-1 truncate">{current?.label ?? "Select an industry"}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-faint transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[280px] overflow-hidden rounded-xl border border-hairline bg-canvas shadow-2xl animate-fade-up">
          <div className="relative border-b border-hairline p-2">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search industries…"
              className="focus-ring w-full rounded-lg border border-hairline bg-surface py-2 pl-8 pr-3 text-[13px] text-ink placeholder:text-faint"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-[12.5px] text-faint">No industry matches &ldquo;{query}&rdquo;.</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    onChange(p.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-raised",
                    p.key === value ? "text-ink" : "text-muted"
                  )}
                >
                  <span className="truncate">{p.label}</span>
                  {p.key === value ? <Check className="h-3.5 w-3.5 shrink-0 text-iris-soft" aria-hidden /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
