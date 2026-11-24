"use client";

import { useActionState, useRef, useState } from "react";
import { priorityLabels, statusLabels, type Issue } from "@/src/core/issues/schema";
import { removeIssue, type IssueActionState } from "./actions";
import { IssueForm } from "./issue-form";
import { MoveIssueForm } from "./move-issue-form";

const buttonClass = "rounded-md border border-slate-400 px-3 py-1.5 font-medium";

function DeleteIssueForm({ issueId, onCancel }: { issueId: string; onCancel: () => void }) {
  const [state, action, pending] = useActionState(
    () => removeIssue(issueId),
    {} satisfies IssueActionState,
  );

  return (
    <form action={action} className="mt-4 space-y-2">
      <p>Delete this issue?</p>
      {state.message?.kind === "error" && (
        <p role="alert" className="text-sm text-red-800">{state.message.text}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className="rounded-md bg-red-800 px-3 py-1.5 font-medium text-white">
          {pending ? "Deleting…" : "Confirm delete"}
        </button>
        <button type="button" disabled={pending} onClick={onCancel} className={buttonClass}>Cancel</button>
      </div>
    </form>
  );
}

export function IssueCard({
  issue,
  onMoveStart,
  onMoveFailure,
}: {
  issue: Issue;
  onMoveStart: (id: string, status: string) => void;
  onMoveFailure: (id: string) => void;
}) {
  const titleId = `issue-title-${issue.id}`;
  const deleteButton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<"edit" | "delete" | null>(null);

  return (
    <article aria-labelledby={titleId} className="rounded-lg border border-slate-300 bg-white p-4">
      <h4 id={titleId} tabIndex={-1} className="text-lg font-semibold wrap-anywhere">{issue.title}</h4>
      {issue.description && <p className="mt-2 whitespace-pre-wrap wrap-anywhere">{issue.description}</p>}
      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <div className="flex gap-1">
          <dt>Status:</dt>
          <dd>{statusLabels[issue.status]}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Priority:</dt>
          <dd>{priorityLabels[issue.priority]}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-expanded={panel === "edit"}
          onClick={() => setPanel(panel === "edit" ? null : "edit")}
          className={buttonClass}
        >
          Edit
        </button>
        <button
          ref={deleteButton}
          type="button"
          aria-expanded={panel === "delete"}
          onClick={() => setPanel(panel === "delete" ? null : "delete")}
          className={buttonClass}
        >
          Delete
        </button>
      </div>
      {panel === null && (
        <MoveIssueForm issue={issue} onMoveStart={onMoveStart} onMoveFailure={onMoveFailure} />
      )}
      {panel === "edit" && <IssueForm issue={issue} />}
      {panel === "delete" && (
        <DeleteIssueForm issueId={issue.id} onCancel={() => {
          setPanel(null);
          deleteButton.current?.focus();
        }} />
      )}
    </article>
  );
}
