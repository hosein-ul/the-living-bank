"use client";

import React, { useRef, useEffect } from "react";
import { EASINGS } from "@/lib/easings";
import { gsap } from "@/lib/gsap";

interface DialProps {
  multiplier: number; // 0.25 to 4.0
  isContraction: boolean;
  flowHistory: number[];
  className?: string;
}

// Piecewise linear angle interpolation matching all dial tick marks exactly
export const getDialAngle = (multiplier: number): number => {
  const points = [
    { val: 0.25, deg: -120 },
    { val: 0.5, deg: -90 },
    { val: 1.0, deg: -40 },
    { val: 2.0, deg: 20 },
    { val: 3.0, deg: 70 },
    { val: 4.0, deg: 120 },
  ];

  if (multiplier <= points[0].val) return points[0].deg;
  if (multiplier >= points[points.length - 1].val) return points[points.length - 1].deg;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (multiplier >= p1.val && multiplier <= p2.val) {
      const t = (multiplier - p1.val) / (p2.val - p1.val);
      return p1.deg + t * (p2.deg - p1.deg);
    }
  }
  return 0;
};

export const Dial: React.FC<DialProps> = ({
  multiplier,
  isContraction,
  flowHistory,
  className = "",
}) => {
  const needleRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const targetAngle = getDialAngle(multiplier);

  useEffect(() => {
    if (!needleRef.current) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      needleRef.current.style.transform = `rotate(${targetAngle}deg)`;
      return;
    }

    if (isContraction) {
      // 240ms SLAM down
      gsap.to(needleRef.current, {
        rotate: targetAngle,
        duration: 0.24,
        ease: "power4.in",
      });
    } else {
      // Stepped 4-step ratchet up (420ms each)
      gsap.to(needleRef.current, {
        rotate: targetAngle,
        duration: 0.42,
        ease: "steps(4)",
      });
    }
  }, [targetAngle, isContraction]);

  // 14-epoch strip chart SVG path
  const chartWidth = 280;
  const chartHeight = 60;
  const history =
    flowHistory.length >= 14
      ? flowHistory.slice(-14)
      : [...Array(14 - flowHistory.length).fill(0), ...flowHistory];

  const points = history
    .map((val, idx) => {
      const x = (idx / 13) * chartWidth;
      const y = chartHeight / 2 - val * (chartHeight / 2 - 8);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  return (
    <div className={`relative w-full max-w-xl flex flex-col items-center select-none ${className}`}>
      {/* 14-Epoch Strip Chart directly on paper with hairline gold rules */}
      <div className="w-full mb-4 py-2 border-y border-gold/30">
        <div className="flex justify-between items-center mb-1 font-mono text-[10px] text-ink-60 uppercase tracking-widest font-semibold">
          <span>NET FLOW HISTORY (14 EPOCHS)</span>
          <span className={isContraction ? "text-red font-bold" : "text-green font-bold"}>
            {isContraction ? "CONTRACTION REGIME" : "EXPANSION REGIME"}
          </span>
        </div>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-12 overflow-visible">
          <defs>
            <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isContraction ? "#a33b2e" : "#b08d2e"}
                stopOpacity="0.2"
              />
              <stop
                offset="100%"
                stopColor={isContraction ? "#a33b2e" : "#b08d2e"}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#chartAreaGrad)" />

          {/* Zero baseline */}
          <line
            x1="0"
            y1={chartHeight / 2}
            x2={chartWidth}
            y2={chartHeight / 2}
            stroke="#b08d2e"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.4"
          />

          {/* Flow line */}
          <polyline
            points={points}
            fill="none"
            stroke={isContraction ? "#a33b2e" : "#b08d2e"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {history.map((val, idx) => {
            const x = (idx / 13) * chartWidth;
            const y = chartHeight / 2 - val * (chartHeight / 2 - 8);
            const isLast = idx === 13;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isLast ? "4" : "2"}
                fill={isLast ? "#c9a961" : isContraction ? "#a33b2e" : "#1a1a18"}
                stroke={isLast ? "#8c6d1d" : "none"}
                strokeWidth={isLast ? "1.5" : "0"}
              />
            );
          })}
        </svg>
      </div>

      {/* Monumental Charcoal & Gold Dial SVG */}
      <div className="relative w-[360px] sm:w-[440px] h-[240px] sm:h-[280px]">
        <svg viewBox="0 0 340 210" className="w-full h-full drop-shadow-[0_12px_36px_rgba(26,26,24,0.18)] overflow-visible">
          {/* Outer Gear Teeth on Rim */}
          {Array.from({ length: 31 }).map((_, i) => {
            const deg = -135 + (i / 30) * 270;
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = 170 + Math.cos(rad) * 154;
            const y1 = 190 + Math.sin(rad) * 154;
            const x2 = 170 + Math.cos(rad) * 163;
            const y2 = 190 + Math.sin(rad) * 163;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b08d2e" strokeWidth="2.5" />;
          })}

          {/* Outer Dark Charcoal Housing Arch */}
          <path
            d="M 20 190 A 150 150 0 0 1 320 190"
            fill="#1e1d1b"
            stroke="#c9a961"
            strokeWidth="3.5"
          />
          <path
            d="M 32 190 A 138 138 0 0 1 308 190"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />

          {/* Ticks and Gold Markings */}
          {[
            { m: "0.25×", deg: -120 },
            { m: "0.5×", deg: -90 },
            { m: "1.0×", deg: -40 },
            { m: "2.0×", deg: 20 },
            { m: "3.0×", deg: 70 },
            { m: "4.0×", deg: 120 },
          ].map((tick) => {
            const rad = (tick.deg - 90) * (Math.PI / 180);
            const x1 = 170 + Math.cos(rad) * 130;
            const y1 = 190 + Math.sin(rad) * 130;
            const x2 = 170 + Math.cos(rad) * 148;
            const y2 = 190 + Math.sin(rad) * 148;
            const tx = 170 + Math.cos(rad) * 112;
            const ty = 190 + Math.sin(rad) * 112;

            return (
              <g key={tick.deg}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e6c374" strokeWidth="2.2" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f4f1ea"
                  fontFamily="var(--font-ibm-plex-mono), monospace"
                  fontSize="10"
                  fontWeight="700"
                >
                  {tick.m}
                </text>
              </g>
            );
          })}

          {/* Center Hub */}
          <circle cx="170" cy="190" r="32" fill="#c9a961" stroke="#e6c374" strokeWidth="2.5" />
          <circle cx="170" cy="190" r="20" fill="#161514" />
          <circle cx="170" cy="190" r="6" fill="#f4f1ea" />
        </svg>

        {/* Needle Arm with GSAP transition */}
        <div
          ref={needleRef}
          style={{
            transformOrigin: "50% 100%",
            transform: `rotate(${targetAngle}deg)`,
          }}
          className="absolute left-[calc(50%-4px)] top-[14px] w-[8px] h-[198px] sm:h-[238px] pointer-events-none will-change-transform"
        >
          <div className="w-full h-full bg-gradient-to-t from-gold via-gold-bright to-paper rounded-t shadow-2xl flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-gold-bright border-2 border-ink -mt-1 shadow-md" />
          </div>
        </div>
      </div>

      {/* Multiplier Hero Display */}
      <div className="mt-4 text-center font-mono">
        <span className="text-xs uppercase tracking-widest text-ink-60 block font-bold mb-0.5">
          ISSUANCE MULTIPLIER
        </span>
        <span className="text-4xl sm:text-5xl font-bold tabular-nums text-ink">
          {multiplier.toFixed(2)}×
        </span>
      </div>
    </div>
  );
};
