# TASK3 — MOTION QUALITY PASS: from "implemented" to "delightful"

**Context:** TASK2 added real engines (GSAP, Three.js, canvas) but the user reviewed the live result and rejected it again:
> "texts go crooked while scrolling — and there is still no attractive scroll animation. It's boring."

Two root causes to fix, then a quality pass.

**Working dir:** `/home/ubuntu/living-bank-app`

---

## FIX 1 — TEXT SKEW (critical, user's #1 complaint)

`components/motion/VelocitySkew.tsx` skews **text containers** while scrolling — copy goes visibly crooked ("kaj"). Fix:
- **Text must NEVER skew.** Remove VelocitySkew from all text/copy columns entirely.
- If a skew effect is kept at all, apply it ONLY to images/graphics/canvas panels, capped at 0.4° max, and only above a velocity threshold.
- Delete the component from copy wrappers in every scene that uses it. Verify by scrolling fast: zero visible text tilt anywhere.

## FIX 2 — AMPLITUDE: the motion is too subtle to feel

Current scrubbed tweens are so gentle they read as "nothing happening". Raise the drama — this is an Apple-keynote-grade scrolltelling piece:
- Entry reveals: opacity 0→1 **plus** y: 60→0 **plus** blur 12→0, staggered, scrubbed over 60-80% of section entry (not a fast 300ms trigger).
- Chapter titles: per-character rise with rotationX 45°→0 and stagger, like editorial sites.
- Pinned scenes: the scroll through a 260vh pinned section must visibly transform the stage the WHOLE way (progress 0→1 mapped to something dramatic: camera angle, arc drawing, card stacking) — never a state that just sits there.
- Easing: use the luxury curves from `lib/easings.ts` everywhere, not default ease.

## READ THE SKILL — this time study the DEMOS, not just the docs

The scroll-animations skill has **working example HTML files** — open each in a headless browser, read its source, and steal the patterns:
- `~/.agents/skills/scroll-animations/examples/gsap-scrollytelling-showcase.html`
- `~/.agents/skills/scroll-animations/examples/lenis-gsap-velocity.html`
- `~/.agents/skills/scroll-animations/examples/css-scroll-driven.html`
- `~/.agents/skills/scroll-animations/examples/apple-canvas-scrubber.html`
And re-read `references/02-gsap-scrolltrigger-mastery.md` + `04-creative-layouts-cards.md` before touching code. If a pattern from these files is missing from the site, add it.

## PER-CHAPTER SIGNATURE (each must be VISIBLY different)

Verify each chapter's signature technique is actually dramatic, and strengthen where weak:

- **S0 Cover:** slow continuous coin Y-rotation (3D); title chars scrub-rise with blur; orbital rings parallax at 3 depths with pointer; grain stays.
- **S1 Island:** camera orbit mapped to full scroll range (0→~270°) — the island should visibly rotate as you scroll; 6 label pins stamp in/out at their orbit angles; fog + rim light shift with progress.
- **S2 Gate:** canvas coin queue with real motion (coins continuously walk; direction follows lever + scroll velocity); counter ticks; sky tint shifts with net flow.
- **S3 Charter:** pointer-tilt 3D deed (max 8°) with sheen sweep; clip-path curtain reveal scrubbed on entry; STAMP slam on claim.
- **S4 Furnace:** auction curve path-traces as you scrub the section (not pre-drawn); price marker slides along path; EMBER burst (7 particles) on buy; pips stamp fill.
- **S5 Dial:** needle ratchets 4 audible-feel steps on INFLOW vs 240ms SLAM + shake on OUTFLOW; strip chart bars grow staggered.
- **S6 Vaults:** coins continuously stream along the SVG conduits (not static); gold bars stack with stagger; POL lake level visibly rises; buyback puffs.
- **S7 Run:** banker cards STACK with scale-down + dim as you scroll (the layout transformation); toll arc redraws live; runners actually sprint to the door on RUN; mugs fill via streams.
- **S8 Ghost:** Z glyphs drift; on REPORT the wax seal shatters into flying shards + SLAM shake; remaining streams speed up.
- **S9 Ledger:** odometer digit-columns roll (translateY with stagger) as they enter; recap stills parallax at 3 speeds; hard-cap number ticks DOWN on burns.
- **S10 Epilogue:** all numbers count up (tabular); "EXPERIENCED" seal STAMPs; share card exports.

## GATES

1. `npx tsc --noEmit` → 0 errors.
2. `NODE_OPTIONS=--max-old-space-size=1024 npm run build` → success.
3. **Self-verify with real screenshots:** run the prod server on port 3124, headless-capture 6+ scroll positions, confirm: (a) zero text skew at fast scroll, (b) each chapter looks visually DIFFERENT from the previous, (c) pinned sections transform continuously while scrolling through them. Include the screenshots in your report.
4. Zero console errors.

Update PROGRESS.md with a TASK3 section. Report per chapter: what technique, what changed, and attach the verification screenshots.
