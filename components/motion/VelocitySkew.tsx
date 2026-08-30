"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useLenisScroll } from "@/components/chrome/SmoothScroll";

interface VelocitySkewProps {
  children: React.ReactNode;
  className?: string;
  maxSkew?: number; // degrees, capped at 0.3 max for subtle graphic panels only
}

export const VelocitySkew: React.FC<VelocitySkewProps> = ({
  children,
  className = "",
  maxSkew = 0.3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { velocity } = useLenisScroll();
  const skewSetterRef = useRef<Function | null>(null);
  const proxyRef = useRef<{ skew: number }>({ skew: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    skewSetterRef.current = gsap.quickSetter(containerRef.current, "skewY", "deg");
  }, []);

  useEffect(() => {
    if (!skewSetterRef.current) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    // Only apply for significant velocity, strictly capped at 0.3 deg
    if (Math.abs(velocity) < 15) return;
    const clampedMax = Math.min(0.35, maxSkew);
    const targetSkew = Math.max(-clampedMax, Math.min(clampedMax, velocity * 0.005));

    if (Math.abs(targetSkew) > 0.05) {
      proxyRef.current.skew = targetSkew;
      gsap.to(proxyRef.current, {
        skew: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          if (skewSetterRef.current) {
            skewSetterRef.current(proxyRef.current.skew);
          }
        },
      });
    }
  }, [velocity, maxSkew]);

  return (
    <div
      ref={containerRef}
      className={`will-change-transform transform-style-3d origin-center ${className}`}
    >
      {children}
    </div>
  );
};
