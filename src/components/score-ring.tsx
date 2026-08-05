"use client";

import { useEffect, useState } from "react";
import { BAND_HEX, BAND_LABEL, scoreBand } from "@/lib/format";

export function ScoreRing({
  score,
  size = 220,
  stroke = 12,
  label = "Overall intelligence",
  sublabel,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState(0);

  const band = scoreBand(score);
  const color = BAND_HEX[band];
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (mounted ? score : 0) / 100);

  useEffect(() => {
    setMounted(true);
    let frame = 0;
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${score} out of 100`}>
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1C212D"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#ringGlow)"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[3.25rem] font-semibold leading-none tabular-nums tracking-tighter text-ink">
          {display}
        </div>
        <div className="mt-1 text-xs font-medium" style={{ color }}>
          {BAND_LABEL[band]}
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-ink">{label}</div>
        {sublabel ? <div className="mt-1 text-xs text-faint">{sublabel}</div> : null}
      </div>
    </div>
  );
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const color = BAND_HEX[scoreBand(score)];

  return (
    <div className={className}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${score}%` : "0%",
            backgroundColor: color,
            boxShadow: `0 0 12px -2px ${color}`,
            transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}
