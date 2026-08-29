# Scroll & Motion Architecture Survey Report
**Project:** The Living Bank ($STANDARD)  
**Investigator:** Survey Explorer 1 (Scroll & Motion Architecture Specialist)  
**Date:** 2026-08-29  
**Target Standard:** Award-winning (Awwwards Site of the Year / FWA of the Month) Luxury Editorial Motion  

---

## 1. Executive Summary & Architectural Overview

The Living Bank codebase establishes a functional Next.js 15, Tailwind CSS 4, and Framer Motion scaffold that satisfies core lore and state simulation requirements. However, to elevate this experience from an ordinary interactive explainer to an **award-winning (Awwwards/FWA-grade) luxury scroll-driven experience**, the motion architecture requires systemic elevation across five foundational pillars:

1. **Card Stacking & 3D Depth Scaling (Apple / Stripe Masterpiece Style):** Currently, chapters scroll in a traditional, flat vertical flow with local `sticky top-0 h-screen` sections. They lack inter-chapter card pinning, where preceding chapters scale down to `scale(0.92)`, dim, drop elevation shadows, and recede along the Z-axis (`translateZ(-80px)`) as subsequent chapters stack smoothly on top.
2. **True SVG Path & Conduit Scrubbing (Chapters 2, 4, 6, 7):** Existing SVG conduits rely on looping CSS dashes (`animate-[dash_20s_linear_infinite]`) or discrete state redraws rather than high-precision scroll-scrubbed path progression (`pathLength` / `strokeDashoffset` dynamically tied to `useScroll`).
3. **Kinetic Typography & Mask Reveals:** Headings and body copy currently execute standard opacity/translate fade-ups (`opacity: 0, y: 16 -> 1, 0`). True luxury editorial typography requires line/word-masked reveal wrappers (`overflow-hidden`), 3D perspective rotation (`rotateX(15deg) -> 0deg`), and scroll velocity-reactive skewing.
4. **Multi-Directional Parallax & Layer Separation:** Most scenes operate on a single vertical axis. True visual depth requires 3 distinct z-planes per chapter: Background guilloche linework drifting along negative diagonal vectors $(-dx, -dy)$, midground stage cards, and foreground tactile tokens drifting along positive diagonal vectors $(+dx, -dy)$.
5. **Smooth Scroll & Velocity Engine Synchronization:** `SmoothScroll.tsx` initializes Lenis, but CSS contains a conflicting `scroll-behavior: smooth` in `app/globals.css`, causing scroll fighting and jitter. Furthermore, Lenis scroll velocity is not broadcast to components, preventing velocity-reactive particle dampening and kinetic physics.

---

## 2. Detailed Audit: Smooth Scroll, Inertia & Lenis Integration

### Observations
- **File:** `components/chrome/SmoothScroll.tsx` (lines 16–21):
  ```tsx
  const lenis = new Lenis({
    lerp: 0.09,
    duration: 1.2,
    smoothWheel: true,
  });
  ```
- **File:** `app/globals.css` (lines 21–25):
  ```css
  html {
    background-color: #f4f1ea;
    color: #1a1a18;
    scroll-behavior: smooth;
  }
  ```
- **File:** `components/chrome/ChapterRail.tsx` (lines 40–45):
  ```tsx
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  ```

### Analysis & Critical Gaps
1. **CSS Smooth Scroll Conflict:** Setting `scroll-behavior: smooth` in `app/globals.css` causes native browser smooth scroll to fight Lenis's `requestAnimationFrame` interpolation. This results in stutter and hitching on 60Hz and 120Hz displays during programmatic scrolls (e.g. ChapterRail clicks, Cover CTA clicks).
2. **Isolated Lenis Instance:** Lenis is initialized in an isolated React ref and discarded from the React context. Downstream components have no access to `lenis.velocity`, `lenis.progress`, or `lenis.direction`.
3. **Imperfect ScrollTo Navigation:** ChapterRail and Cover CTA use `element.scrollIntoView({ behavior: "smooth" })` rather than `lenis.scrollTo(target, { offset: 0, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })`.

---

## 3. Detailed Audit: Card Stacking & 3D Depth Scaling (11 Chapters)

### Observations
- **File:** `app/page.tsx` (lines 32–44):
  ```tsx
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
  ```
