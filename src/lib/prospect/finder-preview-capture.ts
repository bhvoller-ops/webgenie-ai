import { PlaywrightCaptureProvider } from "@/lib/capture/playwright-provider";
import type { CaptureProvider } from "@/lib/capture/types";
import { extractFeatures } from "@/lib/capture/extract-features";
import { isHtmlLikeContentType } from "@/lib/security/url-validation";
import { normalizeWebsiteUrl } from "@/lib/prospect/finder-preview-url";
import { computeWebsiteCaptureSignals, computeListingSignals, computeAuditSignal, type FinderSignal } from "@/lib/prospect/finder-preview-signals";
import { hashUrl, readCachedPreview, writePreview, tryAcquireLock, releaseLock, signPreviewImageUrl, type PreviewMetadata, type StorageClient } from "@/lib/prospect/finder-preview-storage";

/**
 * Finder website-preview orchestration (master prompt Phase 3/6/7). The one
 * function the API route calls -- normalizes, checks the cache, captures at
 * most once per (organization, url) at a time, computes signals, stores,
 * and returns a result shape the UI renders directly. No eager capture:
 * this only ever runs when explicitly invoked for one business (Phase 3
 * items 7/8, Phase 9 item 1).
 *
 * `organizationId` is the only trust input, and it must always come from
 * the caller's own requireAdminApi()-resolved session context, never client
 * input -- the API route is the one and only place that boundary is
 * enforced.
 *
 * Both `client` (a StorageClient, see finder-preview-storage.ts's header
 * for why the admin client is used internally) and `captureProvider` below
 * are optional test-injection seams, mirroring finder-preview-storage.ts's
 * own `client` parameter: production (the API route) never passes either,
 * so it always gets the real createAdminClient() and a real
 * PlaywrightCaptureProvider. Tests inject an in-memory mock for each,
 * making it possible to execute peekPreview()/generatePreview() for real
 * -- including the fail-closed lock/cache branching and the finally-block
 * lock cleanup -- without touching production Supabase Storage or
 * launching a real browser.
 *
 * FAIL-CLOSED STATE HANDLING (P1 owner-review correction, second pass):
 * readCachedPreview() and tryAcquireLock() return a real discriminated
 * result -- "hit"/"miss"/"error" and "acquired"/"busy"/"error" -- and this
 * file branches on `status` explicitly everywhere. Playwright is launched
 * (`provider.capture(...)` below) in exactly one place, guarded by exactly
 * one condition: `lockResult.status === "acquired"`. A storage "error"
 * (missing bucket, permission denied, network outage) always returns
 * state "failed" with the safe, generic reason from finder-preview-
 * storage.ts -- never "capturing" (that would misreport a request that
 * can never resolve as one merely waiting its turn) and never proceeds to
 * capture.
 */
export type PreviewState = "available" | "capturing" | "unavailable" | "failed" | "not_generated";

export interface PreviewResult {
  state: PreviewState;
  capturedAt: string | null;
  isStale: boolean;
  signedImageUrl: string | null;
  signals: FinderSignal[];
  finalUrl: string | null;
  failureReason?: string;
}

const CAPTURE_TIMEOUT_MS = 20000;

function mergeSignals(websiteSignals: FinderSignal[], open24Hours: boolean | undefined, hasCompletedAudit: boolean): FinderSignal[] {
  return [...websiteSignals, ...computeListingSignals({ open24Hours }), computeAuditSignal(hasCompletedAudit)];
}

function emptyResult(state: PreviewState, input: { open24Hours: boolean | undefined; hasCompletedAudit: boolean }, extra?: Partial<PreviewResult>): PreviewResult {
  return {
    state,
    capturedAt: null,
    isStale: false,
    signedImageUrl: null,
    signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit),
    finalUrl: null,
    ...extra
  };
}

/** Cache-only read -- never triggers a capture. Used to render a result row's initial state without eagerly generating anything (Phase 9). */
export async function peekPreview(input: {
  organizationId: string;
  rawUrl: string | null | undefined;
  open24Hours: boolean | undefined;
  hasCompletedAudit: boolean;
  client?: StorageClient;
}): Promise<PreviewResult> {
  const normalized = normalizeWebsiteUrl(input.rawUrl);
  if ("error" in normalized) return emptyResult("unavailable", input);

  const urlHash = hashUrl(normalized.url);
  const cacheResult = await readCachedPreview(input.organizationId, urlHash, input.client);

  if (cacheResult.status === "error") {
    return emptyResult("failed", input, { failureReason: cacheResult.error });
  }
  if (cacheResult.status === "miss") {
    return emptyResult("not_generated", input);
  }

  const cached = cacheResult.preview;
  const signedImageUrl = cached.metadata.failureReason ? null : await signPreviewImageUrl(input.organizationId, urlHash, 300, input.client);
  return {
    state: cached.metadata.failureReason ? "failed" : "available",
    capturedAt: cached.metadata.capturedAt,
    isStale: cached.isStale,
    signedImageUrl,
    signals: mergeSignals(cached.metadata.signals, input.open24Hours, input.hasCompletedAudit),
    finalUrl: cached.metadata.finalUrl,
    failureReason: cached.metadata.failureReason
  };
}

