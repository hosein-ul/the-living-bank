"use client";

import React, { useRef } from "react";
import { useSim } from "../sim/SimProvider";
import { Dial } from "../atoms/Dial";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap } from "@/lib/gsap";

export const S5Dial: React.FC = () => {
  const content = CHAPTERS_CONTENT.s5;
  const { m, regime, f, setRegime, advanceEpoch } = useSim((s) => ({
    m: s.m,
    regime: s.regime,
    f: s.f,
    setRegime: s.setRegime,
    advanceEpoch: s.advanceEpoch,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const handleInflow = () => {
    advanceEpoch(0.35);
    setRegime("EXPANSION");
    sound.playRatchet();

    // Tiny scale punch on regime badge
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.25 },
        { scale: 1.0, duration: 0.3, ease: "back.out(2)" }
      );
    }
  };

  const handleOutflow = () => {
    advanceEpoch(-0.75);
    setRegime("CONTRACTION");
    sound.playThud();

    // 120ms GSAP scene shake on outflow cut per TASK2.md
    if (stageRef.current) {
      gsap.fromTo(
        stageRef.current,
        { x: -5, y: 3 },
        {
          x: 0,
          y: 0,
          duration: 0.12,
          ease: "rough({strength: 2, points: 10, template: power2.inOut, taper: 'out', randomize: true})",
          clearProps: "transform",
        }
      );
    }

    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.3 },
        { scale: 1.0, duration: 0.3, ease: "back.out(2)" }
      );
    }
  };

  return (
    <section
      id="chapter-5"
      ref={containerRef}
      className={`relative min-h-[260vh] border-t border-gold/25 select-none transition-colors duration-700 overflow-hidden ${
        regime === "EXPANSION" ? "bg-[#f3f5ee]" : "bg-[#f7ecea]"
      }`}
    >
      {/* Background regime color vignette wash */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          regime === "EXPANSION"
            ? "bg-[radial-gradient(circle_at_center,_rgba(61,107,79,0.08),_transparent_70%)]"
            : "bg-[radial-gradient(circle_at_center,_rgba(163,59,46,0.08),_transparent_70%)]"
        }`}
      />

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~38% desktop) - ZERO text skew */}
        <div className="w-full lg:w-[38%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              CHAPTER {content.numeral} · {content.title}
            </span>
          </div>

          <div className="mb-6">
            <SplitChars
              text={content.copy}
              as="p"
              triggerOnScroll={true}
              stagger={0.015}
              className="font-serif text-lg sm:text-2xl text-ink leading-relaxed max-w-[34ch]"
            />
          </div>

          {/* Gold Fraunces Italic Takeaway */}
          <div className="border-l-2 border-gold pl-4 py-1 mb-6">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>

          {/* Regime Indicator Line */}
          <div className="py-2.5 border-y border-gold/30 flex items-center justify-between font-mono text-xs mb-6">
            <span className="text-ink-60 uppercase tracking-widest">BANK REGIME:</span>
            <span
              ref={badgeRef}
              className={`font-bold tracking-wider uppercase inline-block will-change-transform ${
                regime === "EXPANSION" ? "text-green" : "text-red"
              }`}
            >
              ● {regime}
            </span>
          </div>

          {/* Two-position Brass Lever Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleInflow}
              aria-label="Push Inflow (Small earned raise)"
              className={`flex-1 py-3 px-4 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer border ${
                regime === "EXPANSION"
                  ? "bg-green text-paper border-green shadow-md hover:shadow-lg"
                  : "bg-paper/70 text-ink-60 border-ink/20 hover:border-green hover:text-green"
              }`}
            >
              ▲ PUSH INFLOW (+0.25)
            </button>

            <button
              onClick={handleOutflow}
              aria-label="Pull Outflow (Instant cut & slam)"
              className={`flex-1 py-3 px-4 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer border ${
                regime === "CONTRACTION"
                  ? "bg-red text-paper border-red shadow-md hover:shadow-lg"
                  : "bg-paper/70 text-ink-60 border-ink/20 hover:border-red hover:text-red"
              }`}
            >
              ▼ PULL OUTFLOW (CUT 50%)
            </button>
          </div>
        </div>

        {/* Stage (~60% desktop): Monumental Hero Dial Directly on Paper */}
        <div
          ref={stageRef}
          className="w-full lg:w-[60%] flex flex-col items-center justify-center order-1 lg:order-2 will-change-transform"
        >
          {/* Monumental Brass Issuance Dial */}
          <Dial
            multiplier={m}
            isContraction={regime === "CONTRACTION"}
            flowHistory={f}
          />
        </div>
      </div>
    </section>
  );
};
