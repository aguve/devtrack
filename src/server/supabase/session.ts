import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseClient } from "./client";

export async function requireSession(options: { readOnly?: boolean } = {}) {
  const supabase = await createSupabaseClient(options);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return { supabase, user: data.user };
}
