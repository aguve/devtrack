"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/src/core/auth/credentials";
import { authenticate } from "./actions";

const initialState: AuthFormState = {};

const controlClass =
  "mt-1 block w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-950";

export function AuthForm({ mode }: { mode: "register" | "login" }) {
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), initialState);
  const registering = mode === "register";
  const emailError = state.errors?.email?.[0];
  const passwordError = state.errors?.password?.[0];

  return (
    <form action={action} noValidate className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
          className={controlClass}
        />
        {emailError && <p id="email-error" className="mt-1 text-sm text-red-800">{emailError}</p>}
      </div>
      <div>
        <label htmlFor="password" className="font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={registering ? "new-password" : "current-password"}
          required
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "password-error" : undefined}
          className={controlClass}
        />
        {passwordError && (
          <p id="password-error" className="mt-1 text-sm text-red-800">{passwordError}</p>
        )}
      </div>
      {(emailError || passwordError) && (
        <p role="alert" className="sr-only">
          Check the highlighted fields.
        </p>
      )}
      {state.message && (
        <p role={state.message.kind === "error" ? "alert" : "status"} className="text-sm">
          {state.message.text}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Please wait…" : registering ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
