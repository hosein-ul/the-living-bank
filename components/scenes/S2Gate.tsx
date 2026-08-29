"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { Odometer } from "../atoms/Odometer";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
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
  const [leverValue, setLeverValue] = useState<number>(0.5); // starts on gentle inflow
  const [netCount, setNetCount] = useState<number>(1420);
  const [isVisible, setIsVisible] = useState<boolean>(true);

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
  const updateLever = (newVal: number) => {
    const clamped = Math.max(-1, Math.min(1, newVal));
    setLeverValue(clamped);

    // Calculate current threshold step (-4 to +4)
    const currentStep = Math.round(clamped / 0.25);
    if (currentStep !== lastThresholdRef.current) {
      lastThresholdRef.current = currentStep;
      advanceEpoch(clamped);
      sound.playTick();
    }
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      updateLever(leverValue + 0.15);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      updateLever(leverValue - 0.15);
    } else if (e.key === "Home" || e.key === " ") {
      e.preventDefault();
      updateLever(0);
    }
  };

  // Drag handlers across the stage
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width; // 0 (left) to 1 (right)
    // Left = max inflow (+1.0), Right = max outflow (-1.0), Center = 0
    const flow = 1.0 - relativeX * 2.0;
    updateLever(flow);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Canvas-2D Coin Queue Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const coins: CoinParticle[] = [];
    const maxCoins = 32;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 420);
    const gateCenterX = width / 2;
    const gateCenterY = height * 0.62;

    // Initialize initial coins
    for (let i = 0; i < maxCoins; i++) {
      coins.push({
        x: Math.random() * width,
        y: gateCenterY + (Math.random() - 0.5) * 36,
        vx: 1.5,
        vy: (Math.random() - 0.5) * 0.2,
        size: 10 + Math.random() * 4,
        opacity: 0.8,
        inflow: true,
      });
    }

    let lastTick = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      ctx.clearRect(0, 0, width, height);

      // Inflow rate and velocity
      const isInflow = leverValue >= 0;
      const speedMagnitude = Math.max(0.2, Math.abs(leverValue)) * 140;
      const vx = isInflow ? speedMagnitude : -speedMagnitude;

      // Net counter accrual throttled to avoid render flooding
      if (Math.abs(leverValue) > 0.05 && Math.random() < 0.1) {
        setNetCount((prev) => prev + Math.round(leverValue * delta * 250));
      }

      // Update & Draw Coins
      for (const coin of coins) {
        coin.x += vx * delta;
        coin.y += coin.vy;
        coin.inflow = isInflow;

        // Wrap around boundaries
        if (isInflow && coin.x > width + 20) {
          coin.x = -20;
          coin.y = gateCenterY + (Math.random() - 0.5) * 36;
        } else if (!isInflow && coin.x < -20) {
          coin.x = width + 20;
          coin.y = gateCenterY + (Math.random() - 0.5) * 36;
        }

        // Distance from gate arch center determines depth scale
        const distFromGate = Math.abs(coin.x - gateCenterX);
        const nearGate = distFromGate < 60;

        ctx.save();
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);

        if (isInflow) {
          // Gold bright coins walking in
          ctx.fillStyle = nearGate ? "#c9a961" : "#b08d2e";
          ctx.strokeStyle = "#8e6e22";
        } else {
          // Desaturated ink coins walking out
          ctx.fillStyle = nearGate ? "rgba(26,26,24,0.75)" : "rgba(26,26,24,0.45)";
          ctx.strokeStyle = "#1a1a18";
        }

        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Inner $ stamp
        ctx.fillStyle = isInflow ? "#1a1a18" : "#f4f1ea";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", coin.x, coin.y + 0.5);

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

  // Sky lightness derived from lever: left = max inflow (#faf8f4), right = max outflow (#e2ded4)
  const skyBg =
    leverValue > 0
      ? `rgb(${Math.round(244 + leverValue * 10)}, ${Math.round(241 + leverValue * 12)}, ${Math.round(234 + leverValue * 14)})`
      : `rgb(${Math.round(244 + leverValue * 18)}, ${Math.round(241 + leverValue * 19)}, ${Math.round(234 + leverValue * 22)})`;

  return (
    <section
      id="chapter-2"
      ref={containerRef}
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center transition-colors duration-420"
      style={{ backgroundColor: skyBg }}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Copy Column (~40% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center">
          <div className="mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
            {content.copy}
          </p>

          <div className="border-l-2 border-gold pl-4 py-1">
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </div>
        </div>

        {/* Stage (~60% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center">
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
            className="relative w-full h-[320px] sm:h-[380px] rounded border border-ink/15 bg-paper-deep/50 overflow-hidden shadow-inner cursor-ew-resize select-none touch-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {/* SVG City Gate Artwork */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 380"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Gate Pillars & Wall */}
              <rect x="0" y="160" width="220" height="220" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="1.5" />
              <rect x="380" y="160" width="220" height="220" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="1.5" />
              {/* Arch structure */}
              <path
                d="M 220 380 L 220 220 Q 300 130 380 220 L 380 380 Z"
                fill="#f4f1ea"
                stroke="#1a1a18"
                strokeWidth="2"
              />
              {/* Keystone ornament */}
              <polygon points="290,140 310,140 315,165 285,165" fill="#c9a961" stroke="#b08d2e" strokeWidth="1.5" />
              {/* Top cornice */}
              <line x1="0" y1="160" x2="600" y2="160" stroke="#1a1a18" strokeWidth="2" />
              <line x1="0" y1="172" x2="600" y2="172" stroke="#1a1a18" strokeWidth="1" strokeDasharray="6 3" />
            </svg>

            {/* Canvas 2D coin queue */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Interactive Lever Track & Handle */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-col items-center">
              <div className="w-full flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-60 mb-1">
                <span className="text-gold font-semibold">◀ Inflow (Buys)</span>
                <span>Quiet</span>
                <span className="text-red font-semibold">Outflow (Sells) ▶</span>
              </div>

              {/* Lever Rail */}
              <div className="relative w-full h-3 bg-paper border border-ink/20 rounded-full flex items-center">
                {/* Center marker */}
                <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-ink/30" />
                {/* Lever Thumb Handle */}
                <div
                  style={{
                    left: `${((1.0 - leverValue) / 2.0) * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 w-6 h-6 rounded-full bg-gold border-2 border-[#8e6e22] shadow-md flex items-center justify-center transform transition-transform active:scale-110"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-paper" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
