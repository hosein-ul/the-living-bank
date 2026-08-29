## 2026-08-29T19:53:17Z

You are Worker 2 (Sensory Audio, Physics & Particle Kinetics Implementer) for Milestone 2.
Working directory: /home/ubuntu/bank/.agents/m2_worker
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/PROJECT.md
3. /home/ubuntu/bank/.agents/survey_explorer_2/analysis.md
4. /home/ubuntu/bank/.agents/survey_explorer_2/handoff.md

Your mission:
Implement the Sensory Audio, Physics & Particle Kinetics Polish per R1.4, R2, and Explorer 2's blueprints:
1. **Web Audio SFX Layer Optimization (`lib/sound.ts`)**:
   - Verify and optimize the procedural Web Audio synthesizer for all 6 vintage mechanical sound effects:
     - `stamp`: Heavy wax seal impact with low-end resonance (`playThud` / `playShatter`).
     - `slam`: Multiplier cut / emergency protocol impact with screen shake coupling.
     - `stream`: Passive balance streaming & coin chimes (`playCoinClink` / `playRustle`).
     - `ember crackle`: Atmospheric fireplace & license furnace burns (`playCrackle` / `playFurnaceRoar`).
     - `tick`: Epoch advance & ratchet wheel ticks (`playTick` / `playRatchet`).
     - `chime`: Branch acquisition & chapter completion chords (`playChime` / `playCelebration`).
   - Pre-allocate shared PCM noise buffers (pink/white/brownian) in `initCtx()` to eliminate GC stutter during rapid audio triggers.
   - Introduce a `MasterGainNode` with soft compression/limiting to prevent audio clipping during concurrent sound triggers.
   - Add a subtle, low-frequency atmospheric drone for the CONTRACTION regime.
2. **Canvas-2D Retina Scaling & Velocity-Coupled Particle Kinetics**:
   - In `components/scenes/S0Cover.tsx`: Add Retina DPR scaling (`canvas.width = rect.width * dpr`), couple upward currency dust particles with Lenis scroll velocity (`useLenisScroll`), and add `IntersectionObserver` to pause rAF loop when offscreen.
   - In `components/scenes/S2Gate.tsx`: Add Retina DPR scaling, couple coin kinetics with both lever flow signal and scroll velocity with inertia dampening, and pause rAF loop when offscreen.
   - In `components/atoms/Furnace.tsx`: Add Retina DPR scaling, ensure 28-particle bursts and atmospheric embers render razor-sharp, and pause rAF loop when offscreen.
3. **Accessibility & Reduced-Motion Enforcement**:
   - Ensure all canvas particle animations, Web Audio triggers, 3D Island tilts, and CSS keyframes immediately respect `prefers-reduced-motion: reduce`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification requirements:
- Run `npx tsc --noEmit` to verify 0 TypeScript errors.
- Run `npm run build` to verify production compilation.
- Ensure zero forbidden hues (#f4f1ea, #e9e4d8, #1a1a18, #b08d2e, #3d6b4f, #a33b2e only).
- Write `/home/ubuntu/bank/.agents/m2_worker/changes.md` and `/home/ubuntu/bank/.agents/m2_worker/handoff.md`.
- Send completion message to parent when done.
