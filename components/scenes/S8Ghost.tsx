"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { WaxSeal } from "../atoms/WaxSeal";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

export const S8Ghost: React.FC = () => {
  const content = CHAPTERS_CONTENT.s8;
  const {
    ghostsReported,
    accrualRate,
    reportGhost,
  } = useSim((s) => ({
    ghostsReported: s.ghostsReported,
    accrualRate: s.accrualRate,
    reportGhost: s.reportGhost,
  }));

  const [hasReported, setHasReported] = useState<boolean>(false);
  const [bountyData, setBountyData] = useState<{ bounty: number; forfeited: number } | null>(null);

  const handleReport = () => {
    if (!hasReported) {
      setHasReported(true);
      sound.playThud();
      const res = reportGhost();
      setBountyData(res);
      setTimeout(() => {
        sound.playChime();
      }, 300);
    }
  };

  return (
    <section
      id="chapter-8"
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center bg-[#eae5d8]"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Copy Column (~40% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1">
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

        {/* Stage (~60% desktop): Dimmed Lobby with Ghost NPC */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/60 p-6 sm:p-8 rounded border border-ink/20 shadow-md order-1 lg:order-2">
          {/* Wall Poster: DORMANT 30 DAYS — BOUNTY 2% */}
          <div className="w-full flex items-center justify-between p-3.5 bg-paper rounded border border-gold/40 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                {content.poster}
              </span>
            </div>
            <span className="font-mono text-[10px] text-gold font-semibold">
              REWARD: 1,000 $STD
            </span>
          </div>

          {/* NPCs in Dimmed Lobby: 1 Dormant Ghost Banker */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full mb-6">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isGhost = idx === 3;
              const state: NPCState = isGhost
                ? hasReported
                  ? "idle"
                  : "sleeping"
                : "idle";

              return (
                <div key={idx} className="relative">
                  <NPC
                    id={idx + 1}
                    state={state}
                    deskLabel={isGhost ? "GHOST BANKER" : `Banker #${(idx + 1).toString().padStart(2, "0")}`}
                    hasMug={!isGhost}
                    className={isGhost && !hasReported ? "ring-2 ring-red/40" : ""}
                  />

                  {isGhost && hasReported && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red/20 rounded">
                      <WaxSeal text="CHARTER" subtext="REVOKED" size={54} cracked />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dilution Yield Speedup Status */}
          <div className="w-full p-3 bg-paper rounded border border-ink/10 flex items-center justify-between mb-6 font-mono text-xs">
            <span className="text-ink-60 uppercase text-[10px]">Your Pro-Rata Yield Stream:</span>
            <span className="font-bold text-gold">{formatRate(accrualRate)}</span>
            <span className="text-[10px] text-ink-60 font-medium">
              {hasReported ? "▲ Dilution reduced (+20% faster)" : "Active"}
            </span>
          </div>

          {/* Report Button or Settlement Receipt */}
          {!hasReported ? (
            <button
              onClick={handleReport}
              aria-label={content.button}
              className="px-8 py-3.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
            >
              ⚖ {content.button}
            </button>
          ) : (
            <Receipt
              title="DORMANCY RESOLUTION REPORT"
              lines={[
                { label: "Bounty Collected", value: "1,000 $STD (2%)" },
                { label: "Ghost Forfeit (70%)", value: "35,000 $STD" },
                { label: "Forfeit Burn (50%)", value: "17,500 $STD" },
                { label: "Stayers Payout (50%)", value: "17,500 $STD" },
                { label: "Ghost Wallet Return", value: "15,000 $STD (30%)" },
                { label: "Charter Status", value: "PERMANENTLY REVOKED" },
              ]}
              highlight="GHOST PURGED. YIELD DILUTION ELIMINATED."
            />
          )}
        </div>
      </div>
    </section>
  );
};
