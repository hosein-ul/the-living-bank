"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Dial } from "../atoms/Dial";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";

export const S5Dial: React.FC = () => {
  const content = CHAPTERS_CONTENT.s5;
  const { m, regime, f, setRegime, advanceEpoch } = useSim((s) => ({
    m: s.m,
    regime: s.regime,
    f: s.f,
    setRegime: s.setRegime,
    advanceEpoch: s.advanceEpoch,
  }));

  const containerRef = useRef<HTMLElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleInflow = () => {
    advanceEpoch(0.35);
    setRegime("EXPANSION");
    sound.playRatchet();
  };

  const handleOutflow = () => {
    advanceEpoch(-0.75);
    setRegime("CONTRACTION");
    sound.playThud();

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 120);
  };

  return (
    <section
      id="chapter-5"
      ref={containerRef}
      className={`relative min-h-[260vh] border-t border-ink/10 bg-paper transition-transform ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.smooth }}
            className="mb-3"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              CHAPTER {content.numeral} · {content.title}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.smooth }}
            className="border-l-2 border-gold pl-4 py-1"
          >
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Stage (~56% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center order-1 lg:order-2 bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)]">
          {/* Regime Badge */}
          <div className="mb-4 flex items-center gap-2.5">
            <span className="font-mono text-[10px] sm:text-xs uppercase text-ink-60 tracking-wider font-semibold">
              Bank Regime:
            </span>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-240 shadow-sm ${
                regime === "EXPANSION"
                  ? "bg-green text-paper"
                  : "bg-red text-paper"
              }`}
            >
              {regime}
            </span>
          </div>

          {/* Monumental Brass Issuance Dial */}
          <Dial
            multiplier={m}
            isContraction={regime === "CONTRACTION"}
            flowHistory={f}
          />

          {/* Two-position Brass Lever */}
          <div className="mt-8 flex flex-col items-center w-full">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 mb-2.5 font-semibold">
              Policy Lever (INFLOW ⇄ OUTFLOW)
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleInflow}
                aria-label="Push Inflow (Small earned raise)"
                className={`flex-1 sm:flex-initial px-5 py-3 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer ${
                  regime === "EXPANSION"
                    ? "bg-green text-paper shadow-md hover:shadow-lg"
                    : "bg-paper-deep text-ink-60 border border-ink/20 hover:border-green hover:text-green"
                }`}
              >
                ▲ PUSH INFLOW (+0.25)
              </button>

              <button
                onClick={handleOutflow}
                aria-label="Pull Outflow (Instant cut & slam)"
                className={`flex-1 sm:flex-initial px-5 py-3 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer ${
                  regime === "CONTRACTION"
                    ? "bg-red text-paper shadow-md hover:shadow-lg"
                    : "bg-paper-deep text-ink-60 border border-ink/20 hover:border-red hover:text-red"
                }`}
              >
                ▼ PULL OUTFLOW (CUT 50%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
