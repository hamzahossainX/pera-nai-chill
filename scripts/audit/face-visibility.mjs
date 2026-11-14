import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
const out='docs/screens/face-visibility-2026-11-14';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PW_CHROME,headless:true});
try {
 for(const [width,height] of [[1280,720],[844,390]]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:3001/?test=1&seed=1234');
  await page.getByRole('button',{name:/TAP TO START/}).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button',{name:/রাস্তায় নামুন/}).click();
  await expect(page.locator('#phaser-container canvas')).toBeVisible();
  await page.waitForFunction(()=>window.__game?.getState().villain);
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/${width}x${height}-full-health.png`});
  await context.close();
 }
} finally {await browser.close();}