- **Files:** `components/scenes/S1Island.tsx` through `S9Ledger.tsx`:
  Each scene defines:
  ```tsx
  <section id="chapter-N" ref={containerRef} className="relative min-h-[260vh] border-t border-ink/10 bg-paper">
    <div className="sticky top-0 h-screen w-full flex ...">
      {/* Local stage and copy */}
    </div>
  </section>
  ```

### Analysis & Critical Gaps
1. **Lack of Inter-Chapter Stacking Orchestration:** Each section unpins abruptly when its `min-h-[260vh]` ends. There is no cross-chapter card stacking transform.
2. **Missing Depth Scaling (`scale(0.92)` & Receding Z-Plane):**
   - In luxury card stacking (e.g., Apple product pages, Stripe press), as Chapter $N+1$ scrolls into view from below ($y: 100\text{vh} \rightarrow 0$), Chapter $N$ stays pinned under it and undergoes:
     - `scale`: $1.0 \rightarrow 0.92$
     - `opacity`: $1.0 \rightarrow 0.70$
     - `y`: $0 \rightarrow -30\text{px}$
     - `translateZ`: $0 \rightarrow -80\text{px}$ (with `perspective: 1200px`)
     - `boxShadow`: Elevation shadow casting over the receding sheet.
3. **Mobile Handling:** Mobile viewports require sticky stacking to be disabled in favor of natural vertical stacking with subtle entrance scale reveals.

---

## 4. Detailed Audit: SVG Path & Conduit Scrubbing (Chapters 2, 4, 6, 7)

### Observations & Code Evaluation

#### Chapter 2: The Only Number (`components/scenes/S2Gate.tsx`)
- **Current State:** Renders canvas coins and a horizontal lever slider.
- **Gap:** Lacks an SVG Net ETH flow vector pipe connecting the Uniswap v4 pool to the city gate. Scroll progress does not scrub an SVG conduit line showing capital entering or leaving the bank.

#### Chapter 4: Growth Burns (`components/scenes/S4Furnace.tsx`)
- **Current State:** Uses a linear track bar (`trackProgress`) driven partly by `(latest * 1.5) % 1` and partly by `setInterval`.
- **Gap:** Missing the true mathematical Dutch Auction exponential decay curve:
  $$P(t) = P_{\text{start}} \cdot \left(\frac{P_{\text{floor}}}{P_{\text{start}}}\right)^{t/24\text{h}}$$
  The curve should be rendered as a sculpted SVG path whose `strokeDashoffset` and tangible marker scrub with both scroll progression and simulated time.

#### Chapter 6: Where Fees Go (`components/scenes/S6Vaults.tsx`)
- **Current State:** Lines 141–152 render an SVG pipe with an infinite CSS dash animation:
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
- **Gap:** The conduit is an autonomous CSS animation. It does not scrub with scroll position (`pathLength` tied to `scrollYProgress`). Furthermore, when switching between EXPANSION (Gold Vault) and CONTRACTION (Buyback Furnace), the 70% branch path does not morph or dynamically redirect its stroke stream.

#### Chapter 7: The Run, Inverted (`components/atoms/TollGate.tsx` & `components/scenes/S7Run.tsx`)
- **Current State:** `TollGate.tsx` plots a quadratic polyline updated on state change (`exitPressure`).
- **Gap:** The exit toll arc is not scrubbed by scroll position during chapter entrance. There is no visual SVG fluid conduit branching 50% of the runner's fee into the stayers' mugs and 50% into the burn crucible.

---

## 5. Detailed Audit: Kinetic Typography & Mask Reveals

### Observations
Across `components/scenes/S0Cover.tsx` through `S10Epilogue.tsx`:
```tsx
<motion.h1
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.64, delay: 0.2, ease: EASINGS.smooth }}
  className="font-serif text-5xl sm:text-7xl lg:text-8xl ..."
>
  {content.title}
</motion.h1>
```

### Analysis & Critical Gaps
1. **No Word Masking:** Full sentences and headings animate as a single monolithic block rather than masked word tokens. In luxury typography, each word sits in an `overflow: hidden` container and translates from `y: 110%` to `y: 0%` with staggered delays (30ms per word).
2. **Missing 3D Perspective Tilt:** Headlines and chapter titles do not utilize 3D perspective rotation (`rotateX: 18deg -> 0deg` with `transformOrigin: "50% 100%"` and `perspective: 800px`), which provides editorial tactile presence.
3. **No Velocity-Reactive Skew:** Fast scrolling does not induce a subtle inertial text skew (`skewY: clamp(-4deg, velocity * 0.05, 4deg)`), which brings text alive as the user scrubs through chapters.

