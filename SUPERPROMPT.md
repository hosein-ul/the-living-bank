# SUPERPROMPT — BUILD "THE LIVING BANK"

You are a senior creative engineer building a complete, production-quality interactive website from scratch. Read this entire document before writing any code. It contains everything: concept, design system, content, engineering rules, chapter-by-chapter specs, and the definition of done. Do not simplify, skip, or reinterpret. If something is unspecified, choose the most editorial, most restrained option.

---

## 0. WHAT YOU ARE BUILDING

**"The Living Bank"** — a single-page, scroll-driven interactive explainer that teaches the Standard Reserve protocol (an onchain central bank) to a non-technical audience in ~3 minutes.

The Standard Reserve is a real DeFi protocol: a sovereign onchain central bank on Ethereum with its own currency ($STANDARD), one market (an ETH/$STANDARD pool on Uniswap v4), one policy signal (net ETH flow through that market), and one authority (a central bank implemented as 4,000 lines of immutable code). Bankers hold "charters" (soulbound NFT licenses). Charters hold up to 10 "branches" (yield positions). Each epoch the bank issues $STANDARD pro-rata to all branches. Growing = buying expansion licenses paid in $STANDARD which are 100% burned. Exiting = retiring branches, paying a "resolution fee" that rises with aggregate exit pressure — half burned, half paid to the bankers who stayed. Fees route 70% to an active vault (expansion: buys tokenized gold / contraction: buyback-and-burn), 15% to protocol-owned liquidity, 15% to team.

**The core interaction metaphor of this site: the visitor IS the market.** Their scroll, lever pulls, and button presses are the net ETH flow. The entire simulated economy reacts to them. The real whitepaper math runs underneath, but the visitor only ever sees consequences — gauges, furnaces, coins burning — never formulas.

**Reference the actual project's aesthetic:** warm paper, serif typography, wax seals, matte ink, gold accents. The site must feel like a love letter to the project's own visual language.

---

## 1. HARD RULES (violating any of these = the build is rejected)

1. **NO blue, navy, indigo, purple, violet, or teal anywhere** — not in backgrounds, buttons, charts, gradients, shadows, focus rings, selection states. Zero exceptions. Use ONLY the palette in §3.
2. **No AI slop:** no gradient text, no glowing/neon shadows, no glassmorphism on this site (matte paper only), no decorative emoji, no bouncing/pulsing animations except one single "live dot", no generic SaaS styling.
3. **No formulas or Greek letters on screen, ever.** The math runs in code. The visitor sees consequences.
4. **Lore-faithful vocabulary only:** charter, branch, epoch, net ETH flow, resolution fee, vault, burn, Founding Charter, expansion license. Never translate into generic DeFi jargon.
5. **Copy is final.** The chapter copy in §7 is verbatim. Do not paraphrase, "improve", or shorten it.
6. **All numbers are plausible and consistent.** Use the sim engine (§6) as the single source of truth. Never hardcode fake numbers in components — components read from the store.
7. **TypeScript strict.** `npx tsc --noEmit` must end with zero errors. No `any` unless unavoidable, and then with a comment.
8. **Respect `prefers-reduced-motion`.** The entire narrative must survive as a readable step-through with animations disabled (§10). This is a hard gate.
9. **No dead interactions.** Every button/lever/switch in the chapter specs must be wired to the sim store and produce a visible state change.
10. **No external network calls at runtime.** 100% client-side. No analytics, no fonts loaded from Google at runtime (self-host via next/font), no CDN scripts.

---

## 2. STACK & SCAFFOLD

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS 4**
- **Framer Motion** for scroll orchestration and DOM motion
- **Lenis** for smooth scrolling (`lerp: 0.09`)
- **Three.js** ONLY in Chapter I (the island). Load it via `next/dynamic` with `ssr: false` so the rest of the site paints without it.
- **zustand** for the sim store
- Canvas-2D (no WebGL) for: coin queues, furnace embers, and any particle work
- Fonts via `next/font/google` (self-hosted at build): **Fraunces** (serif, opsz axis) + **IBM Plex Mono**
- No other runtime deps without justification.

