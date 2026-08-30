"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface SplitCharsProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "div" | "span" | "p";
  className?: string;
  stagger?: number;
  triggerOnScroll?: boolean;
}

export const SplitChars: React.FC<SplitCharsProps> = ({
  text,
  as: Component = "h1",
  className = "",
  stagger = 0.03,
  triggerOnScroll = false,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;

      const chars = el.querySelectorAll(".split-char");
      if (chars.length === 0) return;

      if (triggerOnScroll) {
        gsap.fromTo(
          chars,
          {
            y: 45,
            opacity: 0,
            filter: "blur(8px)",
            rotateX: 30,
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            rotateX: 0,
            stagger,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.6,
            },
          }
        );
      } else {
        gsap.fromTo(
          chars,
          {
            y: 50,
            opacity: 0,
            filter: "blur(10px)",
            rotateX: 40,
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            rotateX: 0,
            stagger,
            duration: 0.9,
            delay: 0.15,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <Component
      ref={containerRef as unknown as React.RefObject<HTMLHeadingElement>}
      className={`inline-flex flex-wrap items-baseline perspective-800 transform-style-3d select-none ${className}`}
      aria-label={text}
    >
      {text.split(" ").map((word, wordIdx) => (
        <span
          key={wordIdx}
          className="inline-flex whitespace-nowrap overflow-hidden mr-[0.28em] last:mr-0 align-baseline py-1"
        >
          {Array.from(word).map((char, charIdx) => (
            <span
              key={charIdx}
              className="split-char inline-block will-change-transform transform-style-3d origin-bottom"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
};
