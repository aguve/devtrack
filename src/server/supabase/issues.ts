import "server-only";

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IssueQuery } from "@/src/core/issues/query";
import { issueRowSchema, type IssueFields } from "@/src/core/issues/schema";
import type { Database } from "./database";

type Client = SupabaseClient<Database>;

export async function listIssues(client: Client, query: IssueQuery) {
  const { data, error } = await client
    .rpc("list_own_issues", {
      search_term: query.q,
      filter_status: query.status,
      filter_priority: query.priority,
    })
    .order("updated_at", { ascending: false })
    .order("id");

  if (error) return null;

  const rows = z.array(issueRowSchema).safeParse(data);
  return rows.success ? rows.data : null;
}

export async function insertIssue(client: Client, userId: string, fields: IssueFields) {
  const { error } = await client.from("issues").insert({ ...fields, user_id: userId });
  return !error;
}

export async function updateIssue(client: Client, userId: string, id: string, fields: IssueFields) {
  const { data, error } = await client
    .from("issues")
    .update(fields)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  return !error && data !== null;
}

export async function deleteIssue(client: Client, userId: string, id: string) {
  const { data, error } = await client
    .from("issues")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  return !error && data !== null;
}
