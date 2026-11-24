import { expect, test } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";
import { issueFixtureAccount } from "../fixtures/local-issues";

test.use({ trace: "off" });

test("board groups cards by status and saves keyboard and pointer moves", async ({ page }) => {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
  const api = localAuth();
  const credentials = makeAuthFixture();
  const title = "Untangle release task";
  try {
    const { client, userId: user_id } = await issueFixtureAccount(credentials, api);
    const seeded = await client.from("issues").insert([
      { user_id, title, status: "todo" },
      { user_id, title: "Review build", status: "in_progress" },
      { user_id, title: "Ship docs", status: "done" },
    ]);
    expect(seeded.error).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);

    const todo = page.getByRole("region", { name: "Todo", exact: true });
    const active = page.getByRole("region", { name: "In progress", exact: true });
    const done = page.getByRole("region", { name: "Done", exact: true });
    await expect(todo.getByRole("article")).toHaveCount(1);
    await expect(active.getByRole("article")).toHaveCount(1);
    await expect(done.getByRole("article")).toHaveCount(1);
    await expect(todo.getByRole("article", { name: title, exact: true })).toBeVisible();
    await expect(active.getByRole("article", { name: "Review build", exact: true })).toBeVisible();
    await expect(done.getByRole("article", { name: "Ship docs", exact: true })).toBeVisible();

    const card = page.getByRole("article", { name: title, exact: true });
    const moveSelect = card.getByRole("combobox", { name: "Move issue to" });
    const moveButton = card.getByRole("button", { name: "Move issue", exact: true });
    await moveSelect.focus();
    await page.keyboard.press("End");
    await expect(moveSelect).toHaveValue("done");
    await page.keyboard.press("Tab");
    await expect(moveButton).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(done.getByRole("article", { name: title, exact: true })).toBeVisible();
    await expect(card.getByRole("heading", { name: title, exact: true })).toBeFocused();
    await expect(todo.getByRole("article", { name: title, exact: true })).toHaveCount(0);
    await expect(card).toHaveCount(1);
    await page.reload();
    await expect(done.getByRole("article", { name: title, exact: true })).toBeVisible();

    await moveSelect.selectOption("in_progress");
    await moveButton.click();
    await expect(active.getByRole("article", { name: title, exact: true })).toBeVisible();
    await expect(done.getByRole("article", { name: title, exact: true })).toHaveCount(0);
    await expect(card).toHaveCount(1);
    await page.reload();
    await expect(active.getByRole("article", { name: title, exact: true })).toBeVisible();
    await expect(card).toHaveCount(1);
  } finally {
    await api.cleanup(credentials.email);
  }
});
