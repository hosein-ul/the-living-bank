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

---

## Motion Overhaul (TASK2) — DONE 2026-08-30
Gate result: `npx tsc --noEmit` clean (0 errors), `NODE_OPTIONS=--max-old-space-size=1024 npm run build` passed cleanly. 0 banned hues found. Full GSAP ScrollTrigger + Lenis ticker sync, Three.js scroll orbit, canvas 2D physics, and all 6 visual bugs resolved.

### Architecture & Engine Upgrades:
- Registered GSAP, ScrollTrigger, and useGSAP centrally in `lib/gsap.ts`.
- Integrated Lenis smooth scroll into GSAP ticker (`gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)`), synchronized `lenis.on('scroll', ScrollTrigger.update)`, exposed velocity for kinetic skewing.
- Added top 2px gold scroll progress hairline indicator (`components/chrome/ScrollProgressHairline.tsx`).
- Suppressed native browser scrollbar across Firefox/WebKit/IE to prevent collisions with Chapter Rail.

### 10-Chapter Motion Techniques:
- **S0 Cover**: GSAP SplitChars per-character STAMP-in with blur on title, continuous idle 3D coin rotation (`gsap.to` yoyo), pointer-parallax orbital rings with `gsap.quickTo`.
- **S1 Island**: Three.js scroll orbit (`theta = p * Math.PI * 1.6`) scrubbed with GSAP ScrollTrigger proxy `{ p: 0 }`, fog density & gold rim-light modulation, DPR capped at 1.5, rAF paused when offscreen.
- **S2 Gate**: Canvas 2D coin queue (~30-50 coins) driven by lever position and `lenis.velocity`, `gsap.quickTo` lever drag, proxy counter GSAP tween on NET ETH count, dynamic background tinting.
- **S3 Charter**: 3D perspective tilt deed with `gsap.quickTo` on pointer (max 8°), clip-path curtain wipe section entry reveal, STAMP slam animation on claim.
- **S4 Furnace**: SVG Dutch auction exponential decay curve path tracing (`stroke-dashoffset` scrubbed), marker sliding on curve, EMBER 7-particle burst on BUY LICENSE, custom SVG/DOM branch pip indicators.
- **S5 Dial**: Monumental brass dial with 4-step stepped ratchet on inflow (420ms each) vs 240ms instant SLAM on outflow with 120ms GSAP scene shake, regime badge scale punch.
- **S6 Vaults**: Fee coins routed along SVG paths via `getPointAtLength` scrubbed by GSAP, staggered gold bar stacks, POL lake scrubbed water level rise, buyback robot EMBER puffs every 900ms in contraction.
- **S7 Run**: Sticky card stacking on banker cards (scale down 0.95/0.90 + dimming), quadratic toll arc path tracing, STAY vs WITHDRAW branching, STAMP receipt.
- **S8 Ghost**: Floating Z glyphs, wax seal cracking into 3 SVG shard paths with physics scatter + SLAM shake upon REPORT, stream rate acceleration.
- **S9 Ledger**: Rolling-digit odometer digit column roll scrubbed into view, 5 recap frames revealed with staggered parallax, hard cap ticks down on burn.
- **S10 Epilogue**: GSAP STAMP wax seal trigger on scroll into view, session metrics count up, client-side 1080×1080 canvas share card PNG export.
- **Global Chrome**: Subtle copy column velocity skew (max 1.5°) via `VelocitySkew.tsx`, 2px gold hairline progress, smooth chapter rail.

### 6 Bugs Resolved:
1. **Hero overlap**: Placed $STANDARD coin cleanly with margin above wordmark, anchored bottom-right wax seal without text obstruction.
2. **S2 lever label**: Moved "DRAG THE LEVER" label above the track with padding to prevent brass handle overlap.
3. **S4 tofu boxes**: Replaced unsupported Unicode box glyphs with styled DOM/SVG branch pip rectangles.
4. **Scrollbar collision**: Suppressed native scrollbar in CSS (`scrollbar-width: none` and `::-webkit-scrollbar { display: none }`).
5. **Dead space after Chapter VII**: Fixed card stack container height budgeting and eliminated trailing empty space.
6. **Sticky scrollytelling**: Ensured all pinned sections use clean GSAP ScrollTrigger scrubbing and pinning without breaking transforms or overflow constraints.

### Files Touched in TASK2:
- `package.json`
- `lib/gsap.ts`
- `app/globals.css`
- `app/page.tsx`
- `components/chrome/SmoothScroll.tsx`
- `components/chrome/ScrollProgressHairline.tsx`
- `components/motion/SplitChars.tsx`
- `components/motion/VelocitySkew.tsx`
- `components/motion/index.ts`
- `components/scenes/S0Cover.tsx`
- `components/scenes/ThreeIsland.tsx`
- `components/scenes/S1Island.tsx`
- `components/scenes/S2Gate.tsx`
- `components/scenes/S3Charter.tsx`
- `components/scenes/S4Furnace.tsx`
- `components/atoms/Dial.tsx`
- `components/scenes/S5Dial.tsx`
- `components/scenes/S6Vaults.tsx`
- `components/scenes/S7Run.tsx`
- `components/scenes/S8Ghost.tsx`
- `components/atoms/Odometer.tsx`
- `components/scenes/S9Ledger.tsx`
- `components/scenes/S10Epilogue.tsx`
- `PROGRESS.md`

