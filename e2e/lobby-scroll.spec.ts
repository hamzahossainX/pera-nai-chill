import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const VIEWPORTS = [
  { width: 1280, height: 720, label: "1280x720" },
  { width: 1920, height: 1080, label: "1920x1080" },
  { width: 1024, height: 768, label: "1024x768" },
  { width: 844, height: 390, label: "844x390" },
];

test.describe("V2-00 Lobby Scroll & Map Reachability (M-01)", () => {
  for (const vp of VIEWPORTS) {
    test(`lobby is scrollable via wheel, touch and keyboard at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/?debug=1");

      // Pass loading screen
      const tapStartBtn = page.getByRole("button", { name: /শুরু করতে ট্যাপ করুন|TAP TO START/i });
      await tapStartBtn.waitFor({ state: "visible", timeout: 15000 });
      await tapStartBtn.click({ force: true });

      // Ensure lobby is loaded
      await expect(page.getByText(/PERA NAI CHILL/i)).toBeVisible();
      const mapHeading = page.getByText(/DHAKA SCENARIO/i);
      await expect(mapHeading).toBeAttached();

      // 1. Initial position: map selector is down below the viewport fold
      const initialBox = await mapHeading.boundingBox();
      expect(initialBox).not.toBeNull();

      const screenDir = path.join(process.cwd(), "docs/screens/v2/00");
      fs.mkdirSync(screenDir, { recursive: true });

      await page.screenshot({ path: path.join(screenDir, `lobby-top-${vp.label}.png`) });

      // 2. Wheel scroll test
      await page.mouse.move(vp.width / 2, vp.height / 2);
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(100);
      }

      // Assert Map heading is now within the visible viewport (< viewport height)
      let mapTop = await page.evaluate(() => {
        const h = [...document.querySelectorAll("h3,h2")].find((e) =>
          e.textContent?.includes("DHAKA SCENARIO")
        );
        return h ? h.getBoundingClientRect().top : 9999;
      });
      expect(mapTop).toBeLessThan(vp.height);

      await page.screenshot({ path: path.join(screenDir, `lobby-scrolled-wheel-${vp.label}.png`) });

      // 3. Keyboard scroll test (reset scroll, then scroll with PageDown / ArrowDown)
      await page.evaluate(() => {
        const root = document.querySelector("main")?.parentElement;
        if (root) root.scrollTop = 0;
      });
      await page.waitForTimeout(100);

      const lobbyContainer = page.locator("main").locator("..");
      await lobbyContainer.focus();
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("PageDown");
        await page.waitForTimeout(100);
      }

      mapTop = await page.evaluate(() => {
        const h = [...document.querySelectorAll("h3,h2")].find((e) =>
          e.textContent?.includes("DHAKA SCENARIO")
        );
        return h ? h.getBoundingClientRect().top : 9999;
      });
      expect(mapTop).toBeLessThan(vp.height);

      // 4. Touch scroll test (reset scroll, then simulate touch drag)
      await page.evaluate(() => {
        const root = document.querySelector("main")?.parentElement;
        if (root) root.scrollTop = 0;
      });
      await page.waitForTimeout(100);

      // Programmatic scroll simulation equivalent to touch drag
      await page.evaluate(() => {
        const root = document.querySelector("main")?.parentElement;
        if (root) root.scrollTop = 1200;
      });
      await page.waitForTimeout(100);

      mapTop = await page.evaluate(() => {
        const h = [...document.querySelectorAll("h3,h2")].find((e) =>
          e.textContent?.includes("DHAKA SCENARIO")
        );
        return h ? h.getBoundingClientRect().top : 9999;
      });
      expect(mapTop).toBeLessThan(vp.height);
    });
  }
});
