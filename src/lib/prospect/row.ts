import type { Prospect } from "@/lib/prospect/types";

/** Shared snake_case DB row -> camelCase Prospect mapper, used by both the
 * data seam (lib/data/provider.ts) and the API routes that need a fresh
 * Prospect object immediately after an insert/update (before a re-read). */
export function rowToProspect(row: Record<string, unknown>): Prospect {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    source: row.source as Prospect["source"],
    googlePlaceId: (row.google_place_id as string | null) ?? undefined,
    businessName: row.business_name as string,
    industry: (row.industry as string | null) ?? undefined,
    phone: (row.phone as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    websiteUrl: (row.website_url as string | null) ?? undefined,
    hasWebsite: Boolean(row.has_website),
    address: (row.address as string | null) ?? undefined,
    city: (row.city as string | null) ?? undefined,
    state: (row.state as string | null) ?? undefined,
    rating: (row.rating as number | null) ?? undefined,
    reviewCount: (row.review_count as number | null) ?? undefined,
    open24Hours: Boolean(row.open_24_hours),
    demoUrl: (row.demo_url as string | null) ?? undefined,
    projectId: (row.project_id as string | null) ?? undefined,
    status: row.status as Prospect["status"],
    // migration 035 columns -- `row.public_profile` is simply absent (not
    // an error) from a `select("*")` result on a schema where the
    // migration hasn't run yet, so this is safe before and after it lands.
    publicProfile: (row.public_profile as Record<string, unknown> | null) ?? null,
    publicProfileSource: (row.public_profile_source as string | null) ?? null,
    publicProfileFetchedAt: (row.public_profile_fetched_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}
