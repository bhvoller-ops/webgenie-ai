/**
 * Minimal hex color math for the branding kit — the Gallery template path
 * (renderIndustryPage.ts) bakes colors into inline styles at render time
 * (no browser `color-mix()` available server-side, unlike the core-14 path
 * in generate.ts, which uses CSS custom properties + color-mix and needs
 * none of this). A member sets one or two brand colors in Settings; this
 * derives the light/dark tints the Gallery templates already expect.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

/** Moves each channel toward white by `amount` (0-1). */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount]);
}

/** Moves each channel toward black by `amount` (0-1). */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)]);
}

/** Guards against a corrupt/empty stored value ever reaching an inline style or CSS var. */
export function isValidHex(hex?: string | null): hex is string {
  return !!hex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

/**
 * Overrides a Gallery template's baked-in colors with the org's branding
 * kit, when set. Only primary/primaryDark/primaryLight/accent move — the
 * template's background/surface/text/textMuted stay as authored, same
 * split as generate.ts (which only ever overrides --brand/--brand-dark,
 * never --ink/--body/--muted/--line/--bg/--soft). A member who sets only a
 * primary color still gets a coherent dark/light pair, derived rather than
 * left mismatched against the template's original hue.
 */
export function applyBrandColors<
  T extends { primary: string; primaryDark: string; primaryLight: string; accent: string }
>(base: T, branding?: { primaryColor?: string | null; accentColor?: string | null }): T {
  if (!branding || (!isValidHex(branding.primaryColor) && !isValidHex(branding.accentColor))) {
    return base;
  }
  const primary = isValidHex(branding.primaryColor) ? branding.primaryColor : base.primary;
  const dark = isValidHex(branding.accentColor) ? branding.accentColor : darken(primary, 0.18);
  return {
    ...base,
    primary,
    primaryDark: dark,
    primaryLight: lighten(primary, 0.85),
    accent: dark,
  };
}