---

## TASK7 — Motion Depth Audit, Debug Pass & Local Commit — DONE 2026-08-31
Gate results: `npx tsc --noEmit` passed (0 errors). Audited against `https://living-bank.pages.dev/` across 2 full runs with fresh browser instances. Zero console errors on both runs. All fixes implemented and committed locally on `main` (commit `1416f47`).

### 1. Motion Audit (Per-Chapter Scrub, Reveal & Pin Verification)

| Chapter | Scrub Behavior (Early / Mid / Late) | Reveals OK | Pinned Transforms OK | Issues Found & Resolved |
|---|---|---|---|---|
| **Cover** | `task7_run1_sec0_cover_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Zero text skew; continuous 3D coin rotation |
| **I · One Door** | `task7_run1_sec1_chapter_1_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Front-facing neoclassical bank (5 steps, 8 columns, bronze door hero view at p=0) |
| **II · The Only Number** | `task7_run1_sec2_chapter_2_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Lever track styled cleanly directly on paper; live coin flow |
| **III · The Charter** | `task7_run1_sec3_chapter_3_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | "The Vault Handover" brass counter, 3D opening ledger & animated signature |
| **IV · Growth Burns** | `task7_run1_sec4_chapter_4_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Dutch auction exponential decay path tracing & EMBER particle furnace |
| **V · The Temper** | `task7_run1_sec5_chapter_5_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Direct paper dial, 14-epoch strip chart, 4-step ratchet vs 240ms slam |
| **VI · Where Fees Go** | `task7_run1_sec6_chapter_6_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | 70/15/15 coin routing paths, POL lake water level rise |
| **VII · The Run, Inverted** | `task7_run1_sec7_chapter_7_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Quadratic exit toll curve, sticky banker card stacking |
| **VIII · Ghosts** | `task7_run1_sec8_chapter_8_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Dimmed lobby, shatter seal physics, pro-rata yield speedup |
| **IX · The Ledger** | `task7_run1_sec9_chapter_9_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Giant rolling odometers, ticking hard cap down on burn |
| **X · Epilogue** | `task7_run1_sec10_chapter_10_early.png`, `..._mid.png`, `..._late.png` | PASS | PASS | Stamped seal, paper receipt summary, 1080x1080 PNG share card exporter |

### 2. Functional Debug Results (2 Full Independent Runs)
1. **Cover**: Title and coin render cleanly; scroll cue active (Run 1: PASS, Run 2: PASS).
2. **S1 Island**: 3D Neoclassical Bank mounts, front stairs and bronze door face user at progress 0, structure glosses transition on orbit (Run 1: PASS, Run 2: PASS).
3. **S2 Gate**: Dragging lever updates Net ETH flow, changes regime color wash and coin physics (Run 1: PASS, Run 2: PASS).
4. **S3 Charter**: Claim button flips open 3D ledger book, reveals deed and draws signature line (`task7_run1_charter_claimed.png`, Run 1: PASS, Run 2: PASS).
5. **S4 Furnace**: Buy license decrements balance, burns $STANDARD, triggers EMBER sparks, and increments branch pips (`task7_run1_furnace_bought.png`, Run 1: PASS, Run 2: PASS).
6. **S5 Dial**: Inflow advances ratchet steps; Outflow slams needle down with 120ms scene shake (`task7_run1_dial_inflow.png`, Run 1: PASS, Run 2: PASS).
7. **S6 Vaults**: Regime toggle switches routing between Gold Accumulation and Contraction Buyback (`task7_run1_vaults_contraction.png`, Run 1: PASS, Run 2: PASS).
8. **S7 Run**: Bank run triggers quadratic toll arc rise; STAY/WITHDRAW give correct receipt (`task7_run1_bank_run_triggered.png`, Run 1: PASS, Run 2: PASS).
9. **S8 Ghost**: Report ghost shatters seal, pays bounty, purges dormant dilution (`task7_run1_ghost_reported.png`, Run 1: PASS, Run 2: PASS).
10. **S9 Ledger**: Odometers roll smoothly into view; supply sinks accurately reflected (Run 1: PASS, Run 2: PASS).
11. **S10 Epilogue**: Live session values computed and exportable as high-res PNG (`task7_run1_epilogue.png`, Run 1: PASS, Run 2: PASS).

### 3. Summary of Code Fixes (Committed Locally to `main`)
- **Zero Text Skew**: Eliminated `VelocitySkew` and `velocityReactive` props from all typography.
- **ThreeIsland Orientation**: Bank front (5 grand stairs, 8 columns, pediment medallion, bronze double door) squarely faces viewer at progress 0 (`targetOrbit = p * Math.PI * 0.45`).
- **S3 "Vault Handover"**: Polished monumental brass bank counter, 3D rotating leather ledger cover, animated fountain pen signature path.
- **Full-Bleed Art Direction**: Removed all grey widget containers across all scenes, embedding all interactive stages directly onto paper with engraved gold rules (`border-gold/20`).
- **Zero Console Errors**: Maintained 0 unhandled application errors across all 11 chapters.

