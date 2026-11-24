import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { IssueBoardLoading } from "../../app/dashboard/issues/issue-board-loading";
import { IssueLoadError } from "../../app/dashboard/issues/issue-load-error";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(cleanup);

test("the loading fallback announces that issues are being fetched", () => {
  render(<IssueBoardLoading />);
  expect(screen.getByRole("status").textContent).toBe("Loading issues…");
});

test("the failure state announces the read error and offers a retry", () => {
  render(<IssueLoadError />);
  expect(screen.getByRole("alert").textContent).toBe("Could not load your issues. Try again.");
  fireEvent.click(screen.getByRole("button", { name: "Retry loading issues" }));
  expect(refresh).toHaveBeenCalledOnce();
});
