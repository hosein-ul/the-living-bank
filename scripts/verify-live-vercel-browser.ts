import puppeteer, { Browser } from "puppeteer";
import fs from "fs";

async function main() {
  console.log("================================================================================");
  console.log("TESTING LIVE VERCEL DEPLOYMENT VIA HEADLESS PUPPETEER");
  console.log("URL: https://bank-jet-tau.vercel.app");
  console.log("================================================================================");

  const chromePath = "/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
  const browser: Browser = await puppeteer.launch({
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
  page.on("pageerror", (err) => {
    consoleErrors.push(String(err));
  });

  try {
    console.log("Navigating to https://bank-jet-tau.vercel.app...");
    const response = await page.goto("https://bank-jet-tau.vercel.app", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log(`Page HTTP Status: ${response?.status()}`);
    if (response?.status() !== 200) {
      throw new Error(`Expected HTTP status 200, got ${response?.status()}`);
    }

    // Wait for cover selector
    await page.waitForSelector("#cover", { timeout: 15000 });
    console.log("✓ Found #cover root container");

    // Check chapters exist
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
      if (!el) {
        throw new Error(`Missing chapter element #${ch} on live site`);
      }
    }
    console.log("✓ All 11 chapter DOM sections present");

    // Check ticker text in DOM
    const hasTicker = await page.evaluate(() => {
      return document.body.innerText.includes("$STANDARD");
    });
    if (!hasTicker) {
      throw new Error("Missing $STANDARD ticker in live DOM text");
    }
    console.log("✓ $STANDARD ticker verified in live DOM");

    // Scroll through page to trigger scroll observers & animations
    for (const ch of chapters) {
      const el = await page.$(`#${ch}`);
      if (el) {
        await el.scrollIntoView();
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    console.log("✓ Scrolled through all 11 chapters cleanly");

    // Verify 0 uncaught console errors (ignoring headless Three.js WebGL fallback)
    const cleanErrors = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("THREE.WebGLRenderer") &&
        !e.includes("WebGL context")
    );
    if (cleanErrors.length > 0) {
      throw new Error(`Uncaught console errors on live site: ${cleanErrors.join("; ")}`);
    }
    console.log("✓ ZERO uncaught console errors or exceptions on live Vercel deployment");

    console.log("\n================================================================================");
    console.log("LIVE VERCEL PUPPETEER AUDIT: 100% SUCCESS");
    console.log("================================================================================");
    process.exit(0);
  } catch (err: any) {
    console.error("Live audit failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
