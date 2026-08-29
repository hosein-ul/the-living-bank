# Changes Summary: Milestone 2 (Sensory Audio, Physics & Particle Kinetics Polish)

## 1. Web Audio Procedural Synthesizer Layer (`lib/sound.ts`)
- **Shared Pre-allocated PCM Noise Buffers**:
  - Implemented `initNoiseBuffers()` in `SoundManager.initCtx()` pre-allocating 2-second mono PCM buffers for:
    1. **White Noise**: uniform pseudo-random signal across `[-1, 1]`.
    2. **Pink Noise**: 1/f noise generated using Paul Kellet's multi-pole filtering algorithm normalized to `[-1, 1]`.
    3. **Brownian Noise**: 1/f^2 integrated random walk with leaky integrator normalized to `[-1, 1]`.
  - Replaced per-trigger allocations (`createBuffer`) in `playCrackle()`, `playFurnaceRoar()`, `playRustle()`, and `playShatter()` with lightweight `AudioBufferSourceNode` instances referencing the pre-allocated buffers. This eliminates garbage collection stutter during rapid interaction bursts.
- **Master Dynamics Limiter & Gain Node**:
  - Integrated `DynamicsCompressorNode` (`threshold: -6dB`, `knee: 6dB`, `ratio: 12`, `attack: 0.003s`, `release: 0.15s`) between `MasterGainNode` and `AudioContext.destination`.
  - Guarantees soft limiting and prevents digital clipping distortion when multiple sound effects trigger concurrently.
  - `MasterGainNode` smoothly handles global unmuting (`gain = 1.0`) and muting (`gain = 0.0`).
- **All 6 Vintage Mechanical Sound Effects Verified & Polished**:
  - `stamp`: Heavy wax seal impact (`playStamp()` / `playThud()` / `playShatter()`) combining low-end resonant pitch drops (140Hz -> 30Hz) with sub-bass punch and tactile pink noise mechanical snaps.
  - `slam`: Multiplier cut / emergency protocol impact (`playSlam()`) with aggressive downward sawtooth ramp (180Hz -> 24Hz in 220ms) and low brownian impact rumble.
  - `stream`: Balance streaming chimes (`playStream()` / `playCoinClink()` / `playRustle()`) with high-frequency harmonic sine chimes (2400-3000Hz) and filtered pink noise sweeps.
  - `ember crackle`: Crucible & furnace combustion (`playCrackle()` / `playFurnaceRoar()`) using bandpass/lowpass filtered noise buffers.
  - `tick`: Epoch advance & ratchet ticks (`playTick()` / `playRatchet()`) with rapid sine and square wave transients.
  - `chime`: Branch acquisition & chapter completion chords (`playChime()` / `playCelebration()`) arpeggiating harmonic intervals with exponential decay tails.
- **Contraction Regime Atmospheric Drone**:
  - Implemented `startContractionDrone()`, `stopContractionDrone()`, and `setRegimeDrone(regime)` featuring dual detuned sub-bass oscillators (55Hz / 54.2Hz, 0.8Hz organic beat frequency) routed through a resonant lowpass filter (110Hz) modulated by a slow 0.15Hz LFO, smoothly crossfading when the bank switches regimes.
- **Simulation Store Synchronization (`components/sim/SimProvider.tsx`)**:
  - Connected `sound.setRegimeDrone(newState.regime)` inside the engine subscription to ensure seamless audio state coupling.

## 2. Canvas-2D Retina Scaling & Velocity-Coupled Kinetics
- **Cover Golden Dust Particles (`components/scenes/S0Cover.tsx`)**:
  - Added Retina DPR scaling (`canvas.width = Math.round(width * dpr)`, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`).
  - Coupled vertical particle drift velocity with Lenis scroll velocity (`useLenisScroll`), adding upward inertia impulses with spring-like dampening (`v_y += (v_target - v_y) * 0.06`).
  - Added velocity-reactive particle elongation (`ctx.ellipse`) during fast scroll transitions.
  - Integrated `IntersectionObserver` to pause the `requestAnimationFrame` loop when offscreen.
  - Full support for `prefers-reduced-motion: reduce`: renders a static gold constellation and shuts down the rAF loop.
- **Bank Gate Coin Flow System (`components/scenes/S2Gate.tsx`)**:
  - Added Retina DPR scaling for sharp rendering of coin faces, metallic rims, and inner stamps on high-density displays.
  - Coupled coin kinetics with both the policy lever value ($v_x = v_{\text{base}} \times (1 + 0.5 |f|)$) and Lenis scroll velocity with inertia dampening.
  - Pauses rAF execution when out of viewport via `IntersectionObserver`.
  - Under `prefers-reduced-motion: reduce`, displays clean stationary arch and static sample coins with 0 animation loop overhead.
- **Supply Furnace Combustion Crucible (`components/atoms/Furnace.tsx`)**:
  - Added Retina DPR scaling ensuring sharp ember rendering and smooth cubic/quadratic bezier flame tongues.
  - Maintained crisp 28-particle bursts (4 bursts of 7 particles) on license purchase events with parabolic trajectories and horizontal wobble.
  - Integrated `IntersectionObserver` to halt rAF loop when offscreen.
  - Reduced-motion mode renders a calm, static radial glow without particle explosions.

## 3. Accessibility & Motion Reduction Polish
- **3D Island Scene (`components/scenes/ThreeIsland.tsx`)**:
  - Dynamically detects and listens to `(prefers-reduced-motion: reduce)` changes.
  - Disables pointer parallax rotation ($X, Y$) and camera bobbing; suppresses particle field movement under reduced motion.
- **Charter Deed 3D Card Tilt (`components/scenes/S3Charter.tsx`)**:
  - Added media query listener for reduced motion to disable 3D mouse parallax tilt (`rotateX = 0`, `rotateY = 0`) and snap scale to 1.
- **Color Palette Fidelity**:
  - Strictly verified zero forbidden hues across all canvas, styles, and component files. Only Paper `#f4f1ea`, Paper-deep `#e9e4d8`, Ink `#1a1a18`, Gold `#b08d2e` / `#c9a961`, Green `#3d6b4f`, Red `#a33b2e`.

## 4. Verification
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: Production build succeeded in 3.3min.
- `npx tsx scripts/test-engine.ts`: All SimEngine tests passed.
- `npx tsx scripts/test-audio-physics.ts`: All audio synthesis and state tests passed.
