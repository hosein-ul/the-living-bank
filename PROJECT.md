# Project: The Living Bank ($STANDARD) Rebuild & Elevation

## Architecture
- **Framework**: Next.js 15 (App Router, Turbopack, React 19)
- **Styling & Design System**: Tailwind CSS 4, Custom Design Tokens (Paper `#f4f1ea`, Paper-deep `#e9e4d8`, Ink `#1a1a18`, Gold `#b08d2e`, Gold-bright `#c9a961`, Green `#3d6b4f`, Red `#a33b2e`), Typography (Fraunces & IBM Plex Mono).
- **Motion & Scroll Stack**: Lenis Smooth Scroll (`lerp: 0.08`), Framer Motion, Three.js (S1 Island 3D scene only), HTML5 Canvas-2D (S0 currency dust, S2 gate coins, S4 furnace embers, S10 share card).
- **Audio Stack**: Web Audio API Procedural Synthesizer (`lib/sound.ts`) with 6 vintage mechanical sound effects (stamp, slam, stream, ember crackle, tick, chime).
- **State & Simulation Store**: Zustand (`SimProvider.tsx` & `lib/sim/engine.ts`) enforcing 100% fidelity to The Standard Reserve whitepaper.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Lenis Context & Velocity Provider | Remove CSS scroll fighting, expose scroll velocity, smooth scrollTo | M1 | R1, R2 |
| 2 | Card Stacking & 3D Depth Scaling | Scale(0.92), receding Z-axis, elevation shadow stacking across chapters | M1 | R1.1 |
| 3 | SVG Path & Conduit Scrubbing | Scroll-driven `pathLength` for financial pipes, flow vectors, splitter | M1 | R1.2 |
| 4 | Kinetic Typography & Word Masking | Overflow-hidden word reveal, rotateX(15deg) perspective tilt | M1 | R1.3 |
| 5 | Multi-Directional Parallax Layers | Opposing diagonal pan vectors for background linework and foreground coins | M1 | R1.5 |
| 6 | Web Audio Optimization & Synthesis | Pre-allocated noise buffers, master gain node, 6 mechanical SFX | M2 | R2 |
| 7 | Canvas-2D Physics & Retina Scaling | DPR scaling, scroll-velocity inertia coupling, offscreen pausing | M2 | R1.4, R2 |
| 8 | Reduced-Motion Media Query Compliance | Full graceful degradation under `prefers-reduced-motion` | M2 | R2 |
| 9 | Protocol Fidelity & Store Verification | $STANDARD ticker, 1B hard cap, soulbound charters, dual-regime policy | M3 | R3 |
| 10 | Strict Palette & Banned Hues Audit | 0 matches for blue/purple/teal across all components and styles | M3 | R3 |
| 11 | Share Card 1080x1080 PNG Generator | Client-side Canvas receipt generator with live session metrics | M3 | R3 |
| 12 | Automated E2E Testing Suite | Tier 1-4 Puppeteer test runner verifying motion, protocol, responsive | M4 (E2E) | AC |
| 13 | Vercel Production Deploy & GitHub Push | `vercel --prod` and push to `hosein-ul/the-living-bank` on `main` | Final | R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Luxury Scroll & Motion Architecture | CardStackSection, ScrubbedConduit, KineticText, MultiParallax, Lenis context | none | IN_PROGRESS |
| M2 | Sensory Audio, Physics & Kinetics Polish | Web Audio buffers, MasterGain, Canvas DPR, particle velocity coupling, reduced-motion | M1 | PLANNED |
| M3 | Protocol Fidelity & Chapter Polish | $STANDARD consistency, HUD plaque, simulation store binding, share card PNG | M1 | PLANNED |
| M4 | E2E Testing Track | Comprehensive Puppeteer test suite (Tiers 1-4), TEST_READY.md publication | M1, M2, M3 | PLANNED |
| Final | Production Deploy & Delivery | TypeScript verification, E2E pass, Vercel deploy, GitHub push | M1, M2, M3, M4 | PLANNED |

## Code Layout
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`: Root layout, global paper styles, chapter composition.
- `components/chrome/`: `SmoothScroll.tsx`, `ChapterRail.tsx`, `BrassPlaque.tsx`, `EpochCounter.tsx`, `SoundToggle.tsx`, `Grain.tsx`.
- `components/motion/`: `CardStackSection.tsx`, `KineticText.tsx`, `ScrubbedConduit.tsx`, `MultiParallaxLayer.tsx`.
- `components/atoms/`: `Coin.tsx`, `WaxSeal.tsx`, `Odometer.tsx`, `Furnace.tsx`, `Dial.tsx`, `NPC.tsx`, `TollGate.tsx`, `Receipt.tsx`.
- `components/scenes/`: `S0Cover.tsx`, `S1Island.tsx`, `ThreeIsland.tsx`, `S2Gate.tsx`, `S3Charter.tsx`, `S4Furnace.tsx`, `S5Dial.tsx`, `S6Vaults.tsx`, `S7Run.tsx`, `S8Ghost.tsx`, `S9Ledger.tsx`, `S10Epilogue.tsx`.
- `lib/`: `sound.ts`, `easings.ts`, `rand.ts`, `sim/engine.ts`.
- `scripts/`: `test-engine.ts`, `verify-all.ts`, `test-e2e.ts`.

## Interface Contracts
### Scroll & Motion Components ↔ Scenes
- `CardStackSection`: Props `{ id: string; index: number; totalChapters: number; children: React.ReactNode; className?: string }`
  - Maps exit phase to `scale: 1.0 -> 0.92`, `opacity: 1.0 -> 0.72`, `y: 0 -> -36px`, `translateZ: 0 -> -80px`.
- `KineticText`: Props `{ text: string; as?: "h1" | "h2" | "h3" | "p"; delay?: number; className?: string; velocityReactive?: boolean }`
  - Wraps words in `overflow-hidden` mask spans, staggered entrance with `rotateX(15deg) -> 0deg`.
- `ScrubbedConduit`: Props `{ path: string; viewBox: string; strokeColor?: string; className?: string }`
  - Bounds `pathLength` to scroll progress.
- `SoundManager`: Web Audio API singleton in `lib/sound.ts`
  - Methods: `initCtx()`, `playThud()`, `playCrackle()`, `playChime()`, `playCoinClink()`, `playRatchet()`, `playShatter()`, `playTick()`, `toggleMute()`.
