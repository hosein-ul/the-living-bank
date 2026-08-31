# TASK-MUSE — Motion polish & mobile pass (grok-work branch)

Site: The Living Bank (Next.js + GSAP + Three.js scrollytelling). This branch (`grok-work`) deploys to https://living-bank-grok.pages.dev.

Read RULES.md first: no builds on the VPS, git-push-only deploy, Cloudflare builds.

## Fix these specific user complaints:
1. **Scroll smoothness** — while the page scrolls, the pinned chapters must transform CONTINUOUSLY (scrubbed GSAP timelines, scrub: true). Check every scene in components/scenes/S*.tsx: any timeline missing scrub feels dead — fix to scrubbed.
2. **Mobile (390px)** — audit all 11 chapters at 390px width: text readable, no clipped elements, touch scroll works natively (no JS hijack), pinned sections don't trap. Fix what's broken.
3. **Island (S1)** — the neoclassical bank must face the user at entry (bronze door + stairs visible), orbit responsive to scroll.

## Rules
- Text NEVER skews (currently fixed — keep it that way).
- GSAP/ScrollTrigger for all scroll motion (skill: ~/.agents/skills/scroll-animations/).
- Copy in content/chapters.ts is verbatim.
- tsc --noEmit zero errors. Commit locally, do NOT push, do NOT build.

Report: per-chapter what you fixed, tsc result, commit hash.
