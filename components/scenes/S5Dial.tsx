"use client";

import React, { useState } from "react";
import { useSim } from "../sim/SimProvider";
import { Dial } from "../atoms/Dial";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

export const S5Dial: React.FC = () => {
  const content = CHAPTERS_CONTENT.s5;
  const { m, regime, f, setRegime, advanceEpoch } = useSim((s) => ({
    m: s.m,
    regime: s.regime,
    f: s.f,
    setRegime: s.setRegime,
    advanceEpoch: s.advanceEpoch,
  }));

  const [isShaking, setIsShaking] = useState(false);

  const handleInflow = () => {
    advanceEpoch(0.35); // Sustained positive flow triggers +0.25 raise
    setRegime("EXPANSION");
    sound.playTick();
  };

  const handleOutflow = () => {
    // Negative signal slams rate to half immediately
    advanceEpoch(-0.75);
    setRegime("CONTRACTION");
    sound.playThud();

    // 120ms scene shake on slam per §3 spec
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 120);
  };

  return (
    <section
      id="chapter-5"
      className={`relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center bg-paper transition-transform ${
        isShaking ? "animate-shake" : ""
      }`}
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

        {/* Stage (~60% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center order-1 lg:order-2 bg-paper-deep/40 p-6 sm:p-8 rounded border border-ink/15 shadow-sm">
          {/* Regime Badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              Bank Regime:
            </span>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-240 ${
                regime === "EXPANSION"
                  ? "bg-green text-paper"
                  : "bg-red text-paper"
              }`}
            >
              {regime}
            </span>
          </div>

          {/* Monumental Brass Issuance Dial */}
          <Dial
            multiplier={m}
            isContraction={regime === "CONTRACTION"}
            flowHistory={f}
          />

          {/* Two-position Brass Lever */}
          <div className="mt-8 flex flex-col items-center w-full">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 mb-2">
              Policy Lever (INFLOW ⇄ OUTFLOW)
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleInflow}
                aria-label="Push Inflow (Small earned raise)"
                className={`px-5 py-2.5 rounded font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-240 ${
                  regime === "EXPANSION"
                    ? "bg-green text-paper shadow"
                    : "bg-paper-deep text-ink-60 border border-ink/20 hover:border-green hover:text-green"
                }`}
              >
                ▲ PUSH INFLOW (+0.25)
              </button>

              <button
                onClick={handleOutflow}
                aria-label="Pull Outflow (Instant cut & slam)"
                className={`px-5 py-2.5 rounded font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-240 ${
                  regime === "CONTRACTION"
                    ? "bg-red text-paper shadow"
                    : "bg-paper-deep text-ink-60 border border-ink/20 hover:border-red hover:text-red"
                }`}
              >
                ▼ PULL OUTFLOW (CUT 50%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
