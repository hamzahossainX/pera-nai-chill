/* eslint-disable */
// Audit repro script (2026-11-13). Run: NODE_PATH=$PWD/node_modules node scripts/audit/<file>.js  (dev server on :3000)
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = '' + require('path').join(__dirname, '..', '..', 'docs', 'audit', 'screens') + '';
fs.mkdirSync(OUT, { recursive: true });

const MAPS = [
  { id: 'mirpur', label: 'মিরপুর ১০' },
  { id: 'farmgate', label: 'ফার্মগেট' },
  { id: 'newmarket', label: 'নিউ মার্কেট' },
];

async function boot(page) {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const tap = await page.$('text=TAP TO START');
  if (tap) { await tap.click({ force: true }); await page.waitForTimeout(1200); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined, headless: true, args: ['--no-sandbox'] });
  const errors = [];

  // Lobby full page, desktop
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push('[lobby] ' + m.text().slice(0, 200)); });
    page.on('pageerror', (e) => errors.push('[lobby pageerror] ' + String(e).slice(0, 200)));
    await boot(page);
    await page.screenshot({ path: path.join(OUT, 'lobby-top-1280x720.png') });
    // scroll the lobby's scroll container to bottom in steps
    const info = await page.evaluate(() => {
      const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && getComputedStyle(e).overflowY !== 'visible');
      return els.map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 60), sh: e.scrollHeight, ch: e.clientHeight }));
    });
    console.log('scrollables', JSON.stringify(info));
    for (let i = 1; i <= 4; i++) {
      await page.evaluate((i) => {
        const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY));
        els.forEach(e => e.scrollTo(0, i * 600));
      }, i);
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `lobby-scroll${i}-1280x720.png`) });
    }
    await ctx.close();
  }

  // Gameplay per map, desktop
  for (const m of MAPS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[${m.id}] ` + msg.text().slice(0, 200)); });
    page.on('pageerror', (e) => errors.push(`[${m.id} pageerror] ` + String(e).slice(0, 200)));
    await boot(page);
    // select map card
    const card = await page.$(`text=${m.label}`);
    if (card) { await card.scrollIntoViewIfNeeded().catch(() => {}); await card.click({ force: true }).catch((e) => console.log('card click fail', m.id, String(e).slice(0, 80))); }
    await page.waitForTimeout(500);
    const start = await page.waitForSelector('button:has-text("START RUN"), button:has-text("রাস্তায় নামাও")', { timeout: 8000 });
    await start.click({ force: true });
    await page.waitForSelector('#phaser-container canvas', { timeout: 15000 });
    for (const t of [2500, 5000, 8000]) {
      await page.waitForTimeout(t === 2500 ? 2500 : t === 5000 ? 2500 : 3000);
      await page.screenshot({ path: path.join(OUT, `run-${m.id}-t${Math.round(t / 1000)}-1280x720.png`) });
    }
    // exercise combat keys then shot
    for (const k of ['1', '2', '3', '4']) { await page.keyboard.press(k); await page.waitForTimeout(250); }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `run-${m.id}-combat-1280x720.png`) });
    await ctx.close();
  }

  // Mobile portrait + 4:3 + ultrawide for framing
  for (const vp of [{ w: 390, h: 844, n: 'mobile-portrait' }, { w: 844, h: 390, n: 'mobile-landscape' }, { w: 1024, h: 768, n: 'ipad-4x3' }, { w: 2560, h: 1080, n: 'ultrawide' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.w < 900 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`[${vp.n} pageerror] ` + String(e).slice(0, 200)));
    await boot(page);
    await page.screenshot({ path: path.join(OUT, `lobby-${vp.n}.png`) });
    const start = await page.$('button:has-text("START RUN"), button:has-text("রাস্তায় নামাও")');
    if (start) { await start.click({ force: true }); await page.waitForTimeout(6000); await page.screenshot({ path: path.join(OUT, `run-${vp.n}.png`) }); }
    await ctx.close();
  }

  console.log('ERRORS', JSON.stringify([...new Set(errors)], null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
