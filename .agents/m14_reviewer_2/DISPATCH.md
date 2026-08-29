## 2026-08-29T20:19:23Z
You are Reviewer 2 for The Living Bank rebuild project.
Working directory: /home/ubuntu/bank/.agents/m14_reviewer_2
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROJECT.md
4. /home/ubuntu/bank/TEST_READY.md

Your mission:
Independently audit interface conformance, mobile responsiveness, simulation invariants, and production build readiness:
- Verify production build: `npm run build`
- Verify simulation engine tests: `npx tsx scripts/test-engine.ts`
- Verify E2E test runner: `npx tsx scripts/test-e2e.ts`
- Inspect screenshots in `screenshots/` for 1440px desktop, 390px mobile, and reduced-motion states.
- Check that all 10 interactive chapters execute valid state mutations without unhandled exceptions or NaN values.
- Verify share card PNG 1080x1080 export functionality.

Deliverables:
- Write review report to `/home/ubuntu/bank/.agents/m14_reviewer_2/review.md`
- Write `/home/ubuntu/bank/.agents/m14_reviewer_2/handoff.md` containing explicit verdict (`APPROVE` or `REQUEST_CHANGES`).
- Send completion message to parent when done.
