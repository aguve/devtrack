"use client";

import { useLayoutEffect, useRef } from "react";
import { groupIssuesByStatus } from "@/src/core/issues/group";
import { issueStatusSchema, statusLabels, type Issue } from "@/src/core/issues/schema";
import { IssueCard } from "./issue-card";

export function IssueBoard({ issues }: { issues: readonly Issue[] }) {
  const groups = groupIssuesByStatus(issues);
  const move = useRef<{ id: string; status: string } | null>(null);

  useLayoutEffect(() => {
    if (!move.current) return;
    const { id, status } = move.current;
    const issue = issues.find((item) => item.id === id);
    if (issue && issue.status !== status) return;

    move.current = null;
    const target = document.getElementById(`issue-title-${id}`) ?? document.getElementById("issues");
    target?.focus();
  }, [issues]);

  function startMove(id: string, status: string) {
    move.current = { id, status };
  }

  function failMove(id: string) {
    if (move.current?.id === id) move.current = null;
  }

  return (
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
      {issueStatusSchema.options.map((status) => (
        <section
          key={status}
          aria-labelledby={`column-${status}`}
          className="min-w-0 rounded-lg border border-slate-300 bg-slate-100 p-3"
        >
          <h3 id={`column-${status}`} className="text-lg font-semibold">
            {statusLabels[status]}
          </h3>
          <div className="mt-3 space-y-3">
            {groups[status].map((issue) => (
              <IssueCard key={issue.id} issue={issue} onMoveStart={startMove} onMoveFailure={failMove} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
