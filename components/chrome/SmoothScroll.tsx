"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface ScrollContextValue {
  lenis: Lenis | null;
  scrollY: number;
  velocity: number;
  direction: number;
  progress: number;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
      easing?: (t: number) => number;
      onComplete?: () => void;
    }
  ) => void;
}

const defaultContextValue: ScrollContextValue = {
  lenis: null,
  scrollY: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
  scrollTo: () => {},
};

const ScrollContext = createContext<ScrollContextValue>(defaultContextValue);

// Singleton reference accessible outside React lifecycle if needed
let globalLenis: Lenis | null = null;
export const getLenis = () => globalLenis;

export const useLenisScroll = () => useContext(ScrollContext);

export interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;
    setLenisInstance(lenis);

    // 1. Synchronize Lenis scroll event with ScrollTrigger update
    lenis.on("scroll", (e: { scroll: number; velocity: number; direction: number; progress: number }) => {
      setScrollY(e.scroll);
      setVelocity(e.velocity);
      setDirection(e.direction);
      setProgress(e.progress);
      ScrollTrigger.update();
    });

    // 2. Drive Lenis RAF loop through GSAP ticker for perfect sync
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // 3. Disable GSAP lag smoothing to prevent visual desynchronization
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        easing?: (t: number) => number;
        onComplete?: () => void;
      }
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          ...options,
        });
      } else {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: "smooth" });
        } else {
          const el = typeof target === "string" ? document.querySelector(target) : target;
          el?.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    []
  );

  return (
    <ScrollContext.Provider
      value={{
        lenis: lenisInstance,
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
