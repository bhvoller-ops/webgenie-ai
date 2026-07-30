export interface IntelligenceCaptureInput {
  captureId: string;
  referenceId: string;
  sourceUrl: string;
  finalUrl: string;
  statusCode: number;
  contentType: string | null;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  language: string | null;
  visibleText: string;
  html: string;
  screenshotPath: string | null;
  features: {
    headings?: Array<{ level: number; text: string }>;
    ctas?: Array<{ text: string; href: string | null; element: string }>;
    forms?: Array<{ action: string | null; method: string; fieldCount: number }>;
    internalLinks?: string[];
    externalLinks?: string[];
    images?: Array<{ src: string | null; alt: string | null }>;
    schemaTypes?: string[];
    trustSignals?: string[];
  };
}
