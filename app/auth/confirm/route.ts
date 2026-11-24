import { type NextRequest } from "next/server";
import { confirmationQuery } from "@/src/core/auth/credentials";
import { createSupabaseClient } from "@/src/server/supabase/client";

function confirmationRedirect(location: "/dashboard" | "/login?confirmation=invalid") {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = confirmationQuery.safeParse({
    token_hash: params.get("token_hash"),
    type: params.get("type"),
  });

  if (!parsed.success) {
    return confirmationRedirect("/login?confirmation=invalid");
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.verifyOtp(parsed.data);

  if (error) {
    return confirmationRedirect("/login?confirmation=invalid");
  }

  return confirmationRedirect("/dashboard");
}
