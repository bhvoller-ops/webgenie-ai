/**
 * Deterministic Gallery hero-image derivative generator.
 *
 * Reads ONLY from manifest.json's sourceDir (the read-only, untouched
 * original folder). Writes ONLY generated derivatives under this repo's
 * own public/gallery-photos/ (hero) and public/gallery-photos/thumbs/
 * (thumbnail). Never modifies a source file.
 *
 * Fails loudly (non-zero exit, no partial silent success) on:
 *   - a manifest entry whose sourceFilename doesn't exist
 *   - two manifest entries writing to the same heroPath/thumbPath
 *   - an output whose measured dimensions don't match the target exactly
 *   - an output that exceeds its file-size ceiling even at floor quality
 *
 * Run: npx tsx scripts/gallery-hero-refresh/process-images.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const MANIFEST_PATH = path.join(__dirname, "manifest.json");

const HERO_WIDTH = 1920;
const HERO_HEIGHT = 860;
const HERO_MAX_BYTES = 150_000; // report ceiling ~120KB; hard fail above this
const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 360;
const THUMB_MAX_BYTES = 35_000; // report ceiling ~25KB; hard fail above this
const QUALITY_STEPS = [82, 76, 70, 64, 58, 52]; // descending, first that fits wins

interface ManifestEntry {
  templateId: string;
  sourceFilename: string;
  outputBaseName: string;
  heroPath: string;
  thumbPath: string;
  altText: string;
  desktopObjectPosition: string;
  mobileObjectPosition: string;
  status: string;
  reviewNote: string;
}

interface Manifest {
  sourceDir: string;
  templates: ManifestEntry[];
}

interface ResultRow {
  templateId: string;
  sourceFilename: string;
  sourceDims: string;
  sourceBytes: number;
  heroDims: string;
  heroBytes: number;
  heroQuality: number;
  thumbDims: string;
  thumbBytes: number;
  thumbQuality: number;
}

function fail(message: string): never {
  console.error(`\n✗ FAILED: ${message}\n`);
  process.exit(1);
}

function loadManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_PATH)) fail(`manifest not found at ${MANIFEST_PATH}`);
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw) as Manifest;
  if (!Array.isArray(parsed.templates) || parsed.templates.length === 0) {
    fail("manifest.templates is empty or missing");
  }
  return parsed;
}

/** Maps a CSS object-position keyword string (used by the manifest / hero <img>) to sharp's crop gravity. */
function toSharpPosition(objectPosition: string): string {
  const key = objectPosition.trim().toLowerCase();
  const map: Record<string, string> = {
    center: "centre",
    "left top": "left top",
    "left center": "left",
    "center 30%": "north", // biased toward the top third
    "top center": "north",
    "left center 30%": "left",
  };
  return map[key] ?? "centre";
}

async function encodeAt(
  input: sharp.Sharp,
  width: number,
  height: number,
  position: string,
  maxBytes: number
): Promise<{ buffer: Buffer; quality: number }> {
  for (const quality of QUALITY_STEPS) {
    const buffer = await input
      .clone()
      .rotate() // auto-orient from EXIF, then metadata is dropped (no withMetadata() call)
      .resize({
        width,
        height,
        fit: "cover",
        position,
        withoutEnlargement: false, // sources are already >= target; cover-fit crops, never upscales beyond source pixels present
      })
      .toColourspace("srgb")
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (buffer.byteLength <= maxBytes) return { buffer, quality };
  }
  const lastQuality = QUALITY_STEPS[QUALITY_STEPS.length - 1];
  const finalBuffer = await input
    .clone()
    .rotate()
    .resize({ width, height, fit: "cover", position, withoutEnlargement: false })
    .toColourspace("srgb")
    .webp({ quality: lastQuality, effort: 6 })
    .toBuffer();
  return { buffer: finalBuffer, quality: lastQuality };
}

