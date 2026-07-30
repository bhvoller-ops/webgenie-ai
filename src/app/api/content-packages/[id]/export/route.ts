import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { contentAsMarkdown, contentAsYaml } from "@/lib/copy/export";
import type { ContentPackage } from "@/lib/copy/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "markdown";
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_packages").select("content,content_markdown").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Content package not found." }, { status: 404 });
  const pkg = data.content as ContentPackage;
  const body = format === "json" ? JSON.stringify(pkg, null, 2) : format === "yaml" ? contentAsYaml(pkg) : data.content_markdown || contentAsMarkdown(pkg);
  const ext = format === "json" ? "json" : format === "yaml" ? "yaml" : "md";
  const type = format === "json" ? "application/json" : "text/plain; charset=utf-8";
  return new NextResponse(body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename=webgenie-content.${ext}` } });
}
