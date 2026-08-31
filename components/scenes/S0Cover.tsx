"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coin } from "../atoms/Coin";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { EASINGS } from "@/lib/easings";
import { SplitChars } from "../motion/SplitChars";
import { useLenisScroll } from "../chrome/SmoothScroll";
import { gsap } from "@/lib/gsap";

export const S0Cover: React.FC = () => {
  const content = CHAPTERS_CONTENT.s0;
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const coinContainerRef = useRef<HTMLDivElement>(null);
  const { scrollTo, velocity } = useLenisScroll();
  const velocityRef = useRef<number>(0);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.8], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP Pointer Parallax with quickTo on Orbital Rings & Continuous Idle Coin Rotation
  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    // Continuous idle 3D coin rotation
    let coinTween: gsap.core.Tween | null = null;
    if (coinContainerRef.current) {
      coinTween = gsap.to(coinContainerRef.current, {
        rotateY: 18,
        rotateX: -8,
        y: -10,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    // GSAP quickTo setters for rings
    const setRing1X = ring1Ref.current ? gsap.quickTo(ring1Ref.current, "x", { duration: 0.6, ease: "power2.out" }) : null;
    const setRing1Y = ring1Ref.current ? gsap.quickTo(ring1Ref.current, "y", { duration: 0.6, ease: "power2.out" }) : null;
    const setRing2X = ring2Ref.current ? gsap.quickTo(ring2Ref.current, "x", { duration: 0.9, ease: "power2.out" }) : null;
    const setRing2Y = ring2Ref.current ? gsap.quickTo(ring2Ref.current, "y", { duration: 0.9, ease: "power2.out" }) : null;

    const handlePointerMove = (e: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;

      setRing1X?.(nx * 35);
      setRing1Y?.(ny * 25);
      setRing2X?.(nx * -20);
      setRing2Y?.(ny * -15);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      coinTween?.kill();
    };
  }, []);

  // Ambient gold dust particles in Cover background with Retina DPR & velocity kinetics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMediaQuery.matches;

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
      if (isReducedMotion) drawStatic();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  const scrollToNext = () => {
    scrollTo("#chapter-1", { duration: 1.4 });
  };

  return (
    <section
      id="cover"
      ref={sectionRef as unknown as React.RefObject<HTMLElement>}
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 sm:py-20 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(244,241,234,0.4) 0%, rgba(233,228,216,0.92) 100%)",
      }}
    >
      {/* Canvas Gold Dust Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />

      {/* Layer 0: Background Geometric Orbital Rings with pointer quickTo */}
      <div
        ref={ring1Ref}
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 will-change-transform"
      >
        <div className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full border border-gold/30 flex items-center justify-center animate-[spin_120s_linear_infinite]">
          <div className="w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-dashed border-gold/40" />
        </div>
      </div>

      {/* Layer 0b: Subtle Guilloche Grid Lines with opposing pointer quickTo */}
      <div
        ref={ring2Ref}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center will-change-transform"
      >
        <svg viewBox="0 0 800 800" className="w-[700px] h-[700px] sm:w-[900px] sm:h-[900px]">
          <circle cx="400" cy="400" r="350" fill="none" stroke="#b08d2e" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="210" fill="none" stroke="#b08d2e" strokeWidth="0.6" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Fog gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-paper via-transparent to-paper opacity-75" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-paper/60 via-transparent to-paper/60" />

      {/* Top eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.64, ease: EASINGS.smooth }}
        className="relative z-10 pt-2"
      >
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-ink-60 border-b border-ink/20 pb-1.5 font-semibold">
          {content.eyebrow}
        </span>
      </motion.div>

      {/* Center hero container with clear layout (Fix Bug 1: No overlap between coin, wordmark, and seals) */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 max-w-3xl mx-auto my-auto flex flex-col items-center px-4"
      >
        {/* $STANDARD 3D Rotating Coin (Idle GSAP yoyo + tilt) */}
        <div ref={coinContainerRef} className="mb-6 sm:mb-8 perspective-800">
          <Coin size={132} interactiveTilt={true} />
        </div>

        {/* Title: Per-character STAMP-in with SplitChars */}
        <div className="mb-5">
          <SplitChars
            text={content.title}
            as="h1"
            stagger={0.035}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-ink justify-center text-center leading-[1.08]"
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, delay: 0.35, ease: EASINGS.smooth }}
          className="font-serif text-base sm:text-lg sm:leading-relaxed text-ink-60 max-w-[36ch] mx-auto mb-8"
        >
          {content.sub}
        </motion.p>
      </motion.div>

      {/* Bottom CTA with dynamic pulse */}
      <div className="relative z-10 w-full flex items-center justify-center pb-2">
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

      {/* Wax seal fixed safely in bottom-right corner */}
      {mounted && (
        <div className="hidden sm:block absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-20 pointer-events-none drop-shadow-lg">
          <WaxSeal text="STANDARD" subtext="RESERVE" size={80} animateStamp />
        </div>
      )}
    </section>
  );
};
