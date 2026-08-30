"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";

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
      className="relative min-h-[280vh] border-t border-gold/25 bg-paper select-none overflow-hidden"
    >
      {/* Background radial warm sun glow & ink vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-ink/5" />

      <div className="sticky top-0 h-screen w-full flex items-center justify-between overflow-hidden">
        {/* Full-bleed 3D Bank Scene */}
        <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center">
          <DynamicThreeIsland
            sectionTriggerId="chapter-1"
            onActiveIndexChange={(newIdx) => setActiveIdx(newIdx)}
            className="w-full h-full"
          />
        </div>

        {/* Copy Column floating over left with subtle paper gradient mask */}
        <div className="relative z-10 w-full max-w-xl lg:max-w-md xl:max-w-lg h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 pointer-events-none">
          <div className="pointer-events-auto max-w-md">
            {/* Chapter numeral with live indicator */}
            <div className="mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
              <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                CHAPTER {content.numeral} · {content.title}
              </span>
            </div>

            {/* Verbatim Copy with Per-Char Rise */}
            <div className="mb-6">
              <SplitChars
                text={content.copy}
                as="p"
                triggerOnScroll={true}
                stagger={0.015}
                className="font-serif text-lg sm:text-2xl text-ink leading-relaxed"
              />
            </div>

            {/* Active Structure Gloss with Engraved Gold Hairlines (No Grey Box) */}
            <div className="relative py-4 my-6 border-y border-gold/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {currentGloss.label}
                </span>
                <span className="font-mono text-[10px] text-ink-60 tracking-widest">
                  0{activeIdx + 1} / 06
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGloss.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.24, ease: EASINGS.stamp }}
                >
                  <p className="font-serif text-sm sm:text-base text-ink leading-relaxed">
                    {currentGloss.gloss}
                  </p>
                </motion.div>
              </AnimatePresence>
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

            {/* Engraved Architectural Feature Selectors */}
            <div className="flex flex-wrap gap-2 pt-1">
              {content.glosses.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => handlePillClick(idx)}
                  aria-label={`Inspect ${item.label}`}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                    activeIdx === idx
                      ? "border-gold bg-gold text-paper font-bold shadow-xs scale-105"
                      : "border-ink/15 text-ink-60 hover:border-gold hover:text-ink bg-paper/70 backdrop-blur-xs"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
