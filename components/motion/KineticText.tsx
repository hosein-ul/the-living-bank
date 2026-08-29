"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { EASINGS } from "@/lib/easings";
import { useLenisScroll } from "@/components/chrome/SmoothScroll";

export interface KineticTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  velocityReactive?: boolean;
  viewportOnce?: boolean;
  italicTakeaway?: boolean;
  rotateXAmount?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  as: Component = "h2",
  className = "",
  delay = 0,
  stagger = 0.035,
  duration = 0.64,
  velocityReactive = false,
  viewportOnce = true,
  italicTakeaway = false,
  rotateXAmount = 15,
}) => {
  const words = text.split(" ");
  const { velocity } = useLenisScroll();
  const [isReduced, setIsReduced] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Velocity-reactive skew
  const rawSkew = velocityReactive && !isReduced
    ? Math.max(-4, Math.min(4, velocity * 0.04))
    : 0;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isReduced ? 0 : stagger,
        delayChildren: isReduced ? 0 : delay,
      },
    },
  };

  const wordVariants = {
    hidden: isReduced
      ? { opacity: 0 }
      : {
          y: "110%",
          rotateX: rotateXAmount,
          opacity: 0,
        },
    visible: {
      y: "0%",
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: isReduced ? 0.01 : duration,
        ease: EASINGS.smooth,
      },
    },
  };

  return (
    <Component
      className={`perspective-800 transform-style-3d ${
        italicTakeaway ? "takeaway-text" : ""
      } ${className}`}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: viewportOnce, margin: "-8% 0px" }}
        animate={
          velocityReactive && !isReduced
            ? {
                skewY: rawSkew,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }
            : undefined
        }
        className="inline-flex flex-wrap gap-x-[0.26em] transform-style-3d"
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden py-0.5 transform-style-3d align-baseline"
          >
            <motion.span
              variants={wordVariants}
              className="inline-block origin-bottom transform-style-3d will-change-transform"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
};
