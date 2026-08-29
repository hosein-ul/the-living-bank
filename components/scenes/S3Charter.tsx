"use client";

import React from "react";
import { motion } from "framer-motion";
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

  const handleClaim = () => {
    if (!claimedCharter) {
      claimCharter();
      sound.playThud();
    }
  };

  return (
    <section
      id="chapter-3"
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex items-center justify-center bg-paper"
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
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="relative flex flex-col items-center">
            {/* The Soulbound Charter Deed (Paper at 4° tilt) */}
            <motion.div
              initial={{ rotate: 4, scale: 0.98 }}
              animate={
                claimedCharter
                  ? { rotate: 0, scale: 1, y: 0 }
                  : { rotate: [4, 3.5, 4.5, 4], y: [0, -4, 0] }
              }
              transition={{ duration: 4, repeat: claimedCharter ? 0 : Infinity, ease: "easeInOut" }}
              className={`relative w-[300px] sm:w-[360px] p-6 sm:p-8 bg-paper-deep border-2 border-gold/50 rounded shadow-md text-center transition-all duration-640 ${
                claimedCharter ? "border-gold ring-2 ring-gold/20" : ""
              }`}
            >
              {/* Soulbound Crest & Header */}
              <div className="flex justify-center mb-3">
                <WaxSeal text="FOUNDING" subtext="CHARTER" size={68} />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-60 block mb-1">
                SOVEREIGN LICENSE
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-2">
                {content.deed}
              </h3>

              <div className="w-24 h-[1px] bg-gold/40 mx-auto my-3" />

              <p className="font-serif text-xs text-ink-60 leading-relaxed max-w-[28ch] mx-auto italic mb-4">
                Grants sole operational authority to maintain up to ten branches within the Standard Reserve. Soulbound & non-transferable.
              </p>

              <div className="font-mono text-[10px] uppercase text-gold font-medium tracking-wider pt-2 border-t border-ink/10">
                {claimedCharter ? "STATUS: ACTIVE BANKER" : "STATUS: UNCLAIMED"}
              </div>
            </motion.div>

            {/* Action Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={handleClaim}
                disabled={claimedCharter}
                aria-label={content.cta}
                className={`px-8 py-3.5 rounded font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-240 ${
                  claimedCharter
                    ? "bg-paper-deep text-ink-60 border border-ink/20 cursor-default"
                    : "bg-gold hover:bg-gold-bright text-paper shadow-md hover:shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
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
