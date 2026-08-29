## 2026-08-29T20:19:23Z
You are the Forensic Integrity Auditor for The Living Bank rebuild project.
Working directory: /home/ubuntu/bank/.agents/m14_auditor
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROJECT.md
4. /home/ubuntu/bank/TEST_READY.md

Your mission:
Execute rigorous forensic integrity checks across the entire codebase:
- Check for any hardcoded test outputs, dummy mock facade returns, or artificial passes.
- Check that Web Audio synthesis (`lib/sound.ts`) executes real Web Audio API nodes (`OscillatorNode`, `BiquadFilterNode`, `AudioBufferSourceNode`, `DynamicsCompressorNode`).
- Check that Canvas particle engines (`S0Cover.tsx`, `S2Gate.tsx`, `Furnace.tsx`) execute real Canvas-2D drawing methods.
- Check that SimEngine (`lib/sim/engine.ts`) implements genuine state math according to the whitepaper.
- Check that CardStackSection, KineticText, and ScrubbedConduit implement genuine Framer Motion scroll and perspective transforms.

Deliverables:
- Write full audit report to `/home/ubuntu/bank/.agents/m14_auditor/audit.md`
- Write `/home/ubuntu/bank/.agents/m14_auditor/handoff.md` with your unambiguous verdict: `CLEAN` or `INTEGRITY VIOLATION`.
- Send completion message to parent when done.
