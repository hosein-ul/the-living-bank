"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { Furnace } from "../atoms/Furnace";
import { formatNumber, formatPips, formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

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

  const [burnTimestamp, setBurnTimestamp] = useState<number>(0);
  const [hasBoughtOnce, setHasBoughtOnce] = useState<boolean>(false);
  const [flyingCoin, setFlyingCoin] = useState<boolean>(false);

  // 24h auction track decaying marker (0 to 1)
  const [trackProgress, setTrackProgress] = useState<number>(0.35);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrackProgress((prev) => (prev >= 1 ? 0 : prev + 0.005));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const isMaxBranches = branches >= 10;
  const isDailyLimit = licensesToday >= 3;
  const canBuy = !isMaxBranches && !isDailyLimit && balance >= licensePrice;

  const handleBuy = () => {
    if (canBuy) {
      setFlyingCoin(true);
      sound.playCrackle();
      setTimeout(() => {
        const ok = buyLicense();
        if (ok) {
          setBurnTimestamp(Date.now());
          setHasBoughtOnce(true);
          sound.playThud();
        }
        setFlyingCoin(false);
      }, 350);
    }
  };

  return (
    <section
      id="chapter-4"
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center bg-paper"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Copy Column (~40% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center">
          <div className="mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
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
                transition={{ duration: 0.42 }}
                className="p-3 bg-paper-deep border border-gold/30 rounded text-xs font-serif text-ink-60 italic mb-6 leading-relaxed"
              >
                {content.subtext}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-l-2 border-gold pl-4 py-1">
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </div>
        </div>

        {/* Stage (~60% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/40 p-6 sm:p-8 rounded border border-ink/15 shadow-sm">
          {/* Top: 24h Expansion License Dutch Auction Rail */}
          <div className="w-full mb-6">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-60">
              <span>24h Auction Rail</span>
              <span className="text-gold font-semibold">
                Price: {formatNumber(licensePrice)} $STD
              </span>
            </div>

            {/* Auction Rail Bar */}
            <div className="relative w-full h-3 bg-paper border border-ink/20 rounded-full flex items-center">
              {/* Exponential price gradient marker */}
              <div
                style={{ left: `${trackProgress * 100}%` }}
                className="absolute -translate-x-1/2 w-4 h-4 rounded-full bg-gold border-2 border-[#8e6e22] shadow transition-all duration-200 flex items-center justify-center"
              >
                <div className="w-1 h-1 rounded-full bg-paper" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-1 font-mono text-[9px] text-ink-60">
              <span>00:00 (Open 2×)</span>
              <span>12:00</span>
              <span>24:00 (Floor)</span>
            </div>
          </div>

          {/* Bottom: The Furnace with EMBER canvas */}
          <div className="relative w-full flex flex-col items-center mb-6">
            <Furnace burnTrigger={burnTimestamp} />

            {/* Flying coin animation on buy */}
            <AnimatePresence>
              {flyingCoin && (
                <motion.div
                  initial={{ y: 80, scale: 1, opacity: 1 }}
                  animate={{ y: -30, scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeIn" }}
                  className="absolute bottom-10 z-30 w-8 h-8 rounded-full bg-gold-bright border border-gold flex items-center justify-center font-mono text-[10px] font-bold text-ink"
                >
                  $
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current Branch Pips Status */}
          <div className="w-full flex items-center justify-between py-2.5 px-4 bg-paper rounded border border-ink/10 mb-4 font-mono text-xs">
            <span className="text-ink-60 uppercase text-[10px]">Your Branches:</span>
            <span className="font-semibold text-ink">{formatPips(branches, 10)}</span>
            <span className="text-gold font-medium">({formatRate(accrualRate)})</span>
          </div>

          {/* Buy Button */}
          <div className="w-full flex flex-col items-center">
            <button
              onClick={handleBuy}
              disabled={!canBuy}
              aria-label={content.button}
              className={`w-full py-3.5 rounded font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-240 ${
                canBuy
                  ? "bg-gold hover:bg-gold-bright text-paper shadow-md hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold"
                  : "bg-paper-deep text-ink-60 border border-ink/20 cursor-not-allowed"
              }`}
            >
              {isMaxBranches
                ? "MAX CAPACITY (10/10 BRANCHES)"
                : isDailyLimit
                ? "DAILY LIMIT REACHED (3/3 TODAY)"
                : `${content.button} (${formatNumber(licensePrice)} $STD)`}
            </button>

            <div className="flex justify-between w-full mt-2 font-mono text-[10px] text-ink-60">
              <span>Daily Bought: {licensesToday}/3</span>
              <span>100% of price is permanently burned</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
