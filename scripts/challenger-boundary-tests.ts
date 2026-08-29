import { SimEngine, INITIAL_SIM_STATE } from "../lib/sim/engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("================================================================================");
console.log("CHALLENGER 1: COMPREHENSIVE BOUNDARY & MONETARY POLICY TEST HARNESS");
console.log("================================================================================");

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// TEST GROUP 1: MULTIPLIER (m) BOUNDS & DUAL REGIME ASYMMETRIC DYNAMICS
// ----------------------------------------------------------------------------
runTest("Multiplier (m) clamped strictly between [0.25, 4.0] under 500,000 extreme steps", () => {
  const engine = new SimEngine();
  
  // Continuous maximum expansion test (500 steps of +1.0)
  for (let i = 0; i < 500; i++) {
    engine.advanceEpoch(1.0);
    const m = engine.getState().m;
    assert(m <= 4.0, `m exceeded 4.0: got ${m}`);
    assert(m >= 0.25, `m below 0.25: got ${m}`);
    assert(engine.getState().regime === "EXPANSION", `Regime should be EXPANSION, got ${engine.getState().regime}`);
  }
  assert(engine.getState().m === 4.0, `m should have reached upper clamp 4.0, got ${engine.getState().m}`);

  // Continuous maximum contraction test (500 steps of -1.0)
  // Note: Step 0 has prevF=1.0 and fInput=-1.0 -> signal=0.0 -> EXPANSION (2-epoch signal inertia)
  // Steps 1..499 have prevF=-1.0 and fInput=-1.0 -> signal=-2.0 -> CONTRACTION
  for (let i = 0; i < 500; i++) {
    engine.advanceEpoch(-1.0);
    const m = engine.getState().m;
    assert(m <= 4.0, `m exceeded 4.0: got ${m}`);
    assert(m >= 0.25, `m below 0.25: got ${m}`);
    if (i === 0) {
      assert(engine.getState().regime === "EXPANSION", `Step 0 with signal 0.0 should be EXPANSION, got ${engine.getState().regime}`);
    } else {
      assert(engine.getState().regime === "CONTRACTION", `Step ${i} with signal -2.0 should be CONTRACTION, got ${engine.getState().regime}`);
    }
  }
  assert(engine.getState().m === 0.25, `m should have reached lower clamp 0.25, got ${engine.getState().m}`);

  // Rapid chaotic oscillations (500,000 iterations)
  const extremeValues = [-1.0, 1.0, 0.0, -0.00001, 0.00001, -0.5, 0.5, -0.999, 0.999];
  for (let i = 0; i < 500_000; i++) {
    const val = extremeValues[i % extremeValues.length];
    const prevF = engine.getState().f[engine.getState().f.length - 1];
    engine.advanceEpoch(val);
    const s = engine.getState();
    assert(s.m >= 0.25 && s.m <= 4.0, `Multiplier out of bounds: ${s.m} at step ${i}`);
    const expectedSignal = val + prevF;
    const expectedRegime = expectedSignal < 0 ? "CONTRACTION" : "EXPANSION";
    assert(s.regime === expectedRegime, `Regime mismatch at step ${i}: got ${s.regime}, expected ${expectedRegime} for signal ${expectedSignal}`);
  }
});

