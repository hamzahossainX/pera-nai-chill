import { test, expect } from "@playwright/test";

test.describe("Settings integration", () => {
  test("switches language and mutes sound through the real settings store", async ({
    page,
  }) => {
    await page.goto("/");
    const tapStart = page.getByRole("button", { name: /শুরু করুন|TAP TO START/i });
    await tapStart.waitFor({ state: "visible", timeout: 10000 });
    await tapStart.click({ force: true });

    await page.getByTitle("Settings").click();
    await expect(page.getByRole("heading", { name: "সেটিংস" })).toBeVisible();

    await page.getByRole("button", { name: "ভাষা" }).click();
    await expect(page.getByRole("heading", { name: "SETTINGS" })).toBeVisible();

    const soundToggle = page.getByRole("button", { name: "Sound" });
    await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("button", { name: "Language" }).click();
    await expect(page.getByRole("heading", { name: "সেটিংস" })).toBeVisible();
    await page.getByRole("button", { name: "বন্ধ করুন" }).click();
    await page.reload();
    const reloadTapStart = page.getByRole("button", {
      name: /শুরু করুন|TAP TO START/i,
    });
    await reloadTapStart.waitFor({ state: "visible", timeout: 10000 });
    await reloadTapStart.click({ force: true });
    await page.getByTitle("Settings").click();
    await expect(page.getByRole("button", { name: "সাউন্ড" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
