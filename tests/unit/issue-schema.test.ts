import { expect, test } from "vitest";
import {
  issueFieldsSchema,
  issueIdSchema,
  issuePrioritySchema,
  issueRowSchema,
  issueStatusSchema,
} from "../../src/core/issues/schema";

const fields = { title: "Fix build", priority: "medium", status: "todo" };
const id = "5856f00c-a681-4bbd-8883-7b596f67e804";

test("issue fields trim text and normalize omitted or blank descriptions to null", () => {
  expect(issueFieldsSchema.parse({ ...fields, title: "  Fix build  " }))
    .toEqual({ ...fields, description: null });
  expect(issueFieldsSchema.parse({ ...fields, description: " \t " }).description).toBeNull();
  expect(issueFieldsSchema.parse({ ...fields, description: "  Details  " }).description).toBe("Details");
});

test("issue fields enforce the title and description limits in Unicode code points", () => {
  expect(issueFieldsSchema.safeParse({ ...fields, title: "   " }).success).toBe(false);
  expect(issueFieldsSchema.safeParse({ ...fields, title: "🧪".repeat(120) }).success).toBe(true);
  expect(issueFieldsSchema.safeParse({ ...fields, title: "🧪".repeat(121) }).success).toBe(false);
  expect(issueFieldsSchema.safeParse({ ...fields, description: "🧪".repeat(4000) }).success).toBe(true);
  expect(issueFieldsSchema.safeParse({ ...fields, description: "🧪".repeat(4001) }).success).toBe(false);
});

test("issue IDs and enums accept only supported values", () => {
  expect(issueIdSchema.safeParse(id).success).toBe(true);
  expect(issueIdSchema.safeParse("not-a-uuid").success).toBe(false);
  for (const status of ["todo", "in_progress", "done"]) {
    expect(issueStatusSchema.safeParse(status).success).toBe(true);
  }
  for (const priority of ["low", "medium", "high"]) {
    expect(issuePrioritySchema.safeParse(priority).success).toBe(true);
  }
  expect(issueFieldsSchema.safeParse({ ...fields, status: "archived" }).success).toBe(false);
  expect(issueFieldsSchema.safeParse({ ...fields, priority: "urgent" }).success).toBe(false);
});

test("persisted issue rows require valid fields and an ISO timestamp with an offset", () => {
  const row = { ...fields, id, description: null, updated_at: "2026-11-24T12:30:00+00:00" };
  expect(issueRowSchema.safeParse(row).success).toBe(true);
  expect(issueRowSchema.safeParse({ ...row, updated_at: "yesterday" }).success).toBe(false);
  expect(issueRowSchema.safeParse({ ...row, id: "not-a-uuid" }).success).toBe(false);
});