// ----------------------------------------------------------------------------
// TEST GROUP 2: 70/15/15 VAULT FEE SPLIT MATHEMATICAL INVARIANT
// ----------------------------------------------------------------------------
runTest("Vault fee split exact 70% Vault, 15% POL, 15% Team across regimes", () => {
  const engine = new SimEngine({ gold: 0, contractionVault: 0, pol: 0, team: 0 });

  // Test Expansion fee split
  const sBeforeExp = engine.getState();
  engine.advanceEpoch(0.8); // signal > 0 -> EXPANSION
  const sAfterExp = engine.getState();
  const feeVolExp = Math.abs(0.8) * 30 + 10; // 34
  
  const dGoldExp = sAfterExp.gold - sBeforeExp.gold;
  const dVaultExp = sAfterExp.contractionVault - sBeforeExp.contractionVault;
  const dPolExp = sAfterExp.pol - sBeforeExp.pol;
  const dTeamExp = sAfterExp.team - sBeforeExp.team;

  assert(Math.abs(dGoldExp - (feeVolExp * 0.70)) < 1e-9, `Expansion gold fee mismatch: ${dGoldExp} vs ${feeVolExp * 0.7}`);
  assert(dVaultExp === 0, `Expansion contraction vault should not receive fees: ${dVaultExp}`);
  assert(Math.abs(dPolExp - (feeVolExp * 0.15)) < 1e-9, `POL fee mismatch: ${dPolExp} vs ${feeVolExp * 0.15}`);
  assert(Math.abs(dTeamExp - (feeVolExp * 0.15)) < 1e-9, `Team fee mismatch: ${dTeamExp} vs ${feeVolExp * 0.15}`);
  assert(Math.abs((dGoldExp + dVaultExp + dPolExp + dTeamExp) - feeVolExp) < 1e-9, "Fee components do not sum to total fee volume");

  // Test Contraction fee split
  const sBeforeCont = engine.getState();
  engine.advanceEpoch(-0.9); // signal = 0.8 + (-0.9) = -0.1 < 0 -> CONTRACTION
  const sAfterCont = engine.getState();
  const feeVolCont = Math.abs(-0.9) * 30 + 10; // 37

  const dGoldCont = sAfterCont.gold - sBeforeCont.gold;
  const dVaultCont = sAfterCont.contractionVault - sBeforeCont.contractionVault;
  const dPolCont = sAfterCont.pol - sBeforeCont.pol;
  const dTeamCont = sAfterCont.team - sBeforeCont.team;

  assert(dGoldCont === 0, `Contraction gold should not receive fees: ${dGoldCont}`);
  assert(Math.abs(dVaultCont - (feeVolCont * 0.70)) < 1e-9, `Contraction vault fee mismatch: ${dVaultCont} vs ${feeVolCont * 0.7}`);
  assert(Math.abs(dPolCont - (feeVolCont * 0.15)) < 1e-9, `POL fee mismatch: ${dPolCont} vs ${feeVolCont * 0.15}`);
  assert(Math.abs(dTeamCont - (feeVolCont * 0.15)) < 1e-9, `Team fee mismatch: ${dTeamCont} vs ${feeVolCont * 0.15}`);
  assert(Math.abs((dGoldCont + dVaultCont + dPolCont + dTeamCont) - feeVolCont) < 1e-9, "Fee components do not sum to total fee volume in contraction");
});

// ----------------------------------------------------------------------------
// TEST GROUP 3: DUTCH AUCTION LICENSE PURCHASES & HARD 10-BRANCH CEILING
// ----------------------------------------------------------------------------
runTest("Soulbound Charter licenses strictly enforce 3/day and 10 branches maximum ceiling", () => {
  const engine = new SimEngine({
    balance: 50_000_000,
    branches: 1,
    claimedCharter: true,
    licensesToday: 0,
    licensePrice: 600,
  });

  // Day 1: Purchase 3 licenses
  assert(engine.buyLicense() === true, "Buy 1 should succeed");
  assert(engine.buyLicense() === true, "Buy 2 should succeed");
  assert(engine.buyLicense() === true, "Buy 3 should succeed");
  assert(engine.buyLicense() === false, "Buy 4 must fail due to 3/day daily quota");
  assert(engine.getState().branches === 4, `Branches should be 4, got ${engine.getState().branches}`);
  assert(engine.getState().licensesToday === 3, "Licenses today should be 3");

  // Advance day by resetting licensesToday (simulating day turnover)
  // Day 2: 3 more buys -> branches = 7
  (engine as any).state.licensesToday = 0;
  assert(engine.buyLicense() === true, "Day 2 Buy 1 should succeed");
  assert(engine.buyLicense() === true, "Day 2 Buy 2 should succeed");
  assert(engine.buyLicense() === true, "Day 2 Buy 3 should succeed");
  assert(engine.buyLicense() === false, "Day 2 Buy 4 must fail");
  assert(engine.getState().branches === 7, `Branches should be 7, got ${engine.getState().branches}`);

  // Day 3: 3 more buys -> branches = 10 (MAX CAP)
  (engine as any).state.licensesToday = 0;
  assert(engine.buyLicense() === true, "Day 3 Buy 1 should succeed");
  assert(engine.buyLicense() === true, "Day 3 Buy 2 should succeed");
  assert(engine.buyLicense() === true, "Day 3 Buy 3 should succeed");
  assert(engine.getState().branches === 10, `Branches should be 10, got ${engine.getState().branches}`);

  // Day 4: At 10/10 branches, all further buys MUST be rejected
  (engine as any).state.licensesToday = 0;
  for (let i = 0; i < 20; i++) {
    assert(engine.buyLicense() === false, `Buy at 10/10 branches must return false (attempt ${i + 1})`);
  }
  assert(engine.getState().branches === 10, "Branches exceeded maximum cap 10");
});

