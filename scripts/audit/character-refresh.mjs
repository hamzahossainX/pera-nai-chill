import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
const out=`docs/screens/character-refresh-2026-11-15/${process.env.REVIEW_ROUND || 'final'}`;
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PW_CHROME,headless:true});
try {
 for(const [width,height] of [[1280,720],[1024,768],[844,390]]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  if (process.env.BLOCK_CHARACTER_ART) {
    await context.route('**/assets/characters/{chaser,phoneSnatcher}/**', route => route.abort());
  }
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:3001/?test=1&seed=1234');
  await page.getByRole('button',{name:/TAP TO START/}).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button',{name:/রাস্তায় নামুন/}).click();
  await expect(page.locator('#phaser-container canvas')).toBeVisible();
  await page.waitForFunction(()=>window.__game?.getState().villain);
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/${width}x${height}-full-health.png`});
  for (let frame=0;frame<6;frame++) {
    await page.waitForTimeout(100);
    await page.screenshot({path:`${out}/${width}x${height}-run-${frame}.png`});
  }
  if (width === 1280) {
    for (const weapon of ['punch','kick']) {
      await page.evaluate(weapon => window.__game.debug.call('attack', weapon), weapon);
      await page.waitForTimeout(80);
      await page.screenshot({path:`${out}/${width}x${height}-${weapon}.png`});
      await page.waitForTimeout(400);
    }
    await page.evaluate(()=>window.__game.debug.call('jump'));
    await page.waitForTimeout(150);
    await page.screenshot({path:`${out}/${width}x${height}-jump.png`});
  }
  await context.close();
 }
} finally {await browser.close();}
