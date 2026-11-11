/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const screensDir = path.join(__dirname, "../docs/screens");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  // 1. Desktop 1280x720
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto("http://localhost:3000/dev/characters", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screensDir, "after-characters-1280x720.png"), fullPage: true });
    console.log("Captured after-characters-1280x720.png");
    await page.close();
  }

  // 2. Mobile 390x844
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto("http://localhost:3000/dev/characters", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screensDir, "after-characters-390x844.png"), fullPage: true });
    console.log("Captured after-characters-390x844.png");
    await page.close();
  }

  // 3. Desktop with Skeleton ?rig=1
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto("http://localhost:3000/dev/characters?rig=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screensDir, "after-characters-rig.png"), fullPage: true });
    console.log("Captured after-characters-rig.png");
    await page.close();
  }

  await browser.close();
  console.log("Phase B screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
