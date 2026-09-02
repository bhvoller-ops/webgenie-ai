import { requireAdminPage } from "@/lib/auth/access";
import { FinderClient } from "./finder-client";

export default async function FinderPage() {
  const { organizationId } = await requireAdminPage();
  return <FinderClient role="admin" organizationId={organizationId} />;
}
