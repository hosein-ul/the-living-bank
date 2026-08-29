"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { ScrubbedConduit } from "../motion/ScrubbedConduit";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

export const S6Vaults: React.FC = () => {
  const content = CHAPTERS_CONTENT.s6;
  const {
    regime,
    gold,
    pol,
    team,
    contractionVault,
    setRegime,
    triggerBuybackPuff,
  } = useSim((s) => ({
    regime: s.regime,
    gold: s.gold,
    pol: s.pol,
    team: s.team,
    contractionVault: s.contractionVault,
    setRegime: s.setRegime,
    triggerBuybackPuff: s.triggerBuybackPuff,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastPuffTime, setLastPuffTime] = useState<number>(0);
  const [puffing, setPuffing] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const handlePuff = () => {
    const now = Date.now();
    if (now - lastPuffTime < 900) return;

    setLastPuffTime(now);
    setPuffing(true);
    sound.playFurnaceRoar();
    triggerBuybackPuff();

    setTimeout(() => {
      setPuffing(false);
    }, 420);
  };

  const isExpansion = regime === "EXPANSION";

  // Conduit SVG paths for 3-way Splitter
  const mainStemPath = "M 200 0 L 200 15";
  const branch70Path = "M 200 15 Q 200 25 70 30";
  const branch15CenterPath = "M 200 15 L 200 30";
  const branch15RightPath = "M 200 15 Q 200 25 330 30";

  return (
    <div
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none overflow-hidden"
    >
      {/* Layer 0: Background Vault Treasury Linework drifting [-30, -50] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-30, -50]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] max-w-none">
          <rect x="250" y="250" width="300" height="300" rx="20" fill="none" stroke="#b08d2e" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="110" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="60" fill="none" stroke="#3d6b4f" strokeWidth="0.8" />
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
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

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

        {/* Stage (~56% desktop): The Vault Switchboard */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)] order-1 lg:order-2">
          {/* Regime Switchboard Toggle */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-ink/10 mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-semibold">
              Active Vault Routing
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRegime("EXPANSION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold tracking-wider transition-all duration-240 cursor-pointer ${
                  isExpansion
                    ? "bg-green text-paper shadow-md"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-green hover:text-green"
                }`}
              >
                EXPANSION (GOLD)
              </button>

              <button
                onClick={() => {
                  setRegime("CONTRACTION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold tracking-wider transition-all duration-240 cursor-pointer ${
                  !isExpansion
                    ? "bg-red text-paper shadow-md"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-red hover:text-red"
                }`}
              >
                CONTRACTION (BUYBACK)
              </button>
            </div>
          </div>

          {/* SVG Dynamic Scrubbed Conduits for 70/15/15 Splitter */}
          <div className="w-full h-10 mb-2 relative flex items-center justify-center overflow-visible">
            {/* Main Inflow Stem */}
            <ScrubbedConduit
              d={mainStemPath}
              progress={scrollYProgress}
              progressRange={[0, 0.4]}
              strokeColor="#b08d2e"
              strokeWidth={2.4}
              viewBox="0 0 400 35"
              className="absolute inset-0 w-full h-full"
            />
            {/* 70% Branch (Gold or Red depending on Regime) */}
            <ScrubbedConduit
              d={branch70Path}
              progress={scrollYProgress}
              progressRange={[0.2, 0.85]}
              strokeColor={isExpansion ? "#3d6b4f" : "#a33b2e"}
              strokeWidth={2.6}
              viewBox="0 0 400 35"
              className="absolute inset-0 w-full h-full"
              animatedGlow={true}
            />
            {/* 15% Center Branch (POL Lake) */}
            <ScrubbedConduit
              d={branch15CenterPath}
              progress={scrollYProgress}
              progressRange={[0.2, 0.85]}
              strokeColor="#b08d2e"
              strokeWidth={2.0}
              viewBox="0 0 400 35"
              className="absolute inset-0 w-full h-full"
            />
            {/* 15% Right Branch (Team Purse) */}
            <ScrubbedConduit
              d={branch15RightPath}
              progress={scrollYProgress}
              progressRange={[0.2, 0.85]}
              strokeColor="#1a1a18"
              strokeWidth={2.0}
              viewBox="0 0 400 35"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* 3-Way Splitter Valve (70 / 15 / 15) */}
          <div className="w-full flex items-center justify-around mb-5 text-center font-mono text-xs bg-paper p-3 rounded border border-ink/15 shadow-sm">
            <div className="flex flex-col items-center">
              <span className={`font-bold text-base ${isExpansion ? "text-green" : "text-red"}`}>
                70%
              </span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">
                {isExpansion ? "Gold Vault" : "Buyback Vault"}
              </span>
            </div>
            <span className="text-ink-40 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-gold font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">POL Lake</span>
            </div>
            <span className="text-ink-40 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-ink font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">Team Purse</span>
            </div>
          </div>

          {/* 4 Vault Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* 1. Active Vault (Gold or Buyback Furnace) */}
            <div className="p-4 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[140px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-gold font-bold">
                  {isExpansion ? "GOLD VAULT (70%)" : "BUYBACK FURNACE (70%)"}
                </span>
                <span className="font-mono text-[9px] text-green font-bold bg-green/10 px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              {isExpansion ? (
                <div>
                  <div className="flex items-center gap-1.5 my-2.5 overflow-x-auto py-1">
                    {/* Gold bar stacks */}
                    {Array.from({ length: Math.min(10, Math.floor(gold / 5)) }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-7 bg-gradient-to-b from-[#e6c374] to-[#b08d2e] border border-[#8e6e22] rounded-sm shadow-sm flex-shrink-0"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-ink font-bold">
                    Accumulation: {Math.round(gold)} oz Tokenized Gold
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between my-2">
                    <span className="font-mono text-xs text-ink font-bold">
                      Budget: {formatNumber(contractionVault)} $STANDARD
                    </span>
                    <button
                      onClick={handlePuff}
                      disabled={contractionVault <= 0}
                      aria-label="Puff Buyback Step"
                      className="px-3 py-1.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-[10px] uppercase font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
                    >
                      {puffing ? "PUFFING..." : "PUFF STEP"}
                    </button>
                  </div>
                  <p className="font-serif italic text-[11px] text-ink-60">
                    {content.captions.buyback}
                  </p>
                </div>
              )}
            </div>

            {/* 2. POL Lake (Liquidity that can never be pulled) */}
            <div className="p-4 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[140px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink font-bold">
                  POL LAKE (15%)
                </span>
                <span className="font-mono text-[9px] text-ink-60 font-semibold">PERMANENT</span>
              </div>

              <div className="my-2">
                <div className="w-full h-3.5 bg-paper-deep border border-ink/20 rounded overflow-hidden shadow-inner">
                  <div
                    style={{ width: `${Math.min(100, (pol / 200) * 100)}%` }}
                    className="h-full bg-gold transition-all duration-420"
                  />
                </div>
                <span className="font-mono text-xs text-ink font-bold block mt-1.5">
                  Level: {Math.round(pol)} ETH POL
                </span>
              </div>

              <p className="font-serif italic text-[11px] text-ink-60">
                {content.captions.pol}
              </p>
            </div>

            {/* 3. Team Purse (15%) */}
            <div className="p-4 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[90px] shadow-sm sm:col-span-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink font-bold">
                  TEAM PURSE (15%)
                </span>
                <span className="font-mono text-xs font-bold text-ink">
                  {Math.round(team)} ETH Operational
                </span>
              </div>
              <p className="font-serif text-xs text-ink-60">
                Direct continuous funding for maintenance and immutable security verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
