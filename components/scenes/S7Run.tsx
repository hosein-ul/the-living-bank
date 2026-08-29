"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { TollGate } from "../atoms/TollGate";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatPercent } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";

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

  const containerRef = useRef<HTMLElement>(null);
  const [hasRunTriggered, setHasRunTriggered] = useState<boolean>(false);
  const runnerIndices = new Set([0, 2, 3, 5, 7, 9, 11]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

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

  return (
    <section
      id="chapter-7"
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper"
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
