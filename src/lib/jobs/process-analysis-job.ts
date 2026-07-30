import { createAdminClient } from "@/lib/supabase/admin";
import { PlaywrightCaptureProvider } from "@/lib/capture/playwright-provider";
import { extractFeatures } from "@/lib/capture/extract-features";
import { validatePublicUrl } from "@/lib/security/url-validation";
import { runIntelligenceForJob } from "@/lib/jobs/run-intelligence";
import { runVisualIntelligenceForJob } from "@/lib/jobs/run-visual-intelligence";
import { generateBlueprintForJob } from "@/lib/jobs/generate-blueprint";

const captureProvider = new PlaywrightCaptureProvider();

async function updateJob(
  jobId: string,
  values: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("analysis_jobs")
    .update(values)
    .eq("id", jobId);

  if (error) throw new Error(error.message);
}

export async function processAnalysisJob(jobId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("analysis_jobs")
    .select("id, project_id, status")
    .eq("id", jobId)
    .single();

  if (jobError || !job) throw new Error(jobError?.message ?? "Job not found.");
  if (!["queued", "failed", "partial"].includes(job.status)) return;

  await updateJob(jobId, {
    status: "validating",
    current_stage: "validating",
    progress: 5,
    started_at: new Date().toISOString(),
    error_code: null,
    error_message: null
  });

  const { data: references, error: referencesError } = await supabase
    .from("website_references")
    .select("id, url, role")
    .eq("project_id", job.project_id);

  if (referencesError) throw new Error(referencesError.message);
  if (!references || references.length === 0) {
    await updateJob(jobId, {
      status: "failed",
      current_stage: "validation_failed",
      progress: 100,
      error_code: "NO_REFERENCES",
      error_message: "No website references were found."
    });
    return;
  }

  const validReferences = [];
  for (const reference of references) {
    try {
      const validated = await validatePublicUrl(reference.url);
      await supabase
        .from("website_references")
        .update({
          canonical_url: validated.normalizedUrl,
          validation_status: "valid"
        })
        .eq("id", reference.id);

      validReferences.push({ ...reference, url: validated.normalizedUrl });
    } catch {
      await supabase
        .from("website_references")
        .update({ validation_status: "blocked" })
        .eq("id", reference.id);
    }
  }

  if (validReferences.length === 0) {
    await updateJob(jobId, {
      status: "failed",
      current_stage: "validation_failed",
      progress: 100,
      error_code: "NO_VALID_REFERENCES",
      error_message: "All submitted references were invalid or blocked."
    });
    return;
  }

  await updateJob(jobId, {
    status: "capturing",
    current_stage: "capturing",
    progress: 15
  });

  let completed = 0;
  let failed = 0;

  for (const reference of validReferences) {
    try {
      const capture = await captureProvider.capture({
        url: reference.url,
        screenshot: true
      });

      let screenshotPath: string | null = null;

      if (capture.screenshotBuffer) {
        screenshotPath = `${job.project_id}/${jobId}/${reference.id}.png`;

        const { error: uploadError } = await supabase.storage
          .from("website-captures")
          .upload(screenshotPath, capture.screenshotBuffer, {
            contentType: "image/png",
            upsert: true
          });

        if (uploadError) throw new Error(uploadError.message);
      }

      const { data: pageCapture, error: captureError } = await supabase
        .from("page_captures")
        .insert({
          analysis_job_id: jobId,
          reference_id: reference.id,
          source_url: reference.url,
          final_url: capture.finalUrl,
          status_code: capture.statusCode,
          content_type: capture.contentType,
          title: capture.title,
          description: capture.description,
          canonical_url: capture.canonicalUrl,
          language: capture.language,
          html: capture.html,
          visible_text: capture.text,
          screenshot_path: screenshotPath,
          captured_at: capture.capturedAt
        })
        .select("id")
        .single();

      if (captureError || !pageCapture) {
        throw new Error(captureError?.message ?? "Unable to store capture.");
      }

      const features = extractFeatures(capture.html, capture.finalUrl);

      const { error: featureError } = await supabase
        .from("extracted_features")
        .insert({
          page_capture_id: pageCapture.id,
          features
        });

      if (featureError) throw new Error(featureError.message);
      completed += 1;
    } catch (error) {
      failed += 1;

      await supabase.from("capture_errors").insert({
        analysis_job_id: jobId,
        reference_id: reference.id,
        error_code:
          error instanceof Error ? error.message.slice(0, 120) : "CAPTURE_FAILED",
        error_message:
          error instanceof Error ? error.message : "Unknown capture failure."
      });
    }

    const processed = completed + failed;
    await updateJob(jobId, {
      current_stage: "capturing",
      progress: Math.min(
        55,
        15 + Math.round((processed / validReferences.length) * 40)
      )
    });
  }

  if (completed === 0) {
    await updateJob(jobId, {
      status: "failed",
      current_stage: "capture_failed",
      progress: 100,
      error_code: "NO_CAPTURES",
      error_message: "No references could be captured."
    });
    return;
  }

  await updateJob(jobId, {
    status: "analyzing",
    current_stage: "scoring_intelligence",
    progress: 65
  });

  try {
    await runIntelligenceForJob(jobId);
  } catch (error) {
    await updateJob(jobId, {
      status: "failed",
      current_stage: "intelligence_failed",
      progress: 100,
      error_code: "INTELLIGENCE_FAILED",
      error_message:
        error instanceof Error ? error.message : "Intelligence scoring failed."
    });
    return;
  }

  await updateJob(jobId, {
    status: "analyzing",
    current_stage: "analyzing_visual_design",
    progress: 75
  });

  try {
    await runVisualIntelligenceForJob(jobId);
  } catch (error) {
    await supabase.from("visual_analysis_errors").insert({
      analysis_job_id: jobId,
      provider: process.env.VISUAL_AI_PROVIDER ?? "heuristic",
      error_message: error instanceof Error ? error.message : "Visual intelligence failed."
    });
  }

  await updateJob(jobId, {
    status: "synthesizing",
    current_stage: "generating_blueprint",
    progress: 85
  });

  try {
    await generateBlueprintForJob(jobId);
  } catch (error) {
    await updateJob(jobId, {
      status: "failed",
      current_stage: "blueprint_failed",
      progress: 100,
      error_code: "BLUEPRINT_FAILED",
      error_message:
        error instanceof Error ? error.message : "Blueprint generation failed."
    });
    return;
  }

  await updateJob(jobId, {
    status: "validating_output",
    current_stage: "validating_blueprint",
    progress: 95
  });

  await updateJob(jobId, {
    status: failed > 0 ? "partial" : "completed",
    current_stage: failed > 0 ? "completed_with_capture_errors" : "completed",
    progress: 100,
    completed_at: new Date().toISOString(),
    error_code: failed > 0 ? "PARTIAL_CAPTURE" : null,
    error_message:
      failed > 0
        ? `${failed} of ${validReferences.length} references failed capture.`
        : null
  });
}
