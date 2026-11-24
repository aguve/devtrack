import { expect, test } from "vitest";
import { issueQuerySchema } from "../../src/core/issues/query";

test("query defaults empty controls to null and keeps a trimmed literal", () => {
  expect(issueQuerySchema.parse({})).toEqual({ q: null, status: null, priority: null });
  expect(issueQuerySchema.parse({ q: " \t ", status: "", priority: "" }))
    .toEqual({ q: null, status: null, priority: null });
  expect(issueQuerySchema.parse({ q: "  %_\\,()  ", status: "done", priority: "high", unknown: "ignored" }))
    .toEqual({ q: "%_\\,()", status: "done", priority: "high" });
});

test("query rejects repeated or invalid known fields and bounds Unicode search text", () => {
  for (const invalid of [
    { q: ["one", "two"] },
    { status: ["todo", "done"] },
    { priority: ["low", "high"] },
    { status: "archived" },
    { priority: "urgent" },
    { q: "hidden\0separator" },
    { q: "🧪".repeat(121) },
  ]) {
    expect(issueQuerySchema.safeParse(invalid).success).toBe(false);
  }
  expect(issueQuerySchema.parse({ q: "🧪".repeat(120) }).q).toHaveLength(240);
});