Scaffold into the current repo root as a Next.js app:
```
app/layout.tsx, app/page.tsx
components/chrome/     BrassPlaque, ChapterRail, EpochCounter, SoundToggle, Grain
components/scenes/     S0Cover, S1Island, S2Gate, S3Charter, S4Furnace, S5Dial,
                       S6Vaults, S7Run, S8Ghost, S9Ledger, S10Epilogue
components/atoms/      Coin, Ember, Furnace, Dial, VaultSwitch, TollGate, NPC,
                       Odometer, WaxSeal, Receipt, Pips
components/sim/        SimProvider, useEpoch, formatters
lib/sim/engine.ts      pure TS simulation (§6)
lib/easings.ts         shared easing curves
lib/rand.ts            mulberry32 seeded RNG (seed 1848)
lib/sound.ts           optional sound layer, OFF by default
content/chapters.ts    typed copy bank (all strings from §7)
```

---

## 3. DESIGN SYSTEM

### Palette (the ONLY colors)
| Token | Value | Use |
|---|---|---|
| `paper` | `#f4f1ea` | page ground |
| `paper-deep` | `#e9e4d8` | recessed panels |
| `ink` | `#1a1a18` | type, line art |
| `ink-60` | `rgba(26,26,24,.6)` | secondary type |
| `gold` | `#b08d2e` | accents, seals, takeaway lines |
| `gold-bright` | `#c9a961` | coin faces, live ticks |
| `green` | `#3d6b4f` | EXPANSION regime ONLY (semantic) |
| `red` | `#a33b2e` | CONTRACTION / danger ONLY (semantic) |
| `amber` | `#b57e2e` | warning states ONLY |

Implement as CSS custom properties + Tailwind theme tokens. Grays derived only from ink at varying alpha. **Banned hues** (final CSS must be grepped clean): blue/navy/indigo/purple/violet/teal in any form.

### Typography
- **Fraunces** — display serif for headlines, chapter titles, takeaway lines, the charter deed. Weight 300–600, use opsz axis.
- **IBM Plex Mono** — ALL numerals, counters, HUD plaque, receipts, micro-labels. `tabular-nums` always (prevents width jitter).
- Scale: 72/48/32/24/20/16/13/11. Display line-height 1.15, body 1.55. Body max measure 34ch.
- Micro-labels: mono, 11px, uppercase, letter-spacing 0.08em.

### Surfaces & texture
- Matte paper everywhere. Panels: `paper-deep`, 1px hairline border `rgba(26,26,24,.15)`. NO backdrop-filter/blur on this site.
- Paper grain: fixed full-viewport SVG turbulence overlay, `opacity: .35`, `mix-blend-mode: multiply`, `pointer-events: none`.
- Wax seal motif recurs: cover stamp (S0), charter deed (S3), cracked seal on the ghost (S8), "EXPERIENCED" stamp (S10).

### The Four Motion Moves (the ONLY allowed animations)
| Move | Spec | Used for |
|---|---|---|
| **STAMP** | scale 1.6→1, blur 8→0, shadow burst; 640ms; `cubic-bezier(.16,1,.3,1)` | seals, claim, chapter titles landing |
| **SLAM** | 240ms; `cubic-bezier(.7,0,.84,0)`; +2px scene shake for 120ms | rate cut, run start, seal crack |
| **STREAM** | continuous rAF; 8–14 coins/sec; linear; coin travel 900ms | accrual into plaque, fee routing, bounties |
| **EMBER** | coin flash → 7-particle ember → fade; 600ms | EVERY burn event |

- Duration scale: 120/240/420/640/900ms only.
- Stagger: 50ms/item, max 10 items.
- Chapter transitions: crossfade + 24px rise, 420ms.

### Sound (optional layer, OFF by default)
Single HUD toggle (drawn speaker icon). Six CC0 or generated samples ≤40KB each: paper rustle (claim), thud (stamp/slam), tick (counter), crackle (ember), low drone (contraction), soft chime (stayer payout). No music. If generating sounds is impractical, ship without sound and remove the toggle — do not ship broken audio.

---

## 4. PERSISTENT CHROME

### 4.1 The Brass Plaque (HUD)
Appears after the visitor claims their charter in Chapter III; never leaves. Fixed bottom-left, matte brass panel (paper-deep with gold hairline), mono numerals:
```
CHARTER #0042
BRANCHES   ▮▮▯▯▯▯▯▯▯▯   2/10
BALANCE        41,203 $STD  (+2.3/s)
BURNED               612 $STD
```
- Branch pips fill as licenses are bought.
- Balance STREAMs continuously (real accrual — money while you wait).
- In Chapter VII it gains a line: `EXIT TOLL: 4.2%` rising live with the run.
- The plaque is the visitor's ledger; the epilogue reads final values from it.

