"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";
import { KineticText } from "../motion/KineticText";
import { MultiParallaxLayer } from "../motion/MultiParallaxLayer";

export const S3Charter: React.FC = () => {
  const content = CHAPTERS_CONTENT.s3;
  const { claimedCharter, claimCharter } = useSim((s) => ({
    claimedCharter: s.claimedCharter,
    claimCharter: s.claimCharter,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [stampAnimation, setStampAnimation] = useState(false);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const parchmentUnroll = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // 3D Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), { stiffness: 180, damping: 18 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClaim = () => {
    if (!claimedCharter) {
      setStampAnimation(true);
      claimCharter();
      sound.playThud();
      sound.playCelebration();

      // Confetti burst with gold paper flakes
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
    <div
      ref={containerRef}
      className="relative min-h-[250vh] border-t border-ink/10 bg-paper select-none overflow-hidden"
    >
      {/* Layer 0: Background Sovereign Seal Watermark drifting [-35, -45] */}
      <MultiParallaxLayer
        progress={scrollYProgress}
        vector={[-35, -45]}
        className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] max-w-none">
          <polygon
            points="400,50 490,260 720,260 540,400 600,620 400,480 200,620 260,400 80,260 310,260"
            fill="none"
            stroke="#b08d2e"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <circle cx="400" cy="400" r="320" fill="none" stroke="#b08d2e" strokeWidth="0.8" />
        </svg>
      </MultiParallaxLayer>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <motion.div
          style={{ y: copyY }}
          className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-live-dot" />
            <KineticText
              text={`CHAPTER ${content.numeral} · ${content.title}`}
              as="span"
              velocityReactive={true}
              className="font-mono text-xs uppercase tracking-widest text-gold font-semibold"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          {/* Gold Fraunces Italic Takeaway with KineticText */}
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
        </motion.div>

        {/* 3D Charter Deed Card (~55% desktop) */}
        <div className="w-full lg:w-[55%] h-[420px] sm:h-[500px] lg:h-[560px] relative order-1 lg:order-2 flex items-center justify-center p-4 perspective-1000">
          <MultiParallaxLayer
            progress={scrollYProgress}
            vector={[40, -25]}
            className="w-full max-w-[420px]"
          >
            <motion.div
              ref={cardRef}
              style={{
                rotateX: isReduced ? 0 : rotateX,
                rotateY: isReduced ? 0 : rotateY,
                scale: isReduced ? 1 : parchmentUnroll,
                transformStyle: "preserve-3d",
              }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-full aspect-[1/1.38] bg-[#fbf9f4] border-2 border-gold/60 rounded-lg p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-shadow duration-300"
            >
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

              {/* Body text & Calligraphy */}
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
            </motion.div>
          </MultiParallaxLayer>
        </div>
      </div>
    </div>
  );
};
