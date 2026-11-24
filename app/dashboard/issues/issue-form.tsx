"use client";

import { useActionState, useId } from "react";
import {
  priorityLabels,
  statusLabels,
  type Issue,
  type IssueFields,
} from "@/src/core/issues/schema";
import { saveIssue, type IssueActionState } from "./actions";

const fieldClass = "mt-1 block w-full rounded-md border border-slate-400 bg-white px-3 py-2";
const submitClass = "rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60";

export function IssueForm({ issue }: { issue?: Issue }) {
  const formId = useId();
  const [state, action, pending] = useActionState(
    saveIssue.bind(null, issue?.id ?? null),
    {} satisfies IssueActionState,
  );
  const values = state.values ?? issue;
  const field = (name: keyof IssueFields) => ({
    name,
    id: formId + name,
    "aria-invalid": Boolean(state.errors?.[name]),
    "aria-describedby": state.errors?.[name] ? formId + name + "-error" : undefined,
    className: fieldClass,
  });
  const errorFor = (name: keyof IssueFields) => {
    const error = state.errors?.[name]?.[0];
    return error ? (
      <p id={formId + name + "-error"} className="mt-1 text-sm text-red-800">{error}</p>
    ) : null;
  };

  return (
    <form action={action} noValidate className="mt-4 space-y-4">
      <div>
        <label htmlFor={formId + "title"} className="font-medium">Title</label>
        <input {...field("title")} defaultValue={values?.title ?? ""} required />
        {errorFor("title")}
      </div>
      <div>
        <label htmlFor={formId + "description"} className="font-medium">Description</label>
        <textarea {...field("description")} defaultValue={values?.description ?? ""} rows={3} />
        {errorFor("description")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={formId + "priority"} className="font-medium">Priority</label>
          <select {...field("priority")} defaultValue={values?.priority ?? "medium"}>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errorFor("priority")}
        </div>
        <div>
          <label htmlFor={formId + "status"} className="font-medium">Status</label>
          <select {...field("status")} defaultValue={values?.status ?? "todo"}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errorFor("status")}
        </div>
      </div>
      {state.errors && <p role="alert" className="sr-only">Check the highlighted fields.</p>}
      {state.message && (
        <p
          role={state.message.kind === "error" ? "alert" : "status"}
          className={state.message.kind === "error" ? "text-sm text-red-800" : "text-sm"}
        >
          {state.message.text}
        </p>
      )}
      <button disabled={pending} className={submitClass}>
        {pending ? "Saving…" : issue ? "Save changes" : "Create issue"}
      </button>
    </form>
  );
}
