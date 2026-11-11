/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function capture() {
  const screensDir = path.join(__dirname, '..', 'docs', 'screens');
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check if Boot/Loading screen is present
  const tapToStart = await page.$('text=TAP TO START');
  if (tapToStart) {
    console.log("Found TAP TO START, clicking with force: true...");
    await tapToStart.click({ force: true });
    await page.waitForTimeout(1000);
  } else {
    try {
      const btn = await page.waitForSelector('text=TAP TO START', { timeout: 3500 });
      if (btn) {
        console.log("Found TAP TO START after wait, clicking with force: true...");
        await btn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    } catch {
      console.log("Not on loading screen or already past it");
    }
  }

  // Now in Lobby, click Start Run
  console.log("Looking for START RUN button...");
  const startRunBtn = await page.waitForSelector('button:has-text("START RUN"), button:has-text("রাস্তায় নামাও")', { timeout: 8000 });
  await startRunBtn.click({ force: true });
  console.log("Clicked START RUN!");

  // Wait for canvas to mount and render
  console.log("Waiting for Phaser canvas...");
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(3000); // Allow gameplay loop to run

  // 1. Desktop 1280x720
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'after-running-1280x720.png') });
  console.log('Saved after-running-1280x720.png');

  // 2. Desktop 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'after-running-1920x1080.png') });
  console.log('Saved after-running-1920x1080.png');

  // 3. Mobile 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'after-running-390x844.png') });
  console.log('Saved after-running-390x844.png');

  // 4. Mobile 360x640
  await page.setViewportSize({ width: 360, height: 640 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'after-running-360x640.png') });
  console.log('Saved after-running-360x640.png');

  await browser.close();
  console.log('Phase C screenshots captured successfully!');
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
