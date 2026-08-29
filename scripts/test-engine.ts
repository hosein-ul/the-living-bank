import { SimEngine } from "../lib/sim/engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Starting SimEngine verification test suite...");

const engine = new SimEngine();
const s0 = engine.getState();
console.log("Initial state:", { epoch: s0.epoch, m: s0.m, regime: s0.regime });

assert(s0.epoch === 37, "Initial epoch must be 37");
assert(s0.m === 1.0, "Initial multiplier must be 1.0");
assert(s0.regime === "EXPANSION", "Initial regime must be EXPANSION");

// 1. Claim charter
engine.claimCharter();
const sClaim = engine.getState();
assert(sClaim.claimedCharter === true, "Charter must be claimed");
assert(sClaim.branches === 1, "Branches must start at 1 on claim");
assert(sClaim.epoch === 38, "Epoch must increment on claim");
console.log("✓ Claim charter passed");

// 2. Multiplier raise on sustained positive signal
engine.advanceEpoch(0.3); // f=[..., 0.3], signal > 0
const sRaise = engine.getState();
assert(sRaise.m === 1.25, `Multiplier should raise by 0.25 to 1.25, got ${sRaise.m}`);
assert(sRaise.regime === "EXPANSION", "Regime should remain EXPANSION");
console.log("✓ Multiplier raise passed");

// 3. Multiplier cut on negative signal
engine.advanceEpoch(-0.8); // f=[..., 0.3, -0.8], signal = -0.5 < 0
const sCut = engine.getState();
assert(sCut.m === 1.25 * 0.5, `Multiplier should cut in half to 0.625, got ${sCut.m}`);
assert(sCut.regime === "CONTRACTION", "Regime should flip to CONTRACTION on negative signal");
console.log("✓ Multiplier cut passed");

// 4. Buy license
const priceBefore = sCut.licensePrice;
const burnedBefore = sCut.burned;
const visitorBurnedBefore = sCut.visitorBurned;
const success = engine.buyLicense();
const sBuy = engine.getState();
assert(success === true, "License purchase should succeed");
assert(sBuy.branches === 2, `Branches should increase to 2, got ${sBuy.branches}`);
assert(sBuy.visitorBurned === visitorBurnedBefore + priceBefore, "Visitor burned should increment by price");
assert(sBuy.burned > burnedBefore, "Global burned supply should increase");
console.log("✓ License auction buy passed");

// 5. Buyback pacing
const initialContractionVault = sBuy.contractionVault;
const spend = engine.triggerBuybackPuff();
const sBuyback = engine.getState();
assert(spend > 0, "Buyback spend should be > 0");
assert(sBuyback.contractionVault === initialContractionVault - spend, "Contraction vault should decrease by spend");
console.log("✓ Buyback pacing passed");

// 6. Bank run & resolution fee
const runResult = engine.triggerBankRun();
const sRun = engine.getState();
assert(runResult.runners === 7, "Runners count should match seeded 7");
assert(sRun.fee > 0.05 && sRun.fee < 0.25, `Quadratic fee should be ~9.7%, got ${sRun.fee}`);
console.log("✓ Bank run trigger passed");

// 7. Choose STAY
const balanceBeforeStay = sRun.balance;
engine.chooseRunAction("STAY");
const sStay = engine.getState();
assert(sStay.runChoice === "STAY", "Run choice should be STAY");
assert(sStay.balance > balanceBeforeStay, "Visitor balance should increase from runners' toll");
console.log("✓ Choose STAY passed");

// 8. Report Ghost
const ghostResult = engine.reportGhost();
const sGhost = engine.getState();
assert(ghostResult.bounty === 1000, "Bounty should be 1000 $STD (2% of 50,000)");
assert(sGhost.ghostsReported === 1, "Ghosts reported count should be 1");
assert(sGhost.totalNpcBranches < 400, "NPC branches should decrease removing ghost");
console.log("✓ Report Ghost passed");

console.log("All SimEngine tests passed successfully!");
