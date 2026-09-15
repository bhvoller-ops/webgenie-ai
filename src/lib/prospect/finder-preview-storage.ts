import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FinderSignal } from "@/lib/prospect/finder-preview-signals";

/**
 * The narrow storage surface every function below actually uses --
 * deliberately not the full SupabaseClient type, so a test can supply a
 * lightweight in-memory fake instead of a real client (P1 owner-review
 * correction: "prove through direct route-level tests with mocked
 * dependencies"). Production code never passes `client` -- every call site
 * omits it and gets the real createAdminClient() -- so this parameter
 * exists purely for testability, not as a runtime configuration knob.
 */
export interface StorageClient {
  storage: {
    from(bucket: string): {
      download(path: string): Promise<{ data: { text(): Promise<string> } | null; error: { message: string } | null }>;
      upload(path: string, body: unknown, options: { contentType: string; upsert: boolean }): Promise<{ error: { message: string } | null }>;
      createSignedUrl(path: string, expiresIn: number): Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
      remove(paths: string[]): Promise<{ error: { message: string } | null }>;
    };
  };
}

/**
 * Finder website-preview storage conventions (master prompt Phase 7).
 * Reuses the existing, already-provisioned `website-captures` Supabase
 * Storage bucket (private -- `public: false` -- created once by migration
 * 003_capture_engine.sql for the real audit pipeline) under a new, clearly
 * distinct path prefix -- no new bucket, no schema change, no migration,
 * no bucket/policy mutation of any kind at runtime. A Finder preview and a
 * real audit's own page_captures/screenshot_path row are never the same
 * object and never overwrite each other (Phase 7 item 9/10): audit
 * screenshots live at `${projectId}/${jobId}/${referenceId}.png`; Finder
 * previews live entirely under `finder-previews/`, a disjoint namespace.
 *
 * CREDENTIAL MODEL (P0 owner-review correction): migration 003's own
 * `storage.objects` RLS policy on this bucket is SELECT-only, and scoped
 * to paths shaped `${a real projects.id}/%` -- there is no INSERT policy
 * for a regular authenticated (session-scoped) user at all, and the
 * existing SELECT policy's path pattern doesn't match `finder-previews/`
 * either. The bucket's only existing writer, the analysis-job worker
 * (lib/jobs/process-analysis-job.ts), has only ever worked because it uses
 * createAdminClient() (service-role), bypassing RLS entirely -- confirmed
 * by reading that file directly, not assumed. This module follows the
 * exact same, already-established pattern for the same reason: every
 * function here uses the admin client internally, server-side only (this
 * file is never imported by client code, and the key itself never reaches
 * the browser -- identical to how src/app/api/prospects/[id]/handoff and
 * every other admin-client route in this codebase already works). Tenant
 * isolation is therefore enforced entirely at the application layer, not
 * by Postgres RLS on this table: `organizationId` is a parameter every
 * function here requires, and it is only ever populated by the API route
 * from requireAdminApi()'s own server-resolved session context (never
 * client input) before any of these functions are called -- the same
 * trust boundary /api/prospects/[id]/handoff and /api/site-lead already
 * rely on for their own admin-client-mediated writes.
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
 *
 * FAIL-CLOSED: if the `website-captures` bucket itself doesn't exist (or
 * any other storage-level failure occurs), every write function below
 * returns a real, distinguishable error -- readCachedPreview()/
 * tryAcquireLock() surface it as "nothing cached" / "lock not acquired"
 * (safe defaults that block a capture from proceeding rather than assume
 * success), and writePreview() returns { error } which
 * finder-preview-capture.ts turns into a "failed" preview state with
 * failureReason "STORAGE_WRITE_FAILED". Nothing here ever attempts to
 * create, alter, or otherwise provision the bucket -- a missing bucket is
 * an operational error to report and fix out of band, never something
 * this code tries to fix itself.
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

export async function readCachedPreview(organizationId: string, urlHash: string, client?: StorageClient): Promise<StoredPreview | null> {
  const supabase = client ?? createAdminClient();
  const path = basePath(organizationId, urlHash);
  const { data, error } = await supabase.storage.from(BUCKET).download(`${path}.json`);
  if (error || !data) return null; // no cache, a genuine storage failure, or a missing bucket all fail the same safe way: "nothing cached, capture fresh."
  try {
    const text = await data.text();
    const metadata = JSON.parse(text) as PreviewMetadata;
    const ageMs = Date.now() - new Date(metadata.capturedAt).getTime();
    return { metadata, imagePath: `${path}.png`, isStale: ageMs > FRESHNESS_MS };
  } catch {
    return null;
  }
}

export async function writePreview(organizationId: string, urlHash: string, metadata: PreviewMetadata, imageBuffer: Buffer | null, client?: StorageClient): Promise<{ error: string | null }> {
  const supabase = client ?? createAdminClient();
  const path = basePath(organizationId, urlHash);
  if (imageBuffer) {
    const { error: imgError } = await supabase.storage.from(BUCKET).upload(`${path}.png`, imageBuffer, { contentType: "image/png", upsert: true });
    if (imgError) return { error: imgError.message }; // fails closed -- e.g. "Bucket not found" if the expected bucket is missing, never auto-created.
  }
  const { error: metaError } = await supabase.storage
    .from(BUCKET)
    .upload(`${path}.json`, JSON.stringify(metadata), { contentType: "application/json", upsert: true });
  if (metaError) return { error: metaError.message };
  return { error: null };
}

/** A short-lived signed URL, generated only after the caller has already confirmed the requester's own organizationId matches the path (Phase 7 item 4: "a short-lived signed URL generated after tenant authorization" -- the authorization check happens in the API route, before this is ever called). Never a permanent public URL -- the bucket itself is private (public: false, migration 003), and createSignedUrl() is the only way to reach an object in it at all. */
export async function signPreviewImageUrl(organizationId: string, urlHash: string, expiresInSeconds = 300, client?: StorageClient): Promise<string | null> {
  const supabase = client ?? createAdminClient();
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
 * Fails closed: if the lock object can't be written (storage error,
 * missing bucket, ...), tryAcquireLock() returns false -- the caller
 * treats that exactly like "someone else is already capturing" and does
 * not proceed, rather than assuming the lock succeeded.
 */
export async function tryAcquireLock(organizationId: string, urlHash: string, client?: StorageClient): Promise<boolean> {
  const supabase = client ?? createAdminClient();
  const path = `${basePath(organizationId, urlHash)}.lock`;
  const { data: existing } = await supabase.storage.from(BUCKET).download(path);
  if (existing) {
    const ts = Number((await existing.text()).trim());
    if (!Number.isNaN(ts) && Date.now() - ts < LOCK_TTL_MS) return false; // a real capture is already in flight
  }
  const { error } = await supabase.storage.from(BUCKET).upload(path, String(Date.now()), { contentType: "text/plain", upsert: true });
  return !error;
}

export async function releaseLock(organizationId: string, urlHash: string, client?: StorageClient): Promise<void> {
  const supabase = client ?? createAdminClient();
  const path = `${basePath(organizationId, urlHash)}.lock`;
  await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}
