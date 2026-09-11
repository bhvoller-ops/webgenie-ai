export interface CaptureRequest {
  url: string;
  timeoutMs?: number;
  screenshot?: boolean;
}

export interface CaptureResult {
  finalUrl: string;
  statusCode: number;
  contentType: string | null;
  html: string;
  text: string;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  language: string | null;
  screenshotBuffer?: Buffer;
  capturedAt: string;
  /**
   * Hotfix (2026-09-11, docs/history.md): true when the captured page looks
   * like a bot-detection interstitial (Cloudflare "Robot Challenge Screen"
   * and similar) rather than the target site's real content -- a real
   * production capture of georgiaroofadvisors.com returned exactly this
   * (title "Robot Challenge Screen", HTTP 202, 12 KB, 0 headings/forms/CTAs)
   * and the pipeline scored/wrote findings from it as if it were the real
   * page. Downstream code must treat a likelyBlocked capture as NOT_INSPECTED,
   * never as evidence an element is absent.
   */
  likelyBlocked: boolean;
}

export interface CaptureProvider {
  capture(request: CaptureRequest): Promise<CaptureResult>;
}
