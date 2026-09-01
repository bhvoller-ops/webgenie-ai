import { requireAdminPage } from "@/lib/auth/access";
import { NewProjectClient } from "./new-project-client";

export default async function NewProjectPage() {
  await requireAdminPage();
  return <NewProjectClient role="admin" />;
}
