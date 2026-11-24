import { expect, test } from "@playwright/test";

test("the production home route renders the accessible scaffold at this viewport", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("DevTrack");
  await expect(
    page.getByRole("main").getByRole("heading", { level: 1, name: "DevTrack" }),
  ).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
