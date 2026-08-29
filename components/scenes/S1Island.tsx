"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";

const DynamicThreeIsland = dynamic(() => import("./ThreeIsland"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] flex items-center justify-center bg-paper-deep/30 rounded border border-ink/10">
      <span className="font-mono text-xs text-ink-60 uppercase tracking-widest animate-pulse">
        Loading Island...
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
    let lastIdx = 0;
    return scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest);
      const idx = Math.min(5, Math.floor(latest * 6));
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIdx(idx);
      }
    });
  }, [scrollYProgress]);

  const currentGloss = content.glosses[activeIdx] ?? content.glosses[0];

  return (
    <section
      id="chapter-1"
      ref={containerRef}
      className="relative min-h-[240vh] border-t border-ink/10 bg-paper"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~40% desktop) */}
        <div className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0">
          <div className="mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
            {content.copy}
          </p>

          {/* Active Structure Gloss Box */}
          <div className="p-4 rounded bg-paper-deep border border-ink/15 mb-6 min-h-[96px] flex flex-col justify-center transition-all duration-240">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-gold mb-1">
              {currentGloss.label}
            </span>
            <p className="font-serif text-sm sm:text-base text-ink leading-normal">
              {currentGloss.gloss}
            </p>
          </div>

          {/* Gold Fraunces Italic Takeaway */}
          <div className="border-l-2 border-gold pl-4 py-1">
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </div>
        </div>

        {/* Stage (~60% desktop) */}
        <div className="w-full lg:w-[56%] h-[46vh] lg:h-[78vh] relative flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Label selector pill row */}
          <div className="absolute top-2 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-1.5 px-2">
            {content.glosses.map((item, index) => {
              const isSelected = activeIdx === index;
              return (
                <span
                  key={item.label}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-all duration-240 ${
                    isSelected
                      ? "bg-gold text-paper font-bold shadow-sm"
                      : "bg-paper-deep/80 text-ink-60 border border-ink/10"
                  }`}
                >
                  {item.label}
                </span>
              );
            })}
          </div>

          {/* 3D Island Canvas */}
          <div className="w-full h-full rounded border border-ink/10 overflow-hidden shadow-inner bg-[#f4f1ea]">
            <DynamicThreeIsland progress={scrollProgress} activeIndex={activeIdx} />
          </div>
        </div>
      </div>
    </section>
  );
};
