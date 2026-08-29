"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASINGS } from "@/lib/easings";

interface WaxSealProps {
  text?: string;
  subtext?: string;
  size?: number;
  cracked?: boolean;
  animateStamp?: boolean;
  className?: string;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  text = "STANDARD",
  subtext = "RESERVE",
  size = 84,
  cracked = false,
  animateStamp = false,
  className = "",
}) => {
  const content = (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex flex-col items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_6px_16px_rgba(26,26,24,0.22)]"
      >
        <defs>
          <radialGradient id="waxGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#c9a961" />
            <stop offset="45%" stopColor="#b08d2e" />
            <stop offset="85%" stopColor="#8c6d1d" />
            <stop offset="100%" stopColor="#60490f" />
          </radialGradient>
          <radialGradient id="waxDepression" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(56,43,9,0.4)" />
          </radialGradient>
        </defs>

        {/* Organic scalloped wax edge */}
        <path
          d="M 50,4 
             C 62,3 74,10 82,18 
             C 90,26 97,38 96,50 
             C 95,62 88,74 80,82 
             C 72,90 60,97 50,96 
             C 38,95 26,88 18,80 
             C 10,72 3,60 4,50 
             C 5,38 12,26 20,18 
             C 28,10 38,5 50,4 Z"
          fill="url(#waxGrad)"
          stroke="#60490f"
          strokeWidth="1.5"
        />

        {/* Inner pressed rim */}
        <circle cx="50" cy="50" r="38" fill="url(#waxGrad)" stroke="#c9a961" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="38" fill="url(#waxDepression)" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#60490f" strokeWidth="0.8" strokeDasharray="3 1.5" />

        {/* Embossed / Debossed Text */}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="#382b09"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontWeight="800"
          fontSize="11"
          letterSpacing="1.2"
        >
          {text}
        </text>

        {subtext && (
          <text
            x="50"
            y="61"
            textAnchor="middle"
            fill="#54400e"
            fontFamily="var(--font-ibm-plex-mono), monospace"
            fontSize="6.5"
            fontWeight="600"
            letterSpacing="1.8"
          >
            {subtext}
          </text>
        )}

        {/* Dynamic Crack Lines if forfeited */}
        {cracked && (
          <g stroke="#a33b2e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 50 8 L 46 36 L 56 58 L 47 92" />
            <path d="M 46 36 L 22 46" />
            <path d="M 56 58 L 78 64" />
          </g>
        )}
      </svg>
    </div>
  );

  if (animateStamp) {
    return (
      <motion.div
        initial={{ scale: 2.2, y: -40, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: EASINGS.stamp }}
        className="inline-block"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
