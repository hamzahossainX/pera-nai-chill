import { test, expect } from "@playwright/test";

test.describe("Lobby navigation", () => {
  test("reaches the map selector by wheel scrolling", async ({ page }) => {
    await page.goto("/");

    const tapStartBtn = page.getByRole("button", { name: /শুরু করুন|TAP TO START/i });
    await tapStartBtn.waitFor({ state: "visible", timeout: 10000 });
    await tapStartBtn.click({ force: true });

    const mapHeading = page.getByRole("heading", {
      name: /DHAKA SCENARIO/i,
    });
    await expect(mapHeading).toBeAttached();

    const initialTop = await mapHeading.evaluate((element) => element.getBoundingClientRect().top);
    await page.mouse.move((page.viewportSize()?.width ?? 1280) / 2, (page.viewportSize()?.height ?? 720) / 2);
    await page.mouse.wheel(0, 1400);

    await expect
      .poll(() => mapHeading.evaluate((element) => element.getBoundingClientRect().top))
      .toBeLessThan(page.viewportSize()?.height ?? 720);

    const finalTop = await mapHeading.evaluate((element) => element.getBoundingClientRect().top);
    expect(finalTop).toBeLessThan(initialTop);
  });
});