### 4.2 Chapter Rail
Right edge, vertical: ten ticks with roman numerals 0–IX; gold fill = visited; current chapter has a single live-dot pulse. Click = smooth-scroll to chapter.

### 4.3 Epoch Counter
Top right, mono: `EPOCH 037`. Ticks up on every policy interaction (lever threshold crossing, license buy, regime flip, run press, report). It makes the protocol's core unit visceral before it's explained.

---

## 5. SIMULATION ENGINE (`lib/sim/engine.ts`)

Pure TypeScript. Zero React dependencies. Unit-testable. The UI is a thin projection of it. All state in a zustand store via `SimProvider`.

### State
```ts
type Regime = 'EXPANSION' | 'CONTRACTION'
interface SimState {
  epoch: number
  f: number[]              // net flow input per epoch, normalized [-1..1]
  m: number                // issuance multiplier
  regime: Regime
  branches: number         // visitor's branch count (1..10)
  balance: number          // visitor accrued $STD (display units)
  visitorBurned: number    // total $STD the visitor burned via licenses + tolls paid
  sCirc: number            // real scale: starts 100_000_000
  burned: number          // system-wide cumulative burns (real scale)
  gold: number             // expansion vault accumulation (normalized)
  pol: number              // protocol-owned liquidity (normalized, monotonic up)
  team: number             // team accumulation (normalized)
  contractionVault: number // buyback budget (normalized)
  licensePrice: number; lastClose: number; licensesToday: number
  exitPressure: number     // 0..1
  fee: number              // resolution fee 0.5%..25%
  stayersPot: number
  w7d: number[]            // trailing 7-day withdrawal volumes
  ghostsReported: number
  runChoice: 'STAY' | 'WITHDRAW' | null
}
```

### Rules (whitepaper-faithful)
| Rule | Implementation | Constants |
|---|---|---|
| Signal | `signal = f[n-1] + f[n-2]` (trailing two epochs) | — |
| Multiplier cut | immediate on negative signal | `m ← max(m * 0.5, 0.25)` |
| Multiplier raise | one fixed step per sustained positive epoch | `m ← min(m + 0.25, 4.0)` |
| Issue per epoch | `I = 100 × m` display-units/day | split pro-rata across branches |
| Visitor share | `branches / totalBranches`, totalBranches baseline 400 NPC branches + visitor | — |
| License auction | `P(t) = P_start × (P_floor/P_start)^(t/24h)`; `P_start = 2 × P_last`; floor ≈ 2 days of one branch's yield | 3/day per charter, 100/day global |
| Fee split | 70% active vault / 15% POL / 15% team | every epoch tick |
| Buyback pacing | contraction vault spends in small rate-limited puffs: per "hour" tick spend ≈ `min(0.10·V, 0.002·R)` | UI shows one puff per 900ms max |
| Resolution fee | exit pressure `P = W7d / max(D + W7d, 25%)`; `fee = quadratic(P)` mapped 0.5%→25%; locks at commit | half burns, half → stayers pot |
| Dormancy bounty | 2% of dormant balance, cap 100,000 $STD | ghost forfeits 70% (half burn / half stayers), 30% returns to wallet |
| Supply identity | `sCirc = 100M + mints − burned`; `sMax = 1B − burned` | real scale in Chapter IX |

### Tick model
- **Epoch advances are visitor-driven**: each policy interaction calls `advanceEpoch(fInput)`. Deterministic.
- **NPC behavior uses seeded RNG** `mulberry32(1848)` in `lib/rand.ts` — sessions are reproducible, share cards are honest.
- **Accrual is passive**: a rAF loop STREAMs balance every frame between ticks; the number must visibly grow whenever the visitor has branches.

---

## 6. SCROLL ARCHITECTURE

- `app/page.tsx` renders the scene registry in order, wrapped in a Lenis provider.
- Each chapter is a `<section>` with `min-height` sized to its beats. Sticky stage: the stage container is `position: sticky; top: 0; height: 100vh` while copy blocks scroll past (desktop). Mobile: stage on top, copy below, no sticky.
- Use framer-motion `useScroll` with per-chapter refs for progress; map progress thresholds to beat changes (copy swap, interaction unlock, scene state).
- No scroll-jacking beyond Lenis smoothing. The scrollbar is honest.
- Scene components must pause their rAF/canvas work when offscreen (IntersectionObserver).

