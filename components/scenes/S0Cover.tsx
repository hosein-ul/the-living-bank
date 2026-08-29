"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Coin } from "../atoms/Coin";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";

export const S0Cover: React.FC = () => {
  const content = CHAPTERS_CONTENT.s0;
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ambient gold dust particles in Cover background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    const height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.5,
      });
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#b08d2e";
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const scrollToNext = () => {
    const el = document.getElementById("chapter-1");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="cover"
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16 sm:py-24 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(244,241,234,0.3) 0%, rgba(233,228,216,0.85) 100%)",
      }}
    >
      {/* Canvas Gold Dust Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />

      {/* Fog gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-paper via-transparent to-paper opacity-80" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-paper/60 via-transparent to-paper/60" />

      {/* Top eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.64, ease: EASINGS.smooth }}
        className="relative z-10 pt-4"
      >
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink-60 border-b border-ink/20 pb-1 font-semibold">
          {content.eyebrow}
        </span>
      </motion.div>

      {/* Center hero */}
      <div className="relative z-10 max-w-2xl mx-auto my-auto flex flex-col items-center">
        {/* Animated $STANDARD coin */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASINGS.stamp }}
          className="mb-8"
        >
          <Coin size={140} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.2, ease: EASINGS.smooth }}
          className="font-serif text-5xl sm:text-7xl font-semibold tracking-tight text-ink mb-6"
        >
          {content.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.3, ease: EASINGS.smooth }}
          className="font-serif text-base sm:text-lg text-ink-60 leading-relaxed max-w-[36ch] mx-auto mb-10"
        >
          {content.sub}
        </motion.p>
      </div>

      {/* Bottom CTA with 900ms underline loop & Wax seal bottom-right STAMP */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <button
          onClick={scrollToNext}
          className="group flex flex-col items-center gap-2 text-ink transition-colors focus-visible:outline-gold cursor-pointer"
          aria-label="Scroll to enter the economy"
        >
          <span className="font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">
            {content.cta}
          </span>
          <span className="h-[2px] w-16 bg-gold transition-all duration-900 group-hover:w-32 animate-[pulse_900ms_ease-in-out_infinite]" />
        </button>
      </div>

      {/* Wax seal bottom-right STAMPs on load */}
      {mounted && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 pointer-events-none">
          <WaxSeal text="STANDARD" subtext="RESERVE" size={84} animateStamp />
        </div>
      )}
    </section>
  );
};
