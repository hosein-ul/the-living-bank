"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ScrollTrigger } from "@/lib/gsap";

export interface ScrollContextValue {
  scrollY: number;
  velocity: number;
  direction: number;
  progress: number;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      smooth?: boolean;
      position?: string;
      offset?: number;
      duration?: number;
    }
  ) => void;
}

const defaultContextValue: ScrollContextValue = {
  scrollY: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
  scrollTo: () => {},
};

const ScrollContext = createContext<ScrollContextValue>(defaultContextValue);

export const useSmoothScroll = () => useContext(ScrollContext);
// Backwards compatibility alias
export const useLenisScroll = () => useContext(ScrollContext);

export interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Global ScrollTrigger listener for velocity, scroll position, and direction tracking
    const rootTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        setScrollY(self.scroll());
        setVelocity(self.getVelocity());
        setDirection(self.direction);
        setProgress(self.progress);
      },
    });

    // Refresh ScrollTrigger once mounted
    ScrollTrigger.refresh();

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      rootTrigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        smooth?: boolean;
        position?: string;
        offset?: number;
        duration?: number;
      }
    ) => {
      const isSmooth = options?.smooth !== false;
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: isSmooth ? "smooth" : "instant" });
      } else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        if (el) {
          const rect = el.getBoundingClientRect();
          const targetY = window.scrollY + rect.top + (options?.offset || 0);
          window.scrollTo({ top: targetY, behavior: isSmooth ? "smooth" : "instant" });
        }
      }
    },
    []
  );

  return (
    <ScrollContext.Provider
      value={{
        scrollY,
        velocity,
        direction,
        progress,
        scrollTo,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export const ScrollProvider = SmoothScroll;

