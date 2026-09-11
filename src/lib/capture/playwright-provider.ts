import { chromium } from "playwright";
import { JSDOM } from "jsdom";
import type { CaptureProvider, CaptureRequest, CaptureResult } from "./types";
import { validatePublicUrl } from "@/lib/security/url-validation";

// Hotfix (2026-09-11, docs/history.md): literal title/text signatures for
// the bot-detection interstitials real captures have actually returned in
// production -- not a general "looks suspicious" heuristic, just the known
// shapes. A real capture of georgiaroofadvisors.com returned exactly the
// first of these (title "Robot Challenge Screen", status 202, 12 KB).
const BOT_CHALLENGE_TITLE_PATTERNS = [
  /robot challenge/i,
  /just a moment/i,
  /checking your browser/i,
  /attention required/i,
  /verify you are human/i,
  /are you a human/i,
  /access denied/i
];

export function looksLikeBotChallenge(title: string | null, wordCount: number, statusCode: number): boolean {
  if (title && BOT_CHALLENGE_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return true;
  // A near-empty page (under 40 words of readable text) combined with a
  // non-2xx-success or unusual 2xx (202 Accepted is not how a real page
  // normally responds) is the same shape without a recognizable title.
  if (wordCount < 40 && (statusCode === 202 || statusCode === 403 || statusCode === 429 || statusCode === 503)) return true;
  return false;
}

function extractReadableText(document: Document): string {
  const clone = document.cloneNode(true) as Document;
  clone
    .querySelectorAll("script,style,noscript,template,svg,canvas,iframe")
    .forEach((element) => element.remove());

  const primary = clone.querySelector("main,article,[role='main']") ?? clone.body;
  return (primary?.textContent ?? "").replace(/\s+/g, " ").trim();
}

export class PlaywrightCaptureProvider implements CaptureProvider {
  async capture(request: CaptureRequest): Promise<CaptureResult> {
    const validated = await validatePublicUrl(request.url);
    const timeoutMs = request.timeoutMs ?? 30000;
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (compatible; WebGenieBot/1.0; +https://webgenie.ai)"
      });

      await context.route("**/*", async (route) => {
        const requestUrl = route.request().url();

        if (/^(data|blob|about):/i.test(requestUrl)) {
          await route.continue();
          return;
        }

        try {
          await validatePublicUrl(requestUrl);
          await route.continue();
        } catch {
          await route.abort("blockedbyclient");
        }
      });

      const page = await context.newPage();
      const response = await page.goto(validated.normalizedUrl, {
        waitUntil: "domcontentloaded",
        timeout: timeoutMs
      });

      await page.waitForTimeout(1500);

      const html = await page.content();
      const finalUrl = page.url();
      await validatePublicUrl(finalUrl);

      const dom = new JSDOM(html, { url: finalUrl });
      const document = dom.window.document;
      const readableText = extractReadableText(document);

      const title = document.querySelector("title")?.textContent?.trim() || null;
      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() || null;
      const canonicalUrl =
        document.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
        null;
      const language = document.documentElement.getAttribute("lang")?.trim() || null;
      const screenshotBuffer = request.screenshot
        ? await page.screenshot({ fullPage: true, type: "png" })
        : undefined;
      const statusCode = response?.status() ?? 0;
      const wordCount = readableText.split(/\s+/).filter(Boolean).length;

      return {
        finalUrl,
        statusCode,
        contentType: response?.headers()["content-type"] ?? null,
        html,
        text: readableText,
        title,
        description,
        canonicalUrl,
        language,
        screenshotBuffer,
        capturedAt: new Date().toISOString(),
        likelyBlocked: looksLikeBotChallenge(title, wordCount, statusCode)
      };
    } finally {
      await browser.close();
    }
  }
}
