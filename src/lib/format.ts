export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function scoreBand(score: number): "critical" | "weak" | "fair" | "strong" {
  if (score < 40) return "critical";
  if (score < 60) return "weak";
  if (score < 78) return "fair";
  return "strong";
}

export const BAND_HEX: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "#F87171",
  weak: "#FBBF24",
  fair: "#60A5FA",
  strong: "#34D399",
};

export const BAND_LABEL: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "Critical",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
};

export const BAND_TEXT_CLASS: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "text-signal-bad",
  weak: "text-signal-warn",
  fair: "text-signal-info",
  strong: "text-signal-good",
};

export function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
}

export function formatTokens(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
