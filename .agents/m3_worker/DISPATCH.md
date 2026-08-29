## 2026-08-29T19:53:22Z

You are Worker 3 (Protocol Fidelity, Interactive Chapters & Share Card Implementer) for Milestone 3.
Working directory: /home/ubuntu/bank/.agents/m3_worker
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROJECT.md
4. /home/ubuntu/bank/.agents/survey_explorer_3/analysis.md
5. /home/ubuntu/bank/.agents/survey_explorer_3/handoff.md

Your mission:
Implement and polish Milestone 3: Protocol Fidelity, Interactive Chapters & Share Card PNG Generator:
1. **$STANDARD Protocol Fidelity & State Simulation**:
   - Verify `lib/sim/engine.ts`, `components/sim/SimProvider.tsx`, `components/chrome/BrassPlaque.tsx`, and all interactive chapter components:
     - Ticker is strictly `$STANDARD` across all UI displays, HUD metrics, receipts, odometers, and chapter texts.
     - 1B hard cap ceiling (`HARD CAP 1,000,000,000 → NEVER RISES`) dynamically decrements with every burn in `S9Ledger.tsx`.
     - Soulbound Charters with 1-10 branches and 3 licenses/day limit.
     - Trailing-two-epoch net ETH flow signal accurately driving regime switch (EXPANSION gold vault vs CONTRACTION buyback & burn).
     - Quadratic resolution fee with exact 50/50 split (half burned, half to stayers pot).
     - 30-day ghost revocation with 2% dormancy bounty, 70% forfeit, and yield dilution elimination.
     - Passive balance streaming accurately reflects formula: `branches * baseRate * m * dilutionFactor`.
2. **Interactive Scene & Share Card Polish**:
   - In `components/scenes/S10Epilogue.tsx`: Ensure the client-side 1080×1080 HTML5 canvas receipt card renders crisp typography (Fraunces & IBM Plex Mono), live session metrics, EXPERIENCED wax seal, and official standardreserve.xyz links with verbatim disclaimer `"A fan-made interactive explanation. Not affiliated. Nothing here is financial advice."`.
   - Ensure all 10 interactive chapters execute valid state transitions without NaN or undefined errors.
3. **Design System Tokens & Banned Hues Audit**:
   - Ensure zero matches for prohibited hues (blue, purple, teal) across all touched components.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification requirements:
- Run `npx tsx scripts/test-engine.ts` to verify 8/8 simulation tests pass.
- Run `npx tsc --noEmit` to verify 0 TypeScript errors.
- Run `npm run build` to verify production compilation.
- Ensure zero forbidden hues (#f4f1ea, #e9e4d8, #1a1a18, #b08d2e, #3d6b4f, #a33b2e only).
- Write `/home/ubuntu/bank/.agents/m3_worker/changes.md` and `/home/ubuntu/bank/.agents/m3_worker/handoff.md`.
- Send completion message to parent when done.
