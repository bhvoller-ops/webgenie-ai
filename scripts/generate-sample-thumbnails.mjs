/**
 * Regenerates the static sample-site preview thumbnails in
 * public/sample-previews/ from the real, currently-running site
 * generator -- one JPEG per SAMPLE_BUSINESSES fixture (src/lib/sitegen/
 * samples.ts). These replace what used to be always-loaded live iframes
 * on the homepage's Examples section, /samples, and the auth pages'
 * value panel (see P0 iframe-overload correction in each of those
 * files' comments) -- genuine generator output, captured once ahead of
 * time instead of re-rendered live on every page view.
 *
 * Point this at a PRODUCTION server (`next build && next start -p PORT`),
 * never `next dev` -- an earlier run against dev mode captured one
 * business's Next.js dev-mode webpack runtime error page instead of the
 * real generated site (a transient HMR/chunk-loading race while other
 * edits were in flight), and that broken screenshot shipped undetected
 * until an Impeccable finish review caught it by actually opening the
 * file. This version fails loudly instead: it waits for a real, expected
 * heading from the generated page before screenshotting, retries once,
 * and throws (stopping the whole run) rather than silently writing a
 * bad capture.
 *
 * Usage: PORT=3002 node scripts/generate-sample-thumbnails.mjs
 *   (build + start first: npm run build && npx next start -p 3002)
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const PORT = process.env.PORT || "3001";
const OUT_DIR = "public/sample-previews";

function getSampleUrls() {
  const script = `
    import { SAMPLE_BUSINESSES } from "../src/lib/sitegen/samples";
    import { demoSiteUrl } from "../src/lib/sitegen/encode";
    for (const b of SAMPLE_BUSINESSES) {
      console.log(b.id + "|" + b.name + "|" + "http://localhost:${PORT}" + demoSiteUrl(b, { by: "WebGenie AI", sample: true }));
    }
  `;
  const tmpFile = "scripts/.tmp-sample-urls.ts";
  writeFileSync(tmpFile, script);
  const out = execSync(`npx tsx ${tmpFile}`, { encoding: "utf8" });
  rmSync(tmpFile);
  return out
    .trim()
    .split("\n")
    .map((line) => {
      const [id, name, url] = line.split("|");
      return { id, name, url };
    });
}

/** Loads url and confirms the real generated page rendered (not an error
 * overlay) by waiting for the business's own name to appear as a heading.
 * Retries once on failure; throws (stopping the whole run) if it still
 * fails, rather than silently capturing whatever's on screen. */
async function loadAndVerify(page, url, businessName) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto(url, { waitUntil: "networkidle" });
    const bodyText = await page.locator("body").innerText();
    if (bodyText.includes(businessName) && !/Runtime Error|Cannot find module|Unhandled Rejection/.test(bodyText)) {
      return;
    }
    console.warn(`  retrying ${businessName} (attempt ${attempt}) -- page did not render as expected`);
    await page.waitForTimeout(1000);
  }
  throw new Error(`${businessName}: page never rendered correctly after 2 attempts (${url})`);
}

async function main() {
  const urls = getSampleUrls();
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

  for (const { id, url, name } of urls) {
    await loadAndVerify(page, url, name);
    const shortId = id.replace("sample-", "");
    const rawPath = `${OUT_DIR}/${shortId}-raw.png`;
    await page.screenshot({ path: rawPath, clip: { x: 0, y: 0, width: 1200, height: 800 } });
    await sharp(rawPath)
      .resize(800, 533, { fit: "cover", position: "top" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(`${OUT_DIR}/${shortId}.jpg`);
    rmSync(rawPath);
    console.log(`done: ${shortId}`);
  }

  await browser.close();
  console.log("all done");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
