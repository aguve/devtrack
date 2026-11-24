import { expect, test } from "vitest";
import { groupIssuesByStatus } from "../../src/core/issues/group";
import type { Issue } from "../../src/core/issues/schema";

function issue(title: string, status: Issue["status"]): Issue {
  return {
    id: title,
    title,
    status,
    priority: "medium",
    description: null,
    updated_at: "2025-02-01T12:00:00Z",
  };
}

test("empty input returns each Kanban column", () => {
  expect(groupIssuesByStatus([])).toEqual({ todo: [], in_progress: [], done: [] });
});

test("each card appears only in its status column while retaining query order", () => {
  const firstTodo = issue("First to do", "todo");
  const secondTodo = issue("Second to do", "todo");
  const active = issue("In flight", "in_progress");
  const complete = issue("Complete", "done");
  const input = Object.freeze([firstTodo, complete, active, secondTodo]);

  expect(groupIssuesByStatus(input)).toEqual({
    todo: [firstTodo, secondTodo],
    in_progress: [active],
    done: [complete],
  });
});
