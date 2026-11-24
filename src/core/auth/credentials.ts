import { z } from "zod";

const email = z.email("Enter a valid email address.").max(254, "Use an email address of at most 254 characters.");
const passwordByteLimit = (password: string) =>
  new TextEncoder().encode(password).length <= 72;

export const registrationCredentials = z.object({
  email,
  password: z.string().min(8, "Use at least 8 characters.")
    .refine(passwordByteLimit, "Use a password of at most 72 bytes."),
});

export const signInCredentials = z.object({
  email,
  password: z.string().min(1, "Enter your password.")
    .refine(passwordByteLimit, "Use a password of at most 72 bytes."),
});

export const confirmationQuery = z.object({
  token_hash: z.string().min(1).max(256).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.literal("email"),
});

export type AuthFormState = {
  email?: string;
  errors?: { email?: string[]; password?: string[] };
  message?: { kind: "error" | "success"; text: string };
};
