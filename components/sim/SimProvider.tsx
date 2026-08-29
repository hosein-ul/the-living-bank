"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createStore, useStore } from "zustand";
import { SimEngine, SimState, INITIAL_SIM_STATE, Regime } from "@/lib/sim/engine";

export interface SimStoreState extends SimState {
  engine: SimEngine;
  claimCharter: () => void;
  advanceEpoch: (fInput?: number) => void;
  buyLicense: () => boolean;
  setRegime: (regime: Regime) => void;
  triggerBuybackPuff: () => number;
  triggerBankRun: () => { runners: number; stayers: number; tollPercent: number };
  chooseRunAction: (choice: "STAY" | "WITHDRAW") => void;
  reportGhost: () => { bounty: number; forfeited: number };
  accrualRate: number;
}

export type SimStore = ReturnType<typeof createSimStore>;

export function createSimStore(initialState: Partial<SimState> = {}) {
  const engine = new SimEngine(initialState);
  const initial = engine.getState();

  return createStore<SimStoreState>((set) => {
    engine.subscribe((newState) => {
      set({
        ...newState,
        accrualRate: engine.getAccrualRatePerSec(),
      });
    });

    return {
      ...initial,
      engine,
      accrualRate: engine.getAccrualRatePerSec(),
      claimCharter: () => engine.claimCharter(),
      advanceEpoch: (fInput?: number) => engine.advanceEpoch(fInput),
      buyLicense: () => engine.buyLicense(),
      setRegime: (regime: Regime) => engine.setRegime(regime),
      triggerBuybackPuff: () => engine.triggerBuybackPuff(),
      triggerBankRun: () => engine.triggerBankRun(),
      chooseRunAction: (choice: "STAY" | "WITHDRAW") => engine.chooseRunAction(choice),
      reportGhost: () => engine.reportGhost(),
    };
  });
}

const SimContext = createContext<SimStore | null>(null);

export const SimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storeRef = useRef<SimStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSimStore();
  }

  // Active rAF loop for STREAMing passive balance accrual
  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;
    const engine = store.getState().engine;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // Only tick if delta is reasonable (handles tab backgrounding)
      if (deltaSec > 0 && deltaSec < 1.0) {
        engine.accruePassive(deltaSec);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return <SimContext.Provider value={storeRef.current}>{children}</SimContext.Provider>;
};

import { useShallow } from "zustand/react/shallow";

export function useSim<T>(selector: (state: SimStoreState) => T): T {
  const store = useContext(SimContext);
  if (!store) {
    throw new Error("useSim must be used within a SimProvider");
  }
  return useStore(store, useShallow(selector));
}

export function useEpoch() {
  return useSim((s) => s.epoch);
}
