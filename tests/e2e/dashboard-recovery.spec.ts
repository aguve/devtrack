import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, request } from "node:http";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test } from "@playwright/test";
import { localAuth, makeAuthFixture } from "../fixtures/local-auth";
import { issueFixtureAccount } from "../fixtures/local-issues";

test.use({ trace: "off" });

test("a pending issue read announces loading, recovers from failure, and keeps the filter URL", async ({ page, isMobile }) => {
  test.setTimeout(45_000);
  const api = localAuth();
  const credentials = makeAuthFixture();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key?.startsWith("sb_publishable_") || key === process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("The browser test server requires the local Supabase publishable key.");
  }

  const fail = Promise.withResolvers<void>();
  let interruptReads = false;
  const proxy = createServer((incoming, outgoing) => {
    if (interruptReads && incoming.url?.startsWith("/rest/v1/rpc/list_own_issues")) {
      incoming.resume();
      void fail.promise.then(() => {
        outgoing.writeHead(503, { "Content-Type": "application/json" });
        outgoing.end(JSON.stringify({ message: "Controlled test outage" }));
      });
      return;
    }

    const upstream = request({
      hostname: "127.0.0.1",
      port: 54321,
      path: incoming.url,
      method: incoming.method,
      headers: { ...incoming.headers, host: "127.0.0.1:54321" },
    }, (response) => {
      outgoing.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(outgoing);
    });
    upstream.on("error", () => {
      if (!outgoing.headersSent) outgoing.writeHead(502);
      outgoing.end();
    });
    incoming.pipe(upstream);
  });
  proxy.listen(0, "127.0.0.1");
  await once(proxy, "listening");
  const address = proxy.address();
  if (!address || typeof address === "string") throw new Error("Local fault proxy failed to bind.");

  const appPort = isMobile ? "3212" : "3211";
  const origin = `http://127.0.0.1:${appPort}`;
  const app = spawn(process.execPath, [
    resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", appPort,
  ], {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "production",
      SUPABASE_PUBLISHABLE_KEY: key,
      SUPABASE_URL: `http://127.0.0.1:${address.port}`,
    },
    stdio: "ignore",
  });

  try {
    await expect.poll(async () => {
      if (app.exitCode !== null) return false;
      try {
        const response = await fetch(`${origin}/login`, { signal: AbortSignal.timeout(500) });
        await response.body?.cancel();
        return response.ok;
      } catch {
        return false;
      }
    }, { timeout: 12_000, message: "The local production-mode QA server did not start." }).toBe(true);

    const { client, userId: user_id } = await issueFixtureAccount(credentials, api);
    const seeded = await client.from("issues").insert([
      { user_id, title: "Fixture for recovery", status: "todo" },
      { user_id, title: "Other work", status: "todo" },
    ]);
    expect(seeded.error).toBeNull();
    await page.goto(`${origin}/login`);
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/dashboard`);
    await expect(page.getByRole("article")).toHaveCount(2);

    interruptReads = true;
    const filtered = `${origin}/dashboard?q=recovery`;
    await page.goto(filtered, { waitUntil: "commit" });
    const issues = page.getByRole("region", { name: "Your issues" });
    await expect(issues.getByRole("status")).toHaveText("Loading issues…");
    fail.resolve();
    await expect(issues.getByRole("alert")).toHaveText("Could not load your issues. Try again.");
    await expect(issues.getByRole("article")).toHaveCount(0);

    interruptReads = false;
    await issues.getByRole("button", { name: "Retry loading issues" }).click();
    await expect(page).toHaveURL(filtered);
    await expect(issues.getByRole("article", { name: "Fixture for recovery" })).toBeVisible();
    await expect(issues.getByRole("article")).toHaveCount(1);
    await expect(issues.getByRole("alert")).toHaveCount(0);
  } finally {
    fail.resolve();
    if (app.exitCode === null && app.signalCode === null) {
      const closed = once(app, "exit");
      app.kill();
      await Promise.race([closed, delay(3_000)]);
      if (app.exitCode === null && app.signalCode === null) app.kill("SIGKILL");
    }
    proxy.closeAllConnections();
    await new Promise<void>((done) => proxy.close(() => done()));
    await api.cleanup(credentials.email);
  }
});