---

## 7. CHAPTER SPECS (content is VERBATIM)

Layout convention desktop: `[copy column ~40% left] [stage ~60% right]`. Mobile: stage top, copy below.

### S0 — COVER
- One $STANDARD coin (SVG, slow 20s/rev edge rotation), centered. Wax seal bottom-right STAMPs on load.
- Eyebrow (mono caps): `AN INTERACTIVE EXPLANATION`
- Title (Fraunces): `THE LIVING BANK`
- Sub: `The Standard Reserve is a 4,000-line onchain central bank. You're about to run its economy for two hundred epochs — and understand every rule it lives by.`
- CTA: `SCROLL TO ENTER THE ECONOMY ↓` with a 900ms underline loop.
- Fog gradient at edges + grain.

### S1 — CHAPTER I · ONE DOOR (Three.js)
- Low-poly island in fog: instanced meshes, ≤60k triangles, `dpr: min(devicePixelRatio, 1.5)`. Six structures with floating mono labels: `THE POOL · THE CENTRAL BANK · $STANDARD · CHARTERS · BRANCHES · THE VAULTS`. ONE ornate door front and center.
- Scroll progress orbits the camera 300° around the island. Each 60° of orbit highlights the next label (gold) and swaps its one-line gloss in the copy column. Pointer parallax ±5°.
- Gloss lines (one per label, shown in sequence):
  - THE POOL — `The only market. ETH trades against $STANDARD here, and nothing else.`
  - THE CENTRAL BANK — `4,000 lines of immutable code. It sets the rate, routes the fees, defends the currency.`
  - $STANDARD — `The currency. Minted only at withdrawals. Burned constantly.`
  - CHARTERS — `Banking licenses. One thousand were free at genesis.`
  - BRANCHES — `Yield positions inside a charter. Up to ten each.`
  - THE VAULTS — `Where every fee lands. Savings in good times, weapons in bad.`
- Chapter copy: `This economy is an island. Money enters through one door and leaves through the same one. Everything you're about to see happens around that door.`
- **Takeaway (gold, Fraunces italic): "One market. One signal. One authority."**

### S2 — CHAPTER II · THE ONLY NUMBER
- Stage: a city gate (SVG). A queue of gold coins walks through the gate (canvas-2D, ~30 coins on screen). Above the gate, a mechanical counter (mono odometer). A brass LEVER follows the visitor's pointer X across the stage: full-left = max inflow, center = quiet, full-right = max outflow.
- Lever left → coins stream IN (gold-bright), counter ticks up, sky lightens subtly. Lever right → coins stream OUT (desaturated ink), counter ticks down, sky dims. The counter always shows the NET difference; it resets per epoch.
- Copy: `Drag the lever. Coins walking in are buys; coins walking out are sells. The bank reads only the difference — real capital in, minus real capital out. Not price. Not volume. Not sentiment.`
- **Takeaway: "The bank watches one number: net ETH flow."**
- Each lever threshold crossing (±0.25) advances the epoch counter.

### S3 — CHAPTER III · THE CHARTER
- Stage: a paper charter deed (SVG): Fraunces script `CHARTER №0042`, soulbound crest, floating at 4° tilt. Button: `TAKE YOUR CHARTER — FREE` with sub-caption `like the 1,000 Founding Charters at genesis`.
- On click: deed STAMPs into the HUD; the plaque slides up; branch pip 1 fills; accrual STREAM begins (slow drip at 1 branch).
- Copy: `Take your charter. It's free — as the first thousand were. It is a soulbound deed: your right to run a bank, never tradeable at launch.`
- **Takeaway: "A charter is a banking license, not an asset."**

### S4 — CHAPTER IV · GROWTH BURNS
- Stage top: the expansion-license auction rail — a 24h track with a price marker decaying exponentially along it; mono price ticking down in real time. Stage bottom: the FURNACE (canvas-2D). Button: `BUY LICENSE → +1 BRANCH` showing current price; disabled at 3/day or 10/10 branches.
- On buy: payment coins fly from the plaque into the furnace and EMBER; the pip fills; the STREAM rate visibly accelerates; plaque `BURNED` line ticks up.
- After the first buy, this subtext fades in: `Yesterday's close sets today's open: the open is always 2× the last sale. Demand spikes double the open until price catches it.`
- Copy: `Growing your bank means buying licenses — paid in $STANDARD, burned on receipt. Growth itself is the largest supply sink.`
- **Takeaway: "The most rational move in the game — growth — is also its biggest supply sink."**

