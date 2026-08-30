import { Resend } from "resend";
import { createHash } from "node:crypto";

/**
 * Emails a partner directly when a referral they get credit for converts
 * (commission_status -> "owed") or gets paid out (-> "paid"). Distinct from
 * lib/notify.ts, which only ever emails the agency operator, and from
 * lib/auth/reset-email.ts, which is a different kind of transactional
 * email entirely. Same Resend integration, same best-effort-never-throw
 * discipline as lib/notify.ts — a failed notification must never break the
 * webhook or the admin action that triggered it.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `WebGenie AI <notify@${process.env.RESEND_EMAIL_DOMAIN ?? "mail.vibelabsagency.com"}>`;

interface CommissionNotification {
  email: string;
  partnerName: string;
  businessName: string;
  amount: number;
  status: "owed" | "paid";
  callLogId: string;
}

export async function notifyPartnerCommission(input: CommissionNotification) {
  const money = `$${input.amount.toFixed(2)}`;
  const subject =
    input.status === "owed"
      ? `You're owed ${money} — ${input.businessName} just signed up`
      : `${money} paid — ${input.businessName}`;

  const html =
    input.status === "owed"
      ? `<p>Hi ${input.partnerName},</p>
         <p><strong>${input.businessName}</strong>, the client you referred, just signed up. You're owed <strong>${money}</strong> for this referral.</p>
         <p>This gets paid out by hand — check with the WebGenie team on timing.</p>`
      : `<p>Hi ${input.partnerName},</p>
         <p>Your <strong>${money}</strong> commission for referring <strong>${input.businessName}</strong> has been marked paid.</p>`;

  // Keyed off the deal + status, not a timestamp, so a retry of the same
  // logical event (a webhook redelivery, a duplicate click) doesn't send
  // a second email — but a later status change for the same deal
  // (owed -> paid) still gets its own real notification.
  const idempotencyKey = `partner-commission/${input.status}/${createHash("sha256").update(input.callLogId).digest("hex").slice(0, 16)}`;

  const { error } = await resend.emails.send(
    { from: FROM, to: [input.email], subject, html },
    { idempotencyKey }
  );

  if (error) {
    console.error("Failed to send partner commission notification:", error);
  }
}
