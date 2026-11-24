import Link from "next/link";
import { AuthForm } from "../auth/auth-form";

type LoginPageProps = {
  searchParams: Promise<{ confirmation?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { confirmation } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      {confirmation === "invalid" && (
        <p role="alert" className="mt-4 text-red-800">
          This confirmation link is invalid or has expired.
        </p>
      )}
      <AuthForm mode="login" />
      <p className="mt-6 text-sm">
        New to DevTrack? <Link href="/register" className="underline">Register</Link>
      </p>
    </main>
  );
}
