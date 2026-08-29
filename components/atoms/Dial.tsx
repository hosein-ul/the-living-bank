"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASINGS } from "@/lib/easings";

interface DialProps {
  multiplier: number; // 0.25 to 4.0
  isContraction: boolean;
  flowHistory: number[];
  className?: string;
}

export const Dial: React.FC<DialProps> = ({
  multiplier,
  isContraction,
  flowHistory,
  className = "",
}) => {
  // Map multiplier (0.25 to 4.0) to dial angle (-120 deg to +120 deg)
  const minM = 0.25;
  const maxM = 4.0;
  const normalized = (multiplier - minM) / (maxM - minM);
  const angle = -120 + normalized * 240;

  // 14-epoch strip chart SVG path
  const chartWidth = 280;
  const chartHeight = 60;
  const history = flowHistory.length >= 14 ? flowHistory.slice(-14) : [...Array(14 - flowHistory.length).fill(0), ...flowHistory];

  const points = history.map((val, idx) => {
    const x = (idx / 13) * chartWidth;
    // Map -1..1 to height (height - 5 to 5)
    const y = chartHeight / 2 - (val * (chartHeight / 2 - 8));
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className={`relative w-full max-w-[360px] flex flex-col items-center select-none ${className}`}>
      {/* 14-Epoch Strip Chart behind the dial */}
      <div className="w-full mb-3 p-2 bg-paper rounded border border-ink/10">
        <div className="flex justify-between items-center mb-1 font-mono text-[9px] text-ink-60 uppercase tracking-widest">
          <span>Net Flow History (14 Epochs)</span>
          <span className={isContraction ? "text-red font-semibold" : "text-green font-semibold"}>
            {isContraction ? "Defensive" : "Active"}
          </span>
        </div>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-12 overflow-visible">
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
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          {history.map((val, idx) => {
            const x = (idx / 13) * chartWidth;
            const y = chartHeight / 2 - (val * (chartHeight / 2 - 8));
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="2"
                fill={idx === 13 ? "#b08d2e" : isContraction ? "#a33b2e" : "#1a1a18"}
              />
            );
          })}
        </svg>
      </div>

      {/* Monumental Brass Dial SVG */}
      <div className="relative w-[280px] sm:w-[320px] h-[190px]">
        <svg viewBox="0 0 320 200" className="w-full h-full drop-shadow-md">
          {/* Outer Brass Housing Arch */}
          <path
            d="M 20 180 A 140 140 0 0 1 300 180"
            fill="none"
            stroke="#e9e4d8"
            strokeWidth="32"
          />
          <path
            d="M 20 180 A 140 140 0 0 1 300 180"
            fill="none"
            stroke="#1a1a18"
            strokeWidth="1"
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
            const x1 = 160 + Math.cos(rad) * 126;
            const y1 = 180 + Math.sin(rad) * 126;
            const x2 = 160 + Math.cos(rad) * 148;
            const y2 = 180 + Math.sin(rad) * 148;
            const tx = 160 + Math.cos(rad) * 110;
            const ty = 180 + Math.sin(rad) * 110;

            return (
              <g key={tick.deg}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a18" strokeWidth="1.5" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1a1a18"
                  fontFamily="var(--font-ibm-plex-mono), monospace"
                  fontSize="9"
                  fontWeight="600"
                >
                  {tick.m}
                </text>
              </g>
            );
          })}

          {/* Center Escapement Gear Hub */}
          <circle cx="160" cy="180" r="26" fill="#c9a961" stroke="#b08d2e" strokeWidth="2" />
          <circle cx="160" cy="180" r="14" fill="#1a1a18" />
          <circle cx="160" cy="180" r="4" fill="#f4f1ea" />
        </svg>

        {/* Needle Arm Layer */}
        <motion.div
          animate={{ rotate: angle }}
          transition={
            isContraction
              ? { duration: 0.24, ease: EASINGS.slam } // SLAM 240ms on cut
              : { duration: 0.42, ease: EASINGS.smooth } // Ratchet up 420ms on raise
          }
          style={{ originX: "50%", originY: "100%" }}
          className="absolute left-[calc(50%-2.5px)] top-[16px] w-[5px] h-[164px] pointer-events-none"
        >
          {/* Brass pointer needle */}
          <div className="w-full h-full bg-gradient-to-t from-gold via-gold-bright to-ink rounded-t shadow-md flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gold border border-ink -mt-1" />
          </div>
        </motion.div>
      </div>

      {/* Numerical Multiplier HUD */}
      <div className="mt-2 text-center font-mono">
        <span className="text-xs uppercase tracking-widest text-ink-60 block">
          Issuance Multiplier
        </span>
        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-ink">
          {multiplier.toFixed(2)}×
        </span>
      </div>
    </div>
  );
};
