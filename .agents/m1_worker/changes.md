# Changes Report — Milestone 1: Scroll & Motion Architecture

**Implementer:** Worker 1 (Scroll & Motion Architecture Implementer)  
**Date:** 2026-08-29  
**Milestone:** Milestone 1  

---

## 1. Summary of Changes

Milestone 1 implements the complete Luxury Scroll & Motion Architecture for "The Living Bank" ($STANDARD) interactive website:

1. **Lenis Context & Smooth Navigation Engine (`components/chrome/SmoothScroll.tsx`, `app/globals.css`, `components/chrome/ChapterRail.tsx`)**:
   - Removed `scroll-behavior: smooth` from `html` in `app/globals.css` to eliminate native browser vs Lenis scroll fighting and jitter.
   - Built a comprehensive React Context provider `ScrollProvider` (and `useLenisScroll` hook) in `components/chrome/SmoothScroll.tsx` exposing `{ lenis, scrollY, velocity, direction, progress, scrollTo }`.
   - Updated `ChapterRail.tsx` and `S0Cover.tsx` CTA buttons to use `scrollTo(target, options)` through Lenis with custom luxury exponential easing `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`.

2. **Apple/Stripe-Grade Card Stacking & 3D Depth Scaling (`components/motion/CardStackSection.tsx`)**:
   - Created `CardStackSection.tsx` using Framer Motion `useScroll` with `target: containerRef` and `offset: ["start start", "end start"]`.
   - On desktop, maps the section exit phase (when the subsequent chapter scrolls up over it) to:
     - `scale`: $1.0 \rightarrow 0.92$
     - `opacity`: $1.0 \rightarrow 0.72$
     - `y`: $0 \rightarrow -36\text{px}$
     - `translateZ`: $0 \rightarrow -80\text{px}$ (with container `perspective: 1200px`)
     - `boxShadow`: $0 \rightarrow \text{0 25px 50px -12px rgba(26,26,24,0.18)}$
   - On mobile viewports (`<768px`) and `prefers-reduced-motion`, gracefully falls back to clean vertical flow without fixed overflow clipping or 3D transform scaling.

3. **Scroll-Scrubbed SVG Conduits (`components/motion/ScrubbedConduit.tsx`)**:
   - Created `ScrubbedConduit.tsx` supporting dynamic `pathLength` / `strokeDashoffset` mapped to scroll progress, ghost tracks, glow effects, and directional flow.
   - Integrated into:
     - `components/scenes/S2Gate.tsx`: Net ETH flow conduit vector between Uniswap v4 hooked pool and the bank gate, reactive to scroll progress and inflow/outflow direction.
     - `components/scenes/S4Furnace.tsx`: Dutch auction exponential decay curve ($P(t) = P_{\text{start}} \cdot (P_{\text{floor}}/P_{\text{start}})^{t/24\text{h}}$) with live tracking marker.
     - `components/scenes/S6Vaults.tsx`: 70 / 15 / 15 fee splitter conduits flowing dynamically with scroll, and active branch color morphing (Green/Gold for Gold Vault vs Red for Buyback Furnace).
     - `components/scenes/S7Run.tsx` & `components/atoms/TollGate.tsx`: Quadratic resolution fee curve and 50/50 fee splitter branching into stayers' mugs and burn crucible.

4. **Kinetic Typography & Word Mask Reveals (`components/motion/KineticText.tsx`)**:
   - Created `KineticText.tsx` breaking text into words wrapped in `overflow-hidden` mask spans.
   - Implemented 3D perspective reveals (`rotateX(15deg) -> 0deg`, `y: "110%" -> "0%"`, staggered by 35ms per word).
   - Added velocity-reactive skew physics (`skewY: clamp(-4deg, velocity * 0.04, 4deg)`) coupled to Lenis scroll speed.
   - Integrated across headlines, chapter titles, and gold Fraunces italic takeaways across all 11 chapters (`S0Cover` through `S10Epilogue`).

5. **Multi-Directional Parallax Layers (`components/motion/MultiParallaxLayer.tsx`)**:
   - Created `MultiParallaxLayer.tsx` mapping scroll progress to opposing diagonal coordinates (e.g. background linework drifting `[-40px, -60px]` vs foreground floating tokens drifting `[+40px, -20px]`).
   - Integrated into `S0Cover`, `S1Island`, `S2Gate`, `S3Charter`, `S4Furnace`, `S5Dial`, `S6Vaults`, `S7Run`, `S8Ghost`, `S9Ledger`.

