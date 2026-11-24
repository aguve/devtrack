"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  registrationCredentials,
  signInCredentials,
  type AuthFormState,
} from "@/src/core/auth/credentials";
import { createSupabaseClient } from "@/src/server/supabase/client";

export async function authenticate(
  mode: "register" | "login",
  _state: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const emailInput = data.get("email");
  const email = typeof emailInput === "string" ? emailInput.trim() : "";
  const submittedEmail = email.slice(0, 254);
  const password = data.get("password");
  const credentials = mode === "register" ? registrationCredentials : signInCredentials;
  const parsed = credentials.safeParse({
    email,
    password: typeof password === "string" ? password : "",
  });

  if (!parsed.success) {
    return { email: submittedEmail, errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseClient();

  if (mode === "register") {
    const { data: result, error } = await supabase.auth.signUp(parsed.data);
    if (error) {
      return {
        email: submittedEmail,
        message: { kind: "error", text: "Could not create an account. Try again later." },
      };
    }

    if (!result.session) {
      return { message: { kind: "success", text: "Check your email for a confirmation link." } };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return {
        email: submittedEmail,
        message: { kind: "error", text: "Email or password is incorrect." },
      };
    }
  }

  redirect("/dashboard");
}
