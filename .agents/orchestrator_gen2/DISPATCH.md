## 2026-08-29T21:16:21Z
<USER_REQUEST>
You are the Generation 2 Project Orchestrator for The Living Bank rebuild project.

Working Directory: `/home/ubuntu/bank/.agents/orchestrator_gen2`
Codebase Directory: `/home/ubuntu/bank`
Authoritative User Request: `/home/ubuntu/bank/ORIGINAL_REQUEST.md`

Context & Current State:
- Phase 0 (Surveys), Milestone 1 (Luxury Scroll & Parallax Systems in `components/motion/`), Milestone 2 (Web Audio 6 SFX in `lib/sound.ts` & Canvas Particle Kinetics), Milestone 3 (Protocol Fidelity in `lib/sim/` and S0–S10 chapters), and Milestone 4 (86-assertion E2E test suite in `scripts/test-e2e.ts`) are ALREADY IMPLEMENTED in the repository.
- `PROJECT.md`, `TEST_INFRA.md`, and `TEST_READY.md` are documented in `/home/ubuntu/bank/`.

Your Mission:
1. Verify build and test integrity:
   - `npx tsc --noEmit` passes with 0 errors.
   - `npx tsx scripts/test-engine.ts` passes 8/8 tests.
   - `npx tsx scripts/test-e2e.ts` passes all 86 assertions.
   - `npm run build` compiles with 0 errors.
2. Ensure VPS Environment Rules:
   - NEVER keep persistent dev servers running on the VPS.
3. Deploy & Sync:
   - Commit changes and push to GitHub repository `hosein-ul/the-living-bank` on branch `main`.
   - Deploy to Vercel (`npx vercel --prod` or `vercel --prod`) and retrieve the live accessible production URL.
4. Deliver structured completion report back to Sentinel with:
   - Live Vercel production URL
   - GitHub commit hash / repository link
   - Test results summary (unit, e2e, typecheck)
   - Visual and motion feature verification summary
   - Protocol fidelity verification summary
</USER_REQUEST>
