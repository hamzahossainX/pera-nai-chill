import { test, expect } from "@playwright/test";
import type { GameTestHook } from "@/game/testHook";

test.describe("V2-02 Knockback Drift Fix & EntityMotion Bounds (fixes C-01)", () => {
  test("60 seconds of continuous attacks keeps villain & chaser strictly within x in [0, 1280]", async ({
    page,
  }) => {
    test.setTimeout(180000);

    await page.goto("/?test=1&seed=9999");

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

    // Wait for canvas and scene initialization
    await expect(page.locator("#phaser-container canvas")).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      return g !== undefined && g.getState().chaser !== null && g.getState().villain !== null;
    }, { timeout: 10000 });

    // Run 60 seconds (60,000 ms) of continuous attacks using fixed step
    const result = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      if (!g) return { error: "No __game hook" };

      // Ensure villain has plenty of HP and patience so the run doesn't end mid-test
      g.debug.call("setHealth", 99999);
      g.debug.call("drainPatience", -99999);

      const t0 = performance.now();
      let minVillainX = Infinity;
      let maxVillainX = -Infinity;
      let minChaserX = Infinity;
      let maxChaserX = -Infinity;

      // 60 seconds simulated in 60 intervals of 1000ms
      const weapons = ["chappal", "punch", "kick", "banana"];
      for (let sec = 0; sec < 60; sec++) {
        const weapon = weapons[sec % weapons.length];
        g.debug.call("attack", weapon);

        // Step 1000ms with 33.33ms fixed dt
        g.step(1000, 33.33);

        const state = g.getState();
        if (state.villain) {
          minVillainX = Math.min(minVillainX, state.villain.x);
          maxVillainX = Math.max(maxVillainX, state.villain.x);
        }
        if (state.chaser) {
          minChaserX = Math.min(minChaserX, state.chaser.x);
          maxChaserX = Math.max(maxChaserX, state.chaser.x);
        }
      }

      const elapsed = performance.now() - t0;
      const finalState = g.getState();
      return {
        success: true,
        elapsed,
        minVillainX,
        maxVillainX,
        minChaserX,
        maxChaserX,
        finalVillainX: finalState.villain?.x,
        finalChaserX: finalState.chaser?.x,
      };
    });

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);

    // Bounds check: both entities must stay strictly within [0, 1280]
    expect(result.minVillainX).toBeGreaterThanOrEqual(0);
    expect(result.maxVillainX).toBeLessThanOrEqual(1280);

    expect(result.minChaserX).toBeGreaterThanOrEqual(0);
    expect(result.maxChaserX).toBeLessThanOrEqual(1280);

    // Proof against knockback drift: villain must remain within arena bounds and not drift offscreen (1220+)
    expect(result.finalVillainX).toBeGreaterThanOrEqual(600);
    expect(result.finalVillainX).toBeLessThanOrEqual(1220);

    // Chaser must remain within arena bounds and behind villain
    expect(result.finalChaserX).toBeGreaterThanOrEqual(120);
    expect(result.finalChaserX).toBeLessThanOrEqual(result.finalVillainX!);
  });
});
