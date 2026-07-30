import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { manifestAsYaml, promptPackageAsJson } from "@/lib/prompts/export";
import type { PromptPackage } from "@/lib/prompts/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "markdown";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_packages")
    .select("target_platform, prompt_markdown, prompt_json")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Prompt package not found." }, { status: 404 });

  const safePlatform = String(data.target_platform).replace(/[^a-z0-9_-]/gi, "-");
  if (format === "json") {
    return new NextResponse(promptPackageAsJson(data.prompt_json as PromptPackage), {
      headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename=webgenie-${safePlatform}.json` }
    });
  }
  if (format === "yaml") {
    return new NextResponse(manifestAsYaml(data.prompt_json as PromptPackage), {
      headers: { "content-type": "application/yaml; charset=utf-8", "content-disposition": `attachment; filename=webgenie-${safePlatform}-manifest.yaml` }
    });
  }
  return new NextResponse(data.prompt_markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename=webgenie-${safePlatform}.md` }
  });
}