6. **Chapter Composition in `app/page.tsx`**:
   - Wrapped all 11 chapters (`S0Cover` through `S10Epilogue`) in `CardStackSection` in `app/page.tsx` to form a unified luxury stacked editorial journey.

---

## 2. File Modification Details

| File Path | Action | Description |
|---|---|---|
| `app/globals.css` | Modified | Removed `scroll-behavior: smooth`, added `.perspective-1200` utility class. |
| `components/chrome/SmoothScroll.tsx` | Modified | Replaced isolated ref with full React Context (`ScrollProvider` / `useLenisScroll`) exposing `{ lenis, scrollY, velocity, direction, progress, scrollTo }`. |
| `components/chrome/ChapterRail.tsx` | Modified | Replaced `scrollIntoView` with `useLenisScroll` programmatic `scrollTo`. |
| `components/motion/CardStackSection.tsx` | Created | 3D card stacking wrapper with `scale(0.92)`, `opacity(0.72)`, `translateZ(-80px)`, elevation shadow, and mobile fallback. |
| `components/motion/ScrubbedConduit.tsx` | Created | Scroll-driven SVG conduit component supporting dynamic `pathLength`, ghost trails, and flow directions. |
| `components/motion/KineticText.tsx` | Created | Word-masked 3D perspective typography with velocity-reactive skewing. |
| `components/motion/MultiParallaxLayer.tsx` | Created | Multi-directional opposing diagonal parallax layer component. |
| `components/motion/index.ts` | Created | Central export index for motion components. |
| `components/scenes/S0Cover.tsx` | Modified | Added KineticText title/eyebrow, MultiParallaxLayer background guilloche & foreground coin, useLenisScroll navigation. |
| `components/scenes/S1Island.tsx` | Modified | Added KineticText title & gold takeaway, MultiParallaxLayer topographic contours. |
| `components/scenes/S2Gate.tsx` | Modified | Added KineticText title & gold takeaway, ScrubbedConduit Net ETH flow vector, MultiParallaxLayer. |
| `components/scenes/S3Charter.tsx` | Modified | Added KineticText title & gold takeaway, MultiParallaxLayer seal watermark and 3D deed card. |
| `components/scenes/S4Furnace.tsx` | Modified | Added KineticText title & gold takeaway, ScrubbedConduit Dutch auction exponential decay curve, MultiParallaxLayer. |
| `components/scenes/S5Dial.tsx` | Modified | Added KineticText title & gold takeaway, MultiParallaxLayer dial compass linework. |
| `components/scenes/S6Vaults.tsx` | Modified | Added KineticText title & gold takeaway, ScrubbedConduit 70/15/15 fee splitter with regime morphing, MultiParallaxLayer. |
| `components/scenes/S7Run.tsx` | Modified | Added KineticText title & gold takeaway, ScrubbedConduit 50/50 fee splitter, MultiParallaxLayer. |
| `components/atoms/TollGate.tsx` | Modified | Added animated resolution fee quadratic arc path. |
| `components/scenes/S8Ghost.tsx` | Modified | Added KineticText title & gold takeaway, MultiParallaxLayer dormant hourglass linework. |
| `components/scenes/S9Ledger.tsx` | Modified | Added KineticText title & gold takeaway, MultiParallaxLayer ledger grid linework. |
| `components/scenes/S10Epilogue.tsx` | Modified | Added KineticText title, seal stamp animations, and clean CardStackSection compatibility. |
| `app/page.tsx` | Modified | Wrapped all 11 chapters in CardStackSection with unique index and totalChapters. |

---

## 3. Verification & Compliance

- **TypeScript Verification**: `npx tsc --noEmit` passed with 0 errors.
- **Production Build Compilation**: `npm run build` completed successfully (Next.js Turbopack).
- **Color Palette Compliance**: Strictly restricted to `#f4f1ea`, `#e9e4d8`, `#1a1a18`, `#b08d2e`, `#c9a961`, `#3d6b4f`, `#a33b2e`. 0 prohibited hues.
