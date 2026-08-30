import { requireAdminPage } from "@/lib/auth/access";
import { AuditClient } from "./audit-client";

export default async function AuditPage() {
  await requireAdminPage();
  return <AuditClient role="admin" />;
}
