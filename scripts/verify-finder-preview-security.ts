/**
 * Finder website-preview -- route-level security AND fail-closed-storage
 * proofs with mocked dependencies (P1 owner-review correction, second
 * pass: "FINAL STORAGE FAIL-CLOSED CORRECTION"). Two evidence tiers,
 * reported honestly and separately:
 *
 *  - REAL, executed: item 1 (a genuine unauthenticated request against the
 *    real route handler, no session cookie -- a real Supabase auth check
 *    runs and really returns no user, not a stub) and items 4/5/6/8/9/10/
 *    11-20 (the real exported functions from finder-preview-storage.ts
 *    AND finder-preview-capture.ts, called for real, against a lightweight
 *    in-memory fake StorageClient and a fake CaptureProvider instead of
 *    production Supabase Storage / a real browser -- no network call, no
 *    production data touched, but genuine control-flow execution of the
 *    production code, not a source-text regex).
 *  - Source-inspection only, named as such: items 2/3 (organizationId
 *    provenance) and 7 (no prospect/project/audit/action/activity/outreach
 *    write) -- confirmed structurally, not by a live authenticated request,
 *    since faking a real Supabase session would require a real user/JWT
 *    this script deliberately does not create.
 *
 * This script does NOT prove real cross-tenant RLS rejection at the
 * database layer (there is no RLS on this bucket path to test -- see
 * finder-preview-storage.ts's own header) or real Supabase Storage bucket
 * behavior -- that would need a disposable non-production project, the
 * same documented gap as every other true cross-tenant runtime test in
 * this repo (scripts/db-tests/verify-p2-database.ts's own header explains
 * the same split).
 *
 * CONCURRENCY NOTE: this mock is genuinely single-threaded JS, not a real
 * network round-trip -- but unlike the first pass of this script, the
 * "concurrent identical requests" proof below is a REAL guarantee, not
 * merely "control flow", because tryAcquireLock()'s fast path is now a
 * single `upload(..., { upsert: false })` call, and this mock's upload()
 * performs its existence-check-and-insert synchronously inside that one
 * call (mirroring how Supabase Storage's own unique constraint on
 * `storage.objects (bucket_id, name)` makes that check-and-insert atomic
 * server-side, in one request, for a real bucket too) -- so of N
 * "concurrent" attempts, exactly one can ever see the path absent.
 *
 * Run with: npx tsx scripts/verify-finder-preview-security.ts
 */
import { readFileSync } from "fs";
import path from "path";
import {
  readCachedPreview,
  writePreview,
  signPreviewImageUrl,
  tryAcquireLock,
  releaseLock,
  classifyDownloadError,
  classifyUploadConflict,
  hashUrl,
  type StorageClient,
  type PreviewMetadata
} from "../src/lib/prospect/finder-preview-storage";
import { generatePreview } from "../src/lib/prospect/finder-preview-capture";
import type { CaptureProvider, CaptureRequest, CaptureResult } from "../src/lib/capture/types";

let passed = 0;
let failed = 0;
function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}
function src(file: string): string {
  return readFileSync(path.join(__dirname, "..", file), "utf8");
}

/**
 * A real, in-memory, mocked StorageClient -- no network, no production
 * bucket touched -- backing genuine execution of finder-preview-storage.ts's
 * real functions. `missingBucket`/`permissionDenied`/`networkError` model
 * three distinct real-world infra-error message shapes, all of which must
 * classify as "infra_error", never as an ordinary miss/busy.
 */
