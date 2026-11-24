import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import RootLayout, { metadata } from "../../app/layout";
import HomePage from "../../app/page";

test("the root layout renders the home route in an English HTML document", () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <HomePage />
    </RootLayout>,
  );

  expect(metadata.title).toBe("DevTrack");
  expect(html).toMatch(/^<html lang="en">/);
  expect(html).toMatch(/<body[^>]*><main[^>]*><h1[^>]*>DevTrack<\/h1><\/main><\/body><\/html>$/);
});
