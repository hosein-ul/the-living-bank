"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coin } from "../atoms/Coin";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";

export const S0Cover: React.FC = () => {
  const content = CHAPTERS_CONTENT.s0;
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Multi-layered scroll transforms for deep parallax
  const coinY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const coinScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const coinRotate = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

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

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; pulse: number }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#b08d2e";
        ctx.globalAlpha = currentAlpha;
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
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16 sm:py-24 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(244,241,234,0.4) 0%, rgba(233,228,216,0.92) 100%)",
      }}
    >
      {/* Canvas Gold Dust Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />

      {/* Parallax Background Geometric Rings */}
      <motion.div
        style={{ y: bgParallax }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15"
      >
        <div className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full border border-gold/30 flex items-center justify-center animate-[spin_120s_linear_infinite]">
          <div className="w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-dashed border-gold/40" />
        </div>
      </motion.div>

      {/* Fog gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-paper via-transparent to-paper opacity-75" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-paper/60 via-transparent to-paper/60" />

      {/* Top eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.64, ease: EASINGS.smooth }}
        className="relative z-10 pt-4"
      >
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-ink-60 border-b border-ink/20 pb-1.5 font-semibold">
          {content.eyebrow}
        </span>
      </motion.div>

      {/* Center hero with scroll-driven parallax transform */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 max-w-2xl mx-auto my-auto flex flex-col items-center"
      >
        {/* Animated $STANDARD coin with 3D perspective and scroll rotate */}
        <motion.div
          style={{ y: coinY, scale: coinScale, rotateZ: coinRotate }}
          initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASINGS.stamp }}
          className="mb-8 cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
        >
          <Coin size={148} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.2, ease: EASINGS.smooth }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-ink mb-6 select-none"
        >
          {content.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.3, ease: EASINGS.smooth }}
          className="font-serif text-base sm:text-lg sm:leading-relaxed text-ink-60 max-w-[36ch] mx-auto mb-10"
        >
          {content.sub}
        </motion.p>
      </motion.div>

      {/* Bottom CTA with dynamic pulse & Wax seal bottom-right STAMP */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <button
          onClick={scrollToNext}
          className="group flex flex-col items-center gap-2.5 text-ink transition-colors focus-visible:outline-gold cursor-pointer"
          aria-label="Scroll to enter the economy"
        >
          <span className="font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold text-ink group-hover:text-gold transition-colors duration-300">
            {content.cta}
          </span>
          <span className="h-[2px] w-16 bg-gold transition-all duration-500 group-hover:w-36 animate-pulse" />
        </button>
      </div>

      {/* Wax seal bottom-right STAMPs on load */}
      {mounted && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 pointer-events-none drop-shadow-lg">
          <WaxSeal text="STANDARD" subtext="RESERVE" size={88} animateStamp />
        </div>
      )}
    </section>
  );
};
