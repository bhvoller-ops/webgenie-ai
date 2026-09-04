import { requireAdminPage } from "@/lib/auth/access";
import { getPortfolioStats, getProjects } from "@/lib/data/provider";
import { NewProjectClient } from "./new-project-client";

const PAGE_SIZE = 25;

// Consolidated with the old homepage's Dashboard (stats + project list) when
// / became the public marketing funnel — see CLAUDE.md §2q. This is now the
// admin's real post-login landing page.
export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { organizationId } = await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const [allProjects, stats] = await Promise.all([getProjects(), getPortfolioStats()]);

  // Same shape as /calls, /leads, /partners: fetch the full set (stats need
  // it), slice for display. Not previously paginated — a real gap once the
  // workspace grows past one screenful.
  const totalPages = Math.max(1, Math.ceil(allProjects.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const projects = allProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <NewProjectClient
      role="admin"
      organizationId={organizationId}
      projects={projects}
      stats={stats}
      page={page}
      totalPages={totalPages}
    />
  );
}
