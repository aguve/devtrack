import type { Issue, IssueFields } from "./schema";

export function groupIssuesByStatus(issues: readonly Issue[]) {
  const groups: Record<IssueFields["status"], Issue[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const issue of issues) {
    groups[issue.status].push(issue);
  }

  return groups;
}
