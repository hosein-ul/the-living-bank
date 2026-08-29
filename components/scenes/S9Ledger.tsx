"use client";

import React, { useRef } from "react";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";

export const S9Ledger: React.FC = () => {
  const content = CHAPTERS_CONTENT.s9;
  const { sCirc, burned } = useSim((s) => ({
    sCirc: s.sCirc,
    burned: s.burned,
  }));

  const hardCap = 1_000_000_000;
  const currentMax = hardCap - burned;

  const recapFrames = [
    {
      title: "01 · THE ONLY NUMBER",
      desc: "Net capital flow measured at the door. Not price, not volume.",
      metric: "Net Flow Policy Signal",
    },
    {
      title: "02 · GROWTH BURNS",
      desc: "Every expansion license purchased was 100% permanently burned.",
      metric: "Primary Supply Sink",
    },
    {
      title: "03 · DEFENSIVE TEMPER",
      desc: "Instant rate cut on negative flow. Generosity earned epoch by epoch.",
      metric: "Asymmetric Defense",
    },
    {
      title: "04 · INVERTED RUN",
      desc: "Panicking runners paid quadratic exit toll directly into stayers' mugs.",
      metric: "Patient Capital Funded",
    },
    {
      title: "05 · GHOST PURGE",
      desc: "Dormant balance forfeited. Ghost charter revoked to eliminate dilution.",
      metric: "Dilution Purged",
    },
  ];

  return (
    <section
      id="chapter-9"
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center bg-paper"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Copy Column (~40% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center">
          <div className="mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
            {content.copy}
          </p>

          <div className="border-l-2 border-gold pl-4 py-1">
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </div>
        </div>

        {/* Stage (~60% desktop): Real Scale Odometers & Slow-Mo Recap */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded border border-ink/15 shadow-sm">
          {/* Sticky Odometer Pair */}
          <div className="w-full p-5 bg-paper rounded border border-ink/20 shadow-inner mb-6 space-y-4">
            {/* Circulating Supply */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ink/10">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-semibold mb-1 sm:mb-0">
                {content.labels.circulating}
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-ink">
                {formatNumber(sCirc)} <span className="text-xs text-gold">$STD</span>
              </span>
            </div>

            {/* Burned Forever */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ink/10">
              <span className="font-mono text-xs uppercase tracking-wider text-red font-semibold mb-1 sm:mb-0">
                {content.labels.burned}
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-red">
                {formatNumber(burned)} <span className="text-xs text-red/80">$STD</span>
              </span>
            </div>

            {/* Hard Cap Ticking Down */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-ink-60 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-wider">
                HARD CAP 1,000,000,000 → NEVER RISES
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-ink">
                Current Max: {formatNumber(currentMax)} $STD
              </span>
            </div>
          </div>

          {/* 5 Recap Frames in Grayscale Paper Style */}
          <div className="w-full space-y-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 block mb-1">
              Session Action Archive
            </span>

            {recapFrames.map((frame, idx) => (
              <div
                key={idx}
                className="p-3 bg-paper rounded border border-ink/10 flex items-center justify-between hover:border-gold/40 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-ink tracking-wider">
                    {frame.title}
                  </span>
                  <span className="font-serif text-xs text-ink-60 leading-tight mt-0.5">
                    {frame.desc}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-gold font-semibold text-right ml-2 shrink-0">
                  {frame.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
