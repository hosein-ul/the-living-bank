"use client";

import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export const S3Charter: React.FC = () => {
  const content = CHAPTERS_CONTENT.s3;
  const { claimedCharter, claimCharter } = useSim((s) => ({
    claimedCharter: s.claimedCharter,
    claimCharter: s.claimCharter,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const frontCoverRef = useRef<HTMLDivElement>(null);
  const signaturePathRef = useRef<SVGPathElement>(null);
  const [stampAnimation, setStampAnimation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sync open state with claimedCharter
  useEffect(() => {
    if (claimedCharter) {
      setIsOpen(true);
    }
  }, [claimedCharter]);

  // Section entry GSAP reveal
  useEffect(() => {
    const el = containerRef.current;
    const bookEl = bookContainerRef.current;
    if (!el || !bookEl) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const st = gsap.fromTo(
      bookEl,
      {
        y: 40,
        opacity: 0.2,
        scale: 0.94,
      },
      {
        y: 0,
        opacity: 1.0,
        scale: 1.0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "top 30%",
          scrub: 0.8,
        },
      }
    );

    return () => {
      st.scrollTrigger?.kill();
    };
  }, []);

  const handleClaim = () => {
    if (!claimedCharter) {
      setStampAnimation(true);
      setIsOpen(true);
      claimCharter();
      sound.playThud();
      sound.playCelebration();

      // 3D Book Cover Opening Animation
      if (frontCoverRef.current) {
        gsap.to(frontCoverRef.current, {
          rotateY: -180,
          duration: 1.2,
          ease: "power2.inOut",
        });
      }

      // Fountain Pen Signature Drawing Path
      if (signaturePathRef.current) {
        const pathEl = signaturePathRef.current;
        const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 240;
        gsap.fromTo(
          pathEl,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.85, delay: 0.6, ease: "power2.out" }
        );
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#b08d2e", "#c9a961", "#1a1a18"],
        });
      } catch {}
    }
  };

  return (
    <section
      id="chapter-3"
      ref={containerRef}
      className="relative min-h-[140vh] py-24 sm:py-32 px-6 sm:px-12 flex flex-col items-center justify-center border-t border-gold/20 bg-paper overflow-hidden"
    >
      {/* Background Architectural Engraving */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          <line x1="100" y1="200" x2="1100" y2="200" stroke="#b08d2e" strokeWidth="1" strokeDasharray="8 6" />
          <line x1="100" y1="600" x2="1100" y2="600" stroke="#b08d2e" strokeWidth="1" strokeDasharray="8 6" />
          <rect x="250" y="150" width="700" height="500" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Copy & Narrative */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <KineticText
              text={`CHAPTER ${content.numeral} · ${content.title}`}
              as="span"
              velocityReactive={false}
              className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
            />
          </div>

          <p className="font-serif text-2xl sm:text-3xl text-ink leading-snug mb-6 font-medium">
            {content.copy}
          </p>

          <div className="border-l-2 border-gold pl-4 py-1 mb-8">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-base sm:text-lg tracking-wide"
            />
          </div>

          <span className="font-mono text-xs text-ink-60 tracking-wider uppercase">
            like the 1,000 Founding Charters at genesis
          </span>
        </div>

        {/* Right Column: The Monumental Vault Handover Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[520px]">
          {/* Overhead Desk Lamp Light Beam Cone */}
          <div
            className="absolute top-[-40px] w-[340px] sm:w-[480px] h-[480px] pointer-events-none opacity-45 z-0"
            style={{
              background:
                "radial-gradient(ellipse at top center, rgba(235, 203, 126, 0.45) 0%, rgba(244, 241, 234, 0) 70%)",
            }}
          />

          {/* 3D Ledger Book Container */}
          <div
            ref={bookContainerRef}
            className="relative z-10 w-full max-w-[460px] sm:max-w-[500px] h-[320px] sm:h-[350px] perspective-1000 mb-6"
          >
            {/* The Open Book Pages Base (Revealed when open) */}
            <div className="absolute inset-0 rounded bg-[#faf8f4] border border-gold/40 shadow-2xl flex overflow-hidden">
              {/* Left Page: Founding Charter */}
              <div className="w-1/2 p-4 sm:p-6 border-r border-ink/10 flex flex-col justify-between select-none bg-[#f6f2e9]/50">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 block mb-1">
                    SOVEREIGN ONCHAIN CENTRAL BANK
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink mb-3 uppercase tracking-tight">
                    FOUNDING CHARTER
                  </h4>
                  <p className="font-serif text-[11px] sm:text-xs text-ink-60 italic leading-relaxed mb-3">
                    “Be it known that the bearer operates a sovereign charter under immutable consensus rules.”
                  </p>
                  <div className="border-t border-ink/10 pt-2 text-[10px] font-mono text-ink-60">
                    <span>TRANSFERABLE: </span>
                    <span className="font-semibold text-ruby">NO (GENESIS)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-ink/10">
                  <span className="font-mono text-[9px] text-ink-60">
                    HASH: 0x42...1848
                  </span>
                  <WaxSeal text="STANDARD" subtext="CHARTER" size={44} animateStamp={stampAnimation} />
                </div>
              </div>

              {/* Right Page: Deed License & Animated Signature */}
              <div className="w-1/2 p-4 sm:p-6 flex flex-col justify-between select-none bg-[#faf8f4]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-gold font-semibold">
                      DEED LICENSE
                    </span>
                    <span className="px-1.5 py-0.5 text-[8px] font-mono bg-emerald-light text-emerald font-semibold rounded">
                      ACTIVE · SOULBOUND
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-ink mb-1">
                    CHARTER
                  </h3>
                  <span className="font-mono text-sm sm:text-base font-bold text-gold block mb-3">
                    №0042
                  </span>

                  {/* Fountain Pen Animated Signature */}
                  <div className="my-3 py-2 border-t border-b border-ink/10">
                    <span className="font-mono text-[9px] text-ink-60 block mb-1">
                      OFFICIAL SIGNATURE / ACCOUNT:
                    </span>
                    <svg viewBox="0 0 200 40" className="w-full h-8 overflow-visible">
                      <path
                        ref={signaturePathRef}
                        d="M 10 25 Q 35 5, 60 20 T 110 15 T 160 22 T 190 18"
                        fill="none"
                        stroke="#1a1a18"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 240,
                          strokeDashoffset: isOpen ? 0 : 240,
                          transition: "stroke-dashoffset 1s ease-out",
                        }}
                      />
                      <line x1="5" y1="32" x2="195" y2="32" stroke="#baa98c" strokeWidth="0.8" />
                      <text x="160" y="30" fontSize="7" fontFamily="monospace" fill="#8c8273">
                        № 0042 / 1000
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-ink-60 border-t border-ink/10 pt-2">
                  <span>BRANCHES: <strong className="text-ink">1</strong> / 10</span>
                  <span className="text-gold font-semibold">STREAM: +0.08/s</span>
                </div>
              </div>
            </div>

            {/* The 3D Rotating Front Cover Slab */}
            <div
              ref={frontCoverRef}
              className="absolute inset-0 rounded bg-[#2b241c] border-2 border-gold/60 shadow-2xl flex flex-col items-center justify-center p-6 text-center origin-left backface-hidden transition-transform duration-700"
              style={{
                transformStyle: "preserve-3d",
                transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Gold Embossed Cover Frame */}
              <div className="absolute inset-3 border border-gold/40 rounded flex flex-col items-center justify-between p-6 pointer-events-none">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-gold/80">
                  <span>LIBER PRIMUS</span>
                  <span>EST. MMXXVI</span>
                </div>
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-gold/80">
                  <span>GENESIS</span>
                  <span>№ 0042</span>
                </div>
              </div>

              {/* Center Gold Medallion & Title */}
              <div className="w-16 h-16 rounded-full border-2 border-gold bg-[#3d3327] flex items-center justify-center mb-4 shadow-md">
                <div className="w-11 h-11 rounded-full border border-dashed border-gold/70 flex items-center justify-center">
                  <span className="font-serif font-bold text-gold text-lg">§</span>
                </div>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold tracking-wider uppercase mb-1">
                SOVEREIGN LEDGER
              </h3>
              <span className="font-mono text-xs tracking-widest text-[#d8cdb4] uppercase">
                THE LIVING BANK
              </span>

              {/* Silk Gold Ribbon Bookmark */}
              <div className="absolute bottom-[-24px] right-10 w-6 h-14 bg-gradient-to-b from-gold to-[#c9a961] shadow-md clip-ribbon" />
            </div>
          </div>

          {/* Monumental Brass Bank Counter Slab */}
          <div className="w-full max-w-[540px] relative z-20">
            {/* Polished Brass Countertop */}
            <div className="h-3 w-full bg-gradient-to-r from-[#94742a] via-[#f0d48b] to-[#94742a] rounded-t border-t border-gold shadow-md" />
            {/* Dark Walnut Front Slab */}
            <div className="h-16 w-full bg-[#1e1914] border-x border-b border-[#3d3327] flex items-center justify-center px-6 shadow-xl">
              {!claimedCharter ? (
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 px-6 rounded bg-gradient-to-r from-gold via-gold-bright to-gold text-paper font-mono text-xs sm:text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-paper animate-pulse" />
                  TAKE YOUR CHARTER — FREE
                </button>
              ) : (
                <div className="font-mono text-xs uppercase tracking-widest text-gold/90 font-semibold flex items-center gap-2">
                  <span className="text-emerald font-bold">✓</span> CHARTER ACTIVE · LEDGER HANDED OVER
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default S3Charter;
