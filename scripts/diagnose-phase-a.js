/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runDiagnosis() {
  const screensDir = path.join(__dirname, '..', 'docs', 'screens');
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const issuesLog = [];
  const interactionResults = {};

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
  });
  const page = await context.newPage();

  page.on('console', msg => {
    issuesLog.push({ source: 'console', type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    issuesLog.push({ source: 'pageerror', type: 'error', text: err.toString() });
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');

  // Wait for loading screen button to appear
  console.log('Waiting for start button on BOOT screen...');
  const startBtn = await page.waitForSelector(
    'button:has-text("TAP TO START"), button:has-text("Slow network"), button:has-text("Play anyway")',
    { timeout: 16000 }
  );
  console.log('Found loading screen button:', await startBtn.innerText());
  await startBtn.click();
  await page.waitForTimeout(1500);

  // Wait for Lobby
  await page.waitForSelector('text=PERA NAI CHILL', { timeout: 5000 });
  console.log('Entered LOBBY successfully!');

  // --- 1. LOBBY SCREENSHOTS ACROSS RESOLUTIONS ---
  // A. Desktop 1280x720
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screensDir, 'before-lobby-1280x720.png') });
  console.log('Saved before-lobby-1280x720.png');

  // Test Desktop scrolling
  const desktopScrollBefore = await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto') || document.documentElement;
    return { windowY: window.scrollY, elY: el.scrollTop };
  });
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  const desktopScrollAfter = await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto') || document.documentElement;
    return { windowY: window.scrollY, elY: el.scrollTop };
  });
  interactionResults['desktop_scroll_1280x720'] = {
    before: desktopScrollBefore,
    after: desktopScrollAfter,
    scrolled: desktopScrollAfter.elY > desktopScrollBefore.elY || desktopScrollAfter.windowY > desktopScrollBefore.windowY,
  };
  console.log('Desktop scroll result:', interactionResults['desktop_scroll_1280x720']);

  // Archetype & Map Selection Screenshot
  const selectionHeading = await page.$('text=VILLAIN ARCHETYPES');
  if (selectionHeading) {
    await selectionHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(screensDir, 'before-selection-1280x720.png') });
  console.log('Saved before-selection-1280x720.png');

  // Test Selection Click
  const archetypeCards = await page.$$('.snap-start');
  console.log(`Found ${archetypeCards.length} archetype snap-start cards`);
  if (archetypeCards.length > 1) {
    await archetypeCards[1].click();
    await page.waitForTimeout(400);
    interactionResults['archetype_selection_clicked'] = true;
  }

  // Shop Screenshot & Test
  const shopBtn = await page.$('button:has-text("দোকান / SHOP"), button:has-text("SHOP"), button:has-text("দোকান")');
  if (shopBtn) {
    await shopBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screensDir, 'before-shop-1280x720.png') });
    console.log('Saved before-shop-1280x720.png');

    // Test shop purchase
    const balBefore = await page.evaluate(() => {
      const el = document.querySelector('.fixed.inset-0 .font-mono');
      return el ? el.textContent : null;
    });

    // Close shop via DOM directly to avoid pointer event interception
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button.bg-rose-500');
      if (closeBtn) closeBtn.click();
    });
    console.log('Closed shop modal.');
    await page.waitForTimeout(600);
    interactionResults['shop_test'] = { balBefore };
  }

  // B. Desktop 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screensDir, 'before-lobby-1920x1080.png') });
  console.log('Saved before-lobby-1920x1080.png');

  // C. Mobile 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screensDir, 'before-lobby-390x844.png') });
  console.log('Saved before-lobby-390x844.png');

  // Test Mobile Touch Scrolling
  const mobileScrollBefore = await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto') || document.documentElement;
    return { windowY: window.scrollY, elY: el.scrollTop };
  });
  await page.touchscreen.tap(195, 400);
  await page.mouse.move(195, 600);
  await page.mouse.down();
  await page.mouse.move(195, 200, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const mobileScrollAfter = await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto') || document.documentElement;
    return { windowY: window.scrollY, elY: el.scrollTop };
  });
  interactionResults['mobile_scroll_390x844'] = {
    before: mobileScrollBefore,
    after: mobileScrollAfter,
    scrolled: mobileScrollAfter.elY > mobileScrollBefore.elY || mobileScrollAfter.windowY > mobileScrollBefore.windowY,
  };
  console.log('Mobile scroll result:', interactionResults['mobile_scroll_390x844']);

  // D. Mobile 360x640
  await page.setViewportSize({ width: 360, height: 640 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screensDir, 'before-lobby-360x640.png') });
  console.log('Saved before-lobby-360x640.png');

  // --- 2. RUNNING GAME SCREENSHOTS ACROSS RESOLUTIONS ---
  console.log('Starting run to capture gameplay screenshots...');
  await page.setViewportSize({ width: 1280, height: 720 });
  const startRunBtn = await page.waitForSelector('button:has-text("রাস্তায় নামাও (START RUN)"), button:has-text("START RUN")');
  await startRunBtn.click();

  // Wait for canvas to mount and render
  console.log('Waiting for Phaser canvas...');
  await page.waitForSelector('canvas', { timeout: 12000 });
  await page.waitForTimeout(4000); // Allow gameplay loop to run

  // Take Running Screenshots
  // A. Desktop 1280x720
  await page.screenshot({ path: path.join(screensDir, 'before-running-1280x720.png') });
  console.log('Saved before-running-1280x720.png');

  // B. Desktop 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'before-running-1920x1080.png') });
  console.log('Saved before-running-1920x1080.png');

  // C. Mobile 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'before-running-390x844.png') });
  console.log('Saved before-running-390x844.png');

  // D. Mobile 360x640
  await page.setViewportSize({ width: 360, height: 640 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screensDir, 'before-running-360x640.png') });
  console.log('Saved before-running-360x640.png');

  await browser.close();

  console.log('\n--- ALL SCREENSHOTS SUCCESSFULLY CAPTURED ---');
  fs.writeFileSync(
    path.join(__dirname, 'diagnosis-output.json'),
    JSON.stringify({ issuesLog, interactionResults }, null, 2)
  );
}

runDiagnosis().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
