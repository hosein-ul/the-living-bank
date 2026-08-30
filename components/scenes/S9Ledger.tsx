"use client";

import React, { useRef, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { Odometer } from "../atoms/Odometer";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export const S9Ledger: React.FC = () => {
  const content = CHAPTERS_CONTENT.s9;
  const { sCirc, burned } = useSim((s) => ({
    sCirc: s.sCirc,
    burned: s.burned,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const recapContainerRef = useRef<HTMLDivElement>(null);
  const hardCap = 1_000_000_000;
  const currentMax = hardCap - burned;

  // Staggered parallax reveal of the 5 recap frames
  useEffect(() => {
    const el = containerRef.current;
    const recap = recapContainerRef.current;
    if (!el || !recap) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const frames = recap.querySelectorAll(".recap-frame-item");
    if (frames.length === 0) return;

    const st = gsap.fromTo(
      frames,
      { opacity: 0, y: 25, filter: "grayscale(100%)" },
      {
        opacity: 1,
        y: 0,
        filter: "grayscale(0%)",
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 65%",
          end: "top 20%",
          scrub: 0.8,
        },
      }
    );

    return () => {
      st.scrollTrigger?.kill();
    };
  }, []);

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
      ref={containerRef}
      className="relative min-h-[250vh] border-t border-gold/25 bg-paper select-none overflow-hidden"
    >
      {/* Background warm light vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-ink/5" />

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~38% desktop) - ZERO text skew */}
        <div className="w-full lg:w-[38%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <div className="mb-6">
            <SplitChars
              text={content.copy}
              as="p"
              triggerOnScroll={true}
              stagger={0.015}
              className="font-serif text-lg sm:text-2xl text-ink leading-relaxed max-w-[34ch]"
            />
          </div>

          {/* Gold Fraunces Italic Takeaway */}
          <div className="border-l-2 border-gold pl-4 py-1 mb-6">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>
        </div>

        {/* Stage (~60% desktop): Two GIANT Station Odometers & Scattered Archival Cards directly on paper */}
        <div className="w-full lg:w-[60%] flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Giant Station Odometers */}
          <div className="w-full py-4 border-y border-gold/30 mb-4 space-y-4">
            {/* Circulating Supply */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-gold/20">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-60 font-bold mb-1 sm:mb-0">
                {content.labels.circulating}
              </span>
              <Odometer
                value={sCirc}
                unit="$STANDARD"
                className="text-3xl sm:text-4xl lg:text-5xl text-ink font-bold"
              />
            </div>

            {/* Burned Forever */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-gold/20">
              <span className="font-mono text-[11px] uppercase tracking-widest text-red font-bold mb-1 sm:mb-0">
                {content.labels.burned}
              </span>
              <Odometer
                value={burned}
                unit="$STANDARD"
                className="text-3xl sm:text-4xl lg:text-5xl text-red font-bold"
              />
            </div>

            {/* Hard Cap Full-Width Hairline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-ink-60 pt-1 font-mono">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink">
                HARD CAP: 1,000,000,000 → NEVER RISES
              </span>
              <span className="text-xs font-bold tabular-nums text-gold">
                MAX SUPPLY: {formatNumber(currentMax)} $STANDARD
              </span>
            </div>
          </div>

          {/* 5 Recap Frames as Scattered Polaroid-Style Archival Cards */}
          <div ref={recapContainerRef} className="w-full space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 block mb-1 font-bold">
              SESSION ACTION ARCHIVE:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recapFrames.map((frame, idx) => {
                const rotations = ["-rotate-0.5", "rotate-1", "-rotate-1", "rotate-0.5", "rotate-0"];
                const rot = rotations[idx % rotations.length];
                return (
                  <div
                    key={idx}
                    className={`recap-frame-item p-2.5 bg-paper/80 border border-gold/30 rounded-xs flex flex-col justify-between shadow-xs transition-all hover:border-gold hover:scale-102 will-change-transform ${rot} ${
                      idx === 4 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] font-bold text-ink tracking-wider">
                        {frame.title}
                      </span>
                      <span className="font-mono text-[8.5px] uppercase tracking-wider text-gold font-bold text-right ml-2 shrink-0">
                        {frame.metric}
                      </span>
                    </div>
                    <span className="font-serif text-xs text-ink-60 leading-tight">
                      {frame.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
