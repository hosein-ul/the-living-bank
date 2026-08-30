"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

export const S9Ledger: React.FC = () => {
  const content = CHAPTERS_CONTENT.s9;
  const { sCirc, burned } = useSim((s) => ({
    sCirc: s.sCirc,
    burned: s.burned,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const hardCap = 1_000_000_000;
  const currentMax = hardCap - burned;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

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
      ref={containerRef as unknown as React.RefObject<HTMLElement>}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none"
    >
      {/* Layer 0: Background Ledger Ruling Grid Linework drifting [-35, -60] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-35, -60]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 900 900" className="w-[900px] h-[900px] max-w-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 50}
              x2="900"
              y2={i * 50}
              stroke="#1a1a18"
              strokeWidth="0.8"
              strokeDasharray={i % 4 === 0 ? undefined : "4 4"}
            />
          ))}
          <line x1="200" y1="0" x2="200" y2="900" stroke="#b08d2e" strokeWidth="1.2" />
          <line x1="204" y1="0" x2="204" y2="900" stroke="#b08d2e" strokeWidth="0.6" />
          <line x1="700" y1="0" x2="700" y2="900" stroke="#a33b2e" strokeWidth="1.2" />
        </svg>
      </MultiParallaxLayer>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <motion.div
          style={{ y: copyY }}
          className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <KineticText
              text={`CHAPTER ${content.numeral} · ${content.title}`}
              as="span"
              velocityReactive={true}
              className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          {/* Gold Fraunces Italic Takeaway with KineticText */}
          <div className="border-l-2 border-gold pl-4 py-1">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>
        </motion.div>

        {/* Stage (~56% desktop): Real Scale Odometers & Slow-Mo Recap */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)] order-1 lg:order-2">
          {/* Layer 2: Sticky Odometer Pair with Parallax Drift */}
          <MultiParallaxLayer
            progress={scrollYProgress}
            vector={[35, -20]}
            className="w-full"
          >
            <div className="w-full p-6 bg-paper rounded-lg border border-ink/20 shadow-inner mb-5 space-y-4">
              {/* Circulating Supply */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-ink/10">
                <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-bold mb-1 sm:mb-0">
                  {content.labels.circulating}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-ink">
                  {formatNumber(sCirc)} <span className="text-xs text-gold font-semibold">$STANDARD</span>
                </span>
              </div>

              {/* Burned Forever */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-ink/10">
                <span className="font-mono text-xs uppercase tracking-wider text-red font-bold mb-1 sm:mb-0">
                  {content.labels.burned}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-red">
                  {formatNumber(burned)} <span className="text-xs text-red/80 font-semibold">$STANDARD</span>
                </span>
              </div>

              {/* Hard Cap Ticking Down */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-ink-60 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                  HARD CAP 1,000,000,000 → NEVER RISES
                </span>
                <span className="font-mono text-xs font-bold tabular-nums text-ink">
                  Current Max: {formatNumber(currentMax)} $STANDARD
                </span>
              </div>
            </div>
          </MultiParallaxLayer>

          {/* 5 Recap Frames */}
          <div className="w-full space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 block mb-1 font-semibold">
              Session Action Archive
            </span>

            {recapFrames.map((frame, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01, borderColor: "#b08d2e" }}
                className="p-2.5 bg-paper rounded-md border border-ink/10 flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-ink tracking-wider">
                    {frame.title}
                  </span>
                  <span className="font-serif text-xs text-ink-60 leading-tight mt-0.5">
                    {frame.desc}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-gold font-bold text-right ml-2 shrink-0">
                  {frame.metric}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
