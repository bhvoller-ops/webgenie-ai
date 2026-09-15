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
 * FAIL-CLOSED (P1 owner-review correction, second pass): readCachedPreview()
 * and tryAcquireLock() return an explicit three-state discriminated result
 * -- never a bare boolean/null -- because collapsing "a real lock is held
 * by someone else" (busy, healthy, expected, safe to report as "generating,
 * try again shortly") and "the bucket is missing / permission denied /
 * storage is unreachable" (error, unhealthy, must never be reported the
 * same way) into one falsy value was a real bug in the first pass: a
 * caller receiving that ambiguous `false` had no way to avoid telling the
 * user "capturing…" for a request that could never actually resolve,
 * because nothing was ever really capturing. The fix: `LockResult` is
 * `{status:"acquired"}` | `{status:"busy"}` | `{status:"error", error}`,
 * and `CacheReadResult` is `{status:"hit", preview}` | `{status:"miss"}` |
 * `{status:"error", error}` -- finder-preview-capture.ts branches on
 * `status` explicitly and Playwright is only ever launched after a real
 * `"acquired"`. A missing bucket, a permission failure, and a network
 * outage all classify as `"error"` (via classifyDownloadError() below,
 * message-based since the Supabase Storage JS client doesn't expose a
 * strongly-typed error discriminant) -- never treated as an ordinary
 * cache miss or an ordinary busy lock. Nothing here ever attempts to
 * create, alter, or otherwise provision the bucket -- a missing bucket is
 * an operational error to report and fix out of band, never something
 * this code tries to fix itself. The `error` string returned to a caller
 * is always the generic, safe STORAGE_UNAVAILABLE constant (safeStorageError()
 * below) -- the real Supabase error message is logged server-side only,
 * never returned to the client (Phase 6 item 16 in spirit: don't leak
 * infrastructure detail across the trust boundary).
 */
const BUCKET = "website-captures";
const FRESHNESS_MS = 24 * 60 * 60 * 1000; // 24h -- a "reasonable freshness period" (Phase 7 item 7); explicit refresh (Phase 7 item 8) bypasses this.
const LOCK_TTL_MS = 90 * 1000; // long enough for a real capture (<=30s navigation + screenshot), short enough that a crashed/abandoned lock self-clears quickly.

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}

/**
 * A missing object ("Object not found") in a healthy bucket is a normal,
 * expected outcome -- a cache miss, or no lock currently held. A missing
 * BUCKET ("Bucket not found"), a permission failure, or any other storage
 * error is an infrastructure problem that must never be treated the same
 * way. The Supabase Storage JS client doesn't expose a typed discriminant
 * for this, so classification is message-based -- deliberately narrow
 * (only "not found" AND not mentioning "bucket" counts as a real miss;
 * anything else, including an unrecognized message, fails to "infra_error"
 * rather than risking a false "miss").
 */
export function classifyDownloadError(message: string | null | undefined): "not_found" | "infra_error" {
  if (!message) return "infra_error";
  const m = message.toLowerCase();
  if (m.includes("bucket")) return "infra_error"; // e.g. "Bucket not found"
  if (m.includes("not found") || m.includes("not_found") || m.includes("404")) return "not_found";
  return "infra_error"; // permission denied, network failure, rate limit, anything unrecognized -- fail closed
}

/**
 * Distinguishes "the object already exists" (the expected rejection an
 * `upsert: false` upload gets when another request's lock already won --
 * Supabase Storage enforces this as a single server-side unique-constraint
 * check on `storage.objects (bucket_id, name)`, genuinely atomic, unlike a
 * client-side download-then-upload check) from a real infrastructure
 * problem (missing bucket, permission denied, network outage), which must
 * never be treated as "someone else already has the lock."
 */
export function classifyUploadConflict(message: string | null | undefined): "already_exists" | "infra_error" {
  if (!message) return "infra_error";
  const m = message.toLowerCase();
  if (m.includes("already exists") || m.includes("duplicate")) return "already_exists";
  return "infra_error";
}

/** Never the raw Supabase error message -- that could name the bucket, the project, or other infrastructure detail a client has no business seeing. The real message is still logged server-side for operators. */
function safeStorageError(rawMessage: string): string {
  console.error(`[finder-preview-storage] storage error: ${rawMessage}`);
  return "STORAGE_UNAVAILABLE";
}

export type LockResult = { status: "acquired" } | { status: "busy" } | { status: "error"; error: string };
export type CacheReadResult = { status: "hit"; preview: StoredPreview } | { status: "miss" } | { status: "error"; error: string };

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

