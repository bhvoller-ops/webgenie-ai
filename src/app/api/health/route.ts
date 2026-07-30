import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "webgenie-ai",
    timestamp: new Date().toISOString()
  });
}
