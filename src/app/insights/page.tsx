import { requireAdminPage } from "@/lib/auth/access";
import { InsightsClient } from "./insights-client";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await requireAdminPage();
  return <InsightsClient />;
}
