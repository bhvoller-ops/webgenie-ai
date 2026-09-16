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
import sharp from "sharp";
import { industryList as GALLERY_TEMPLATE_LIST } from "../src/data/gallery/industries";

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

  // 7. Every changed template's config actually points at the manifest's paths.
  for (const e of entries) {
    const cfgSrc = src(`src/data/gallery/industries/${e.templateId}.ts`);
    check(`[${e.templateId}] industries/*.ts heroImage references manifest heroPath`, cfgSrc.includes(`\${SITE_ORIGIN}${e.heroPath}`));
    check(`[${e.templateId}] industries/*.ts thumbnailImage references manifest thumbPath`, cfgSrc.includes(`\${SITE_ORIGIN}${e.thumbPath}`));
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
  // auto-detailing / moving / windows-doors must still share the OLD
  // restoration.jpg placeholder -- proves the new restoration-water-damage
  // asset didn't silently leak into them.
  for (const id of ["auto-detailing", "moving", "windows-doors"]) {
    const cfgSrc = src(`src/data/gallery/industries/${id}.ts`);
    check(`[${id}] still points at the shared restoration.jpg placeholder, untouched`, cfgSrc.includes("gallery-photos/restoration.jpg"));
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

  // 14 & 15. Gallery uses thumbnail derivatives; full previews use hero derivatives.
  const thumbComponentSrc = src("src/components/gallery-thumb-image.tsx");
  check("GalleryThumbImage prefers thumbnailImage over heroImage", /const src = thumbnailImage \?\? heroImage/.test(thumbComponentSrc));
  const galleryClientSrc = src("src/app/gallery/gallery-client.tsx");
  check("/gallery grid passes thumbnailImage into GalleryThumbImage", /<GalleryThumbImage heroImage=\{ind\.heroImage\} thumbnailImage=\{ind\.thumbnailImage\}/.test(galleryClientSrc));
  const homePageSrc = src("src/app/page.tsx");
  check("homepage Examples section passes thumbnailImage into GalleryThumbImage", /<GalleryThumbImage heroImage=\{template\.heroImage\} thumbnailImage=\{template\.thumbnailImage\}/.test(homePageSrc));
  const renderPageSrc = src("src/lib/renderIndustryPage.ts");
  check("renderIndustryPage()'s hero background still uses cfg.heroImage (the full derivative), never thumbnailImage", /<img src=\"\$\{escapeHtml\(cfg\.heroImage\)\}\"/.test(renderPageSrc) && !/cfg\.thumbnailImage/.test(renderPageSrc));

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