### S5 — CHAPTER V · THE TEMPER
- Stage: a monumental brass issuance dial (SVG arm + escapement). Behind it, a 14-epoch strip chart of the visitor's own flow history from Chapter II (thin ink line, mono ticks).
- A two-position brass lever: `INFLOW ⇄ OUTFLOW`.
- Flip to INFLOW: the arm ratchets UP in small fixed steps (+0.25 each, 420ms per step, with pauses between — generosity is earned). Flip to OUTFLOW: the arm SLAMS to half (240ms + scene shake); regime badge flips `EXPANSION`(green) → `CONTRACTION`(red); epoch ticks.
- Copy: `Push money in: the dial climbs in small, earned steps. Pull money out: it slams down in one. Rate cuts are instant. Raises must be earned, epoch after epoch.`
- **Takeaway: "The bank turns defensive instantly. Generosity has to be earned."**

### S6 — CHAPTER VI · WHERE FEES GO
- Stage: a switchboard. Fee coins rain on each epoch tick and pass through a 3-way splitter valve labeled `70 / 15 / 15`, routing to:
  - **GOLD VAULT** — gold bars stack up (expansion regime),
  - **BUYBACK FURNACE** — a small robot puffs: takes a coin, buys $STD off a mini market shelf, EMBERs it — rate-limited to one puff per 900ms with caption `small steps only — never one blockable shot` (contraction regime),
  - **POL LAKE** — a liquidity level that only rises, captioned `can never be pulled`,
  - **TEAM** — a small purse (the steady 15%).
- One brass switch `EXPANSION ⇄ CONTRACTION` flips the active-vault routing (synced with Chapter V regime).
- Copy: `Every trade pays the bank in ETH. Seventy percent routes to the active vault — gold in expansion, buyback-and-burn in contraction. Fifteen compounds into liquidity that can never be pulled. Fifteen runs the team.`
- **Takeaway: "Volatility itself becomes balance sheet — whichever way price moves."**

### S7 — CHAPTER VII · THE RUN, INVERTED
- Stage: a bank lobby with 12 NPC bankers at desks (simple SVG figures, state machines, seeded behavior). A big red button: `BANK RUN`. The exit door has a toll gate whose arc redraws live as the quadratic fee curve. Each staying NPC has a "stayers mug".
- Press RUN: agitation spreads; each NPC chooses RUN or STAY (seeded); runners sprint for the door; the toll climbs with aggregate exit volume (arc redraws, plaque shows `EXIT TOLL: 9.7%` rising); every runner pays: half EMBERs, half STREAMs into stayers' mugs.
- The visitor chooses (two buttons): `WITHDRAW ALL — pay the toll` or `STAY — collect`. Stay → your mug fills from the runners. Withdraw → you pay the toll and watch the stayers collect.
- A paper receipt summary appears: `YOU STAYED. THE RUNNERS PAID YOU 3,214 $STD.` — or the mirror line if the visitor ran.
- Copy: `Press it, and the lobby runs for the door. The toll climbs with the crowd — half of it burns, half lands in the mugs of everyone who stayed. You choose: run and pay, or stay and collect.`
- **Takeaway: "The impatient fund the patient."**

### S8 — CHAPTER VIII · GHOSTS
- Same lobby, dimmed. One NPC is asleep (`Z` mono glyphs drifting). A wall poster: `DORMANT 30 DAYS — BOUNTY 2%`. Button: `REPORT THE GHOST`.
- On report: a bounty coin STREAMs to your plaque; the ghost's wax seal cracks (SLAM); 70% forfeits — half EMBER, half to stayers; his branch closes; every remaining NPC's accrual stream visibly speeds up (pro-rata share grows — this is the dilution lesson).
- Copy: `A banker dark for thirty days siphons yield from the living. Report him and the bounty is yours. His charter burns; seventy percent of his balance is forfeit. Sleeping is never the cheap way out.`
- **Takeaway: "Ghosts don't dilute the living."**

### S9 — CHAPTER IX · THE LEDGER
- Sticky odometer pair (real scale, mono, tabular):
  - `IN PEOPLE'S HANDS  148,203,991` (sCirc)
  - `BURNED FOREVER          2,401,887` (burned)
  - below, smaller: `HARD CAP 1,000,000,000 → NEVER RISES` — with sMax visibly ticking DOWN on each burn.
