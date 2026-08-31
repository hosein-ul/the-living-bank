const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Launching Puppeteer for TASK-BANK verification...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/local/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--in-process-gpu",
    ],
  });

  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", err => console.error("PAGE ERROR:", err));
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("Waiting for main selector...");
  await page.waitForSelector("main", { timeout: 20000 });
  console.log("Waiting for #chapter-1 selector...");
  await page.waitForSelector("#chapter-1", { timeout: 20000 });

  // Scroll to Chapter 1
  await page.evaluate(() => {
    const el = document.getElementById("chapter-1");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });

  console.log("Polling for Three.js canvas initialization...");
  let statsInit = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 400));
    statsInit = await page.evaluate(() => window.__THREE_STATS__);
    if (statsInit && statsInit.triangles > 0) {
      console.log(`Three.js ready on poll ${i}!`);
      break;
    }
  }

  // Get Chapter 1 element dimensions
  const chapter1Box = await page.evaluate(() => {
    const el = document.getElementById("chapter-1");
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: el.offsetHeight,
    };
  });

  console.log(`Chapter 1 top: ${chapter1Box.top}, height: ${chapter1Box.height}`);
  const scrollableDistance = chapter1Box.height - 900; // Total pin scroll distance

  const screenshotsDir = path.join(__dirname, "../screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Test 1: scroll = 0 (Start of Chapter 1)
  console.log("Scrolling to Chapter 1 progress = 0%...");
  await page.evaluate((top) => {
    window.scrollTo({ top: top, behavior: "instant" });
  }, chapter1Box.top);
  await new Promise((r) => setTimeout(r, 2000));

  const stats0 = await page.evaluate(() => window.__THREE_STATS__);
  console.log("Stats at scroll 0%:", stats0);
  const path0 = path.join(screenshotsDir, "task-bank-scroll-0.png");
  await page.screenshot({ path: path0 });
  console.log("Saved screenshot:", path0);

  // Test 2: scroll = 50% of Chapter 1
  console.log("Scrolling to Chapter 1 progress = 50%...");
  await page.evaluate((top, dist) => {
    window.scrollTo({ top: top + dist * 0.5, behavior: "instant" });
  }, chapter1Box.top, scrollableDistance);
  await new Promise((r) => setTimeout(r, 2000));

  const stats50 = await page.evaluate(() => window.__THREE_STATS__);
  console.log("Stats at scroll 50%:", stats50);
  const path50 = path.join(screenshotsDir, "task-bank-scroll-50.png");
  await page.screenshot({ path: path50 });
  console.log("Saved screenshot:", path50);

  // Test 3: scroll = 100% of Chapter 1
  console.log("Scrolling to Chapter 1 progress = 100%...");
  await page.evaluate((top, dist) => {
    window.scrollTo({ top: top + dist * 0.95, behavior: "instant" });
  }, chapter1Box.top, scrollableDistance);
  await new Promise((r) => setTimeout(r, 2000));

  const stats100 = await page.evaluate(() => window.__THREE_STATS__);
  console.log("Stats at scroll 100%:", stats100);
  const path100 = path.join(screenshotsDir, "task-bank-scroll-100.png");
  await page.screenshot({ path: path100 });
  console.log("Saved screenshot:", path100);

  console.log("\n==============================================");
  console.log("FINAL SCENE STATS TELEMETRY READBACK:");
  console.log(JSON.stringify(stats0 || stats50 || stats100, null, 2));
  console.log("==============================================\n");

  await browser.close();
  console.log("Verification complete!");
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
