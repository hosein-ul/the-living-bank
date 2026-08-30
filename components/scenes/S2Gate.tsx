"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { VelocitySkew } from "../motion/VelocitySkew";
import { useLenisScroll } from "../chrome/SmoothScroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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
  const handleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastThresholdRef = useRef<number>(0);
  const leverValRef = useRef<number>(0.6);

  // Lever value: -1.0 (max outflow) to +1.0 (max inflow), 0 = quiet
  const [leverValue, setLeverValue] = useState<number>(0.6);
  const [netCount, setNetCount] = useState<number>(1420);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // GSAP quickTo setters for lever handle and fill track
  const setHandleXRef = useRef<((val: number) => void) | null>(null);

  useEffect(() => {
    if (handleRef.current) {
      setHandleXRef.current = gsap.quickTo(handleRef.current, "xPercent", { duration: 0.15, ease: "power2.out" });
    }
  }, []);

  // GSAP textContent proxy tween for NET ETH counter
  const proxyCounter = useRef<{ val: number }>({ val: 1420 });

  const updateNetCounter = (targetVal: number) => {
    gsap.to(proxyCounter.current, {
      val: targetVal,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        if (counterRef.current) {
          const val = Math.round(proxyCounter.current.val);
          const sign = val > 0 ? "+" : "";
          counterRef.current.textContent = `${sign}${val.toLocaleString("en-US")} NET ETH`;
        }
      },
    });
  };

  // ScrollTrigger integration for dynamic flow sweep when not dragging
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        if (!isDraggingRef.current) {
          const p = self.progress;
          let dynamicFlow = 0;
          if (p < 0.35) {
            dynamicFlow = 0.8 - (p / 0.35) * 0.8; // 0.8 -> 0
          } else if (p < 0.7) {
            dynamicFlow = -((p - 0.35) / 0.35) * 0.85; // 0 -> -0.85
          } else {
            dynamicFlow = -0.85 + ((p - 0.7) / 0.3) * 1.45; // -0.85 -> +0.6
          }
          applyLeverValue(dynamicFlow, false);
        }
      },
    });

    return () => st.kill();
  }, []);

  // Update lever and advance epoch on crossing threshold (±0.25 steps)
  const applyLeverValue = (newVal: number, playAudio: boolean = true) => {
    const clamped = Math.max(-1, Math.min(1, newVal));
    leverValRef.current = clamped;
    setLeverValue(clamped);

    // Update handle position using percentage (0% to 100%)
    const pct = ((clamped + 1) / 2) * 100;
    if (handleRef.current) {
      handleRef.current.style.left = `${pct}%`;
    }

    if (fillRef.current) {
      if (clamped >= 0) {
        fillRef.current.style.left = "50%";
        fillRef.current.style.width = `${clamped * 50}%`;
        fillRef.current.className = "absolute top-0 bottom-0 bg-green transition-colors duration-200";
      } else {
        fillRef.current.style.left = `${(clamped + 1) * 50}%`;
        fillRef.current.style.width = `${Math.abs(clamped) * 50}%`;
        fillRef.current.className = "absolute top-0 bottom-0 bg-red transition-colors duration-200";
      }
    }

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
      applyLeverValue(leverValue + 0.2);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      applyLeverValue(leverValue - 0.2);
    } else if (e.key === "Home" || e.key === " ") {
      e.preventDefault();
      applyLeverValue(0);
    }
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = e.currentTarget.querySelector(".lever-track-container") || e.currentTarget;
    const rect = track.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const flow = (relativeX - 0.5) * 2.0;
    applyLeverValue(flow);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Live Canvas Coin & Crowd Particles (STREAM move) with Lenis velocity kinetics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMediaQuery.matches;

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

    const drawGate = (gateX: number, curLever: number) => {
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
        curLever > 0.05
          ? "rgba(61, 107, 79, 0.08)"
          : curLever < -0.05
          ? "rgba(163, 59, 46, 0.08)"
          : "rgba(176, 141, 46, 0.05)";
      ctx.fill();
      ctx.restore();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawGate(width / 2, leverValRef.current);

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

      // Lenis velocity impulse (scrolling down pushes inflow, scrolling up pushes outflow)
      const targetImpulse = Math.max(-6, Math.min(6, (velocityRef.current || 0) * 0.05));
      scrollImpulse += (targetImpulse - scrollImpulse) * 0.08;

      const curLever = leverValRef.current;
      const gateX = width / 2;
      drawGate(gateX, curLever);

      // Dynamic flow spawn rates coupled with lever value + velocity
      const effectiveFlow = Math.max(-1, Math.min(1, curLever + scrollImpulse * 0.1));
      const inRate = Math.max(2, 10 + effectiveFlow * 22);
      const outRate = Math.max(2, 10 - effectiveFlow * 22);

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

      // Update & Draw Coin Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const flowMultiplier = 1 + Math.abs(curLever) * 0.5;
        p.x += p.vx * flowMultiplier + (p.inflow ? scrollImpulse : -scrollImpulse);
        p.y += p.vy + Math.sin(p.rotation) * 0.3;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.inflow ? "#c9a961" : "#a33b2e";
        ctx.fill();
        ctx.strokeStyle = p.inflow ? "#b08d2e" : "#1a1a18";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, p.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = p.inflow ? "#3d6b4f" : "#f4f1ea";
        ctx.fill();

        ctx.restore();

        if (p.x < -20 || p.x > width + 20) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    if (isReducedMotion) {
      drawStatic();
    } else {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !isReducedMotion && animId === null) {
          lastTime = performance.now();
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
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      id="chapter-2"
      ref={containerRef}
      className={`relative min-h-[260vh] border-t border-ink/10 select-none transition-colors duration-500 ${
        leverValue > 0.1 ? "bg-[#f2f4ec]" : leverValue < -0.1 ? "bg-[#f5ecea]" : "bg-paper"
      }`}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) with Velocity Skew */}
        <div className="w-full lg:w-[42%] z-10 flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0">
          <VelocitySkew maxSkew={1.5}>
            <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
              <KineticText
                text={`CHAPTER ${content.numeral} · ${content.title}`}
                as="span"
                velocityReactive={true}
                className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
              />
            </div>

            <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
              {content.copy}
            </p>

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
                <span
                  ref={counterRef}
                  className="text-lg font-mono font-semibold text-ink tabular-nums"
                >
                  +1,420 NET ETH
                </span>
              </div>
            </div>

            {/* Gold Fraunces Italic Takeaway */}
            <div className="border-l-2 border-gold pl-4 py-1 mt-2">
              <KineticText
                text={`“${content.takeaway}”`}
                as="p"
                italicTakeaway={true}
                delay={0.15}
                className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
              />
            </div>
          </VelocitySkew>
        </div>

        {/* Interactive Gate & Lever Arena (~55% desktop) */}
        <div className="w-full lg:w-[55%] h-[420px] sm:h-[480px] lg:h-[540px] relative order-1 lg:order-2 flex flex-col items-center justify-between p-4 rounded border border-ink/10 bg-paper-deep/30 shadow-inner overflow-hidden">
          {/* Canvas Crowd & Coin Flow Simulation */}
          <div className="relative w-full h-[68%] rounded border border-ink/10 bg-paper overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />

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

          {/* Physical Brass Lever Slider — FIX BUG 2: Label cleanly above track with ample margin */}
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
            className="w-full h-[28%] mt-2 px-6 py-3 bg-paper-deep border border-ink/15 rounded flex flex-col justify-center cursor-ew-resize relative group focus-visible:outline-gold select-none"
          >
            {/* Top Label Header (Positioned clearly above track to prevent handle overlap) */}
            <div className="flex justify-between items-center text-[10px] font-mono text-ink-60 mb-2 pointer-events-none">
              <span className="text-red font-semibold">← OUTFLOW (-1.0)</span>
              <span className="text-ink font-bold tracking-wider bg-paper/70 px-2 py-0.5 rounded border border-ink/10">
                DRAG THE LEVER
              </span>
              <span className="text-green font-semibold">INFLOW (+1.0) →</span>
            </div>

            {/* Lever Track Container */}
            <div className="lever-track-container relative w-full h-4 bg-paper border border-ink/25 rounded-full overflow-visible">
              {/* Colored Fill */}
              <div
                ref={fillRef}
                className="absolute top-0 bottom-0 bg-green transition-colors duration-200 rounded-full"
                style={{
                  left: "50%",
                  width: `${leverValue * 50}%`,
                }}
              />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-ink/40" />

              {/* Brass Handle */}
              <div
                ref={handleRef}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-9 bg-gradient-to-b from-gold-bright via-gold to-gold/90 border-2 border-ink/60 rounded shadow-lg pointer-events-none flex items-center justify-center will-change-transform z-10"
                style={{
                  left: `${((leverValue + 1) / 2) * 100}%`,
                }}
              >
                <div className="w-[2px] h-4 bg-ink/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