/** Generates (or regenerates, if `forceRefresh`) a real preview. The only function in this module that ever launches a browser -- and only after a real lock "acquired" result. */
export async function generatePreview(input: {
  organizationId: string;
  rawUrl: string | null | undefined;
  open24Hours: boolean | undefined;
  hasCompletedAudit: boolean;
  forceRefresh?: boolean;
  client?: StorageClient;
  captureProvider?: CaptureProvider;
}): Promise<PreviewResult> {
  const normalized = normalizeWebsiteUrl(input.rawUrl);
  if ("error" in normalized) return emptyResult("unavailable", input);

  const urlHash = hashUrl(normalized.url);

  if (!input.forceRefresh) {
    const cacheResult = await readCachedPreview(input.organizationId, urlHash, input.client);
    if (cacheResult.status === "error") {
      // A genuine storage problem, not an ordinary cache miss -- report it
      // honestly rather than silently falling through to attempt a capture
      // that would very likely also fail against the same broken storage.
      return emptyResult("failed", input, { failureReason: cacheResult.error });
    }
    if (cacheResult.status === "hit" && !cacheResult.preview.isStale) {
      return peekPreview(input);
    }
    // "miss", or a stale hit -- fall through to lock + capture.
  }

  const lockResult = await tryAcquireLock(input.organizationId, urlHash, input.client);
  if (lockResult.status === "busy") {
    return emptyResult("capturing", input);
  }
  if (lockResult.status === "error") {
    // Never reported as "capturing" -- nothing is actually in flight, and
    // telling the user to wait for a request that can never resolve would
    // be worse than a clear failure. Playwright is never launched here.
    return emptyResult("failed", input, { failureReason: lockResult.error });
  }

  // lockResult.status === "acquired" -- the only path that ever reaches here.
  try {
    const provider = input.captureProvider ?? new PlaywrightCaptureProvider();
    let capture;
    try {
      capture = await provider.capture({ url: normalized.url, screenshot: true, timeoutMs: CAPTURE_TIMEOUT_MS });
    } catch (err) {
      const metadata: PreviewMetadata = {
        url: normalized.url,
        finalUrl: null,
        capturedAt: new Date().toISOString(),
        statusCode: null,
        likelyBlocked: false,
        responseTooLarge: false,
        contentTypeOk: false,
        signals: [],
        failureReason: err instanceof Error ? err.message : "CAPTURE_FAILED"
      };
      await writePreview(input.organizationId, urlHash, metadata, null, input.client);
      return emptyResult("failed", input, { capturedAt: metadata.capturedAt, failureReason: metadata.failureReason });
    }

    const contentTypeOk = isHtmlLikeContentType(capture.contentType);
    const usable = contentTypeOk && !capture.likelyBlocked && !capture.responseTooLarge && capture.screenshotBuffer;

    if (!usable) {
      const reason = capture.responseTooLarge ? "RESPONSE_TOO_LARGE" : capture.likelyBlocked ? "LIKELY_BLOCKED" : !contentTypeOk ? "UNSUPPORTED_CONTENT_TYPE" : "NO_SCREENSHOT";
      const metadata: PreviewMetadata = {
        url: normalized.url,
        finalUrl: capture.finalUrl,
        capturedAt: capture.capturedAt,
        statusCode: capture.statusCode,
        likelyBlocked: capture.likelyBlocked,
        responseTooLarge: capture.responseTooLarge,
        contentTypeOk,
        signals: [],
        failureReason: reason
      };
      await writePreview(input.organizationId, urlHash, metadata, null, input.client);
      return emptyResult("failed", input, { capturedAt: metadata.capturedAt, finalUrl: capture.finalUrl, failureReason: reason });
    }

    const features = extractFeatures(capture.html, capture.finalUrl);
    const websiteSignals = computeWebsiteCaptureSignals({ features, finalUrl: capture.finalUrl });

    const metadata: PreviewMetadata = {
      url: normalized.url,
      finalUrl: capture.finalUrl,
      capturedAt: capture.capturedAt,
      statusCode: capture.statusCode,
      likelyBlocked: false,
      responseTooLarge: false,
      contentTypeOk: true,
      signals: websiteSignals
    };
    const { error } = await writePreview(input.organizationId, urlHash, metadata, capture.screenshotBuffer as Buffer, input.client);
    if (error) {
      return {
        state: "failed",
        capturedAt: metadata.capturedAt,
        isStale: false,
        signedImageUrl: null,
        signals: mergeSignals(websiteSignals, input.open24Hours, input.hasCompletedAudit),
        finalUrl: capture.finalUrl,
        failureReason: "STORAGE_WRITE_FAILED"
      };
    }

    const signedImageUrl = await signPreviewImageUrl(input.organizationId, urlHash, 300, input.client);
    return {
      state: "available",
      capturedAt: metadata.capturedAt,
      isStale: false,
      signedImageUrl,
      signals: mergeSignals(websiteSignals, input.open24Hours, input.hasCompletedAudit),
      finalUrl: capture.finalUrl
    };
  } finally {
    await releaseLock(input.organizationId, urlHash, input.client);
  }
}
