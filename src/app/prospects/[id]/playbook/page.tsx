import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/access";
import { getProspect } from "@/lib/data/provider";
import { PlaybookWorkspace } from "./playbook-workspace";

export const dynamic = "force-dynamic";

/**
 * Home Services Live Outreach Playbook — the focused, contextual live-call
 * workspace (not a standalone /playbook browsing page — see
 * lib/playbook's own README-equivalent comments for why that's P1). Auth
 * and the prospect's basic existence are checked here, server-side,
 * before any client code runs; every other id (actionId, enrollmentId)
 * arriving via the query string is re-resolved and re-authorized inside
 * PlaybookWorkspace's own GET to /api/prospects/[id]/playbook — this page
 * never trusts them itself.
 */
export default async function PlaybookPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ actionId?: string; enrollmentId?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const { actionId, enrollmentId } = await searchParams;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  return <PlaybookWorkspace prospectId={id} actionId={actionId ?? null} enrollmentId={enrollmentId ?? null} />;
}
