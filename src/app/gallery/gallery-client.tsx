"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, ExternalLink, Lock, Search, X } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Pill, SectionHeading, type PillTone } from "@/components/ui";
import type { AccessRole } from "@/lib/auth/access";
import { industryList, type IndustryConfig } from "@/data/gallery/industries";
import { industryCategories, getIndustryCategory, getCategoryCount } from "@/data/gallery/categories";
import { cn } from "@/lib/format";
import { GalleryThumbImage } from "@/components/gallery-thumb-image";

/**
 * Ported from a Bolt.new "Multi-Industry Website Template" export (28 Aug
 * 2026) — see CLAUDE.md for the full story. Two things were deliberately
 * NOT carried over from the source app:
 *  - Its own separate Supabase project + sign-in/admin-gating for "Open
 *    Full Preview" and an AI-prompt generator. This page reuses WebGenie's
 *    one existing Supabase project and one auth system instead (see the
 *    PUBLIC EXAMPLES AUTH GATE note below for how full-view access is
 *    actually checked) — no DB reads or writes of its own beyond that,
 *    everything else here is static reference data.
 *  - The AI-prompt generator specifically — WebGenie already has its own
 *    real prompt-generation pipeline (lib/prompts/); a second, unrelated one
 *    bolted onto this page would just be duplicate surface area.
 * What WAS carried over close to verbatim: renderIndustryPage() (lib/) and
 * the 64 industry configs (data/gallery/) that passed a real visual check —
 * see categories.ts's own comment for why it's 64 and not the source's 84.
 *
 * PUBLIC EXAMPLES AUTH GATE (owner-directed correction): the interactive
 * preview used to call renderIndustryPage() directly in the browser --
 * a pure function of this same already-bundled industryList, no server
 * round trip. Full-view access must be checked server-side, so the actual
 * assembled page HTML now only ever comes from /api/gallery-preview
 * (a real authenticated request, cookie-checked there), never rendered
 * here directly. A logged-out visitor gets no modal and no iframe at all
 * -- cards render as plain, non-interactive thumbnails with a compact
 * lock label, and one section-level sign-in link does the actual work
 * (avoids a disabled-looking button on all 64 cards).
 *
 * Honest limitation: industryList itself (services/testimonials counts,
 * hero images, colors) stays in this client bundle regardless -- it's
 * what the search/filter/thumbnail grid below already needs, and none of
 * it is private. What's gated is the assembled full-page output and the
 * one-click/direct-URL path to it, not the underlying static config.
 */

const CATEGORY_TONE: PillTone = "iris";

export function GalleryClient({ role, isAuthenticated }: { role: AccessRole; isAuthenticated: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [preview, setPreview] = useState<IndustryConfig | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return industryList.filter((ind) => {
      const matchesCategory = category === "all" || getIndustryCategory(ind.id) === category;
      const matchesQuery = !q || ind.industryName.toLowerCase().includes(q) || ind.businessName.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  function galleryPreviewUrl(ind: IndustryConfig) {
    return `/api/gallery-preview?id=${encodeURIComponent(ind.id)}`;
  }

  function openFullPreview(ind: IndustryConfig) {
    if (!isAuthenticated) return; // belt-and-suspenders -- the trigger is never rendered logged-out anyway.
    window.open(galleryPreviewUrl(ind), "_blank", "noopener,noreferrer");
  }

  function handleCardClick(ind: IndustryConfig) {
    if (!isAuthenticated) return; // no modal, no iframe for a logged-out visitor.
    setPreview(ind);
  }

  // Public SaaS Impeccable rebuild (Phase 6): the quick-preview modal had no
  // keyboard dismissal at all -- Escape now closes it, matching the same
  // pattern NavGroup already uses for its own dropdown.
  useEffect(() => {
    if (!preview) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPreview(null);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [preview]);

  return (
    <PageShell role={role}>
      <SectionHeading
        center
        title="Industry gallery"
        description={
          isAuthenticated
            ? `${industryList.length} illustrative industry website templates — a separate example library from WebGenie's real site generator. Click any card to preview the complete page.`
            : `${industryList.length} illustrative industry website templates — a separate example library from WebGenie's real site generator.`
        }
      />

      {!isAuthenticated ? (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-faint">
          Sign in to view full demo pages.{" "}
          <Link href="/login?returnTo=/gallery" className="font-medium text-iris-soft underline decoration-dotted underline-offset-4 hover:text-iris">
            Sign in
          </Link>
        </p>
      ) : null}

      <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-lg border border-hairline bg-canvas px-4 py-2.5">
        <Search className="h-4 w-4 text-faint" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${industryList.length} industries…`}
          aria-label="Search industries"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {industryCategories.map((cat) => {
          const count = getCategoryCount(cat.id);
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              aria-pressed={isActive}
              className={cn(
                "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive ? "border-iris/40 bg-iris/15 text-iris-soft" : "border-hairline bg-canvas text-muted hover:border-iris/30 hover:text-ink"
              )}
            >
              {cat.label}
              <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-[13px]", isActive ? "bg-iris/25 text-iris-soft" : "bg-raised text-faint")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-faint" role="status">
        Showing {filtered.length} of {industryList.length} industries
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ind) => {
          const CardTag = isAuthenticated ? "button" : "div";
          return (
            <CardTag
              key={ind.id}
              {...(isAuthenticated ? { onClick: () => handleCardClick(ind) } : {})}
              className={cn(
                "group flex flex-col overflow-hidden rounded-panel border border-hairline bg-canvas text-left transition-colors",
                isAuthenticated && "hover:border-iris/40"
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-raised">
                <GalleryThumbImage heroImage={ind.heroImage} industryName={ind.industryName} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)" }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: ind.colors.primary }}>
                    <span className="text-base font-bold text-white">{ind.industryName.charAt(0)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{ind.industryName}</h3>
                  <p className="mt-1 text-xs text-white/70">{ind.businessName}</p>
                </div>
                {isAuthenticated ? (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 opacity-0 transition group-hover:opacity-100">
                    <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
                  </span>
                ) : (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900">
                    <Lock className="h-3.5 w-3.5" aria-hidden /> Sign in to view
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ind.colors.primary }} />
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ind.colors.accent }} />
                  <h3 className="flex-1 truncate text-sm font-semibold text-ink">{ind.industryName}</h3>
                </div>
                <p className="mt-1 text-sm text-faint">{ind.services.length} services · {ind.testimonials.length} reviews</p>
              </div>
            </CardTag>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-faint">No industries match &ldquo;{query}&rdquo;.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="focus-ring mt-3 text-sm font-medium text-iris-soft transition-colors hover:text-iris"
          >
            Clear search and filters
          </button>
        </div>
      ) : null}

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.industryName} preview`}
        >
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-panel border border-hairline bg-canvas" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: preview.colors.primary }} />
                <h3 className="truncate text-sm font-semibold text-ink">{preview.industryName} — {preview.businessName}</h3>
                <Pill tone={CATEGORY_TONE}>{industryCategories.find((c) => c.id === getIndustryCategory(preview.id))?.label}</Pill>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openFullPreview(preview)} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-iris px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open full preview
                </button>
                <button onClick={() => setPreview(null)} aria-label="Close preview" className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-raised hover:text-ink">
                  <X className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>
            </div>
            {/* Fetched from the protected /api/gallery-preview route (real, cookie-checked server-side auth) -- this modal only ever opens when isAuthenticated is true (see handleCardClick), never rendered client-side directly. */}
            <iframe title="Industry preview" src={galleryPreviewUrl(preview)} className="h-full w-full bg-white" />
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