- Scrolling through this chapter replays five mini-clips of the visitor's session (gate, furnace, dial, run, ghost) at 20% speed inside grayscale paper frames; each burn event the visitor caused ticks the odometers live.
- Copy: `Everything you did, reduced to one line: what people hold, and what is gone forever.`
- **Takeaway: "Supply has one direction: down."**

### S10 — EPILOGUE
- The charter deed returns, seal now reading `EXPERIENDED` — no wait: the seal reads `EXPERIENCED` (STAMP). Plaque shows final values. The share artifact is a paper receipt card:
  ```
  THE LIVING BANK — SESSION RECEIPT
  EPOCHS LIVED 037 · BRANCHES 4/10
  YOU BURNED 612 $STD · YOU EARNED 41,203
  RUN: STAYED · RUNNERS PAID YOU 3,214
  ```
- Button: `EXPORT SHARE CARD` → client-side canvas render → PNG download (1080×1080, paper/ink/gold only, session values from the store).
- Copy: `You just ran a sovereign central bank — no board, no committee, no government. The real one is 4,000 lines of immutable code.`
- Three quiet links: `THE STANDARD RESERVE ↗` (https://www.standardreserve.xyz) · `WHITEPAPER ↗` (https://www.standardreserve.xyz/whitepaper/) · `TWITTER ↗` (https://x.com/standard_rsv)
- Final line (small, ink-60): `A fan-made interactive explanation. Not affiliated. Nothing here is financial advice.`

---

## 8. RESPONSIVE & REDUCED MOTION

- **≥1024px:** canonical two-column layout, sticky stages.
- **768–1024px:** stage full-width, copy below, sticky disabled.
- **<768px:** same as 768–1024; the Chapter II lever becomes a horizontal touch-drag slider; Chapter I orbit is driven purely by scroll (no pointer parallax); NPC count 12→8.
- **`prefers-reduced-motion`:** all four MOVES become instant state changes; STREAM becomes a static counter that updates once per second; EMBER becomes an opacity crossfade; the Three.js island renders once (or falls back to a static render). The full narrative must remain readable end-to-end — verify by simulating the media query in a headless pass.

---

## 9. PERFORMANCE BUDGET

- Lighthouse desktop: performance ≥ 90, accessibility ≥ 95.
- Total JS ≤ 350KB gzipped; the Three.js chunk ≤ 180KB gzipped and lazy-loaded.
- All canvas loops: rAF + IntersectionObserver pausing (offscreen = idle).
- Animate only `transform` and `opacity`. All numerals `tabular-nums`.
- Fonts via `next/font` (self-hosted at build time). No runtime CDN fetches.

---

## 10. ACCESSIBILITY

- Every interactive control is a real `<button>`/`<input>` with an accessible name; lever/dial interactions have keyboard alternatives (arrow keys) and `aria-valuenow`.
- The chapter rail is a `<nav>` with visible focus states (gold outline, no blue anywhere — including default focus rings; override them).
- Copy contrast: ink on paper ≥ 12:1, ink-60 ≥ 4.5:1, gold used only for large display text (≥24px) or non-text accents.
- Reduced-motion handled per §8.
- Landmarks: `<header>` (epoch counter), `<main>` (chapters), `<aside>` (plaque), `<nav>` (rail).

---

## 11. IMPLEMENTATION ORDER (follow exactly)

1. **Scaffold + design tokens.** Next.js app, Tailwind theme with the §3 palette, fonts, grain overlay, Lenis provider, empty scene registry. Gate: `tsc --noEmit` clean, dev server paints a blank paper page.
2. **Sim engine.** `lib/sim/engine.ts` + `lib/rand.ts` + zustand `SimProvider` + `formatters`. Gate: a temporary debug panel drives `advanceEpoch()` and prints state transitions to console; every §5 rule fires in the right order (write a small test file if practical).
3. **Chrome.** BrassPlaque, ChapterRail, EpochCounter, Grain. Plaque binds to the store (balance STREAMs). Gate: plaque visible with fake state, rail navigates, epoch ticks.
4. **S0 + S1.** Cover with coin + seal stamp; Three.js island with scroll orbit + label sequence + parallax. Gate: desktop orbit smooth, labels swap at the right thresholds, chunk lazy-loads.
5. **S2.** Gate scene: canvas queue, pointer lever, net counter, sky shift, epoch hook. Gate: lever drives `f` into the engine, counter nets correctly.
6. **S3 + S4.** Charter claim (STAMP, plaque reveal), auction rail (live decay), furnace (EMBER), pip fill, accelerated STREAM, burned counter. Gate: license purchase mutates store exactly per §5; disabled states work (3/day, 10/10).
7. **S5 + S6.** Dial with asymmetric ratchet/slam + regime badge; vault switchboard with 70/15/15 splitter, gold stacking, buyback puffs rate-limited, POL rise-only, team purse. Gate: regime syncs between chapters; buyback never exceeds pacing.
8. **S7 + S8.** Run scene (12 NPCs, seeded choices, quadratic toll arc, stayers mugs, visitor choice + receipt); ghost scene (bounty stream, seal crack, forfeit split, stream speed-up). Gate: stay vs withdraw math matches the engine; receipt values read from the store.
9. **S9 + S10.** Odometers at real scale, slow-mo recap frames, sMax ticking down; epilogue receipt + PNG share card export. Gate: PNG exports with real session values; final disclaimer present.
10. **Reduced motion + responsive + QA pass.** Implement §8 fully; run the §12 checklist end to end; fix everything found; re-verify.

---

## 12. DEFINITION OF DONE (verify every line before declaring completion)

1. `npx tsc --noEmit` — zero errors.
2. `npm run build` passes (on low-RAM machines: `NODE_OPTIONS=--max-old-space-size=1024`).
3. Grep the built CSS for `#2e5bff|#4f46e5|#7c3aed|#8b5cf6|#0d9488|navy|indigo|purple|violet|teal` → zero matches. Also check for `rgb(` / `hsl(` variants of those hues.
4. Every §7 interaction is wired and produces a store mutation + visible change: claim, buy license, lever, regime switch, run, withdraw/stay, report, export.
5. Epoch counter ticks on all five policy interactions; plaque balance STREAMs continuously after claim.
6. Reduced-motion path: full narrative readable with zero animation dependency.
7. Screenshots at 1440px and 390px widths for every chapter via headless chromium (the paper aesthetic renders fine headless — no backdrop-filter is used).
8. Zero console errors or warnings on a full scroll-through.
9. Share card PNG exports with correct session values (not placeholder numbers).
10. All copy matches §7 verbatim; run a spellcheck pass over `content/chapters.ts`.
11. Chapter rail reaches and highlights all ten chapters; every chapter's takeaway line renders in gold Fraunces italic.
12. The epilogue disclaimer line is present exactly as written.

When all 12 pass: report a summary of what was built, the QA results for each line of this checklist, and any deviations (with reasons). Do not claim completion before the checklist passes.

---

## 13. SESSION RECOVERY & COMPACTION PROTOCOL (mandatory)

Your context may be compacted or the session may be resumed mid-build. The spec survives on disk; your working memory does not. Therefore:

1. **Maintain `PROGRESS.md` at the repo root.** After completing each implementation-order step (§11), append one block BEFORE moving on:
   ```
   ## Step N — <name> — DONE <ISO date>
   Gate result: <what you verified>
   Files touched: <list>
   Notes/deviations: <any>
   ```
   Never mark a step DONE without its gate actually verified. If a step is half-finished, write `IN PROGRESS` plus exactly what remains (e.g. "S5 dial built, S6 not started").
2. **On resume after compaction** (or any fresh session), follow this exact sequence:
   a. Re-read this file (SUPERPROMPT.md) — at minimum §1 Hard Rules, §7 Chapter Specs, and §11 Implementation Order.
   b. Read `PROGRESS.md` to find the last state.
   c. Verify ground truth cheaply: `ls` the expected files, run `npx tsc --noEmit`, grep the built/working CSS for banned hues. Trust files, not your memory of the summary.
   d. Continue from the first unfinished item. Never restart completed work from scratch; never re-scaffold over an existing tree.
3. **Re-verify the last claimed gate before continuing.** Compaction may have cut off work that was in flight; the last step's claim may be stale.
4. **The verbatim-copy rule and the banned-hue rule survive every compaction.** If you ever find yourself writing chapter copy from memory instead of copying from §7 — stop, re-read §7, and copy it exactly.
5. **Compact at gate boundaries when possible.** If you sense context pressure, finish the current step's gate, update PROGRESS.md, then compact. Never compact mid-file-edit.

