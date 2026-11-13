import { test, expect } from "@playwright/test";
import type { GameTestHook } from "@/game/testHook";

test.describe("V2-04 GapSystem, Patience & Fail States", () => {
  test("state providers expose gap and patience, and mashing without dashing leads to patience_zero lose", async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.goto("/?test=1&seed=4444");

    // Bypass orientation guard if present
    const portraitBtn = page.getByRole("button", { name: /Play in portrait anyway/i });
    try {
      await portraitBtn.waitFor({ state: "visible", timeout: 2000 });
      await portraitBtn.click();
    } catch {}

    // Pass loading screen
    const tapStartBtn = page.getByRole("button", { name: /শুরু করতে ট্যাপ করুন|TAP TO START/i });
    await tapStartBtn.waitFor({ state: "visible", timeout: 15000 });
    await tapStartBtn.click({ force: true });

    try {
      await portraitBtn.waitFor({ state: "visible", timeout: 1000 });
      await portraitBtn.click();
    } catch {}

    // Start run
    const startRunBtn = page.getByRole("button", { name: /রাস্তায় নামাও|START RUN/i });
    await startRunBtn.waitFor({ state: "visible", timeout: 10000 });
    await startRunBtn.click({ force: true });

    // Wait for canvas and game initialization
    await expect(page.locator("#phaser-container canvas")).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g !== undefined && typeof g.getState().gap === "number" && g.getState().chaser !== null;
    }, { timeout: 10000 });

    // Verify getState() providers for gap and patience are non-null and accurate
    const state0 = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g ? g.getState() : null;
    });

    expect(state0).not.toBeNull();
    expect(typeof state0?.gap).toBe("number");
    expect(typeof state0?.patience).toBe("number");
    expect(state0?.patience).toBe(100);
    // Gap should be around 560 (MID zone)
    expect(state0?.gap).toBeGreaterThanOrEqual(500);
    expect(state0?.gap).toBeLessThanOrEqual(620);

    // 1. Mashing melee attacks in MID zone misses and drains patience
    for (let i = 0; i < 30; i++) {
      const isOver = await page.evaluate(() => {
        const g = (window as unknown as { __game?: GameTestHook }).__game;
        return g ? g.getState().patience === 0 : false;
      });
      if (isOver) break;

      await page.keyboard.press("Digit1");
      await page.evaluate(() => {
        const g = (window as unknown as { __game?: GameTestHook }).__game;
        g?.step(50);
      });
    }

    // Wait for patience to reach 0 and game over
    await page.waitForFunction(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g?.getState().patience === 0;
    }, { timeout: 10000 });

    const finalState = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g ? g.getState() : null;
    });
    expect(finalState?.patience).toBe(0);

    // Verify GameOverScreen is displayed with OUT OF PATIENCE badge
    const outOfPatienceBadge = page.getByText(/OUT OF PATIENCE!/i);
    await expect(outOfPatienceBadge).toBeVisible({ timeout: 5000 });
  });

  test("escape fail state triggers when gap >= 900 for 6 seconds", async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.goto("/?test=1&seed=5555");

    const portraitBtn = page.getByRole("button", { name: /Play in portrait anyway/i });
    try {
      await portraitBtn.waitFor({ state: "visible", timeout: 2000 });
      await portraitBtn.click();
    } catch {}

    const tapStartBtn = page.getByRole("button", { name: /শুরু করতে ট্যাপ করুন|TAP TO START/i });
    await tapStartBtn.waitFor({ state: "visible", timeout: 15000 });
    await tapStartBtn.click({ force: true });

    try {
      await portraitBtn.waitFor({ state: "visible", timeout: 1000 });
      await portraitBtn.click();
    } catch {}

    const startRunBtn = page.getByRole("button", { name: /রাস্তায় নামাও|START RUN/i });
    await startRunBtn.waitFor({ state: "visible", timeout: 10000 });
    await startRunBtn.click({ force: true });

    await expect(page.locator("#phaser-container canvas")).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g !== undefined && typeof g.getState().gap === "number" && g.getState().chaser !== null;
    }, { timeout: 10000 });

    // Set gap to 920 (ESCAPE zone) via debug test hook
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.debug.call("setGap", 920);
    });

    const gapState = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g?.getState();
    });
    expect(gapState?.gap).toBeGreaterThanOrEqual(900);

    // Step 6500ms in simulation time (exceeding 6000ms escape limit)
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(6500, 33.33);
    });

    // Verify GameOverScreen displays TARGET ESCAPED!
    const targetEscapedBadge = page.getByText(/TARGET ESCAPED!/i);
    await expect(targetEscapedBadge).toBeVisible({ timeout: 5000 });
  });
});
