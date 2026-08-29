"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Odometer } from "../atoms/Odometer";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  inflow: boolean;
}

export const S2Gate: React.FC = () => {
  const content = CHAPTERS_CONTENT.s2;
  const { advanceEpoch } = useSim((s) => ({
    advanceEpoch: s.advanceEpoch,
  }));

  const containerRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // If user isn't actively dragging, scroll drives a dynamic flow sweep:
      // Inflow (+0.8) -> Neutral (0) -> Outflow (-0.8) -> Positive (+0.6)
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

  // Canvas-2D Coin Queue Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const coins: CoinParticle[] = [];
    const maxCoins = 48;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 420);
    const gateCenterX = width / 2;
    const gateCenterY = height * 0.65;

    for (let i = 0; i < maxCoins; i++) {
      coins.push({
        x: Math.random() * width,
        y: gateCenterY + (Math.random() - 0.5) * 44,
        vx: 1.5,
        vy: (Math.random() - 0.5) * 0.4,
        size: 9 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        inflow: true,
      });
    }

    let lastTick = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      ctx.clearRect(0, 0, width, height);

      const isInflow = leverValue >= 0;
      const speedMagnitude = Math.max(0.15, Math.abs(leverValue)) * 160;
      const vx = isInflow ? speedMagnitude : -speedMagnitude;

      if (Math.abs(leverValue) > 0.05 && Math.random() < 0.12) {
        setNetCount((prev) => prev + Math.round(leverValue * delta * 280));
      }

      for (const coin of coins) {
        coin.x += vx * delta;
        coin.y += coin.vy;
        coin.rotation += coin.vRot;
        coin.inflow = isInflow;

        // Bounce gently inside floor corridor
        if (coin.y < gateCenterY - 24) {
          coin.y = gateCenterY - 24;
          coin.vy = Math.abs(coin.vy);
        } else if (coin.y > gateCenterY + 24) {
          coin.y = gateCenterY + 24;
          coin.vy = -Math.abs(coin.vy);
        }

        // Wrap around boundaries
        if (isInflow && coin.x > width + 24) {
          coin.x = -24;
          coin.y = gateCenterY + (Math.random() - 0.5) * 40;
        } else if (!isInflow && coin.x < -24) {
          coin.x = width + 24;
          coin.y = gateCenterY + (Math.random() - 0.5) * 40;
        }

        const distFromGate = Math.abs(coin.x - gateCenterX);
        const nearGate = distFromGate < 65;

        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);

        if (isInflow) {
          ctx.fillStyle = nearGate ? "#e6c374" : "#b08d2e";
          ctx.strokeStyle = "#8e6e22";
        } else {
          ctx.fillStyle = nearGate ? "rgba(163,59,46,0.85)" : "rgba(26,26,24,0.55)";
          ctx.strokeStyle = "#1a1a18";
        }

        ctx.lineWidth = 1.6;
        ctx.fill();
        ctx.stroke();

        // Milled rim dots
        ctx.beginPath();
        ctx.arc(0, 0, coin.size * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = isInflow ? "#8e6e22" : "rgba(244,241,234,0.4)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner currency symbol
        ctx.fillStyle = isInflow ? "#1a1a18" : "#f4f1ea";
        ctx.font = `bold ${Math.round(coin.size * 0.9)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 1);

        ctx.restore();
      }

      if (isVisible) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isVisible) {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [leverValue, isVisible]);

  const skyBg =
    leverValue > 0
      ? `rgb(${Math.round(244 + leverValue * 8)}, ${Math.round(241 + leverValue * 10)}, ${Math.round(234 + leverValue * 12)})`
      : `rgb(${Math.round(244 + leverValue * 16)}, ${Math.round(241 + leverValue * 18)}, ${Math.round(234 + leverValue * 20)})`;

  return (
    <section
      id="chapter-2"
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 transition-colors duration-420"
      style={{ backgroundColor: skyBg }}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.smooth }}
            className="mb-3"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              CHAPTER {content.numeral} · {content.title}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.smooth }}
            className="border-l-2 border-gold pl-4 py-1"
          >
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Stage (~56% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Mechanical Odometer above gate */}
          <div className="mb-4">
            <Odometer value={netCount} label="Net Capital Flow (buys − sells)" />
          </div>

          {/* City Gate & Coin Canvas Container */}
          <div
            tabIndex={0}
            role="slider"
            aria-label="Net ETH flow lever"
            aria-valuemin={-1}
            aria-valuemax={1}
            aria-valuenow={Math.round(leverValue * 100) / 100}
            aria-valuetext={
              leverValue > 0.1
                ? `Inflow ${Math.round(leverValue * 100)}%`
                : leverValue < -0.1
                ? `Outflow ${Math.round(Math.abs(leverValue) * 100)}%`
                : "Quiet Net Zero"
            }
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-[320px] sm:h-[400px] rounded border border-ink/15 bg-paper-deep/60 overflow-hidden shadow-[0_12px_32px_rgba(26,26,24,0.08)] cursor-ew-resize select-none touch-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {/* SVG City Gate Artwork */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 400"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Gate Pillars & Wall */}
              <rect x="0" y="160" width="210" height="240" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="1.5" />
              <rect x="390" y="160" width="210" height="240" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="1.5" />
              
              {/* Stone blocks lines */}
              <line x1="0" y1="220" x2="210" y2="220" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />
              <line x1="0" y1="280" x2="210" y2="280" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />
              <line x1="390" y1="220" x2="600" y2="220" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />
              <line x1="390" y1="280" x2="600" y2="280" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />

              {/* Arch structure */}
              <path
                d="M 210 400 L 210 220 Q 300 120 390 220 L 390 400 Z"
                fill="#f4f1ea"
                stroke="#1a1a18"
                strokeWidth="2"
              />
              {/* Keystone ornament */}
              <polygon points="288,130 312,130 318,160 282,160" fill="#c9a961" stroke="#b08d2e" strokeWidth="1.5" />
              
              {/* Top cornice */}
              <line x1="0" y1="160" x2="600" y2="160" stroke="#1a1a18" strokeWidth="2" />
              <line x1="0" y1="172" x2="600" y2="172" stroke="#1a1a18" strokeWidth="1" strokeDasharray="6 3" />
            </svg>

            {/* Canvas 2D coin queue */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Interactive Lever Track & Handle */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-col items-center">
              <div className="w-full flex justify-between font-mono text-[10px] sm:text-xs uppercase tracking-wider text-ink-60 mb-1.5 font-medium">
                <span className="text-gold font-semibold">◀ Inflow (Buys)</span>
                <span className="opacity-75">Drag Lever or Scroll</span>
                <span className="text-red font-semibold">Outflow (Sells) ▶</span>
              </div>

              {/* Lever Rail */}
              <div className="relative w-full h-3.5 bg-paper border border-ink/25 rounded-full flex items-center shadow-inner">
                {/* Center marker */}
                <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-ink/40" />
                {/* Lever Thumb Handle */}
                <div
                  style={{
                    left: `${((1.0 - leverValue) / 2.0) * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 w-7 h-7 rounded-full bg-gold border-2 border-[#8e6e22] shadow-lg flex items-center justify-center transform transition-transform active:scale-115 hover:scale-105"
                >
                  <div className="w-2 h-2 rounded-full bg-paper" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
