## 2026-08-29T19:48:21Z

You are Worker 1 (Scroll & Motion Architecture Implementer) for Milestone 1.
Working directory: /home/ubuntu/bank/.agents/m1_worker
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/PROJECT.md
3. /home/ubuntu/bank/.agents/survey_explorer_1/analysis.md
4. /home/ubuntu/bank/.agents/survey_explorer_1/handoff.md

Your mission:
Implement the complete Luxury Scroll & Motion Architecture per R1 and Explorer 1's blueprints:
1. **Lenis Context & Smooth Navigation**:
   - In `app/globals.css`, remove `scroll-behavior: smooth` to eliminate the browser vs Lenis scroll fighting.
   - In `components/chrome/SmoothScroll.tsx`, create a full React context provider `ScrollProvider` / `useLenisScroll` exporting `{ lenis, scrollY, velocity, direction, progress }` with a hook to safely register rAF callbacks or scroll subscribers.
   - Update `components/chrome/ChapterRail.tsx` and any CTA buttons to use `lenis.scrollTo(target, ...)` for seamless, jitter-free programmatic navigation.
2. **Card Stacking & 3D Depth Scaling (`components/motion/CardStackSection.tsx`)**:
   - Create `components/motion/CardStackSection.tsx` using Framer Motion `useScroll` with `target: containerRef` and `offset: ["start start", "end start"]`.
   - On desktop, map the section exit phase (when the subsequent chapter scrolls up over it) to `scale: 1.0 -> 0.92`, `opacity: 1.0 -> 0.72`, `y: 0 -> -36px`, `translateZ: 0 -> -80px` (with container `perspective: 1200px`), and subtle elevation drop shadow (`boxShadow: "0 25px 50px -12px rgba(26,26,24,0.18)"`).
   - On mobile (`window.innerWidth < 768` or media query), gracefully fallback to clean vertical flow without fixed overflow clipping.
3. **Scroll-Scrubbed SVG Conduits (`components/motion/ScrubbedConduit.tsx`)**:
   - Create `components/motion/ScrubbedConduit.tsx` supporting dynamic `pathLength` / `strokeDashoffset` mapped to scroll progress.
   - Integrate into:
     - `components/scenes/S2Gate.tsx`: Net ETH flow conduit vector scrubbing with scroll.
     - `components/scenes/S4Furnace.tsx`: Dutch auction exponential decay curve scrubbing.
     - `components/scenes/S6Vaults.tsx`: 70/15/15 fee splitter conduits flowing dynamically.
     - `components/scenes/S7Run.tsx`: Quadratic resolution fee curve drawing with scroll.
4. **Kinetic Typography & Mask Reveals (`components/motion/KineticText.tsx`)**:
   - Create `components/motion/KineticText.tsx` that breaks text into words/lines wrapped in `overflow-hidden` mask spans.
   - Implement 3D perspective reveals (`rotateX(15deg) -> 0deg`, `y: "110%" -> "0%"`, staggered by 35ms per word).
   - Add subtle velocity-reactive skew/tilt when fast scrolling occurs.
   - Integrate into headlines, titles, and gold Fraunces italic takeaways across `components/scenes/*`.
5. **Multi-Directional Parallax (`components/motion/MultiParallaxLayer.tsx`)**:
   - Create `components/motion/MultiParallaxLayer.tsx` mapping scroll progress to opposing diagonal coordinates (e.g. background linework drifting `[-40px, -60px]` vs foreground floating coins drifting `[+50px, -30px]`).
   - Apply to scenes (e.g. `S0Cover`, `S1Island`, `S3Charter`, `S5Dial`, `S9Ledger`).
6. **Chapter Composition in `app/page.tsx`**:
   - Wrap all 11 chapters (S0 through S10) with `CardStackSection` in `app/page.tsx` to form a cohesive, luxury stacked editorial journey.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification requirements:
- Run `npx tsc --noEmit` to ensure 0 TypeScript errors.
- Run `npm run build` to verify production compilation.
- Ensure zero forbidden hues (#f4f1ea, #e9e4d8, #1a1a18, #b08d2e, #3d6b4f, #a33b2e only).
- Write `/home/ubuntu/bank/.agents/m1_worker/changes.md` and `/home/ubuntu/bank/.agents/m1_worker/handoff.md`.
- Send completion message to parent when done.
