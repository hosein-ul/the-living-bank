"use client";

import React, { useEffect, useState } from "react";
import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion";

export interface MultiParallaxLayerProps {
  progress?: MotionValue<number>;
  progressRange?: [number, number];
  vector: [number, number]; // [deltaX, deltaY]
  rotate?: [number, number];
  scale?: [number, number];
  opacity?: [number, number];
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const MultiParallaxLayer: React.FC<MultiParallaxLayerProps> = ({
  progress,
  progressRange = [0, 1],
  vector,
  rotate,
  scale,
  opacity,
  className = "",
  style,
  children,
}) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progress ?? fallbackProgress;

  const [isReduced, setIsReduced] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const x = useTransform(activeProgress, progressRange, [0, vector[0]]);
  const y = useTransform(activeProgress, progressRange, [0, vector[1]]);
  const r = useTransform(activeProgress, progressRange, rotate ?? [0, 0]);
  const s = useTransform(activeProgress, progressRange, scale ?? [1, 1]);
  const o = useTransform(activeProgress, progressRange, opacity ?? [1, 1]);

  if (isReduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      style={{
        x,
        y,
        rotate: rotate ? r : undefined,
        scale: scale ? s : undefined,
        opacity: opacity ? o : undefined,
        ...style,
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
