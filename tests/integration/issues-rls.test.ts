import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";

type Session = { userId: string; token: string };

const apiUrl = "http://127.0.0.1:54321";
const issues = "/rest/v1/issues";
const adminUsers = "/auth/v1/admin/users";

function createClient() {
  if (process.env.DEVTRACK_DB_TEST !== "1" || process.env.DEVTRACK_TEST_SUPABASE_URL !== apiUrl) {
    throw new Error("RLS checks require DEVTRACK_DB_TEST=1 and the local Supabase API at 127.0.0.1:54321.");
  }
  const anonKey = process.env.DEVTRACK_TEST_SUPABASE_ANON_KEY;
  const serviceKey = process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!anonKey || !serviceKey || anonKey === serviceKey) {
    throw new Error("RLS checks require distinct local Supabase anonymous and service-role keys.");
  }

  async function request(path: string, key: string, method: string, body?: object, token?: string) {
    const headers = new Headers({ apikey: key, "Content-Type": "application/json" });
    const bearer = token ?? (key.startsWith("sb_") ? undefined : key);
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    if (path.startsWith(issues)) headers.set("Prefer", "return=representation");

    return fetch(apiUrl + path, {
      method,
      headers,
      body: body && JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  }

  return {
    admin: (path: string, method: string, body?: object) => request(path, serviceKey, method, body),
    user: (path: string, method: string, body?: object, token?: string) => request(path, anonKey, method, body, token),
  };
}

async function requireSuccess(response: Response, operation: string) {
  expect(response.ok, `${operation} returned HTTP ${response.status}`).toBe(true);
  return response.json();
}

async function expectNoRows(response: Response, operation: string) {
  if (response.status === 401 || response.status === 403) return;
  expect(await requireSuccess(response, operation), operation).toEqual([]);
}

function expectDenied(response: Response, operation: string) {
  expect([401, 403], `${operation} returned HTTP ${response.status}`).toContain(response.status);
}

const byId = (id: string) => `${issues}?id=eq.${id}`;

test("the local API enforces the issue owner boundary for two authenticated users and anonymous access", async () => {
  const api = createClient();
  const accountIds: string[] = [];

  async function signInFixture(): Promise<Session> {
    const email = `${randomUUID()}@devtrack.test`;
    const password = `Qa!${randomUUID()}`;
    const account = await requireSuccess(
      await api.admin(adminUsers, "POST", { email, password, email_confirm: true }),
      "Create local Auth fixture",
    );
    if (typeof account.id !== "string") throw new Error("Auth fixture response has no user ID.");
    accountIds.push(account.id);

    const session = await requireSuccess(
      await api.user("/auth/v1/token?grant_type=password", "POST", { email, password }),
      "Sign in as local Auth fixture",
    );
    if (session.user?.id !== account.id || typeof session.access_token !== "string") {
      throw new Error("Auth fixture did not receive its own session.");
    }
    return { userId: account.id, token: session.access_token };
  }

  try {
    const a = await signInFixture();
    const b = await signInFixture();
    if (a.userId === b.userId || a.token === b.token) throw new Error("Auth sessions are not independent.");

    const fixtures = [a, b].map((owner) => ({
      id: randomUUID(),
      user_id: owner.userId,
      title: "Private issue",
      status: "todo",
    }));
    for (const [index, owner] of [a, b].entries()) {
      const fixture = fixtures[index];
      expect(await requireSuccess(
        await api.user(issues, "POST", fixture, owner.token), "Create own issue",
      )).toEqual([expect.objectContaining(fixture)]);
      const updated = { ...fixture, status: "done" };
      expect(await requireSuccess(
        await api.user(byId(fixture.id), "PATCH", { status: "done" }, owner.token), "Update own issue",
      )).toEqual([expect.objectContaining(updated)]);
      Object.assign(fixture, updated);
    }

    const fixtureList = `${issues}?id=in.(${fixtures.map(({ id }) => id).join(",")})`;
    for (const [index, actor] of [a, b].entries()) {
      const other = [a, b][1 - index];
      const own = fixtures[index];
      const foreign = fixtures[1 - index];
      const forgedId = randomUUID();

      expect(await requireSuccess(
        await api.user(fixtureList, "GET", undefined, actor.token), "List visible fixtures",
      )).toEqual([expect.objectContaining(own)]);
      await expectNoRows(await api.user(byId(foreign.id), "GET", undefined, actor.token), "Read foreign issue");
      await expectNoRows(await api.user(byId(foreign.id), "PATCH", { title: "Foreign mutation" }, actor.token), "Update foreign issue");
      await expectNoRows(await api.user(byId(foreign.id), "DELETE", undefined, actor.token), "Delete foreign issue");
      expectDenied(await api.user(issues, "POST", {
        id: forgedId, user_id: other.userId, title: "Forged owner",
      }, actor.token), "Insert issue for other user");
      expectDenied(await api.user(byId(own.id), "PATCH", {
        user_id: other.userId,
      }, actor.token), "Transfer issue to other user");

      expect(await requireSuccess(
        await api.user(byId(foreign.id), "GET", undefined, other.token), "Read unchanged foreign issue as owner",
      )).toEqual([expect.objectContaining(foreign)]);
      expect(await requireSuccess(
        await api.user(byId(own.id), "GET", undefined, actor.token), "Read retained issue after blocked transfer",
      )).toEqual([expect.objectContaining(own)]);
      expect(await requireSuccess(
        await api.user(byId(forgedId), "GET", undefined, other.token), "Check forged issue was not stored",
      )).toEqual([]);
    }

    const anonymousId = randomUUID();
    await expectNoRows(await api.user(fixtureList, "GET"), "Anonymous issue listing");
    await expectNoRows(await api.user(byId(fixtures[0].id), "GET"), "Anonymous issue read");
    await expectNoRows(await api.user(byId(fixtures[0].id), "PATCH", { title: "Anonymous mutation" }), "Anonymous issue update");
    await expectNoRows(await api.user(byId(fixtures[0].id), "DELETE"), "Anonymous issue delete");
    expectDenied(await api.user(issues, "POST", {
      id: anonymousId, user_id: a.userId, title: "Anonymous insert",
    }), "Anonymous issue insert");
    expect(await requireSuccess(
      await api.user(byId(anonymousId), "GET", undefined, a.token), "Check anonymous issue was not stored",
    )).toEqual([]);

    for (const [index, owner] of [a, b].entries()) {
      const fixture = fixtures[index];
      expect(await requireSuccess(
        await api.user(byId(fixture.id), "GET", undefined, owner.token), "Read unchanged own issue",
      )).toEqual([expect.objectContaining(fixture)]);
      expect(await requireSuccess(
        await api.user(byId(fixture.id), "DELETE", undefined, owner.token), "Delete own issue",
      )).toEqual([expect.objectContaining(fixture)]);
      expect(await requireSuccess(
        await api.user(byId(fixture.id), "GET", undefined, owner.token), "Read deleted own issue",
      )).toEqual([]);
    }
  } finally {
    const cleanup = await Promise.allSettled(accountIds.map(async (id) => {
      const response = await api.admin(`${adminUsers}/${id}`, "DELETE");
      if (!response.ok) throw new Error(`Fixture cleanup returned HTTP ${response.status}.`);
    }));
    const failures = cleanup.filter((result) => result.status === "rejected");
    if (failures.length) throw new AggregateError(failures.map(({ reason }) => reason), "Local Auth fixture cleanup failed.");
  }
}, 45_000);
