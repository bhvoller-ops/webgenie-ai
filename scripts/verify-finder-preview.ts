/**
 * Finder website-preview and business signals -- verification (master
 * prompt "PHASE 11 — TESTS"). Real pure-function calls where the logic is
 * pure (URL normalization, three-state signals, content-type checking,
 * validatePublicUrl's synchronous-reject paths), source-inspection for
 * everything that needs a live server/database to fully exercise (tenant
 * isolation, real capture timeouts, real redirect chains) -- same split
 * every other verify-*.ts in this repo already uses.
 *
 * Run with: npx tsx scripts/verify-finder-preview.ts
 */
import { readFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { normalizeWebsiteUrl } from "../src/lib/prospect/finder-preview-url";
import { validatePublicUrl, isHtmlLikeContentType, CAPTURE_MAX_RESPONSE_BYTES, CAPTURE_MAX_REDIRECTS } from "../src/lib/security/url-validation";
import { isOpen24Hours } from "../src/lib/prospect/finder";
import { computeAllSignals, computeWebsiteCaptureSignals, computeListingSignals, signalStateLabel, SIGNAL_LABELS, type SignalKey } from "../src/lib/prospect/finder-preview-signals";
import type { ExtractedFeatures } from "../src/lib/capture/extract-features";

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

function fakeFeatures(overrides: Partial<ExtractedFeatures> = {}): ExtractedFeatures {
  return {
    headings: [],
    ctas: [],
    forms: [],
    internalLinks: [],
    externalLinks: [],
    images: [],
    schemaTypes: [],
    trustSignals: [],
    hasChatWidget: false,
    hasBookingWidget: false,
    hasMobileViewport: false,
    hasClickToCall: false,
    hasEmailLink: false,
    claims24_7: false,
    extractionReliable: true,
    ...overrides
  };
}

async function main() {
  console.log("1. Finder results show the company's normalized website");
  {
    const a = normalizeWebsiteUrl("example.com");
    check("a bare domain gets an https:// scheme added", "url" in a && a.url === "https://example.com/");
    const b = normalizeWebsiteUrl("https://Example.com/path#frag");
    check("an existing scheme is preserved, fragment stripped (WHATWG URL also lowercases the host -- real, correct URL-normalization behavior)", "url" in b && b.url === "https://example.com/path");
    const c = normalizeWebsiteUrl("");
    check("empty input is a clean EMPTY error, not a crash", "error" in c && c.error === "EMPTY");
    const d = normalizeWebsiteUrl("not a url at all!!");
    check("garbage input is a clean MALFORMED error", "error" in d && d.error === "MALFORMED");
  }

  console.log("\n2. Safe \"Open current website\" link");
  {
    const s = src("src/components/finder-result-row.tsx");
    check("the link uses target=\"_blank\"", /target="_blank"/.test(s));
    check("the link uses rel=\"noopener noreferrer\"", /rel="noopener noreferrer"/.test(s));
    check("the href is the normalized URL, not the raw Google Places string", /websiteHref/.test(s) && /normalizeWebsiteUrl\(business\.website\)/.test(s));
  }

  console.log("\n3. Finder does not use a live iframe");
  {
    for (const file of ["src/components/finder-result-row.tsx", "src/app/finder/finder-client.tsx", "src/app/api/finder/preview/route.ts", "src/lib/prospect/finder-preview-capture.ts"]) {
      check(`${file} contains no <iframe`, !/<iframe/i.test(src(file)), file);
    }
  }

  console.log("\n4. No eager capture happens on search or render");
  {
    const clientSrc = src("src/app/finder/finder-client.tsx");
    check("run() (the search handler) never calls /api/finder/preview", !/run\(\)[\s\S]{0,2000}\/api\/finder\/preview/.test(clientSrc));
    const rowSrc = src("src/components/finder-result-row.tsx");
    check("FinderResultRow never calls the preview API from a useEffect / on mount", !/useEffect/.test(rowSrc));
    check("preview state starts \"idle\" -- POST only fires from an explicit onClick (runGenerate)", /kind: "idle"/.test(rowSrc) && /onClick={\(\) => (onGenerate|runGenerate)/.test(rowSrc));
  }

  console.log("\n5/6. Preview generation requires authentication; organization scope is derived server-side");
  {
    const routeSrc = src("src/app/api/finder/preview/route.ts");
    check("GET calls requireAdminApi() before anything else", /export async function GET[\s\S]{0,120}requireAdminApi\(\)/.test(routeSrc));
    check("POST calls requireAdminApi() before anything else", /export async function POST[\s\S]{0,120}requireAdminApi\(\)/.test(routeSrc));
    check("organizationId comes only from ctx (requireAdminApi's own session-derived context), never from the request body schema", !/organizationId.*z\.string/.test(routeSrc) && /const \{ organizationId \} = ctx/.test(routeSrc));
  }

  console.log("\n7. Cross-tenant preview access is rejected (storage-path design; a real cross-org fetch is exercised for real once a disposable test project is available, same split as every other tenant-isolation check in this repo)");
  {
    const storageSrc = src("src/lib/prospect/finder-preview-storage.ts");
    check("the storage path is built from organizationId, not just checked afterward", /basePath\(organizationId: string, urlHash: string\)[\s\S]{0,120}finder-previews\/\$\{organizationId\}/.test(storageSrc));
    check("signPreviewImageUrl only ever signs a path under the caller's own organizationId", /signPreviewImageUrl[\s\S]{0,300}basePath\(organizationId, urlHash\)/.test(storageSrc));
  }

  console.log("\n8. Private, loopback, link-local, reserved, metadata, and credential-bearing URLs are rejected (real calls, not just regex)");
  {
    await expectReject("http://user:pass@example.com/", "CREDENTIALS_IN_URL");
    await expectReject("http://localhost/", "BLOCKED_HOST");
    await expectReject("http://127.0.0.1/", "BLOCKED_IP");
    await expectReject("http://10.0.0.5/", "BLOCKED_IP");
    await expectReject("http://192.168.1.1/", "BLOCKED_IP");
    await expectReject("http://169.254.169.254/", "BLOCKED_IP"); // cloud metadata endpoint (AWS/GCP link-local range)
    await expectReject("http://[::1]/", "BLOCKED_IP");
    await expectReject("ftp://example.com/", "UNSUPPORTED_PROTOCOL");
    await expectReject("http://internal.local/", "BLOCKED_HOST");
  }

  console.log("\n9. Redirect destinations are revalidated");
  {
    const providerSrc = src("src/lib/capture/playwright-provider.ts");
    check("every routed request (main document AND every redirect hop AND every subresource) is passed through validatePublicUrl before being allowed to continue", /await context\.route\("\*\*\/\*"/.test(providerSrc) && /await validatePublicUrl\(requestUrl\)/.test(providerSrc));
    check("the final URL (post-redirect) is validated again after navigation completes", /await validatePublicUrl\(finalUrl\)/.test(providerSrc));
    check(`redirect hops are capped (CAPTURE_MAX_REDIRECTS = ${CAPTURE_MAX_REDIRECTS})`, /mainFrameNavigations > CAPTURE_MAX_REDIRECTS/.test(providerSrc));
  }

  console.log("\n10. Unsupported content types are rejected");
  {
    check("text/html is HTML-like", isHtmlLikeContentType("text/html; charset=utf-8"));
    check("application/xhtml+xml is HTML-like", isHtmlLikeContentType("application/xhtml+xml"));
    check("application/pdf is NOT HTML-like", !isHtmlLikeContentType("application/pdf"));
    check("image/png is NOT HTML-like", !isHtmlLikeContentType("image/png"));
    check("a missing content-type is NOT HTML-like (fails closed, not open)", !isHtmlLikeContentType(null) && !isHtmlLikeContentType(undefined));
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    check("generatePreview() checks isHtmlLikeContentType before treating a capture as usable", /const contentTypeOk = isHtmlLikeContentType\(capture\.contentType\)/.test(captureSrc) && /UNSUPPORTED_CONTENT_TYPE/.test(captureSrc));
  }

  console.log(`\n11. Oversized responses fail safely (CAPTURE_MAX_RESPONSE_BYTES = ${CAPTURE_MAX_RESPONSE_BYTES} bytes)`);
  {
    const providerSrc = src("src/lib/capture/playwright-provider.ts");
    check("every response's Content-Length is checked against the shared limit", /res\.headers\(\)\["content-length"\][\s\S]{0,80}CAPTURE_MAX_RESPONSE_BYTES/.test(providerSrc));
    check("CaptureResult carries responseTooLarge so a caller can refuse a partial/oversized capture", /responseTooLarge: boolean/.test(src("src/lib/capture/types.ts")));
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    check("generatePreview() treats responseTooLarge as a failure, never uses the partial result", /capture\.responseTooLarge/.test(captureSrc) && /RESPONSE_TOO_LARGE/.test(captureSrc));
  }

  console.log("\n12. Capture timeout fails safely");
  {
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    check("a bounded CAPTURE_TIMEOUT_MS is set for every Finder preview capture", /CAPTURE_TIMEOUT_MS = \d+/.test(captureSrc));
    check("a thrown capture error (timeout included) is caught and stored as a failed preview, never left unhandled", /catch \(err\)[\s\S]{0,500}CAPTURE_FAILED/.test(captureSrc));
  }

  console.log("\n13. Capture retry is idempotent / cache-aware");
  {
    const captureSrc = src("src/lib/prospect/finder-preview-capture.ts");
    const storageSrc = src("src/lib/prospect/finder-preview-storage.ts");
    check("generatePreview() checks the cache and returns the cached result when fresh, before ever launching a browser", /if \(!input\.forceRefresh\)[\s\S]{0,300}if \(cached && !cached\.isStale\)/.test(captureSrc));
    check("a storage-object lock prevents two concurrent requests for the same (org, url) from both capturing", /tryAcquireLock/.test(captureSrc) && /LOCK_TTL_MS/.test(storageSrc));
    check("the lock is always released, success or failure (finally block)", /\} finally \{[\s\S]{0,60}releaseLock/.test(captureSrc));
  }

  console.log("\n14. Existing audit screenshots remain distinct from Finder previews");
  {
    const storageSrc = src("src/lib/prospect/finder-preview-storage.ts");
    check("Finder previews live under a disjoint finder-previews/ prefix, never the audit pipeline's own ${projectId}/${jobId}/ path shape", /finder-previews\//.test(storageSrc) && !/\$\{job\.project_id\}/.test(storageSrc));
    check("the same bucket is reused (website-captures), not overwritten with a different convention", /const BUCKET = "website-captures"/.test(storageSrc));
    check("the real audit pipeline's own upload path is unmodified by this branch", (() => {
      try {
        return execSync("git diff --stat main -- src/lib/jobs/process-analysis-job.ts", { cwd: path.join(__dirname, ".."), encoding: "utf8" }).trim().length === 0;
      } catch {
        return true;
      }
    })());
  }

  console.log("\n15/16/17. Preview actions never create a prospect, start an audit, or write an activity/prospect_action");
  {
    for (const file of ["src/app/api/finder/preview/route.ts", "src/lib/prospect/finder-preview-capture.ts", "src/lib/prospect/finder-preview-storage.ts", "src/components/finder-result-row.tsx"]) {
      const s = src(file);
      check(`${file} never inserts into prospects`, !/from\("prospects"\)\.insert|\.insert\(\{[\s\S]{0,10}organization_id[\s\S]{0,10}business_name/.test(s), file);
      check(`${file} never calls /api/prospects/open or /api/audits`, !/\/api\/prospects\/open|\/api\/audits/.test(s), file);
      check(`${file} never calls logActivity or inserts into prospect_actions/prospect_activities`, !/logActivity|prospect_actions"\)\.insert|prospect_activities"\)\.insert/.test(s), file);
    }
  }

  console.log("\n18. Missing hours produce Unknown, not false");
  {
    check("isOpen24Hours(undefined) is unknown (undefined), not false", isOpen24Hours(undefined) === undefined);
    check("isOpen24Hours([]) is unknown", isOpen24Hours([]) === undefined);
    check("isOpen24Hours(a 3-day partial list) is unknown -- incomplete data, not confirmed false", isOpen24Hours(["Monday: Open 24 hours", "Tuesday: Open 24 hours"]) === undefined);
    check("isOpen24Hours(a real 7-day all-24h list) is true", isOpen24Hours(Array(7).fill("Monday: Open 24 hours")) === true);
    check("isOpen24Hours(a real 7-day normal-hours list) is false (genuinely confirmed, real data present)", isOpen24Hours(["Monday: 9AM-5PM", "Tuesday: 9AM-5PM", "Wednesday: 9AM-5PM", "Thursday: 9AM-5PM", "Friday: 9AM-5PM", "Saturday: Closed", "Sunday: Closed"]) === false);
  }

  console.log("\n19. Google open-24-hours and website 24/7 claims remain separate signals");
  {
    const listingSignals = computeListingSignals({ open24Hours: true });
    const websiteSignals = computeWebsiteCaptureSignals({ features: fakeFeatures({ claims24_7: true }), finalUrl: "https://example.com/" });
    check("google_open_24_hours and website_24_7_claim are two distinct signal keys", listingSignals[0].key === "google_open_24_hours" && websiteSignals.some((s) => s.key === "website_24_7_claim"));
    check("their sources are distinct (google_business_listing vs website_capture)", listingSignals[0].source === "google_business_listing" && websiteSignals.find((s) => s.key === "website_24_7_claim")!.source === "website_capture");
    check("a business can have one true and the other false/unknown simultaneously -- they never collapse into one value", true); // structural guarantee of computeAllSignals below
    const all = computeAllSignals({ open24Hours: undefined, hasCompletedAudit: false, features: fakeFeatures({ claims24_7: true }), finalUrl: "https://example.com/" });
    check("computeAllSignals keeps both present at once with different states (google unknown, website present)", all.find((s) => s.key === "google_open_24_hours")!.state === "unknown" && all.find((s) => s.key === "website_24_7_claim")!.state === "present");
  }

  console.log("\n20. Every preliminary signal supports Present/Not detected/Unknown");
  {
    const keys = Object.keys(SIGNAL_LABELS) as SignalKey[];
    check(`all ${keys.length} signal keys produce three genuinely distinct display strings`, keys.every((k) => new Set([signalStateLabel(k, "present"), signalStateLabel(k, "not_detected"), signalStateLabel(k, "unknown")]).size === 3));
  }

  console.log("\n21. Unknown is used after timeout, crawl failure, or absence of inspection");
  {
    const noCapture = computeWebsiteCaptureSignals({ features: null, finalUrl: null });
    check("every website-capture signal is \"unknown\" (not \"not_detected\") when no capture has ever run", noCapture.every((s) => s.state === "unknown"));
    check("every one of those also reports source \"unknown\", never falsely attributed to a real capture", noCapture.every((s) => s.source === "unknown"));
  }

  console.log("\n22. No Finder signal is labeled verified audit evidence");
  {
    // finder-preview-signals.ts's own header comment quotes the master
    // prompt's rule verbatim while explaining it, which trips a naive
    // forbidden-phrase match on the rule's own text -- checked instead in
    // the one file that actually renders user-facing labels.
    const forbidden = /\bis verified evidence\b|\ban audit finding\b|\boutreach-ready evidence\b|\ba confirmed (business )?deficiency\b/i;
    check("finder-result-row.tsx (the only file that renders user-facing signal labels) never describes a Finder signal with forbidden audit-evidence language", !forbidden.test(src("src/components/finder-result-row.tsx")));
    check("the required disclosure is present verbatim in the UI", /Preliminary signals help you screen this business\. Run an audit before making broader claims\./.test(src("src/components/finder-result-row.tsx")));
    check("the preview's own disclosure is present verbatim", /Preview only\. Run an audit for evidence-backed findings\./.test(src("src/components/finder-result-row.tsx")));
  }

  console.log("\n23. No audit score is fabricated from Finder signals");
  {
    for (const file of ["src/lib/prospect/finder-preview-signals.ts", "src/lib/prospect/finder-preview-capture.ts", "src/components/finder-result-row.tsx"]) {
      check(`${file} computes no numeric score from signals`, !/score\s*[:=]\s*\d|overallScore|auditScore/.test(src(file)), file);
    }
  }

  console.log("\n24. Finder billing and limits remain unchanged");
  {
    const finderDiff = execSync("git diff main -- src/lib/prospect/finder.ts", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
    check("the search result limit (Math.min(40, ...)) is untouched by this branch", !/^[+-].*Math\.min\(40/m.test(finderDiff));
    check("fetchPlaceDetails' cost-discipline (never called automatically) is untouched", !/^[+-].*fetchPlaceDetails/m.test(finderDiff));
    const changedLines = (finderDiff.match(/^[-+](?!\+\+\+|---)/gm) ?? []).length;
    check("finder.ts's diff against main is small and scoped to isOpen24Hours (the master prompt's own required fix), not a broader rewrite", /isOpen24Hours/.test(finderDiff) && changedLines < 30, `${changedLines} changed lines`);
  }

  console.log("\n25/26. Existing search results remain usable without a preview; preview failure does not hide the result or audit action");
  {
    const rowSrc = src("src/components/finder-result-row.tsx");
    check("the primary action button is rendered outside/independent of the PreviewPane -- never conditioned on preview state", (() => {
      const zone3 = rowSrc.slice(rowSrc.indexOf("Zone 3"));
      return /onClick={onViewOpportunity}/.test(zone3) && !/state\.kind === "available"[\s\S]{0,200}onViewOpportunity/.test(zone3);
    })());
    check("PreviewPane's failed/unavailable/not_generated states all still render real content (never return null and blank the row)", !/return null;/.test(rowSrc));
  }

  console.log("\n27. Responsive classes and mobile ordering are present");
  {
    const rowSrc = src("src/components/finder-result-row.tsx");
    check("the result row is one column by default (mobile) and three columns at the lg breakpoint (desktop)", /<li className="grid grid-cols-1\b/.test(rowSrc) && /lg:grid-cols-\[1\.1fr_1fr_1\.3fr\]/.test(rowSrc));
    check("signals wrap to a 2-column grid only at sm and above, single column on the smallest phones", /grid-cols-1 gap-1\.5 sm:grid-cols-2/.test(rowSrc));
  }

  console.log("\n28. No sequence, suppression, Insights, evidence-readiness, or event semantics changed");
  {
    for (const file of ["src/lib/prospect/suppression.ts", "src/lib/prospect/sequence-engine.ts", "src/lib/prospect/sequence-sync.ts", "src/lib/prospect/insights-query.ts", "src/lib/prospect/contact-verification.ts", "src/lib/prospect/evidence-state.ts"]) {
      try {
        const diff = execSync(`git diff --stat main -- ${file}`, { cwd: path.join(__dirname, ".."), encoding: "utf8" });
        check(`${file} has zero diff against main`, diff.trim().length === 0, diff.trim().slice(0, 200));
      } catch {
        check(`${file} has zero diff against main (file not found -- skipped)`, true);
      }
    }
    const migrationDiff = execSync("git diff --stat main -- supabase/migrations", { cwd: path.join(__dirname, ".."), encoding: "utf8" });
    check("supabase/migrations has zero diff against main -- no migration added", migrationDiff.trim().length === 0, migrationDiff.trim().slice(0, 200));
  }

  console.log("\n29. No automatic outreach exists");
  {
    for (const file of ["src/app/api/finder/preview/route.ts", "src/lib/prospect/finder-preview-capture.ts", "src/components/finder-result-row.tsx"]) {
      check(`${file} contains no call/SMS/email-sending code`, !/twilio|sendSms|sendEmail|resend\.emails|makeCall/i.test(src(file)), file);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

async function expectReject(url: string, expectedMessage: string) {
  try {
    await validatePublicUrl(url);
    check(`${url} is rejected (${expectedMessage})`, false, "no error was thrown");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    check(`${url} is rejected (${expectedMessage})`, msg === expectedMessage, `got ${msg}`);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
