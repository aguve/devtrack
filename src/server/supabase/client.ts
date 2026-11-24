import "server-only";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const environmentSchema = z.object({
  SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
});

export function createRequestSupabaseClient(cookieMethods: CookieMethodsServer) {
  const environment = environmentSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  });

  if (!environment.success) {
    throw new Error("Supabase authentication configuration is invalid.");
  }

  return createServerClient(
    environment.data.SUPABASE_URL,
    environment.data.SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      global: {
        fetch: (input, options) => fetch(input, { ...options, cache: "no-store" }),
      },
      cookies: cookieMethods,
    },
  );
}

export async function createSupabaseClient(options: { readOnly?: boolean } = {}) {
  const store = await cookies();
  return createRequestSupabaseClient({
    getAll: () => store.getAll(),
    setAll: (changes) => {
      if (options.readOnly) return;
      for (const { name, value, options: cookieOptions } of changes) {
        store.set(name, value, cookieOptions);
      }
    },
  });
}
