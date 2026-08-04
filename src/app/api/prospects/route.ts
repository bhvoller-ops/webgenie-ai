import { NextResponse } from "next/server";
import { findProspects, type FinderQuery } from "@/lib/prospect/finder";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import type { IndustryKey } from "@/lib/sitegen/types";

export async function POST(request: Request) {
  let body: Partial<FinderQuery>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const industry = body.industry as IndustryKey | undefined;
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const state = typeof body.state === "string" ? body.state.trim() : "";

  if (!industry || !(industry in INDUSTRIES)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "A city is required." }, { status: 400 });
  }

  const result = await findProspects({
    industry,
    city,
    state: state || "",
    limit: typeof body.limit === "number" ? Math.min(40, Math.max(1, body.limit)) : 17,
  });

  return NextResponse.json(result);
}
