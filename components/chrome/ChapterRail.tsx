"use client";

import React, { useEffect, useState } from "react";
import { RAIL_CHAPTERS } from "@/content/chapters";
import { useLenisScroll } from "./SmoothScroll";

export const ChapterRail: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>("cover");
  const [visited, setVisited] = useState<Set<string>>(new Set(["cover"]));
  const { scrollTo: lenisScrollTo } = useLenisScroll();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      for (let i = RAIL_CHAPTERS.length - 1; i >= 0; i--) {
        const item = RAIL_CHAPTERS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveChapter(item.id);
            setVisited((prev) => {
              const next = new Set(prev);
              for (let j = 0; j <= i; j++) {
                next.add(RAIL_CHAPTERS[j].id);
              }
              return next;
            });
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      lenisScrollTo(el);
    } else {
      lenisScrollTo(`#${id}`);
    }
  };

  return (
    <nav
      aria-label="Chapter navigation rail"
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2.5 py-4 px-2 border-r border-gold/30"
    >
      {RAIL_CHAPTERS.map((ch) => {
        const isActive = activeChapter === ch.id;
        const isVisited = visited.has(ch.id);

        return (
          <button
            key={ch.id}
            onClick={() => handleNavClick(ch.id)}
            title={`${ch.numeral}: ${ch.label}`}
            aria-label={`Go to Chapter ${ch.numeral} — ${ch.label}`}
            className="group relative flex items-center justify-end w-8 h-5 transition-transform focus-visible:ring-1 focus-visible:ring-gold"
          >
            {/* Tick Mark */}
            <span
              className={`inline-block h-[1px] transition-all duration-200 ${
                isActive
                  ? "w-4 bg-gold shadow-xs"
                  : isVisited
                  ? "w-2.5 bg-ink/50"
                  : "w-1.5 bg-ink/20"
              }`}
            />

            <span
              className={`font-mono text-[9px] tabular-nums ml-1.5 transition-colors duration-240 ${
                isActive
                  ? "text-gold font-bold scale-110"
                  : isVisited
                  ? "text-ink font-semibold"
                  : "text-ink-60"
              }`}
            >
              {ch.numeral}
            </span>

            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -left-1.5 w-1 h-1 rounded-full bg-gold animate-live-dot"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
