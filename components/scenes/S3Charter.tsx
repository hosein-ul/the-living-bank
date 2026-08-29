"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { EASINGS } from "@/lib/easings";

export const S3Charter: React.FC = () => {
  const content = CHAPTERS_CONTENT.s3;
  const { claimedCharter, claimCharter } = useSim((s) => ({
    claimedCharter: s.claimedCharter,
    claimCharter: s.claimCharter,
  }));

  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [stampAnimation, setStampAnimation] = useState(false);

  // 3D Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), { stiffness: 180, damping: 18 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
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
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#b08d2e", "#c9a961", "#e9e4d8", "#8c6d1d"],
          disableForReducedMotion: true,
        });
      }
    }
  };

  return (
    <section
      id="chapter-3"
      ref={containerRef}
      className="relative min-h-[250vh] border-t border-ink/10 bg-paper"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto overflow-hidden">
        {/* Copy Column (~42% desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center order-2 lg:order-1 mt-6 lg:mt-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.smooth }}
            className="mb-3"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              CHAPTER {content.numeral} · {content.title}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.smooth }}
            className="font-serif text-lg sm:text-xl text-ink leading-relaxed max-w-[34ch] mb-6"
          >
            {content.copy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.smooth }}
            className="border-l-2 border-gold pl-4 py-1"
          >
            <p className="font-serif italic text-lg sm:text-xl text-gold font-medium">
              &ldquo;{content.takeaway}&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Stage (~56% desktop) */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="relative flex flex-col items-center" style={{ perspective: 1000 }}>
            {/* The Soulbound Charter Deed (Paper with 3D Tilt & Specular Lighting) */}
            <motion.div
              ref={cardRef}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              initial={{ rotate: 3, scale: 0.95 }}
              animate={
                claimedCharter
                  ? { scale: 1 }
                  : { rotate: [3, 2, 3.5, 3] }
              }
              transition={{ duration: 5, repeat: claimedCharter ? 0 : Infinity, ease: "easeInOut" }}
              className={`relative w-[320px] sm:w-[380px] p-7 sm:p-9 bg-paper-deep border-2 rounded-lg shadow-[0_16px_40px_rgba(26,26,24,0.12)] text-center transition-all duration-500 cursor-pointer ${
                claimedCharter
                  ? "border-gold ring-4 ring-gold/20 shadow-[0_20px_50px_rgba(176,141,46,0.2)]"
                  : "border-gold/50 hover:border-gold"
              }`}
            >
              {/* Corner filigree accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold/60" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/60" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/60" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold/60" />

              {/* Soulbound Crest & Header */}
              <div className="flex justify-center mb-3">
                <WaxSeal text="FOUNDING" subtext="CHARTER" size={72} animateStamp={stampAnimation} />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-60 block mb-1">
                SOVEREIGN LICENSE
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-2">
                {content.deed}
              </h3>

              <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-3" />

              <p className="font-serif text-xs text-ink-60 leading-relaxed max-w-[30ch] mx-auto italic mb-4">
                Grants sole operational authority to maintain up to ten branches within the Standard Reserve. Soulbound & non-transferable.
              </p>

              {/* Dynamic Calligraphy Ink Signature */}
              {claimedCharter && (
                <div className="my-3 flex flex-col items-center">
                  <svg className="w-44 h-8" viewBox="0 0 200 40">
                    <motion.path
                      d="M 10 25 Q 40 5 70 25 T 130 20 T 190 30"
                      fill="none"
                      stroke="#1a1a18"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  </svg>
                  <span className="font-mono text-[8px] tracking-widest text-ink-40 uppercase">
                    SEALED ON ETHEREUM
                  </span>
                </div>
              )}

              <div className="font-mono text-[10px] uppercase text-gold font-bold tracking-wider pt-2 border-t border-ink/10 flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${claimedCharter ? "bg-green" : "bg-gold"}`} />
                {claimedCharter ? "STATUS: ACTIVE BANKER" : "STATUS: UNCLAIMED"}
              </div>
            </motion.div>

            {/* Action Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={handleClaim}
                disabled={claimedCharter}
                aria-label={content.cta}
                className={`px-8 py-3.5 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-240 cursor-pointer ${
                  claimedCharter
                    ? "bg-paper-deep text-ink-60 border border-ink/20 cursor-default"
                    : "bg-gold hover:bg-gold-bright text-paper shadow-lg hover:shadow-xl active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
                }`}
              >
                {claimedCharter ? "CHARTER CLAIMED (#0042 ACTIVE)" : content.cta}
              </button>

              <span className="font-mono text-[11px] text-ink-60 mt-2">
                {content.subcaption}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
