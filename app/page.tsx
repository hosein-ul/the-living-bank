"use client";

import React from "react";
import { SimProvider } from "@/components/sim/SimProvider";
import { EpochCounter } from "@/components/chrome/EpochCounter";
import { BrassPlaque } from "@/components/chrome/BrassPlaque";
import { ChapterRail } from "@/components/chrome/ChapterRail";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { CardStackSection } from "@/components/motion/CardStackSection";
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

        <main className="relative">
          <CardStackSection id="cover" index={0} totalChapters={11}>
            <S0Cover />
          </CardStackSection>

          <CardStackSection id="chapter-1" index={1} totalChapters={11}>
            <S1Island />
          </CardStackSection>

          <CardStackSection id="chapter-2" index={2} totalChapters={11}>
            <S2Gate />
          </CardStackSection>

          <CardStackSection id="chapter-3" index={3} totalChapters={11}>
            <S3Charter />
          </CardStackSection>

          <CardStackSection id="chapter-4" index={4} totalChapters={11}>
            <S4Furnace />
          </CardStackSection>

          <CardStackSection id="chapter-5" index={5} totalChapters={11}>
            <S5Dial />
          </CardStackSection>

          <CardStackSection id="chapter-6" index={6} totalChapters={11}>
            <S6Vaults />
          </CardStackSection>

          <CardStackSection id="chapter-7" index={7} totalChapters={11}>
            <S7Run />
          </CardStackSection>

          <CardStackSection id="chapter-8" index={8} totalChapters={11}>
            <S8Ghost />
          </CardStackSection>

          <CardStackSection id="chapter-9" index={9} totalChapters={11}>
            <S9Ledger />
          </CardStackSection>

          <CardStackSection id="chapter-10" index={10} totalChapters={11} isLast={true}>
            <S10Epilogue />
          </CardStackSection>
        </main>
      </div>
    </SimProvider>
  );
}
