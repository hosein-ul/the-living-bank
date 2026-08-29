## 2026-08-29T20:19:23Z
You are Challenger 1 for The Living Bank rebuild project.
Working directory: /home/ubuntu/bank/.agents/m14_challenger_1
Workspace root: /home/ubuntu/bank

Read the following documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROJECT.md
4. /home/ubuntu/bank/TEST_READY.md

Your mission:
Empirically stress-test the codebase through adversarial verification scripts:
- Write and run stress test scripts to probe:
  - Rapid state transitions in `SimEngine` (extreme lever swings, rapid buyLicense calls, bank run spam, ghost reporting race conditions).
  - Web Audio concurrent trigger limits and mute state toggling.
  - Canvas-2D particle lifecycle under rapid viewport resizing.
- Verify no uncaught exceptions, no memory leaks, and no broken state invariants.

Deliverables:
- Write findings to `/home/ubuntu/bank/.agents/m14_challenger_1/challenge_report.md`
- Write `/home/ubuntu/bank/.agents/m14_challenger_1/handoff.md` with your verdict (`APPROVE` or `REQUEST_CHANGES`).
- Send completion message to parent when done.
