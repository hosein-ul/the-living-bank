import { defaultRng } from "../rand";

export type Regime = "EXPANSION" | "CONTRACTION";

export interface SimState {
  epoch: number;
  f: number[];              // net flow input per epoch, normalized [-1..1]
  m: number;                // issuance multiplier
  regime: Regime;
  branches: number;         // visitor's branch count (1..10)
  balance: number;          // visitor accrued $STD (display units)
  visitorBurned: number;    // total $STD the visitor burned via licenses + tolls paid
  sCirc: number;            // real scale: starts 100_000_000
  burned: number;           // system-wide cumulative burns (real scale)
  gold: number;             // expansion vault accumulation (gold bars / score)
  pol: number;              // protocol-owned liquidity (monotonic up)
  team: number;             // team accumulation
  contractionVault: number; // buyback budget
  licensePrice: number;     // current license auction price
  lastClose: number;        // last close sale price
  licensesToday: number;    // count of licenses bought today (max 3)
  exitPressure: number;     // 0..1
  fee: number;              // resolution fee 0.005..0.25
  stayersPot: number;       // total stayers pot accumulated
  w7d: number[];            // trailing 7-day withdrawal volumes
  ghostsReported: number;   // count of ghosts reported
  runChoice: "STAY" | "WITHDRAW" | null;
  runRewardOrFeePaid: number;
  claimedCharter: boolean;
  totalNpcBranches: number; // baseline NPC branch count (starts 400)
  lastBurnEvent: {
    type: "license" | "toll" | "ghost" | "buyback";
    amount: number;
    timestamp: number;
  } | null;
}

export const INITIAL_SIM_STATE: SimState = {
  epoch: 37,
  f: [0.15, 0.25, 0.4, 0.1, -0.05, 0.3, 0.45],
  m: 1.0,
  regime: "EXPANSION",
  branches: 0,
  balance: 38200,
  visitorBurned: 0,
  sCirc: 148203991,
  burned: 2401275,
  gold: 14,
  pol: 120,
  team: 85,
  contractionVault: 450,
  licensePrice: 612,
  lastClose: 306,
  licensesToday: 0,
  exitPressure: 0.0,
  fee: 0.005,
  stayersPot: 0,
  w7d: [120, 95, 140, 80, 110, 130, 90],
  ghostsReported: 0,
  runChoice: null,
  runRewardOrFeePaid: 0,
  claimedCharter: false,
  totalNpcBranches: 400,
  lastBurnEvent: null,
};

export class SimEngine {
  private state: SimState;
  private listeners: Set<(state: SimState) => void> = new Set();
  private rng = defaultRng;

  constructor(initialState: Partial<SimState> = {}) {
    this.state = { ...INITIAL_SIM_STATE, ...initialState };
  }

  public getState(): SimState {
    return this.state;
  }

  public subscribe(listener: (state: SimState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const stateCopy = { ...this.state };
    for (const listener of this.listeners) {
      listener(stateCopy);
    }
  }

  public claimCharter(): void {
    if (this.state.claimedCharter) return;
    this.state = {
      ...this.state,
      claimedCharter: true,
      branches: 1,
      epoch: this.state.epoch + 1,
    };
    this.emit();
  }

  public advanceEpoch(fInput: number = 0.2): void {
    const nextF = [...this.state.f.slice(-13), fInput];
    const prevF = nextF[nextF.length - 2] ?? fInput;
    const signal = fInput + prevF;

    let nextM = this.state.m;
    let nextRegime: Regime = this.state.regime;

    if (signal < 0) {
      nextM = Math.max(this.state.m * 0.5, 0.25);
      nextRegime = "CONTRACTION";
    } else {
      nextM = Math.min(this.state.m + 0.25, 4.0);
      nextRegime = "EXPANSION";
    }

    // Pro-rata issuance
    const totalBranches = this.state.totalNpcBranches + Math.max(1, this.state.branches);
    const issuance = 100 * nextM;
    const visitorGain = this.state.claimedCharter
      ? (this.state.branches / totalBranches) * issuance * 2.0
      : 0;

    // Fee split (70 / 15 / 15)
    const feeVolume = Math.abs(fInput) * 30 + 10;
    let nextGold = this.state.gold;
    let nextContractionVault = this.state.contractionVault;
    if (nextRegime === "EXPANSION") {
      nextGold += feeVolume * 0.7;
    } else {
      nextContractionVault += feeVolume * 0.7;
    }
    const nextPol = this.state.pol + feeVolume * 0.15;
    const nextTeam = this.state.team + feeVolume * 0.15;

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      f: nextF,
      m: nextM,
      regime: nextRegime,
      balance: this.state.balance + visitorGain,
      sCirc: this.state.sCirc + Math.round(issuance * 100),
      gold: nextGold,
      pol: nextPol,
      team: nextTeam,
      contractionVault: nextContractionVault,
    };
    this.emit();
  }

