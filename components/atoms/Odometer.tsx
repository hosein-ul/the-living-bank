"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface OdometerProps {
  value: number;
  label?: string;
  prefix?: string;
  unit?: string;
  className?: string;
}

export const Odometer: React.FC<OdometerProps> = ({
  value,
  label,
  prefix = "",
  unit = "",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formattedStr = Math.floor(Math.abs(value)).toLocaleString("en-US");
  const chars = Array.from(formattedStr);

  useEffect(() => {
    if (!containerRef.current) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const digitStrips = containerRef.current.querySelectorAll(".odometer-strip");
    digitStrips.forEach((strip, idx) => {
      const digit = parseInt(strip.getAttribute("data-digit") || "0", 10);
      if (!isNaN(digit)) {
        gsap.to(strip, {
          y: -(digit * 10) + "%",
          duration: 0.8 + idx * 0.04,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });
  }, [value, formattedStr]);

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 mb-1">
          {label}
        </span>
      )}
      <div
        ref={containerRef}
        className="flex items-center font-mono font-bold tabular-nums overflow-hidden h-[1.3em] leading-[1.3em]"
      >
        {prefix && <span className="mr-0.5">{prefix}</span>}
        {chars.map((char, idx) => {
          const isDigit = /\d/.test(char);
          if (!isDigit) {
            return (
              <span key={idx} className="inline-block px-0.5 opacity-60">
                {char}
              </span>
            );
          }

          const digit = parseInt(char, 10);
          return (
            <div
              key={idx}
              className="relative inline-block overflow-hidden h-[1.3em] w-[0.62em]"
            >
              <div
                className="odometer-strip flex flex-col will-change-transform"
                data-digit={digit}
                style={{ transform: "translateY(0%)" }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    className="h-[1.3em] flex items-center justify-center"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {unit && <span className="ml-2 text-xs font-semibold text-gold opacity-90">{unit}</span>}
      </div>
    </div>
  );
};
