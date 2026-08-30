"use client";

import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export const S3Charter: React.FC = () => {
  const content = CHAPTERS_CONTENT.s3;
  const { claimedCharter, claimCharter } = useSim((s) => ({
    claimedCharter: s.claimedCharter,
    claimCharter: s.claimCharter,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const bookCoverRef = useRef<HTMLDivElement>(null);
  const sigPathRef = useRef<SVGPathElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(claimedCharter);
  const [signing, setSigning] = useState<boolean>(false);

  // Sync state if already claimed
  useEffect(() => {
    if (claimedCharter) {
      setIsOpen(true);
    }
  }, [claimedCharter]);

  // Entry scroll animation: counter slides up with heavy eased rise, ledger settles with shadow bloom
  useEffect(() => {
    const el = containerRef.current;
    const counter = counterRef.current;
    const book = bookRef.current;
    if (!el || !counter || !book) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      gsap.set(counter, { y: 0, opacity: 1 });
      gsap.set(book, { y: 0, opacity: 1, filter: "drop-shadow(0 20px 35px rgba(26,26,24,0.3))" });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "top 25%",
        scrub: 0.8,
      },
    });

    tl.fromTo(
      counter,
      { y: 120, opacity: 0.7 },
      { y: 0, opacity: 1, ease: "power2.out" },
      0
    );

    tl.fromTo(
      book,
      { y: 60, opacity: 0.5, filter: "drop-shadow(0 5px 10px rgba(26,26,24,0.1))" },
      { y: 0, opacity: 1, filter: "drop-shadow(0 25px 45px rgba(26,26,24,0.35))", ease: "power2.out" },
      0.1
    );

    return () => {
      tl.scrollTrigger?.kill();
    };
  }, []);

  // Animate signature pen stroke on claim
  const triggerSignatureAnimation = () => {
    const sigPath = sigPathRef.current;
    if (!sigPath) return;

    const length = sigPath.getTotalLength();
    sigPath.style.strokeDasharray = `${length}`;
    sigPath.style.strokeDashoffset = `${length}`;

    gsap.to(sigPath, {
      strokeDashoffset: 0,
      duration: 0.85,
      ease: "power2.inOut",
    });
  };

  const handleClaim = () => {
    if (!claimedCharter) {
      setIsOpen(true);
      setSigning(true);
      claimCharter();
      sound.playThud();
      sound.playCelebration();

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 3D Cover Opening animation with GSAP
      if (bookCoverRef.current && !isReduced) {
        gsap.fromTo(
          bookCoverRef.current,
          { rotateY: 0 },
          {
            rotateY: -180,
            duration: 0.95,
            ease: "power3.inOut",
            onComplete: () => {
              triggerSignatureAnimation();
            },
          }
        );
      } else {
        triggerSignatureAnimation();
      }

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#b08d2e", "#c9a961", "#e9e4d8", "#8e6e22"],
          disableForReducedMotion: true,
        });
      }
    }
  };

  return (
    <section
      id="chapter-3"
      ref={containerRef}
      className="relative min-h-[260vh] border-t border-gold/25 bg-paper select-none overflow-hidden"
    >
      {/* Background warm light vignette and wall panelling */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-ink/5" />

      {/* Engraved Wall Panelling Lines (Ink-wash style) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-around">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-full w-[1px] bg-gradient-to-b from-transparent via-gold/40 to-ink/30" />
        ))}
      </div>

      {/* Full-width hairline gold rule running across wall at counter level */}
      <div className="absolute top-[62%] left-0 w-full h-[1px] bg-gold/30 pointer-events-none" />

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~38% desktop) - ZERO text skew */}
        <div className="w-full lg:w-[38%] flex flex-col justify-center order-2 lg:order-1 mt-4 lg:mt-0 z-10">
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
          <div className="border-l-2 border-gold pl-4 py-1 mb-8">
            <KineticText
              text={`“${content.takeaway}”`}
              as="p"
              italicTakeaway={true}
              delay={0.15}
              className="font-serif italic text-gold text-sm sm:text-base tracking-wide"
            />
          </div>

          {/* Subcaption */}
          <span className="block font-mono text-[11px] text-ink-60">
            {content.subcaption}
          </span>
        </div>

        {/* Stage (~60% desktop): THE VAULT HANDOVER — Brass Counter & 3D Leather Ledger */}
        <div className="w-full lg:w-[60%] h-full relative order-1 lg:order-2 flex flex-col items-center justify-end pb-8 sm:pb-12 perspective-1200">
          {/* Overhead Desk Lamp Cone of Light */}
          <div className="absolute top-10 sm:top-14 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-[radial-gradient(ellipse_at_top,_rgba(230,195,116,0.32)_0%,_rgba(244,241,234,0.08)_50%,_transparent_75%)] rounded-full pointer-events-none" />

          {/* Ambient Gold Dust Particles in Light Cone */}
          <div className="absolute top-20 w-72 h-72 pointer-events-none opacity-60">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                style={{
                  top: `${(i * 19) % 100}%`,
                  left: `${(i * 27) % 100}%`,
                  animationDuration: `${3 + (i % 4)}s`,
                }}
                className="absolute w-1 h-1 rounded-full bg-gold animate-float opacity-75"
              />
            ))}
          </div>

          {/* HERO LEATHER LEDGER BOOK (Sitting on Counter) */}
          <div
            ref={bookRef}
            className="relative z-20 w-full max-w-[480px] sm:max-w-[540px] mb-[-12px] will-change-transform"
          >
            {/* BOOK 3D STAGE */}
            <div className="relative w-full aspect-[1.38/1] perspective-1200">
              {/* UNDERNEATH: TWO-PAGE SPREAD (Always upright, revealed when cover flips open) */}
              <div className="w-full h-full bg-[#fdfcf9] border-2 border-[#5c4033] shadow-2xl rounded-sm flex overflow-hidden relative">
                {/* Left Page: Leather Inlay & Protocol Authority Seal */}
                <div className="w-1/2 h-full p-4 sm:p-6 border-r border-gold/30 bg-[#f8f5ee] flex flex-col justify-between relative">
                  <div className="absolute inset-1.5 border border-gold/20 pointer-events-none" />
                  
                  <div>
                    <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-ink-60 block font-bold">
                      SOVEREIGN ONCHAIN CENTRAL BANK
                    </span>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-ink mt-1">
                      FOUNDING CHARTER
                    </h4>
                  </div>

                  <div className="font-serif text-[10px] sm:text-xs text-ink-60 leading-relaxed italic space-y-1.5">
                    <p>
                      “Be it known that the bearer operates a sovereign charter under immutable consensus rules.”
                    </p>
                    <div className="font-mono text-[9px] text-ink uppercase pt-1 border-t border-gold/20">
                      Transferable: <span className="text-red font-bold">NO (GENESIS)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gold/30">
                    <span className="font-mono text-[8px] text-ink-60">HASH: 0x42...1848</span>
                    <WaxSeal text="STANDARD" subtext="CHARTER" size={54} animateStamp={true} />
                  </div>
                </div>

                {/* Right Page: Charter Certificate with Hand-Drawn Animated Signature */}
                <div className="w-1/2 h-full p-4 sm:p-6 bg-[#fdfcf9] flex flex-col justify-between relative">
                  <div className="absolute inset-1.5 border border-gold/20 pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-gold font-bold">
                        DEED LICENSE
                      </span>
                      <h3 className="font-serif text-base sm:text-xl font-bold tracking-tight text-ink">
                        CHARTER №0042
                      </h3>
                    </div>
                    <span className="font-mono text-[8px] sm:text-[9px] text-green font-bold bg-green/10 px-1.5 py-0.5 rounded">
                      ACTIVE · SOULBOUND
                    </span>
                  </div>

                  {/* Hand-Drawn Signature Line with Pen Stroke Animation */}
                  <div className="my-2">
                    <span className="font-mono text-[8px] uppercase tracking-wider text-ink-60 block mb-0.5 font-semibold">
                      OFFICIAL SIGNATURE / ACCOUNT:
                    </span>
                    <div className="relative w-full h-9 border-b border-ink/40 flex items-center px-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 180 32">
                        <path
                          ref={sigPathRef}
                          d="M 10 22 C 30 10, 45 30, 70 14 C 95 2, 110 26, 135 12 C 150 4, 165 20, 175 16"
                          fill="none"
                          stroke="#1a1a18"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            strokeDasharray: "220",
                            strokeDashoffset: signing || claimedCharter ? "0" : "220",
                          }}
                        />
                      </svg>
                      <span className="absolute right-1 bottom-0.5 font-mono text-[7px] text-ink-40">
                        № 0042 / 1000
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-[9px] flex justify-between text-ink-60 border-t border-gold/20 pt-1.5">
                    <span>BRANCHES: <strong className="text-ink font-bold">1 / 10</strong></span>
                    <span className="text-gold font-bold">STREAM: +0.08/s</span>
                  </div>
                </div>

                {/* Gold Silk Ribbon Bookmark Unfurled */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-[115%] bg-gradient-to-b from-gold-bright via-gold to-[#8e6e22] shadow-md pointer-events-none rounded-b-xs z-10" />
              </div>

              {/* OVERLAY: 3D FRONT COVER (Flips open to the left on claim) */}
              {!claimedCharter && (
                <div
                  ref={bookCoverRef}
                  style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#1c130d] via-[#2c1e15] to-[#20150f] border-2 border-[#4a3325] shadow-2xl rounded p-6 sm:p-8 flex flex-col justify-between z-30 will-change-transform [backface-visibility:hidden]"
                >
                  {/* Leather Cover Texture & Inset Gold Spine Lines */}
                  <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gold/40" />
                  <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gold/20" />
                  <div className="absolute inset-3 border border-gold/25 rounded-xs pointer-events-none" />

                  {/* Cover Header */}
                  <div className="flex justify-between items-start pl-8">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-gold/80 block font-semibold">
                        SOVEREIGN RESERVE
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#e6c374] mt-1">
                        BANK LEDGER
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] text-[#e6c374]/80 font-bold border border-gold/40 px-2 py-0.5 rounded">
                      № 0042
                    </span>
                  </div>

                  {/* Center Embossed Medallion */}
                  <div className="flex items-center justify-center pl-8 my-auto">
                    <div className="w-16 h-16 rounded-full border-2 border-gold/50 bg-[#1e150f] flex items-center justify-center shadow-inner">
                      <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center">
                        <span className="font-serif font-bold text-gold text-lg">$</span>
                      </div>
                    </div>
                  </div>

                  {/* Cover Footer */}
                  <div className="flex justify-between items-end pl-8 border-t border-gold/20 pt-2 font-mono text-[9px] text-gold/60">
                    <span>STANDARD CHARTER</span>
                    <span>1890 PROTOCOL</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MONUMENTAL BRASS BANK COUNTER (Viewed from Front-Top) */}
          <div
            ref={counterRef}
            className="w-[92%] sm:w-[88%] max-w-4xl relative z-10 flex flex-col items-center will-change-transform"
          >
            {/* Brass Top Lip / Edge */}
            <div className="w-full h-4 sm:h-5 bg-gradient-to-r from-[#a38030] via-[#e6c374] to-[#a38030] rounded-t-sm shadow-md border-t border-gold-bright flex items-center justify-between px-6">
              <div className="w-12 h-[1px] bg-paper/50" />
              <div className="w-24 h-[1px] bg-paper/40" />
              <div className="w-12 h-[1px] bg-paper/50" />
            </div>

            {/* Dark Walnut Front Slab */}
            <div className="w-full h-20 sm:h-24 bg-gradient-to-b from-[#241710] via-[#1a110b] to-[#120b07] shadow-2xl border-t-2 border-[#5c4033] flex flex-col items-center justify-center px-6 relative overflow-hidden">
              {/* Counter Front Gold Inlay Rule */}
              <div className="absolute top-2.5 left-4 right-4 h-[1px] bg-gold/30 pointer-events-none" />

              {/* Brass Plaque Claim Button Embedded On Counter */}
              <button
                onClick={handleClaim}
                disabled={claimedCharter}
                aria-label={content.cta}
                className={`group px-8 py-3 rounded font-mono text-xs sm:text-sm uppercase tracking-widest font-bold transition-all duration-300 shadow-lg border cursor-pointer ${
                  claimedCharter
                    ? "bg-[#2e2017] text-gold/60 border-gold/30 cursor-default"
                    : "bg-gradient-to-b from-[#e6c374] via-[#c9a961] to-[#a38030] text-ink border-gold hover:shadow-xl active:scale-98"
                }`}
              >
                <span>{claimedCharter ? "✓ CHARTER ACTIVE · LEDGER HANDED OVER" : content.cta}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

