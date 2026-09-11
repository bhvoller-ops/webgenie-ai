import { requireAdminPage } from "@/lib/auth/access";
import { LaunchClient } from "./launch-client";

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  await requireAdminPage();
  return <LaunchClient />;
}
