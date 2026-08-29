# E2E Test Infra: The Living Bank ($STANDARD)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory & Test Coverage
| # | Feature | Source (Requirement) | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Workload) |
|---|---------|----------------------|:-----------------:|:-----------------:|:----------------------:|:-----------------:|
| 1 | Card Stacking & 3D Depth | ORIGINAL_REQUEST §R1.1 | 5 | 5 | ✓ | ✓ |
| 2 | SVG Path & Conduit Scrubbing | ORIGINAL_REQUEST §R1.2 | 5 | 5 | ✓ | ✓ |
| 3 | Kinetic Typography | ORIGINAL_REQUEST §R1.3 | 5 | 5 | ✓ | ✓ |
| 4 | Canvas Particle Kinetics | ORIGINAL_REQUEST §R1.4 | 5 | 5 | ✓ | ✓ |
| 5 | Multi-Directional Parallax | ORIGINAL_REQUEST §R1.5 | 5 | 5 | ✓ | ✓ |
| 6 | Lenis Smooth Scroll & Inertia | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 7 | Web Audio SFX (6 Sounds) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | Reduced Motion Compliance | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 9 | $STANDARD Protocol Mechanics | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 10| Design Tokens & Banned Hues | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 11| Chapter Interactions S0-S10 | ORIGINAL_REQUEST §AC | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Runner**: Node.js + Puppeteer script (`scripts/test-e2e.ts`) + SimEngine tests (`scripts/test-engine.ts`)
- **Invocation**: `npx tsx scripts/test-e2e.ts`
- **Pass/Fail Semantics**: All tier assertions must pass with 0 uncaught errors and exit code 0.
- **Visual Validation**: Full-page screenshots at 1440px desktop, 390px mobile, and `@media (prefers-reduced-motion: reduce)`.
