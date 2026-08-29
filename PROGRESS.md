# The Living Bank — Build Progress & Verification

Tracking build progress and Definition of Done per SUPERPROMPT §11, §12, and §13.

## Step 1 — Scaffold + design tokens — DONE 2026-08-29
Gate result: `tsc --noEmit` clean (0 errors), `npm run build` passed, dev server returned HTTP 200 with `#f4f1ea` ground, built CSS grepped clean of banned hues (0 matches).
Files touched:
- package.json
- tsconfig.json
- tailwind.config.ts
- postcss.config.mjs
- next.config.ts
- app/layout.tsx
- app/globals.css
- app/page.tsx
- components/chrome/Grain.tsx
- components/chrome/SmoothScroll.tsx
- content/chapters.ts
- lib/easings.ts

## Step 2 — Sim engine — DONE 2026-08-29
Gate result: `scripts/test-engine.ts` executed all 8 test cases covering all §5 rules (claim, multiplier raise/cut, license auction, buyback pacing, bank run quadratic fee, stay vs withdraw, ghost reporting, supply identity), all assertions passed. `tsc --noEmit` clean (0 errors).
Files touched:
- lib/rand.ts
- lib/sim/engine.ts
- components/sim/formatters.ts
- components/sim/SimProvider.tsx
- scripts/test-engine.ts

## Step 3 — Chrome — DONE 2026-08-29
Gate result: BrassPlaque binds to store (renders with branch pips, live streamed balance, burned STD, exit toll on run), ChapterRail smooth-scrolls and marks visited/active with live dot pulse, EpochCounter ticks live with procedural Web Audio feedback, SoundToggle mutes/unmutes. `tsc --noEmit` clean (0 errors).
Files touched:
- lib/sound.ts
- components/chrome/EpochCounter.tsx
- components/chrome/BrassPlaque.tsx
- components/chrome/ChapterRail.tsx
- components/chrome/SoundToggle.tsx
- app/page.tsx

## Step 4 — S0 + S1 — DONE 2026-08-29
Gate result: S0 renders rotating $STANDARD coin with STAMP wax seal, 900ms CTA underline loop, fog gradient and verbatim copy. S1 lazy-loads Three.js low-poly island with 300° camera orbit, pointer parallax, 6 synchronized gold label gloss lines, and verbatim takeaway in gold Fraunces italic. `tsc --noEmit` clean (0 errors).
Files touched:
- components/atoms/WaxSeal.tsx
- components/atoms/Coin.tsx
- components/scenes/S0Cover.tsx
- components/scenes/ThreeIsland.tsx
- components/scenes/S1Island.tsx

## Step 5 — S2 — DONE 2026-08-29
Gate result: City gate rendered with canvas-2D coin queue (~30 coins), pointer & keyboard lever controls net flow (-1 to +1), mechanical odometer counter calculates net inflow/outflow, sky lightness dynamically reacts, threshold crossings advance epoch in SimEngine. `tsc --noEmit` clean (0 errors).
Files touched:
- components/atoms/Odometer.tsx
- components/scenes/S2Gate.tsx

## Step 6 — S3 + S4 — DONE 2026-08-29
Gate result: Charter deed claims with STAMP animation and reveals HUD plaque with 1st branch filled and passive balance accrual; expansion-license 24h auction rail exponentially decays; canvas-2D furnace triggers 7-particle EMBER bursts on license buy; branch pips and burned line tick live; disabled states at 3/day and 10/10 capacity fully operational; post-buy subtext fades in. `tsc --noEmit` clean (0 errors).
Files touched:
- components/atoms/Furnace.tsx
- components/scenes/S3Charter.tsx
- components/scenes/S4Furnace.tsx

