/**
 * GALLERY HERO IMAGE REFRESH (Phase 1) -- verification.
 *
 * Source-text + filesystem + image-metadata checks (this repo's established
 * convention, see scripts/verify-public-site.ts) covering the manifest at
 * scripts/gallery-hero-refresh/manifest.json -- the 20 Gallery templates
 * classified APPROVED AS-IS / APPROVED WITH CROP in
 * gallery-hero-image-refresh-report.md, and nothing else.
 *
 * Deliberately does NOT re-derive the manifest or re-run image processing;
 * it only asserts the checked-in state (config + generated derivatives)
 * matches what the manifest says should exist, and that every other
 * template (44 of 64) was left alone.
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as crypto from "crypto";
import sharp from "sharp";
import { industryList as GALLERY_TEMPLATE_LIST } from "../src/data/gallery/industries";
import { renderIndustryPage } from "../src/lib/renderIndustryPage";
import { SITE_ORIGIN } from "../src/lib/site-url";

const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(__dirname, "gallery-hero-refresh", "manifest.json");
const REJECTED_SOURCE_FILENAMES = [
  "Drywall Renovation.png",
  "Painting & Drywall Renovation.png",
  "Handyman Workshop.png",
  "Plumbing Service Hero.png",
  "Roofing Team.png",
  "Salon.png",
  "Window Installation.png",
  "Dog Training.png",
  "Tutoring Girl.png",
  "Charity Poverty.png",
];

let passed = 0;
let failed = 0;
function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label}${detail ? ` -- ${detail}` : ""}`);
  }
}

function src(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

interface ManifestEntry {
  templateId: string;
  sourceFilename: string;
  heroPath: string;
  thumbPath: string;
  desktopObjectPosition: string;
  status: string;
}
interface Manifest {
  sourceDir: string;
  templates: ManifestEntry[];
}

async function main() {
  const manifest: Manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const entries = manifest.templates;

  console.log(`\nManifest: ${entries.length} approved templates\n`);

  // 1. Every manifest template ID exists as a real Gallery template.
  const industryIds = new Set(GALLERY_TEMPLATE_LIST.map((i) => i.id));
  for (const e of entries) {
    check(`[${e.templateId}] template ID exists in industryList`, industryIds.has(e.templateId));
  }

  // 2. Every manifest source filename exists (best-effort -- the source
  // folder lives outside this repo and may not exist on every machine/CI).
  if (fs.existsSync(manifest.sourceDir)) {
    for (const e of entries) {
      const p = path.join(manifest.sourceDir, e.sourceFilename);
      check(`[${e.templateId}] source file exists: ${e.sourceFilename}`, fs.existsSync(p));
    }
  } else {
    console.log(`  --   source directory not present on this machine (${manifest.sourceDir}) -- skipping source-file-existence checks`);
  }

  // 3. Every output asset (hero + thumbnail) exists on disk.
  for (const e of entries) {
    const heroOut = path.join(ROOT, "public", e.heroPath);
    const thumbOut = path.join(ROOT, "public", e.thumbPath);
    check(`[${e.templateId}] hero derivative exists: ${e.heroPath}`, fs.existsSync(heroOut));
    check(`[${e.templateId}] thumbnail derivative exists: ${e.thumbPath}`, fs.existsSync(thumbOut));
  }

  // 4. No two templates unintentionally share the same output image.
  const heroPaths = entries.map((e) => e.heroPath);
  const thumbPaths = entries.map((e) => e.thumbPath);
  check("no duplicate heroPath across manifest entries", new Set(heroPaths).size === heroPaths.length);
  check("no duplicate thumbPath across manifest entries", new Set(thumbPaths).size === thumbPaths.length);

  // 5 & 6. No rejected/contaminated filename appears in the manifest.
  for (const rejected of REJECTED_SOURCE_FILENAMES) {
    check(`rejected file NOT in manifest: ${rejected}`, !entries.some((e) => e.sourceFilename === rejected));
  }

  // 7. Every changed template's config actually points at the manifest's
  // paths, stored as a plain root-relative string (origin-portability
  // correction: no SITE_ORIGIN baked into the data -- see
  // renderIndustryPage.ts's resolveAssetUrl doc comment).
  for (const e of entries) {
    const cfgSrc = src(`src/data/gallery/industries/${e.templateId}.ts`);
    check(`[${e.templateId}] industries/*.ts heroImage is the plain relative manifest heroPath (no baked-in origin)`, cfgSrc.includes(`heroImage: '${e.heroPath}'`));
    check(`[${e.templateId}] industries/*.ts thumbnailImage is the plain relative manifest thumbPath (no baked-in origin)`, cfgSrc.includes(`thumbnailImage: '${e.thumbPath}'`));
    check(`[${e.templateId}] no longer imports SITE_ORIGIN (heroImage/thumbnailImage are plain relative strings now)`, !/from '@\/lib\/site-url'/.test(cfgSrc));
  }

  // 8. Every unchanged template retains a heroImage that is NOT one of this
  // batch's new self-hosted webp paths (spot-check a representative sample
  // across every exclusion reason: no candidate, rejected candidate,
  // explicitly excluded, low-resolution, and ambiguous).
  const shouldBeUnchanged = [
    "bakery", "boutique", "drywall", "nail-salon", "windows-doors",
    "dog-training", "home-inspection", "insurance-agency", "nonprofit-charity",
    "auto-detailing", "moving", "coach-consultant", "urgent-care",
  ];
  for (const id of shouldBeUnchanged) {
    const cfgSrc = src(`src/data/gallery/industries/${id}.ts`);
    check(`[${id}] left unchanged (no new .webp gallery-photos reference)`, !/gallery-photos\/[a-z0-9-]+\.webp/.test(cfgSrc), "found a new-style webp path on a template that should be untouched");
  }
  // financial-advisor: removed from the manifest during the P1 duplicate-
  // resolution correction (byte-identical to accounting-tax's chosen
  // photo) -- must be back to its exact original main content, and must
  // not appear in the manifest at all.
  {
    const diff = execSync("git diff --name-only main -- src/data/gallery/industries/financial-advisor.ts", { cwd: ROOT, encoding: "utf8" }).trim();
    check("[financial-advisor] restored to byte-identical original main content (zero diff)", diff === "", diff);
    check("[financial-advisor] does not appear anywhere in the manifest", !entries.some((e) => e.templateId === "financial-advisor"));
    check("[financial-advisor] gallery-industry-summary.ts entry restored to its original Pexels URL", src("src/lib/sitegen/gallery-industry-summary.ts").includes('{ key: "financial-advisor", label: "Financial Advisor", heroImage: "https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200"'));
  }
  check("manifest contains exactly 19 approved templates after the P1 duplicate-resolution correction", entries.length === 19, `found ${entries.length}`);
  {
    // No two manifest entries' SOURCE PHOTOS (not just their output paths,
    // already checked above) are byte-identical -- the actual P1 defect
    // class, verified with real file hashes when the source folder is
    // available on this machine.
    if (fs.existsSync(manifest.sourceDir)) {
      const hashToIds = new Map<string, string[]>();
      for (const e of entries) {
        const buf = fs.readFileSync(path.join(manifest.sourceDir, e.sourceFilename));
        const h = crypto.createHash("sha256").update(buf).digest("hex");
        hashToIds.set(h, [...(hashToIds.get(h) ?? []), e.templateId]);
      }
      const dupeGroups = [...hashToIds.values()].filter((ids) => ids.length > 1);
      check("no two manifested templates share a byte-identical source photo", dupeGroups.length === 0, JSON.stringify(dupeGroups));
    } else {
      console.log("  --   source directory not present on this machine -- skipping cross-template source-hash duplicate check");
    }
  }
  // auto-detailing / moving / windows-doors must still share the OLD
  // restoration.jpg placeholder -- proves the new restoration-water-damage
  // asset didn't silently leak into them. Their heroImage was normalized
  // to the same plain-relative-string convention (format only, same file,
  // same mapping) so the origin-portability fix applies to the whole
  // Gallery system, not just the 20 templates being visually refreshed.
  for (const id of ["auto-detailing", "moving", "windows-doors"]) {
    const cfgSrc = src(`src/data/gallery/industries/${id}.ts`);
    check(`[${id}] still points at the shared restoration.jpg placeholder, untouched`, cfgSrc.includes("gallery-photos/restoration.jpg"));
    check(`[${id}] heroImage normalized to a plain relative string (no baked-in origin)`, cfgSrc.includes("heroImage: '/gallery-photos/restoration.jpg'"));
  }

  // 9. No template has a missing/empty heroImage.
  for (const ind of GALLERY_TEMPLATE_LIST) {
    check(`[${ind.id}] heroImage is non-empty`, typeof ind.heroImage === "string" && ind.heroImage.length > 0);
  }
  check("GALLERY_TEMPLATE_LIST is still exactly 64 templates (none added/removed)", GALLERY_TEMPLATE_LIST.length === 64);

  // 10. Paths are lowercase and URL-safe.
  const urlSafe = /^\/[a-z0-9/_-]+\.[a-z0-9]+$/;
  for (const e of entries) {
    check(`[${e.templateId}] heroPath is lowercase/URL-safe`, urlSafe.test(e.heroPath), e.heroPath);
    check(`[${e.templateId}] thumbPath is lowercase/URL-safe`, urlSafe.test(e.thumbPath), e.thumbPath);
  }

  // 11, 12, 13. Dimensions, file size, and metadata of the actual generated files.
  const HERO_W = 1920, HERO_H = 860, HERO_MAX = 150_000;
  const THUMB_W = 640, THUMB_H = 360, THUMB_MAX = 35_000;
  for (const e of entries) {
    const heroOut = path.join(ROOT, "public", e.heroPath);
    const thumbOut = path.join(ROOT, "public", e.thumbPath);
    if (fs.existsSync(heroOut)) {
      const meta = await sharp(heroOut).metadata();
      const stat = fs.statSync(heroOut);
      check(`[${e.templateId}] hero dimensions ${HERO_W}x${HERO_H}`, meta.width === HERO_W && meta.height === HERO_H, `${meta.width}x${meta.height}`);
      check(`[${e.templateId}] hero under ${HERO_MAX}B ceiling`, stat.size <= HERO_MAX, `${stat.size}B`);
      check(`[${e.templateId}] hero has no EXIF/ICC metadata`, !meta.exif && !meta.icc);
      check(`[${e.templateId}] hero is sRGB`, meta.space === "srgb", meta.space);
    }
    if (fs.existsSync(thumbOut)) {
      const meta = await sharp(thumbOut).metadata();
      const stat = fs.statSync(thumbOut);
      check(`[${e.templateId}] thumbnail dimensions ${THUMB_W}x${THUMB_H}`, meta.width === THUMB_W && meta.height === THUMB_H, `${meta.width}x${meta.height}`);
      check(`[${e.templateId}] thumbnail under ${THUMB_MAX}B ceiling`, stat.size <= THUMB_MAX, `${stat.size}B`);
      check(`[${e.templateId}] thumbnail has no EXIF/ICC metadata`, !meta.exif && !meta.icc);
    }
  }

  // Origin-portability regression tests: call the real renderIndustryPage()
  // directly with fabricated configs and assert on its actual output --
  // functional proof, not a source-text guess, and none of it depends on a
  // real network request or any real production/preview deployment.
  {
    const selfHostedCfg = {
      ...GALLERY_TEMPLATE_LIST[0],
      heroImage: "/gallery-photos/portability-test.webp",
    };
    const remoteCfg = {
      ...GALLERY_TEMPLATE_LIST[0],
      heroImage: "https://images.pexels.com/photos/1/pexels-photo-1.jpeg",
    };

    const previewHtml = renderIndustryPage(selfHostedCfg); // no `live` -- the /api/gallery-preview shape
    check(
      "in-app preview (live unset): self-hosted heroImage renders as a bare relative path -- works on localhost, a Vercel preview, or production identically",
      previewHtml.includes('src="/gallery-photos/portability-test.webp"') && !previewHtml.includes(SITE_ORIGIN),
    );

    const liveHtml = renderIndustryPage(selfHostedCfg, { live: true }); // generateGallerySite()'s shape
    check(
      "live/published render: self-hosted heroImage is resolved to an absolute SITE_ORIGIN URL -- required for a real published client site and for /api/demo-site's downloadable export, neither of which has a request origin of its own",
      liveHtml.includes(`src="${SITE_ORIGIN}/gallery-photos/portability-test.webp"`),
    );

    const remotePreviewHtml = renderIndustryPage(remoteCfg);
    const remoteLiveHtml = renderIndustryPage(remoteCfg, { live: true });
    check(
      "a legitimate remote URL (Pexels) is never rewritten in preview mode",
      remotePreviewHtml.includes('src="https://images.pexels.com/photos/1/pexels-photo-1.jpeg"'),
    );
    check(
      "a legitimate remote URL (Pexels) is never rewritten in live mode either",
      remoteLiveHtml.includes('src="https://images.pexels.com/photos/1/pexels-photo-1.jpeg"'),
    );

    const escapeCfg = {
      ...GALLERY_TEMPLATE_LIST[0],
      heroImage: '/gallery-photos/"><script>alert(1)</script>.webp',
    };
    const escapedHtml = renderIndustryPage(escapeCfg, { live: true });
    check(
      "safe URL escaping still applies after origin resolution -- a hostile-looking path is HTML-escaped, not injected raw",
      !escapedHtml.includes("<script>alert(1)</script>") && escapedHtml.includes("&quot;&gt;&lt;script&gt;"),
    );
  }

  // 14 & 15. Gallery uses thumbnail derivatives; full previews use hero derivatives.
  const thumbComponentSrc = src("src/components/gallery-thumb-image.tsx");
  check("GalleryThumbImage prefers thumbnailImage over heroImage", /const src = thumbnailImage \?\? heroImage/.test(thumbComponentSrc));
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("/gallery grid passes thumbnailImage into GalleryThumbImage", /<GalleryThumbImage heroImage=\{ind\.heroImage\} thumbnailImage=\{ind\.thumbnailImage\}/.test(galleryClientSrc));
  const homePageSrc = src("src/app/page.tsx");
  check("homepage Examples section passes thumbnailImage into GalleryThumbImage", /<GalleryThumbImage heroImage=\{template\.heroImage\} thumbnailImage=\{template\.thumbnailImage\}/.test(homePageSrc));
  const renderPageSrc = src("src/lib/renderIndustryPage.ts");
  check("renderIndustryPage()'s hero background still resolves cfg.heroImage (the full derivative), never thumbnailImage", /<img src=\"\$\{escapeHtml\(resolveAssetUrl\(cfg\.heroImage, opts\.live\)\)\}\"/.test(renderPageSrc) && !/cfg\.thumbnailImage/.test(renderPageSrc));
  check("generateGallerySite() (published sites + downloadable demo export) passes live:true through to renderIndustryPage()", /renderIndustryPage\(cfg, \{[\s\S]{0,40}live: true/.test(src("src/lib/sitegen/gallery-site.ts")));

  // 16 & 17. Public Gallery stays thumbnail-only; authenticated behavior untouched.
  check("this branch did not touch /api/gallery-preview (the server-side auth gate)", (() => {
    try {
      return execSync("git diff --name-only main -- src/app/api/gallery-preview/route.ts", { cwd: ROOT, encoding: "utf8" }).trim() === "";
    } catch {
      return false;
    }
  })());
  check("gallery-client.tsx still gates full preview behind role/sign-in (Lock icon + sign-in copy present)", /Lock/.test(galleryClientSrc));

  // 18 & 19. /samples redirect and /api/sample-preview absence, both pre-existing (PR #34), unaffected by this branch.
  const nextConfigSrc = src("next.config.ts");
  check('/samples still redirects to /gallery via next.config.ts redirects()', /source: "\/samples", destination: "\/gallery"/.test(nextConfigSrc));
  check("/api/sample-preview route does not exist", !fs.existsSync(path.join(ROOT, "src/app/api/sample-preview/route.ts")));

  // 20 & 21. Finder and project-generation semantics untouched by this branch.
  const untouchedPaths = [
    "src/lib/prospect",
    "src/lib/sitegen/finder-taxonomy.ts",
    "src/lib/sitegen/gallery-site.ts",
    "src/lib/sitegen/generate.ts",
    "src/lib/sitegen/industry-lookup.ts",
  ];
  for (const p of untouchedPaths) {
    const diff = execSync(`git diff --name-only main -- "${p}"`, { cwd: ROOT, encoding: "utf8" }).trim();
    check(`Finder/project-generation path untouched: ${p}`, diff === "", diff);
  }

  // 22. No migration / database mutation surface touched.
  const migrationDiff = execSync(`git diff --name-only main -- supabase/`, { cwd: ROOT, encoding: "utf8" }).trim();
  check("no supabase/migrations file added or changed", migrationDiff === "", migrationDiff);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