async function main() {
  const manifest = loadManifest();
  const sourceDir = manifest.sourceDir;
  if (!fs.existsSync(sourceDir)) fail(`source directory does not exist: ${sourceDir}`);

  // 1. Pre-flight: every source file must exist; no duplicate destination paths.
  const seenHero = new Map<string, string>();
  const seenThumb = new Map<string, string>();
  for (const entry of manifest.templates) {
    const sourcePath = path.join(sourceDir, entry.sourceFilename);
    if (!fs.existsSync(sourcePath)) fail(`manifest entry '${entry.templateId}' references missing source file: ${sourcePath}`);

    if (seenHero.has(entry.heroPath)) fail(`duplicate heroPath '${entry.heroPath}' used by both '${seenHero.get(entry.heroPath)}' and '${entry.templateId}'`);
    seenHero.set(entry.heroPath, entry.templateId);

    if (seenThumb.has(entry.thumbPath)) fail(`duplicate thumbPath '${entry.thumbPath}' used by both '${seenThumb.get(entry.thumbPath)}' and '${entry.templateId}'`);
    seenThumb.set(entry.thumbPath, entry.templateId);
  }

  const results: ResultRow[] = [];

  for (const entry of manifest.templates) {
    const sourcePath = path.join(sourceDir, entry.sourceFilename);
    const sourceBytes = fs.statSync(sourcePath).size;
    const sourceImage = sharp(sourcePath);
    const sourceMeta = await sourceImage.metadata();
    const sourceDims = `${sourceMeta.width}x${sourceMeta.height}`;

    const heroPosition = toSharpPosition(entry.desktopObjectPosition);
    const thumbPosition = toSharpPosition(entry.desktopObjectPosition);

    const hero = await encodeAt(sourceImage, HERO_WIDTH, HERO_HEIGHT, heroPosition, HERO_MAX_BYTES);
    const thumb = await encodeAt(sourceImage, THUMB_WIDTH, THUMB_HEIGHT, thumbPosition, THUMB_MAX_BYTES);

    if (hero.buffer.byteLength > HERO_MAX_BYTES) {
      fail(`'${entry.templateId}' hero output is ${hero.buffer.byteLength} bytes, exceeds ${HERO_MAX_BYTES}-byte ceiling even at floor quality`);
    }
    if (thumb.buffer.byteLength > THUMB_MAX_BYTES) {
      fail(`'${entry.templateId}' thumbnail output is ${thumb.buffer.byteLength} bytes, exceeds ${THUMB_MAX_BYTES}-byte ceiling even at floor quality`);
    }

    const heroMetaOut = await sharp(hero.buffer).metadata();
    const thumbMetaOut = await sharp(thumb.buffer).metadata();
    if (heroMetaOut.width !== HERO_WIDTH || heroMetaOut.height !== HERO_HEIGHT) {
      fail(`'${entry.templateId}' hero output dimensions ${heroMetaOut.width}x${heroMetaOut.height} != expected ${HERO_WIDTH}x${HERO_HEIGHT}`);
    }
    if (thumbMetaOut.width !== THUMB_WIDTH || thumbMetaOut.height !== THUMB_HEIGHT) {
      fail(`'${entry.templateId}' thumbnail output dimensions ${thumbMetaOut.width}x${thumbMetaOut.height} != expected ${THUMB_WIDTH}x${THUMB_HEIGHT}`);
    }

    const heroOutPath = path.join(REPO_ROOT, "public", entry.heroPath);
    const thumbOutPath = path.join(REPO_ROOT, "public", entry.thumbPath);
    fs.mkdirSync(path.dirname(heroOutPath), { recursive: true });
    fs.mkdirSync(path.dirname(thumbOutPath), { recursive: true });
    fs.writeFileSync(heroOutPath, hero.buffer);
    fs.writeFileSync(thumbOutPath, thumb.buffer);

    results.push({
      templateId: entry.templateId,
      sourceFilename: entry.sourceFilename,
      sourceDims,
      sourceBytes,
      heroDims: `${HERO_WIDTH}x${HERO_HEIGHT}`,
      heroBytes: hero.buffer.byteLength,
      heroQuality: hero.quality,
      thumbDims: `${THUMB_WIDTH}x${THUMB_HEIGHT}`,
      thumbBytes: thumb.buffer.byteLength,
      thumbQuality: thumb.quality,
    });
  }

  // Summary
  const totalSourceBytes = results.reduce((s, r) => s + r.sourceBytes, 0);
  const totalHeroBytes = results.reduce((s, r) => s + r.heroBytes, 0);
  const totalThumbBytes = results.reduce((s, r) => s + r.thumbBytes, 0);

  console.log("\nGallery hero-image derivative generation — optimization summary\n");
  console.log(
    results
      .map(
        (r) =>
          `${r.templateId.padEnd(20)} src ${r.sourceDims.padEnd(11)} ${(r.sourceBytes / 1024).toFixed(0).padStart(5)}KB -> hero ${r.heroDims} q${r.heroQuality} ${(r.heroBytes / 1024).toFixed(1).padStart(6)}KB, thumb ${r.thumbDims} q${r.thumbQuality} ${(r.thumbBytes / 1024).toFixed(1).padStart(6)}KB`
      )
      .join("\n")
  );
  console.log(`\nTemplates processed: ${results.length}`);
  console.log(`Total source bytes:  ${(totalSourceBytes / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total hero bytes:    ${(totalHeroBytes / 1024).toFixed(1)}KB`);
  console.log(`Total thumb bytes:   ${(totalThumbBytes / 1024).toFixed(1)}KB`);
  console.log(`Grand total shipped: ${((totalHeroBytes + totalThumbBytes) / 1024).toFixed(1)}KB\n`);
  console.log("✓ All derivatives generated deterministically, all within size/dimension limits.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
