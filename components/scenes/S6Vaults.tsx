"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const coin70Ref = useRef<SVGCircleElement>(null);
  const coin15aRef = useRef<SVGCircleElement>(null);
  const coin15bRef = useRef<SVGCircleElement>(null);
  const path70Ref = useRef<SVGPathElement>(null);
  const path15aRef = useRef<SVGPathElement>(null);
  const path15bRef = useRef<SVGPathElement>(null);
  const polFillRef = useRef<HTMLDivElement>(null);
  const goldStackRef = useRef<HTMLDivElement>(null);

  const [lastPuffTime, setLastPuffTime] = useState<number>(0);
  const [puffing, setPuffing] = useState<boolean>(false);

  // SVG Coin Routing along 70/15/15 paths with CONTINUOUS streaming flow + scroll modulation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const path70 = path70Ref.current;
    const path15a = path15aRef.current;
    const path15b = path15bRef.current;
    const coin70 = coin70Ref.current;
    const coin15a = coin15aRef.current;
    const coin15b = coin15bRef.current;

    const len70 = path70?.getTotalLength() || 100;
    const len15a = path15a?.getTotalLength() || 100;
    const len15b = path15b?.getTotalLength() || 100;

    let animId: number | null = null;
    let flowT = 0;
    let scrollProgress = 0;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        scrollProgress = self.progress;

        // Scrubbed POL Lake water level rise across full scroll range
        if (polFillRef.current) {
          const basePct = Math.min(100, (pol / 200) * 100);
          const dynamicLevel = Math.min(100, basePct + self.progress * 25);
          polFillRef.current.style.width = `${dynamicLevel}%`;
        }
      },
    });

    const streamLoop = () => {
      // Base continuous speed + scroll boost
      flowT += 0.012 + scrollProgress * 0.02;

      const p70 = (flowT) % 1;
      const p15a = (flowT + 0.33) % 1;
      const p15b = (flowT + 0.66) % 1;

      if (path70 && coin70) {
        const pt = path70.getPointAtLength(p70 * len70);
        coin70.setAttribute("cx", `${pt.x}`);
        coin70.setAttribute("cy", `${pt.y}`);
      }
      if (path15a && coin15a) {
        const pt = path15a.getPointAtLength(p15a * len15a);
        coin15a.setAttribute("cx", `${pt.x}`);
        coin15a.setAttribute("cy", `${pt.y}`);
      }
      if (path15b && coin15b) {
        const pt = path15b.getPointAtLength(p15b * len15b);
        coin15b.setAttribute("cx", `${pt.x}`);
        coin15b.setAttribute("cy", `${pt.y}`);
      }

      animId = requestAnimationFrame(streamLoop);
    };

    streamLoop();

    return () => {
      st.kill();
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [pol]);

  // Staggered rise of gold bars
  useEffect(() => {
    if (goldStackRef.current) {
      const bars = goldStackRef.current.querySelectorAll(".gold-bar");
      if (bars.length > 0) {
        gsap.fromTo(
          bars,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
        );
      }
    }
  }, [gold]);

  // Auto-puff buyback in contraction if balance is present
  useEffect(() => {
    if (regime === "CONTRACTION" && contractionVault > 0) {
      const interval = setInterval(() => {
        handlePuff();
      }, 900);
      return () => clearInterval(interval);
    }
  }, [regime, contractionVault]);

  const handlePuff = () => {
    const now = Date.now();
    if (now - lastPuffTime < 800) return;

    setLastPuffTime(now);
    setPuffing(true);
    sound.playFurnaceRoar();
    triggerBuybackPuff();

    setTimeout(() => {
      setPuffing(false);
    }, 420);
  };

  const isExpansion = regime === "EXPANSION";

  return (
    <section
      id="chapter-6"
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-gold/25 bg-paper select-none overflow-hidden"
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

          {/* Engraved Active Vault Routing Selector */}
          <div className="py-3 border-y border-gold/30 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 font-bold">
              ROUTING:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRegime("EXPANSION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[10.5px] font-bold tracking-wider transition-all duration-240 cursor-pointer border ${
                  isExpansion
                    ? "bg-green text-paper border-green shadow-sm"
                    : "bg-paper/70 text-ink-60 border-ink/20 hover:border-green hover:text-green"
                }`}
              >
                EXPANSION (GOLD)
              </button>

              <button
                onClick={() => {
                  setRegime("CONTRACTION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[10.5px] font-bold tracking-wider transition-all duration-240 cursor-pointer border ${
                  !isExpansion
                    ? "bg-red text-paper border-red shadow-sm"
                    : "bg-paper/70 text-ink-60 border-ink/20 hover:border-red hover:text-red"
                }`}
              >
                CONTRACTION (BUYBACK)
              </button>
            </div>
          </div>
        </div>

        {/* Stage (~60% desktop): 3 Round Vault Doors & Engraved Floor Conduits Directly on Paper */}
        <div className="w-full lg:w-[60%] flex flex-col items-center justify-center order-1 lg:order-2">
          {/* SVG 3-Way Splitter Conduit with Continuous Animated Coins */}
          <div className="w-full h-16 relative flex items-center justify-center overflow-visible mb-2">
            <svg viewBox="0 0 400 55" className="w-full h-full overflow-visible">
              {/* Main Stem */}
              <path d="M 200 0 L 200 18" stroke="#b08d2e" strokeWidth="2.5" fill="none" />
              
              {/* 70% Branch (Left) */}
              <path
                ref={path70Ref}
                d="M 200 18 Q 200 32 70 48"
                stroke={isExpansion ? "#3d6b4f" : "#a33b2e"}
                strokeWidth="2.5"
                fill="none"
              />
              
              {/* 15% Center Branch */}
              <path
                ref={path15aRef}
                d="M 200 18 L 200 48"
                stroke="#b08d2e"
                strokeWidth="2"
                fill="none"
              />
              
              {/* 15% Right Branch */}
              <path
                ref={path15bRef}
                d="M 200 18 Q 200 32 330 48"
                stroke="#1a1a18"
                strokeWidth="2"
                fill="none"
              />

              {/* Animated Coins traveling along paths */}
              <circle ref={coin70Ref} cx="70" cy="48" r="4.5" fill={isExpansion ? "#c9a961" : "#a33b2e"} stroke="#1a1a18" strokeWidth="1" />
              <circle ref={coin15aRef} cx="200" cy="48" r="4" fill="#c9a961" stroke="#1a1a18" strokeWidth="0.8" />
              <circle ref={coin15bRef} cx="330" cy="48" r="4" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="0.8" />
            </svg>
          </div>

          {/* 3-Way Splitter Proportions Line directly on paper */}
          <div className="w-full flex items-center justify-around mb-6 text-center font-mono text-xs py-2 border-y border-gold/30">
            <div className="flex flex-col items-center">
              <span className={`font-bold text-lg ${isExpansion ? "text-green" : "text-red"}`}>
                70%
              </span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">
                {isExpansion ? "Gold Vault" : "Buyback Furnace"}
              </span>
            </div>
            <span className="text-gold font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-gold font-bold text-lg">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">POL Reservoir</span>
            </div>
            <span className="text-gold font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-ink font-bold text-lg">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">Team Purse</span>
            </div>
          </div>

          {/* 3 Round Vault Doors Across the Width (Directly on Paper) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Vault 1: Primary 70% Vault */}
            <div className="flex flex-col items-center text-center p-3 border-t-2 border-gold/40">
              {/* Round Steel & Brass Vault Door Graphic */}
              <div className="w-20 h-20 rounded-full border-4 border-gold bg-gradient-to-br from-[#2a2926] via-[#1a1a18] to-[#121110] shadow-xl flex items-center justify-center relative mb-3">
                <div className="w-12 h-12 rounded-full border border-gold/60 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gold shadow-sm" />
                </div>
                {/* 4 Door Locking Spokes */}
                <div className="absolute w-full h-[2px] bg-gold/40" />
                <div className="absolute h-full w-[2px] bg-gold/40" />
              </div>

              <span className="font-mono text-xs uppercase font-bold text-gold tracking-wider block mb-1">
                {isExpansion ? "GOLD VAULT" : "BUYBACK"}
              </span>

              {isExpansion ? (
                <div>
                  <div ref={goldStackRef} className="flex items-center justify-center gap-1 my-2 overflow-x-auto py-1">
                    {Array.from({ length: Math.min(6, Math.floor(gold / 5)) }).map((_, i) => (
                      <div
                        key={i}
                        className="gold-bar w-3.5 h-6 bg-gradient-to-b from-[#e6c374] to-[#b08d2e] border border-[#8e6e22] rounded-xs shadow-xs"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-ink font-bold block">
                    {Math.round(gold)} oz Gold
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-mono text-[11px] text-ink font-bold block my-1">
                    {formatNumber(contractionVault)} $STANDARD
                  </span>
                  <button
                    onClick={handlePuff}
                    disabled={contractionVault <= 0}
                    aria-label="Puff Buyback Step"
                    className="px-2.5 py-1 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-[9.5px] uppercase font-bold transition-transform active:scale-95 cursor-pointer shadow-xs mt-1"
                  >
                    {puffing ? "PUFFING..." : "PUFF STEP"}
                  </button>
                </div>
              )}
            </div>

            {/* Vault 2: 15% POL Reservoir */}
            <div className="flex flex-col items-center text-center p-3 border-t-2 border-gold/40">
              {/* Round Steel Vault Door Graphic */}
              <div className="w-20 h-20 rounded-full border-4 border-gold/80 bg-gradient-to-br from-[#2a2926] via-[#1a1a18] to-[#121110] shadow-xl flex items-center justify-center relative mb-3">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
                  <span className="font-mono text-[11px] text-gold font-bold">15%</span>
                </div>
              </div>

              <span className="font-mono text-xs uppercase font-bold text-ink tracking-wider block mb-1">
                POL RESERVOIR
              </span>

              <div className="w-full my-2">
                <div className="w-full h-2.5 bg-paper-deep/80 border border-gold/40 rounded-full overflow-hidden shadow-inner">
                  <div
                    ref={polFillRef}
                    style={{ width: `${Math.min(100, (pol / 200) * 100)}%` }}
                    className="h-full bg-gold transition-all duration-300"
                  />
                </div>
                <span className="font-mono text-[11px] text-ink font-bold block mt-1">
                  {Math.round(pol)} ETH POL
                </span>
              </div>
            </div>

            {/* Vault 3: 15% Team Reserve Grate */}
            <div className="flex flex-col items-center text-center p-3 border-t-2 border-gold/40">
              {/* Brass Floor Grate Graphic */}
              <div className="w-20 h-20 rounded-full border-4 border-ink/80 bg-gradient-to-br from-[#2a2926] via-[#1a1a18] to-[#121110] shadow-xl flex items-center justify-center relative mb-3">
                <div className="w-12 h-12 rounded-full border border-ink/40 flex items-center justify-center">
                  <span className="font-mono text-[11px] text-paper font-bold">15%</span>
                </div>
              </div>

              <span className="font-mono text-xs uppercase font-bold text-ink tracking-wider block mb-1">
                TEAM PURSE
              </span>

              <span className="font-mono text-[11px] text-ink font-bold block my-2">
                {Math.round(team)} ETH Operational
              </span>
              <span className="font-serif italic text-[10px] text-ink-60">
                Immutable security
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
