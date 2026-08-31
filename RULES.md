# GLOBAL RULES — The Living Bank (read before every task)

## DEPLOY LAW (non-negotiable)
1. **NEVER build or deploy on the VPS.** No `npm run build`, no `next start`, no `wrangler deploy` from the VPS. The VPS has 2GB RAM and OOM-kills the gateway (this has happened repeatedly).
2. **Deployment = git push only.** All work happens in `/home/ubuntu/living-bank-app` on the working branch. When the task is done and gates pass, STOP and tell me to push (or push yourself only if explicitly instructed in the task).
3. **Cloudflare Pages builds automatically** from GitHub: project `living-bank` (account samroise22). Any push to `main` deploys to production (https://living-bank.pages.dev). Any push to other branches creates preview URLs. Wait ~2 min after push, then the site is updated — verify against `https://living-bank.pages.dev/` (or the preview URL I give you), NOT a local server.
4. **NEVER start local test servers on ports 312x** for verification. To verify the running site, use headless browser against the Cloudflare URL. If you need a local dev server for HMR during active coding, use `npm run dev -- -p 3000` ONLY while actively editing, and kill it when done. Never run two at once.
5. **Next config:** the site is client-side only; `output: "export"` is set in next.config.ts — do not remove it (Cloudflare Pages requires the static `out/` output).

## VERIFICATION LAW
6. **Verify like a human.** For every visual/behavior task: launch headless chromium (your browser tool or a Node/Python playwright script), open the Cloudflare URL, scroll through EVERY chapter in steps, screenshot at each chapter's midpoint, check console errors (must be 0), and interact with every control (claim, lever, license buy, inflow/outflow, regime switch, bank run, ghost report, export). Mobile pass at 390px width at minimum for cover + one mid chapter.
7. **Run the FULL audit at least twice** (fresh load each time) before reporting any task complete. If a check fails, fix and re-run the audit from scratch.
8. Report results as a table: section → status → screenshot path. Attach screenshots.

## ANIMATION LAW
9. **The scroll-animations skill is the authority**: `~/.agents/skills/scroll-animations/SKILL.md` + references + examples. Read the relevant reference before touching any scene. Use GSAP + ScrollTrigger for all scroll-linked motion (scrub: true). Never use simple CSS keyframes for scroll effects. Text must NEVER skew. Every chapter uses a different motion technique.
10. **prefers-reduced-motion**: every scene must degrade to a readable static state.

## STYLE LAW
11. Palette locked: paper `#f4f1ea`, ink, gold, semantic green/red. NO blue/purple/violet/teal. No widget boxes — full-bleed compositions. Copy in `content/chapters.ts` is VERBATIM — never rewrite a string.
12. `npx tsc --noEmit` must pass with 0 errors before reporting done. (Do NOT run `npm run build` on the VPS — Cloudflare builds.)

## SESSION LAW
13. Keep `PROGRESS.md` current after every task (per SUPERPROMPT §13). On resume: read PROGRESS.md, verify with files, continue from first unfinished item.
14. If stuck for more than ~15 minutes on one error, say so explicitly instead of looping.
