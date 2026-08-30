import { requireAdminPage } from "@/lib/auth/access";
import { FinderClient } from "./finder-client";

export default async function FinderPage() {
  await requireAdminPage();
  return <FinderClient role="admin" />;
}
