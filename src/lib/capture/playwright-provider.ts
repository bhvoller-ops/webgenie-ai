import { chromium } from "playwright";
import { JSDOM } from "jsdom";
import type { CaptureProvider, CaptureRequest, CaptureResult } from "./types";
import { validatePublicUrl, CAPTURE_MAX_RESPONSE_BYTES, CAPTURE_MAX_REDIRECTS } from "@/lib/security/url-validation";

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

      const page = await context.newPage();

      // Finder website-preview hardening: main-frame navigations count as
      // redirect hops (Playwright's route interceptor sees each hop of a
      // server-side redirect chain as its own request against the same
      // frame) -- capped independently of the browser's own much looser
      // default, so a redirect loop or an unusually long chain fails fast
      // and safely rather than eventually timing out.
      let mainFrameNavigations = 0;
      let responseTooLarge = false;

      await context.route("**/*", async (route) => {
        const req = route.request();
        const requestUrl = req.url();

        if (/^(data|blob|about):/i.test(requestUrl)) {
          await route.continue();
          return;
        }

        if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
          mainFrameNavigations += 1;
          if (mainFrameNavigations > CAPTURE_MAX_REDIRECTS + 1) {
            await route.abort("blockedbyclient");
            return;
          }
        }

        try {
          await validatePublicUrl(requestUrl);
        } catch {
          await route.abort("blockedbyclient");
          return;
        }

        await route.continue().catch(() => {
          // Route already handled/aborted by a concurrent handler -- ignore.
        });
      });

      // Response-size bound: inspected via the real, already-arrived
      // response headers (a route handler can't see these before deciding
      // whether to continue) -- a server that omits Content-Length isn't
      // caught here, but every response that DOES declare one over the
      // limit flags the whole capture, checked below before the result is
      // ever treated as usable.
      page.on("response", (res) => {
        const len = res.headers()["content-length"];
        if (len && Number(len) > CAPTURE_MAX_RESPONSE_BYTES) responseTooLarge = true;
      });

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
        likelyBlocked: looksLikeBotChallenge(title, wordCount, statusCode),
        responseTooLarge
      };
    } finally {
      await browser.close();
    }
  }
}
