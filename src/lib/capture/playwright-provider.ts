import { chromium } from "playwright";
import { JSDOM } from "jsdom";
import type { CaptureProvider, CaptureRequest, CaptureResult } from "./types";
import { validatePublicUrl } from "@/lib/security/url-validation";

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

      return {
        finalUrl,
        statusCode: response?.status() ?? 0,
        contentType: response?.headers()["content-type"] ?? null,
        html,
        text: readableText,
        title,
        description,
        canonicalUrl,
        language,
        screenshotBuffer,
        capturedAt: new Date().toISOString()
      };
    } finally {
      await browser.close();
    }
  }
}
