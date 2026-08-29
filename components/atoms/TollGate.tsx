"use client";

import React from "react";
import { formatPercent } from "../sim/formatters";

interface TollGateProps {
  feePercent: number; // 0.005 to 0.25
  exitPressure: number; // 0 to 1
  className?: string;
}

export const TollGate: React.FC<TollGateProps> = ({
  feePercent,
  exitPressure,
  className = "",
}) => {
  // Quadratic curve points
  const points = [];
  const width = 160;
  const height = 90;

  for (let i = 0; i <= 20; i++) {
    const p = i / 20;
    const x = p * width;
    // quadratic mapping 0.5% -> 25%
    const feeAtP = 0.005 + 0.245 * (p * p);
    const y = height - (feeAtP / 0.25) * (height - 15);
    points.push(`${x},${y}`);
  }

  const currentX = Math.min(1, Math.max(0, exitPressure)) * width;
  const currentY = height - (feePercent / 0.25) * (height - 15);

  return (
    <div className={`p-3 bg-paper rounded border border-ink/15 shadow-sm flex flex-col items-center select-none ${className}`}>
      <div className="flex justify-between items-center w-full font-mono text-[9px] uppercase tracking-wider text-ink-60 mb-1">
        <span>Resolution Fee Curve</span>
        <span className="text-red font-bold">{formatPercent(feePercent)}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
        {/* Baseline */}
        <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="#1a1a18" strokeWidth="1" opacity="0.3" />
        {/* Quadratic arc curve */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#a33b2e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Active Marker Point */}
        <circle cx={currentX} cy={currentY} r="4" fill="#a33b2e" stroke="#f4f1ea" strokeWidth="1.5" />
      </svg>

      <div className="flex justify-between items-center w-full font-mono text-[8px] text-ink-60 mt-1">
        <span>0.5% (Quiet)</span>
        <span>25.0% (Max Run)</span>
      </div>
    </div>
  );
};
