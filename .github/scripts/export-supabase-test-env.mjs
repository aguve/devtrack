import { appendFileSync, readFileSync } from "node:fs";

const [statusPath] = process.argv.slice(2);
const { GITHUB_ENV: envPath } = process.env;
if (!statusPath || !envPath) throw new Error("Expected an isolated Supabase status file and GITHUB_ENV.");

let status;
try {
  status = JSON.parse(readFileSync(statusPath, "utf8"));
} catch {
  throw new Error("Could not read the isolated Supabase status JSON.");
}

const local = status.env ?? status;
const { API_URL, DB_URL, MAILPIT_URL, ANON_KEY, SERVICE_ROLE_KEY, PUBLISHABLE_KEY } = local;
const values = [API_URL, DB_URL, MAILPIT_URL, ANON_KEY, SERVICE_ROLE_KEY, PUBLISHABLE_KEY];
const parsedDatabase = URL.canParse(DB_URL) ? new URL(DB_URL) : null;
const localJwt = /^[\w-]+\.[\w-]+\.[\w-]+$/;

if (
  values.some((value) => typeof value !== "string" || /[\r\n]/.test(value)) ||
  API_URL !== "http://127.0.0.1:54321" ||
  !parsedDatabase ||
  parsedDatabase.protocol !== "postgresql:" ||
  parsedDatabase.host !== "127.0.0.1:54322" ||
  parsedDatabase.pathname !== "/postgres" ||
  parsedDatabase.username !== "postgres" ||
  !/^[%\w-]+$/.test(parsedDatabase.password) ||
  parsedDatabase.search || parsedDatabase.hash ||
  !/^http:\/\/127\.0\.0\.1:[1-9]\d{0,4}$/.test(MAILPIT_URL) ||
  !localJwt.test(ANON_KEY) || !localJwt.test(SERVICE_ROLE_KEY) ||
  ANON_KEY === SERVICE_ROLE_KEY ||
  !/^sb_publishable_[\w-]+$/.test(PUBLISHABLE_KEY)
) {
  throw new Error("Supabase status did not match the expected dedicated loopback stack.");
}

for (const value of [DB_URL, parsedDatabase.password, ANON_KEY, SERVICE_ROLE_KEY, PUBLISHABLE_KEY]) {
  process.stdout.write(`::add-mask::${value.replaceAll("%", "%25")}\n`);
}

const variables = {
  DEVTRACK_DB_TEST: "1",
  DEVTRACK_TEST_DB_URL: DB_URL,
  DEVTRACK_TEST_SUPABASE_URL: API_URL,
  DEVTRACK_TEST_SUPABASE_ANON_KEY: ANON_KEY,
  DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
  DEVTRACK_TEST_MAILPIT_URL: MAILPIT_URL,
  SUPABASE_URL: API_URL,
  SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY,
};

appendFileSync(envPath, Object.entries(variables).map(([key, value]) => `${key}=${value}\n`).join(""));
