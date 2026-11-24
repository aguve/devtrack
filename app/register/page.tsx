import Link from "next/link";
import { AuthForm } from "../auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-3xl font-semibold">Register</h1>
      <AuthForm mode="register" />
      <p className="mt-6 text-sm">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
