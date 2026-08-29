"use client";

import React, { useEffect, useState } from "react";
import { useSim } from "../sim/SimProvider";
import { formatEpoch } from "../sim/formatters";
import { sound } from "@/lib/sound";

export const EpochCounter: React.FC = () => {
  const epoch = useSim((s) => s.epoch);
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    setTicked(true);
    sound.playTick();
    const t = setTimeout(() => setTicked(false), 240);
    return () => clearTimeout(t);
  }, [epoch]);

  return (
    <header className="fixed top-4 right-4 z-40 sm:top-6 sm:right-8">
      <div
        className={`px-3 py-1.5 bg-paper-deep/90 border border-ink/15 rounded text-xs font-mono font-medium tracking-wider text-ink shadow-sm transition-transform duration-240 ${
          ticked ? "scale-105 border-gold" : "scale-100"
        }`}
        aria-label={`Current state: ${formatEpoch(epoch)}`}
      >
        <span className="font-mono tabular-nums">{formatEpoch(epoch)}</span>
      </div>
    </header>
  );
};
