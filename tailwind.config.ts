import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05060A",
        canvas: "#080A11",
        surface: "#0D1018",
        raised: "#12161F",
        hairline: "#1C212D",
        ink: "#EAEEF7",
        muted: "#8E97AC",
        // UI clarity correction: the previous #5A6377 measured ~2.9:1 against
        // the app's own panel/canvas surfaces -- below WCAG AA's 4.5:1 floor
        // for normal text, which is exactly why labels, metadata, and
        // secondary body copy read as barely-visible gray. #7A8298 keeps the
        // same dark, restrained authenticated-app feel but measures ~4.9:1
        // against every real surface token below (surface/raised/canvas/void),
        // clearing AA. Never use this for anything meant to communicate a
        // status on its own (use the signal.* tones as text color for that).
        faint: "#7A8298",
        iris: {
          DEFAULT: "#7C5CFF",
          soft: "#9B85FF",
          deep: "#4A2FD6",
        },
        neon: {
          DEFAULT: "#22D3EE",
          soft: "#67E8F9",
        },
        signal: {
          good: "#34D399",
          warn: "#FBBF24",
          bad: "#F87171",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Marketing/public-site scale -- unchanged, still used by the public
        // homepage and other public pages. Never applied to an authenticated
        // operational page after the UI clarity correction (see page-title /
        // section-title below for those).
        "display-xl": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        // Authenticated-app scale (UI clarity correction). A workspace page
        // title reads as a title, not a hero headline -- 26-36px, never the
        // 36-56px display-lg a marketing page earns by being the one thing
        // on the page above the fold.
        "page-title": ["clamp(1.625rem, 2.6vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "section-title": ["clamp(1.25rem, 1.6vw, 1.5rem)", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
        // UI clarity correction: the same uppercase-label role, but at a
        // legible 13px with far less tracking -- 0.6875rem/0.18em (11px,
        // heavy spacing) is what the audit flagged as "operational labels
        // around 11px" and "excessive uppercase letter spacing." Used for
        // authenticated-app labels/critical metadata; the original `eyebrow`
        // token is left as-is for any public-page usage that still wants it.
        "label-sm": ["0.8125rem", { lineHeight: "1.2", letterSpacing: "0.06em" }],
      },
      borderRadius: {
        card: "18px",
        panel: "24px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px rgba(124,92,255,0.35), 0 0 48px -12px rgba(124,92,255,0.55)",
        cyan: "0 0 0 1px rgba(34,211,238,0.3), 0 0 40px -14px rgba(34,211,238,0.5)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sweep": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(200%)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        sweep: "sweep 2.4s linear infinite",
        "pulse-ring": "pulse-ring 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
