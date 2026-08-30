# TASK2 — MOTION OVERHAUL: Real Scroll-Driven Experience + Bug Fixes

**Context:** The Living Bank site currently deploys as an *interactive article* — clean, correct copy and design system, but almost no real motion. The user reviewed the live build and rejected it as "weak". This task converts it into a **heavy, scroll-driven scrollytelling experience** using real animation engines (GSAP + ScrollTrigger, Lenis, Three.js, canvas physics) — NOT simple CSS transitions/keyframes.

**Working dir:** `/home/ubuntu/living-bank-app`

---

## MANDATORY READING (do this first, in order)

1. `~/.agents/skills/scroll-animations/SKILL.md` — the master reference
2. Its `references/01-css-scroll-driven-api.md` … `08-framer-motion-react.md` — especially:
   - `02-gsap-scrolltrigger-mastery.md` (pin, scrub, timelines)
   - `03-scrollytelling-apple-canvas.md` (canvas image-sequence scrubbing)
   - `04-creative-layouts-cards.md` (card stacking, horizontal scroll, split screen)
   - `05-webgl-threejs-shaders.md` (3D scroll camera)
   - `06-smooth-scroll-physics.md` (Lenis + velocity)
3. `TREATMENT.md` in the repo root — the design contract (palette, moves, copy)
4. `PROGRESS.md` — what's done

**RULES FROM THE USER (non-negotiable):**
- Use **GSAP + ScrollTrigger** and other real engines for all scroll animations. **NOT simple CSS animations.** CSS keyframes/`transition` are only allowed for micro-states (hover, focus) — every scroll-driven effect must go through GSAP/Lenis/Three/canvas.
- Every chapter must use a **DIFFERENT motion technique** — variety is the point.
- The 4 named MOVES from TREATMENT §4.4 (STAMP/SLAM/STREAM/EMBER) must be implemented with GSAP timelines.
- Keep the existing design system exactly: paper `#f4f1ea`, ink, gold, Fraunces + IBM Plex Mono, grain. Do not redesign colors/typography.
- All copy stays verbatim from `content/chapters.ts`. Do not touch the strings.
- `npx tsc --noEmit` must pass with zero errors at the end.
- Performance: transform/opacity only in scroll-linked tweens; respect `prefers-reduced-motion` (every scene must degrade to readable static states — no infinite loops when reduced motion is on).
- Banned hues still banned: no blue/navy/indigo/purple/violet/teal.

---

## PART A — ENGINE UPGRADE (foundation)

**A1. Install deps:**
```bash
npm install gsap @types/gsap
```
(lenis, three, framer-motion, canvas-confetti are already installed.)

**A2. Lenis + GSAP integration** (`components/chrome/SmoothScroll.tsx`):
- Wire Lenis to GSAP's ticker (not separate rAF loops): `gsap.ticker.add((t)=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`.
- Expose `lenis` via context or a module singleton so scenes can read `lenis.velocity` (for velocity-skew and marquee acceleration).
- Add `ScrollTrigger.scrollerProxy` if needed; simplest: use default window scroller since Lenis (v1.1.x) transforms the wrapper — follow the official Lenis+GSAP recipe in reference `06-smooth-scroll-physics.md`.

**A3. Register plugins once** in a `lib/gsap.ts`: `gsap.registerPlugin(ScrollTrigger, useGSAP)`; export `gsap, ScrollTrigger`.

---

## PART B — PER-CHAPTER MOTION (each chapter = a different technique)

> Every chapter gets a dedicated `useGSAP`-scoped timeline. Cleanup on unmount. All scroll-linked tweens use `scrub: true` (or a value like 0.5–1) so **scroll IS the timeline**. Do not ship triggered-only fades except where noted.

**S0 Cover — Entrance choreography + pointer parallax**
- Coin: continuous idle rotation via GSAP `gsap.to` infinite yoyo (paused when reduced-motion).
- Title `THE LIVING BANK`: SplitText-style per-character rise (hand-split with spans since SplitText is club plugin — implement a tiny `splitChars` util), staggered STAMP-in with blur, scrubbed to first 30% of the cover.
- Background orbital rings + particles: pointer-parallax layers (`MultiParallaxLayer` component exists — wire it with `gsap.quickTo` on pointermove, different depths).
- Scroll cue: infinite pulse allowed (single live element).

