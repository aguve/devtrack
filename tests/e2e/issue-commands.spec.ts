import { expect, test, type Page } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";

test.use({ trace: "off" });

function setup() {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
  return localAuth();
}

async function signIn(page: Page, { email, password }: ReturnType<typeof makeAuthFixture>) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(`${appOrigin}/dashboard`);
}

function issueCard(page: Page, title: string) {
  return page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
}

async function createIssue(page: Page, title: string) {
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Create issue", exact: true }).click();
  await expect(issueCard(page, title)).toBeVisible();
}

test("owners can create, edit, cancel deletion, and delete an issue with persisted results", async ({ page, browser }) => {
  const api = setup();
  const owner = makeAuthFixture();
  const other = makeAuthFixture();
  const title = "Investigate failed build";
  const amendedTitle = "Investigate queued build";
  try {
    await api.createConfirmedUser(owner);
    await api.createConfirmedUser(other);
    await signIn(page, owner);
    await createIssue(page, title);
    await page.reload();
    await expect(issueCard(page, title)).toBeVisible();

    const otherContext = await browser.newContext({ baseURL: appOrigin });
    try {
      const otherPage = await otherContext.newPage();
      await signIn(otherPage, other);
      await expect(otherPage.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
      await expect(issueCard(otherPage, title)).toHaveCount(0);
    } finally {
      await otherContext.close();
    }

    await issueCard(page, title).getByRole("button", { name: "Edit", exact: true }).click();
    const edit = issueCard(page, title);
    await edit.getByLabel("Title", { exact: true }).fill(amendedTitle);
    await edit.getByLabel("Description", { exact: true }).fill("Collect deployment logs.");
    await edit.getByLabel("Priority", { exact: true }).selectOption("high");
    await edit.getByLabel("Status", { exact: true }).selectOption("in_progress");
    await edit.getByRole("button", { name: "Save changes", exact: true }).click();
    const amended = issueCard(page, amendedTitle);
    await expect(amended).toBeVisible();
    await page.reload();
    await expect(amended.getByText("Collect deployment logs.")).toBeVisible();
    await expect(amended.getByText("High", { exact: true })).toBeVisible();
    await expect(amended.getByText("In progress", { exact: true })).toBeVisible();

    await amended.getByRole("button", { name: "Delete", exact: true }).click();
    await amended.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.reload();
    await expect(amended).toBeVisible();

    await amended.getByRole("button", { name: "Delete", exact: true }).click();
    await amended.getByRole("button", { name: "Confirm delete", exact: true }).click();
    await expect(amended).toHaveCount(0);
    await page.reload();
    await expect(amended).toHaveCount(0);
  } finally {
    await Promise.all([api.cleanup(owner.email), api.cleanup(other.email)]);
  }
});

test("blank title and stale writes show actionable errors without reporting success", async ({ page }) => {
  const api = setup();
  const owner = makeAuthFixture();
  const title = "Issue changed by another tab";
  const staleEdit = "This update must not persist";
  const staleDelete = "Issue removed by another tab";
  try {
    await api.createConfirmedUser(owner);
    await signIn(page, owner);
    await page.getByLabel("Title", { exact: true }).fill("   ");
    await page.getByRole("button", { name: "Create issue", exact: true }).click();
    await expect(page.getByText("Enter a title.", { exact: true })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);

    await createIssue(page, title);
    const card = issueCard(page, title);
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    await card.getByLabel("Title", { exact: true }).fill(staleEdit);

    const signedIn = await api.auth("/token?grant_type=password", "POST", owner);
    expect(signedIn.status).toBe(200);
    const { access_token: token } = await signedIn.json();
    if (typeof token !== "string") throw new Error("Local fixture has no authenticated session.");
    async function removeOnlyFixture(fixtureTitle: string) {
      const filter = new URLSearchParams({ title: `eq.${fixtureTitle}`, select: "id" });
      const before = await api.issues("GET", filter, token);
      expect(before.status).toBe(200);
      const found = await before.json();
      expect(found).toHaveLength(1);
      const deleted = await api.issues("DELETE", new URLSearchParams({ id: `eq.${found[0].id}` }), token);
      expect(deleted.status).toBe(204);
    }

    await removeOnlyFixture(title);
    await card.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Could not update this issue. It may have been deleted.", { exact: true })).toBeVisible();
    await expect(page.getByText("Issue updated.", { exact: true })).toHaveCount(0);
    await expect(issueCard(page, staleEdit)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("article")).toHaveCount(0);

    await createIssue(page, staleDelete);
    const removed = issueCard(page, staleDelete);
    await removed.getByRole("button", { name: "Delete", exact: true }).click();
    await removeOnlyFixture(staleDelete);
    await removed.getByRole("button", { name: "Confirm delete", exact: true }).click();
    await expect(page.getByText("Could not delete this issue. It may have already been deleted.", { exact: true })).toBeVisible();
    await expect(page.getByText("Issue deleted.", { exact: true })).toHaveCount(0);
    await page.reload();
    await expect(removed).toHaveCount(0);
  } finally {
    await api.cleanup(owner.email);
  }
});
