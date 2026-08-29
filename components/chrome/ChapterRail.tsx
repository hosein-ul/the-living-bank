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
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 py-4 px-2 bg-paper-deep/60 backdrop-blur-none border border-ink/10 rounded-full"
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
            className="group relative flex items-center justify-center w-6 h-6 rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-gold"
          >
            <span
              className={`font-mono text-[10px] tabular-nums transition-colors duration-240 ${
                isActive
                  ? "text-gold font-bold scale-110"
                  : isVisited
                  ? "text-ink font-medium"
                  : "text-ink-60"
              }`}
            >
              {ch.numeral}
            </span>

            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -left-2 w-1.5 h-1.5 rounded-full bg-gold animate-live-dot"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