/**
 * Distinguishes "no cached preview exists yet" (status: "miss" -- normal,
 * safe to proceed to lock acquisition) from "storage could not be queried"
 * (status: "error" -- a missing bucket, a permission failure, or a network
 * outage, none of which may be treated as an ordinary cache miss).
 */
export async function readCachedPreview(organizationId: string, urlHash: string, client?: StorageClient): Promise<CacheReadResult> {
  const supabase = client ?? createAdminClient();
  const path = basePath(organizationId, urlHash);
  const { data, error } = await supabase.storage.from(BUCKET).download(`${path}.json`);
  if (error) {
    if (classifyDownloadError(error.message) === "infra_error") return { status: "error", error: safeStorageError(error.message) };
    return { status: "miss" }; // a real "Object not found" -- no cache yet, healthy bucket.
  }
  if (!data) return { status: "miss" };
  try {
    const text = await data.text();
    const metadata = JSON.parse(text) as PreviewMetadata;
    const ageMs = Date.now() - new Date(metadata.capturedAt).getTime();
    return { status: "hit", preview: { metadata, imagePath: `${path}.png`, isStale: ageMs > FRESHNESS_MS } };
  } catch {
    return { status: "miss" }; // corrupted/unparseable sidecar -- safe to treat as no usable cache and regenerate, not an infrastructure error.
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
 *
 * Returns a genuine three-state result -- "acquired" (proceed to capture),
 * "busy" (a real lock is held by someone else; safe, expected, report
 * "capturing" and don't launch another), or "error" (the bucket is
 * missing, permission was denied, or storage is unreachable -- this must
 * NEVER be reported as "busy": nothing is actually capturing, so a caller
 * that treated this as busy would tell the user "try again shortly"
 * forever for a request that can never resolve). Playwright is launched
 * by the caller (finder-preview-capture.ts) only when status is exactly
 * "acquired".
 *
 * TRUE ATOMICITY ON THE COMMON PATH (owner-review correction): the fast
 * path below is `upload(path, ..., { upsert: false })` FIRST, not a
 * download-then-upload check-then-act. Supabase Storage enforces object
 * uniqueness with a Postgres unique constraint on `storage.objects
 * (bucket_id, name)` server-side, in the single request -- so of any
 * number of truly concurrent `upsert:false` creates for the same path,
 * the backend itself guarantees exactly one succeeds; this is not a
 * client-side race the way a separate download-then-upload pair is.
 * Only when that fast path reports "the object already exists" does this
 * function fall back to downloading the existing lock to check whether
 * it's expired -- a narrower race window than before, but one that only
 * matters for the rare crashed/abandoned-lock case, not ordinary
 * contention between two fresh requests.
 */
export async function tryAcquireLock(organizationId: string, urlHash: string, client?: StorageClient): Promise<LockResult> {
  const supabase = client ?? createAdminClient();
  const path = `${basePath(organizationId, urlHash)}.lock`;

  const { error: createError } = await supabase.storage.from(BUCKET).upload(path, String(Date.now()), { contentType: "text/plain", upsert: false });
  if (!createError) return { status: "acquired" }; // the common case: no lock existed, and creating it was itself the atomic check.

  if (classifyUploadConflict(createError.message) !== "already_exists") {
    return { status: "error", error: safeStorageError(createError.message) };
  }

  // A lock object already exists (that's what "already exists" means here)
  // -- check whether it's expired before deciding whether this is really
  // "busy" or a stale lock safe to reclaim.
  const { data: existing, error: downloadError } = await supabase.storage.from(BUCKET).download(path);
  if (downloadError) {
    if (classifyDownloadError(downloadError.message) === "infra_error") {
      return { status: "error", error: safeStorageError(downloadError.message) };
    }
    // The create-conflict said it existed a moment ago but it's gone now --
    // another request's lock just expired and was released between our two
    // calls. Report "busy" rather than racing to grab it ourselves; the
    // caller's own next request will acquire it cleanly via the fast path.
    return { status: "busy" };
  }
  if (existing) {
    const ts = Number((await existing.text()).trim());
    if (!Number.isNaN(ts) && Date.now() - ts < LOCK_TTL_MS) return { status: "busy" }; // a real capture is already in flight
    // lock object exists but is past its TTL -- treat as expired, fall through and overwrite it.
  }

  const { error: overwriteError } = await supabase.storage.from(BUCKET).upload(path, String(Date.now()), { contentType: "text/plain", upsert: true });
  if (overwriteError) return { status: "error", error: safeStorageError(overwriteError.message) };
  return { status: "acquired" };
}

export async function releaseLock(organizationId: string, urlHash: string, client?: StorageClient): Promise<void> {
  const supabase = client ?? createAdminClient();
  const path = `${basePath(organizationId, urlHash)}.lock`;
  await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}
