import type { FinderResultRow } from "@/app/api/prospects/route";

/**
 * Pure filter/sort/status logic for the P0.5 Finder table — separated from
 * finder-client.tsx so it's testable without a browser, same reasoning as
 * every other deterministic-logic file in lib/prospect/.
 */

export type FinderFilter = "all" | "recommended" | "has_website" | "no_website" | "not_audited" | "audited" | "needs_data";

export const FINDER_FILTERS: { key: FinderFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recommended", label: "Recommended" },
  { key: "has_website", label: "Has Website" },
  { key: "no_website", label: "No Website" },
  { key: "not_audited", label: "Not Audited" },
  { key: "audited", label: "Audited" },
  { key: "needs_data", label: "Needs Data" }
];

export function filterResults(rows: FinderResultRow[], filter: FinderFilter): FinderResultRow[] {
  switch (filter) {
    case "recommended":
      return rows.filter((r) => r.preliminaryOpportunity.level === "high");
    case "has_website":
      return rows.filter((r) => r.preliminaryOpportunity.websiteStatus === "present");
    case "no_website":
      return rows.filter((r) => r.preliminaryOpportunity.websiteStatus === "absent");
    case "not_audited":
      return rows.filter((r) => !r.hasCompletedAudit);
    case "audited":
      return rows.filter((r) => r.hasCompletedAudit);
    case "needs_data":
      return rows.filter((r) => r.preliminaryOpportunity.level === "insufficient_data");
    case "all":
    default:
      return rows;
  }
}

export type FinderSort = "recommended" | "rating" | "reviews" | "name";

export const FINDER_SORTS: { key: FinderSort; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Review Count" },
  { key: "name", label: "Business Name" }
];

export function sortResults(rows: FinderResultRow[], sort: FinderSort): FinderResultRow[] {
  const copy = [...rows];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "reviews":
      return copy.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "recommended":
    default:
      return copy.sort((a, b) => b.preliminaryOpportunity.score - a.preliminaryOpportunity.score);
  }
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/**
 * The five statuses from the P0.5 table spec, derived from real prospect
 * state — never a guess. A prospect status outside the five (contacted,
 * follow_up, won, lost, deprioritized — all real, all meaningful) falls
 * back to its own real label rather than being forced into one of the five.
 */
const REAL_STATUS_LABELS: Record<string, string> = {
  contacted: "Contacted",
  follow_up: "Follow-up Due",
  won: "Won",
  lost: "Lost",
  deprioritized: "Deprioritized"
};

export function statusLabel(row: Pick<FinderResultRow, "prospectId" | "prospectStatus" | "hasCompletedAudit" | "website">): string {
  if (!row.prospectId) return "Not Opened";
  const status = row.prospectStatus;
  if (status === "audited") return "Audited";
  if (status === "demo_ready") return "Demo Ready";
  if (status && status in REAL_STATUS_LABELS) return REAL_STATUS_LABELS[status];
  // status === "new" (or unrecognized) — distinguish by whether there's a
  // real audit trail worth surfacing yet.
  if (row.hasCompletedAudit) return "Audited";
  if (row.website) return "Audit Ready";
  return "Prospect";
}
