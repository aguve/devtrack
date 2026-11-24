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
  const main = html.match(/<body[^>]*><main[^>]*>([\s\S]*)<\/main><\/body><\/html>$/)?.[1];
  expect(main).toMatch(/<h1[^>]*>DevTrack<\/h1>/);
  expect(main).toMatch(/<nav[^>]*aria-label="Account"[^>]*>/);
  expect(main).toMatch(/<a[^>]*href="\/login"[^>]*>Sign in<\/a>/);
  expect(main).toMatch(/<a[^>]*href="\/register"[^>]*>Register<\/a>/);
});
