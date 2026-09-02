import { Resend } from "resend";
import { SITE_ORIGIN } from "@/lib/site-url";

/**
 * New-ticket alert to the operator (same pattern/recipient as
 * lib/notify.ts's signup alerts) and staff-reply alert to the member (same
 * pattern as lib/partners/notify.ts's commission emails) — best-effort,
 * never throws, matching every other email helper in this app.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `WebGenie AI <notify@${process.env.RESEND_EMAIL_DOMAIN ?? "mail.vibelabsagency.com"}>`;
const NOTIFY_TO = "wallang@gmail.com";

export async function notifyNewSupportTicket(input: {
  ticketId: string;
  organizationName: string;
  subject: string;
  category: string;
  priority: string;
}) {
  const subject =
    input.priority === "guarantee_risk"
      ? `[Guarantee risk] New ticket: ${input.subject}`
      : `New support ticket: ${input.subject}`;
  const html = `
    <p><strong>${input.organizationName}</strong> opened a ${input.category} ticket.</p>
    <p><a href="${SITE_ORIGIN}/admin/support">Open in admin queue</a></p>
  `;
  const { error } = await resend.emails.send(
    { from: FROM, to: [NOTIFY_TO], subject, html },
    { idempotencyKey: `support-ticket-opened/${input.ticketId}` }
  );
  if (error) console.error("Failed to send new-ticket notification:", error);
}

export async function notifyStaffReply(input: {
  ticketId: string;
  messageId: string;
  memberEmail: string;
  subject: string;
}) {
  const { error } = await resend.emails.send(
    {
      from: FROM,
      to: [input.memberEmail],
      subject: `Re: ${input.subject}`,
      html: `
        <p>You have a new reply on your support ticket.</p>
        <p><a href="${SITE_ORIGIN}/support/${input.ticketId}">View and reply</a></p>
      `
    },
    { idempotencyKey: `support-ticket-staff-reply/${input.messageId}` }
  );
  if (error) console.error("Failed to send staff-reply notification:", error);
}
