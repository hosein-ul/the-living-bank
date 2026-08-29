"use client";

import React from "react";
import { SimProvider } from "@/components/sim/SimProvider";
import { EpochCounter } from "@/components/chrome/EpochCounter";
import { BrassPlaque } from "@/components/chrome/BrassPlaque";
import { ChapterRail } from "@/components/chrome/ChapterRail";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { S0Cover } from "@/components/scenes/S0Cover";
import {
  S1Island,
  S2Gate,
  S3Charter,
  S4Furnace,
  S5Dial,
  S6Vaults,
  S7Run,
  S8Ghost,
  S9Ledger,
  S10Epilogue,
} from "@/components/scenes";

export default function Home() {
  return (
    <SimProvider>
      <div className="relative min-h-screen bg-paper text-ink selection:bg-gold-bright selection:text-ink">
        <EpochCounter />
        <SoundToggle />
        <BrassPlaque />
        <ChapterRail />

        <main>
          <S0Cover />
          <S1Island />
          <S2Gate />
          <S3Charter />
          <S4Furnace />
          <S5Dial />
          <S6Vaults />
          <S7Run />
          <S8Ghost />
          <S9Ledger />
          <S10Epilogue />
        </main>
      </div>
    </SimProvider>
  );
}
