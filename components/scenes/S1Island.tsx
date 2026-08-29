"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { sound } from "@/lib/sound";

const DynamicThreeIsland = dynamic(() => import("./ThreeIsland"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-paper-deep/30 rounded border border-ink/10">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin mb-3" />
      <span className="font-mono text-xs text-ink-60 uppercase tracking-widest">
        Summoning Island Geometry...
      </span>
    </div>
  ),
});

export const S1Island: React.FC = () => {
  const content = CHAPTERS_CONTENT.s1;
  const containerRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    let lastIdx = -1;
    return scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest);
      const idx = Math.min(5, Math.max(0, Math.floor(latest * 6)));
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIdx(idx);
      }
    });
  }, [scrollYProgress]);

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
        {/* Copy Column (~42% desktop) */}
        <div className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0">
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

          {/* Active Structure Gloss Box with AnimatePresence */}
          <div className="relative p-5 rounded bg-paper-deep border border-ink/15 mb-6 min-h-[110px] flex flex-col justify-center transition-all duration-300 shadow-sm">
            {/* Dynamic Progress indicator inside card */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-ink/5 rounded-t overflow-hidden">
              <motion.div
                className="h-full bg-gold"
                style={{ width: `${((activeIdx + 1) / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentGloss.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASINGS.smooth }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-gold">
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
        <div className="w-full lg:w-[56%] h-[50vh] lg:h-[78vh] relative flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Interactive Label selector pill row */}
          <div className="absolute top-3 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-1.5 px-2">
            {content.glosses.map((item, index) => {
              const isSelected = activeIdx === index;
              return (
                <button
                  key={item.label}
                  onClick={() => handlePillClick(index)}
                  className={`px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-mono tracking-wider transition-all duration-240 cursor-pointer ${
                    isSelected
                      ? "bg-gold text-paper font-bold shadow-md scale-105"
                      : "bg-paper-deep/90 hover:bg-paper-deep text-ink-60 border border-ink/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* 3D Island Canvas */}
          <div className="w-full h-full rounded border border-ink/10 overflow-hidden shadow-[0_12px_32px_rgba(26,26,24,0.06)] bg-[#f4f1ea] relative">
            <DynamicThreeIsland progress={scrollProgress} activeIndex={activeIdx} />
          </div>
        </div>
      </div>
    </section>
  );
};
