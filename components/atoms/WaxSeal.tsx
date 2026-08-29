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
      className={`relative rounded-full flex flex-col items-center justify-center bg-gold border-[3px] border-[#8e6e22] shadow-[0_4px_12px_rgba(26,26,24,0.18)] select-none text-paper ${className}`}
    >
      {/* Inner pressed ring */}
      <div className="absolute inset-1.5 rounded-full border border-gold-bright/60 flex flex-col items-center justify-center p-1">
        <span className="font-serif text-[10px] sm:text-[11px] font-bold tracking-widest leading-none text-[#382b09]">
          {text}
        </span>
        {subtext && (
          <span className="font-mono text-[7px] tracking-wider uppercase opacity-90 text-[#382b09] mt-0.5">
            {subtext}
          </span>
        )}
      </div>

      {cracked && (
        <svg
          className="absolute inset-0 w-full h-full text-red pointer-events-none stroke-current"
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M 50 10 L 45 40 L 55 60 L 48 90" stroke="#a33b2e" />
          <path d="M 45 40 L 25 50" stroke="#a33b2e" />
          <path d="M 55 60 L 75 65" stroke="#a33b2e" />
        </svg>
      )}
    </div>
  );

  if (animateStamp) {
    return (
      <motion.div
        initial={{ scale: 1.6, filter: "blur(8px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.64, ease: EASINGS.stamp }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
