"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { TollGate } from "../atoms/TollGate";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatPercent } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

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

  const [hasRunTriggered, setHasRunTriggered] = useState<boolean>(false);
  // Seeded NPC initial states (12 bankers: 7 will run, 5 will stay)
  const runnerIndices = new Set([0, 2, 3, 5, 7, 9, 11]);

  const handleTriggerRun = () => {
    setHasRunTriggered(true);
    triggerBankRun();
    sound.playThud();
  };

  const handleChoice = (choice: "STAY" | "WITHDRAW") => {
    chooseRunAction(choice);
    if (choice === "STAY") {
      sound.playChime();
    } else {
      sound.playCrackle();
    }
  };

  return (
    <section
      id="chapter-7"
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

        {/* Stage (~60% desktop): Bank Lobby */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center bg-paper-deep/50 p-6 sm:p-8 rounded border border-ink/15 shadow-sm">
          {/* Top Bar: Toll Gate Arc + Status */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-60 block mb-1">
                Lobby Status
              </span>
              <span className="font-serif font-semibold text-lg text-ink">
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
                  mugLevel = 0.8; // Filled from runners
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
              className="px-8 py-3.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-sm font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
            >
              ⚠ TRIGGER {content.buttonRun}
            </button>
          ) : runChoice === null ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <button
                onClick={() => handleChoice("STAY")}
                aria-label={content.buttonStay}
                className="flex-1 py-3 px-4 bg-gold hover:bg-gold-bright text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase shadow transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
              >
                {content.buttonStay}
              </button>

              <button
                onClick={() => handleChoice("WITHDRAW")}
                aria-label={content.buttonWithdraw}
                className="flex-1 py-3 px-4 bg-paper border border-red text-red hover:bg-red/10 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
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
                  value: `${formatNumber(runRewardOrFeePaid)} $STD`,
                },
                { label: "Exit Toll Rate", value: formatPercent(fee) },
                { label: "Burn Split", value: "50% Burned / 50% To Stayers" },
              ]}
              highlight={
                runChoice === "STAY"
                  ? `YOU STAYED. THE RUNNERS PAID YOU ${formatNumber(runRewardOrFeePaid)} $STD.`
                  : `YOU PAID ${formatNumber(runRewardOrFeePaid)} $STD TO EXIT.`
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};
