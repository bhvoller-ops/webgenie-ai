import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const eventId = request.headers.get("x-webgenie-event-id");
  const secret = request.headers.get("x-webgenie-webhook-secret");
  if (!payload || !eventId || !process.env.BILLING_WEBHOOK_SECRET || secret !== process.env.BILLING_WEBHOOK_SECRET) return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("billing_events").insert({ provider: payload.provider ?? "billing-provider", provider_event_id: eventId, event_type: payload.type ?? "unknown", payload, processed_at: new Date().toISOString() });
  if (error && !error.message.toLowerCase().includes("duplicate")) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ received: true });
}