// ----------------------------------------------------------------------------
// TEST GROUP 4: RATE-LIMITED BUYBACK PUFF & ZERO-VAULT SAFETY
// ----------------------------------------------------------------------------
runTest("Rate-limited buyback burn formula and zero/depleted vault handling", () => {
  // Case A: Normal rate-limited puff (10% or max 20)
  const engine1 = new SimEngine({ contractionVault: 500, burned: 100_000, sCirc: 10_000_000 });
  const spend1 = engine1.triggerBuybackPuff();
  // 10% of 500 = 50, but max cap is 20
  assert(spend1 === 20, `Spend for 500 vault should be capped at 20, got ${spend1}`);
  assert(engine1.getState().contractionVault === 480, `Vault should be 480, got ${engine1.getState().contractionVault}`);
  assert(engine1.getState().burned === 100_000 + 20 * 1000, `Burned should increase by 20,000, got ${engine1.getState().burned}`);
  assert(engine1.getState().sCirc === 10_000_000 - 20 * 1000, `sCirc should decrease by 20,000, got ${engine1.getState().sCirc}`);

  // Case B: Small vault < 200 (10% is less than 20)
  const engine2 = new SimEngine({ contractionVault: 80 });
  const spend2 = engine2.triggerBuybackPuff();
  assert(spend2 === 8, `Spend for 80 vault should be 8 (10%), got ${spend2}`);
  assert(engine2.getState().contractionVault === 72, `Vault should be 72, got ${engine2.getState().contractionVault}`);

  // Case C: Depleted vault = 0
  const engine3 = new SimEngine({ contractionVault: 0 });
  const spend3 = engine3.triggerBuybackPuff();
  assert(spend3 === 0, `Spend on empty vault must be 0, got ${spend3}`);
  assert(engine3.getState().contractionVault === 0, "Contraction vault must remain 0");

  // Case D: Negative vault protection
  const engine4 = new SimEngine({ contractionVault: -10 });
  const spend4 = engine4.triggerBuybackPuff();
  assert(spend4 === 0, `Spend on negative vault must be 0, got ${spend4}`);
});

// ----------------------------------------------------------------------------
// TEST GROUP 5: QUADRATIC RESOLUTION FEE & BANK RUN 50/50 SPLIT
// ----------------------------------------------------------------------------
runTest("Quadratic resolution fee formula mapping [0.5% .. 25%] and 50/50 split", () => {
  // Test formula: fee = 0.005 + 0.245 * P^2
  // At P = 0.0: fee = 0.005 (0.5%)
  // At P = 0.5: fee = 0.005 + 0.245 * 0.25 = 0.005 + 0.06125 = 0.06625 (6.625%)
  // At P = 7/12 (~0.58333): fee = 0.005 + 0.245 * (49/144) ~ 0.005 + 0.083368 = 0.088368
  // At P = 1.0: fee = 0.005 + 0.245 * 1.0 = 0.25 (25.0%)
  
  const engine = new SimEngine({ balance: 100_000, stayersPot: 0, burned: 0, visitorBurned: 0 });
  const { runners, stayers, tollPercent } = engine.triggerBankRun();
  
  assert(runners === 7, `Runners should be 7, got ${runners}`);
  assert(stayers === 5, `Stayers should be 5, got ${stayers}`);
  assert(runners + stayers === 12, "Total participants must sum to 12");
  
  const expectedPressure = 7 / 12;
  const expectedFee = 0.005 + 0.245 * (expectedPressure * expectedPressure);
  assert(Math.abs(tollPercent - expectedFee) < 1e-9, `Toll fee calculation mismatch: ${tollPercent} vs ${expectedFee}`);
  
  // Test 50/50 split in triggerBankRun
  const runnerVolume = 33134;
  const totalFee = runnerVolume * tollPercent;
  const expectedHalf = totalFee * 0.5;
  assert(Math.abs(engine.getState().stayersPot - expectedHalf) < 1e-9, `Stayers pot mismatch: ${engine.getState().stayersPot} vs ${expectedHalf}`);
});

// ----------------------------------------------------------------------------
// TEST GROUP 6: BANK RUN USER CHOICES (STAY vs WITHDRAW) & IMMUTABILITY
// ----------------------------------------------------------------------------
runTest("Bank run action STAY rewards vs WITHDRAW penalties and strict immutability", () => {
  // Scenario A: Visitor chooses WITHDRAW
  const engineWithdraw = new SimEngine({ balance: 10_000, fee: 0.10, visitorBurned: 0 });
  engineWithdraw.chooseRunAction("WITHDRAW");
  const sW = engineWithdraw.getState();
  assert(sW.runChoice === "WITHDRAW", "runChoice should be WITHDRAW");
  assert(sW.runRewardOrFeePaid === 1000, `Fee paid on 10,000 balance at 10% should be 1000, got ${sW.runRewardOrFeePaid}`);
  assert(sW.balance === 9000, `Balance after 1000 fee should be 9000, got ${sW.balance}`);
  assert(sW.visitorBurned === 500, `Visitor burned should be 50% of fee (500), got ${sW.visitorBurned}`);

  // Scenario B: Visitor tries to flip choice to STAY after WITHDRAW
  engineWithdraw.chooseRunAction("STAY");
  assert(engineWithdraw.getState().runChoice === "WITHDRAW", "Choice must be immutable and reject subsequent STAY call");
  assert(engineWithdraw.getState().balance === 9000, "Balance must not change on duplicate/rejected run action");

  // Scenario C: Visitor chooses STAY
  const engineStay = new SimEngine({ balance: 10_000 });
  engineStay.chooseRunAction("STAY");
  const sS = engineStay.getState();
  assert(sS.runChoice === "STAY", "runChoice should be STAY");
  assert(sS.runRewardOrFeePaid === 3214, "STAY reward should be 3214");
  assert(sS.balance === 13214, `Balance should increase to 13214, got ${sS.balance}`);
});

