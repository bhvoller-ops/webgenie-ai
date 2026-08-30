import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/** Simple page-N Prev/Next control, shared by /calls, /leads, /partners. */
export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5 text-sm">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-muted transition-colors hover:border-iris/50 hover:text-ink",
          page <= 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Previous
      </Link>
      <span className="text-faint">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-muted transition-colors hover:border-iris/50 hover:text-ink",
          page >= totalPages && "pointer-events-none opacity-40"
        )}
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