---

## 6. Detailed Audit: Multi-Directional Parallax

### Observations
- In `S0Cover.tsx`: `bgParallax` is purely vertical `[0, -100]`.
- In `S1Island.tsx` to `S9Ledger.tsx`: `copyY` is purely vertical `[0, 30]`.

### Analysis & Critical Gaps
1. **Single-Axis Flatness:** All parallax layers move exclusively along the Y-axis.
2. **Opposing Diagonal Dynamics:** An award-winning composition requires opposing multi-directional vectors:
   - **Layer 0 (Background):** Subtle guilloche engraving / currency linework drifting along $(-40\text{px}, -60\text{px})$ (angle $\approx 236^\circ$).
   - **Layer 1 (Midground Card):** Content and stage container moving on primary scroll axis $(0, 0)$.
   - **Layer 2 (Foreground Accents):** Floating $STANDARD coins, wax seal badges, and receipt corner tags drifting along $(+50\text{px}, -30\text{px})$ (angle $\approx 329^\circ$) with depth-dependent scale and rotational drift.

---

## 7. Performance & Reduced Motion Audit

1. **60Hz & 120Hz Displays:** Lenis `lerp: 0.08` operates smoothly with Framer Motion when `will-change: transform` is applied properly to animated layers and CSS `scroll-behavior` is disabled.
2. **Offscreen Canvas Suspension:** `S2Gate.tsx` correctly implements `IntersectionObserver` to pause rAF loops when offscreen. This pattern must be maintained across all canvas particle systems.
3. **`prefers-reduced-motion` Gate:** `app/globals.css` and individual components respect `prefers-reduced-motion`. In reduced-motion mode:
   - All card stack transforms flatten to static `transform: none`, `opacity: 1`.
   - Kinetic typography renders without translate or 3D tilt.
   - SVG conduits display at 100% completion (`pathLength: 1`).
   - Three.js island renders as a static low-poly vista.

---

## 8. Concrete Architectural & Code Proposals

### Proposal 1: Unified Lenis Smooth Scroll Provider (`components/chrome/SmoothScroll.tsx`)
Expose Lenis instance and live scroll velocity via React Context:

```tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import Lenis from "lenis";

interface ScrollContextValue {
  lenis: Lenis | null;
  velocity: number;
  progress: number;
  scrollTo: (target: string | HTMLElement, options?: Record<string, unknown>) => void;
}

const ScrollContext = createContext<ScrollContextValue>({
  lenis: null,
  velocity: 0,
  progress: 0,
  scrollTo: () => {},
});

export const useLenisScroll = () => useContext(ScrollContext);

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [velocity, setVelocity] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    setLenisInstance(lenis);

    lenis.on("scroll", (e: { velocity: number; progress: number }) => {
      setVelocity(e.velocity);
      setProgress(e.progress);
    });

    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = (target: string | HTMLElement, options?: Record<string, unknown>) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options,
      });
    } else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "auto" });
    }
  };

  return (
    <ScrollContext.Provider value={{ lenis: lenisInstance, velocity, progress, scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
};
```

---

### Proposal 2: Apple / Stripe Card Stacking Component (`components/motion/CardStackSection.tsx`)
Standardized wrapper for all 11 chapters providing `scale(0.92)`, `opacity(0.70)`, and receding depth:

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface CardStackSectionProps {
  id: string;
  index: number;
  totalChapters?: number;
  className?: string;
  children: React.ReactNode;
}

