"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { TollGate } from "../atoms/TollGate";
import { Receipt } from "../atoms/Receipt";
import { formatNumber, formatPercent } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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
  const cardStackRef = useRef<HTMLDivElement>(null);
  const tollPathRef = useRef<SVGPathElement>(null);
  const [hasRunTriggered, setHasRunTriggered] = useState<boolean>(false);
  const runnerIndices = new Set([0, 2, 3, 5, 7, 9, 11]);

  // Sticky Card Stacking on Banker NPC groups (Reference 04: scale down 0.95/0.90 + dimming)
  useEffect(() => {
    const el = containerRef.current;
    const stack = cardStackRef.current;
    if (!el || !stack) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const cards = gsap.utils.toArray<HTMLElement>(".banker-card-tier");
    if (cards.length === 0) return;

    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;

      gsap.to(card, {
        scale: 1 - (cards.length - index) * 0.05,
        opacity: 0.5,
        transformOrigin: "center top",
        scrollTrigger: {
          trigger: cards[index + 1],
          start: "top 60%",
          end: "top 25%",
          scrub: 1,
        },
      });
    });
  }, []);

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
      className="relative min-h-[220vh] border-t border-gold/25 bg-paper select-none overflow-hidden"
    >
      {/* Background warm light vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-ink/5" />

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~38% desktop) - ZERO text skew */}
        <div className="w-full lg:w-[38%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <div className="mb-4">
            <SplitChars
              text={content.copy}
              as="p"
              triggerOnScroll={true}
              stagger={0.015}
              className="font-serif text-lg sm:text-2xl text-ink leading-relaxed max-w-[34ch]"
            />
          </div>

          {/* 50/50 Fee Splitter Visualizer (Directly on Paper) */}
          <div className="py-3 border-y border-gold/30 mb-5">
            <div className="flex justify-between items-center text-[9.5px] font-mono uppercase tracking-wider text-ink-60 mb-1.5">
              <span className="text-gold font-bold">50% Stayers' Mugs</span>
              <span className="font-bold text-ink">RUNNER'S EXIT TOLL</span>
              <span className="text-red font-bold">50% Permanent Burn</span>
            </div>
            <div className="h-2 w-full bg-paper-deep/80 border border-gold/30 rounded-full overflow-hidden flex">
              <div className="h-full bg-gold w-1/2" />
              <div className="h-full bg-red w-1/2" />
            </div>
          </div>

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

        {/* Stage (~60% desktop): Bank Lobby with 12 Bankers directly on paper */}
        <div
          ref={cardStackRef}
          className="w-full lg:w-[60%] flex flex-col items-center justify-center order-1 lg:order-2"
        >
          {/* Top Bar: Toll Gate Arc + Status directly on paper */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-gold/30 mb-4">
            <div className="w-full sm:w-auto">
              <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 block font-bold">
                LOBBY STATUS:
              </span>
              <span className="font-serif font-bold text-base sm:text-lg text-ink">
                {hasRunTriggered ? "PANIC: RUN IN PROGRESS" : "NORMAL OPERATIONS (12 BANKERS)"}
              </span>
            </div>

            <div className="w-full sm:w-48">
              <TollGate feePercent={fee} exitPressure={exitPressure} />
            </div>
          </div>

          {/* 12 NPC Bankers Grid arranged in 3 stacking tiers */}
          <div className="w-full space-y-2 mb-5">
            {[0, 1, 2].map((tierIdx) => (
              <div
                key={tierIdx}
                className="banker-card-tier grid grid-cols-4 gap-2 p-1.5 border border-gold/20 rounded-xs bg-paper/40 will-change-transform"
              >
                {Array.from({ length: 4 }).map((_, colIdx) => {
                  const idx = tierIdx * 4 + colIdx;
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
            ))}
          </div>

          {/* Monumental Action Buttons */}
          {!hasRunTriggered ? (
            <button
              onClick={handleTriggerRun}
              aria-label={content.buttonRun}
              className="w-full sm:w-auto px-8 py-4 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-transform active:scale-95 cursor-pointer border border-red"
            >
              ⚠ TRIGGER {content.buttonRun}
            </button>
          ) : runChoice === null ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={() => handleChoice("STAY")}
                aria-label={content.buttonStay}
                className="flex-1 py-4 px-5 bg-gradient-to-b from-[#e6c374] via-[#c9a961] to-[#a38030] text-ink border border-gold rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                {content.buttonStay}
              </button>

              <button
                onClick={() => handleChoice("WITHDRAW")}
                aria-label={content.buttonWithdraw}
                className="flex-1 py-4 px-5 bg-paper border-2 border-red text-red hover:bg-red/10 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer"
              >
                {content.buttonWithdraw}
              </button>
            </div>
          ) : (
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
