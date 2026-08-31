"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";


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

  // SVG Coin Routing along 70/15/15 paths scrubbed with GSAP ScrollTrigger
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

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // Move coins along paths using getPointAtLength
        if (path70 && coin70) {
          const pt = path70.getPointAtLength((p % 1) * len70);
          coin70.setAttribute("cx", `${pt.x}`);
          coin70.setAttribute("cy", `${pt.y}`);
        }
        if (path15a && coin15a) {
          const pt = path15a.getPointAtLength((p % 1) * len15a);
          coin15a.setAttribute("cx", `${pt.x}`);
          coin15a.setAttribute("cy", `${pt.y}`);
        }
        if (path15b && coin15b) {
          const pt = path15b.getPointAtLength((p % 1) * len15b);
          coin15b.setAttribute("cx", `${pt.x}`);
          coin15b.setAttribute("cy", `${pt.y}`);
        }

        // Scrubbed POL Lake water level rise
        if (polFillRef.current) {
          const basePct = Math.min(100, (pol / 200) * 100);
          const dynamicLevel = Math.min(100, basePct + p * 15);
          polFillRef.current.style.width = `${dynamicLevel}%`;
        }
      },
    });

    return () => st.kill();
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
      className="relative min-h-[260vh] border-t border-ink/10 bg-paper select-none"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
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

        {/* Stage (~56% desktop): The Vault Switchboard */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center p-4 order-1 lg:order-2">
          {/* Regime Switchboard Toggle */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-gold/20 mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-semibold">
              Active Vault Routing
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRegime("EXPANSION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold tracking-wider transition-all duration-240 cursor-pointer ${
                  isExpansion
                    ? "bg-green text-paper shadow-md"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-green hover:text-green"
                }`}
              >
                EXPANSION (GOLD)
              </button>

              <button
                onClick={() => {
                  setRegime("CONTRACTION");
                  sound.playTick();
                }}
                className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold tracking-wider transition-all duration-240 cursor-pointer ${
                  !isExpansion
                    ? "bg-red text-paper shadow-md"
                    : "bg-paper text-ink-60 border border-ink/15 hover:border-red hover:text-red"
                }`}
              >
                CONTRACTION (BUYBACK)
              </button>
            </div>
          </div>

          {/* SVG 3-Way Splitter Conduit with GSAP animated coins */}
          <div className="w-full h-12 relative flex items-center justify-center overflow-visible mb-2">
            <svg viewBox="0 0 400 45" className="w-full h-full overflow-visible">
              {/* Main Stem */}
              <path d="M 200 0 L 200 15" stroke="#b08d2e" strokeWidth="2.5" fill="none" />
              
              {/* 70% Branch (Left) */}
              <path
                ref={path70Ref}
                d="M 200 15 Q 200 25 70 38"
                stroke={isExpansion ? "#3d6b4f" : "#a33b2e"}
                strokeWidth="2.5"
                fill="none"
              />
              
              {/* 15% Center Branch */}
              <path
                ref={path15aRef}
                d="M 200 15 L 200 38"
                stroke="#b08d2e"
                strokeWidth="2"
                fill="none"
              />
              
              {/* 15% Right Branch */}
              <path
                ref={path15bRef}
                d="M 200 15 Q 200 25 330 38"
                stroke="#1a1a18"
                strokeWidth="2"
                fill="none"
              />

              {/* Animated Coins traveling along paths */}
              <circle ref={coin70Ref} cx="70" cy="38" r="4" fill={isExpansion ? "#c9a961" : "#a33b2e"} stroke="#1a1a18" strokeWidth="1" />
              <circle ref={coin15aRef} cx="200" cy="38" r="3.5" fill="#c9a961" stroke="#1a1a18" strokeWidth="0.8" />
              <circle ref={coin15bRef} cx="330" cy="38" r="3.5" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="0.8" />
            </svg>
          </div>

          {/* 3-Way Splitter Valve (70 / 15 / 15) */}
          <div className="w-full flex items-center justify-around mb-4 text-center font-mono text-xs bg-paper p-2.5 rounded border border-ink/15 shadow-sm">
            <div className="flex flex-col items-center">
              <span className={`font-bold text-base ${isExpansion ? "text-green" : "text-red"}`}>
                70%
              </span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">
                {isExpansion ? "Gold Vault" : "Buyback Vault"}
              </span>
            </div>
            <span className="text-ink-40 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-gold font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">POL Lake</span>
            </div>
            <span className="text-ink-40 font-bold">/</span>
            <div className="flex flex-col items-center">
              <span className="text-ink font-bold text-base">15%</span>
              <span className="text-[10px] text-ink-60 uppercase font-semibold">Team Purse</span>
            </div>
          </div>

          {/* 4 Vault Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {/* 1. Active Vault */}
            <div className="p-3.5 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[135px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-gold font-bold">
                  {isExpansion ? "GOLD VAULT (70%)" : "BUYBACK FURNACE (70%)"}
                </span>
                <span className="font-mono text-[9px] text-green font-bold bg-green/10 px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              {isExpansion ? (
                <div>
                  <div ref={goldStackRef} className="flex items-center gap-1.5 my-2.5 overflow-x-auto py-1">
                    {Array.from({ length: Math.min(10, Math.floor(gold / 5)) }).map((_, i) => (
                      <div
                        key={i}
                        className="gold-bar w-4 h-7 bg-gradient-to-b from-[#e6c374] to-[#b08d2e] border border-[#8e6e22] rounded-sm shadow-sm flex-shrink-0 origin-bottom"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-ink font-bold">
                    Accumulation: {Math.round(gold)} oz Tokenized Gold
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between my-2">
                    <span className="font-mono text-xs text-ink font-bold">
                      Budget: {formatNumber(contractionVault)} $STANDARD
                    </span>
                    <button
                      onClick={handlePuff}
                      disabled={contractionVault <= 0}
                      aria-label="Puff Buyback Step"
                      className="px-3 py-1.5 bg-red hover:bg-[#852f24] text-paper rounded font-mono text-[10px] uppercase font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
                    >
                      {puffing ? "PUFFING..." : "PUFF STEP"}
                    </button>
                  </div>
                  <p className="font-serif italic text-[11px] text-ink-60">
                    {content.captions.buyback}
                  </p>
                </div>
              )}
            </div>

            {/* 2. POL Lake */}
            <div className="p-3.5 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[135px] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink font-bold">
                  POL LAKE (15%)
                </span>
                <span className="font-mono text-[9px] text-ink-60 font-semibold">PERMANENT</span>
              </div>

              <div className="my-2">
                <div className="w-full h-3.5 bg-paper-deep border border-ink/20 rounded overflow-hidden shadow-inner">
                  <div
                    ref={polFillRef}
                    style={{ width: `${Math.min(100, (pol / 200) * 100)}%` }}
                    className="h-full bg-gold transition-all duration-300"
                  />
                </div>
                <span className="font-mono text-xs text-ink font-bold block mt-1.5">
                  Level: {Math.round(pol)} ETH POL
                </span>
              </div>

              <p className="font-serif italic text-[11px] text-ink-60">
                {content.captions.pol}
              </p>
            </div>

            {/* 3. Team Purse */}
            <div className="p-3.5 rounded-lg bg-paper border border-ink/15 flex flex-col justify-between min-h-[85px] shadow-sm sm:col-span-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink font-bold">
                  TEAM PURSE (15%)
                </span>
                <span className="font-mono text-xs font-bold text-ink">
                  {Math.round(team)} ETH Operational
                </span>
              </div>
              <p className="font-serif text-xs text-ink-60">
                Direct continuous funding for maintenance and immutable security verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