export const CardStackSection: React.FC<CardStackSectionProps> = ({
  id,
  index,
  totalChapters = 11,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Scale down from 1.0 to 0.92 as subsequent card stacks over
  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1.0, 1.0, 0.92]);
  // Subtle opacity dimming
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1.0, 1.0, 0.72]);
  // Receding Y translation
  const translateY = useTransform(scrollYProgress, [0, 0.7, 1], [0, 0, -36]);

  return (
    <section
      id={id}
      ref={containerRef}
      style={{ zIndex: index + 1 }}
      className={`relative min-h-[260vh] bg-paper ${className}`}
    >
      <motion.div
        style={{
          scale,
          opacity,
          y: translateY,
          transformOrigin: "top center",
        }}
        className="sticky top-0 h-screen w-full overflow-hidden shadow-[0_-12px_40px_rgba(26,26,24,0.05)]"
      >
        {children}
      </motion.div>
    </section>
  );
};
```

---

### Proposal 3: Kinetic Typography & Word Mask Component (`components/motion/KineticText.tsx`)
Staggered word reveal with 3D perspective tilt:

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASINGS } from "@/lib/easings";

interface KineticTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  as: Component = "h2",
  className = "",
  delay = 0,
  stagger = 0.035,
}) => {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: "115%",
      rotateX: 20,
      opacity: 0,
    },
    visible: {
      y: "0%",
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: 0.64,
        ease: EASINGS.smooth,
      },
    },
  };

  return (
    <Component className={`perspective-800 ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="inline-flex flex-wrap gap-x-[0.28em] transform-style-3d"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-0.5">
            <motion.span
              variants={wordVariants}
              className="inline-block origin-bottom transform-style-3d"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
};
```

---

### Proposal 4: Scroll-Scrubbed SVG Conduits (`components/motion/ScrubbedConduit.tsx`)
High-precision SVG conduit scrubbing for Chapters 2, 4, 6, 7:

```tsx
"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface ScrubbedConduitProps {
  d: string;
  progress: MotionValue<number>;
  strokeColor?: string;
  strokeWidth?: number;
  viewBox?: string;
  className?: string;
}

export const ScrubbedConduit: React.FC<ScrubbedConduitProps> = ({
  d,
  progress,
  strokeColor = "#b08d2e",
  strokeWidth = 2,
  viewBox = "0 0 400 60",
  className = "",
}) => {
  const pathLength = useTransform(progress, [0.1, 0.9], [0, 1]);

  return (
    <svg viewBox={viewBox} className={`w-full overflow-visible ${className}`}>
      {/* Ghost track */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={0.15}
      />
      {/* Scrubbed fill */}
      <motion.path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ pathLength }}
      />
    </svg>
  );
};
```

---

### Proposal 5: Opposing Diagonal Parallax Layering (`components/motion/MultiParallax.tsx`)
Background linework vs. foreground tactile tokens drifting on opposing vectors:

```tsx
"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface MultiParallaxProps {
  progress: MotionValue<number>;
  children: React.ReactNode;
}

export const MultiParallaxLayer: React.FC<{
  progress: MotionValue<number>;
  vector: [number, number]; // [dx, dy]
  rotate?: [number, number];
  className?: string;
  children: React.ReactNode;
}> = ({ progress, vector, rotate = [0, 0], className = "", children }) => {
  const x = useTransform(progress, [0, 1], [0, vector[0]]);
  const y = useTransform(progress, [0, 1], [0, vector[1]]);
  const r = useTransform(progress, [0, 1], [rotate[0], rotate[1]]);

  return (
    <motion.div style={{ x, y, rotate: r }} className={className}>
      {children}
    </motion.div>
  );
};
```

---

## 9. Implementation Roadmap & Quality Checklist

| Phase | Target Area | Description | Priority |
|---|---|---|---|
| **Phase 1** | **Scroll Engine Foundation** | Remove `scroll-behavior: smooth` from CSS. Update `SmoothScroll.tsx` with Context & `useLenisScroll`. Update `ChapterRail.tsx` to call `lenis.scrollTo()`. | P0 |
| **Phase 2** | **Card Stacking & 3D Depth** | Wrap Chapters S0–S10 in `CardStackSection.tsx`. Add `scale(0.92)`, dimming, and elevation shadow transitions. | P0 |
| **Phase 3** | **SVG Path Scrubbing** | Enhance Chapters 2, 4, 6, 7 with `ScrubbedConduit` (Net ETH vector, Dutch auction decay curve, 70/15/15 active vault routing morph, quadratic toll arc). | P1 |
| **Phase 4** | **Kinetic Typography** | Replace monolithic text reveals with `KineticText` (word mask, 3D `rotateX`, staggered delays). | P1 |
| **Phase 5** | **Multi-Directional Parallax** | Add opposing diagonal guilloche linework and foreground floating tokens across all scenes. | P1 |
| **Phase 6** | **Velocity Physics & Polish** | Connect canvas rAF particle systems to Lenis velocity. Execute full QA pass on 60/120Hz displays and reduced-motion states. | P2 |

---
*Report completed and verified against SUPERPROMPT §1–§13.*