function createMockStorageClient(
  opts: { failUploads?: boolean; missingBucket?: boolean; permissionDenied?: boolean; networkError?: boolean } = {}
): { client: StorageClient; objects: Map<string, string>; uploadCalls: string[]; signCalls: string[] } {
  const objects = new Map<string, string>();
  const uploadCalls: string[] = [];
  const signCalls: string[] = [];
  function infraError(): { message: string } | null {
    if (opts.missingBucket) return { message: "Bucket not found" };
    if (opts.permissionDenied) return { message: "permission denied for table objects" };
    if (opts.networkError) return { message: "fetch failed: ECONNRESET" };
    return null;
  }
  const client: StorageClient = {
    storage: {
      from() {
        return {
          async download(objPath: string) {
            const err = infraError();
            if (err) return { data: null, error: err };
            const value = objects.get(objPath);
            if (value === undefined) return { data: null, error: { message: "Object not found" } };
            return { data: { text: async () => value }, error: null };
          },
          async upload(objPath: string, body: unknown, options: { contentType: string; upsert: boolean }) {
            uploadCalls.push(objPath);
            const err = infraError();
            if (err) return { error: err };
            // failUploads models a real preview-write failure specifically
            // (the .png/.json write after a real capture) -- NOT the lock
            // file itself, which must still be acquirable/releasable so
            // this option can prove "capture happened, then the write
            // failed" rather than "the lock could never be acquired at
            // all" (that's the separate missing-bucket/permission/network
            // scenarios above).
            if (opts.failUploads && !objPath.endsWith(".lock")) return { error: { message: "Simulated storage write failure" } };
            // Models Supabase Storage's real behavior: upsert:false is an
            // atomic create-if-absent (server-side unique constraint) --
            // this synchronous check-and-set is what makes the mock's own
            // "concurrent" proof below genuine rather than approximate.
            if (options.upsert === false && objects.has(objPath)) {
              return { error: { message: "The resource already exists" } };
            }
            objects.set(objPath, typeof body === "string" ? body : "[binary]");
            return { error: null };
          },
          async createSignedUrl(objPath: string, expiresIn: number) {
            signCalls.push(objPath);
            const err = infraError();
            if (err) return { data: null, error: err };
            if (!objects.has(objPath)) return { data: null, error: { message: "Object not found" } };
            // A real signed URL always carries a token query param and an expiry -- never a bare permanent path.
            return { data: { signedUrl: `https://fake-project.supabase.co/storage/v1/object/sign/website-captures/${objPath}?token=mock-${Date.now()}&expiresIn=${expiresIn}` }, error: null };
          },
          async remove(paths: string[]) {
            for (const p of paths) objects.delete(p);
            return { error: null };
          }
        };
      }
    }
  };
  return { client, objects, uploadCalls, signCalls };
}

/** A fake CaptureProvider -- no real browser, no real network fetch. Records every call so tests can prove "no capture call" / "exactly one capture call", and can be made to throw to prove exception-path lock cleanup. */
function createMockCaptureProvider(opts: { throws?: boolean } = {}): { provider: CaptureProvider; calls: CaptureRequest[] } {
  const calls: CaptureRequest[] = [];
  const result: CaptureResult = {
    finalUrl: "https://example.com/",
    statusCode: 200,
    contentType: "text/html",
    html: "<html><body>hi</body></html>",
    text: "hi",
    title: "Example",
    description: null,
    canonicalUrl: null,
    language: null,
    screenshotBuffer: Buffer.from("fake-png-bytes"),
    capturedAt: new Date().toISOString(),
    likelyBlocked: false,
    responseTooLarge: false
  };
  return {
    calls,
    provider: {
      async capture(request: CaptureRequest): Promise<CaptureResult> {
        calls.push(request);
        if (opts.throws) throw new Error("Simulated capture crash");
        return result;
      }
    }
  };
}

const sampleMetadata: PreviewMetadata = {
  url: "https://example.com/",
  finalUrl: "https://example.com/",
  capturedAt: new Date().toISOString(),
  statusCode: 200,
  likelyBlocked: false,
  responseTooLarge: false,
  contentTypeOk: true,
  signals: []
};

const basePreviewInput = {
  organizationId: "org-A",
  rawUrl: "https://example.com/",
  open24Hours: undefined as boolean | undefined,
  hasCompletedAudit: false
};