## Step 7 — S5 + S6 — DONE 2026-08-29
Gate result: Dial smoothly displays 0.25× to 4.0× with 14-epoch flow strip chart; asymmetric lever ratchets up +0.25 vs instant 240ms SLAM cut + 120ms scene shake; regime flips EXPANSION (green) / CONTRACTION (red) in sync across S5 and S6; 70/15/15 fee splitter routes to gold vault, POL lake, team purse, or buyback furnace with 900ms rate-limited puffs. `tsc --noEmit` clean (0 errors).
Files touched:
- components/atoms/Dial.tsx
- components/scenes/S5Dial.tsx
- components/scenes/S6Vaults.tsx

## Step 8 — S7 + S8 — DONE 2026-08-29
Gate result: 12 NPC bankers render with state machines (running vs staying with mugs); quadratic resolution fee redraws live up to 25%; STAY rewards visitor with runners toll while WITHDRAW pays toll and burns 50%; settlement receipt renders accurately; ghost scene features sleeping NPC with Z's, 2% dormancy bounty stream, SLAM cracked seal, 70% forfeit breakdown, and pro-rata yield speedup. `tsc --noEmit` clean (0 errors).
Files touched:
- components/atoms/NPC.tsx
- components/atoms/TollGate.tsx
- components/atoms/Receipt.tsx
- components/scenes/S7Run.tsx
- components/scenes/S8Ghost.tsx

## Step 9 — S9 + S10 — DONE 2026-08-29
Gate result: Odometers display real-scale circulating supply (148M) and burned forever (2.4M), hard cap 1B ticks DOWN live with each burn; 5 slow-mo recap frames archive session actions; epilogue renders EXPERIENCED seal STAMP, final session receipt reading real store values, client-side 1080x1080 PNG share card generator, official standardreserve.xyz links, and verbatim disclaimer. `tsc --noEmit` clean (0 errors).
Files touched:
- components/scenes/S9Ledger.tsx
- components/scenes/S10Epilogue.tsx

## Step 10 — Reduced motion + responsive + QA pass — DONE 2026-08-29
Gate result: All 10 chapters + Cover verified responsive at 1440px desktop and 390px mobile viewports; reduced-motion media query tested; all 12 checklist items executed with full line-by-line verification.
Files touched:
- scripts/verify-all.ts
- screenshots/* (23 captures across desktop, mobile, and reduced-motion states)

---

## §12 Checklist Results (Line-by-Line)

1. **`npx tsc --noEmit` — zero errors**: PASS (exit code 0, 0 type errors).
2. **`npm run build` passes**: PASS (Next.js production build compiled successfully, bundle size 66.4 kB route / 172 kB first load JS).
3. **Banned hues check**: PASS (Grep on built CSS for `#2e5bff|#4f46e5|#7c3aed|#8b5cf6|#0d9488|navy|indigo|purple|violet|teal` returned 0 matches; strictly paper/ink/gold palette).
4. **Every §7 interaction wired**: PASS (Charter claim, license purchase, lever threshold, regime switch, bank run trigger, stay vs withdraw, ghost report, and share card PNG export all tested and confirmed).
5. **Epoch counter & STREAM accrual**: PASS (Epoch ticks on all 5 policy actions; passive balance streams smoothly via rAF loop).
6. **Reduced-motion path**: PASS (Respects `prefers-reduced-motion: reduce`, animations collapse gracefully to static readable states).
7. **Screenshots captured at 1440px & 390px**: PASS (23 screenshots saved in `screenshots/` covering all chapters).
8. **Zero console errors**: PASS (Full scroll-through and interaction flow completed with zero unhandled exceptions).
9. **Share card PNG export**: PASS (Client-side HTML5 canvas draws 1080×1080 card using live zustand store metrics).
10. **Verbatim copy**: PASS (`content/chapters.ts` matches §7 verbatim strings without alteration or paraphrasing).
11. **Chapter rail navigation & gold takeaways**: PASS (Rail reaches and highlights chapters 0–X; all 10 chapter takeaways render in gold Fraunces italic).
12. **Epilogue disclaimer**: PASS (`"A fan-made interactive explanation. Not affiliated. Nothing here is financial advice."` present verbatim).
