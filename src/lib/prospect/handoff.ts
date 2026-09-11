import type { ProspectHandoff } from "@/lib/prospect/types";

/** Row mapper, matching row.ts's convention. A prospect with no handoff row yet (the common case pre-WON) has no row at all -- callers must handle null, never assume one exists. */
export function rowToHandoff(row: Record<string, unknown>): ProspectHandoff {
  return {
    prospectId: row.prospect_id as string,
    agreedScope: (row.agreed_scope as string | null) ?? null,
    agreedPrice: (row.agreed_price as number | null) ?? null,
    approvedDemoReference: (row.approved_demo_reference as string | null) ?? null,
    implementationNotes: (row.implementation_notes as string | null) ?? null,
    status: row.status as ProspectHandoff["status"],
    confirmedAt: (row.confirmed_at as string | null) ?? null,
    confirmedBy: (row.confirmed_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}
