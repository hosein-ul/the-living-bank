"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export interface CardStackSectionProps {
  id: string;
  index: number;
  totalChapters?: number;
  className?: string;
  stickyContentClassName?: string;
  isLast?: boolean;
  children: React.ReactNode;
}

export const CardStackSection: React.FC<CardStackSectionProps> = ({
  id,
  index,
  totalChapters = 11,
  className = "",
  stickyContentClassName = "",
  isLast = false,
  children,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isMobileOrReduced, setIsMobileOrReduced] = useState<boolean>(false);

  useEffect(() => {
    const checkMedia = () => {
      const isMobile = window.innerWidth < 768;
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setIsMobileOrReduced(isMobile || isReduced);
    };

    checkMedia();
    window.addEventListener("resize", checkMedia, { passive: true });
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const shouldAnimateExit = !isLast && index < totalChapters - 1 && !isMobileOrReduced;

  // On desktop exit phase: scale down 1.0 -> 0.92, dim opacity 1.0 -> 0.72, translate y 0 -> -36px, translateZ 0 -> -80px
  const scale = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    shouldAnimateExit ? [1.0, 1.0, 0.92] : [1.0, 1.0, 1.0]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    shouldAnimateExit ? [1.0, 1.0, 0.72] : [1.0, 1.0, 1.0]
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    shouldAnimateExit ? [0, 0, -36] : [0, 0, 0]
  );
  const translateZ = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    shouldAnimateExit ? [0, 0, -80] : [0, 0, 0]
  );
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    shouldAnimateExit
      ? [
          "0 0px 0px 0px rgba(26,26,24,0)",
          "0 0px 0px 0px rgba(26,26,24,0)",
          "0 25px 50px -12px rgba(26,26,24,0.18)",
        ]
      : [
          "0 0px 0px 0px rgba(26,26,24,0)",
          "0 0px 0px 0px rgba(26,26,24,0)",
          "0 0px 0px 0px rgba(26,26,24,0)",
        ]
  );

  return (
    <section
      id={id}
      ref={containerRef}
      style={{
        zIndex: index + 1,
      }}
      className={`relative perspective-1200 bg-paper ${className}`}
    >
      <motion.div
        style={
          isMobileOrReduced
            ? undefined
            : {
                scale,
                opacity,
                y: translateY,
                z: translateZ,
                boxShadow,
                transformOrigin: "50% 10%",
              }
        }
        className={`w-full transform-style-3d ${stickyContentClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
};
