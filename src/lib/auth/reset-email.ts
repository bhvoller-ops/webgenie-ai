import { Resend } from "resend";
import { createHash } from "node:crypto";

/**
 * Sends a password-reset email directly to the account holder — a
 * different audience than lib/notify.ts, which only ever emails the agency
 * operator. Deliberately does NOT use Supabase's own password-reset email
 * sending (Auth → SMTP settings): this app's whole reason for having
 * email+password auth at all is that Supabase's default mailer's rate
 * limit locked out a real login mid-testing (see CLAUDE.md §2b) — routing
 * password recovery through the same mailer would reintroduce exactly that
 * risk. Instead: Supabase's admin `generateLink({ type: "recovery" })`
 * creates a real, secure, single-use recovery link (their own auth
 * machinery, not a hand-rolled token), and this file just delivers it via
 * the Resend integration already confirmed working for signup
 * notifications.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `WebGenie AI <notify@${process.env.RESEND_EMAIL_DOMAIN ?? "mail.vibelabsagency.com"}>`;

export async function sendPasswordResetEmail(email: string, actionLink: string) {
  // Keyed off the link itself (unique per generateLink call, stable if this
  // exact send is retried) rather than email+time, so a genuine second
  // "forgot password" request later still sends a fresh email.
  const linkHash = createHash("sha256").update(actionLink).digest("hex").slice(0, 16);
  const { error } = await resend.emails.send(
    {
      from: FROM,
      to: [email],
      subject: "Reset your WebGenie AI password",
      html: `
        <p>Someone requested a password reset for this email address on WebGenie AI.</p>
        <p><a href="${actionLink}">Click here to set a new password</a>. This link works once and expires shortly.</p>
        <p>If you didn't request this, you can ignore this email — your password hasn't changed.</p>
      `
    },
    { idempotencyKey: `password-reset/${linkHash}` }
  );

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Unable to send reset email.");
  }
}
