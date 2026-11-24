import { requireSession } from "@/src/server/supabase/session";
import { signOut } from "./actions";

type DashboardPageProps = {
  searchParams: Promise<{ logout?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await requireSession({ readOnly: true });
  const { logout } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <form action={signOut}>
          <button className="rounded-md border border-slate-500 px-4 py-2 font-medium">
            Sign out
          </button>
        </form>
      </div>
      {logout === "failed" && (
        <p role="alert" className="mt-4 text-red-800">Could not sign out. Try again.</p>
      )}
    </main>
  );
}
