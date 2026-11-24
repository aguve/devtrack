import { Suspense } from "react";
import { requireSession } from "@/src/server/supabase/session";
import { issueQuerySchema } from "@/src/core/issues/query";
import { signOut } from "./actions";
import { IssueBoardLoading } from "./issues/issue-board-loading";
import { IssueFilters } from "./issues/issue-filters";
import { IssueForm } from "./issues/issue-form";
import { IssueResults } from "./issues/issue-results";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { supabase } = await requireSession({ readOnly: true });
  const params = await searchParams;
  const query = issueQuerySchema.safeParse(params);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <form action={signOut}>
          <button className="rounded-md border border-slate-500 px-4 py-2 font-medium">
            Sign out
          </button>
        </form>
      </div>
      {params.logout === "failed" && (
        <p role="alert" className="mt-4 text-red-800">Could not sign out. Try again.</p>
      )}
      <section aria-labelledby="create-issue" className="mt-8 max-w-xl">
        <h2 id="create-issue" className="text-xl font-semibold">Create issue</h2>
        <IssueForm />
      </section>
      <section aria-labelledby="issues" className="mt-8">
        <h2 id="issues" tabIndex={-1} className="text-xl font-semibold">Your issues</h2>
        <IssueFilters query={query.data} />
        {!query.success ? (
          <p role="alert" className="mt-4 text-red-800">Check the search and filter values, then try again.</p>
        ) : (
          <Suspense fallback={<IssueBoardLoading />}>
            <IssueResults client={supabase} query={query.data} />
          </Suspense>
        )}
      </section>
    </main>
  );
}
