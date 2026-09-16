import { getAccessContext } from "@/lib/auth/access";
import { GalleryClient } from "./gallery-client";

// Public — no login required to browse thumbnails. Sales collateral meant
// to be pulled up on a call or sent to a prospect. Still reads the
// caller's role (without redirecting) so the nav shows the right links if
// an admin or partner is signed in.
//
// PUBLIC EXAMPLES AUTH GATE (owner-directed correction): `isAuthenticated`
// (any real WebGenie session, not just an admin-tier role -- `role` alone
// is ambiguous, since "guest" also covers a signed-in user with no
// organization yet) gates the interactive full-view preview in
// GalleryClient. The real enforcement is server-side in
// /api/gallery-preview/route.ts regardless of what this prop says.
export default async function GalleryPage() {
  const { role, user } = await getAccessContext();
  return <GalleryClient role={role} isAuthenticated={Boolean(user)} />;
}
