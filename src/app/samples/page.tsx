import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Button, SectionHeading } from "@/components/ui";
import { industryLabel } from "@/lib/sitegen/industry-lookup";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import { SAMPLE_BUSINESSES } from "@/lib/sitegen/samples";
import { getAccessContext } from "@/lib/auth/access";
import type { Business } from "@/lib/sitegen/types";

// Public — no login required, same reasoning as /gallery. Was
// force-static; switched to force-dynamic since reading the caller's role
// for the nav requires the per-request auth cookie.
export const dynamic = "force-dynamic";

/**
 * Public SaaS Impeccable rebuild (Phase 6): distinct from /gallery, which
 * is the complete, searchable template library. /samples is the smaller,
 * curated set worth showing a first-time visitor or pulling up mid-call --
 * so a Featured subset (real live-rendered previews, not text cards) leads
 * the page. Every real generator industry still stays reachable below in
 * "All industries" -- unlike /gallery's 64 static templates, these 14 are
 * the actual site-generation engine, and this page is also the reference
 * material an admin pulls up mid-call (see components/shell.tsx's
 * Resources nav group), so nothing here is hidden, only reordered.
 */
const FEATURED_IDS = ["sample-plumber", "sample-hvac", "sample-electrician", "sample-roofer", "sample-dentist", "sample-med_spa"];
const FEATURED = FEATURED_IDS.map((id) => SAMPLE_BUSINESSES.find((b) => b.id === id)!);
const REST = SAMPLE_BUSINESSES.filter((b) => !FEATURED_IDS.includes(b.id));

function SampleThumbnail({ business }: { business: Business }) {
  const url = demoSiteUrl(business, { by: "WebGenie AI", sample: true });
  return (
    <div className="card overflow-hidden p-0 transition-colors hover:border-iris/50">
      <div className="relative h-40 w-full overflow-hidden bg-white">
        <iframe
          src={url}
          title={`Live preview of a generated demo site for ${business.name}`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none origin-top-left"
          style={{ width: "400%", height: "400%", transform: "scale(0.25)", border: "none" }}
        />
      </div>
      <div className="p-4">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-iris-soft">{industryLabel(business.industry)}</p>
        <h3 className="mt-1 text-sm font-semibold text-ink">{business.name}</h3>
        <p className="mt-0.5 text-sm text-faint">
          {business.city}, {business.state} · Illustrative example
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-iris-soft transition-colors hover:text-iris"
        >
          View full demo
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export default async function SamplesPage() {
  const { role } = await getAccessContext();
  return (
    <PageShell role={role}>
      <SectionHeading
        title="Sample sites"
        description="Illustrative example businesses, built by the real WebGenie generator — not real prospects. Use these to judge design quality, or pull one up mid-call as a reference."
      />

      <p className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-faint">Featured examples</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((business) => (
          <SampleThumbnail key={business.id} business={business} />
        ))}
      </div>

      <p className="mt-12 text-[13px] font-semibold uppercase tracking-wide text-faint">All industries</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REST.map((business) => (
          <SampleThumbnail key={business.id} business={business} />
        ))}
      </div>

      <div className="mt-14 rounded-card border border-hairline bg-canvas/60 p-8 text-center">
        <h2 className="text-base font-semibold text-ink">Ready to find opportunities like these?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/80">
          These are illustrative examples. WebGenie builds the same kind of site for real prospects
          you find and verify yourself.
        </p>
        <div className="mt-5">
          <Button href="/signup">
            Start Free
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
