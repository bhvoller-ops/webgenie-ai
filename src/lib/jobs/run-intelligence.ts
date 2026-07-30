import { createAdminClient } from "@/lib/supabase/admin";
import { runWebsiteIntelligence } from "@/lib/intelligence/engine";
import type { IntelligenceCaptureInput } from "@/lib/intelligence/input";

export async function runIntelligenceForJob(jobId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("analysis_jobs")
    .select("id, project_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error(jobError?.message ?? "Analysis job not found.");
  }

  const { data: captures, error: capturesError } = await supabase
    .from("page_captures")
    .select(`
      id,
      reference_id,
      source_url,
      final_url,
      status_code,
      content_type,
      title,
      description,
      canonical_url,
      language,
      visible_text,
      html,
      screenshot_path,
      extracted_features(features)
    `)
    .eq("analysis_job_id", jobId);

  if (capturesError) throw new Error(capturesError.message);
  if (!captures || captures.length === 0) {
    throw new Error("No page captures are available for intelligence scoring.");
  }

  const { count: referenceCount } = await supabase
    .from("website_references")
    .select("id", { count: "exact", head: true })
    .eq("project_id", job.project_id);

  const { count: errorCount } = await supabase
    .from("capture_errors")
    .select("id", { count: "exact", head: true })
    .eq("analysis_job_id", jobId);

  const input: IntelligenceCaptureInput[] = captures.map((capture: any) => ({
    captureId: capture.id,
    referenceId: capture.reference_id,
    sourceUrl: capture.source_url,
    finalUrl: capture.final_url,
    statusCode: capture.status_code,
    contentType: capture.content_type,
    title: capture.title,
    description: capture.description,
    canonicalUrl: capture.canonical_url,
    language: capture.language,
    visibleText: capture.visible_text,
    html: capture.html,
    screenshotPath: capture.screenshot_path,
    features: capture.extracted_features?.[0]?.features ?? {}
  }));

  const output = runWebsiteIntelligence({
    jobId,
    projectId: job.project_id,
    captures: input,
    referencesAttempted: referenceCount ?? captures.length,
    referencesFailed: errorCount ?? 0
  });

  const { error: outputError } = await supabase
    .from("analysis_outputs")
    .upsert(
      {
        analysis_job_id: jobId,
        schema_version: output.schemaVersion,
        output
      },
      { onConflict: "analysis_job_id" }
    );

  if (outputError) throw new Error(outputError.message);
}
