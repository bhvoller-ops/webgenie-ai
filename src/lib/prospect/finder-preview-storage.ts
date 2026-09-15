import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinderSignal } from "@/lib/prospect/finder-preview-signals";

/**
 * Finder website-preview storage conventions (master prompt Phase 7).
 * Reuses the existing `website-captures` Supabase Storage bucket (already
 * provisioned for the real audit pipeline, src/lib/jobs/process-analysis-job.ts)
 * under a new, clearly distinct path prefix -- no new bucket, no schema
 * change, no migration. A Finder preview and a real audit's own
 * page_captures/screenshot_path row are never the same object and never
 * overwrite each other (Phase 7 item 9/10): audit screenshots live at
 * `${projectId}/${jobId}/${referenceId}.png`; Finder previews live entirely
 * under `finder-previews/`, a disjoint namespace.
 *
 * Org-scoped by design (Phase 7 item 5: "A user must not retrieve another
 * organization's preview by changing an ID") -- the organizationId is part
 * of the storage path itself, not just an access-control check layered on
 * top, so two organizations searching the same public business never share
 * one stored object even though the underlying website is public content.
 * The tradeoff (a duplicate capture per organization instead of one shared
 * capture) is deliberate: correctness of tenant isolation over storage
 * efficiency for what capture concurrency limits (finder-preview-capture.ts)
 * already keep cheap.
 */
const BUCKET = "website-captures";
const FRESHNESS_MS = 24 * 60 * 60 * 1000; // 24h -- a "reasonable freshness period" (Phase 7 item 7); explicit refresh (Phase 7 item 8) bypasses this.
const LOCK_TTL_MS = 90 * 1000; // long enough for a real capture (<=30s navigation + screenshot), short enough that a crashed/abandoned lock self-clears quickly.

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}

function basePath(organizationId: string, urlHash: string): string {
  return `finder-previews/${organizationId}/${urlHash}`;
}

export interface PreviewMetadata {
  url: string;
  finalUrl: string | null;
  capturedAt: string;
  statusCode: number | null;
  likelyBlocked: boolean;
  responseTooLarge: boolean;
  contentTypeOk: boolean;
  /** Website-capture-sourced signals only (chat/booking/contact-form/click-to-call/email/https/mobile-viewport/24-7-claim) -- the Google-listing and full-audit signals are never cached here, since they can change independently of the screenshot; the API layer merges those in fresh on every read. */
  signals: FinderSignal[];
  failureReason?: string;
}

export interface StoredPreview {
  metadata: PreviewMetadata;
  imagePath: string;
  isStale: boolean;
}

export async function readCachedPreview(supabase: SupabaseClient, organizationId: string, urlHash: string): Promise<StoredPreview | null> {
  const path = basePath(organizationId, urlHash);
  const { data, error } = await supabase.storage.from(BUCKET).download(`${path}.json`);
  if (error || !data) return null;
  try {
    const text = await data.text();
    const metadata = JSON.parse(text) as PreviewMetadata;
    const ageMs = Date.now() - new Date(metadata.capturedAt).getTime();
    return { metadata, imagePath: `${path}.png`, isStale: ageMs > FRESHNESS_MS };
  } catch {
    return null;
  }
}

export async function writePreview(supabase: SupabaseClient, organizationId: string, urlHash: string, metadata: PreviewMetadata, imageBuffer: Buffer | null): Promise<{ error: string | null }> {
  const path = basePath(organizationId, urlHash);
  if (imageBuffer) {
    const { error: imgError } = await supabase.storage.from(BUCKET).upload(`${path}.png`, imageBuffer, { contentType: "image/png", upsert: true });
    if (imgError) return { error: imgError.message };
  }
  const { error: metaError } = await supabase.storage
    .from(BUCKET)
    .upload(`${path}.json`, JSON.stringify(metadata), { contentType: "application/json", upsert: true });
  if (metaError) return { error: metaError.message };
  return { error: null };
}

/** A short-lived signed URL, generated only after the caller has already confirmed the requester's own organizationId matches the path (Phase 7 item 4: "a short-lived signed URL generated after tenant authorization" -- the authorization check happens in the API route, before this is ever called). */
export async function signPreviewImageUrl(supabase: SupabaseClient, organizationId: string, urlHash: string, expiresInSeconds = 300): Promise<string | null> {
  const path = `${basePath(organizationId, urlHash)}.png`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Storage-object lock, not a DB row -- deliberately schema-free (Phase 7:
 * no migration). Prevents two concurrent requests for the same
 * (organization, url) from both launching a real Playwright capture at
 * once (Phase 9: "no unbounded simultaneous captures"; Phase 7 item 6:
 * "deterministic caching or idempotency so repeated requests do not
 * generate unnecessary duplicate captures"). A crashed capture's lock
 * self-expires after LOCK_TTL_MS rather than jamming the cache forever.
 */
export async function tryAcquireLock(supabase: SupabaseClient, organizationId: string, urlHash: string): Promise<boolean> {
  const path = `${basePath(organizationId, urlHash)}.lock`;
  const { data: existing } = await supabase.storage.from(BUCKET).download(path);
  if (existing) {
    const ts = Number((await existing.text()).trim());
    if (!Number.isNaN(ts) && Date.now() - ts < LOCK_TTL_MS) return false; // a real capture is already in flight
  }
  const { error } = await supabase.storage.from(BUCKET).upload(path, String(Date.now()), { contentType: "text/plain", upsert: true });
  return !error;
}

export async function releaseLock(supabase: SupabaseClient, organizationId: string, urlHash: string): Promise<void> {
  const path = `${basePath(organizationId, urlHash)}.lock`;
  await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}
