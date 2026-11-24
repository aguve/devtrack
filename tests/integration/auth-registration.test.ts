import { expect, test } from "vitest";
import { localAuth, makeAuthFixture } from "../fixtures/local-auth";

test("local Auth requires confirmation before granting a verified password session", async () => {
  const api = localAuth();
  const credentials = makeAuthFixture();
  const signIn = (password: string) => api.auth("/token?grant_type=password", "POST", {
    ...credentials,
    password,
  });

  try {
    const invalid = await api.auth("/signup", "POST", { ...credentials, password: "x" });
    expect(invalid.status).toBe(422);

    const signup = await api.auth("/signup", "POST", credentials);
    expect(signup.status).toBe(200);
    const registered = await signup.json();
    expect(registered.email).toBe(credentials.email);
    expect(registered.access_token).toBeUndefined();
    expect((await signIn(credentials.password)).status).toBe(400);

    const link = await api.confirmation(credentials.email);
    const confirmed = await api.auth("/verify", "POST", {
      type: "email",
      token_hash: link.searchParams.get("token_hash"),
    });
    expect(confirmed.status).toBe(200);
    expect((await signIn("DefinitelyWrong!")).status).toBe(400);

    const signedIn = await signIn(credentials.password);
    expect(signedIn.status).toBe(200);
    const session = await signedIn.json();
    expect(typeof session.access_token).toBe("string");
    const verified = await api.auth("/user", "GET", undefined, session.access_token);
    expect(verified.status).toBe(200);
    expect((await verified.json()).id).toBe(registered.id);
  } finally {
    await api.cleanup(credentials.email);
  }
}, 30_000);
