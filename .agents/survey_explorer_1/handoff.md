# Handoff Report — Scroll & Motion Architecture Survey

**Agent:** Survey Explorer 1 (Scroll & Motion Architecture Specialist)  
**Date:** 2026-08-29  
**Working Directory:** `/home/ubuntu/bank/.agents/survey_explorer_1`  
**Handoff Type:** Hard (Task Complete)  

---

## 1. Observation

Direct observations from the codebase investigation:

1. **CSS Smooth Scroll Conflict with Lenis:**
   - In `app/globals.css` (lines 21–25):
     ```css
     html {
       background-color: #f4f1ea;
       color: #1a1a18;
       scroll-behavior: smooth;
     }
     ```
   - In `components/chrome/SmoothScroll.tsx` (lines 16–20):
     ```tsx
     const lenis = new Lenis({
       lerp: 0.09,
       duration: 1.2,
       smoothWheel: true,
     });
     ```
   - In `components/chrome/ChapterRail.tsx` (lines 40–45):
     ```tsx
     const scrollTo = (id: string) => {
       const el = document.getElementById(id);
       if (el) {
         el.scrollIntoView({ behavior: "smooth" });
       }
     };
     ```

2. **Absence of Cross-Chapter Card Stacking & 3D Depth Scaling:**
   - In `app/page.tsx` (lines 32–44): All 11 chapter components (`S0Cover` through `S10Epilogue`) are placed sequentially in standard `<main>` flow without an overarching stacking coordinator or exit transform wrappers.
   - In `components/scenes/S1Island.tsx` through `S9Ledger.tsx`: Each chapter utilizes a local `sticky top-0 h-screen` container inside a `min-h-[260vh]` wrapper. While internal transforms (`copyY`, `sceneScale`) exist, chapters scroll off-screen without scaling down to `scale(0.92)` or receding into the Z-axis as subsequent cards stack over them.

3. **Autonomous CSS Conduits vs. Scroll-Scrubbed SVG Paths:**
   - In `components/scenes/S6Vaults.tsx` (lines 141–152):
     ```tsx
     <svg viewBox="0 0 400 30" className="w-full h-full">
       <path
         d="M 200 0 L 200 15 Q 200 25 70 25 M 200 15 L 200 30 M 200 15 Q 200 25 330 25"
         fill="none"
         stroke="#b08d2e"
         strokeWidth="1.8"
         strokeDasharray="4 3"
         className="animate-[dash_20s_linear_infinite]"
       />
     </svg>
     ```
     The SVG path relies on a CSS dash keyframe loop rather than Framer Motion `pathLength` / `strokeDashoffset` dynamically mapped to `useScroll({ target: containerRef })`.
   - In `components/scenes/S4Furnace.tsx` (lines 42–53): Auction rail progress is updated via interval timer (`setInterval`) and scroll modulo rather than an SVG Dutch auction exponential decay curve.

4. **Monolithic Opacity Reveals vs. Word-Masked 3D Kinetic Typography:**
   - In `components/scenes/S0Cover.tsx` through `S10Epilogue.tsx`: Headings and text blocks use standard block animations:
     ```tsx
     <motion.h1
       initial={{ opacity: 0, y: 24 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.64, delay: 0.2, ease: EASINGS.smooth }}
       className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-ink mb-6 select-none"
     >
       {content.title}
     </motion.h1>
     ```
     No `overflow-hidden` word masking, 3D perspective rotation (`rotateX(15deg) -> 0deg`), or velocity-reactive skews are present.

5. **Single-Axis Parallax:**
   - Parallax transforms across all chapters are strictly 1-dimensional vertical (`y: [0, 30]`), lacking opposing diagonal vectors (e.g. background linework drifting $[-40\text{px}, -60\text{px}]$ vs. foreground coins drifting $[+50\text{px}, -30\text{px}]$).

---

## 2. Logic Chain

1. **Smoothness & Jitter (Observations 1 & 2):**
   - Lenis uses a continuous requestAnimationFrame loop with lerp interpolation ($0.08$) to compute target scroll positions.
   - Setting `scroll-behavior: smooth` in CSS instructs the native browser layout engine to perform its own competing interpolation.
   - When a user clicks a Chapter Rail item or CTA button, both engines execute simultaneously, causing frame drop and jitter. Removing `scroll-behavior: smooth` and delegating all programmatic navigation to `lenis.scrollTo()` resolves this conflict.