  public buyLicense(): boolean {
    if (this.state.branches >= 10) return false;
    if (this.state.licensesToday >= 3) return false;
    const price = this.state.licensePrice;

    const nextBurned = this.state.burned + price * 250;
    const nextSCirc = Math.max(0, this.state.sCirc - price * 250);
    const nextVisitorBurned = this.state.visitorBurned + price;
    const nextBalance = Math.max(0, this.state.balance - price);
    const nextBranches = this.state.branches + 1;
    const nextLastClose = price;
    const nextLicensesToday = this.state.licensesToday + 1;
    // Demand spikes double open
    const nextPrice = Math.round(price * 1.5);

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      branches: nextBranches,
      balance: nextBalance,
      visitorBurned: nextVisitorBurned,
      burned: nextBurned,
      sCirc: nextSCirc,
      licensePrice: nextPrice,
      lastClose: nextLastClose,
      licensesToday: nextLicensesToday,
      lastBurnEvent: {
        type: "license",
        amount: price,
        timestamp: Date.now(),
      },
    };
    this.emit();
    return true;
  }

  public setRegime(regime: Regime): void {
    if (this.state.regime === regime) return;
    let nextM = this.state.m;
    if (regime === "CONTRACTION") {
      nextM = Math.max(this.state.m * 0.5, 0.25);
    } else {
      nextM = Math.min(this.state.m + 0.25, 4.0);
    }

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      regime,
      m: nextM,
    };
    this.emit();
  }

  public triggerBuybackPuff(): number {
    if (this.state.contractionVault <= 0) return 0;
    // Rate-limited spend: min(0.10 * V, 20)
    const spend = Math.max(1, Math.min(this.state.contractionVault * 0.1, 20));
    const burnAmount = spend * 1000;

    this.state = {
      ...this.state,
      contractionVault: Math.max(0, this.state.contractionVault - spend),
      burned: this.state.burned + burnAmount,
      sCirc: Math.max(0, this.state.sCirc - burnAmount),
      lastBurnEvent: {
        type: "buyback",
        amount: Math.round(spend),
        timestamp: Date.now(),
      },
    };
    this.emit();
    return spend;
  }

  public triggerBankRun(): { runners: number; stayers: number; tollPercent: number } {
    // 12 NPCs: seeded behavior
    const runners = 7;
    const stayers = 5;
    // Quadratic exit pressure
    const pressure = runners / 12; // ~0.583
    // Fee mapped 0.5% -> 25% quadratically: 0.005 + 0.245 * P^2
    const tollPercent = 0.005 + 0.245 * (pressure * pressure); // ~0.097 (9.7%)
    const runnerVolume = 33134;
    const totalFee = runnerVolume * tollPercent;
    const halfBurn = totalFee * 0.5;
    const halfStayers = totalFee * 0.5;

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      exitPressure: pressure,
      fee: tollPercent,
      stayersPot: this.state.stayersPot + halfStayers,
      burned: this.state.burned + Math.round(halfBurn * 50),
      lastBurnEvent: {
        type: "toll",
        amount: Math.round(halfBurn),
        timestamp: Date.now(),
      },
    };
    this.emit();
    return { runners, stayers, tollPercent };
  }

  public chooseRunAction(choice: "STAY" | "WITHDRAW"): void {
    if (this.state.runChoice !== null) return;

    let nextBalance = this.state.balance;
    let nextVisitorBurned = this.state.visitorBurned;
    let nextBurned = this.state.burned;
    let rewardOrFee = 0;

    if (choice === "STAY") {
      // Payout from runners to stayer
      rewardOrFee = 3214;
      nextBalance += rewardOrFee;
    } else {
      // Visitor withdraws and pays resolution fee
      const feePaid = Math.round(this.state.balance * this.state.fee);
      rewardOrFee = feePaid;
      nextBalance = Math.max(0, nextBalance - feePaid);
      nextVisitorBurned += Math.round(feePaid * 0.5);
      nextBurned += Math.round(feePaid * 0.5 * 100);
    }

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      runChoice: choice,
      runRewardOrFeePaid: rewardOrFee,
      balance: nextBalance,
      visitorBurned: nextVisitorBurned,
      burned: nextBurned,
      lastBurnEvent: {
        type: "toll",
        amount: choice === "WITHDRAW" ? Math.round(rewardOrFee * 0.5) : 0,
        timestamp: Date.now(),
      },
    };
    this.emit();
  }

  public reportGhost(): { bounty: number; forfeited: number } {
    if (this.state.ghostsReported > 0) {
      return { bounty: 0, forfeited: 0 };
    }

    const dormantBalance = 50000;
    const bounty = 1000; // 2% bounty
    const forfeitTotal = dormantBalance * 0.7; // 70% forfeit = 35000
    const halfBurn = forfeitTotal * 0.5; // 17500
    const halfStayers = forfeitTotal * 0.5; // 17500

    this.state = {
      ...this.state,
      epoch: this.state.epoch + 1,
      ghostsReported: this.state.ghostsReported + 1,
      balance: this.state.balance + bounty,
      totalNpcBranches: Math.max(200, this.state.totalNpcBranches - 20), // ghost branches removed, dilution down!
      burned: this.state.burned + halfBurn * 50,
      stayersPot: this.state.stayersPot + halfStayers,
      lastBurnEvent: {
        type: "ghost",
        amount: Math.round(halfBurn),
        timestamp: Date.now(),
      },
    };
    this.emit();
    return { bounty, forfeited: forfeitTotal };
  }

  private lastEmitTime = 0;

  public accruePassive(deltaSec: number): void {
    if (!this.state.claimedCharter || this.state.branches <= 0) return;
    const totalBranches = this.state.totalNpcBranches + this.state.branches;
    // Rate ~ 2.3 $STD / sec per branch at m=1
    const baseRate = 2.3;
    const dilutionFactor = 400 / totalBranches;
    const ratePerSec = this.state.branches * baseRate * this.state.m * dilutionFactor;
    this.state = {
      ...this.state,
      balance: this.state.balance + ratePerSec * deltaSec,
    };
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - this.lastEmitTime > 150) {
      this.lastEmitTime = now;
      this.emit();
    }
  }

  public getAccrualRatePerSec(): number {
    if (!this.state.claimedCharter || this.state.branches <= 0) return 0;
    const totalBranches = this.state.totalNpcBranches + this.state.branches;
    const baseRate = 2.3;
    const dilutionFactor = 400 / totalBranches;
    return this.state.branches * baseRate * this.state.m * dilutionFactor;
  }
}
