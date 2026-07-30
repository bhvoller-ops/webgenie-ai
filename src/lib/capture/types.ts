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
}

export interface CaptureProvider {
  capture(request: CaptureRequest): Promise<CaptureResult>;
}
