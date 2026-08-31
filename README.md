# The Living Bank

**An interactive scrollytelling explanation of [The Standard Reserve](https://www.standardreserve.xyz) — the sovereign onchain central bank.**

You are the market. Your scroll is the money. In ~3 minutes you run the bank's economy through all ten chapters of its design — and understand every rule it lives by: the one door, the one number, the charter, the burns, the temper, the run.

## What it teaches

The Standard Reserve is a closed monetary economy with one currency ($STANDARD), one market (ETH <> $STANDARD on a hooked Uniswap v4 pool), one policy signal (net ETH flow), and one authority (4,000 lines of immutable code). This site walks a non-technical visitor through every mechanism:

| Chapter | Concept | Signature motion |
|---|---|---|
| 0 — Cover | The premise | Coin rotation, per-char title rise |
| I — One Door | The closed economy | Three.js island, scroll-driven camera orbit |
| II — The Only Number | Net ETH flow signal | Canvas coin queue, draggable lever |
| III — The Charter | Banking license (soulbound NFT) | 3D tilt deed, clip-path curtain reveal |
| IV — Growth Burns | Expansion licenses (100% burned) | Dutch auction path-tracing, ember canvas |
| V — The Temper | Asymmetric multiplier | Ratchet-up vs slam-down dial |
| VI — Where Fees Go | 70/15/15 vault routing | Conduit coin streams, gold stacking |
| VII — The Run, Inverted | Quadratic resolution fee | Sticky card stacking, toll arc |
| VIII — Ghosts | Dormancy bounty | Wax-seal shatter |
| IX — The Ledger | Supply identity | Rolling odometers |
| X — Epilogue | Session receipt | Count-ups, share-card export |

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **GSAP + ScrollTrigger** — scrubbed timelines, pinning, ratchet/slam physics
- **Lenis** — inertial smooth scroll wired to the GSAP ticker
- **Three.js** — the Chapter I island, camera orbit mapped to scroll
- **Canvas 2D** — coin queues, ember particles
- **zustand** — the whitepaper-faithful simulation engine (issuance, auctions, quadratic fees, dormancy)

## Design system

Warm paper `#f4f1ea`, ink `#1a1a18`, gold `#b08d2e`/`#c9a961` — semantic green/red only. Fraunces (display serif) + IBM Plex Mono (numerals/HUD). Four motion primitives: **STAMP**, **SLAM**, **STREAM**, **EMBER**. No blue/purple anywhere. `prefers-reduced-motion` fully respected — the narrative survives as a readable step-through.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000

# production
NODE_OPTIONS=--max-old-space-size=1024 npm run build
npm start
```

## Structure

```
app/                 layout, page, globals
components/scenes/   S0Cover … S10Epilogue, ThreeIsland
components/motion/   SplitChars, KineticText, conduits, parallax layers
components/atoms/    Dial, Odometer, Furnace, TollGate, Pips…
components/sim/      zustand SimProvider (whitepaper math)
lib/sim/engine.ts    pure TS simulation — the rules table
content/chapters.ts  verbatim copy bank
```

## Links

- Official site: https://www.standardreserve.xyz
- Whitepaper: [WHITEPAPER.md](./WHITEPAPER.md) (extracted from the official site)
- Twitter: https://x.com/standard_rsv

*A fan-made interactive explanation. Not affiliated with The Standard Reserve. Nothing here is financial advice.*