// ----------------------------------------------------------------------------
// TEST GROUP 7: GHOST REVOCATION 30-DAY BOUNTY & DILUTION REDUCTION
// ----------------------------------------------------------------------------
runTest("Ghost revocation 70% forfeit / 2% bounty mechanics and single-claim idempotency", () => {
  const engine = new SimEngine({
    balance: 10_000,
    totalNpcBranches: 400,
    stayersPot: 0,
    ghostsReported: 0,
  });

  const res1 = engine.reportGhost();
  assert(res1.bounty === 1000, `Bounty should be 1000 (2% of 50k), got ${res1.bounty}`);
  assert(res1.forfeited === 35000, `Forfeited should be 35,000 (70% of 50k), got ${res1.forfeited}`);
  
  const s1 = engine.getState();
  assert(s1.ghostsReported === 1, `ghostsReported should be 1, got ${s1.ghostsReported}`);
  assert(s1.balance === 11000, `Balance should be 11000, got ${s1.balance}`);
  assert(s1.totalNpcBranches === 380, `NPC branches should drop from 400 to 380, got ${s1.totalNpcBranches}`);
  assert(s1.stayersPot === 17500, `Stayers pot should receive 50% of forfeit (17,500), got ${s1.stayersPot}`);

  // Test repeat call (idempotency)
  const res2 = engine.reportGhost();
  assert(res2.bounty === 0, "Second reportGhost must return bounty = 0");
  assert(res2.forfeited === 0, "Second reportGhost must return forfeited = 0");
  const s2 = engine.getState();
  assert(s2.ghostsReported === 1, "ghostsReported should remain 1");
  assert(s2.balance === 11000, "Balance must not change on duplicate report");
  assert(s2.totalNpcBranches === 380, "NPC branches must not decrease further on duplicate report");
});

// ----------------------------------------------------------------------------
// TEST GROUP 8: PASSIVE ACCRUAL RATE FORMULA & PRO-RATA DILUTION
// ----------------------------------------------------------------------------
runTest("Passive accrual formula correctness across branch counts, multipliers, and dilution", () => {
  // Test unclaimed charter -> rate must be 0
  const engineUnclaimed = new SimEngine({ claimedCharter: false, branches: 0 });
  assert(engineUnclaimed.getAccrualRatePerSec() === 0, "Accrual rate must be 0 when charter is not claimed");

  // Test 1 branch, m=1.0, 400 total NPC branches
  // Formula: branches * 2.3 * m * (400 / (totalNpcBranches + branches))
  // = 1 * 2.3 * 1.0 * (400 / 401) ~ 2.294264
  const engineClaimed = new SimEngine({ claimedCharter: true, branches: 1, m: 1.0, totalNpcBranches: 400, balance: 100 });
  const rate1 = engineClaimed.getAccrualRatePerSec();
  const expectedRate1 = 1 * 2.3 * 1.0 * (400 / 401);
  assert(Math.abs(rate1 - expectedRate1) < 1e-6, `Accrual rate mismatch: ${rate1} vs ${expectedRate1}`);

  // Test 10 branches, m=4.0, 380 total NPC branches (ghost reported)
  // = 10 * 2.3 * 4.0 * (400 / (380 + 10)) = 92.0 * (400 / 390) ~ 94.35897
  const engineMax = new SimEngine({ claimedCharter: true, branches: 10, m: 4.0, totalNpcBranches: 380 });
  const rateMax = engineMax.getAccrualRatePerSec();
  const expectedRateMax = 10 * 2.3 * 4.0 * (400 / 390);
  assert(Math.abs(rateMax - expectedRateMax) < 1e-6, `Max accrual rate mismatch: ${rateMax} vs ${expectedRateMax}`);

  // Test accrual over deltaSec = 60s
  const bStart = engineMax.getState().balance;
  engineMax.accruePassive(60);
  const bEnd = engineMax.getState().balance;
  const expectedDelta = rateMax * 60;
  assert(Math.abs((bEnd - bStart) - expectedDelta) < 1e-4, `Balance accrual mismatch over 60s: ${bEnd - bStart} vs ${expectedDelta}`);
});

console.log("\n================================================================================");
console.log(`BOUNDARY TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log("================================================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
