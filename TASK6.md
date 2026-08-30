# TASK6 — CRITICAL SCROLL REPAIR + FULL BROWSER AUDIT

**Context:** The user's real-browser test (your deploy at :3123) shows the site is BROKEN:
1. Cover renders empty/blank
2. The page suddenly JUMPS down instead of scrolling
3. The 3D bank shows its BACK to the user

My headless diagnosis of the current build:
- `#smooth-wrapper` exists (position:fixed, h:900, overflow:hidden) but **`smooth-content` receives NO transform and `window.scrollY` stays 0 after 10 real wheel events** — **ScrollSmoother is NOT actually running.** The wheel events are swallowed by the fixed wrapper (content can never scroll because the whole page is inside a fixed-position box with no active smoother).
- So the migration from Lenis to ScrollSmoother was left half-done and the site cannot scroll at all with a wheel; only a native jump-hack makes it move.
- The island camera starts showing the building's rear.

**Working dir:** `/home/ubuntu/living-bank-app`

---

## PART 1 — REPAIR THE SCROLLER (critical, do this first)

1. Open `components/chrome/SmoothScroll.tsx` and the app layout. The GSAP ScrollSmoother must be created the OFFICIAL way:
   - DOM structure: `<div id="smooth-wrapper"><div id="smooth-content">{children}</div></div>`
   - `ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.2, effects: true, normalizeScroll: true })`
   - The wrapper MUST be `position: fixed` full-viewport; the content gets transformed by the smoother — that's what makes wheel scrolling work. **Verify the smoother instance is actually created** (log `smoother` after create; if ScrollSmoother plugin is missing from `lib/gsap.ts` register list, that's the bug — register it).
   - **Check `lib/gsap.ts`: ScrollSmoother MUST be imported and registered (`gsap.registerPlugin(ScrollSmoother)`).** The free npm `gsap` package does NOT include ScrollSmoother (it was a Club plugin; it became free in gsap 3.13+). Check the installed gsap version — if ScrollSmoother is not importable, upgrade gsap to latest, or fall back to a **manual smooth-scroll implementation**: keep native scrolling (body overflow visible, no fixed wrapper) and drive effects purely with ScrollTrigger scrub — a site with correct native scrolling beats a broken smoother. Pick whichever path actually works and prove it with the test below.
2. After the fix, run this exact headless test in your verification script: fire 10 real wheel events; assert `window.scrollY` (or the smoother's progress) advances monotonically from 0 to a large value, and `smooth-content` transform changes. Attach output.

## PART 2 — ISLAND CAMERA ORIENTATION

The camera starts facing the building's BACK. Fix `ThreeIsland.tsx`:
- The building's front (the colonnade with the bronze door, the grand stairs) must face the camera at scroll progress 0.
- Compute the camera start angle from the building's front direction, or simply rotate the building group so its front is at the camera's initial position. The FIRST thing the user must see is the bronze door and stairs.
- Verify with a screenshot of the section at progress 0: the door and stairs face the viewer.

## PART 3 — FULL BROWSER AUDIT (use your own browser tool / headless chromium)

Do a complete pass over the deployed app (run prod on :3127):
1. Load the page fresh: cover must show title, coin, seal within 3s; no blank viewport.
2. Scroll through ALL 11 sections with real wheel steps (your scroll test), capturing a screenshot at each section's midpoint. Assert: content actually moves every step; no section renders blank; pinned sections hold while their inner content transforms.
3. Interactions: claim charter (ledger opens), drag lever, buy license (EMBER fires), push inflow / pull outflow (dial ratchet/slam), regime switch (vault routing), bank run (toll arc rises), report ghost (seal shatters), export share card.
4. Console: zero errors/warnings (GPU-driver info lines are acceptable).
5. Mobile viewport pass (390px): layout readable, touch scroll works (native), nothing clipped.

## GATES

1. `npx tsc --noEmit` → 0 errors
2. build → success
3. Wheel-scroll test passes (monotonic, non-zero)
4. Audit checklist all green + per-section screenshots attached to the report
5. Zero console errors

Update PROGRESS.md with TASK6. Report: root cause of the dead smoother, what you changed, island fix proof, and the full audit table (section → status → screenshot).
