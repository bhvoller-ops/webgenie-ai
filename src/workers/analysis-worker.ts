import dotenv from "dotenv";
import { createAdminClient } from "@/lib/supabase/admin";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });
import { processAnalysisJob } from "@/lib/jobs/process-analysis-job";

const POLL_INTERVAL_MS = 5000;

async function claimNextJob(): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: job, error } = await supabase
    .from("analysis_jobs")
    .select("id")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[worker] Failed to poll for queued jobs:", error.message);
    return null;
  }

  return job?.id ?? null;
}

async function pollOnce(): Promise<boolean> {
  const jobId = await claimNextJob();
  if (!jobId) return false;

  console.log(`[worker] Claimed job ${jobId}`);

  try {
    await processAnalysisJob(jobId);
    console.log(`[worker] Completed job ${jobId}`);
  } catch (error) {
    console.error(
      `[worker] Job ${jobId} failed:`,
      error instanceof Error ? error.message : error
    );
  }

  return true;
}

async function main() {
  console.log(`[worker] WebGenie analysis worker started. Polling every ${POLL_INTERVAL_MS}ms.`);

  // NOTE: job claiming here is not atomic — a second worker replica could
  // claim the same job. Run exactly one instance until a Postgres claim
  // function is added.
  for (;;) {
    const worked = await pollOnce();
    if (!worked) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

main().catch((error) => {
  console.error("[worker] Worker crashed:", error);
  process.exit(1);
});
