import { test, expect } from "@playwright/test";
import type { GameTestHook } from "@/game/testHook";

test.describe("V2-01 Test Hook Contract & Deterministic State", () => {
  test("installs window.__game under ?test=1 with exact getState() shape and debug interface", async ({ page }) => {
    await page.goto("/?test=1&seed=5678");

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

    // Verify window.__game contract
    const hookResult = await page.evaluate(() => {
      const g = (window as unknown as { __game?: GameTestHook }).__game;
      if (!g) return { hasHook: false };

      const state = g.getState();

      // Test custom state provider registration
      g.registerState("gap", () => 180);
      g.registerState("patience", () => 95);
      const updatedState = g.getState();

      // Test debug registration and call
      g.debug.register("customPing", (val: unknown) => "pong-" + String(val));
      const debugList = g.debug.list();
      const callResult = g.debug.call("customPing", "run");

      // Test step
      g.step(100);
      const afterStepState = g.getState();

      return {
        hasHook: true,
        seed: g.seed,
        stateKeys: Object.keys(state).sort(),
        state,
        updatedGap: updatedState.gap,
        updatedPatience: updatedState.patience,
        debugList,
        callResult,
        afterStepTime: afterStepState.time,
      };
    });

    expect(hookResult.hasHook).toBe(true);
    expect(hookResult.seed).toBe("5678");
    expect(hookResult.stateKeys).toEqual([
      "chaser",
      "combo",
      "crowdMood",
      "fps",
      "gap",
      "hp",
      "maxHp",
      "npcCount",
      "patience",
      "time",
      "villain",
    ]);

    if (!hookResult.state) {
      throw new Error("hookResult.state is missing");
    }

    expect(hookResult.state.hp).toBe(1000);
    expect(hookResult.state.maxHp).toBe(1000);
    expect(hookResult.state.combo).toBe(0);
    expect(hookResult.state.crowdMood).toBeNull();
    expect(hookResult.state.npcCount).toBeNull();

    const villain = hookResult.state.villain;
    const chaser = hookResult.state.chaser;
    if (!villain || !chaser) {
      throw new Error("villain or chaser state missing");
    }

    expect(typeof villain.x).toBe("number");
    expect(typeof villain.y).toBe("number");
    expect([0, 1, 2]).toContain(villain.lane);

    expect(typeof chaser.x).toBe("number");
    expect(typeof chaser.y).toBe("number");
    expect([0, 1, 2]).toContain(chaser.lane);

    expect(hookResult.updatedGap).toBe(180);
    expect(hookResult.updatedPatience).toBe(95);

    expect(hookResult.debugList).toContain("customPing");
    expect(hookResult.callResult).toBe("pong-run");
  });

  test("does not install window.__game when ?test=1 is absent", async ({ page }) => {
    await page.goto("/");
    const hasHook = await page.evaluate(() => typeof (window as unknown as { __game?: unknown }).__game !== "undefined");
    expect(hasHook).toBe(false);
  });
});
