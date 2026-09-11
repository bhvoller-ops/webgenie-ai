import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { computeInsightsSummary } from "@/lib/prospect/insights-query";

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  return NextResponse.json(await computeInsightsSummary(supabase, organizationId));
}
