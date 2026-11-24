import { expect, test, type Locator, type Page } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";
import { issueFixtureAccount } from "../fixtures/local-issues";

test.use({ trace: "off" });

async function tabTo(page: Page, control: Locator) {
  for (let index = 0; index < 36; index++) {
    await page.keyboard.press("Tab");
    if (await control.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(control).toBeFocused();
}

test("dashboard distinguishes empty and filtered results and remains keyboard-usable without overflow", async ({ page, isMobile }) => {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
  const api = localAuth();
  const credentials = makeAuthFixture();
  const { width, height } = isMobile ? { width: 320, height: 840 } : { width: 1280, height: 900 };
  try {
    await page.setViewportSize({ width, height });
    const { client, userId: user_id } = await issueFixtureAccount(credentials, api);
    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);

    const issues = page.getByRole("region", { name: "Your issues" });
    await expect(issues.getByText("You have no issues yet.")).toBeVisible();
    await expect(issues.getByText("No issues match these filters.")).toHaveCount(0);

    const title = "A".repeat(120);
    const seeded = await client.from("issues").insert({
      user_id, title, description: "B".repeat(1000), status: "todo",
    });
    expect(seeded.error).toBeNull();
    await page.reload();
    const card = issues.getByRole("article", { name: title, exact: true });
    await expect(card).toBeVisible();
    await expect(issues.getByText("You have no issues yet.")).toHaveCount(0);

    const columns = await Promise.all(["Todo", "In progress", "Done"].map(async (name) => {
      const region = issues.getByRole("region", { name, exact: true });
      await expect(region).toBeVisible();
      return region.boundingBox();
    }));
    expect(columns.every((box) => box && box.x >= 0 && box.x + box.width <= width)).toBe(true);
    if (!columns[0] || !columns[1]) throw new Error("Kanban columns have no visible bounds.");
    if (isMobile) expect(columns[1].y).toBeGreaterThan(columns[0].y);
    else expect(columns[1].x).toBeGreaterThan(columns[0].x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    const search = issues.getByRole("searchbox", { name: "Search issues" });
    await tabTo(page, search);
    expect(await search.evaluate((element) => {
      const style = getComputedStyle(element);
      return element.matches(":focus-visible") &&
        ((style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none");
    })).toBe(true);

    await search.pressSequentially("no result expected");
    await tabTo(page, issues.getByRole("button", { name: "Apply filters" }));
    await page.keyboard.press("Enter");
    await expect(issues.getByText("No issues match these filters.")).toBeVisible();
    await expect(issues.getByText("You have no issues yet.")).toHaveCount(0);
    await expect(card).toHaveCount(0);

    await tabTo(page, issues.getByRole("link", { name: "Clear filters" }));
    await page.keyboard.press("Enter");
    await expect(card).toBeVisible();
    const move = card.getByRole("combobox", { name: "Move issue to" });
    await tabTo(page, move);
    await expect(move).toHaveValue("todo");
  } finally {
    await api.cleanup(credentials.email);
  }
});
