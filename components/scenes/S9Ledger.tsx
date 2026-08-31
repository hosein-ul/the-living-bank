"use client";

import React, { useRef, useEffect } from "react";
import { useSim } from "../sim/SimProvider";
import { formatNumber } from "../sim/formatters";
import { Odometer } from "../atoms/Odometer";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { KineticText } from "../motion/KineticText";
import { gsap, ScrollTrigger } from "@/lib/gsap";


export const S9Ledger: React.FC = () => {
  const content = CHAPTERS_CONTENT.s9;
  const { sCirc, burned } = useSim((s) => ({
    sCirc: s.sCirc,
    burned: s.burned,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const recapContainerRef = useRef<HTMLDivElement>(null);
  const hardCap = 1_000_000_000;
  const currentMax = hardCap - burned;

  // Scrub-continuity: full-pin continuous transform (was short 65%->20% dead zone)
  useEffect(() => {
    const el = containerRef.current;
    const recap = recapContainerRef.current;
    if (!el || !recap) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const frames = recap.querySelectorAll<HTMLElement>(".recap-frame-item");
    if (frames.length === 0) return;

    // Frame stagger now driven across full pinned scrub instead of short snap
    const st = gsap.fromTo(
      frames,
      { opacity: 0, y: 28, filter: "grayscale(100%)" },
      {
        opacity: 1,
        y: 0,
        filter: "grayscale(0%)",
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    );

    // Continuous odometer container slight parallax across pin
    const odometerBox = el.querySelector<HTMLElement>(".odometer-box");
    let extra: ScrollTrigger | undefined;
    if (odometerBox) {
      extra = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(odometerBox, { y: (self.progress - 0.5) * -10 });
        },
      });
    }

    return () => {
      st.scrollTrigger?.kill();
      extra?.kill();
    };
  }, []);

  const recapFrames = [
    {
      title: "01 · THE ONLY NUMBER",
      desc: "Net capital flow measured at the door. Not price, not volume.",
      metric: "Net Flow Policy Signal",
    },
    {
      title: "02 · GROWTH BURNS",
      desc: "Every expansion license purchased was 100% permanently burned.",
      metric: "Primary Supply Sink",
    },
    {
      title: "03 · DEFENSIVE TEMPER",
      desc: "Instant rate cut on negative flow. Generosity earned epoch by epoch.",
      metric: "Asymmetric Defense",
    },
    {
      title: "04 · INVERTED RUN",
      desc: "Panicking runners paid quadratic exit toll directly into stayers' mugs.",
      metric: "Patient Capital Funded",
    },
    {
      title: "05 · GHOST PURGE",
      desc: "Dormant balance forfeited. Ghost charter revoked to eliminate dilution.",
      metric: "Dilution Purged",
    },
  ];

  return (
    <section
      id="chapter-9"
      ref={containerRef}
      className="relative min-h-[250vh] border-t border-ink/10 bg-paper select-none"
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

        {/* Stage (~56% desktop): Rolling Odometers & Staggered Recap Frames */}
        <div className="w-full lg:w-[56%] flex flex-col items-center justify-center p-3 sm:p-4 order-1 lg:order-2 shrink-0">
          {/* Rolling Odometers Box */}
          <div className="odometer-box w-full p-4 sm:p-5 border-t border-b border-gold/30 mb-4 space-y-4 will-change-transform">
            {/* Circulating Supply */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-ink/10">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-60 font-bold mb-1 sm:mb-0">
                {content.labels.circulating}
              </span>
              <Odometer
                value={sCirc}
                unit="$STANDARD"
                className="text-xl sm:text-2xl lg:text-3xl text-ink"
              />
            </div>

            {/* Burned Forever */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-ink/10">
              <span className="font-mono text-xs uppercase tracking-wider text-red font-bold mb-1 sm:mb-0">
                {content.labels.burned}
              </span>
              <Odometer
                value={burned}
                unit="$STANDARD"
                className="text-xl sm:text-2xl lg:text-3xl text-red"
              />
            </div>

            {/* Hard Cap Ticking Down */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-ink-60 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                HARD CAP 1,000,000,000 → NEVER RISES
              </span>
              <span className="font-mono text-xs font-bold tabular-nums text-ink">
                Current Max: {formatNumber(currentMax)} $STANDARD
              </span>
            </div>
          </div>

          {/* 5 Recap Frames with GSAP Staggered Scroll Parallax */}
          <div ref={recapContainerRef} className="w-full space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 block mb-1 font-semibold">
              Session Action Archive
            </span>

            {recapFrames.map((frame, idx) => (
              <div
                key={idx}
                className="recap-frame-item p-2.5 bg-paper rounded-md border border-ink/10 flex items-center justify-between shadow-sm transition-all hover:border-gold will-change-transform"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-ink tracking-wider">
                    {frame.title}
                  </span>
                  <span className="font-serif text-xs text-ink-60 leading-tight mt-0.5">
                    {frame.desc}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-gold font-bold text-right ml-2 shrink-0">
                  {frame.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