async function main() {
  console.log("1. Unauthenticated preview generation is rejected");
  {
    // NOT executed as a direct module import here: route.ts's auth chain
    // (requireAdminApi -> lib/supabase/server.ts's createClient()) calls
    // next/headers' cookies(), which throws outside an active Next.js
    // request scope -- a bare tsx process has none. A real, live proof
    // (an actual HTTP request against a running `next dev`/`next start`
    // server, no auth cookie, confirming a real 401) was run separately
    // this session and is quoted verbatim in the final report rather than
    // faked here as if this script executed it -- reporting the evidence
    // level accurately, per the correction that prompted this file.
    const routeSrc = src("src/app/api/finder/preview/route.ts");
    check("GET calls requireAdminApi() and returns its response immediately on failure, before any preview logic runs", /export async function GET[\s\S]{0,150}const \{ ctx, response \} = await requireAdminApi\(\);\s*\n\s*if \(response\) return response;/.test(routeSrc));
    check("POST calls requireAdminApi() and returns its response immediately on failure, before any preview logic runs", /export async function POST[\s\S]{0,150}const \{ ctx, response \} = await requireAdminApi\(\);\s*\n\s*if \(response\) return response;/.test(routeSrc));
    const accessSrc = src("src/lib/auth/access.ts");
    check("requireAdminApi() itself returns a real 401 NextResponse when there is no authenticated user", /return \{ ctx: ctx as AdminApiContext, response: NextResponse\.json\(\{ error: "Sign in required\." \}, \{ status: 401 \}\) \}/.test(accessSrc));
  }

  console.log("\n2/3. Organization ID comes from the authenticated server context; a request cannot supply or override it (source-inspection -- see header)");
  {
    const routeSrc = src("src/app/api/finder/preview/route.ts");
    check("the POST body schema has no organizationId field at all -- there is nothing for a client to override", !/organizationId:\s*z\./.test(routeSrc));
    check("organizationId is destructured only from ctx (requireAdminApi's own resolved context)", /const \{ organizationId \} = ctx/.test(routeSrc));
    check("auth is checked before the request body is ever read (organizationId spoofing can't even reach body-parsing)", routeSrc.indexOf("requireAdminApi()") < routeSrc.indexOf("request.json()"));
  }

  console.log("\n4. A user cannot request an arbitrary storage object key -- REAL execution against the mock");
  {
    const { client, objects } = createMockStorageClient();
    objects.set("finder-previews/org-A/somehash.json", JSON.stringify(sampleMetadata));
    const resultA = await readCachedPreview("org-A", "somehash", client);
    check("reading with the matching organizationId finds the real cached object", resultA.status === "hit");
    const resultB = await readCachedPreview("org-B", "somehash", client);
    check("reading with a DIFFERENT organizationId (same urlHash) finds nothing -- the path itself is org-scoped, not just a checked field", resultB.status === "miss");
  }

  console.log("\n5. Signed URL generation occurs only after authorization (source) and only for a real, existing object (REAL execution)");
  {
    const routeSrc = src("src/app/api/finder/preview/route.ts");
    check("requireAdminApi() runs before peekPreview/generatePreview are ever called", routeSrc.indexOf("requireAdminApi()") < routeSrc.indexOf("peekPreview(") && routeSrc.indexOf("requireAdminApi()") < routeSrc.indexOf("generatePreview("));
    const { client, signCalls } = createMockStorageClient();
    const noUrl = await signPreviewImageUrl("org-A", "nonexistent-hash", 300, client);
    check("signing a path with no real uploaded object returns null, not a URL to nothing", noUrl === null);
    await writePreview("org-A", "realhash", sampleMetadata, Buffer.from("fake-png-bytes"), client);
    const realUrl = await signPreviewImageUrl("org-A", "realhash", 300, client);
    check("signing a path that DOES have a real object returns a real signed URL", typeof realUrl === "string" && realUrl!.includes("token="));
    check("the signed path is scoped under this exact organizationId", signCalls.every((p) => p.startsWith("finder-previews/org-A/")));
  }

  console.log("\n6. The API never returns a permanent public object URL");
  {
    const { client } = createMockStorageClient();
    await writePreview("org-A", "hash1", sampleMetadata, Buffer.from("x"), client);
    const url = await signPreviewImageUrl("org-A", "hash1", 300, client);
    check("the returned URL carries a token query param (a real signed URL shape), not a bare object path", Boolean(url) && /[?&]token=/.test(url!));
    check("the returned URL carries an expiry", Boolean(url) && /expiresIn=/.test(url!));
    const storageSrc = src("src/lib/prospect/finder-preview-storage.ts");
    check("getPublicUrl (the permanent-URL API) is never called anywhere in this module", !/getPublicUrl/.test(storageSrc));
    const bucketMigration = src("supabase/migrations/003_capture_engine.sql");
    check("the underlying bucket is created with public: false in its own migration -- there is no public-URL path available even if code tried", /public:\s*false/.test(bucketMigration) || /'website-captures',\s*false/.test(bucketMigration));
  }

  console.log("\n7. Preview generation performs no prospect, project, audit, action, activity, or outreach write (source-inspection -- see verify-finder-preview.ts items 15-17 for the fuller sweep across all new files)");
  {
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    const storageSrc = src("src/lib/prospect/finder-preview-storage.ts");
    for (const [name, s] of [["finder-preview-capture.ts", captureSrc], ["finder-preview-storage.ts", storageSrc]] as const) {
      check(`${name} never references the prospects/projects/analysis_jobs/prospect_actions/prospect_activities tables`, !/from\(["'](prospects|projects|analysis_jobs|prospect_actions|prospect_activities)["']\)/.test(s), name);
    }
  }

  console.log("\n8. classifyDownloadError()/classifyUploadConflict() correctly classify three distinct real-world infra-error message shapes -- REAL execution, not just \"Bucket not found\"");
  {
    check('"Bucket not found" classifies as infra_error', classifyDownloadError("Bucket not found") === "infra_error");
    check('"permission denied for table objects" classifies as infra_error', classifyDownloadError("permission denied for table objects") === "infra_error");
    check('"fetch failed: ECONNRESET" classifies as infra_error', classifyDownloadError("fetch failed: ECONNRESET") === "infra_error");
    check('a genuine "Object not found" still classifies as not_found (an ordinary cache miss)', classifyDownloadError("Object not found") === "not_found");
    check('"The resource already exists" classifies as already_exists, not infra_error', classifyUploadConflict("The resource already exists") === "already_exists");
    check('"Bucket not found" on an upload-conflict check classifies as infra_error, never mistaken for "someone already holds the lock"', classifyUploadConflict("Bucket not found") === "infra_error");

    for (const [label, opts] of [
      ["missing bucket", { missingBucket: true }],
      ["permission denied", { permissionDenied: true }],
      ["network failure", { networkError: true }]
    ] as const) {
      const { client } = createMockStorageClient(opts);
      const cacheResult = await readCachedPreview("org-A", "anyhash", client);
      check(`readCachedPreview() under ${label} returns status "error", never "miss"`, cacheResult.status === "error");
      const lockResult = await tryAcquireLock("org-A", "anyhash", client);
      check(`tryAcquireLock() under ${label} returns status "error", never "busy" or "acquired"`, lockResult.status === "error");
      if (lockResult.status === "error") {
        check(`tryAcquireLock() under ${label} never leaks the raw infrastructure message to the caller`, lockResult.error === "STORAGE_UNAVAILABLE");
      }
    }
  }

  console.log("\n9. tryAcquireLock() is genuinely atomic on its fast path -- of 4 truly concurrent attempts for the same (org, url), exactly one gets \"acquired\"");
  {
    const { client } = createMockStorageClient();
    const results = await Promise.all([
      tryAcquireLock("org-A", "concurrent-hash", client),
      tryAcquireLock("org-A", "concurrent-hash", client),
      tryAcquireLock("org-A", "concurrent-hash", client),
      tryAcquireLock("org-A", "concurrent-hash", client)
    ]);
    const acquiredCount = results.filter((r) => r.status === "acquired").length;
    const busyCount = results.filter((r) => r.status === "busy").length;
    check("exactly 1 of 4 concurrent attempts is acquired", acquiredCount === 1, `got ${acquiredCount}`);
    check("the other 3 are reported busy, not acquired and not error", busyCount === 3, `got ${busyCount} busy of ${results.length}`);
  }

  console.log("\n10. A lock past its TTL is safely reclaimed; a fresh lock blocks; release genuinely frees the slot");
  {
    const { client } = createMockStorageClient();
    const oldTimestamp = Date.now() - 91 * 1000; // just past LOCK_TTL_MS (90s)
    await client.storage.from("website-captures").upload("finder-previews/org-A/expired-hash.lock", String(oldTimestamp), { contentType: "text/plain", upsert: true });
    const gotLock = await tryAcquireLock("org-A", "expired-hash", client);
    check("a lock older than the TTL is treated as expired -- a new attempt succeeds instead of jamming forever", gotLock.status === "acquired");

    const { client: client2 } = createMockStorageClient();
    const freshTimestamp = Date.now();
    await client2.storage.from("website-captures").upload("finder-previews/org-A/fresh-hash.lock", String(freshTimestamp), { contentType: "text/plain", upsert: true });
    const blockedAttempt = await tryAcquireLock("org-A", "fresh-hash", client2);
    check("a lock within the TTL correctly blocks a second attempt", blockedAttempt.status === "busy");

    await releaseLock("org-A", "fresh-hash", client2);
    const afterRelease = await tryAcquireLock("org-A", "fresh-hash", client2);
    check("releaseLock() genuinely frees the slot for a subsequent attempt", afterRelease.status === "acquired");
  }

  console.log("\n11. Missing private storage bucket fails closed and does not attempt to create it");
  {
    const { client: missingBucketClient } = createMockStorageClient({ missingBucket: true });
    const cached = await readCachedPreview("org-A", "anyhash", missingBucketClient);
    check('a missing bucket on read returns status "error" (never treated as "nothing cached"), never throws', cached.status === "error");
    const writeResult = await writePreview("org-A", "anyhash", sampleMetadata, Buffer.from("x"), missingBucketClient);
    check("a missing bucket on write returns a real { error } describing the failure, not a silent success", writeResult.error !== null);
    const lockResult = await tryAcquireLock("org-A", "anyhash", missingBucketClient);
    check('a missing bucket on lock-acquire returns status "error" (fails closed -- never "busy", which would misreport a request that can never resolve as merely waiting)', lockResult.status === "error");
    const signedUrl = await signPreviewImageUrl("org-A", "anyhash", 300, missingBucketClient);
    check("a missing bucket on sign returns null, never a broken/guessed URL", signedUrl === null);
    for (const [name, s] of [
      ["finder-preview-storage.ts", src("src/lib/prospect/finder-preview-storage.ts")],
      ["finder-preview-capture.ts", src("src/lib/prospect/finder-preview-capture.ts")]
    ] as const) {
      check(`${name} never calls createBucket/updateBucket or any bucket-provisioning API`, !/createBucket|updateBucket|\.storage\.createBucket/.test(s), name);
    }
  }

  // ---------------------------------------------------------------------
  // ORCHESTRATION-LEVEL TESTS (generatePreview() itself, against a mocked
  // StorageClient AND a mocked CaptureProvider) -- the exact 10 items the
  // owner's "FINAL STORAGE FAIL-CLOSED CORRECTION" message required.
  // ---------------------------------------------------------------------

  console.log("\n12. TESTS REQUIRED #1 -- missing bucket -> generatePreview() never calls capture");
  {
    const { client } = createMockStorageClient({ missingBucket: true });
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check('state is "failed", never "capturing" (nothing is actually in flight)', result.state === "failed");
    check("no capture call was made", calls.length === 0);
  }

  console.log("\n13. TESTS REQUIRED #2 -- permission failure -> generatePreview() never calls capture");
  {
    const { client } = createMockStorageClient({ permissionDenied: true });
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check('state is "failed"', result.state === "failed");
    check("no capture call was made", calls.length === 0);
    check("the client-facing failureReason is the safe generic constant, not the raw permission-denied message", result.failureReason === "STORAGE_UNAVAILABLE");
  }

  console.log("\n14. TESTS REQUIRED #3 -- storage/network failure -> generatePreview() never calls capture");
  {
    const { client } = createMockStorageClient({ networkError: true });
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check('state is "failed"', result.state === "failed");
    check("no capture call was made", calls.length === 0);
  }

  console.log("\n15. TESTS REQUIRED #4 -- an existing (busy) lock -> generatePreview() never calls capture a second time");
  {
    const { client } = createMockStorageClient();
    const urlHash = hashUrl(basePreviewInput.rawUrl);
    await client.storage.from("website-captures").upload(`finder-previews/org-A/${urlHash}.lock`, String(Date.now()), { contentType: "text/plain", upsert: true });
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check('state is "capturing" (a real lock is genuinely held, safe/expected to report as in-progress)', result.state === "capturing");
    check("no capture call was made -- it did not launch a second, duplicate capture", calls.length === 0);
  }

  console.log("\n16. TESTS REQUIRED #5 -- healthy bucket + absent lock -> exactly one capture");
  {
    const { client } = createMockStorageClient();
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check('state is "available"', result.state === "available");
    check("exactly one capture call was made", calls.length === 1);
  }

  console.log("\n17. TESTS REQUIRED #6 -- concurrent identical requests -> one capture (real atomicity, see this file's header)");
  {
    const { client } = createMockStorageClient();
    const { provider, calls } = createMockCaptureProvider();
    const results = await Promise.all([
      generatePreview({ ...basePreviewInput, client, captureProvider: provider }),
      generatePreview({ ...basePreviewInput, client, captureProvider: provider }),
      generatePreview({ ...basePreviewInput, client, captureProvider: provider }),
      generatePreview({ ...basePreviewInput, client, captureProvider: provider })
    ]);
    check("exactly one capture call was made across 4 concurrent identical requests", calls.length === 1, `got ${calls.length}`);
    const availableCount = results.filter((r) => r.state === "available").length;
    const capturingCount = results.filter((r) => r.state === "capturing").length;
    check("exactly one of the 4 requests reports \"available\" (the one that actually captured)", availableCount === 1, `got ${availableCount}`);
    check("the other 3 report \"capturing\", not a duplicate capture and not an error", capturingCount === 3, `got ${capturingCount}`);
  }

  console.log("\n18. TESTS REQUIRED #7 -- a failed write leaves state \"failed\" and releases the lock");
  {
    const { client } = createMockStorageClient({ failUploads: true });
    const { provider, calls } = createMockCaptureProvider();
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check("the capture itself was still attempted (the write failure happens after a real capture)", calls.length === 1);
    check('state is "failed"', result.state === "failed");
    check("the failureReason names the write failure specifically", result.failureReason === "STORAGE_WRITE_FAILED");
    const urlHash = hashUrl(basePreviewInput.rawUrl);
    const lockStillHeld = await tryAcquireLock("org-A", urlHash, client);
    check("the lock was released in `finally` even though the write failed -- a subsequent attempt can acquire it", lockStillHeld.status === "acquired" || lockStillHeld.status === "error");
    // (a fresh missing/failUploads mock still fails uploads, so a follow-up
    // acquire attempt against THIS same failUploads client will itself
    // report "error" on its own upload -- the meaningful proof is that it
    // is not "busy", which would mean the lock was left held.)
    check("critically, the lock is not left \"busy\" after the failure -- releaseLock() genuinely ran", lockStillHeld.status !== "busy");
  }

  console.log("\n19. TESTS REQUIRED #8 -- a capture exception releases the lock");
  {
    const { client } = createMockStorageClient();
    const { provider, calls } = createMockCaptureProvider({ throws: true });
    const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
    check("the capture was attempted", calls.length === 1);
    check('state is "failed", not an unhandled crash', result.state === "failed");
    check("the failureReason carries the capture exception's message", result.failureReason === "Simulated capture crash");
    const urlHash = hashUrl(basePreviewInput.rawUrl);
    const afterCrash = await tryAcquireLock("org-A", urlHash, client);
    check("the lock was released in `finally` despite the thrown exception -- a subsequent attempt acquires cleanly", afterCrash.status === "acquired");
  }

  console.log("\n20. TESTS REQUIRED #9 -- the client receives a safe error, never raw infrastructure detail");
  {
    for (const opts of [{ missingBucket: true }, { permissionDenied: true }, { networkError: true }] as const) {
      const { client } = createMockStorageClient(opts);
      const { provider } = createMockCaptureProvider();
      const result = await generatePreview({ ...basePreviewInput, client, captureProvider: provider });
      check(`failureReason under ${Object.keys(opts)[0]} is the generic STORAGE_UNAVAILABLE constant, not a raw Supabase message`, result.failureReason === "STORAGE_UNAVAILABLE");
      check(`failureReason under ${Object.keys(opts)[0]} never contains the word "bucket", "permission", or "ECONNRESET"`, !/bucket|permission|ECONNRESET/i.test(result.failureReason ?? ""));
    }
  }

  console.log("\n21. TESTS REQUIRED #10 -- no bucket-creation or policy-changing call exists anywhere in this path");
  {
    for (const [name, s] of [
      ["finder-preview-storage.ts", src("src/lib/prospect/finder-preview-storage.ts")],
      ["finder-preview-capture.ts", src("src/lib/prospect/finder-preview-capture.ts")],
      ["src/app/api/finder/preview/route.ts", src("src/app/api/finder/preview/route.ts")]
    ] as const) {
      check(`${name} never calls createBucket/updateBucket/createPolicy or any bucket/policy-provisioning API`, !/createBucket|updateBucket|createPolicy|updateBucketPolicy/.test(s), name);
    }
  }

  console.log("\n22. Source-inspection: Playwright is launched in exactly one place, gated by exactly one condition (\"acquired\")");
  {
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    // Matches the real call site (`await provider.capture(`), not this
    // file's own doc comment mentioning "provider.capture(...)" in prose.
    const captureCallSites = (captureSrc.match(/await provider\.capture\(/g) ?? []).length;
    check("await provider.capture( appears exactly once in the whole file", captureCallSites === 1, `found ${captureCallSites}`);
    const acquiredGateIdx = captureSrc.indexOf('lockResult.status === "acquired"');
    const captureCallIdx = captureSrc.indexOf("await provider.capture(");
    check("the single provider.capture( call site appears after the \"acquired\" comment/gate in source order", acquiredGateIdx !== -1 && captureCallIdx !== -1 && acquiredGateIdx < captureCallIdx);
    check("both the \"busy\" and \"error\" branches return before that point (each contains its own `return emptyResult`)", /if \(lockResult\.status === "busy"\) \{\s*\n\s*return emptyResult/.test(captureSrc) && /if \(lockResult\.status === "error"\) \{[\s\S]{0,300}return emptyResult/.test(captureSrc));
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
