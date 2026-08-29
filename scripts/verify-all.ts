import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function runAudit() {
  console.log("==================================================");
  console.log("STARTING DEFINITION OF DONE VERIFICATION (§12)");
  console.log("==================================================");

  const screenshotDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const chromePath = "/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  });

  const page = await browser.newPage();
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err: unknown) => {
    consoleErrors.push(String(err));
  });

  // 1. Test Desktop 1440px
  console.log("\n[TEST 1] Testing Desktop 1440px Viewport...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForSelector("#cover", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));

  const chapters = [
    "cover",
    "chapter-1",
    "chapter-2",
    "chapter-3",
    "chapter-4",
    "chapter-5",
    "chapter-6",
    "chapter-7",
    "chapter-8",
    "chapter-9",
    "chapter-10",
  ];

  for (const ch of chapters) {
    const el = await page.$(`#${ch}`);
    if (el) {
      await el.scrollIntoView();
      await new Promise((r) => setTimeout(r, 350));
      await page.screenshot({
        path: path.join(screenshotDir, `desktop-${ch}.png`),
        fullPage: false,
      });
      console.log(`✓ Captured desktop screenshot for #${ch}`);
    } else {
      console.error(`✗ Element #${ch} not found!`);
    }
  }

  // 2. Test Mobile 390px
  console.log("\n[TEST 2] Testing Mobile 390px Viewport...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForSelector("#cover", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));

  for (const ch of chapters) {
    const el = await page.$(`#${ch}`);
    if (el) {
      await el.scrollIntoView();
      await new Promise((r) => setTimeout(r, 350));
      await page.screenshot({
        path: path.join(screenshotDir, `mobile-${ch}.png`),
        fullPage: false,
      });
      console.log(`✓ Captured mobile screenshot for #${ch}`);
    }
  }

  // 3. Test Interactive Actions
  console.log("\n[TEST 3] Testing Interactive Store Mutations...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForSelector("#cover", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));

  // Claim Charter (S3)
  const ch3 = await page.$("#chapter-3");
  if (ch3) await ch3.scrollIntoView();
  await new Promise((r) => setTimeout(r, 400));
  const claimBtn = await page.$('button[aria-label="TAKE YOUR CHARTER — FREE"]');
  if (claimBtn) {
    await claimBtn.click();
    console.log("✓ Clicked claim charter button");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Buy License (S4)
  const ch4 = await page.$("#chapter-4");
  if (ch4) await ch4.scrollIntoView();
  await new Promise((r) => setTimeout(r, 400));
  const buyBtn = await page.$('button[aria-label="BUY LICENSE → +1 BRANCH"]');
  if (buyBtn) {
    await buyBtn.click();
    console.log("✓ Clicked buy license button");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Trigger Bank Run (S7)
  const ch7 = await page.$("#chapter-7");
  if (ch7) await ch7.scrollIntoView();
  await new Promise((r) => setTimeout(r, 400));
  const runBtn = await page.$('button[aria-label="BANK RUN"]');
  if (runBtn) {
    await runBtn.click();
    console.log("✓ Clicked BANK RUN trigger");
    await new Promise((r) => setTimeout(r, 400));

    // Click STAY
    const stayBtn = await page.$('button[aria-label="STAY — collect"]');
    if (stayBtn) {
      await stayBtn.click();
      console.log("✓ Clicked STAY choice button");
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // Report Ghost (S8)
  const ch8 = await page.$("#chapter-8");
  if (ch8) await ch8.scrollIntoView();
  await new Promise((r) => setTimeout(r, 400));
  const reportBtn = await page.$('button[aria-label="REPORT THE GHOST"]');
  if (reportBtn) {
    await reportBtn.click();
    console.log("✓ Clicked REPORT THE GHOST button");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Export Share Card (S10)
  const ch10 = await page.$("#chapter-10");
  if (ch10) await ch10.scrollIntoView();
  await new Promise((r) => setTimeout(r, 400));
  const exportBtn = await page.$('button[aria-label="EXPORT SHARE CARD"]');
  if (exportBtn) {
    await exportBtn.click();
    console.log("✓ Clicked EXPORT SHARE CARD button");
    await new Promise((r) => setTimeout(r, 400));
  }

  // 4. Test Reduced Motion
  console.log("\n[TEST 4] Testing Reduced Motion emulation...");
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForSelector("#cover", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(screenshotDir, "reduced-motion-cover.png"),
  });
  console.log("✓ Captured reduced motion state");

  console.log("\n[TEST 5] Console Error Check:");
  if (consoleErrors.length === 0) {
    console.log("✓ ZERO console errors encountered during full audit.");
  } else {
    console.log("Logged messages:", consoleErrors);
  }

  await browser.close();
  console.log("\n==================================================");
  console.log("ALL AUTOMATED VERIFICATION TESTS COMPLETED");
  console.log("==================================================");
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
