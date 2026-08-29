
import puppeteer from "puppeteer";
import fs from "fs";

async function check404() {
  const chromePath = "/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--single-process"],
  });
  const page = await browser.newPage();
  page.on("response", (res) => {
    if (res.status() >= 400) {
      console.log(`HTTP ${res.status()}: ${res.url()}`);
    }
  });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0" });
  await browser.close();
}
check404();
