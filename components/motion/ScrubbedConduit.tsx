"use client";

import React from "react";
import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion";

export interface ScrubbedConduitProps {
  d: string;
  progress?: MotionValue<number>;
  progressRange?: [number, number];
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  ghostOpacity?: number;
  showGhost?: boolean;
  viewBox?: string;
  className?: string;
  fill?: string;
  direction?: "forward" | "reverse";
  animatedGlow?: boolean;
  style?: React.CSSProperties;
}

export const ScrubbedConduit: React.FC<ScrubbedConduitProps> = ({
  d,
  progress,
  progressRange = [0, 1],
  strokeColor = "#b08d2e",
  strokeWidth = 2,
  strokeDasharray,
  ghostOpacity = 0.15,
  showGhost = true,
  viewBox = "0 0 400 60",
  className = "",
  fill = "none",
  direction = "forward",
  animatedGlow = false,
  style,
}) => {
  const fallbackProgress = useMotionValue(1);
  const activeProgress = progress ?? fallbackProgress;

  const pathLength = useTransform(
    activeProgress,
    progressRange,
    direction === "forward" ? [0, 1] : [1, 0],
    { clamp: true }
  );

  return (
    <svg
      viewBox={viewBox}
      className={`overflow-visible ${className}`}
      style={style}
    >
      {/* Background Ghost Conduit Guide */}
      {showGhost && (
        <path
          d={d}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={ghostOpacity}
          strokeDasharray={strokeDasharray}
        />
      )}

      {/* Scrubbed Dynamic Conduit Stroke */}
      <motion.path
        d={d}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        style={{
          pathLength,
        }}
      />

      {/* Optional Subtle Flow Glow Filter */}
      {animatedGlow && (
        <motion.path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          strokeOpacity={0.4}
          style={{
            pathLength,
            filter: "drop-shadow(0 0 4px rgba(176,141,46,0.5))",
          }}
        />
      )}
    </svg>
  );
};
