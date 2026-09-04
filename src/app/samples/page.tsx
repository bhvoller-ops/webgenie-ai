import { ExternalLink, Star } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Card, SectionHeading } from "@/components/ui";
import { industryLabel } from "@/lib/sitegen/industry-lookup";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import { SAMPLE_BUSINESSES } from "@/lib/sitegen/samples";
import { getAccessContext } from "@/lib/auth/access";

// Public — no login required, same reasoning as /gallery. Was
// force-static; switched to force-dynamic since reading the caller's role
// for the nav requires the per-request auth cookie.
export const dynamic = "force-dynamic";

export default async function SamplesPage() {
  const { role } = await getAccessContext();
  return (
    <PageShell role={role}>
      <SectionHeading
        title="Sample sites"
        description="One example per industry, always available — for checking design quality at a glance or pulling up on a call without re-running Finder."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_BUSINESSES.map((business) => {
          const url = demoSiteUrl(business, { by: "WebGenie AI", badge: false });
          return (
            <a key={business.id} href={url} target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full transition-colors group-hover:border-iris/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-iris-soft">{industryLabel(business.industry)}</p>
                <h3 className="mt-1.5 flex items-center gap-1.5 text-base font-semibold text-ink">
                  {business.name}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-faint transition-colors group-hover:text-iris-soft" aria-hidden />
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {business.city}, {business.state}
                </p>
                {business.rating ? (
                  <p className="mt-3 flex items-center gap-1 text-sm text-muted">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-400" aria-hidden />
                    <span className="font-medium text-ink">{business.rating}</span>({business.reviewCount} reviews)
                  </p>
                ) : null}
              </Card>
            </a>
          );
        })}
      </div>
    </PageShell>
  );
}
