import { test, expect } from "@playwright/test";
import type { GameTestHook } from "@/game/testHook";

test.describe("V2-03 Player Controls (lanes, dash, jump & TouchControls)", () => {
  test("chaser responds to keyboard and touch controls independently of villain lane (fixes G-02)", async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.goto("/?test=1&seed=7777");

    // Bypass orientation guard if present on portrait mobile
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

    // Wait for canvas
    await expect(page.locator("#phaser-container canvas")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Initial state check: chaser starts at middle lane (lane 1)
    const initialState = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g ? g.getState() : null;
    });

    expect(initialState).not.toBeNull();
    expect(initialState?.chaser?.lane).toBe(1);

    // 1. Test Keyboard Lane Down (KeyS / ArrowDown)
    await page.keyboard.press("KeyS");
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(200);
    });

    const laneDownState = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g?.getState();
    });
    expect(laneDownState?.chaser?.lane).toBe(2);

    // 2. Test Keyboard Lane Up twice (KeyW -> lane 1, then lane 0)
    await page.keyboard.press("KeyW");
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(200);
    });
    let state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.lane).toBe(1);

    await page.keyboard.press("KeyW");
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(200);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.lane).toBe(0);

    // 3. Test Jump (Space)
    await page.keyboard.press("Space");
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(100);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.isJumping).toBe(true);

    // Step through remainder of jump arc (500ms)
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(500);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.isJumping).toBe(false);

    // 4. Test Dash (Shift)
    await page.keyboard.press("Shift");
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(100);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.isDashing).toBe(true);

    // 5. Test On-Screen Touch Controls
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Lane Down"]') as HTMLButtonElement | null;
      if (!btn) return false;
      btn.click();
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.step(200);
      return true;
    });

    expect(clicked).toBe(true);
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.lane).toBe(1);

    // 6. Test Debug Helper Hook command
    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.debug.call("laneDown");
      g?.step(200);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.lane).toBe(2);

    await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      g?.debug.call("laneUp");
      g?.step(200);
    });
    state = await page.evaluate(() => (window as unknown as { __game?: GameTestHook }).__game?.getState());
    expect(state?.chaser?.lane).toBe(1);
  });
});
