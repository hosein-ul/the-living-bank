"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { WaxSeal } from "../atoms/WaxSeal";
import { Receipt } from "../atoms/Receipt";
import { formatNumber } from "../sim/formatters";
import { CHAPTERS_CONTENT } from "@/content/chapters";
import { sound } from "@/lib/sound";

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

  const [exporting, setExporting] = useState<boolean>(false);

  // Client-side HTML5 Canvas 1080x1080 PNG Share Card Exporter
  const handleExportShareCard = () => {
    setExporting(true);
    sound.playThud();

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
    ctx.font = "600 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("AN INTERACTIVE EXPLANATION", 540, 160);

    ctx.fillStyle = "#1a1a18";
    ctx.font = "bold 56px serif";
    ctx.fillText("THE LIVING BANK", 540, 230);

    ctx.font = "italic 24px serif";
    ctx.fillStyle = "#b08d2e";
    ctx.fillText("Standard Reserve Protocol", 540, 275);

    // Divider Line
    ctx.strokeStyle = "rgba(26, 26, 24, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 310);
    ctx.lineTo(920, 310);
    ctx.stroke();

    // Receipt Box
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(140, 350, 800, 480);
    ctx.strokeStyle = "#1a1a18";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(140, 350, 800, 480);
    ctx.setLineDash([]);

    // Receipt Content
    ctx.fillStyle = "#1a1a18";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL SESSION RECEIPT", 540, 410);

    // Metrics Rows
    ctx.font = "24px monospace";
    ctx.textAlign = "left";

    const rows = [
      { label: "EPOCHS LIVED", value: epoch.toString().padStart(3, "0") },
      { label: "BRANCHES MAINTAINED", value: `${branches}/10` },
      { label: "YOU BURNED", value: `${formatNumber(visitorBurned)} $STD` },
      { label: "YOU EARNED", value: `${formatNumber(balance)} $STD` },
      {
        label: "RUN OUTCOME",
        value: runChoice === "STAY" ? "STAYED (COLLECTED)" : runChoice === "WITHDRAW" ? "WITHDREW (PAID TOLL)" : "QUIET EPOCH",
      },
      {
        label: "SETTLEMENT",
        value: runChoice === "STAY" ? `+${formatNumber(runRewardOrFeePaid || 3214)} $STD` : runChoice === "WITHDRAW" ? `-${formatNumber(runRewardOrFeePaid)} $STD` : "N/A",
      },
    ];

    rows.forEach((r, idx) => {
      const y = 470 + idx * 55;
      ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
      ctx.fillText(r.label, 180, y);
      ctx.fillStyle = "#1a1a18";
      ctx.font = "bold 24px monospace";
      ctx.fillText(r.value, 600, y);
      ctx.font = "24px monospace";
    });

    // Gold Seal Stamp bottom right in canvas
    ctx.beginPath();
    ctx.arc(800, 710, 55, 0, Math.PI * 2);
    ctx.fillStyle = "#b08d2e";
    ctx.fill();
    ctx.strokeStyle = "#8e6e22";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#f4f1ea";
    ctx.font = "bold 13px serif";
    ctx.textAlign = "center";
    ctx.fillText("EXPERIENCED", 800, 705);
    ctx.font = "10px monospace";
    ctx.fillText("RESERVE", 800, 722);

    // Footer text
    ctx.fillStyle = "rgba(26, 26, 24, 0.6)";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("standardreserve.xyz · immutable onchain central bank", 540, 890);
    ctx.font = "italic 15px serif";
    ctx.fillText("Supply has one direction: down.", 540, 930);

    // Download triggered
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
      className="relative min-h-screen py-24 px-6 sm:px-12 lg:px-16 border-t border-ink/10 flex flex-col items-center justify-center bg-paper text-center"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Seal Stamp */}
        <motion.div
          initial={{ scale: 1.6, filter: "blur(8px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.64 }}
          className="mb-6"
        >
          <WaxSeal text="EXPERIENCED" subtext="RESERVE" size={90} />
        </motion.div>

        {/* Title */}
        <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-ink mb-4">
          {content.title}
        </h2>

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
              { label: "You Burned", value: `${formatNumber(visitorBurned)} $STD` },
              { label: "You Earned", value: `${formatNumber(balance)} $STD` },
              {
                label: "Run Choice",
                value: runChoice === "STAY" ? "STAYED" : runChoice === "WITHDRAW" ? "WITHDREW" : "ACTIVE",
              },
              {
                label: runChoice === "STAY" ? "Runners Paid You" : "Exit Toll Paid",
                value: `${formatNumber(runRewardOrFeePaid || 3214)} $STD`,
              },
            ]}
          />
        </div>

        {/* Export Button */}
        <div className="mb-12">
          <button
            onClick={handleExportShareCard}
            disabled={exporting}
            aria-label={content.button}
            className="px-8 py-3.5 bg-gold hover:bg-gold-bright text-paper rounded font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
          >
            {exporting ? "GENERATING CARD..." : `📥 ${content.button}`}
          </button>
        </div>

        {/* Three Quiet Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-12 font-mono text-xs text-ink uppercase tracking-wider">
          {content.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors focus-visible:outline-gold"
            >
              {link.label}
            </a>
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
