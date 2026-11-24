import { expect, test } from "vitest";
import {
  confirmationQuery,
  registrationCredentials,
  signInCredentials,
} from "../../src/core/auth/credentials";

const email = "fixture@devtrack.test";

test("registration requires a valid address and at least eight password characters", () => {
  expect(registrationCredentials.safeParse({ email, password: "12345678" }).success).toBe(true);
  expect(registrationCredentials.safeParse({ email, password: "1234567" }).success).toBe(false);
  expect(registrationCredentials.safeParse({ email: "invalid", password: "12345678" }).success).toBe(false);
});

test("sign-in accepts existing shorter passwords and rejects an empty password", () => {
  expect(signInCredentials.safeParse({ email, password: "x" }).success).toBe(true);
  expect(signInCredentials.safeParse({ email, password: "" }).success).toBe(false);
});

test("registration and sign-in both enforce the 72-byte UTF-8 password limit", () => {
  for (const schema of [registrationCredentials, signInCredentials]) {
    expect(schema.safeParse({ email, password: "é".repeat(36) }).success).toBe(true);
    expect(schema.safeParse({ email, password: "é".repeat(36) + "x" }).success).toBe(false);
    expect(schema.safeParse({ email, password: "x".repeat(72) }).success).toBe(true);
    expect(schema.safeParse({ email, password: "x".repeat(73) }).success).toBe(false);
  }
});

test("confirmation accepts only a bounded URL-safe token and the email type", () => {
  expect(confirmationQuery.safeParse({ token_hash: "abc_ABC-123", type: "email" }).success).toBe(true);
  for (const token_hash of ["", "unsafe&value", "x".repeat(257)]) {
    expect(confirmationQuery.safeParse({ token_hash, type: "email" }).success).toBe(false);
  }
  expect(confirmationQuery.safeParse({ token_hash: "abc123", type: "magiclink" }).success).toBe(false);
});
