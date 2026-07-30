import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZip } from "@/lib/delivery/zip";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: run } = await supabase
    .from("delivery_runs")
    .select("id,project_id,target")
    .eq("id", id)
    .single();

  if (!run) {
    return NextResponse.json(
      { error: "Delivery not found." },
      { status: 404 }
    );
  }

  const { data: files, error } = await supabase
    .from("delivery_files")
    .select("path,content")
    .eq("delivery_run_id", id)
    .order("path");

  if (error || !files) {
    return NextResponse.json(
      { error: error?.message ?? "Files unavailable." },
      { status: 500 }
    );
  }

  const archive = createZip(files);
  const responseBody = Uint8Array.from(archive);

  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="webgenie-${run.target}-${run.id.slice(0, 8)}.zip"`,
      "Content-Length": String(responseBody.byteLength)
    }
  });
}
