"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { sound } from "@/lib/sound";

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
  const containerRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax transforms for copy & 3D scene container
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.02, 0.98]);

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
        <motion.div
          style={{ y: copyY }}
          className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-4 lg:mt-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.smooth }}
            className="mb-3"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
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

          {/* Active Structure Gloss Box with AnimatePresence & 3D depth */}
          <div className="relative p-5 rounded bg-paper-deep border border-ink/15 mb-6 min-h-[120px] flex flex-col justify-center transition-all duration-300 shadow-sm overflow-hidden">
            {/* Dynamic Progress indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-ink/10 rounded-t overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-bright"
                style={{ width: `${((activeIdx + 1) / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentGloss.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.28, ease: EASINGS.smooth }}
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
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.smooth }}
            className="border-l-2 border-gold pl-4 py-1"
          >
            <span className="font-serif italic text-gold text-sm sm:text-base tracking-wide block">
              &ldquo;{content.takeaway}&rdquo;
            </span>
          </motion.div>

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
        </motion.div>

        {/* 3D Scene Viewport (~55% desktop) */}
        <motion.div
          style={{ scale: sceneScale }}
          className="w-full lg:w-[55%] h-[400px] sm:h-[480px] lg:h-[560px] relative order-1 lg:order-2 flex items-center justify-center rounded border border-ink/10 bg-paper-deep/30 shadow-inner overflow-hidden"
        >
          <DynamicThreeIsland
            progress={scrollProgress}
            activeIndex={activeIdx}
          />
        </motion.div>
      </div>
    </section>
  );
};
