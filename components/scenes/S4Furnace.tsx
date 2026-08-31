"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Furnace } from "../atoms/Furnace";
import { formatNumber, formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";


export const S4Furnace: React.FC = () => {
  const content = CHAPTERS_CONTENT.s4;
  const {
    branches,
    licensePrice,
    licensesToday,
    balance,
    accrualRate,
    buyLicense,
  } = useSim((s) => ({
    branches: s.branches,
    licensePrice: s.licensePrice,
    licensesToday: s.licensesToday,
    balance: s.balance,
    accrualRate: s.accrualRate,
    buyLicense: s.buyLicense,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  const [burnTimestamp, setBurnTimestamp] = useState<number>(0);
  const [hasBoughtOnce, setHasBoughtOnce] = useState<boolean>(false);
  const [flyingCoin, setFlyingCoin] = useState<boolean>(false);

  // SVG Dutch Auction decay curve path tracing scrubbed with GSAP ScrollTrigger
  useEffect(() => {
    const el = containerRef.current;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!el || !path) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // Stroke dashoffset path tracing
        const drawLen = pathLength * (1 - p);
        path.style.strokeDashoffset = `${drawLen}`;

        // Marker sliding along curve
        if (marker) {
          const point = path.getPointAtLength(p * pathLength);
          marker.style.left = `${(point.x / 400) * 100}%`;
          marker.style.top = `${point.y}px`;
        }
      },
    });

    return () => st.kill();
  }, []);

  const isMaxBranches = branches >= 10;
  const isDailyLimit = licensesToday >= 3;
  const canBuy = !isMaxBranches && !isDailyLimit && balance >= licensePrice;

  const handleBuy = () => {
    if (canBuy) {
      setFlyingCoin(true);
      sound.playCoinClink();
      sound.playCrackle();

      setTimeout(() => {
        const ok = buyLicense();
        if (ok) {
          setBurnTimestamp(Date.now());
          setHasBoughtOnce(true);
          sound.playFurnaceRoar();
          sound.playThud();

          // STAMP animation on the newly filled branch pip
          if (pipContainerRef.current) {
            const pips = pipContainerRef.current.querySelectorAll(".branch-pip");
            const newPipIdx = branches; // 0-indexed for next pip
            if (pips[newPipIdx]) {
              gsap.fromTo(
                pips[newPipIdx],
                { scale: 1.8, filter: "brightness(2)" },
                { scale: 1.0, filter: "brightness(1)", duration: 0.45, ease: "back.out(2)" }
              );
            }
          }
        }
        setFlyingCoin(false);
      }, 360);
    }
  };

  const auctionCurvePath = "M 10 12 C 120 14, 240 38, 390 48";

  return (
    <section
      id="chapter-4"
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) with Velocity Skew */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
              <KineticText
                text={`CHAPTER ${content.numeral} · ${content.title}`}
                as="span"
                velocityReactive={true}
                className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
              />
            </div>

            <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-4">
              {content.copy}
            </p>

            {/* Subtext that fades in after first buy */}
            <AnimatePresence>
              {hasBoughtOnce && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.42 }}
                  className="p-3.5 bg-paper-deep border border-gold/40 rounded text-xs font-serif text-ink-60 italic mb-6 leading-relaxed shadow-sm"
                >
                  {content.subtext}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gold Fraunces Italic Takeaway */}
            <div className="border-l-2 border-gold pl-4 py-1">
              <KineticText
                text={`“${content.takeaway}”`}
                as="p"
                italicTakeaway={true}
                delay={0.15}
                className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
              />
            </div>
          </div>

        {/* Stage (~56% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)] order-1 lg:order-2">
          {/* Top: 24h Expansion License Dutch Auction Rail & Exponential Curve */}
          <div className="w-full mb-5 p-3.5 bg-paper rounded-lg border border-ink/15 shadow-sm">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-ink-60">
              <span className="font-semibold">24h Dutch Auction Decay (Path Tracing)</span>
              <span className="text-gold font-bold">
                Price: {formatNumber(licensePrice)} $STANDARD
              </span>
            </div>

            {/* Scroll-Scrubbed Dutch Auction Exponential Decay Curve */}
            <div className="relative w-full h-14 overflow-visible">
              <svg viewBox="0 0 400 60" className="w-full h-full overflow-visible">
                {/* Background Ghost Path */}
                <path
                  d={auctionCurvePath}
                  fill="none"
                  stroke="#b08d2e"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                />
                {/* Traced Active Path */}
                <path
                  ref={pathRef}
                  d={auctionCurvePath}
                  fill="none"
                  stroke="#b08d2e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Dynamic Tracking Marker along Curve */}
              <div
                ref={markerRef}
                style={{ left: "10px", top: "12px" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold border-2 border-[#8e6e22] shadow-md flex items-center justify-center pointer-events-none transition-all duration-75"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-paper" />
              </div>
            </div>

            <div className="flex justify-between items-center font-mono text-[9.5px] text-ink-60 font-medium pt-1 border-t border-ink/10">
              <span>00:00 (Peak 2×)</span>
              <span>12:00 (Exponential Decay)</span>
              <span>24:00 (Floor Reserve)</span>
            </div>
          </div>

          {/* Center: The Furnace with EMBER canvas */}
          <div className="relative w-full flex flex-col items-center mb-5">
            <Furnace burnTrigger={burnTimestamp} />

            {/* Flying coin sprite on buy */}
            <AnimatePresence>
              {flyingCoin && (
                <>
                  <motion.div
                    initial={{ y: 90, x: -30, scale: 1, opacity: 1 }}
                    animate={{ y: -35, x: 0, scale: 0.35, opacity: 0 }}
                    transition={{ duration: 0.36, ease: "easeIn" }}
                    className="absolute bottom-10 z-30 w-7 h-7 rounded-full bg-gold-bright border-2 border-gold shadow-lg flex items-center justify-center font-mono text-[10px] font-bold text-ink"
                  >
                    $
                  </motion.div>
                  <motion.div
                    initial={{ y: 80, x: 30, scale: 1, opacity: 1 }}
                    animate={{ y: -35, x: 0, scale: 0.35, opacity: 0 }}
                    transition={{ duration: 0.38, delay: 0.04, ease: "easeIn" }}
                    className="absolute bottom-10 z-30 w-6 h-6 rounded-full bg-gold border-2 border-[#8e6e22] shadow-lg flex items-center justify-center font-mono text-[9px] font-bold text-paper"
                  >
                    $
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Current Branch Pips Status — FIX BUG 3: Render proper SVG/DOM pip rectangles instead of tofu Unicode boxes */}
          <div
            ref={pipContainerRef}
            className="w-full flex items-center justify-between py-3 px-4 bg-paper rounded border border-ink/15 mb-4 font-mono text-xs shadow-sm"
          >
            <span className="text-ink-60 uppercase text-[10px] font-semibold">Your Branches:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className={`branch-pip inline-block w-2.5 h-4 rounded-xs border transition-all duration-300 ${
                      i < branches
                        ? "bg-gold border-[#8e6e22] shadow-xs"
                        : "bg-paper-deep border-ink/20"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-ink ml-1 tabular-nums">{branches}/10</span>
            </div>
            <span className="text-gold font-bold">({formatRate(accrualRate)})</span>
          </div>

          {/* Buy Button */}
          <div className="w-full flex flex-col items-center">
            <button
              onClick={handleBuy}
              disabled={!canBuy}
              aria-label={content.button}
              className={`w-full py-3.5 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer ${
                canBuy
                  ? "bg-gold hover:bg-gold-bright text-paper shadow-lg hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold"
                  : "bg-paper-deep text-ink-60 border border-ink/20 cursor-not-allowed"
              }`}
            >
              {isMaxBranches
                ? "MAX CAPACITY (10/10 BRANCHES)"
                : isDailyLimit
                ? "DAILY LIMIT REACHED (3/3 TODAY)"
                : `${content.button} (${formatNumber(licensePrice)} $STANDARD)`}
            </button>

            <div className="flex justify-between w-full mt-2 font-mono text-[10px] text-ink-60">
              <span>Daily Bought: {licensesToday}/3</span>
              <span className="text-gold font-semibold">100% permanently burned</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
