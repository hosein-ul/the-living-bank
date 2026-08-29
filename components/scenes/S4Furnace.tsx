"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Furnace } from "../atoms/Furnace";
import { formatNumber, formatPips, formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { ScrubbedConduit } from "../motion/ScrubbedConduit";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

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
  const [burnTimestamp, setBurnTimestamp] = useState<number>(0);
  const [hasBoughtOnce, setHasBoughtOnce] = useState<boolean>(false);
  const [flyingCoin, setFlyingCoin] = useState<boolean>(false);
  const [trackProgress, setTrackProgress] = useState<number>(0.35);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Auction rail scrubbed by scroll progress
      setTrackProgress((latest * 1.5) % 1);
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrackProgress((prev) => (prev >= 1 ? 0 : prev + 0.004));
    }, 150);
    return () => clearInterval(interval);
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
        }
        setFlyingCoin(false);
      }, 360);
    }
  };

  // Exponential decay curve for Dutch Auction
  const auctionCurvePath = "M 10 12 C 120 14, 240 38, 390 48";

  return (
    <div
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none overflow-hidden"
    >
      {/* Layer 0: Background Crucible Embers Linework drifting [-30, -50] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-30, -50]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] max-w-none">
          <circle cx="400" cy="400" r="300" fill="none" stroke="#a33b2e" strokeWidth="1" strokeDasharray="4 6" />
          <polygon points="400,150 480,300 650,300 520,400 570,550 400,450 230,550 280,400 150,300 320,300" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
        </svg>
      </MultiParallaxLayer>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <motion.div
          style={{ y: copyY }}
          className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10"
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
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-4"
          >
            {content.copy}
          </motion.p>

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

          {/* Gold Fraunces Italic Takeaway with KineticText */}
          <div className="border-l-2 border-gold pl-4 py-1">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>
        </motion.div>

        {/* Stage (~56% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)] order-1 lg:order-2">
          {/* Top: 24h Expansion License Dutch Auction Rail & Exponential Curve */}
          <div className="w-full mb-5 p-3.5 bg-paper rounded-lg border border-ink/15 shadow-sm">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-ink-60">
              <span className="font-semibold">24h Dutch Auction Decay</span>
              <span className="text-gold font-bold">
                Price: {formatNumber(licensePrice)} $STANDARD
              </span>
            </div>

            {/* Scroll-Scrubbed Dutch Auction Exponential Decay Curve */}
            <div className="relative w-full h-14 overflow-visible">
              <ScrubbedConduit
                d={auctionCurvePath}
                progress={scrollYProgress}
                progressRange={[0, 1]}
                strokeColor="#b08d2e"
                strokeWidth={2.4}
                viewBox="0 0 400 60"
                className="w-full h-full"
                animatedGlow={true}
              />

              {/* Dynamic Tracking Marker along Dutch Auction Rail */}
              <div
                style={{
                  left: `calc(10px + ${trackProgress * 95}%)`,
                  top: `calc(12px + ${Math.pow(trackProgress, 0.8) * 32}px)`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold border-2 border-[#8e6e22] shadow-md transition-all duration-150 flex items-center justify-center pointer-events-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-paper" />
              </div>
            </div>

            <div className="flex justify-between items-center font-mono text-[9.5px] text-ink-60 font-medium pt-1 border-t border-ink/10">
              <span>00:00 (Open 2× Peak)</span>
              <span>12:00 (Exponential Decay)</span>
              <span>24:00 (Floor Reserve)</span>
            </div>
          </div>

          {/* Center: The Furnace with EMBER canvas */}
          <div className="relative w-full flex flex-col items-center mb-5">
            <Furnace burnTrigger={burnTimestamp} />

            {/* Parabolic Flying coins animation on buy */}
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

          {/* Current Branch Pips Status */}
          <div className="w-full flex items-center justify-between py-3 px-4 bg-paper rounded border border-ink/15 mb-4 font-mono text-xs shadow-sm">
            <span className="text-ink-60 uppercase text-[10px] font-semibold">Your Branches:</span>
            <span className="font-bold text-ink tracking-wider">{formatPips(branches, 10)}</span>
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
    </div>
  );
};
