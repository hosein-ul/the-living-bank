# Original User Request

## Initial Request — 2026-08-29T19:42:51Z

Rebuild and elevate "The Living Bank" ($STANDARD) interactive website with award-winning (Awwwards/FWA-grade) luxury scroll-driven animations, multi-layered parallax depth, velocity-reactive physics, sticky pinned scrubbers, and tactile micro-interactions — deployed exclusively to Vercel.

Working directory: `/home/ubuntu/bank`
Integrity mode: `development`

---

## Requirements

### R1. Luxury Scroll & Parallax Systems (5 Core Techniques)
Implement distinct, multi-layered scroll animations across all 11 chapters:
1. **Card Stacking & 3D Depth Scaling (Apple/Stripe style):** Chapters seamlessly stack, scale down (`scale(0.92)`), blur slightly, and recede into depth as new chapters scroll over them.
2. **SVG Path & Conduit Scrubbing:** Financial pipes, Dutch auction curves, Net ETH flow vectors, and vault splitters draw and morph precisely with scroll position (`strokeDashoffset` and path morphing).
3. **Kinetic Typography & Mask Reveals:** Headlines, numerals, and takeaway quotes reveal with staggered word masking, 3D perspective tilts (`rotateX(15deg) -> 0deg`), and velocity-reactive physics.
4. **Physical Canvas-2D & Fluid Particle Kinetics:** Golden currency dust, atmospheric embers, and crowd silhouettes reacting to scroll velocity with inertia dampening.
5. **Multi-Directional Parallax:** Hybrid horizontal-vertical pan layers where background linework, watermarks, and foreground coins drift along opposing diagonals.

### R2. Smooth Inertia & Sensory Feedback
- Smooth scroll via Lenis (`lerp: 0.08`) with zero layout shift or jitter on 60Hz/120Hz displays.
- Integrated Web Audio sensory layer with 6 vintage mechanical sound effects (stamp, slam, stream, ember crackle, tick, chime).
- Full compliance with `prefers-reduced-motion` media query.

### R3. Strict Protocol Fidelity ($STANDARD)
- 100% adherence to The Standard Reserve whitepaper: `$STANDARD` ticker, 1B hard cap, soulbound Charters (1-10 Branches), Net ETH flow signal, dual-regime monetary policy (Expansion gold vault / Contraction buyback & burn), quadratic resolution fee (50/50 split), and 30-day ghost revocation.
- Strict design system: Paper ground (`#f4f1ea`), Recessed paper (`#e9e4d8`), Ink (`#1a1a18`), Gold (`#b08d2e`), Semantic Green (`#3d6b4f`), Semantic Red (`#a33b2e`), and zero forbidden hues (no blue/purple/teal).

### R4. Deployment & VPS Environment Rules
- **Never run persistent dev servers on the VPS:** Build and test locally without keeping heavy dev processes running.
- **Automated Vercel Deployment:** Push all production builds to Vercel (`vercel --prod`) and GitHub (`hosein-ul/the-living-bank`).

---

## Acceptance Criteria

### Visual & Motion Quality
- [ ] Card stacking transitions with 3D scale and opacity fade work smoothly between all chapters.
- [ ] SVG path scrubbing accurately reflects scroll progression in Chapters 2, 4, 6, and 7.
- [ ] Kinetic typography reveals headlines cleanly without jitter or layout shifts.
- [ ] All 10 interactive chapters execute valid state transitions in the simulation store.
- [ ] Full graceful fallback under `prefers-reduced-motion`.

### Protocol & Lore Accuracy
- [ ] Ticker is strictly `$STANDARD` across all UI elements, HUD plaques, receipts, and charts.
- [ ] All simulated numbers and mechanics match the whitepaper formulas.

### Build & Deployment
- [ ] TypeScript strict mode (`npx tsc --noEmit`) passes with 0 errors.
- [ ] Automated verification tests pass in Puppeteer.
- [ ] Production build succeeds and deploys to Vercel with a live accessible URL.
- [ ] Code is pushed to GitHub repository `hosein-ul/the-living-bank`.
