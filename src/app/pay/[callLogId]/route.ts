import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClientCheckoutSession } from "@/lib/stripe";

/**
 * The link an agency actually texts/emails to a client. Deliberately public —
 * the client has no WebGenie login — and deliberately short-lived-nothing:
 * it mints a fresh Stripe Checkout session on every visit instead of baking
 * one in, so unlike a raw Stripe URL this link never expires. Guessing a
 * valid call_log UUID is the only "auth" here, same trust model as most
 * emailed magic links.
 */
export async function GET(request: Request, { params }: { params: Promise<{ callLogId: string }> }) {
  const { callLogId: raw } = await params;
  const parsed = z.string().uuid().safeParse(raw);
  if (!parsed.success) {
    return new NextResponse("This payment link isn't valid.", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: call } = await admin
    .from("call_log")
    .select("id, organization_id, payment_status, business_name")
    .eq("id", parsed.data)
    .maybeSingle();

  if (!call) {
    return new NextResponse("This payment link isn't valid.", { status: 404 });
  }

  const baseUrl = new URL(request.url).origin;

  if (call.payment_status === "active") {
    return NextResponse.redirect(new URL("/pay/already-active", baseUrl));
  }

  try {
    const url = await createClientCheckoutSession({
      supabase: admin,
      callLogId: call.id,
      organizationId: call.organization_id,
      baseUrl,
      successPath: "/pay/success",
      cancelPath: "/pay/cancelled"
    });
    return NextResponse.redirect(url);
  } catch {
    return new NextResponse("Couldn't start checkout — please contact us and we'll send a new link.", { status: 500 });
  }
}
