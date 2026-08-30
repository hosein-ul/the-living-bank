"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { Receipt } from "../atoms/Receipt";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";
import { KineticText } from "../motion/KineticText";
import { SplitChars } from "../motion/SplitChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export const S10Epilogue: React.FC = () => {
  const content = CHAPTERS_CONTENT.s10;
  const {
    epoch,
    branches,
    balance,
    visitorBurned,
    runChoice,
    runRewardOrFeePaid,
  } = useSim((s) => ({
    epoch: s.epoch,
    branches: s.branches,
    balance: s.balance,
    visitorBurned: s.visitorBurned,
    runChoice: s.runChoice,
    runRewardOrFeePaid: s.runRewardOrFeePaid,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // GSAP STAMP animation on Wax Seal on scroll into view
  useEffect(() => {
    const el = sealRef.current;
    if (!el) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const st = gsap.fromTo(
      el,
      { scale: 2.2, filter: "blur(8px)", opacity: 0, rotate: -15 },
      {
        scale: 1,
        filter: "blur(0px)",
        opacity: 1,
        rotate: 0,
        duration: 0.64,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      st.scrollTrigger?.kill();
    };
  }, []);

  // Client-side HTML5 Canvas 1080x1080 PNG Share Card Exporter
  const handleExportShareCard = async () => {
    setExporting(true);
    sound.playThud();
    sound.playCelebration();

    if (typeof window !== "undefined") {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#b08d2e", "#c9a961", "#e9e4d8", "#8c6d1d"],
        disableForReducedMotion: true,
      });
    }

    if (typeof document !== "undefined" && document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback gracefully
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setExporting(false);
      return;
    }

    // Palette: Paper ground (#f4f1ea)
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(0, 0, 1080, 1080);

    // Outer double hairline border
    ctx.strokeStyle = "#1a1a18";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1000);
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, 976, 976);

    // Inner paper panel
    ctx.fillStyle = "#e9e4d8";
    ctx.fillRect(80, 80, 920, 920);
    ctx.strokeStyle = "rgba(176, 141, 46, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 920, 920);

    // Header Eyebrow & Title
    ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
    ctx.font = '600 18px "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText("AN INTERACTIVE EXPLANATION", 540, 148);

    ctx.fillStyle = "#1a1a18";
    ctx.font = 'bold 52px "Fraunces", Georgia, serif';
    ctx.fillText("THE LIVING BANK", 540, 212);

    ctx.font = 'italic 24px "Fraunces", Georgia, serif';
    ctx.fillStyle = "#b08d2e";
    ctx.fillText("Standard Reserve Protocol ($STANDARD)", 540, 258);

    // Divider Line
    ctx.strokeStyle = "rgba(26, 26, 24, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 290);
    ctx.lineTo(940, 290);
    ctx.stroke();

    // Receipt Box
    ctx.fillStyle = "#fbf9f4";
    ctx.fillRect(140, 325, 800, 495);
    ctx.strokeStyle = "#1a1a18";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(140, 325, 800, 495);
    ctx.setLineDash([]);

    // Receipt Content Header
    ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
    ctx.font = '600 13px "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL SETTLEMENT", 540, 360);

    ctx.fillStyle = "#1a1a18";
    ctx.font = 'bold 24px "Fraunces", Georgia, serif';
    ctx.fillText("THE LIVING BANK — SESSION RECEIPT", 540, 392);

    // Divider inside receipt
    ctx.strokeStyle = "rgba(26, 26, 24, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 415);
    ctx.lineTo(900, 415);
    ctx.stroke();

    // Metrics Rows
    const rows = [
      { label: "EPOCHS LIVED", value: epoch.toString().padStart(3, "0") },
      { label: "BRANCHES MAINTAINED", value: `${branches}/10` },
      { label: "YOU BURNED", value: `${formatNumber(visitorBurned)} $STANDARD` },
      { label: "YOU EARNED", value: `${formatNumber(balance)} $STANDARD` },
      {
        label: "RUN OUTCOME",
        value:
          runChoice === "STAY"
            ? "STAYED (COLLECTED)"
            : runChoice === "WITHDRAW"
            ? "WITHDREW (PAID TOLL)"
            : "QUIET EPOCH",
      },
      {
        label: "SETTLEMENT",
        value:
          runChoice === "STAY"
            ? `+${formatNumber(runRewardOrFeePaid || 3214)} $STANDARD`
            : runChoice === "WITHDRAW"
            ? `-${formatNumber(runRewardOrFeePaid)} $STANDARD`
            : "N/A",
      },
    ];

    rows.forEach((r, idx) => {
      const y = 460 + idx * 52;
      ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
      ctx.font = '500 20px "IBM Plex Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(r.label, 180, y);
      ctx.fillStyle = "#1a1a18";
      ctx.font = 'bold 21px "IBM Plex Mono", monospace';
      ctx.textAlign = "right";
      ctx.fillText(r.value, 900, y);
    });

    // Gold Wax Seal Stamp in receipt
    ctx.beginPath();
    ctx.arc(810, 715, 52, 0, Math.PI * 2);
    ctx.fillStyle = "#b08d2e";
    ctx.fill();
    ctx.strokeStyle = "#8e6e22";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#f4f1ea";
    ctx.font = 'bold 12px "Fraunces", Georgia, serif';
    ctx.textAlign = "center";
    ctx.fillText("EXPERIENCED", 810, 710);
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillText("RESERVE", 810, 727);

    // Footer text
    ctx.fillStyle = "rgba(26, 26, 24, 0.75)";
    ctx.font = '600 16px "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText("standardreserve.xyz · immutable onchain central bank", 540, 870);

    ctx.font = 'italic 18px "Fraunces", Georgia, serif';
    ctx.fillStyle = "#b08d2e";
    ctx.fillText("“Supply has one direction: down.”", 540, 905);

    // Verbatim Disclaimer
    ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
    ctx.font = '13px "IBM Plex Mono", monospace';
    ctx.fillText(
      "A fan-made interactive explanation. Not affiliated. Nothing here is financial advice.",
      540,
      948
    );

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `the-living-bank-session-${epoch}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setExporting(false);
  };

  return (
    <section
      id="chapter-10"
      ref={containerRef}
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-gold/25 flex flex-col items-center justify-center bg-paper text-center select-none overflow-hidden"
    >
      {/* Background warm light vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-ink/5" />

      {/* Grand Framed Certificate Composition Directly on Paper */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center relative p-8 sm:p-14 border-2 border-gold/50 shadow-2xl bg-[#faf7f0]">
        {/* Inner Guilloche Border */}
        <div className="absolute inset-2 sm:inset-3 border border-gold/30 pointer-events-none" />

        {/* 4 Engraved Corner Flourishes */}
        <svg className="absolute top-4 left-4 w-7 h-7 text-gold/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 2 12 L 2 2 L 12 2" />
          <circle cx="6" cy="6" r="2" fill="currentColor" />
        </svg>
        <svg className="absolute top-4 right-4 w-7 h-7 text-gold/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 22 12 L 22 2 L 12 2" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-4 left-4 w-7 h-7 text-gold/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 2 12 L 2 22 L 12 22" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-4 right-4 w-7 h-7 text-gold/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 22 12 L 22 22 L 12 22" />
          <circle cx="18" cy="18" r="2" fill="currentColor" />
        </svg>

        {/* Seal Stamp with GSAP STAMP Trigger */}
        <div ref={sealRef} className="mb-6 inline-block will-change-transform">
          <WaxSeal text="EXPERIENCED" subtext="RESERVE" size={96} animateStamp={false} />
        </div>

        {/* Title with SplitChars per-character rise */}
        <div className="mb-4">
          <SplitChars
            text={content.title}
            as="h2"
            triggerOnScroll={true}
            stagger={0.03}
            className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-ink justify-center"
          />
        </div>

        {/* Copy (Verbatim) */}
        <p className="font-serif text-base sm:text-xl text-ink leading-relaxed max-w-[34ch] mx-auto mb-8">
          {content.copy}
        </p>

        {/* Paper Receipt Summary Card */}
        <div className="mb-8 w-full max-w-md">
          <Receipt
            title={content.receiptTitle}
            lines={[
              { label: "Epochs Lived", value: epoch.toString().padStart(3, "0") },
              { label: "Branches", value: `${branches}/10` },
              { label: "You Burned", value: `${formatNumber(visitorBurned)} $STANDARD` },
              { label: "You Earned", value: `${formatNumber(balance)} $STANDARD` },
              {
                label: "Run Choice",
                value:
                  runChoice === "STAY"
                    ? "STAYED"
                    : runChoice === "WITHDRAW"
                    ? "WITHDREW"
                    : "ACTIVE",
              },
              {
                label: runChoice === "STAY" ? "Runners Paid You" : "Exit Toll Paid",
                value: `${formatNumber(runRewardOrFeePaid || 3214)} $STANDARD`,
              },
            ]}
          />
        </div>

        {/* Official Signature Line */}
        <div className="w-full max-w-xs flex flex-col items-center mb-8">
          <div className="w-full border-b border-gold/40 mb-1 font-serif italic text-gold text-sm tracking-wider">
            Standard Reserve Protocol
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-60 font-semibold">
            OFFICIAL PROTOCOL SIGNATURE
          </span>
        </div>

        {/* Monumental Brass Plaque Export Button */}
        <div className="mb-8 w-full max-w-sm">
          <button
            onClick={handleExportShareCard}
            disabled={exporting}
            aria-label={content.button}
            className="w-full py-4 bg-gradient-to-b from-[#e6c374] via-[#c9a961] to-[#a38030] text-ink border border-gold rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            {exporting ? "GENERATING CARD..." : `📥 ${content.button}`}
          </button>
        </div>

        {/* Three Quiet Links with Gold Separators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 font-mono text-xs text-ink uppercase tracking-wider font-semibold">
          {content.links.map((link, idx) => (
            <React.Fragment key={link.label}>
              {idx > 0 && <span className="text-gold">·</span>}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors focus-visible:outline-gold"
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>

        {/* Final Verbatim Disclaimer */}
        <p className="font-mono text-[11px] text-ink-60 tracking-normal max-w-lg mx-auto">
          {content.disclaimer}
        </p>
      </div>
    </section>
  );
};
