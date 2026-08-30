"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { gsap, ScrollTrigger, ScrollSmoother } from "@/lib/gsap";

export interface ScrollContextValue {
  smoother: ScrollSmoother | null;
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
  smoother: null,
  scrollY: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
  scrollTo: () => {},
};

const ScrollContext = createContext<ScrollContextValue>(defaultContextValue);

let globalSmoother: ScrollSmoother | null = null;
export const getSmoother = () => globalSmoother;

export const useSmoothScroll = () => useContext(ScrollContext);
// Backwards compatibility alias
export const useLenisScroll = () => useContext(ScrollContext);

export interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const [smootherInstance, setSmootherInstance] = useState<ScrollSmoother | null>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Create GSAP ScrollSmoother instance per official GSAP documentation
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current || "#smooth-wrapper",
      content: contentRef.current || "#smooth-content",
      smooth: isReduced ? 0 : 1.2,
      effects: true,
      smoothTouch: 0.1,
      normalizeScroll: false,
    });

    globalSmoother = smoother;
    setSmootherInstance(smoother);

    // Global ScrollTrigger listener for velocity, scroll position, and direction tracking
    const rootTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        setScrollY(self.scroll());
        setVelocity(self.getVelocity());
        setDirection(self.direction);
        setProgress(self.progress);
      },
    });

    // Refresh ScrollTrigger once smoother is initialized
    ScrollTrigger.refresh();

    return () => {
      rootTrigger.kill();
      smoother.kill();
      globalSmoother = null;
      setSmootherInstance(null);
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
      if (globalSmoother) {
        if (typeof target === "number") {
          globalSmoother.scrollTo(target, options?.smooth !== false);
        } else {
          globalSmoother.scrollTo(target, options?.smooth !== false, options?.position || "top top");
        }
      } else {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: options?.smooth === false ? "instant" : "smooth" });
        } else {
          const el = typeof target === "string" ? document.querySelector(target) : target;
          el?.scrollIntoView({ behavior: options?.smooth === false ? "instant" : "smooth" });
        }
      }
    },
    []
  );

  return (
    <ScrollContext.Provider
      value={{
        smoother: smootherInstance,
        scrollY,
        velocity,
        direction,
        progress,
        scrollTo,
      }}
    >
      <div id="smooth-wrapper" ref={wrapperRef} className="w-full">
        <div id="smooth-content" ref={contentRef} className="w-full">
          {children}
        </div>
      </div>
    </ScrollContext.Provider>
  );
};

export const ScrollProvider = SmoothScroll;
