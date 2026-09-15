import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
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
 *
 * P0 (iframe-overload correction): all 14 thumbnails were originally
 * always-loaded live iframes -- 14 full generated-site documents on one
 * page load. Replaced with static, pre-optimized screenshots
 * (public/sample-previews/, see scripts/generate-sample-thumbnails.mjs).
 * "View full demo" still opens the real, live, fully-interactive site --
 * as a full top-level page navigation, never an embedded iframe here.
 *
 * PUBLIC EXAMPLES AUTH GATE (owner-directed correction): "View full demo"
 * now only renders for a signed-in visitor. A logged-out visitor sees the
 * same static thumbnail plus a compact "Full demo available after
 * sign-in" label -- no link, no button, nothing to click per card (avoids
 * the visual noise of a disabled button on all 14 cards) -- and one
 * section-level sign-in CTA does the actual work. This is a client-side
 * convenience only: the real enforcement is server-side in
 * /api/demo-site/route.ts (isKnownSampleBusiness()), which is what
 * actually stops a logged-out visitor who types or bookmarks the demo URL
 * directly, not this page's rendering choice.
 */
const FEATURED_IDS = ["sample-plumber", "sample-hvac", "sample-electrician", "sample-roofer", "sample-dentist", "sample-med_spa"];
const FEATURED = FEATURED_IDS.map((id) => SAMPLE_BUSINESSES.find((b) => b.id === id)!);
const REST = SAMPLE_BUSINESSES.filter((b) => !FEATURED_IDS.includes(b.id));

function SampleThumbnail({ business, isAuthenticated }: { business: Business; isAuthenticated: boolean }) {
  const url = demoSiteUrl(business, { by: "WebGenie AI", sample: true });
  const label = industryLabel(business.industry);
  const shortId = business.id.replace("sample-", "");
  return (
    <div className="card overflow-hidden p-0 transition-colors hover:border-iris/50">
      <div className="relative h-40 w-full overflow-hidden bg-white">
        <Image
          src={`/sample-previews/${shortId}.jpg`}
          alt={`Preview of the generated demo site for ${business.name}, a ${label.toLowerCase()} in ${business.city}, ${business.state}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="p-4">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-iris-soft">{label}</p>
        <h3 className="mt-1 text-sm font-semibold text-ink">{business.name}</h3>
        <p className="mt-0.5 text-sm text-faint">
          {business.city}, {business.state} · Illustrative example
        </p>
        {isAuthenticated ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-iris-soft transition-colors hover:text-iris"
          >
            View full demo
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-faint">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Full demo available after sign-in
          </p>
        )}
      </div>
    </div>
  );
}

export default async function SamplesPage() {
  const { role, user } = await getAccessContext();
  const isAuthenticated = Boolean(user);
  return (
    <PageShell role={role}>
      <SectionHeading
        center
        title="Sample sites"
        description="Illustrative example businesses, built by the real WebGenie generator — not real prospects. Use these to judge design quality, or pull one up mid-call as a reference."
      />

      {!isAuthenticated ? (
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-faint">
          Sign in to view full demos.{" "}
          <Link href="/login?returnTo=/samples" className="font-medium text-iris-soft underline decoration-dotted underline-offset-4 hover:text-iris">
            Sign in
          </Link>
        </p>
      ) : null}

      <p className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-faint">Featured examples</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((business) => (
          <SampleThumbnail key={business.id} business={business} isAuthenticated={isAuthenticated} />
        ))}
      </div>

      <p className="mt-12 text-[13px] font-semibold uppercase tracking-wide text-faint">All industries</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REST.map((business) => (
          <SampleThumbnail key={business.id} business={business} isAuthenticated={isAuthenticated} />
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
