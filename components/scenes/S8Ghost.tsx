"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { NPC, NPCState } from "../atoms/NPC";
import { Receipt } from "../atoms/Receipt";
import { formatRate } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { gsap, ScrollTrigger } from "@/lib/gsap";


export const S8Ghost: React.FC = () => {
  const content = CHAPTERS_CONTENT.s8;
  const {
    accrualRate,
    reportGhost,
  } = useSim((s) => ({
    accrualRate: s.accrualRate,
    reportGhost: s.reportGhost,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ghostSealRef = useRef<HTMLDivElement>(null);
  const shard1Ref = useRef<SVGPathElement>(null);
  const shard2Ref = useRef<SVGPathElement>(null);
  const shard3Ref = useRef<SVGPathElement>(null);

  const [hasReported, setHasReported] = useState<boolean>(false);

  // Scrub-continuity: continuous pinned transform (ghost vignette + stage parallax)
  useEffect(() => {
    const el = containerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // Slight drift + vignette deepen through pin
        gsap.set(stage, { y: (p - 0.5) * -16 });
        el.style.setProperty("--ghost-vignette", String(0.06 + p * 0.1));
      },
    });
    return () => st.kill();
  }, []);

  const handleReport = () => {
    if (!hasReported) {
      setHasReported(true);
      sound.playShatter();
      sound.playThud();
      reportGhost();

      // GSAP SLAM shake on the stage
      if (stageRef.current) {
        gsap.fromTo(
          stageRef.current,
          { x: -6, y: 4 },
          {
            x: 0,
            y: 0,
            duration: 0.14,
            ease: "rough({strength: 2.5, points: 12, template: power2.inOut, taper: 'out', randomize: true})",
            clearProps: "transform",
          }
        );
      }

      // GSAP Physics-ish Scatter of 3 SVG Shard Paths
      if (shard1Ref.current && shard2Ref.current && shard3Ref.current) {
        gsap.to(shard1Ref.current, {
          x: -28,
          y: -22,
          rotate: -35,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
        gsap.to(shard2Ref.current, {
          x: 24,
          y: -18,
          rotate: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
        gsap.to(shard3Ref.current, {
          x: 0,
          y: 32,
          rotate: 15,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }

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
    <section
      id="chapter-8"
      ref={containerRef}
      className="relative min-h-[240vh] border-t border-ink/10 bg-[#eae5d8] select-none"
    >
      <div className="sticky top-0 h-[100svh] lg:h-screen w-full flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-16 max-w-7xl mx-auto overflow-hidden gap-4 lg:gap-0">
        {/* Copy Column (~42% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <KineticText
              text={`CHAPTER ${content.numeral} · ${content.title}`}
              as="span"
              velocityReactive={false}
              className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
            />
          </div>

          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
            {content.copy}
          </p>

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

        {/* Stage (~56% desktop): Dimmed Lobby with Ghost NPC */}
        <div
          ref={stageRef}
          className="w-full lg:w-[56%] flex flex-col items-center justify-center p-3 sm:p-4 order-1 lg:order-2 will-change-transform shrink-0"
        >
          {/* Wall Poster: DORMANT 30 DAYS — BOUNTY 2% */}
          <div className="w-full flex items-center justify-between py-2.5 px-3 border-t border-b border-gold/40 mb-5">
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
          <div className="grid grid-cols-4 gap-3 w-full mb-5">
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

                  {/* 3 SVG Shards that fly apart on REPORT */}
                  {isGhost && (
                    <div
                      ref={ghostSealRef}
                      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${
                        hasReported ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <svg viewBox="0 0 60 60" className="w-14 h-14 overflow-visible">
                        <path
                          ref={shard1Ref}
                          d="M 30 10 L 15 30 L 30 30 Z"
                          fill="#a33b2e"
                          stroke="#1a1a18"
                          strokeWidth="1"
                        />
                        <path
                          ref={shard2Ref}
                          d="M 30 10 L 45 30 L 30 30 Z"
                          fill="#a33b2e"
                          stroke="#1a1a18"
                          strokeWidth="1"
                        />
                        <path
                          ref={shard3Ref}
                          d="M 15 30 L 45 30 L 30 50 Z"
                          fill="#8c6d1d"
                          stroke="#1a1a18"
                          strokeWidth="1"
                        />
                      </svg>
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
    </section>
  );
};
