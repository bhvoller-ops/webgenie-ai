import { getAccessContext } from "@/lib/auth/access";
import { GalleryClient } from "./gallery-client";

// Public — no login required. Sales collateral meant to be pulled up on a
// call or sent to a prospect. Still reads the caller's role (without
// redirecting) so the nav shows the right links if an admin or partner is
// signed in.
export default async function GalleryPage() {
  const { role } = await getAccessContext();
  return <GalleryClient role={role} />;
}
