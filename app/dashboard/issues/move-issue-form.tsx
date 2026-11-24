"use client";

import { useActionState, useId, useState } from "react";
import { issueStatusSchema, statusLabels, type Issue } from "@/src/core/issues/schema";
import { moveIssue, type IssueActionState } from "./actions";

export function MoveIssueForm({
  issue,
  onMoveStart,
  onMoveFailure,
}: {
  issue: Issue;
  onMoveStart: (id: string, status: string) => void;
  onMoveFailure: (id: string) => void;
}) {
  const inputId = useId();
  const [target, setTarget] = useState<string>(issue.status);
  const [state, action, pending] = useActionState(
    async (previous: IssueActionState, data: FormData) => {
      onMoveStart(issue.id, target);
      const result = await moveIssue(issue.id, previous, data);
      if (result.message?.kind === "error") onMoveFailure(issue.id);
      return result;
    },
    {} satisfies IssueActionState,
  );

  return (
    <form action={action} className="mt-4 space-y-2">
      <label htmlFor={inputId} className="block font-medium">Move issue to</label>
      <div className="flex flex-wrap gap-2">
        <select
          id={inputId}
          name="status"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          disabled={pending}
          className="min-w-0 rounded-md border border-slate-400 bg-white px-2 py-1.5"
        >
          {issueStatusSchema.options.map((status) => (
            <option key={status} value={status}>{statusLabels[status]}</option>
          ))}
        </select>
        <button
          disabled={pending || target === issue.status}
          className="rounded-md border border-slate-400 px-3 py-1.5 font-medium disabled:opacity-60"
        >
          {pending ? "Moving…" : "Move issue"}
        </button>
      </div>
      {state.message?.kind === "error" && (
        <p role="alert" className="text-sm text-red-800">{state.message.text}</p>
      )}
    </form>
  );
}
