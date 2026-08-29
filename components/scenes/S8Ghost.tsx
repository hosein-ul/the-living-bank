"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { WaxSeal } from "../atoms/WaxSeal";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [hasReported, setHasReported] = useState<boolean>(false);
  const [bountyData, setBountyData] = useState<{ bounty: number; forfeited: number } | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const handleReport = () => {
    if (!hasReported) {
      setHasReported(true);
      sound.playShatter();
      sound.playThud();
      const res = reportGhost();
      setBountyData(res);

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#a33b2e", "#c9a961", "#b08d2e"],
          disableForReducedMotion: true,
        });
      }

      setTimeout(() => {
        sound.playCelebration();
      }, 250);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-[#eae5d8] select-none overflow-hidden"
    >
      {/* Layer 0: Background Dormant Hourglass Linework drifting [-30, -50] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-30, -50]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] max-w-none">
          <polygon points="300,200 500,200 400,400 500,600 300,600 400,400" fill="none" stroke="#a33b2e" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
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

        {/* Stage (~56% desktop): Dimmed Lobby with Ghost NPC */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/70 p-6 sm:p-8 rounded-lg border border-ink/20 shadow-[0_12px_32px_rgba(26,26,24,0.08)] order-1 lg:order-2">
          {/* Wall Poster: DORMANT 30 DAYS — BOUNTY 2% */}
          <div className="w-full flex items-center justify-between p-3.5 bg-paper rounded-lg border border-gold/50 mb-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                {content.poster}
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-gold font-bold">
              REWARD: 1,000 $STANDARD
            </span>
          </div>

          {/* NPCs in Dimmed Lobby: 1 Dormant Ghost Banker */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full mb-5">
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
                    className={isGhost && !hasReported ? "ring-2 ring-red/50 shadow-md" : ""}
                  />

                  {isGhost && hasReported && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red/20 rounded backdrop-blur-[1px]">
                      <WaxSeal text="CHARTER" subtext="REVOKED" size={54} cracked animateStamp />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dilution Yield Speedup Status */}
          <div className="w-full p-3 bg-paper rounded-lg border border-ink/15 flex items-center justify-between mb-5 font-mono text-xs shadow-sm">
            <span className="text-ink-60 uppercase text-[10px] font-semibold">Your Pro-Rata Yield Stream:</span>
            <span className="font-bold text-gold text-sm">{formatRate(accrualRate)}</span>
            <span className="text-[10px] text-green font-bold">
              {hasReported ? "▲ Dilution reduced (+20% faster)" : "Active"}
            </span>
          </div>

          {/* Report Button or Settlement Receipt */}
          {!hasReported ? (
            <button
              onClick={handleReport}
              aria-label={content.button}
              className="px-8 py-3.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-transform active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
            >
              ⚖ {content.button}
            </button>
          ) : (
            <Receipt
              title="DORMANCY RESOLUTION REPORT"
              lines={[
                { label: "Bounty Collected", value: "1,000 $STANDARD (2%)" },
                { label: "Ghost Forfeit (70%)", value: "35,000 $STANDARD" },
                { label: "Forfeit Burn (50%)", value: "17,500 $STANDARD" },
                { label: "Stayers Payout (50%)", value: "17,500 $STANDARD" },
                { label: "Ghost Wallet Return", value: "15,000 $STANDARD (30%)" },
                { label: "Charter Status", value: "PERMANENTLY REVOKED" },
              ]}
              highlight="GHOST PURGED. YIELD DILUTION ELIMINATED."
            />
          )}
        </div>
      </div>
    </div>
  );
};
