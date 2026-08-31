# TASK7 — MOTION DEPTH AUDIT + DEBUG PASS (on the Cloudflare deployment)

**Context:** The user's feedback on the live site:
1. Scroll animations must be verified to actually work — each chapter must feel alive while scrolling (scrubbed, not just triggered).
2. The whole app needs debugging and review — is everything correct, do all sections and interactions work?
3. Everything must be tested MULTIPLE times with your browser, AND I (Hermes) also test independently — your pass is necessary but not sufficient.
4. Full rules: read `/home/ubuntu/living-bank-app/RULES.md` FIRST — deploy is Cloudflare-only (git push), NO local builds/servers on the VPS.

**Site to test against:** https://living-bank.pages.dev/ (production, auto-built from `main`)

---

## PART 1 — DEEP MOTION AUDIT (per chapter)

For EACH of the 11 chapters (S0Cover → S10Epilogue), in a real headless browser against the Cloudflare URL:

a) **Scroll-linked (scrubbed) behavior test:** scroll INTO the chapter slowly in small steps; capture 3 screenshots at 3 different progress points INSIDE the chapter (early/mid/late). The visual state must CHANGE between them (position, arc progress, dial angle, card stack position, opacity/blur of elements). If nothing visibly changes between early/mid/late, the chapter's scrub is dead — flag it.
b) **Triggered reveals:** elements should animate IN (rise+blur+opacity per current implementation) — check they end fully visible (no elements stuck at opacity 0 or half-clipped).
c) **Pinned sections:** while pinned, the inner stage must continuously transform (progress 0→1). Screenshot evidence.
d) **Text skew check:** fast-scroll through the whole page; no text may ever tilt (skewY/rotate on copy containers = bug).
e) Console errors per chapter: must be 0.

Produce a per-chapter table: chapter | scrub evidence (early/mid/late screenshots) | reveals OK | pinned transforms OK | issues found.

## PART 2 — FULL FUNCTIONAL DEBUG

All interactions, twice each (fresh reload between runs):
1. Cover: title + coin render, scroll cue.
2. S1 island: 3D renders, front faces user at entry, labels stamp in during orbit.
3. S2 gate: drag lever both directions → coin direction + counter + regime badge respond.
4. S3 charter: claim → ledger opens, HUD plaque appears, branch pip 1 fills.
5. S4 furnace: buy license (price shows, EMBER fires, pip fills, burned counter increments; 3/day limit enforced).
6. S5 dial: INFLOW 4× → ratchet steps; OUTFLOW → SLAM; needle matches readout value at all times (screenshot at several values).
7. S6 vaults: regime switch → routing changes (gold stack vs buyback puffs).
8. S7 run: trigger run → toll arc rises with crowd, mugs fill for stayers; both STAY and WITHDRAW paths give the correct receipt.
9. S8 ghost: report → bounty, seal shatter, streams speed up.
10. S9 ledger: odometers roll on entry; hard cap ticks down on burn events.
11. S10 epilogue: numbers count up; share card exports a real PNG with session values.

## PART 3 — FIX WHAT'S BROKEN

Everything found in Parts 1-2: fix in code (working dir `/home/ubuntu/living-bank-app`, branch `main`), then commit locally — do NOT push (I will push and Cloudflare will rebuild; then I re-verify). List every fix.

## GATES
- tsc 0 errors. NO local build/deploy (RULES.md).
- Full audit ran ≥2 times, all green, both runs.
- Report: per-chapter motion table (with screenshot paths), functional results ×2 runs, fixes list, and anything you could NOT fix.
