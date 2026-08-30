# The Standard Reserve — Whitepaper

> Extracted (verbatim text) from https://www.standardreserve.xyz/whitepaper/ — Whitepaper v0.1
>
> *Notice from the original document: this is a design overview, not an implementation specification. It does not contain crucial implementation details; safeguards against edge cases exist only in the deployed contracts. A protocol copied or forked from this document alone will be missing those safeguards and can result in loss of user funds. The only canonical implementation is the official Standard deployment at standardreserve.xyz.*

---

## Contents

01 Introduction
02 The entities
03 The currency
04 The net flow signal
05 Monetary policy
06 Charters
07 Branches & licenses
08 How the auctions work
09 Earning & withdrawing
10 Dormant bankers
11 Fees, reserves, defense
12 Transferable charters
13 Flywheels
14 Launch parameters
15 Disclaimer

---

## 01 — Introduction

STANDARD is a closed monetary economy with one currency ($STANDARD), one market (ETH <> $STANDARD pool on Uniswap v4), one signal that affects monetary policy (net ETH flow through that market), and one authority (the central bank, 4,000 lines of immutable code). Bankers (you) hold charters, charters operate bank branches, bank branches earn the currency issued by the central bank.

Capital flowing in loosens policy, increases $STANDARD issuance, and stacks hard reserves (tokenized gold). Capital flowing out tightens policy, triggers buybacks and burns, and prices the exits. Every path through the economy either burns $STANDARD or brings the central bank hard assets.

## 02 — The entities and how they relate

There are six entities. Everything in the system is a relationship between them.

**$STANDARD** — ERC-20, 1B hard cap. Minted at exactly one moment (a withdrawal). Burned constantly.

**The pool** — ETH <> $STANDARD on a hooked Uniswap v4 pool. Every swap feeds the bank ETH. Net flow is measured here.

**The central bank** — the issuing authority. Reads net flow, sets the issuance rate, routes fees.

**A charter** — initially soulbound NFT that makes you a banker. One charter = one bank, holding 1 to 10 bank branches. 1,000 at genesis. New ones are minted only when someone buys one at the daily ETH auction.

**A branch** — the yield accrual vehicle inside your charter. Each branch accrues a pro-rata share of daily issuance, so more branches = a bigger cut. Open new branches by burning $STANDARD. Cash out by burning the yield vehicles (branches).

**The vaults** — where fees land. Expansion vault stacks reserves. Contraction vault buys back and burns.

The mental model for charters and branches: a charter is a company, branches are its stores. The company earns through its stores, reinvests earnings to open more, and pays its owner by closing stores, one at a time or all at once. Closing the last store dissolves the company.

Every path through the economy either burns $STANDARD or brings the central bank hard assets. Most do both.

The flows between them:
- **Traders ⇄ pool.** Anyone can buy or sell $STANDARD, no charter needed. Every swap feeds the bank a trading fee in ETH.
- **Pool → central bank.** The v4 hook on the pool reports net flow: ETH in from buys minus ETH out from sells. This is the bank's only input.
- **Central bank → branches.** Each epoch the bank issues $STANDARD to all branches, pro rata. A banker's share of the issue equals their share of total branches.
- **Bankers → bank.** Bankers spend earned $STANDARD on expansion licenses to open more branches. Every token spent this way is burned.
- **Bankers → pool.** To realize earnings, a banker retires a branch: its share of the balance is liquidated and minted to their wallet, minus the resolution fee.
- **New bankers → central bank.** New charters are bought at a daily ETH auction. The ETH flows into the same fee engine as trading fees.

## 03 — The currency

- **Hard cap: 1,000,000,000 $STANDARD. 18 decimals.**
- **Genesis: 100,000,000 as protocol-owned liquidity locked into the v4 pool.** This is the only pre-mint. The position is full-range, owned by the protocol, and can never be withdrawn.
- **Issuance budget: 900,000,000 tokens** (the cap minus the genesis liquidity). When cumulative issuance reaches the budget, base issuance stops permanently and the economy runs closed-loop on recycled fees.

$STANDARD is minted on demand. Issuance credits a banker's balance as a ledger entry; actual tokens are minted only when a banker withdraws. Tokens are burned by expansion licenses (100%), open market buybacks (100%), and resolution fees (50%). Supply therefore obeys a single identity at every block:

**S_circ(t) = 100,000,000 (genesis liquidity) + M(t) (withdrawal mints) − B(t) (cumulative burns)** (3.1)

and because burned tokens are gone forever, the maximum supply that can ever exist is strictly non-increasing:

**S_max(t) = 1,000,000,000 − B(t)** (3.2)

Circulating supply is a receipt. It equals value withdrawn from the system minus everything the bank has clawed back and burned. One onchain number tells you whether the economy is eating or bleeding.

## 04 — The net flow signal

The pool's hook counts, per epoch, gross ETH entering from buys and gross ETH leaving from sells. Net flow for epoch n is the difference, and the policy signal aggregates the last two completed epochs:

**F_n = buys − sells;  signal_n = F_(n−1) + F_(n−2)** (4.1)

