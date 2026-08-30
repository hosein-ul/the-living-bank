"use client";

import React from "react";
import { motion } from "framer-motion";
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
  const width = 160;
  const height = 90;
  const pathD = `M 0 ${height - 18} Q ${width * 0.45} ${height - 20} ${width} 15`;

  const currentX = Math.min(1, Math.max(0, exitPressure)) * width;
  const currentY = height - (feePercent / 0.25) * (height - 20);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex justify-between items-center w-full font-mono text-[9px] uppercase tracking-wider text-ink-60 mb-1">
        <span>RESOLUTION FEE CURVE</span>
        <span className="text-red font-bold">{formatPercent(feePercent)}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
        {/* Baseline */}
        <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="#1a1a18" strokeWidth="1" opacity="0.3" />
        {/* Background Ghost Arc */}
        <path
          d={pathD}
          fill="none"
          stroke="#a33b2e"
          strokeWidth="2"
          strokeOpacity={0.25}
          strokeLinecap="round"
        />
        {/* Quadratic arc curve with motion reveal */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#a33b2e"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Active Marker Point */}
        <circle
          cx={currentX}
          cy={currentY}
          r="4"
          fill="#a33b2e"
          stroke="#f4f1ea"
          strokeWidth="1.5"
          className="transition-all duration-150"
        />
      </svg>

      <div className="flex justify-between items-center w-full font-mono text-[8px] text-ink-60 mt-1">
        <span>0.5% (Quiet)</span>
        <span>25.0% (Max Run)</span>
      </div>
    </div>
  );
};
