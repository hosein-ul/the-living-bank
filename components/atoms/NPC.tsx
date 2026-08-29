"use client";

import React from "react";
import { motion } from "framer-motion";

export type NPCState = "idle" | "agitated" | "running" | "staying" | "sleeping";

interface NPCProps {
  id: number;
  state: NPCState;
  deskLabel?: string;
  hasMug?: boolean;
  mugLevel?: number; // 0 to 1
  className?: string;
}

export const NPC: React.FC<NPCProps> = ({
  id,
  state,
  deskLabel,
  hasMug = true,
  mugLevel = 0,
  className = "",
}) => {
  const isSleeping = state === "sleeping";
  const isRunning = state === "running";
  const isStaying = state === "staying";
  const isAgitated = state === "agitated";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 bg-paper rounded border border-ink/15 shadow-sm select-none transition-all duration-240 ${
        isSleeping ? "opacity-75" : ""
      } ${isRunning ? "translate-x-2 bg-red/10 border-red/40" : ""} ${
        isStaying ? "bg-gold/10 border-gold/40" : ""
      } ${className}`}
    >
      {/* Drifting Z glyphs if sleeping */}
      {isSleeping && (
        <div className="absolute -top-3 right-1 font-mono text-[10px] font-bold text-ink-60 animate-bounce">
          Z<span className="text-[8px]">z</span>
        </div>
      )}

      {/* SVG Banker & Desk Artwork */}
      <svg viewBox="0 0 60 50" className="w-12 h-10 overflow-visible">
        {/* Desk */}
        <rect x="5" y="32" width="50" height="15" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="1.2" />
        <line x1="12" y1="47" x2="12" y2="50" stroke="#1a1a18" strokeWidth="1.2" />
        <line x1="48" y1="47" x2="48" y2="50" stroke="#1a1a18" strokeWidth="1.2" />

        {/* Banker Figure */}
        {/* Head */}
        <circle
          cx={isRunning ? "34" : "30"}
          cy="12"
          r="6"
          fill={isSleeping ? "#e9e4d8" : isRunning ? "#a33b2e" : isStaying ? "#c9a961" : "#d8d2c2"}
          stroke="#1a1a18"
          strokeWidth="1.2"
        />
        {/* Torso */}
        <path
          d={
            isRunning
              ? "M 26 18 L 40 24 L 32 32 Z"
              : "M 22 18 L 38 18 L 36 32 L 24 32 Z"
          }
          fill={isRunning ? "#a33b2e" : "#1a1a18"}
          stroke="#1a1a18"
          strokeWidth="1.2"
        />

        {/* Stayers Mug on Desk */}
        {hasMug && !isRunning && (
          <g transform="translate(38, 24)">
            <rect x="0" y="0" width="7" height="8" rx="1" fill="#f4f1ea" stroke="#b08d2e" strokeWidth="1" />
            <path d="M 7 2 Q 10 4 7 6" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
            {mugLevel > 0 && (
              <rect
                x="1"
                y={8 - mugLevel * 6}
                width="5"
                height={mugLevel * 6}
                fill="#c9a961"
              />
            )}
          </g>
        )}
      </svg>

      {/* Desk label */}
      <span className="font-mono text-[8px] uppercase tracking-wider text-ink-60 mt-1">
        {deskLabel || `Banker #${id.toString().padStart(2, "0")}`}
      </span>

      {/* State badge */}
      {isStaying && (
        <span className="font-mono text-[7px] text-gold font-bold uppercase">STAYER</span>
      )}
      {isRunning && (
        <span className="font-mono text-[7px] text-red font-bold uppercase">RUNNER</span>
      )}
    </div>
  );
};
