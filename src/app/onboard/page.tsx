import { requireAdminPage } from "@/lib/auth/access";
import { OnboardClient } from "./onboard-client";

export default async function OnboardPage() {
  await requireAdminPage();
  return <OnboardClient role="admin" />;
}
