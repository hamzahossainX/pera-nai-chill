/* eslint-disable */
// Audit repro script (2026-11-13). Run: NODE_PATH=$PWD/node_modules node scripts/audit/<file>.js  (dev server on :3000)
const { chromium } = require('@playwright/test');
const P = process.env.PW_CHROME || undefined; // set PW_CHROME to a GPU-capable Chrome binary
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined, headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const tap = await page.$('text=TAP TO START');
  if (tap) { await tap.click({ force: true }); await page.waitForTimeout(1200); }
  const start = await page.waitForSelector('button:has-text("START RUN"), button:has-text("রাস্তায় নামাও")');
  await start.click({ force: true });
  await page.waitForSelector('#phaser-container canvas');
  await page.waitForTimeout(3000);
  const hp = async () => (await page.evaluate(() => (document.body.innerText.match(/(\d+)\s*\/\s*(\d+)/) || [])[0]));
  const fps = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 2000) r(n / 2); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('rAF fps in headless:', fps);
  console.log('start hp', await hp());
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press(String((i % 3) + 1));
    await page.waitForTimeout(900);
    console.log('press', (i % 3) + 1, 'hp', await hp());
  }
  // click the dock button instead
  const btn = await page.$('button:has-text("15")');
  console.log('dock btn found', !!btn);
  if (btn) { for (let i = 0; i < 5; i++) { await btn.click({ force: true }); await page.waitForTimeout(700); console.log('click hp', await hp()); } }
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