The issuance rate moves on `signal_n`; fee routing moves on `sign(F_n)` alone. Properties that matter:
- It is measured at the canonical pool. There is exactly one place ETH enters or leaves this economy: through trading.
- It is denominated in real capital. ETH, not token amounts, not trade counts. To move the signal you must move actual capital.
- The issuance decision uses the trailing two epochs, so one manipulated hour cannot swing the rate. The fee routing decision uses the current epoch's sign, so defense reacts fast. Slow lever for issuance, fast lever for fees.

## 05 — Monetary policy

Issuance runs at a base rate of $STANDARD per day, scaled by a policy multiplier m. An epoch of d days issues

**I_n = base × d × m_n** (5.1)

split pro rata and streamed second by second across the epoch. Balances tick up in real time, and a new branch earns from the moment it opens. A single branch's daily yield in a system of N branches is `base × m / N`. The multiplier itself follows one rule, evaluated every epoch:

- On positive signal: m rises in small fixed steps (raises must be earned).
- On negative signal: m is cut immediately and deeply (cuts are instant).

The asymmetry is deliberate: cuts are immediate, raises must be earned. The bank turns defensive faster than it turns generous.

**The two regimes.** Each epoch is either expansion (net flow positive) or contraction (net flow negative or zero):

| | Expansion | Contraction |
|---|---|---|
| Issuance | climbing (if sustained) | cut immediately |
| Fee routing | expansion vault: hard reserve assets | contraction vault: buyback and burn |
| Licenses | cost more (floor scales with the rate) | cost less |
| Exits | cheap, floor | priced by the crowd, up to the ceiling |
| Rational move | expand; every new branch burns supply | stay; exit fees pay those who remain |

## 06 — Charters

A charter is an initially soulbound NFT. Holding one makes you a banker: it is the license to operate a bank and receive issuance.

- **Genesis: 1,000 Founding Charters, free.** An allowlist portion and a public portion, limit one per wallet. There is no sale and no proceeds; the team seeds the genesis liquidity itself.
- **After genesis: daily Dutch auctions in ETH.** Auction proceeds enter the fee engine like every other ETH flow.
- **Lifecycle.** A charter lives until its last branch is retired, at which point the NFT burns. The only way back in is buying a new charter at auction. There are no revolving doors.

## 07 — Branches and expansion licenses

Every charter opens with its first branch, and can grow to 10 branches maximum. Each branch is one share of every epoch's issue.

Additional branches require an expansion license, sold at a daily Dutch auction:

- **Payment: $STANDARD, 100% burned.**
- Start price = 2× yesterday's closing sale; floor ≈ two days of one branch's yield.
- Exponential decay from open to floor across 24 hours: **P(t) = P_start × (P_floor / P_start)^(t/24h)** (7.1)
- Each charter can buy at most three licenses per day.

The auction starts high and decays until buyers step in, so every license finds its market price; the floor only prevents literal-zero sales. A branch begins earning the second it opens: issuance streams continuously, so its take is exactly proportional to how long it has existed.

This is the engine of the expansion flywheel: the most rational move inside the system, growing your bank, permanently shrinks the float.

## 08 — How the auctions work

Both sales in the system run on one mechanism: a daily falling-price Dutch auction. The price opens high, decays toward a floor over 24 hours, and purchases execute instantly at the current price, first come, first served. There are no bids, no escrow, no refunds, and nothing to snipe. The two auctions differ only in what they sell, what they are paid in, and where the payment goes: licenses are paid in $STANDARD and burned; charters are paid in ETH that flows to the fee engine.

- **License auction (daily, Dutch, in $STANDARD):** once per day, initially 100 expansion licenses go on sale at a price that starts high and falls continuously toward the floor over 24 hours. The day opens at 2× yesterday's closing sale price. The day ends when 100 licenses sell or 24 hours pass, whichever comes first. Unsold licenses do not roll over; the last (lowest) base price that sold becomes tomorrow's open.
- **Charter auction (daily, Dutch, in ETH):** when enabled (the count per day starts at zero and is policy-controlled), each day's new charters sell on the same curve, denominated in ETH. The day opens at 3× the previous day's closing sale. Unsold charters are never minted and do not roll over; the last sale sets tomorrow's open.

The design has two intentional consequences:
- **Buyers set the price, not the protocol.** Every buyer faces the same tradeoff: buy early and pay a premium for certainty, or wait for a lower price and risk the daily supply selling out. Where that tension resolves is the market price.
- **Repricing is asymmetric.** In downturns, the price decays to the floor faster, meaning expansion is cheapest during contractions. In upturns, the price series can rise at most 2× per day, so demand can never push a sale above the open, and each open is at most 2× yesterday's close. A demand spike sells days out instantly while the opens double until price catches demand (~100× in a week). Charters open higher than licenses (3× vs 2×) because scarce seats should reprice into demand faster than a daily commodity.

## 09 — Earning and withdrawing

Issuance accrues to a charter's balance continuously. To take profits, a banker retires branches. Retirement is two things at once: it liquidates the branch's share of the accrued balance into tokens in your wallet, and it permanently retires the vehicle that was producing the yield.