**S1 Island — THREE.JS SCROLL-ORBIT (the flagship 3D scene)**
- `ThreeIsland.tsx` exists — upgrade it: scroll progress drives a camera orbit around the low-poly island (e.g., `theta = progress * Math.PI * 1.6`). Use GSAP to tween a plain object `{p:0}` with `scrub` and read it in the rAF loop — do not put ScrollTrigger inside the rAF.
- Six labels: as camera passes each 60°, animate the matching label chip in (STAMP) and previous out.
- Fog density + gold rim-light modulate with scroll progress.
- dpr cap 1.5, pause rAF offscreen (IntersectionObserver), dispose geometries on unmount. `next/dynamic` ssr:false already in place — keep it.

**S2 Gate — CANVAS COIN QUEUE + SCRUBBED FLOW (velocity-reactive)**
- Rebuild the coin queue as a canvas-2D particle system: ~30 coins walk through the arch; inflow/outflow direction and rate driven by the lever AND by `lenis.velocity` (scrolling down = buys surge, scrolling up = sells surge) — the visitor's scroll literally pushes money through the gate.
- Lever drag: GSAP `gsap.quickTo` on the handle; pointer-events on the track.
- The counter (NET ETH) counts with GSAP tween on a `textContent` proxy.
- Sky/paper tint shifts subtly (green↔red semantic only) with net flow sign.

**S3 Charter — 3D TILT DEED + CLIP-PATH REVEAL**
- Deed card: real perspective tilt on pointer (rotateX/rotateY with quickTo, max 8°) + specular sheen sweep on hover (one gradient sweep, neutral gold, no glow abuse).
- Certificate appears via clip-path inset reveal scrubbed to section entry (curtain wipe from TREATMENT).
- On claim (button): STAMP timeline — deed slams down (scale 1.6→1 + blur 8→0 + shadow burst), plaque HUD slides in, first STREAM accrual starts.

**S4 Furnace — SCRUBBED AUCTION GRAPH + EMBER CANVAS**
- Dutch auction decay curve: SVG path drawn with `stroke-dashoffset` scrubbed by scroll (path tracing), price marker slides along the curve.
- BUY LICENSE: EMBER on canvas — coin sprite flies to furnace mouth, flashes, 7-particle ember burst, fades. 600ms. Then pip fills (STAMP) and the accrual rate visibly accelerates.
- Furnace glow (gold, neutral) pulses once per burn event — no continuous pulse.

**S5 Dial — THE TEMPER (scrubbed ratchet vs SLAM)**
- Giant SVG dial: arm rotation scrubbed to a lever toggle.
- INFLOW: arm ratchets up in 4 fixed steps, each step 420ms with a pause (generosity earned) — implement as a scrubbed timeline with stepped ease.
- OUTFLOW: arm SLAMS to half in 240ms with scene shake (gsap shake on wrapper, 120ms) — triggered once per lever flip, not scrubbed.
- Regime badge flips with a hard cut + tiny scale punch.
- 14-epoch strip chart: bars grow staggered, scrubbed.

**S6 Vaults — PIPE FLOW (SVG conduit scrubbing)**
- Fee coins rain and route through the 70/15/15 splitter: animate small coin circles along SVG paths with `gsap MotionPath`-like behavior — since MotionPathPlugin is club-only, use `offset-path: path(...)` CSS with GSAP driving progress, or manual getPointAtLength scrub. Follow reference `04` for the pattern.
- Gold vault bars stack (stagger), POL lake level rises (scrubbed), buyback robot puff = small EMBER every 900ms while in contraction + balance in vault.

