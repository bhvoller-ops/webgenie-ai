import { Resend } from "resend";
import { SITE_ORIGIN } from "@/lib/site-url";

/**
 * Internal notification email — fired to the agency operator (not the lead
 * or partner) the moment a self-serve signup lands, via /api/get-started or
 * /api/partner-signup. This is the ONLY email this app sends right now; a
 * multi-step nurture sequence sent to leads themselves is a separate,
 * bigger piece deliberately not built yet — see CLAUDE.md.
 *
 * Never blocks or fails the signup itself: the DB insert is the thing that
 * matters, this is a best-effort nicety layered on top. Callers should
 * fire-and-log, not await-and-throw.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

// mail.vibelabsagency.com — provisioned + DNS-verified via the Vercel
// Marketplace Resend integration on 28 Aug 2026. Falls back to the
// integration's own domain env var so this doesn't silently point at the
// wrong domain if it's ever reprovisioned differently.
const FROM = `WebGenie Alerts <notify@${process.env.RESEND_EMAIL_DOMAIN ?? "mail.vibelabsagency.com"}>`;

// Where these land. Not configurable per-org yet — fine for the single
// operator using this app today; revisit alongside the other known
// single-tenant limitations (see CLAUDE.md §2c) if a second agency signs on.
const NOTIFY_TO = "wallang@gmail.com";

interface SignupNotification {
  kind: "lead" | "partner";
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  detailPath: string; // where to go look at it — "/calls" or "/partners"
  idempotencyKey: string; // <kind>/<row-id> — same row never double-notifies on retry
}

export async function notifySignup(input: SignupNotification) {
  const subject =
    input.kind === "lead"
      ? `New lead: ${input.name}`
      : `New partner signup: ${input.name}`;

  const html = `
    <p><strong>${input.name}</strong> just came in via ${input.kind === "lead" ? "/get-started" : "/partner-signup"}.</p>
    <ul>
      ${input.contactEmail ? `<li>Email: ${input.contactEmail}</li>` : ""}
      ${input.contactPhone ? `<li>Phone: ${input.contactPhone}</li>` : ""}
    </ul>
    <p><a href="${SITE_ORIGIN}${input.detailPath}">Open in WebGenie</a></p>
  `;

  const { error } = await resend.emails.send(
    {
      from: FROM,
      to: [NOTIFY_TO],
      subject,
      html
    },
    { idempotencyKey: input.idempotencyKey }
  );

  // Resend's SDK returns { data, error } rather than throwing — logged, not
  // rethrown, since a failed notification email must never take down a
  // signup that already saved successfully to the database.
  if (error) {
    console.error("Failed to send signup notification email:", error);
  }
}
