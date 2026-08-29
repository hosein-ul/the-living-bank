"use client";

import React from "react";

interface CoinProps {
  size?: number;
  className?: string;
  animateSpin?: boolean;
}

export const Coin: React.FC<CoinProps> = ({ size = 120, className = "", animateSpin = true }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full drop-shadow-[0_8px_16px_rgba(26,26,24,0.12)] ${
          animateSpin ? "animate-[spin_20s_linear_infinite]" : ""
        }`}
      >
        {/* Outer rim */}
        <circle cx="50" cy="50" r="47" fill="#c9a961" stroke="#b08d2e" strokeWidth="2.5" />
        {/* Inner milled border */}
        <circle cx="50" cy="50" r="41" fill="#f4f1ea" stroke="#b08d2e" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Center seal */}
        <circle cx="50" cy="50" r="33" fill="#e9e4d8" stroke="#b08d2e" strokeWidth="1" />
        {/* Currency symbol */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill="#1a1a18"
          fontFamily="var(--font-fraunces), serif"
          fontWeight="600"
          fontSize="20"
        >
          $STD
        </text>
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fill="#b08d2e"
          fontFamily="var(--font-ibm-plex-mono), monospace"
          fontSize="5.5"
          letterSpacing="1.5"
        >
          STANDARD
        </text>
      </svg>
    </div>
  );
};
