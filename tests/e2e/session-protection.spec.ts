import { expect, test, type BrowserContext } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";

const authCookie = /-auth-token(?:\.\d+)?$/;

test.use({ trace: "off" });

async function readSessionCookie(context: BrowserContext) {
  const cookies = (await context.cookies(appOrigin)).filter(({ name }) => authCookie.test(name));
  cookies.sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
  const value = cookies.map((cookie) => cookie.value).join("");
  if (!value.startsWith("base64-")) throw new Error("The local browser session has no encoded Auth cookie.");
  const decoded: unknown = JSON.parse(Buffer.from(value.slice(7), "base64url").toString());
  if (!decoded || typeof decoded !== "object" ||
    !("refresh_token" in decoded) || typeof decoded.refresh_token !== "string") {
    throw new Error("The local browser session has no refresh credential.");
  }
  return { cookieName: cookies[0].name.replace(/\.\d+$/, ""), session: decoded };
}

async function installExpiredSession(context: BrowserContext, snapshot: Awaited<ReturnType<typeof readSessionCookie>>) {
  const expiredSession = { ...snapshot.session, expires_at: 1 };
  await context.clearCookies({ name: authCookie });
  await context.addCookies([{
    name: snapshot.cookieName,
    value: `base64-${Buffer.from(JSON.stringify(expiredSession)).toString("base64url")}`,
    url: appOrigin,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  }]);
}

test("dashboard access requires a live session and sign-out revokes the current refresh token", async ({ page }) => {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
  const api = localAuth();
  const credentials = makeAuthFixture();
  const context = page.context();

  try {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(`${appOrigin}/login`);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await api.createConfirmedUser(credentials);
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    const dashboard = await page.reload();
    expect(dashboard?.headers()["cache-control"]).toContain("no-store");
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

    const initialSession = await readSessionCookie(context);
    await installExpiredSession(context, initialSession);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    const currentSession = await readSessionCookie(context);
    expect(
      "expires_at" in currentSession.session &&
      Number(currentSession.session.expires_at) > Date.now() / 1000,
    ).toBe(true);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(`${appOrigin}/login`);
    expect((await context.cookies(appOrigin)).some(({ name }) => authCookie.test(name))).toBe(false);

    const refresh = await api.auth("/token?grant_type=refresh_token", "POST", {
      refresh_token: currentSession.session.refresh_token,
    });
    expect(refresh.status).toBe(400);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(`${appOrigin}/login`);

    await installExpiredSession(context, currentSession);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(`${appOrigin}/login`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveCount(0);
  } finally {
    await api.cleanup(credentials.email);
  }
});
