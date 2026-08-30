"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useLenisScroll } from "@/components/chrome/SmoothScroll";

interface VelocitySkewProps {
  children: React.ReactNode;
  className?: string;
  maxSkew?: number; // degrees, default 1.5
}

export const VelocitySkew: React.FC<VelocitySkewProps> = ({
  children,
  className = "",
  maxSkew = 1.5,
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

    // Calculate clamped skew based on scroll velocity
    const targetSkew = Math.max(-maxSkew, Math.min(maxSkew, velocity * 0.08));

    if (Math.abs(targetSkew) > 0.02) {
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
