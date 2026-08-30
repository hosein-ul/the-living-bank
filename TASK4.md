# TASK4 — ART DIRECTION PASS: from "educational widget" to "monumental bank"

**Context:** The user rejected the current visuals: the 3D island "looks like a mosque, not a bank", every chapter is a grey-bordered widget card — a textbook, not a cinematic experience. This task is a **visual redesign**: same copy, same chapters, same sim engine — completely different art direction.

**Working dir:** `/home/ubuntu/living-bank-app`

---

## THE ART DIRECTION (the one idea)

**"A Swiss private bank, 1890, rendered in warm light."** Monumental, monochrome-warm, luxurious. Think Bank of England facade × Apple keynote × an old bond certificate. NOT: widget cards, not diagrams-in-boxes, not a mosque.

Three pillars:

### 1. KILL THE FRAMES
There must be **zero grey-bordered widget cards** anywhere. Every chapter becomes a **full-bleed cinematic composition** — content sits directly on the paper, elements overlap, nothing is boxed. Cards are replaced by:
- engraved rules (hairlines) instead of borders
- layered depth (soft shadows only on the primary object of the scene)
- generous negative space — the paper IS the surface

### 2. THE ISLAND = NEOCLASSICAL BANK, not a mosque
Rebuild `ThreeIsland.tsx` geometry as a **monumental neoclassical bank building**:
- Wide stone plinth + grand front stairs (5-6 shallow steps, full width)
- **Colonnade of 8 columns** (cylinders with capital + base blocks) supporting a wide entablature + low-poly pediment (triangle)
- Low rectangular banking hall behind the colonnade, with a small dome drum at the rear (dome small and set BACK so it never reads as a mosque — square drum, not a cylindrical minaret body)
- **THE ONE DOOR**: a single tall dark bronze double-door centered in the colonnade — the only dark element; the eye goes straight to it
- Materials: warm limestone (flat warm gray-gold `#d8cdb4` range), gold accents on door frame + pediment, deep warm shadows
- Ground: a low marble plaza disc, NOT a floating island disc
- Lighting: warm key light from upper-left, soft ambient, subtle fog for depth
- 6 gold label pins orbit with the camera as before, but now stamp in with tiny leader lines pointing at building parts (door, colonnade, dome, vault stairs, gates, fountain)
- Camera: the scroll orbit sweeps around and **slightly over** the building (max pitch ~25°), ending on a hero view of the door

### 3. LUXURY DETAIL LAYER (every chapter)
- **Gold engravings**: thin gold rules, corner ornaments (simple SVG flourishes — 2-3 curls max, no clipart), serif numerals
- **Deep soft shadows** under primary objects only
- **Warm light**: a very subtle warm radial glow from top of each scene (like late afternoon sun through tall windows) — barely visible, never a gradient blob
- **Vignettes**: subtle ink vignette at scene edges (multiply, 6-8% max)
- HUD (plaque/rail/epoch) gets the same treatment: brass engraving style, no grey boxes — thin gold rules and tabular numerals directly on paper

---

## PER-CHAPTER COMPOSITIONS (each one a different cinematic layout — variety!)

**S0 Cover:** centered monumental composition. Huge serif title over the slowly-rotating gold coin (coin is large, half off-canvas bottom, catching light — like a seal on a document). Orbital rings engraved into the paper. Wax seal bottom-right stamps on load.

**S1 Island:** full-bleed Three.js scene fills 100vw×100vh pinned; copy column sits on the left ON the scene (text has paper-colored soft backdrop blur panel ONLY behind text lines, not a box — or better: text on a solid paper band that fades). Building reveals through fog as you enter.

**S2 Gate:** the gate arch spans nearly full viewport height — coins pour through it. The counter is a huge engraved numeral directly above the arch (no box). Lever sits at bottom like a monumental brass control. Sky tint = full-scene background wash (not a boxed widget).

**S3 Charter:** the deed fills center stage at a slight 3D tilt, overlapping the copy column (which sits behind it, dimmed). Paper deed texture, guilloche border pattern (SVG, thin gold), wax seal. Claim = STAMP.

**S4 Furnace:** auction curve drawn as a huge engraved chart across the full width (no frame — axes are hairline gold rules ON the paper). Furnace is a large dark bronze art-deco grate at right, coins fall in from above full-height. Buy button is a brass plaque, not a web button.

**S5 Dial:** the dial is THE scene — huge, centered, taking 70% of viewport width, dark charcoal face with gold ticks (currently it's small in a card). Copy overlaps bottom-left. Regime color washes the vignette, not a badge.

**S6 Vaults:** three vault doors (round steel-and-brass doors in walls) across the full width; coins stream along engraved floor conduits between them. Team/POL are small brass floor-grates, not boxes. Splitter is a central carved junction in the "floor".

**S7 Run:** the lobby IS the full viewport — dark, dramatic. 12 banker silhouettes as tall thin figures at marble desks. Run = camera-shake + figures sprint as simple animated silhouettes toward the huge bright door at right. Toll arc drawn across the whole top like a guillotine. Card-stacking stays for the ledger list.

**S8 Ghost:** same lobby, dimmer. One desk lamp pool of light on the sleeper. Poster engraved on the wall. Seal shatter on report.

**S9 Ledger:** two GIANT odometers (hero scale, like station departure boards) floating on paper; recap stills as scattered polaroid-style cards at angles. Hard-cap line as one hairline across the full width.

**S10 Epilogue:** receipt composition centered like a framed certificate; all links as engraved footer. Share card export.

**Chapter rail** becomes a thin gold engraved scale on the right edge (like a ruler), not a pill.

---

## EXECUTION RULES

- Copy strings stay verbatim (`content/chapters.ts`) — reposition only.
- Palette unchanged: paper/ink/gold + semantic green/red. NO blue/purple/violet/teal, no neon, no gradient text.
- All TASK3 motion must survive: scrubbed reveals, no text skew, per-char titles, continuous pinned transformations.
- Perf budget: island ≤60k tris, dpr ≤1.5, offscreen rAF pause, reduced-motion static fallbacks.
- Icon set: draw simple line-engraving SVGs (column, door, coin, seal) — no emoji, no web icons.

## GATES

1. `npx tsc --noEmit` → 0 errors
2. `NODE_OPTIONS=--max-old-space-size=1024 npm run build` → success
3. Self-verify: prod server on :3124, screenshots of ALL 11 scenes at 2 scroll positions each; confirm: zero grey widget boxes remain, island reads as a neoclassical bank with door focus, every chapter composition is visually distinct. Attach screenshots to the report.
4. Zero console errors

Update PROGRESS.md with a TASK4 section. Report: per chapter — new composition in one line + screenshot.
