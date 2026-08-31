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
    <div className={`relative w-full max-w-[380px] flex flex-col items-center select-none ${className}`}>
      {/* 14-Epoch Strip Chart behind the dial */}
      <div className="w-full mb-3 py-2 px-3 border-b border-gold/20 bg-transparent">
        <div className="flex justify-between items-center mb-1.5 font-mono text-[9.5px] text-ink-60 uppercase tracking-widest font-semibold">
          <span>Net Flow History (14 Epochs)</span>
          <span className={isContraction ? "text-red font-bold" : "text-green font-bold"}>
            {isContraction ? "CONTRACTION REGIME" : "EXPANSION REGIME"}
          </span>
        </div>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-14 overflow-visible">
          <defs>
            <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isContraction ? "#a33b2e" : "#b08d2e"}
                stopOpacity="0.25"
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
            stroke="#1a1a18"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.3"
          />

          {/* Flow line */}
          <polyline
            points={points}
            fill="none"
            stroke={isContraction ? "#a33b2e" : "#1a1a18"}
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
                r={isLast ? "3.5" : "2"}
                fill={isLast ? "#c9a961" : isContraction ? "#a33b2e" : "#1a1a18"}
                stroke={isLast ? "#8c6d1d" : "none"}
                strokeWidth={isLast ? "1" : "0"}
              />
            );
          })}
        </svg>
      </div>

      {/* Monumental Brass Dial SVG */}
      <div className="relative w-[300px] sm:w-[340px] h-[200px]">
        <svg viewBox="0 0 340 210" className="w-full h-full drop-shadow-[0_8px_24px_rgba(26,26,24,0.12)]">
          {/* Outer Gear Teeth on Rim */}
          {Array.from({ length: 25 }).map((_, i) => {
            const deg = -130 + (i / 24) * 260;
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = 170 + Math.cos(rad) * 155;
            const y1 = 190 + Math.sin(rad) * 155;
            const x2 = 170 + Math.cos(rad) * 163;
            const y2 = 190 + Math.sin(rad) * 163;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b08d2e" strokeWidth="2.5" />;
          })}

          {/* Outer Brass Housing Arch */}
          <path
            d="M 20 190 A 150 150 0 0 1 320 190"
            fill="none"
            stroke="#e9e4d8"
            strokeWidth="36"
          />
          <path
            d="M 20 190 A 150 150 0 0 1 320 190"
            fill="none"
            stroke="#1a1a18"
            strokeWidth="1.2"
          />

          {/* Ticks and Markings */}
          {[
            { m: "0.25×", deg: -120 },
            { m: "0.5×", deg: -90 },
            { m: "1.0×", deg: -40 },
            { m: "2.0×", deg: 20 },
            { m: "3.0×", deg: 70 },
            { m: "4.0×", deg: 120 },
          ].map((tick) => {
            const rad = (tick.deg - 90) * (Math.PI / 180);
            const x1 = 170 + Math.cos(rad) * 132;
            const y1 = 190 + Math.sin(rad) * 132;
            const x2 = 170 + Math.cos(rad) * 158;
            const y2 = 190 + Math.sin(rad) * 158;
            const tx = 170 + Math.cos(rad) * 116;
            const ty = 190 + Math.sin(rad) * 116;

            return (
              <g key={tick.deg}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a18" strokeWidth="1.8" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1a1a18"
                  fontFamily="var(--font-ibm-plex-mono), monospace"
                  fontSize="9.5"
                  fontWeight="700"
                >
                  {tick.m}
                </text>
              </g>
            );
          })}

          {/* Center Hub */}
          <circle cx="170" cy="190" r="28" fill="#c9a961" stroke="#b08d2e" strokeWidth="2.5" />
          <circle cx="170" cy="190" r="16" fill="#1a1a18" />
          <circle cx="170" cy="190" r="5" fill="#f4f1ea" />
        </svg>

        {/* Needle Arm with GSAP transition */}
        <div
          ref={needleRef}
          style={{
            transformOrigin: "50% 100%",
            transform: `rotate(${targetAngle}deg)`,
          }}
          className="absolute left-[calc(50%-3px)] top-[18px] w-[6px] h-[172px] pointer-events-none will-change-transform"
        >
          <div className="w-full h-full bg-gradient-to-t from-gold via-gold-bright to-ink rounded-t shadow-lg flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-gold border-2 border-ink -mt-1 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Multiplier Display */}
      <div className="mt-3 text-center font-mono">
        <span className="text-xs uppercase tracking-widest text-ink-60 block font-medium">
          Issuance Multiplier
        </span>
        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-ink">
          {multiplier.toFixed(2)}×
        </span>
      </div>
    </div>
  );
};
