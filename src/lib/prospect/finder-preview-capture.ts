import type { SupabaseClient } from "@supabase/supabase-js";
import { PlaywrightCaptureProvider } from "@/lib/capture/playwright-provider";
import { extractFeatures } from "@/lib/capture/extract-features";
import { isHtmlLikeContentType } from "@/lib/security/url-validation";
import { normalizeWebsiteUrl } from "@/lib/prospect/finder-preview-url";
import { computeWebsiteCaptureSignals, computeListingSignals, computeAuditSignal, type FinderSignal } from "@/lib/prospect/finder-preview-signals";
import { hashUrl, readCachedPreview, writePreview, tryAcquireLock, releaseLock, signPreviewImageUrl, type PreviewMetadata } from "@/lib/prospect/finder-preview-storage";

/**
 * Finder website-preview orchestration (master prompt Phase 3/6/7). The one
 * function the API route calls -- normalizes, checks the cache, captures at
 * most once per (organization, url) at a time, computes signals, stores,
 * and returns a result shape the UI renders directly. No eager capture:
 * this only ever runs when explicitly invoked for one business (Phase 3
 * items 7/8, Phase 9 item 1).
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

/** Cache-only read -- never triggers a capture. Used to render a result row's initial state without eagerly generating anything (Phase 9). */
export async function peekPreview(
  supabase: SupabaseClient,
  input: { organizationId: string; rawUrl: string | null | undefined; open24Hours: boolean | undefined; hasCompletedAudit: boolean }
): Promise<PreviewResult> {
  const normalized = normalizeWebsiteUrl(input.rawUrl);
  if ("error" in normalized) {
    return {
      state: "unavailable",
      capturedAt: null,
      isStale: false,
      signedImageUrl: null,
      signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit),
      finalUrl: null
    };
  }
  const urlHash = hashUrl(normalized.url);
  const cached = await readCachedPreview(supabase, input.organizationId, urlHash);
  if (!cached) {
    return {
      state: "not_generated",
      capturedAt: null,
      isStale: false,
      signedImageUrl: null,
      signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit),
      finalUrl: null
    };
  }
  const signedImageUrl = cached.metadata.failureReason ? null : await signPreviewImageUrl(supabase, input.organizationId, urlHash);
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

/** Generates (or regenerates, if `forceRefresh`) a real preview. The only function in this module that ever launches a browser. */
export async function generatePreview(
  supabase: SupabaseClient,
  input: { organizationId: string; rawUrl: string | null | undefined; open24Hours: boolean | undefined; hasCompletedAudit: boolean; forceRefresh?: boolean }
): Promise<PreviewResult> {
  const normalized = normalizeWebsiteUrl(input.rawUrl);
  if ("error" in normalized) {
    return { state: "unavailable", capturedAt: null, isStale: false, signedImageUrl: null, signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit), finalUrl: null };
  }

  const urlHash = hashUrl(normalized.url);

  if (!input.forceRefresh) {
    const cached = await readCachedPreview(supabase, input.organizationId, urlHash);
    if (cached && !cached.isStale) return peekPreview(supabase, input);
  }

  const gotLock = await tryAcquireLock(supabase, input.organizationId, urlHash);
  if (!gotLock) {
    return { state: "capturing", capturedAt: null, isStale: false, signedImageUrl: null, signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit), finalUrl: null };
  }

  try {
    const provider = new PlaywrightCaptureProvider();
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
      await writePreview(supabase, input.organizationId, urlHash, metadata, null);
      return { state: "failed", capturedAt: metadata.capturedAt, isStale: false, signedImageUrl: null, signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit), finalUrl: null, failureReason: metadata.failureReason };
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
      await writePreview(supabase, input.organizationId, urlHash, metadata, null);
      return { state: "failed", capturedAt: metadata.capturedAt, isStale: false, signedImageUrl: null, signals: mergeSignals([], input.open24Hours, input.hasCompletedAudit), finalUrl: capture.finalUrl, failureReason: reason };
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
    const { error } = await writePreview(supabase, input.organizationId, urlHash, metadata, capture.screenshotBuffer as Buffer);
    if (error) {
      return { state: "failed", capturedAt: metadata.capturedAt, isStale: false, signedImageUrl: null, signals: mergeSignals(websiteSignals, input.open24Hours, input.hasCompletedAudit), finalUrl: capture.finalUrl, failureReason: "STORAGE_WRITE_FAILED" };
    }

    const signedImageUrl = await signPreviewImageUrl(supabase, input.organizationId, urlHash);
    return {
      state: "available",
      capturedAt: metadata.capturedAt,
      isStale: false,
      signedImageUrl,
      signals: mergeSignals(websiteSignals, input.open24Hours, input.hasCompletedAudit),
      finalUrl: capture.finalUrl
    };
  } finally {
    await releaseLock(supabase, input.organizationId, urlHash);
  }
}
