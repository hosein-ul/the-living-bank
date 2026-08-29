## 2026-08-29T19:53:29Z
You are the E2E Test Writer for The Living Bank rebuild project.
Working directory: /home/ubuntu/bank/.agents/e2e_test_writer
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROJECT.md
4. /home/ubuntu/bank/TEST_INFRA.md

Your mission:
Design, implement, and execute the comprehensive Opaque-Box E2E Testing Suite per \`TEST_INFRA.md\`:
1. **Develop \`scripts/test-e2e.ts\`** using Puppeteer and Node.js:
   - **Tier 1 — Feature Coverage (>=5 tests per feature)**:
     - Card Stacking & 3D Depth scaling presence across chapter elements.
     - SVG Path & Conduit Scrubbing pathLength bindings in Chapters 2, 4, 6, 7.
     - Kinetic Typography word masking & 3D perspective styles.
     - Canvas-2D particle render loops (S0 currency dust, S2 coins, S4 furnace embers).
     - Multi-directional parallax transforms.
     - Lenis smooth scroll configuration (lerp 0.08, zero CSS smooth-scroll conflict).
     - Web Audio synthesis method availability and sound toggle state.
     - Strict $STANDARD ticker consistency across all HUD plaques and receipts.
     - Zero banned hues (grep built assets for blue/purple/teal).
     - Full graceful degradation under \`prefers-reduced-motion: reduce\`.
   - **Tier 2 — Boundary & Corner Cases**:
     - Extreme lever flows (-1.0 to +1.0).
     - Branch purchase ceiling (enforcing 10/10 maximum capacity).
     - Daily license auction purchase limit (3/day).
     - Bank run quadratic fee boundary values (0.5% at zero panic to 25.0% at peak panic).
     - Ghost revocation dormancy bounty and 70% forfeit math.
   - **Tier 3 — Cross-Feature Interaction**:
     - Fast scroll-through velocity coupling with typography and particle inertia.
     - Interactive lever flow triggering epoch advancement, audio tick, and HUD balance update.
     - Bank run stayers pot accumulation and ghost revocation yield acceleration.
   - **Tier 4 — Real-World End-to-End Scenarios**:
     - Complete visitor journey: Cover -> S1 Island -> S2 Flow -> S3 Charter Claim -> S4 License Buy -> S5 Policy Lever -> S6 Splitter -> S7 Bank Run (Stay) -> S8 Ghost Revocation -> S9 Ledger -> S10 Epilogue PNG receipt generation.
2. **Execute the E2E Test Suite**:
   - Run \`npx tsx scripts/test-e2e.ts\` (and \`npx tsx scripts/test-engine.ts\`).
   - Capture verification screenshots at 1440px desktop, 390px mobile, and reduced-motion viewports into \`screenshots/\`.
3. **Publish \`TEST_READY.md\`**:
   - Write \`/home/ubuntu/bank/TEST_READY.md\` documenting test runner invocation, coverage summary table (Tiers 1-4), and pass status.
4. **Deliverables**:
   - Write \`/home/ubuntu/bank/.agents/e2e_test_writer/test_report.md\`
   - Write \`/home/ubuntu/bank/.agents/e2e_test_writer/handoff.md\`
   - Send completion message to parent when done.
