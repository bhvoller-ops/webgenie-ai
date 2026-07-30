import { createAdminClient } from "@/lib/supabase/admin";
import { createVisualAnalysisProvider } from "@/lib/visual/provider-factory";
import { mergeVisualIntelligence } from "@/lib/visual/merge";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import type { VisualAnalysisResult } from "@/lib/visual/types";

export async function runVisualIntelligenceForJob(jobId: string): Promise<void> {
  const supabase = createAdminClient();
  const provider = createVisualAnalysisProvider();

  const [{ data: captures, error: captureError }, { data: outputRow, error: outputError }] = await Promise.all([
    supabase.from("page_captures")
      .select("id,source_url,title,visible_text,screenshot_path")
      .eq("analysis_job_id", jobId)
      .not("screenshot_path", "is", null),
    supabase.from("analysis_outputs").select("id,output").eq("analysis_job_id", jobId).single()
  ]);

  if (captureError) throw new Error(captureError.message);
  if (outputError || !outputRow) throw new Error(outputError?.message ?? "Analysis output not found.");
  if (!captures?.length) return;

  const results: VisualAnalysisResult[] = [];

  for (const capture of captures) {
    if (!capture.screenshot_path) continue;
    const { data: screenshot, error: downloadError } = await supabase.storage
      .from("website-captures")
      .download(capture.screenshot_path);
    if (downloadError || !screenshot) continue;

    try {
      const result = await provider.analyze({
        captureId: capture.id,
        sourceUrl: capture.source_url,
        screenshotPath: capture.screenshot_path,
        screenshotBytes: new Uint8Array(await screenshot.arrayBuffer()),
        mimeType: "image/png",
        pageTitle: capture.title,
        visibleTextExcerpt: capture.visible_text?.slice(0, 1800)
      });
      results.push(result);

      const { error } = await supabase.from("visual_analysis_results").upsert({
        analysis_job_id: jobId,
        page_capture_id: capture.id,
        provider: result.provider,
        model: result.model,
        overall_score: result.overallScore,
        overall_confidence: result.overallConfidence,
        result
      }, { onConflict: "analysis_job_id,page_capture_id" });
      if (error) throw new Error(error.message);
    } catch (error) {
      await supabase.from("visual_analysis_errors").insert({
        analysis_job_id: jobId,
        page_capture_id: capture.id,
        provider: provider.name,
        error_message: error instanceof Error ? error.message : "Unknown visual analysis error"
      });
    }
  }

  if (!results.length) return;
  const merged = mergeVisualIntelligence(outputRow.output as WebsiteIntelligenceOutput, results);
  const { error: mergeError } = await supabase.from("analysis_outputs").update({
    schema_version: "1.1",
    output: merged
  }).eq("id", outputRow.id);
  if (mergeError) throw new Error(mergeError.message);
}
