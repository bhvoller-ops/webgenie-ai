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
        faint: "#5A6377",
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
        "display-xl": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
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
