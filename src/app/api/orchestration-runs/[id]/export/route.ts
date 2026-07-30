import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orchestrationToMarkdown } from "@/lib/orchestration/export";
import type { OrchestrationRunOutput } from "@/lib/orchestration/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "markdown";
  const supabase = await createClient();
  const { data, error } = await supabase.from("orchestration_runs").select("output").eq("id", id).single();
  if (error || !data?.output) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  const output = data.output as OrchestrationRunOutput;
  if (format === "json") return new NextResponse(JSON.stringify(output, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename=webgenie-review-${id}.json` } });
  return new NextResponse(orchestrationToMarkdown(output), { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename=webgenie-review-${id}.md` } });
}