2. **Luxury Card Stacking & Depth (Observation 2):**
   - The project requirement (R1.1) specifies: "Card Stacking & 3D Depth Scaling (Apple/Stripe style): Chapters seamlessly stack, scale down (`scale(0.92)`), blur slightly, and recede into depth as new chapters scroll over them."
   - The current architecture renders independent sticky containers that abruptly unpin when their height expires.
   - Introducing `CardStackSection.tsx` with Framer Motion `useScroll` tracking `["start start", "end start"]` provides a clean, declarative mechanism to map the exit phase of Chapter $N$ to `scale(0.92)`, `opacity: 0.72`, `y: -36px`, and elevation shadows as Chapter $N+1$ ascends.

3. **Tactile Lore & Conduit Scrubbing (Observation 3):**
   - The protocol metaphor states: "The visitor IS the market." Scroll position represents time and capital flow.
   - Autonomous looping CSS dashes disconnect the visitor's physical input from the visual simulation.
   - Implementing `ScrubbedConduit` with `pathLength` bound directly to `scrollYProgress` visually reinforces that scrolling actively drives ETH flow into the bank, down the 70/15/15 splitter, and along the quadratic exit toll curve.

4. **Editorial Typography Elevation (Observation 4):**
   - Standard fade-ups (`y: 16 -> 0`) are common in basic templates.
   - High-end editorial award winners (Fraunces + IBM Plex Mono design language) achieve dramatic impact by wrapping individual words in `overflow-hidden` mask spans, staggering their entrance by 35ms, and rotating them along the X-axis (`rotateX: 20deg -> 0deg`) in 3D perspective space.

---

## 3. Caveats

- **No Backdrop Blur:** SUPERPROMPT §3 strictly mandates "NO backdrop-filter/blur on this site (matte paper only)". Therefore, depth receding in card stacking must be achieved using geometric scale (`scale(0.92)`), subtle opacity attenuation (`opacity: 0.72`), Z-translation (`translateZ(-80px)`), and elevation drop-shadows rather than heavy gaussian backdrop blurs.
- **Three.js Island Scope:** Three.js is restricted strictly to Chapter I (The Island) per SUPERPROMPT §2. All other particle systems, conduits, and UI cards must remain lightweight Canvas-2D, SVG, and DOM-based.
- **Palette Invariance:** All motion graphics, conduits, and particles must strictly maintain the paper/ink/gold/green/red palette without introducing prohibited hues (no blue/purple/teal).

---

## 4. Conclusion

The current codebase is stable, type-safe, and functionally sound, but operates on conventional UI motion patterns. By applying the recommended 5-part motion architecture:
1. **Context-Aware Lenis Engine** (eliminating CSS scroll fighting and exposing velocity).
2. **CardStackSection 3D Receding Orchestration** (`scale(0.92)`, elevation depth).
3. **Scroll-Scrubbed SVG Conduits** across Chapters 2, 4, 6, and 7.
4. **Word-Masked 3D Kinetic Typography** (`KineticText`).
5. **Opposing Multi-Directional Parallax Layers**.

The website will achieve the Awwwards/FWA-grade luxury aesthetic required by the specification while maintaining 100% protocol fidelity and 60/120Hz performance.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify CSS Scroll Behavior Conflict:**
   ```bash
   grep -n "scroll-behavior" /home/ubuntu/bank/app/globals.css
   ```
   *Expected output:* Line 24 shows `scroll-behavior: smooth;`.

2. **Verify SVG Dash Loop in Chapter 6:**
   ```bash
   grep -n "strokeDasharray" /home/ubuntu/bank/components/scenes/S6Vaults.tsx
   ```
   *Expected output:* Line 149 shows `strokeDasharray="4 3"` with CSS infinite animation.

3. **Verify Typography Implementation in Scenes:**
   ```bash
   grep -rn "initial={{ opacity: 0, y:" /home/ubuntu/bank/components/scenes/
   ```
   *Expected output:* Matches across all scenes demonstrating monolithic translate rather than word-masking.

4. **Verify TypeScript & Build Integrity:**
   ```bash
   cd /home/ubuntu/bank && npx tsc --noEmit
   ```
   *Expected output:* 0 errors.

5. **Detailed Report Reference:**
   Inspect `/home/ubuntu/bank/.agents/survey_explorer_1/analysis.md` for complete architectural blueprints, component specifications, and code snippets.
