import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/auth/reset-email";
import { SITE_ORIGIN } from "@/lib/site-url";

/**
 * Public — this is the entry point for someone who's locked out and has no
 * other way in (see CLAUDE.md §2j: removing public self-serve signup made
 * this the one remaining recovery path). Always returns the same generic
 * response regardless of whether the email has an account, so this can't
 * be used to enumerate who has a login.
 */
const schema = z.object({ email: z.string().email() });

const GENERIC_RESPONSE = { ok: true, message: "If that email has an account, a reset link is on its way." };

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const admin = createAdminClient();

  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: parsed.data.email,
      options: { redirectTo: `${SITE_ORIGIN}/reset-password` }
    });

    // A nonexistent email errors here — swallowed on purpose, same generic
    // response either way (see doc comment above).
    if (error || !data?.properties?.action_link) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    await sendPasswordResetEmail(parsed.data.email, data.properties.action_link);
  } catch (err) {
    console.error("Password reset request failed:", err);
    // Still generic — an internal failure shouldn't tell the caller
    // anything about whether the account exists either.
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
