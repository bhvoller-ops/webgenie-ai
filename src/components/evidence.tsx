import { Link2 } from "lucide-react";
import type { EvidenceItem } from "@/lib/intelligence/types";
import { hostOf } from "@/lib/format";

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`${item.sourceCaptureId}-${i}`}
          className="rounded-lg border border-hairline bg-canvas/60 p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-neon-soft">
              {item.type}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-faint">
              <Link2 className="h-3 w-3" aria-hidden />
              {hostOf(item.sourceUrl)}
            </span>
            <span className="ml-auto font-mono text-[11px] tabular-nums text-faint">
              w {item.weight.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
