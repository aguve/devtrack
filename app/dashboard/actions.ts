"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { requireSession } from "@/src/server/supabase/session";

export async function signOut() {
  const { supabase } = await requireSession();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    redirect("/dashboard?logout=failed", RedirectType.replace);
  }

  revalidatePath("/dashboard");
  redirect("/login", RedirectType.replace);
}
