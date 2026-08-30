# TASK5 — SCROLL FIX + CHARTER REDESIGN

**Context:** User reviewed the live site and reported: (1) "scroll has a problem" — scrolling feels broken/stuck on real devices, (2) the Charter chapter design must be **completely rebuilt** — a new, different design, not another certificate card.

**Working dir:** `/home/ubuntu/living-bank-app`

---

## PART 1 — SCROLL BUG (critical)

Diagnosis already done. On the running build:
- `document.body` has computed `overflow: hidden auto` — **body overflow-y is HIDDEN**
- Lenis is active (`window.lenis` exists), html/body have NO transform wrapper
- Page height 22528px, 11 sections with heights 900–2520px, 9 sticky/pinned elements

When `body { overflow: hidden }` (or overflow-y hidden) fights Lenis, real-device scrolling becomes unreliable (stuck, rubber-band, or sections trap).

**Fix:**
1. Grep ALL source for anything setting `overflow: hidden` on `body`, `html`, or the root scroll container (`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, SmoothScroll.tsx). Find the culprit(s).
2. The scroll container must be the natural document flow: `html/body { overflow: visible }` with Lenis managing smoothing ONLY (Lenis 1.1.x default behavior — no scrollerProxy, no wrapper). If some section needs clipping, clip THAT section (`overflow: clip` on the section, never on body).
3. Verify pinned sections still pin correctly after the change (GSAP ScrollTrigger pinning + Lenis: ensure `ScrollTrigger.refresh()` runs after Lenis init and on `lenis.on('scroll', ScrollTrigger.update)` — follow the official Lenis+GSAP recipe from the skill reference 06).
4. **Mobile check:** ensure Lenis `syncTouch` is NOT fighting native touch — use default touch behavior (don't hijack touch scroll).
5. Self-verify with a real headless scroll-through: programmatically wheel-scroll from 0 to bottom in steps, assert scrollY advances monotonically to ~22528, no stuck state, no console errors.

## PART 2 — CHARTER COMPLETE REDESIGN (S3Charter.tsx — new concept)

**Kill the old design entirely** (certificate card on paper). The new concept:

### "THE VAULT HANDOVER" — a monumental bank entrance scene

The moment of becoming a banker, told as **walking up to the counter of a grand bank and receiving your ledger book**:

**Layout (full-bleed, no card):**
- Center stage: a **monumental brass bank counter** viewed slightly from above-front — a long horizontal counter slab (drawn as layered SVG/DOM: dark walnut base + brass top edge + subtle wood grain via SVG turbulence), spanning ~85% viewport width, sitting in the lower third of the scene.
- ON the counter: a **closed leather-bound ledger book** (drawn SVG: dark leather cover with gold-ruled spine, a small embossed seal). It is THE hero object, lit by a warm pool of light from an unseen desk lamp above.
- Behind/above the counter: engraved wall panelling (tall thin vertical wood panels in ink-wash style, very subtle) and one hairline gold rule running the full width at counter height.
- Copy column sits left, ON the paper, unboxed — same as other chapters.

**Motion (scroll-scrubbed, dramatic):**
- On entry (scrub 0→40%): the counter slides up from below viewport with a heavy eased rise; the ledger fades up + settles with a soft drop shadow bloom.
- **CLAIM interaction** (button = brass plaque on the counter "TAKE YOUR CHARTER — FREE"): the ledger **opens** — cover rotates open in 3D (rotateY on the cover element, perspective on parent, gold ribbon bookmark unfurls out), first page reveals: "CHARTER №0042" engraved with a **hand-drawn-style signature line being written by an animated pen stroke** (SVG stroke-dashoffset writes the account number like a fountain pen, 800ms).
- Then the HUD plaque slides in (existing), branch pip 1 fills, STREAM accrual starts.
- Ambient: gold dust particles drifting in the lamp light cone (canvas or DOM particles, subtle, < 20 particles).

**Details:**
- The ledger must look premium: leather texture via CSS (repeating radial noise + inset shadows), gold spine rules, page edge lines.
- No widget boxes anywhere. Copy verbatim from chapters.ts (position freely).
- prefers-reduced-motion: static open ledger state.

## GATES

1. `npx tsc --noEmit` → 0 errors
2. `NODE_OPTIONS=--max-old-space-size=1024 npm run build` → success
3. Scroll-through test passes (monotonic scrollY to bottom, no errors)
4. Screenshots: charter scene before + after claim interaction, and one full scroll-through sanity shot at 3 positions
5. Zero console errors

Update PROGRESS.md with TASK5 section. Report: what the overflow culprit was, the scroll fix, and the new charter design description + screenshots.
