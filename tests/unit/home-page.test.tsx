import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import HomePage from "../../app/page";

afterEach(cleanup);

test("identifies DevTrack with a level-one heading inside the main landmark", () => {
  render(<HomePage />);

  const main = screen.getByRole("main");
  expect(within(main).getByRole("heading", { level: 1, name: "DevTrack" })).toBeTruthy();
});