**S7 Run — CARD STACKING + QUADRATIC TOLL (the emotional peak)**
- Banker NPC cards: implement **sticky card stacking** (from reference `04`): as you scroll, banker cards stack/scale-down/dim one by one — this is the required "layout transformation" technique for this chapter.
- TOLL arc: quadratic curve drawn (dashoffset scrubbed) and redrawn live as exit pressure rises; percentage counter GSAP-tweened.
- STAY vs WITHDRAW: two-button choice; on WITHDRAW your card flies out through the door (path) paying the toll — half EMBER, half STREAM to stayers' mugs. On STAY mugs fill via STREAM.
- Receipt prints with STAMP.

**S8 Ghost — SLEEP CYCLE + CRACK (seal-shatter)**
- Sleeping banker: `Z` glyphs float in a loop (allowed — narrative element, but pause under reduced-motion).
- REPORT: bounty coin STREAMs to plaque; ghost's wax seal **cracks** — implement as 3 SVG shard paths that fly apart with gsap physics-ish tween + SLAM shake; 70% forfeit splits half-burn/half-stayers; remaining bankers' stream rates visibly speed up (increase the accrual tick rate).

**S9 Ledger — ODOMETERS + SLOW-MO REPLAY**
- Two giant odometer counters: rolling-digit effect (each digit column translates with stagger, scrubbed on scroll into view, then tick on events).
- Recap frames: 5 mini stills of previous scenes in grayscale, revealed with stagger + parallax offsets at different speeds (multi-layer parallax reprise).
- `S_max` line visibly ticks DOWN on each burn event.

**S10 Epilogue — FINALE**
- All session numbers count up via GSAP textContent tweens (STAMP rhythm).
- Export share card: canvas-compose the receipt with session values → PNG download (existing or new; verify it uses real sim state).
- Wax seal "EXPERIENCED" stamps (STAMP) on scroll into view.

**Global chrome:**
- Chapter rail: current chapter indicator glides (scrub-linked to overall page progress).
- Epoch counter: on each policy interaction, digit-roll tick.
- Velocity skew: subtle (max 1.5°) skew on chapter copy columns driven by `lenis.velocity` — reference `06`. Kill under reduced-motion.
- Scroll progress hairline at very top of page (gold, 2px).

---

## PART C — BUG FIXES (from real browser review)

1. **Hero: "STANDARD" text overlaps the gold coin** (z-index/positioning). Reposition/re-layer; the coin must sit clear of the wordmark or the word wraps around it cleanly.
2. **S2: slider handle covers "DRAG THE LEVER" label** — "DR" hidden under the handle. Add label offset/padding or move label above the track.
3. **S4: branch pips render as tofu boxes `□□□□□□□□□□`** — missing font/glyph. Use proper pip elements (divs/SVG) instead of unsupported characters.
4. **Native scrollbar collides with the chapter rail** — hide native scrollbar (`html { scrollbar-width: none }` + webkit pseudo) since the rail IS the progress UI, or add right padding so they don't overlap. Keep keyboard/scroll accessibility intact.
5. **Large dead space after Chapter VII in full-page view** — audit section heights; the run/stacking scene needs real height (it currently doesn't) or trim trailing spacer.
6. **Sticky scrollytelling currently broken by wrapper transforms** — recent commits removed wrappers; verify each pinned section actually pins with the new GSAP setup and no ancestor has `overflow: hidden` or transform that breaks `position: sticky` (the classic pitfall).

---

## PART D — GATES (must pass before you stop)

1. `npx tsc --noEmit` → 0 errors.
2. `NODE_OPTIONS=--max-old-space-size=1024 npm run build` → success.
3. Dev server smoke: pages render, zero console errors on load (check via a quick headless fetch of the built HTML or `next build` output warnings).
4. Verify every chapter uses its assigned technique (self-audit list in your final message).
5. All Part C bug fixes applied.
6. Reduced-motion: no infinite loops, all scrubbed timelines replaced with static end-states (implement via `gsap.matchMedia()`).

## Deliverable

Update `PROGRESS.md` with a `## TASK2 — Motion Overhaul — <date>` section listing: deps added, per-chapter technique map, bug fixes applied, gate results. Then summarize in chat: what technique each of the 10 chapters now uses, in one line each.
