"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "../sim/SimProvider";
import { formatNumber, formatPips, formatRate, formatPercent } from "../sim/formatters";
import { EASINGS } from "@/lib/easings";

export const BrassPlaque: React.FC = () => {
  const claimedCharter = useSim((s) => s.claimedCharter);
  const branches = useSim((s) => s.branches);
  const balance = useSim((s) => s.balance);
  const visitorBurned = useSim((s) => s.visitorBurned);
  const accrualRate = useSim((s) => s.accrualRate);
  const exitPressure = useSim((s) => s.exitPressure);
  const fee = useSim((s) => s.fee);

  return (
    <aside aria-label="Charter Ledger HUD" className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-8">
      <AnimatePresence>
        {claimedCharter && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.64, ease: EASINGS.stamp }}
            className="p-3.5 sm:p-4 bg-paper-deep border border-gold/40 shadow-sm rounded text-[11px] sm:text-xs font-mono text-ink tracking-tight w-64 sm:w-72 select-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-ink/10 mb-2 font-semibold">
              <span className="text-gold tracking-widest">CHARTER #0042</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-live-dot" />
            </div>

            <div className="space-y-1.5 font-mono tabular-nums">
              <div className="flex justify-between items-center">
                <span className="text-ink-60 uppercase text-[10px] tracking-wider">Branches</span>
                <span className="font-mono text-ink">{formatPips(branches, 10)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-ink-60 uppercase text-[10px] tracking-wider">Balance</span>
                <span className="font-mono text-ink font-medium">
                  {formatNumber(balance)}{" "}
                  <span className="text-gold text-[10px]">$STD</span>{" "}
                  <span className="text-[10px] text-ink-60 font-normal">({formatRate(accrualRate)})</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-ink-60 uppercase text-[10px] tracking-wider">Burned</span>
                <span className="font-mono text-ink">
                  {formatNumber(visitorBurned)}{" "}
                  <span className="text-gold text-[10px]">$STD</span>
                </span>
              </div>

              {exitPressure > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between items-center pt-1.5 border-t border-ink/10 text-red"
                >
                  <span className="uppercase text-[10px] tracking-wider">Exit Toll</span>
                  <span className="font-mono font-medium">{formatPercent(fee)}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
