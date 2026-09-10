import { requireAdminPage } from "@/lib/auth/access";
import { SequencesClient } from "./sequences-client";

export const dynamic = "force-dynamic";

export default async function SequencesPage() {
  await requireAdminPage();
  return <SequencesClient />;
}
