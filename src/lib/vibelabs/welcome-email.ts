import { Resend } from "resend";

/**
 * The first outbound email this app sends to an actual member/customer
 * rather than internally to the operator (lib/notify.ts) or to a partner
 * (lib/partners/notify.ts) — same Resend integration, same
 * best-effort-never-throw discipline: a failed send must never break the
 * webhook that just took someone's payment.
 *
 * Scoped to the VibeLabs welcome invite specifically rather than folded
 * into a generalized "send an invite" helper (team invites, partner
 * invites still go unsent — a separate, broader fix) so this one real flow
 * ships correctly on its own.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `VibeLabs Agency <notify@${process.env.RESEND_EMAIL_DOMAIN ?? "mail.vibelabsagency.com"}>`;

export async function sendVibelabsWelcomeEmail(input: {
  email: string;
  signInLink: string;
  organizationId: string;
}) {
  const html = `
    <p>Welcome to VibeLabs Agency.</p>
    <p>Your founding membership is active — click below to sign in and get set up.</p>
    <p><a href="${input.signInLink}">Sign in to VibeLabs Agency</a></p>
    <p>This link is single-use and expires soon. If it's expired by the time you click it, reply to this email and we'll send a new one.</p>
  `;

  const { error } = await resend.emails.send(
    { from: FROM, to: [input.email], subject: "Welcome to VibeLabs Agency — sign in to get started", html },
    { idempotencyKey: `vibelabs-welcome/${input.organizationId}` }
  );

  if (error) {
    console.error("Failed to send VibeLabs welcome email:", error);
  }
}
