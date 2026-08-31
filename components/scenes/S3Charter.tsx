"use client";

import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";


export const S3Charter: React.FC = () => {
  const content = CHAPTERS_CONTENT.s3;
  const { claimedCharter, claimCharter } = useSim((s) => ({
    claimedCharter: s.claimedCharter,
    claimCharter: s.claimCharter,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const [stampAnimation, setStampAnimation] = useState(false);

  // GSAP quickTo setters for 3D card tilt (max 8°)
  const setRotateXRef = useRef<((val: number) => void) | null>(null);
  const setRotateYRef = useRef<((val: number) => void) | null>(null);

  useEffect(() => {
    if (cardRef.current) {
      setRotateXRef.current = gsap.quickTo(cardRef.current, "rotateX", { duration: 0.4, ease: "power2.out" });
      setRotateYRef.current = gsap.quickTo(cardRef.current, "rotateY", { duration: 0.4, ease: "power2.out" });
    }
  }, []);

  // Section entry clip-path curtain wipe reveal with GSAP ScrollTrigger
  useEffect(() => {
    const el = containerRef.current;
    const cardWrapper = cardWrapperRef.current;
    if (!el || !cardWrapper) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const st = gsap.fromTo(
      cardWrapper,
      {
        clipPath: "inset(18% 18% round 24px)",
        scale: 0.9,
        opacity: 0.4,
      },
      {
        clipPath: "inset(0% 0% round 8px)",
        scale: 1.0,
        opacity: 1.0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "top 25%",
          scrub: 0.8,
        },
      }
    );

    return () => {
      st.scrollTrigger?.kill();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // Max 8 degrees tilt per TASK2.md
    setRotateXRef.current?.(-ny * 16);
    setRotateYRef.current?.(nx * 16);

    // Specular sheen highlight positioning
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0.35";
      sheenRef.current.style.transform = `translate(${nx * 60}px, ${ny * 60}px)`;
    }
  };

  const handlePointerLeave = () => {
    setRotateXRef.current?.(0);
    setRotateYRef.current?.(0);
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0";
    }
  };

  const handleClaim = () => {
    if (!claimedCharter) {
      setStampAnimation(true);
      claimCharter();
      sound.playThud();
      sound.playCelebration();

      // GSAP STAMP animation on deed card (scale 1.6 -> 1, blur 8 -> 0)
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { scale: 1.4, filter: "blur(6px)", y: -30 },
          {
            scale: 1.0,
            filter: "blur(0px)",
            y: 0,
            duration: 0.64,
            ease: "back.out(2.0)",
          }
        );
      }

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 45,
          spread: 75,
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
      className="relative min-h-[250vh] border-t border-ink/10 bg-paper select-none"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) with Velocity Skew */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
              <KineticText
                text={`CHAPTER ${content.numeral} · ${content.title}`}
                as="span"
                velocityReactive={true}
                className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
              />
            </div>

            <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6">
              {content.copy}
            </p>

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

            {/* Interactive Claim Button */}
            <div>
              <button
                onClick={handleClaim}
                disabled={claimedCharter}
                aria-label={content.cta}
                className={`group relative px-6 py-3.5 rounded font-mono text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-sm ${
                  claimedCharter
                    ? "bg-paper-deep text-ink-60 border border-gold/40 cursor-default"
                    : "bg-gold text-paper hover:bg-gold-bright hover:text-ink hover:shadow-md active:scale-95"
                }`}
              >
                <span>{claimedCharter ? "CHARTER CLAIMED · SOULBOUND" : content.cta}</span>
                {!claimedCharter && (
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
              <span className="block font-mono text-[11px] text-ink-60 mt-2">
                {content.subcaption}
              </span>
            </div>
          </div>

        {/* 3D Charter Deed Card (~55% desktop) with Clip-Path Curtain Wipe */}
        <div className="w-full lg:w-[55%] h-[420px] sm:h-[500px] lg:h-[560px] relative order-1 lg:order-2 flex items-center justify-center p-4 perspective-1000">
          <div
            ref={cardWrapperRef}
            className="w-full max-w-[420px] will-change-transform"
          >
            <div
              ref={cardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-full aspect-[1/1.38] bg-[#fbf9f4] border-2 border-gold/60 rounded-lg p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-shadow duration-300 transform-style-3d overflow-hidden will-change-transform"
            >
              {/* Specular sheen reflection overlay */}
              <div
                ref={sheenRef}
                className="absolute -inset-10 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 pointer-events-none transition-opacity duration-300"
              />

              {/* Watermark Deed Border */}
              <div className="absolute inset-2 border border-dashed border-gold/30 rounded pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex justify-between items-start border-b border-ink/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 block">
                    GENESIS SOULBOUND LICENSE
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
                    {content.deed}
                  </h3>
                </div>
                <div className="text-right font-mono text-[10px] text-gold tracking-wider">
                  1 OF 1,000
                  <span className="block text-ink-60">FOUNDING</span>
                </div>
              </div>

              {/* Body text */}
              <div className="relative z-10 my-4 space-y-3 font-serif text-xs sm:text-sm text-ink-60 leading-relaxed">
                <p>
                  Be it known that the holder of this deed is authorized to operate a banking charter within the sovereign onchain central bank.
                </p>
                <div className="p-3 bg-paper-deep/60 rounded border border-ink/10 font-mono text-[11px] text-ink space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-60">STATUS:</span>
                    <span className="text-green font-semibold">
                      {claimedCharter ? "ACTIVE · SOULBOUND" : "UNCLAIMED"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-60">INITIAL BRANCHES:</span>
                    <span className="font-semibold">1 / 10 MAX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-60">TRANSFERABLE:</span>
                    <span className="text-red font-semibold">NO (GENESIS)</span>
                  </div>
                </div>
              </div>

              {/* Footer Seal Stamp */}
              <div className="relative z-10 flex justify-between items-end pt-3 border-t border-ink/10">
                <div className="font-mono text-[9px] text-ink-60">
                  <span>AUTHORITY: STANDARD PROTOCOL</span>
                  <span className="block">HASH: 0x42...1848</span>
                </div>

                <div className="relative cursor-pointer" onClick={handleClaim}>
                  <WaxSeal
                    text="STANDARD"
                    subtext="CHARTER"
                    size={76}
                    animateStamp={stampAnimation || claimedCharter}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
