import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const sql = readFileSync(new URL("./issues-schema.sql", import.meta.url), "utf8");
const psqlArgs = ["-X", "--no-password", "--set=ON_ERROR_STOP=1", "--dbname=postgres"];

function runSchemaChecks() {
  if (process.env.DEVTRACK_DB_TEST !== "1") {
    throw new Error(
      "Database checks require a dedicated local Supabase stack and DEVTRACK_DB_TEST=1.",
    );
  }

  const options = { input: sql, encoding: "utf8" as const, timeout: 15_000 };
  const baseEnv = { PATH: process.env.PATH, NODE_ENV: "test" as const };
  const testUrl = process.env.DEVTRACK_TEST_DB_URL;

  if (!testUrl) {
    const socket = process.env.DEVTRACK_TEST_DOCKER_SOCKET ?? "/var/run/docker.sock";
    if (!/^\/[\w./-]+$/.test(socket)) {
      throw new Error("DEVTRACK_TEST_DOCKER_SOCKET must be an absolute local socket path.");
    }
    return spawnSync(
      "docker",
      [
        "--host", `unix://${socket}`, "exec", "-i", "supabase_db_devtrack-local",
        "psql", ...psqlArgs, "--username=postgres",
      ],
      { ...options, env: baseEnv },
    );
  }

  let url: URL;
  try {
    url = new URL(testUrl);
  } catch {
    throw new Error("DEVTRACK_TEST_DB_URL must be a local PostgreSQL URL.");
  }

  if (
    url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" ||
    url.port !== "54322" || url.pathname !== "/postgres" ||
    url.username !== "postgres" || url.search || url.hash
  ) {
    throw new Error("DEVTRACK_TEST_DB_URL must target the dedicated local Supabase database on 127.0.0.1:54322.");
  }

  return spawnSync("psql", psqlArgs, {
    ...options,
    env: {
      ...baseEnv,
      PGHOST: url.hostname,
      PGPORT: url.port,
      PGUSER: url.username,
      PGPASSWORD: decodeURIComponent(url.password),
      PGCONNECT_TIMEOUT: "5",
    },
  });
}

test("the isolated Supabase database enforces the issues schema", () => {
  const result = runSchemaChecks();
  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain("DevTrack issues schema checks passed");
}, 20_000);
