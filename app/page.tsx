import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <h1 className="text-4xl font-semibold tracking-tight">DevTrack</h1>
      <nav aria-label="Account" className="mt-6 flex flex-wrap gap-4">
        <Link href="/login" className="underline">Sign in</Link>
        <Link href="/register" className="underline">Register</Link>
      </nav>
    </main>
  );
}
