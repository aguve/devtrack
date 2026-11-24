import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

const apiOrigin = "http://127.0.0.1:54321";
export const appOrigin = "http://127.0.0.1:3100";

export function makeAuthFixture() {
  return { email: `${randomUUID()}@devtrack.test`, password: `Qa!${randomUUID()}` };
}

export function localAuth() {
  const mailboxOrigin = process.env.DEVTRACK_TEST_MAILPIT_URL ?? "";
  if (
    process.env.DEVTRACK_DB_TEST !== "1" ||
    process.env.DEVTRACK_TEST_SUPABASE_URL !== apiOrigin ||
    !/^http:\/\/127\.0\.0\.1:[1-9]\d{0,4}$/.test(mailboxOrigin)
  ) {
    throw new Error("Auth checks require opt-in and the dedicated local Supabase API and Mailpit endpoints.");
  }
  const anonKey = process.env.DEVTRACK_TEST_SUPABASE_ANON_KEY;
  const serviceKey = process.env.DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!anonKey || !serviceKey || anonKey === serviceKey) {
    throw new Error("Provide separate local Auth public and fixture service keys.");
  }

  function request(path: string, method: string, key: string, body?: object, token?: string) {
    const headers = new Headers({ apikey: key, "Content-Type": "application/json" });
    const bearer = token ?? (key.startsWith("sb_") ? undefined : key);
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    return fetch(apiOrigin + path, {
      method,
      headers,
      body: body && JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  }

  const requestAuth = (path: string, method: string, key: string, body?: object, token?: string) =>
    request("/auth/v1" + path, method, key, body, token);

  return {
    auth: (path: string, method: string, body?: object, token?: string) =>
      requestAuth(path, method, anonKey, body, token),
    issues: (method: "GET" | "DELETE", filter: URLSearchParams, token: string) =>
      request(`/rest/v1/issues?${filter}`, method, anonKey, undefined, token),
    async createConfirmedUser(credentials: ReturnType<typeof makeAuthFixture>) {
      const response = await requestAuth("/admin/users", "POST", serviceKey, {
        ...credentials,
        email_confirm: true,
      });
      if (!response.ok) throw new Error(`Create local fixture failed (HTTP ${response.status}).`);
      await response.body?.cancel();
    },
    async cleanup(email: string) {
      const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
      for (let page = 1; ; page++) {
        const response = await requestAuth(`/admin/users?page=${page}&per_page=100`, "GET", serviceKey);
        if (!response.ok) throw new Error(`List local fixtures failed (HTTP ${response.status}).`);
        const { users }: { users: { id: string; email?: string }[] } = await response.json();
        const user = users.find((item) => item.email === email && uuid.test(item.id));
        if (user) {
          const deleted = await requestAuth(`/admin/users/${user.id}`, "DELETE", serviceKey);
          if (!deleted.ok) throw new Error(`Delete local fixture failed (HTTP ${deleted.status}).`);
          return;
        }
        if (users.length < 100) return;
      }
    },
    async confirmation(email: string) {
      const mailbox = new URL("/view/latest.html", mailboxOrigin);
      mailbox.searchParams.set("query", `to:${email}`);
      for (let attempt = 0; attempt < 30; attempt++) {
        const response = await fetch(mailbox, { redirect: "error", signal: AbortSignal.timeout(3_000) });
        if (response.status === 404) {
          await delay(350);
          continue;
        }
        if (!response.ok) throw new Error(`Read local confirmation email failed (HTTP ${response.status}).`);
        const html = await response.text();
        for (const match of html.matchAll(/href=["']([^"']+)["']/g)) {
          const link = new URL(match[1].replaceAll("&amp;", "&"), appOrigin);
          if (link.origin === appOrigin && link.pathname === "/auth/confirm" &&
            link.searchParams.get("type") === "email" && link.searchParams.has("token_hash")) {
            return link;
          }
        }
        throw new Error("Local confirmation email has no DevTrack confirmation link.");
      }
      throw new Error("No signup confirmation email arrived in the isolated mailbox.");
    },
  };
}
