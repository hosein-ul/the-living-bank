"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";

const DynamicThreeIsland = dynamic(() => import("./ThreeIsland"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-paper-deep/40 rounded border border-ink/10">
      <div className="w-9 h-9 rounded-full border-2 border-gold border-t-transparent animate-spin mb-3" />
      <span className="font-mono text-xs text-ink-60 uppercase tracking-widest">
        Summoning Island Geometry...
      </span>
    </div>
  ),
});

export const S1Island: React.FC = () => {
  const content = CHAPTERS_CONTENT.s1;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const currentGloss = content.glosses[activeIdx] ?? content.glosses[0];

  const handlePillClick = (index: number) => {
    setActiveIdx(index);
    sound.playTick();
  };

  return (
    <section
      id="chapter-1"
      ref={containerRef}
      className="relative min-h-[280vh] border-t border-ink/10 bg-paper"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) with Velocity Skew */}
        <div className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-4 lg:mt-0">
          <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
              <KineticText
                text={`CHAPTER ${content.numeral} · ${content.title}`}
                as="span"
                velocityReactive={true}
                className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
              />
            </div>

            <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
              {content.copy}
            </p>

            {/* Active Structure Gloss Box with STAMP-in transition */}
            <div className="relative p-5 rounded bg-paper-deep border border-ink/15 mb-6 min-h-[120px] flex flex-col justify-center transition-all duration-300 shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-ink/10 rounded-t overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold-bright transition-all duration-300"
                  style={{ width: `${((activeIdx + 1) / 6) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGloss.label}
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -6 }}
                  transition={{ duration: 0.28, ease: EASINGS.stamp }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold text-gold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      {currentGloss.label}
                    </span>
                    <span className="font-mono text-[10px] text-ink-60 tracking-wider">
                      {activeIdx + 1} / 6
                    </span>
                  </div>
                  <p className="font-serif text-sm sm:text-base text-ink leading-relaxed">
                    {currentGloss.gloss}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Gold Fraunces Italic Takeaway */}
            <div className="border-l-2 border-gold pl-4 py-1">
              <KineticText
                text={`“${content.takeaway}”`}
                as="p"
                italicTakeaway={true}
                delay={0.15}
                className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
              />
            </div>

            {/* Interactive Gloss navigation pills */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {content.glosses.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => handlePillClick(idx)}
                  aria-label={`Inspect ${item.label}`}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-all duration-200 cursor-pointer ${
                    activeIdx === idx
                      ? "bg-gold text-paper border-gold shadow-xs font-semibold scale-105"
                      : "bg-paper-deep/60 text-ink-60 border-ink/10 hover:border-gold/50 hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
        </div>

        {/* 3D Scene Viewport (~55% desktop) */}
        <div className="w-full lg:w-[55%] h-[400px] sm:h-[480px] lg:h-[560px] relative order-1 lg:order-2 flex items-center justify-center rounded border border-ink/10 bg-paper-deep/30 shadow-inner overflow-hidden">
          <DynamicThreeIsland
            sectionTriggerId="chapter-1"
            onActiveIndexChange={(newIdx) => setActiveIdx(newIdx)}
          />
        </div>
      </div>
    </section>
  );
};
