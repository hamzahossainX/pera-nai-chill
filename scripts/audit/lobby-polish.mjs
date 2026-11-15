// Run with the frontend dev server on :3001. PW_CHROME selects an installed browser.
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
(async () => {
 const out = path.resolve('docs/screens/lobby-polish-2026-11-14', process.env.REVIEW_ROUND || 'round-1');
 fs.mkdirSync(out, { recursive: true });
 const browser = await chromium.launch({ executablePath: process.env.PW_CHROME, headless: true });
 const results = [];
 try {
 for (const [width,height] of [[1280,720],[844,390],[1024,768],[390,844],[1920,1080]]) {
  const context = await browser.newContext({viewport:{width,height}, reducedMotion:'reduce'});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3001/?test=1&seed=1234');
  await page.getByRole('button', {name:/TAP TO START/}).focus({timeout:60000});
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'মুখের ছবি দিন। রুট ঠিক করুন।'})).toBeVisible();
  await expect(page.getByText('PLEASE ROTATE DEVICE')).toHaveCount(0);
  await expect(page.getByRole('heading', {name:'মুখের ছবি', exact:true})).toBeVisible();
  expect(await page.locator('main').evaluate(e => [...e.querySelectorAll('h2,h3')][0].textContent.trim())).toBe('মুখের ছবি');
  await page.screenshot({path:`${out}/${width}x${height}.png`});
  const geometry = await page.evaluate(() => ({
   overflow: document.documentElement.scrollWidth > innerWidth,
   smallControls: [...document.querySelectorAll('main button, header button, footer button, summary')].filter(e => e.getClientRects().length).filter(e => {const r=e.getBoundingClientRect();return r.width<48||r.height<48;}).map(e=>e.textContent),
  }));
  expect(geometry.overflow).toBe(false); expect(geometry.smallControls).toEqual([]);
  const routes = page.locator('.route-choices button');
  await routes.nth(1).click();
  await expect(routes.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('footer p')).toContainText('ফার্মগেট');
  await page.locator('.villain-choices button').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.villain-choices button').nth(1)).toHaveAttribute('aria-pressed','true');
  await page.locator('summary').filter({hasText:'নাম, সময়'}).click();
  await page.getByLabel('ভিলেনের নাম:').fill('ফ্র ক্ষ র‍্যা');
  expect(await page.evaluate(() => document.querySelector('main').scrollWidth <= document.querySelector('main').clientWidth)).toBe(true);
  await page.getByRole('button',{name:'বর্ষা',exact:true}).click();
  await expect(page.getByRole('button',{name:'বর্ষা',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator('summary').filter({hasText:'নাম, সময়'}).click();
  await page.locator('summary').filter({hasText:'নিজের মতো সাজান'}).click();
  await expect(page.getByRole('heading',{name:'মুখের ছবি',exact:true})).toBeVisible();
  const chappal=page.getByRole('button').filter({hasText:'DMG'}).last();
  await chappal.focus();
  await page.keyboard.press('Enter');
  const b=await chappal.boundingBox(); const footer=await page.locator('footer').boundingBox();
  expect(b.y+b.height).toBeLessThanOrEqual(footer.y);
  await page.screenshot({path:`${out}/${width}x${height}-extras.png`});
  await page.getByRole('button',{name:/রাস্তায় নামুন/}).click();
  await expect(page.locator('#phaser-container canvas')).toBeVisible({timeout:30000});
  if(width===390) await expect(page.getByText('PLEASE ROTATE DEVICE')).toBeVisible();
  results.push({width,height,...geometry,launch:true});
  await context.close();
 }
 } finally {await browser.close(); fs.writeFileSync(`${out}/checks.json`,JSON.stringify(results,null,2));}
 console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
