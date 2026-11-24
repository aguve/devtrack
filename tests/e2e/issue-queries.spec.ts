import { expect, test } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";
import { issueFixtureAccount } from "../fixtures/local-issues";

test.use({ trace: "off" });

test("dashboard URL preserves literal search and intersecting filters, then clear restores results", async ({ page }) => {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
  const api = localAuth();
  const credentials = makeAuthFixture();
  try {
    const { client, userId: user_id } = await issueFixtureAccount(credentials, api);
    const seeded = await client.from("issues").insert([
      { user_id, title: "Audit %_", description: null, status: "todo", priority: "high" },
      { user_id, title: "Review checklist", description: "Perform AUDIT %_ sometimes.", status: "done", priority: "high" },
      { user_id, title: "Audit XY", description: null, status: "done", priority: "low" },
    ]);
    expect(seeded.error).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);
    await expect(page.getByRole("article")).toHaveCount(3);

    const search = page.getByRole("searchbox", { name: "Search issues" });
    const status = page.getByRole("combobox", { name: "Filter by status" });
    const priority = page.getByRole("combobox", { name: "Filter by priority" });
    const apply = page.getByRole("button", { name: "Apply filters" });
    await search.fill("AuDiT %_");
    await apply.click();
    await expect(page.getByRole("article")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Audit %_", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Audit XY", exact: true })).toHaveCount(0);

    await status.selectOption("done");
    await priority.selectOption("high");
    await apply.click();
    await expect(page.getByRole("article")).toHaveCount(1);
    const params = new URL(page.url()).searchParams;
    expect({ q: params.get("q"), status: params.get("status"), priority: params.get("priority") })
      .toEqual({ q: "AuDiT %_", status: "done", priority: "high" });
    await page.reload();
    await expect(search).toHaveValue("AuDiT %_");
    await expect(status).toHaveValue("done");
    await expect(priority).toHaveValue("high");
    await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible();

    await priority.selectOption("low");
    await apply.click();
    await expect(page.getByText("No issues match these filters.")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);

    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);
    await expect(page.getByRole("article")).toHaveCount(3);
    await expect(search).toHaveValue("");
    await expect(status).toHaveValue("");
    await expect(priority).toHaveValue("");

    const issues = page.getByRole("region", { name: "Your issues" });
    for (const query of ["status=todo&status=done", "priority=urgent", "q=%00", `q=${"x".repeat(121)}`]) {
      await page.goto(`/dashboard?${query}`);
      await expect(issues.getByRole("alert")).toHaveText("Check the search and filter values, then try again.");
      await expect(page.getByRole("article")).toHaveCount(0);
    }
  } finally {
    await api.cleanup(credentials.email);
  }
});
