import { requireAdminPage } from "@/lib/auth/access";
import { ProspectingClient } from "./prospecting-client";

export const dynamic = "force-dynamic";

export default async function ProspectingPage() {
  const { organizationId } = await requireAdminPage();
  return <ProspectingClient organizationId={organizationId} />;
}
