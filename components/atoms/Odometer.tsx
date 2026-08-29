"use client";

import React from "react";

interface OdometerProps {
  value: number;
  label?: string;
  prefix?: string;
  className?: string;
}

export const Odometer: React.FC<OdometerProps> = ({
  value,
  label,
  prefix = "",
  className = "",
}) => {
  const isPositive = value >= 0;
  const displaySign = value > 0 ? "+" : value < 0 ? "-" : "";
  const absVal = Math.abs(Math.round(value));
  const formatted = `${prefix}${displaySign}${absVal.toLocaleString("en-US")}`;

  return (
    <div
      className={`inline-flex flex-col items-center px-4 py-2 bg-paper-deep border border-ink/20 rounded shadow-inner ${className}`}
    >
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 mb-0.5">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1 font-mono text-xl sm:text-2xl font-bold tabular-nums tracking-wider text-ink">
        <span className={value > 0 ? "text-gold" : value < 0 ? "text-red" : "text-ink"}>
          {formatted}
        </span>
        <span className="text-[10px] text-ink-60 font-normal">NET ETH</span>
      </div>
    </div>
  );
};
