const puppeteer = require("puppeteer");

async function main() {
  console.log("Launching puppeteer...");
  const chromePath = "/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  });
  console.log("Browser launched!");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  console.log("Navigating to http://127.0.0.1:3000 with commit...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "commit" });
  console.log("Connected! Waiting for body selector...");
  await page.waitForSelector("main", { timeout: 15000 });
  console.log("Main rendered!");
  await page.screenshot({ path: "screenshots/desktop-cover.png" });
  console.log("Screenshot taken successfully!");
  await browser.close();
  console.log("Done!");
}

main().catch(console.error);
