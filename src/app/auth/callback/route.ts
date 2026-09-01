import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/auth/access";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Handles Google sign-in/sign-up alike (Supabase auto-creates the auth
    // user on first OAuth login, so there's no separate "new user" signal
    // here) — bootstraps a workspace only for a genuinely new stranger.
    // Guarded the same way /api/auth/bootstrap guards itself: skipped
    // entirely for an existing admin, partner, or beta tester, so a
    // returning user signing in with Google never gets a surprise second
    // organization. See that route's doc comment for the full reasoning.
    const { role, supabase: accessSupabase } = await getAccessContext();
    if (role === "guest") {
      await accessSupabase.rpc("bootstrap_organization");
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
