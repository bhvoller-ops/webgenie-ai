import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and an 8+ character password." }, { status: 400 });
  }

  const admin = createAdminClient();

  // email_confirm: true skips the confirmation-email step entirely — this
  // app has no need for it with a handful of operator accounts, and it's
  // what let a Supabase mailer rate limit lock a real login out before.
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true
  });

  if (error) {
    const message = error.message.toLowerCase().includes("already been registered")
      ? "An account with that email already exists — sign in instead."
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
