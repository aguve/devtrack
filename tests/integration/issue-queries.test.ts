import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import { issueQuerySchema } from "../../src/core/issues/query";
import type { Database } from "../../src/server/supabase/database";
import { listIssues } from "../../src/server/supabase/issues";
import { localAuth, makeAuthFixture } from "../fixtures/local-auth";
import { issueFixtureAccount } from "../fixtures/local-issues";

vi.mock("server-only", () => ({}));

test("live issue queries preserve owner scope, literal matching, filter intersection, and stable ordering", async () => {
  const api = localAuth();
  const owner = makeAuthFixture();
  const outsider = makeAuthFixture();
  try {
    const a = await issueFixtureAccount(owner, api);
    const b = await issueFixtureAccount(outsider, api);
    const [titleId, descriptionId] = [randomUUID(), randomUUID()].sort();
    const recentId = randomUUID();
    const tie = "2025-01-01T12:00:00Z";
    const recent = "2025-02-01T12:00:00Z";
    const literal = `Compile %_\\,("Ops") * 'Café'`;
    const rows: Database["public"]["Tables"]["issues"]["Insert"][] = [
      {
        id: descriptionId, user_id: a.userId, title: "Description match",
        description: literal, status: "todo", priority: "high", updated_at: tie,
      },
      {
        id: titleId, user_id: a.userId, title: literal,
        description: null, status: "done", priority: "high", updated_at: tie,
      },
      {
        id: recentId, user_id: a.userId, title: "Compile ZX, QOpsZ",
        description: null, status: "done", priority: "low", updated_at: recent,
      },
    ];
    const seeded = await a.client.from("issues").insert(rows);
    expect(seeded.error).toBeNull();
    const foreignId = randomUUID();
    const foreignRow = { ...rows[1], id: foreignId, user_id: b.userId };
    const foreign = await b.client.from("issues").insert(foreignRow);
    expect(foreign.error).toBeNull();

    const read = async (params: Record<string, string>, client = a.client) => {
      const result = await listIssues(client, issueQuerySchema.parse(params));
      if (!result) throw new Error("Live issue query returned a failure.");
      return result.map(({ id }) => id);
    };

    expect(await read({})).toEqual([recentId, titleId, descriptionId]);
    expect(await read({ q: "COMPILE" })).toEqual([recentId, titleId, descriptionId]);
    expect(await read({ q: `cOmPiLe %_\\,("oPs") *` })).toEqual([titleId, descriptionId]);
    for (const q of ["%", "_", "\\", ",(", '"', ")", "*", "'", "CAFÉ"]) {
      expect(await read({ q })).toEqual([titleId, descriptionId]);
    }
    expect(await read({ q: "compile", status: "done", priority: "high" })).toEqual([titleId]);
    expect(await read({ q: "compile", status: "todo", priority: "high" })).toEqual([descriptionId]);
    expect(await read({ q: "compile", status: "todo", priority: "low" })).toEqual([]);
    expect(await read({ q: "compile" }, b.client)).toEqual([foreignId]);
  } finally {
    await Promise.all([api.cleanup(owner.email), api.cleanup(outsider.email)]);
  }
}, 30_000);
