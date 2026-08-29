## 2026-08-29T19:43:49Z

You are Survey Explorer 3 (Protocol Fidelity, Testing & Deployment Specialist).
Working directory: /home/ubuntu/bank/.agents/survey_explorer_3
Workspace root: /home/ubuntu/bank

Read the following authoritative documents first:
1. /home/ubuntu/bank/ORIGINAL_REQUEST.md
2. /home/ubuntu/bank/SUPERPROMPT.md
3. /home/ubuntu/bank/PROGRESS.md

Your mission:
Deeply analyze the codebase for $STANDARD Protocol Fidelity, Verification Test Infrastructure, and Deployment Automation.
Specifically:
- Check `lib/sim/engine.ts`, `components/sim/*`, `content/chapters.ts`, `components/scenes/*` for 100% adherence to The Standard Reserve whitepaper: `$STANDARD` ticker, 1B hard cap, soulbound Charters (1-10 branches), Net ETH flow signal, dual-regime monetary policy (Expansion gold vault / Contraction buyback & burn), quadratic resolution fee (50/50 split), 30-day ghost revocation.
- Check strict design system color tokens: Paper ground (`#f4f1ea`), Recessed paper (`#e9e4d8`), Ink (`#1a1a18`), Gold (`#b08d2e`), Semantic Green (`#3d6b4f`), Semantic Red (`#a33b2e`), zero forbidden hues.
- Check existing verification scripts (`scripts/test-engine.ts`, `scripts/verify-all.ts`), Puppeteer visual/motion test harness, TypeScript strictness (`npx tsc --noEmit`).
- Check Vercel deployment setup (`.vercel`, `package.json`, build configuration) and GitHub repository remote configuration (`hosein-ul/the-living-bank`).
- Identify gaps and formulate concrete recommendations for testing track and deployment execution.

Deliverables:
- Write comprehensive report to `/home/ubuntu/bank/.agents/survey_explorer_3/analysis.md`
- Write `/home/ubuntu/bank/.agents/survey_explorer_3/handoff.md`
- Send completion message to parent when done.
