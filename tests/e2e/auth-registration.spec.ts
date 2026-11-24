import { expect, test } from "@playwright/test";
import { appOrigin, localAuth, makeAuthFixture } from "../fixtures/local-auth";

const sessionCookie = /-auth-token(?:\.\d+)?$/;

test.use({ trace: "off" });

test.beforeEach(() => {
  if (
    process.env.SUPABASE_URL !== process.env.DEVTRACK_TEST_SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("The browser test server must use the dedicated local Supabase endpoint and a public key.");
  }
});

test("registers, confirms by email, and signs in with a fresh browser session", async ({ page, browser }) => {
  const api = localAuth();
  const { email, password } = makeAuthFixture();

  try {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
    const pendingCookies = await page.context().cookies();
    expect(pendingCookies.some(({ name }) => sessionCookie.test(name))).toBe(false);
    const verifierCookies = pendingCookies.filter(({ name }) => /-code-verifier(?:\.\d+)?$/.test(name));
    expect(verifierCookies.length).toBeGreaterThan(0);
    expect(verifierCookies.every(({ httpOnly }) => httpOnly)).toBe(true);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(`${appOrigin}/login`);

    const confirmation = await api.confirmation(email);
    await page.goto(confirmation.href).catch(() => {
      throw new Error("The local confirmation link could not be opened.");
    });
    await expect(page).toHaveURL(`${appOrigin}/dashboard`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    const cookie = (await page.context().cookies()).find(({ name }) => sessionCookie.test(name));
    expect(cookie && { httpOnly: cookie.httpOnly, secure: cookie.secure, sameSite: cookie.sameSite })
      .toEqual({ httpOnly: true, secure: true, sameSite: "Lax" });

    const freshContext = await browser.newContext({ baseURL: appOrigin });
    try {
      const signIn = await freshContext.newPage();
      await signIn.goto("/login");
      await expect(signIn.getByRole("heading", { name: "Sign in" })).toBeVisible();
      await signIn.getByLabel("Email").fill(email);
      await signIn.getByLabel("Password").fill("DefinitelyWrong!");
      await signIn.getByRole("button", { name: "Sign in" }).click();
      await expect(signIn.getByText("Email or password is incorrect.")).toBeVisible();
      expect((await freshContext.cookies()).some(({ name }) => sessionCookie.test(name))).toBe(false);
      await signIn.getByLabel("Password").fill(password);
      await signIn.getByRole("button", { name: "Sign in" }).click();
      await expect(signIn).toHaveURL(`${appOrigin}/dashboard`);
      await expect(signIn.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    } finally {
      await freshContext.close();
    }
  } finally {
    await api.cleanup(email);
  }
});

test("registration rejects short passwords and an invalid confirmation returns to sign-in", async ({ page }) => {
  const api = localAuth();
  const { email } = makeAuthFixture();
  try {
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("x");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    expect((await page.context().cookies()).some(({ name }) => sessionCookie.test(name))).toBe(false);
    await page.goto("/auth/confirm?token_hash=invalid-test-token&type=email");
    await expect(page).toHaveURL(/\/login\?confirmation=invalid$/);
    await expect(page.getByText("This confirmation link is invalid or has expired.")).toBeVisible();
  } finally {
    await api.cleanup(email);
  }
});
