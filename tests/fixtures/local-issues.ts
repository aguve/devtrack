import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/server/supabase/database";
import { localAuth, type makeAuthFixture } from "./local-auth";

export async function issueFixtureAccount(
  credentials: ReturnType<typeof makeAuthFixture>,
  api = localAuth(),
) {
  await api.createConfirmedUser(credentials);
  const response = await api.auth("/token?grant_type=password", "POST", credentials);
  if (!response.ok) throw new Error(`Local fixture sign-in failed (HTTP ${response.status}).`);
  const { access_token: token, user } = await response.json();
  const url = process.env.DEVTRACK_TEST_SUPABASE_URL;
  const key = process.env.DEVTRACK_TEST_SUPABASE_ANON_KEY;
  if (!url || !key || typeof token !== "string" || typeof user?.id !== "string") {
    throw new Error("Local issue fixture has no authenticated session.");
  }
  return {
    userId: user.id as string,
    client: createClient<Database>(url, key, { accessToken: async () => token }),
  };
}
