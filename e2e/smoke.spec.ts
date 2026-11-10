import { test, expect } from "@playwright/test";

test.describe("Pera Nai Chill Game Smoke Test", () => {
  test("loads the game and displays lobby and HUD controls", async ({ page }) => {
    // 1. Visit root page
    await page.goto("/?debug=1");

    // 2. Expect title
    await expect(page).toHaveTitle(/Pera Nai Chill/);

    // 3. Wait for tap to start or progress
    const tapStartBtn = page.getByRole("button", { name: /শুরু করতে ট্যাপ করুন|TAP TO START/i });
    if (await tapStartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tapStartBtn.click();
    }

    // 4. Verify Lobby components render
    await expect(page.getByText(/PERA NAI CHILL/i)).toBeVisible();
    await expect(page.getByText(/লবি কন্ট্রোল|START RUN|রাস্তায় নামাও/i)).toBeVisible();

    // 5. Start game
    const startRunBtn = page.getByRole("button", { name: /রাস্তায় নামাও|START RUN/i });
    if (await startRunBtn.isVisible().catch(() => false)) {
      await startRunBtn.click();
    }

    // 6. Verify Game Canvas & HUD are mounted
    await expect(page.locator("#phaser-container canvas")).toBeVisible({ timeout: 10000 });

    // 7. Verify debug panel functions without crashes
    const debugBtn = page.getByRole("button", { name: /Debug/i });
    if (await debugBtn.isVisible().catch(() => false)) {
      await debugBtn.click();
      await expect(page.getByText(/God Mode Debug/i)).toBeVisible();
    }
  });
});
