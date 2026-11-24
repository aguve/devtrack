"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { issueFieldsSchema, issueIdSchema, type IssueFields } from "@/src/core/issues/schema";
import { deleteIssue, insertIssue, updateIssue } from "@/src/server/supabase/issues";
import { requireSession } from "@/src/server/supabase/session";

export type IssueActionState = {
  message?: { kind: "error" | "success"; text: string };
  errors?: Partial<Record<keyof IssueFields, string[]>>;
  values?: Record<keyof IssueFields, string>;
};

function readText(data: FormData, key: keyof IssueFields) {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export async function saveIssue(
  id: string | null,
  _state: IssueActionState,
  data: FormData,
): Promise<IssueActionState> {
  const { supabase, user } = await requireSession();
  const title = readText(data, "title");
  const description = readText(data, "description");
  const priority = readText(data, "priority");
  const status = readText(data, "status");
  const values = {
    title: title.slice(0, 241),
    description: description.slice(0, 8001),
    priority: priority.slice(0, 16),
    status: status.slice(0, 16),
  };
  const parsed = issueFieldsSchema.safeParse({ title, description, priority, status });

  if (!parsed.success) {
    return { values, errors: z.flattenError(parsed.error).fieldErrors };
  }

  if (id === null) {
    if (!await insertIssue(supabase, user.id, parsed.data)) {
      return { values, message: { kind: "error", text: "Could not create this issue. Try again." } };
    }

    revalidatePath("/dashboard");
    return { message: { kind: "success", text: "Issue created." } };
  }

  const parsedId = issueIdSchema.safeParse(id);
  if (!parsedId.success || !await updateIssue(supabase, user.id, parsedId.data, parsed.data)) {
    return {
      values,
      message: { kind: "error", text: "Could not update this issue. It may have been deleted." },
    };
  }

  revalidatePath("/dashboard");
  return { values, message: { kind: "success", text: "Issue updated." } };
}

export async function removeIssue(id: string): Promise<IssueActionState> {
  const { supabase, user } = await requireSession();
  const parsedId = issueIdSchema.safeParse(id);
  if (!parsedId.success || !await deleteIssue(supabase, user.id, parsedId.data)) {
    return {
      message: { kind: "error", text: "Could not delete this issue. It may have already been deleted." },
    };
  }

  revalidatePath("/dashboard");
  return {};
}
