"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface TabItem {
  id: string;
  label: string;
  badge?: ReactNode;
  content: ReactNode;
}

export function Tabs({ items, initial }: { items: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto rounded-xl border border-hairline bg-canvas/80 p-1"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(item.id)}
              className={cn(
                "focus-ring relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-raised text-ink shadow-panel" : "text-muted hover:text-ink"
              )}
            >
              {item.label}
              {item.badge ? (
                <span className="rounded-full bg-hairline px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="mt-6 animate-fade-up">
        {current?.content}
      </div>
    </div>
  );
}
