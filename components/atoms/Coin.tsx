"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CoinProps {
  size?: number;
  className?: string;
  animateSpin?: boolean;
  interactiveTilt?: boolean;
}

export const Coin: React.FC<CoinProps> = ({
  size = 120,
  className = "",
  animateSpin = true,
  interactiveTilt = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), {
    stiffness: 200,
    damping: 20,
  });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactiveTilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
        perspective: 800,
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
    >
      <motion.div
        style={{
          rotateX: interactiveTilt ? rotateX : 0,
          rotateY: interactiveTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full h-full relative flex items-center justify-center"
      >
        {/* Soft shadow under coin */}
        <div
          className="absolute inset-0 rounded-full bg-ink/15 blur-md -z-10 translate-y-3 scale-95"
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(26,26,24,0.18)]"
        >
          <defs>
            <radialGradient id="coinFaceGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f4f1ea" />
              <stop offset="60%" stopColor="#e9e4d8" />
              <stop offset="100%" stopColor="#c9a961" />
            </radialGradient>
            <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c9a961" />
              <stop offset="40%" stopColor="#f4f1ea" />
              <stop offset="70%" stopColor="#b08d2e" />
              <stop offset="100%" stopColor="#8c6d1d" />
            </linearGradient>
            <linearGradient id="gleamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="65%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Outer Gold Bevel Rim */}
          <circle cx="50" cy="50" r="48" fill="url(#goldRimGrad)" stroke="#8c6d1d" strokeWidth="1" />

          {/* Milled notches */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="2"
            strokeDasharray="2 3"
            className={animateSpin ? "animate-[spin_40s_linear_infinite]" : ""}
            style={{ transformOrigin: "50px 50px" }}
          />

          {/* Inner Paper-Gold Field */}
          <circle cx="50" cy="50" r="40" fill="url(#coinFaceGrad)" stroke="#b08d2e" strokeWidth="1.2" />

          {/* Inner Decorative Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="0.75"
            strokeDasharray="4 2"
          />

          {/* Currency Symbol $STD */}
          <text
            x="50"
            y="54"
            textAnchor="middle"
            fill="#1a1a18"
            fontFamily="var(--font-fraunces), Georgia, serif"
            fontWeight="700"
            fontSize="19"
            letterSpacing="-0.5"
          >
            $STD
          </text>

          {/* Subtext */}
          <text
            x="50"
            y="68"
            textAnchor="middle"
            fill="#8c6d1d"
            fontFamily="var(--font-ibm-plex-mono), monospace"
            fontSize="5.2"
            fontWeight="600"
            letterSpacing="2"
          >
            STANDARD
          </text>

          {/* Dynamic Gleam Sweep */}
          <rect
            x="-50"
            y="-50"
            width="200"
            height="200"
            fill="url(#gleamGrad)"
            clipPath="url(#coinClip)"
            className="pointer-events-none opacity-40 animate-[spin_8s_linear_infinite]"
            style={{ transformOrigin: "50px 50px" }}
          />
          <clipPath id="coinClip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </svg>
      </motion.div>
    </motion.div>
  );
};
