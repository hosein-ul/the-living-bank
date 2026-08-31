# TASK-BANK — Upgrade Chapter I (island) to a professional Neoclassical Federal Reserve

Target scene: components/scenes/ThreeIsland.tsx (the Three.js scene) + components/scenes/S1Island.tsx (the surrounding wrapper)

Goal: Rebuild the building as a monumental neoclassical Federal Reserve — like the Federal Reserve Bank of New York facade, 1890 limestone. The current "low-poly beige box with a dome" reads as a mosque/temple, not a bank. Replace it with detail.

---

## Geometry specification (real, not placeholders):

1. **Plinth + grand stairs (5 wide, 4 deep steps)** — total footprint 12m × 8m. Steps 0.35m rise × 0.4m tread, sharp edges, no rounded nosing. Material: warm travertine limestone (#d8cdb4, roughness 0.7, slight bump map for grain).

2. **8 Ionic columns (not square pilasters)** — fluted (20 flutes per column, depth 0.005m), column height 7m, base diameter 0.6m, shaft tapers from 0.6m to 0.5m, capital with full volutes (the spiral scrolls on either side) + echinus + abacus. Material: same limestone but slightly brighter (#e2d8c0).

3. **Entablature (horizontal beam above columns)** — 3 parts: architrave (0.6m tall, smooth), frieze (0.5m tall, plain — no triglyphs, keep clean), cornice (0.7m tall, projecting 0.3m). Material: limestone.

4. **Pediment (triangular gable above entablature)** — 10m wide × 3m tall, slope 30°, recessed interior (#b8a98a, slightly darker), with a circular relief medallion at center (1.2m diameter, raised 0.05m) inscribed: "STANDARD" in serif capital letters. Material: limestone.

5. **Sundial above pediment** — thin gold rod (0.3m, #b08d2e, metalness 0.85) casting a shadow on a half-disc dial. No modern numerals — just hour-line grooves.

6. **Banking hall behind the colonnade** — a simple 5m-deep, 3m-tall rectangular block, set back 0.3m from the colonnade, slightly darker limestone (#cdc1a8). Three narrow windows (1m × 0.4m) at gold-anodized frames (#b08d2e).

7. **THE DOOR (this is the hero element — make it the visual focal point)**:
   - Position: dead center behind the colonnade, 3m tall × 2m wide
   - 2 large bronze leaves (color #3a2a1a, metalness 0.7, roughness 0.4) with a 1cm bronze frame
   - 20 round copper studs (5cm diameter) per leaf, arranged in a 4×5 grid
   - Bronze lion-head door knocker on the right leaf (only — leave the left plain)
   - Above the door: an arched bronze relief plaque inscribed: "4,000 LINES OF IMMUTABLE CODE" in small serif capitals
   - The door must be darker than everything else in the scene — the eye goes straight to it
   - When the visitor approaches, the door is 1cm ajar (offset slightly inward) revealing a thin line of warm golden light spilling out

8. **Two stone guardian lions flanking the lowest step**, 0.8m tall, simple silhouette (not detailed sculpture) — just two forward-facing lions in a guardian pose

9. **Two flagpoles flanking the colonnade** (between the lions and the first column on each side), 6m tall, with one small flag each: a muted gold flag (1m × 0.6m) on the left reading "STANDARD" in dark serif, a slate-gray flag on the right reading "RESERVE" — both barely moving in a gentle wave (very subtle, < 0.5° amplitude per second)

10. **No dome.** Remove the existing dome entirely. Do not replace it with anything. The pediment is the only top element (plus the sundial). The Federal Reserve does not have a dome.

11. **Plaza floor** — keep the existing round marble disc but make it 1.5m larger radius and slightly raised at center (subtle convexity, 2cm rise over 1m), suggesting a slightly domed public square

---

## Lighting (critical — must look cinematic, not flat):

- **Key light**: directional, position (8, 12, 6), intensity 1.8, warm color #fff2d6 (suggesting late-morning Mediterranean sun)
- **Fill light**: hemisphere, sky color #e8e0d0, ground color #3a3528, intensity 0.5
- **Rim light**: directional, position (-6, 4, -8), intensity 0.6, cool color #c8d4e0 (to define silhouettes against background)
- **Practical spot on door**: spotLight, position (0, 5, 8), target the door, intensity 1.5, angle 0.4, penumbra 0.5, warm color #ffb868, distance 15m, decay 1.5 — this is what makes the door "pop"
- **Shadows**: PCFSoftShadowMap, mapSize 2048, bias -0.0003
- **Tone mapping**: ACESFilmicToneMapping, exposure 1.05

---

## Background:

- Replace the current solid-paper background with a soft radial gradient: #f4f1ea center → #e8e0d0 edges, with a 1.5% noise overlay applied as a fullscreen quad behind the scene (DOM <div> with mix-blend-mode: multiply and opacity: 0.06)
- No ground plane beyond the plaza — let the marble disc float with the radial gradient

---

## Camera path (this is critical — current orbit is too timid):

- `startTheta = π/2` (front-facing the door straight on)
- `startPhi = π/2 - 0.25` (slight tilt down, looking slightly up at the columns — gives the building MONUMENTAL feel)
- `startRadius = 16` (zoomed out enough to see whole facade + a bit of foreground)
- `Scroll`: theta = startTheta + progress × π × 0.55 (sweeps only 99° total — ends slightly off-axis to the right, NOT a full orbit — keeps the door as the focal point)
- `phi` = startPhi + sin(progress × π) × 0.06 (gentle dip-and-rise, max 3.4°)
- `radius` = 16 - progress × 1.5 (slow push in, ends at 14.5)
- `Look-at`: hard-locked to (0, 1.8, 0) for the entire scroll (do NOT move the look-at target — the building stays centered)
- `Damp`: scroll-driven changes must use damp3 = (current, target, lambda=8, dt) for buttery motion, not lerp.

---

## Hover/parallax (small touch):

- `Pointer move`: bankGroup.rotation.y += pointerX × 0.04 (max ±2.3°), camera.phi += pointerY × 0.02 (max ±1.1°), damped (lambda=6)
- `Reduced-motion`: disable orbit AND parallax entirely, freeze at start view

---

## Asset rules:

- All geometry procedurally generated with Three.js primitives + small instanced meshes (e.g. the 160 column flutes from CylinderGeometry with radialSegments=20 and a slight Y displacement per flute vertex; the 40 door studs from InstancedMesh of a SphereGeometry placed in a 4×5 grid; the 200 limestone "grain" from a normal map procedurally drawn on a <canvas> once at init, fed as normalMap to all limestone meshes)
- No external GLTF/FBX/PNG assets
- Total triangle count target: ≤ 60,000 (current 8,800 — go up for detail but cap)
- Total draw calls: ≤ 25 (use instancing for repeated elements)

---

## Verification (REQUIRED before reporting done):

1. Take a Playwright screenshot of http://localhost:3000 (or your dev server) at scroll=0, then at scroll=50%, then at scroll=100%
2. The door MUST be dead-center in all three screenshots, brightly lit, the darkest element
3. The dome must be ABSENT in all three
4. Lion silhouettes must be visible at the base of the steps
5. Read-back the final scene stats and confirm geometry_count: 8-12 unique meshes, instances: <300, triangles: <60000, draw_calls: <25
6. tsc 0 errors. Do not run npm run build (RULES.md) — I will deploy.
7. Report before/after as a table: triangles before/after, draw calls before/after, dome removed Y/N, door front-facing Y/N, lions present Y/N, etc.
