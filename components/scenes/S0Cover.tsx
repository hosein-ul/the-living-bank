"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coin } from "../atoms/Coin";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";
import { useLenisScroll } from "../chrome/SmoothScroll";

export const S0Cover: React.FC = () => {
  const content = CHAPTERS_CONTENT.s0;
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollTo, velocity } = useLenisScroll();
  const velocityRef = useRef<number>(0);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ambient gold dust particles in Cover background with Retina DPR & velocity kinetics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMediaQuery.matches;

    const handleReducedChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        drawStatic();
      }
    };
    reducedMediaQuery.addEventListener("change", handleReducedChange);

    let animId: number | null = null;
    let isVisible = true;
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || canvas.parentElement?.clientWidth || window.innerWidth;
      height = rect.height || canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseVy: number;
      size: number;
      alpha: number;
      pulse: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      const baseVy = -0.2 - Math.random() * 0.5;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: baseVy,
        baseVy,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#b08d2e";
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fill();
      }
    };

    let scrollImpulse = 0;

    const loop = () => {
      if (!isVisible || isReducedMotion) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Inertia coupling with Lenis scroll velocity
      const targetImpulse = Math.max(-8, Math.min(8, (velocityRef.current || 0) * 0.08));
      scrollImpulse += (targetImpulse - scrollImpulse) * 0.08;

      for (const p of particles) {
        // Apply target velocity with inertia dampening
        const targetVy = p.baseVy - scrollImpulse;
        p.vy += (targetVy - p.vy) * 0.06;

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.y < -10) {
          p.y = height + 5;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -5;
          p.x = Math.random() * width;
        }

        if (p.x < -10) p.x = width + 5;
        else if (p.x > width + 10) p.x = -5;

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);
        const stretch = Math.min(2.0, 1.0 + Math.abs(p.vy) * 0.4);

        ctx.beginPath();
        if (stretch > 1.2) {
          ctx.ellipse(p.x, p.y, p.size, p.size * stretch, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fillStyle = "#b08d2e";
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    if (isReducedMotion) {
      drawStatic();
    } else {
      animId = requestAnimationFrame(loop);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !isReducedMotion && animId === null) {
          animId = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleResize = () => {
      updateDimensions();
      if (isReducedMotion) {
        drawStatic();
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      reducedMediaQuery.removeEventListener("change", handleReducedChange);
      window.removeEventListener("resize", handleResize);
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, []);

  const scrollToNext = () => {
    scrollTo("#chapter-1", { duration: 1.4 });
  };

  return (
    <div
      ref={sectionRef as unknown as React.RefObject<HTMLDivElement>}
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16 sm:py-24 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(244,241,234,0.4) 0%, rgba(233,228,216,0.92) 100%)",
      }}
    >
      {/* Canvas Gold Dust Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />

      {/* Layer 0: Opposing Diagonal Parallax Background Geometric Rings [-40, -60] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-40, -60]}
        rotate={[0, 15]}
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15"
      >
        <div className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full border border-gold/30 flex items-center justify-center animate-[spin_120s_linear_infinite]">
          <div className="w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-dashed border-gold/40" />
        </div>
      </MultiParallaxLayer>

      {/* Layer 0b: Subtle Guilloche Grid Lines [-25, -45] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-25, -45]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[700px] h-[700px] sm:w-[900px] sm:h-[900px]">
          <circle cx="400" cy="400" r="350" fill="none" stroke="#b08d2e" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="210" fill="none" stroke="#b08d2e" strokeWidth="0.6" strokeDasharray="3 3" />
        </svg>
      </MultiParallaxLayer>

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
        {/* Layer 2: Animated $STANDARD coin with 3D perspective, opposing vector drift [+30, -20], and scroll rotate */}
        <MultiParallaxLayer
          progress={scrollYProgress}
          vector={[30, -20]}
          className="mb-8"
        >
          <motion.div
            style={{ y: coinY, scale: coinScale, rotateZ: coinRotate }}
            initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASINGS.stamp }}
            className="cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
          >
            <Coin size={148} />
          </motion.div>
        </MultiParallaxLayer>

        {/* Title with Word-Masked 3D Kinetic Typography */}
        <KineticText
          text={content.title}
          as="h1"
          delay={0.2}
          velocityReactive={true}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-ink mb-6 select-none justify-center"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.35, ease: EASINGS.smooth }}
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
        <MultiParallaxLayer
          progress={scrollYProgress}
          vector={[20, -15]}
          className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 pointer-events-none drop-shadow-lg"
        >
          <WaxSeal text="STANDARD" subtext="RESERVE" size={88} animateStamp />
        </MultiParallaxLayer>
      )}
    </div>
  );
};
