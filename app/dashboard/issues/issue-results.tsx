import type { IssueQuery } from "@/src/core/issues/query";
import { listIssues } from "@/src/server/supabase/issues";
import { IssueBoard } from "./issue-board";
import { IssueLoadError } from "./issue-load-error";

export async function IssueResults({
  client,
  query,
}: {
  client: Parameters<typeof listIssues>[0];
  query: IssueQuery;
}) {
  const issues = await listIssues(client, query);

  if (issues === null) {
    return <IssueLoadError />;
  }

  return (
    <>
      {issues.length === 0 && (
        <p role="status" className="mt-4">
          {query.q || query.status || query.priority
            ? "No issues match these filters."
            : "You have no issues yet."}
        </p>
      )}
      <IssueBoard issues={issues} />
    </>
  );
}
