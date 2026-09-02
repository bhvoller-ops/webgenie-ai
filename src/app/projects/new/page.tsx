import { requireAdminPage } from "@/lib/auth/access";
import { getPortfolioStats, getProjects } from "@/lib/data/provider";
import { NewProjectClient } from "./new-project-client";

// Consolidated with the old homepage's Dashboard (stats + project list) when
// / became the public marketing funnel — see CLAUDE.md §2q. This is now the
// admin's real post-login landing page.
export default async function NewProjectPage() {
  const { organizationId } = await requireAdminPage();
  const [projects, stats] = await Promise.all([getProjects(), getPortfolioStats()]);
  return <NewProjectClient role="admin" organizationId={organizationId} projects={projects} stats={stats} />;
}
