"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { TollGate } from "../atoms/TollGate";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatPercent } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { ScrubbedConduit } from "../motion/ScrubbedConduit";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

export const S7Run: React.FC = () => {
  const content = CHAPTERS_CONTENT.s7;
  const {
    fee,
    exitPressure,
    runChoice,
    runRewardOrFeePaid,
    triggerBankRun,
    chooseRunAction,
  } = useSim((s) => ({
    fee: s.fee,
    exitPressure: s.exitPressure,
    runChoice: s.runChoice,
    runRewardOrFeePaid: s.runRewardOrFeePaid,
    triggerBankRun: s.triggerBankRun,
    chooseRunAction: s.chooseRunAction,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRunTriggered, setHasRunTriggered] = useState<boolean>(false);
  const runnerIndices = new Set([0, 2, 3, 5, 7, 9, 11]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const handleTriggerRun = () => {
    setHasRunTriggered(true);
    triggerBankRun();
    sound.playThud();
    sound.playShatter();
  };

  const handleChoice = (choice: "STAY" | "WITHDRAW") => {
    chooseRunAction(choice);
    if (choice === "STAY") {
      sound.playCelebration();
      sound.playCoinClink();
    } else {
      sound.playFurnaceRoar();
    }
  };

  // 50/50 Fee Splitter conduit paths
  const runnerInflowPath = "M 200 0 L 200 12";
  const stayerMugBranch = "M 200 12 Q 200 22 80 28";
  const burnCrucibleBranch = "M 200 12 Q 200 22 320 28";

  return (
    <section
      id="chapter-7"
      ref={containerRef as unknown as React.RefObject<HTMLElement>}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none"
    >
      {/* Layer 0: Background Panic Tension Linework drifting [-30, -50] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-30, -50]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] max-w-none">
          <circle cx="400" cy="400" r="320" fill="none" stroke="#a33b2e" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="200" y1="200" x2="600" y2="600" stroke="#a33b2e" strokeWidth="0.8" />
          <line x1="600" y1="200" x2="200" y2="600" stroke="#a33b2e" strokeWidth="0.8" />
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

          {/* 50/50 Fee Splitter Conduit Visualizer */}
          <div className="p-3 bg-paper-deep rounded border border-ink/15 mb-4 shadow-sm">
            <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-ink-60 mb-1">
              <span className="text-gold font-bold">50% Stayers' Mugs</span>
              <span>RUNNER'S EXIT TOLL</span>
              <span className="text-red font-bold">50% Permanent Burn</span>
            </div>

            <div className="relative w-full h-8 overflow-visible">
              <ScrubbedConduit
                d={runnerInflowPath}
                progress={scrollYProgress}
                progressRange={[0, 0.4]}
                strokeColor="#1a1a18"
                strokeWidth={2.2}
                viewBox="0 0 400 30"
                className="absolute inset-0 w-full h-full"
              />
              <ScrubbedConduit
                d={stayerMugBranch}
                progress={scrollYProgress}
                progressRange={[0.2, 0.85]}
                strokeColor="#b08d2e"
                strokeWidth={2.4}
                viewBox="0 0 400 30"
                className="absolute inset-0 w-full h-full"
                animatedGlow={true}
              />
              <ScrubbedConduit
                d={burnCrucibleBranch}
                progress={scrollYProgress}
                progressRange={[0.2, 0.85]}
                strokeColor="#a33b2e"
                strokeWidth={2.4}
                viewBox="0 0 400 30"
                className="absolute inset-0 w-full h-full"
                animatedGlow={true}
              />
            </div>
          </div>

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

        {/* Stage (~56% desktop): Bank Lobby */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded-lg border border-ink/15 shadow-[0_12px_32px_rgba(26,26,24,0.06)] order-1 lg:order-2">
          {/* Top Bar: Toll Gate Arc + Status */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="w-full sm:w-auto">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-60 block mb-1 font-semibold">
                Lobby Status
              </span>
              <span className="font-serif font-bold text-lg text-ink">
                {hasRunTriggered ? "PANIC: RUN IN PROGRESS" : "NORMAL OPERATIONS (12 BANKERS)"}
              </span>
            </div>

            <div className="w-full sm:w-48">
              <TollGate feePercent={fee} exitPressure={exitPressure} />
            </div>
          </div>

          {/* 12 NPC Bankers Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full mb-6">
            {Array.from({ length: 12 }).map((_, idx) => {
              const willRun = runnerIndices.has(idx);
              let state: NPCState = "idle";
              let mugLevel = 0;

              if (hasRunTriggered) {
                if (willRun) {
                  state = "running";
                } else {
                  state = "staying";
                  mugLevel = 0.85;
                }
              }

              return (
                <NPC
                  key={idx}
                  id={idx + 1}
                  state={state}
                  hasMug={!willRun || !hasRunTriggered}
                  mugLevel={mugLevel}
                />
              );
            })}
          </div>

          {/* Interaction Controls */}
          {!hasRunTriggered ? (
            <button
              onClick={handleTriggerRun}
              aria-label={content.buttonRun}
              className="px-8 py-3.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-transform active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
            >
              ⚠ TRIGGER {content.buttonRun}
            </button>
          ) : runChoice === null ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={() => handleChoice("STAY")}
                aria-label={content.buttonStay}
                className="flex-1 py-3.5 px-4 bg-gold hover:bg-gold-bright text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
              >
                {content.buttonStay}
              </button>

              <button
                onClick={() => handleChoice("WITHDRAW")}
                aria-label={content.buttonWithdraw}
                className="flex-1 py-3.5 px-4 bg-paper border border-red text-red hover:bg-red/10 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
              >
                {content.buttonWithdraw}
              </button>
            </div>
          ) : (
            /* Settlement Receipt */
            <Receipt
              title="BANK RUN RESOLUTION RECEIPT"
              lines={[
                { label: "Your Decision", value: runChoice },
                {
                  label: runChoice === "STAY" ? "Reward Collected" : "Resolution Fee Paid",
                  value: `${formatNumber(runRewardOrFeePaid)} $STANDARD`,
                },
                { label: "Exit Toll Rate", value: formatPercent(fee) },
                { label: "Burn Split", value: "50% Burned / 50% To Stayers" },
              ]}
              highlight={
                runChoice === "STAY"
                  ? `YOU STAYED. THE RUNNERS PAID YOU ${formatNumber(runRewardOrFeePaid)} $STANDARD.`
                  : `YOU PAID ${formatNumber(runRewardOrFeePaid)} $STANDARD TO EXIT.`
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};