- **Pro rata rule.** Retiring one branch of ten liquidates one tenth of the balance. Retiring all ten liquidates everything and burns the charter.
- The released amount is minted to the banker's wallet, minus the **resolution fee**.
- **Minting has an equal and opposite reaction.** Every withdrawal retires the branch that earned it, permanently reducing your share of all future yield. You cannot extract value and keep the vehicle that produced it.

**The resolution fee is congestion pricing on the exit door.** Let W be tokens withdrawn system-wide over the trailing 7 days and D be everything still held at the bank. Exit pressure P = W / max(D + W, k), and the fee is a quadratic curve from a floor to a ceiling, saturating when a large share of the bank tries to leave in a week. Half of every fee is burned. The other half is paid to every banker who stayed.

This inverts the payoff structure of a bank run. In a traditional run, whoever exits first is made whole and whoever waits absorbs the loss, so running first is always correct. Here, heavy exit volume raises the fee on the exiters themselves, and half of what they pay goes to the positions that stayed, so mass exits transfer value from the impatient to the patient. Withdrawals are never paused or queued at any fee level. The cost of leaving is the only control mechanism.

## 10 — Dormant bankers

A dormant banker siphons issue away from working bankers, so the system removes them:

1. **Report** — a wallet inactive for 30 days can be reported by anyone.
2. **Bounty** — the informant earns a bounty (2% of the dormant balance, capped at 100,000 tokens).
3. **Revocation** — the ghost pays a 70% revocation fee, deliberately worse than the worst-case resolution fee, so going dark is never the cheap way out. Half the fee burns, half pays the bankers still at their desks.
4. **Shutdown** — their branches are shuttered, their charter burns, and the remaining 30% is sent to their wallet.

Staying active is free: any interaction resets the clock, and a zero-cost check-in exists for bankers who simply want to hold. Lost keys, abandoned wallets, and tourists dilute no one.

## 11 — Fees, reserves, and defense

**The split.** All protocol ETH, trading fees and charter auctions alike, routes each epoch:

| Share | Destination |
|---|---|
| 70% | the active vault (expansion or contraction, by that epoch's net flow) |
| 15% | protocol-owned liquidity (half swapped to $STANDARD, paired, added forever) |
| 15% | team |

- The **expansion vault** accumulates ETH and purchases hard reserve assets (tokenized gold and comparable assets). Reserves are held by the bank.
- The **contraction vault** buys $STANDARD on the open market and burns everything it buys, executing in small rate-limited steps so defense cannot be baited into one blockable shot. Each hourly tick with vault balance V against pool reserves R spends **min(0.10 × V, 0.002 × R)** (11.1) — bounding buybacks near 5% of pool depth per day at launch settings. Unspent balance rolls forward; the vault can never sell.
- **Protocol-owned liquidity only grows.** The genesis position plus every epoch's POL share compound into a floor of exit liquidity that no one can pull. Trading fees earned in $STANDARD are always burned.

## 12 — Transferable charters (future)

Charters launch soulbound. A one-way switch enables transfers later, at which point selling a charter becomes a second exit path: the seat moves whole, branches and balance included. A seat sale is an exit with zero sell pressure on $STANDARD; the buyer replaces the seller one for one.

## 13 — Flywheels

Four structural loops, each following directly from the mechanics above:

1. **Adoption** — new charters are sold for ETH, and that ETH routes into the same engine as trading fees: reserves, permanent liquidity, buybacks. Each entrant strengthens the balance sheet that made entry worth bidding on. And because total issuance is capped per day, a new banker changes how the issue is divided, not how much exists.
2. **Expansion** — the highest expected-value action available to an incumbent, adding branches, is also the protocol's largest supply sink: every license is paid in $STANDARD and burned. Individual self-interest and supply reduction point in the same direction by construction, with no lockups or incentives needed to align them.
3. **Fee flow** — fee revenue is direction-agnostic: buys and sells both pay in ETH. In expansion regimes it accumulates as hard reserves and permanent liquidity; in contraction regimes it finances buybacks and burns. The protocol converts volatility itself into balance sheet, whichever way price moves.
4. **Monetary policy** — the three defensive mechanisms compound at the same moment. When capital exits: issuance cuts within one epoch, decreasing dilution; fee routing flips to buybacks, adding structural bid; and the resolution fee rises with aggregate exit volume, half burned, half redistributed to remaining positions. Each mechanism independently raises the relative payoff of holding exactly when exit pressure peaks. Downside conditions tighten the system rather than unwind it.

## 14 — Launch parameters

Hard cap · Genesis liquidity · Base issuance · Multiplier m range · Epoch length · Founding Charters · Charter auctions · Branches per charter · Expansion licenses per day · License floor · Trading fee · Fee split · Resolution fee curve · Dormancy window · Buyback pacing.

*Final parameters will be announced closer to launch.*

## 15 — Disclaimer

STANDARD is an experimental onchain protocol. It is not a bank, holds no customer funds, offers no accounts, and is not a regulated financial institution of any kind. Nothing here is investment advice. Participate at your own risk.
