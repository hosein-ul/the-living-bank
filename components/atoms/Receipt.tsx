"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatNumber } from "../sim/formatters";
import { EASINGS } from "@/lib/easings";

interface ReceiptProps {
  title?: string;
  lines: Array<{ label: string; value: string }>;
  highlight?: string;
  className?: string;
}

export const Receipt: React.FC<ReceiptProps> = ({
  title = "STANDARD RESERVE — SETTLEMENT RECEIPT",
  lines,
  highlight,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASINGS.stamp }}
      className={`p-4 sm:p-5 bg-[#fbf9f4] border border-dashed border-ink/30 rounded shadow-sm text-ink font-mono text-xs max-w-sm w-full select-none ${className}`}
    >
      <div className="text-center pb-2 border-b border-ink/15 mb-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 block">
          OFFICIAL SETTLEMENT
        </span>
        <span className="font-serif font-bold text-sm tracking-tight block mt-0.5">
          {title}
        </span>
      </div>

      <div className="space-y-1.5 tabular-nums">
        {lines.map((line, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px]">
            <span className="text-ink-60 uppercase">{line.label}</span>
            <span className="font-semibold text-ink">{line.value}</span>
          </div>
        ))}
      </div>

      {highlight && (
        <div className="mt-3 pt-2.5 border-t border-ink/15 text-center">
          <p className="font-serif font-bold text-xs sm:text-sm text-gold tracking-tight">
            {highlight}
          </p>
        </div>
      )}
    </motion.div>
  );
};
