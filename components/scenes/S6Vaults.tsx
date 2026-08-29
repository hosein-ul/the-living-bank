"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

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

  const [lastPuffTime, setLastPuffTime] = useState<number>(0);
  const [puffing, setPuffing] = useState<boolean>(false);

  // Rate limited buyback puff: max one per 900ms
  const handlePuff = () => {
    const now = Date.now();
    if (now - lastPuffTime < 900) return; // 900ms rate limit gate

    setLastPuffTime(now);
    setPuffing(true);
    sound.playCrackle();
    triggerBuybackPuff();

    setTimeout(() => {
      setPuffing(false);
    }, 420);
  };

  const isExpansion = regime === "EXPANSION";

  return (
    <section
      id="chapter-6"
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

          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
            {content.copy}
          </p>

          <div className="border-l-2 border-gold pl-4 py-1">
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </div>
        </div>

        {/* Stage (~60% desktop): The Vault Switchboard */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded border border-ink/15 shadow-sm">
          {/* Regime Switchboard Toggle */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-ink/10 mb-6">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-medium">
              Active Vault Routing
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRegime("EXPANSION")}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-semibold tracking-wider transition-all duration-240 ${
                  isExpansion
                    ? "bg-green text-paper shadow"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-green hover:text-green"
                }`}
              >
                EXPANSION (GOLD)
              </button>

              <button
                onClick={() => setRegime("CONTRACTION")}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-semibold tracking-wider transition-all duration-240 ${
                  !isExpansion
                    ? "bg-red text-paper shadow"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-red hover:text-red"
                }`}
              >
                CONTRACTION (BUYBACK)
              </button>
            </div>
          </div>

          {/* 3-Way Splitter Valve (70 / 15 / 15) */}
          <div className="w-full flex items-center justify-around mb-6 text-center font-mono text-xs bg-paper p-3 rounded border border-ink/10">
            <div className="flex flex-col items-center">
              <span className="text-gold font-bold text-base">70%</span>
              <span className="text-[10px] text-ink-60 uppercase">
                {isExpansion ? "Gold Vault" : "Buyback Vault"}
              </span>
            </div>
            <span className="text-ink-60 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-ink font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase">POL Lake</span>
            </div>
            <span className="text-ink-60 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-ink font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase">Team Purse</span>
            </div>
          </div>

          {/* 4 Vault Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* 1. Active Vault (Gold or Buyback Furnace) */}
            <div className="p-4 rounded bg-paper border border-ink/15 flex flex-col justify-between min-h-[140px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-wider text-gold font-bold">
                  {isExpansion ? "GOLD VAULT (70%)" : "BUYBACK FURNACE (70%)"}
                </span>
                <span className="font-mono text-[9px] text-ink-60">ACTIVE</span>
              </div>

              {isExpansion ? (
                <div>
                  <div className="flex items-center gap-1.5 my-2">
                    {/* Gold bar stacks */}
                    {Array.from({ length: Math.min(12, Math.floor(gold / 5)) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-6 bg-gold-bright border border-gold rounded-sm shadow-inner"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-ink font-semibold">
                    Accumulation: {Math.round(gold)} oz Tokenized Gold
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between my-2">
                    <span className="font-mono text-xs text-ink font-semibold">
                      Budget: {formatNumber(contractionVault)} $STD
                    </span>
                    <button
                      onClick={handlePuff}
                      disabled={contractionVault <= 0}
                      aria-label="Puff Buyback Step"
                      className="px-2.5 py-1 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-[10px] uppercase font-semibold transition-transform active:scale-95"
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
            <div className="p-4 rounded bg-paper border border-ink/15 flex flex-col justify-between min-h-[140px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink font-bold">
                  POL LAKE (15%)
                </span>
                <span className="font-mono text-[9px] text-ink-60">PERMANENT</span>
              </div>

              <div className="my-2">
                {/* Visual water/liquidity depth level */}
                <div className="w-full h-3 bg-paper-deep border border-ink/20 rounded overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (pol / 200) * 100)}%` }}
                    className="h-full bg-gold transition-all duration-420"
                  />
                </div>
                <span className="font-mono text-xs text-ink font-semibold block mt-1">
                  Level: {Math.round(pol)} ETH POL
                </span>
              </div>

              <p className="font-serif italic text-[11px] text-ink-60">
                {content.captions.pol}
              </p>
            </div>

            {/* 3. Team Purse (15%) */}
            <div className="p-4 rounded bg-paper border border-ink/15 flex flex-col justify-between min-h-[100px] shadow-sm sm:col-span-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink font-bold">
                  TEAM PURSE (15%)
                </span>
                <span className="font-mono text-xs font-semibold text-ink">
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
    </section>
  );
};
