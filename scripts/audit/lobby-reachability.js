/* eslint-disable */
// Audit repro script (2026-11-13). Run: NODE_PATH=$PWD/node_modules node scripts/audit/<file>.js  (dev server on :3000)
const { chromium } = require('@playwright/test');
const P = process.env.PW_CHROME || undefined; // set PW_CHROME to a GPU-capable Chrome binary
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined, headless: true, args: ['--no-sandbox'] });
  for (const vp of [{ w: 1280, h: 720 }, { w: 1920, h: 1080 }, { w: 844, h: 390 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const tap = await page.$('text=TAP TO START');
    if (tap) { await tap.click({ force: true }); await page.waitForTimeout(1200); }
    const r = await page.evaluate(async () => {
      const find = (t) => [...document.querySelectorAll('h3,h2')].find((e) => e.textContent.includes(t));
      const map = find('DHAKA SCENARIO');
      const before = map ? map.getBoundingClientRect().top : null;
      const root = document.querySelector('main')?.parentElement;
      return { innerH: innerHeight, mapTopBefore: before, rootClientH: root?.clientHeight, rootScrollH: root?.scrollHeight, rootOverflowY: root && getComputedStyle(root).overflowY, bodyScrollTop: document.body.scrollTop, docScrollTop: document.scrollingElement.scrollTop };
    });
    await page.mouse.move(vp.w / 2, vp.h / 2);
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(150); }
    const after = await page.evaluate(() => {
      const map = [...document.querySelectorAll('h3,h2')].find((e) => e.textContent.includes('DHAKA SCENARIO'));
      const root = document.querySelector('main')?.parentElement;
      return { mapTopAfter: map ? map.getBoundingClientRect().top : null, rootScrollTop: root?.scrollTop, bodyScrollTop: document.body.scrollTop, docScrollTop: document.scrollingElement.scrollTop, innerH: innerHeight };
    });
    console.log(vp.w + 'x' + vp.h, JSON.stringify(r), JSON.stringify(after));
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
