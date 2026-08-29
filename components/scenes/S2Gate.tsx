"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Odometer } from "../atoms/Odometer";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { ScrubbedConduit } from "../motion/ScrubbedConduit";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";
import { useLenisScroll } from "../chrome/SmoothScroll";

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  inflow: boolean;
  alpha: number;
}

export const S2Gate: React.FC = () => {
  const content = CHAPTERS_CONTENT.s2;
  const { advanceEpoch } = useSim((s) => ({
    advanceEpoch: s.advanceEpoch,
  }));
  const { velocity } = useLenisScroll();
  const velocityRef = useRef<number>(0);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastThresholdRef = useRef<number>(0);

  // Lever value: -1.0 (max outflow) to +1.0 (max inflow), 0 = quiet
  const [leverValue, setLeverValue] = useState<number>(0.6);
  const [netCount, setNetCount] = useState<number>(1420);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Scrollytelling hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // If user isn't actively dragging, scroll drives a dynamic flow sweep
      if (!isDraggingRef.current) {
        let dynamicFlow = 0;
        if (latest < 0.35) {
          dynamicFlow = 0.8 - (latest / 0.35) * 0.8; // 0.8 -> 0
        } else if (latest < 0.7) {
          dynamicFlow = -((latest - 0.35) / 0.35) * 0.85; // 0 -> -0.85
        } else {
          dynamicFlow = -0.85 + ((latest - 0.7) / 0.3) * 1.45; // -0.85 -> +0.6
        }
        updateLever(dynamicFlow, false);
      }
    });
  }, [scrollYProgress]);

  // IntersectionObserver for performance budget
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update lever and advance epoch on crossing threshold (±0.25 steps)
  const updateLever = (newVal: number, playAudio: boolean = true) => {
    const clamped = Math.max(-1, Math.min(1, newVal));
    setLeverValue(clamped);

    const currentStep = Math.round(clamped / 0.25);
    if (currentStep !== lastThresholdRef.current) {
      lastThresholdRef.current = currentStep;
      advanceEpoch(clamped);
      if (playAudio) sound.playTick();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      updateLever(leverValue + 0.2);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      updateLever(leverValue - 0.2);
    } else if (e.key === "Home" || e.key === " ") {
      e.preventDefault();
      updateLever(0);
    }
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const flow = 1.0 - relativeX * 2.0;
    updateLever(flow);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Live Canvas Coin & Crowd Particles (STREAM move) with Retina DPR & Velocity Coupling
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
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || canvas.parentElement?.clientWidth || 700;
      height = rect.height || canvas.parentElement?.clientHeight || 450;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();

    const particles: CoinParticle[] = [];
    const maxParticles = 60;

    // Seed coins
    for (let i = 0; i < maxParticles; i++) {
      const inflow = Math.random() > 0.45;
      particles.push({
        x: Math.random() * width,
        y: height * 0.4 + (Math.random() - 0.5) * (height * 0.35),
        vx: inflow ? 1.5 + Math.random() * 2.5 : -(1.5 + Math.random() * 2.5),
        vy: (Math.random() - 0.5) * 0.6,
        size: 7 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        inflow,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }

    const drawGate = (gateX: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(26, 26, 24, 0.25)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(gateX, height * 0.38, 55, Math.PI, 0);
      ctx.lineTo(gateX + 55, height * 0.85);
      ctx.lineTo(gateX - 55, height * 0.85);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle =
        leverValue > 0.05
          ? "rgba(61, 107, 79, 0.08)"
          : leverValue < -0.05
          ? "rgba(163, 59, 46, 0.08)"
          : "rgba(176, 141, 46, 0.05)";
      ctx.fill();
      ctx.restore();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawGate(width / 2);

      // Draw stationary sample coins
      for (const p of particles.slice(0, 24)) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.inflow ? "#c9a961" : "#a33b2e";
        ctx.fill();
        ctx.strokeStyle = p.inflow ? "#b08d2e" : "#1a1a18";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    };

    let lastTime = performance.now();
    let spawnAccumulator = 0;
    let scrollImpulse = 0;

    const loop = (now: number) => {
      if (!isVisible || isReducedMotion) {
        animId = null;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Inertia coupling with Lenis scroll velocity
      const targetImpulse = Math.max(-5, Math.min(5, (velocityRef.current || 0) * 0.04));
      scrollImpulse += (targetImpulse - scrollImpulse) * 0.08;

      const gateX = width / 2;
      drawGate(gateX);

      // Dynamic flow spawn rates coupled with lever value
      const inRate = Math.max(2, 10 + leverValue * 22);
      const outRate = Math.max(2, 10 - leverValue * 22);

      spawnAccumulator += dt;
      if (spawnAccumulator > 0.06) {
        spawnAccumulator = 0;
        if (particles.length < 80) {
          if (Math.random() < inRate / 30) {
            particles.push({
              x: 0,
              y: height * 0.42 + (Math.random() - 0.5) * 60,
              vx: 2.2 + Math.random() * 2.5,
              vy: (Math.random() - 0.5) * 0.5,
              size: 8 + Math.random() * 4,
              rotation: 0,
              vRot: 0.05,
              inflow: true,
              alpha: 0.8,
            });
          }
          if (Math.random() < outRate / 30) {
            particles.push({
              x: width,
              y: height * 0.42 + (Math.random() - 0.5) * 60,
              vx: -(2.2 + Math.random() * 2.5),
              vy: (Math.random() - 0.5) * 0.5,
              size: 8 + Math.random() * 4,
              rotation: 0,
              vRot: -0.05,
              inflow: false,
              alpha: 0.8,
            });
          }
        }
      }

      // Update & Draw Coin Particles with STREAM travel & inertia
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const flowMultiplier = 1 + Math.abs(leverValue) * 0.5;
        p.x += p.vx * flowMultiplier + (p.inflow ? scrollImpulse : -scrollImpulse);
        p.y += p.vy + Math.sin(p.rotation) * 0.3;
        p.rotation += p.vRot;

        // Draw Coin
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        // Coin Face
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.inflow ? "#c9a961" : "#a33b2e";
        ctx.fill();
        ctx.strokeStyle = p.inflow ? "#b08d2e" : "#1a1a18";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner Emblem Stamp
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = p.inflow ? "#3d6b4f" : "#f4f1ea";
        ctx.fill();

        ctx.restore();

        // Remove out-of-bounds
        if (p.x < -20 || p.x > width + 20) {
          particles.splice(i, 1);
        }
      }

      // Update live net counter
      setNetCount((prev) => {
        const delta = Math.round(leverValue * 14);
        return prev + delta;
      });

      animId = requestAnimationFrame(loop);
    };

    if (isReducedMotion) {
      drawStatic();
    } else if (isVisible) {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    const handleResize = () => {
      updateDimensions();
      if (isReducedMotion) {
        drawStatic();
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      reducedMediaQuery.removeEventListener("change", handleReducedChange);
      window.removeEventListener("resize", handleResize);
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [leverValue, isVisible]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none overflow-hidden"
    >
      {/* Layer 0: Background Flow Conduit Vectors drifting [-30, -50] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-30, -50]}
        className="absolute inset-0 pointer-events-none opacity-15 flex items-center justify-center"
      >
        <svg viewBox="0 0 1000 600" className="w-[1000px] h-[600px] max-w-none">
          <path
            d="M 100 300 C 300 200, 700 400, 900 300"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />
          <path
            d="M 100 350 C 300 250, 700 450, 900 350"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="1"
          />
        </svg>
      </MultiParallaxLayer>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <motion.div
          style={{ y: copyY }}
          className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <KineticText
              text={`CHAPTER ${content.numeral} · ${content.title}`}
              as="span"
              velocityReactive={true}
              className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          {/* Odometer readout card for Net ETH Flow */}
          <div className="p-5 rounded bg-paper-deep border border-ink/15 mb-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="font-mono text-[10px] text-ink-60 uppercase tracking-widest block mb-1">
                POLICY INPUT · NET ETH FLOW
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${
                    leverValue > 0.05
                      ? "text-green"
                      : leverValue < -0.05
                      ? "text-red"
                      : "text-gold"
                  }`}
                >
                  {leverValue > 0 ? "+" : ""}
                  {(leverValue * 100).toFixed(0)}%
                </span>
                <span className="font-mono text-xs text-ink-60 uppercase">
                  ({leverValue > 0.05 ? "EXPANSION" : leverValue < -0.05 ? "CONTRACTION" : "NEUTRAL"})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-ink-60 uppercase tracking-widest block mb-1">
                CUMULATIVE NET
              </span>
              <Odometer value={Math.max(0, netCount)} className="text-lg font-mono font-semibold text-ink" />
            </div>
          </div>

          {/* Scroll-Scrubbed Net ETH Flow Vector Conduit */}
          <div className="w-full my-2 p-2 bg-paper-deep/60 rounded border border-ink/10">
            <div className="flex justify-between items-center text-[9px] font-mono text-ink-60 uppercase tracking-wider mb-1">
              <span>UNISWAP V4 POOL</span>
              <span className={leverValue > 0 ? "text-green font-bold" : "text-red font-bold"}>
                {leverValue > 0 ? "STREAMING INFLOW →" : "← STREAMING OUTFLOW"}
              </span>
              <span>BANK GATE</span>
            </div>
            <ScrubbedConduit
              d="M 10 15 C 100 5, 200 25, 390 15"
              progress={scrollYProgress}
              progressRange={[0.05, 0.95]}
              strokeColor={leverValue > 0.05 ? "#3d6b4f" : leverValue < -0.05 ? "#a33b2e" : "#b08d2e"}
              strokeWidth={2.4}
              viewBox="0 0 400 30"
              direction={leverValue >= 0 ? "forward" : "reverse"}
              className="w-full h-6"
            />
          </div>

          {/* Gold Fraunces Italic Takeaway with KineticText */}
          <div className="border-l-2 border-gold pl-4 py-1 mt-2">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>
        </motion.div>

        {/* Interactive Gate & Lever Arena (~55% desktop) */}
        <div className="w-full lg:w-[55%] h-[400px] sm:h-[480px] lg:h-[540px] relative order-1 lg:order-2 flex flex-col items-center justify-between p-4 rounded border border-ink/10 bg-paper-deep/30 shadow-inner overflow-hidden">
          {/* Canvas Crowd & Coin Flow Simulation */}
          <div className="relative w-full h-[75%] rounded border border-ink/10 bg-paper overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Labels on Canvas */}
            <div className="absolute top-3 left-4 font-mono text-[11px] text-green tracking-wider uppercase font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              BUYS (ETH IN) →
            </div>
            <div className="absolute top-3 right-4 font-mono text-[11px] text-red tracking-wider uppercase font-semibold flex items-center gap-1.5">
              ← SELLS (ETH OUT)
              <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-ink-60 uppercase tracking-widest px-3 py-1 bg-paper-deep/80 border border-ink/10 rounded">
              UNISWAP V4 HOOKED POOL
            </div>
          </div>

          {/* Physical Brass Lever Slider */}
          <div
            tabIndex={0}
            role="slider"
            aria-label="Net ETH Flow Policy Lever"
            aria-valuemin={-1}
            aria-valuemax={1}
            aria-valuenow={leverValue}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-[22%] mt-3 px-6 py-3 bg-paper-deep border border-ink/15 rounded flex flex-col justify-center cursor-ew-resize relative group focus-visible:outline-gold select-none"
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-ink-60 mb-1.5">
              <span className="text-red font-semibold">← MAXIMUM OUTFLOW (-1.0)</span>
              <span className="text-ink font-semibold">DRAG THE LEVER</span>
              <span className="text-green font-semibold">MAXIMUM INFLOW (+1.0) →</span>
            </div>

            {/* Track */}
            <div className="relative w-full h-3 bg-paper border border-ink/20 rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className={`absolute top-0 bottom-0 transition-colors duration-200 ${
                  leverValue >= 0 ? "bg-green" : "bg-red"
                }`}
                style={{
                  left: leverValue >= 0 ? "50%" : `${(leverValue + 1) * 50}%`,
                  width: `${Math.abs(leverValue) * 50}%`,
                }}
              />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-ink/40" />
            </div>

            {/* Brass Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-b from-gold-bright via-gold to-gold/90 border border-ink/40 rounded shadow-md pointer-events-none transition-transform duration-75 flex items-center justify-center"
              style={{
                left: `calc(${((leverValue + 1) / 2) * 100}% - 12px)`,
              }}
            >
              <div className="w-[2px] h-4 bg-ink/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
